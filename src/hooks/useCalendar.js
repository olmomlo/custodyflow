import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Hook principal que carga los días desde Supabase, mantiene un caché local,
 * se suscribe a cambios en tiempo real y expone funciones para modificar días
 * y comentarios. Cualquier cambio se registra en la tabla "historial".
 */
export function useCalendar() {
  const [dias, setDias] = useState({}); // { 'YYYY-MM-DD': { custodia, festivo, no_lectivo, comentario } }
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------- Carga inicial ----------
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError('Configura Supabase en .env para sincronizar');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const [diasRes, histRes] = await Promise.all([
          supabase.from('dias').select('*'),
          supabase
            .from('historial')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500),
        ]);

        if (cancelled) return;
        if (diasRes.error) throw diasRes.error;
        if (histRes.error) throw histRes.error;

        const map = {};
        for (const d of diasRes.data || []) {
          map[d.fecha] = d;
        }
        setDias(map);
        setHistorial(histRes.data || []);
        setError(null);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(err.message || 'Error al cargar datos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    // ---------- Realtime ----------
    const channel = supabase
      .channel('custodia-cambios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dias' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setDias((prev) => {
            const next = { ...prev };
            delete next[payload.old.fecha];
            return next;
          });
        } else {
          const row = payload.new;
          setDias((prev) => ({ ...prev, [row.fecha]: row }));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'historial' }, (payload) => {
        setHistorial((prev) => [payload.new, ...prev].slice(0, 500));
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  // ---------- Helpers ----------
  /** Devuelve una descripción legible del estado de un día (custodia + flags). */
  const formatEstado = (d) => {
    if (!d) return '—';
    const parts = [];
    if (d.custodia === 'padre') parts.push('Padre');
    else if (d.custodia === 'madre') parts.push('Madre');
    if (d.festivo) parts.push('Festivo');
    if (d.no_lectivo) parts.push('No lectivo');
    return parts.length ? parts.join(' · ') : '—';
  };

  /**
   * Registra UN único cambio en el historial que resume el nuevo estado del día
   * (custodia, festivo, no lectivo). Si el estado no ha cambiado, no inserta nada.
   */
  const logCambioEstado = useCallback(async (fecha, anterior, nuevo, autor) => {
    const anteriorTxt = formatEstado(anterior);
    const nuevoTxt = formatEstado(nuevo);
    if (anteriorTxt === nuevoTxt) return;

    await supabase.from('historial').insert({
      fecha,
      campo: 'estado',
      valor_anterior: anteriorTxt,
      valor_nuevo: nuevoTxt,
      autor,
    });
  }, []);

  /**
   * Registra un cambio en el comentario del día (se usa al guardar el modal de comentario).
   */
  const logCambioComentario = useCallback(async (fecha, anterior, nuevo, autor) => {
    const prev = anterior?.comentario || null;
    const next = nuevo?.comentario || null;
    if (prev === next) return;

    await supabase.from('historial').insert({
      fecha,
      campo: 'comentario',
      valor_anterior: prev,
      valor_nuevo: next,
      autor,
    });
  }, []);

  /**
   * Aplica el estado de la barra (parent, festivo, no_lectivo) a un día.
   * Mantiene el comentario existente.
   */
  const aplicarEstado = useCallback(
    async (fechaKey, { custodia, festivo, no_lectivo }, autor) => {
      const anterior = dias[fechaKey] || null;
      const nuevo = {
        fecha: fechaKey,
        custodia: custodia ?? null,
        festivo: !!festivo,
        no_lectivo: !!no_lectivo,
        comentario: anterior?.comentario ?? null,
        updated_at: new Date().toISOString(),
        updated_by: autor,
      };

      // Si no hay nada que guardar y el día existía, lo borramos
      const isEmpty = !nuevo.custodia && !nuevo.festivo && !nuevo.no_lectivo && !nuevo.comentario;

      // Optimistic update
      setDias((prev) => {
        const next = { ...prev };
        if (isEmpty) delete next[fechaKey];
        else next[fechaKey] = nuevo;
        return next;
      });

      try {
        if (isEmpty && anterior) {
          await supabase.from('dias').delete().eq('fecha', fechaKey);
        } else if (!isEmpty) {
          const { error } = await supabase.from('dias').upsert(nuevo, { onConflict: 'fecha' });
          if (error) throw error;
        }
        await logCambioEstado(fechaKey, anterior, nuevo, autor);
      } catch (err) {
        console.error(err);
        // Revertimos en caso de error
        setDias((prev) => {
          const next = { ...prev };
          if (anterior) next[fechaKey] = anterior;
          else delete next[fechaKey];
          return next;
        });
        setError('Error al guardar. Revisa la conexión.');
      }
    },
    [dias, logCambioEstado]
  );

  /**
   * Actualiza solo el comentario de un día. Lo borra si llega vacío y el día
   * no tiene ningún otro estado.
   */
  const actualizarComentario = useCallback(
    async (fechaKey, comentario, autor) => {
      const anterior = dias[fechaKey] || null;
      const comentarioNorm = comentario?.trim() || null;
      const nuevo = {
        fecha: fechaKey,
        custodia: anterior?.custodia ?? null,
        festivo: anterior?.festivo ?? false,
        no_lectivo: anterior?.no_lectivo ?? false,
        comentario: comentarioNorm,
        updated_at: new Date().toISOString(),
        updated_by: autor,
      };

      const isEmpty = !nuevo.custodia && !nuevo.festivo && !nuevo.no_lectivo && !nuevo.comentario;

      setDias((prev) => {
        const next = { ...prev };
        if (isEmpty) delete next[fechaKey];
        else next[fechaKey] = nuevo;
        return next;
      });

      try {
        if (isEmpty && anterior) {
          await supabase.from('dias').delete().eq('fecha', fechaKey);
        } else if (!isEmpty) {
          const { error } = await supabase.from('dias').upsert(nuevo, { onConflict: 'fecha' });
          if (error) throw error;
        }
        await logCambioComentario(fechaKey, anterior, nuevo, autor);
      } catch (err) {
        console.error(err);
        setDias((prev) => {
          const next = { ...prev };
          if (anterior) next[fechaKey] = anterior;
          else delete next[fechaKey];
          return next;
        });
        setError('Error al guardar el comentario.');
      }
    },
    [dias, logCambioComentario]
  );

  return {
    dias,
    historial,
    loading,
    error,
    aplicarEstado,
    actualizarComentario,
  };
}
