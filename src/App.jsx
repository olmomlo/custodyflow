import { useState } from 'react';
import { BarChart3, FileDown, AlertCircle } from 'lucide-react';
import { Calendar } from './components/Calendar';
import { ControlBar } from './components/ControlBar';
import { Dashboard } from './components/Dashboard';
import { CommentModal } from './components/CommentModal';
import { Legend } from './components/Legend';
import { UserSelectorModal, UserChip, useUsuario } from './components/UserSelector';
import { useCalendar } from './hooks/useCalendar';
import { isSupabaseConfigured } from './lib/supabase';

export default function App() {
  const { usuario, guardar } = useUsuario();
  const { dias, historial, loading, error, aplicarEstado, actualizarComentario } = useCalendar();

  const [cursor, setCursor] = useState(new Date());
  const [selectedParent, setSelectedParent] = useState(null);
  const [festivoOn, setFestivoOn] = useState(false);
  const [noLectivoOn, setNoLectivoOn] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [commentDay, setCommentDay] = useState(null);

  const onTapDay = (day) => {
    if (!usuario) return;
    aplicarEstado(
      day.key,
      {
        custodia: selectedParent,
        festivo: festivoOn,
        no_lectivo: noLectivoOn,
      },
      usuario
    );
  };

  const onLongPressDay = (day) => {
    setCommentDay(day);
  };

  const onSaveComment = (texto) => {
    if (!usuario || !commentDay) return;
    actualizarComentario(commentDay.key, texto, usuario);
  };

  const onExportPDF = async () => {
    const { exportarPDFAnual } = await import('./lib/pdfExport');
    exportarPDFAnual(cursor.getFullYear(), dias);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Modal de selección de usuario inicial */}
      <UserSelectorModal open={!usuario} onSelect={guardar} />

      {/* HEADER */}
      <header className="bg-white border-b border-stone-200 safe-top sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base md:text-lg font-bold text-stone-900 tracking-tight truncate">
              Custodia Compartida
            </h1>
            <p className="text-[11px] text-stone-500 hidden md:block">
              Calendario para ambos progenitores
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold transition"
              title={`Exportar PDF de ${cursor.getFullYear()}`}
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={() => setDashboardOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold transition"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Resumen</span>
            </button>
            {usuario && <UserChip usuario={usuario} onChange={guardar} />}
          </div>
        </div>
      </header>

      {/* Aviso de configuración / errores */}
      {!isSupabaseConfigured && (
        <div className="max-w-4xl w-full mx-auto px-4 pt-3">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-3 flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <strong>Supabase sin configurar.</strong> Copia <code>.env.example</code> a{' '}
              <code>.env</code> y añade tu URL y anon key. Mientras tanto los cambios no se
              guardarán.
            </div>
          </div>
        </div>
      )}
      {error && isSupabaseConfigured && (
        <div className="max-w-4xl w-full mx-auto px-4 pt-3">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-2 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* CONTENIDO */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 md:px-4 py-4 pb-44 md:pb-32">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-stone-400 text-sm">
            Cargando calendario…
          </div>
        ) : (
          <>
            <Calendar
              cursor={cursor}
              setCursor={setCursor}
              dias={dias}
              onTapDay={onTapDay}
              onLongPressDay={onLongPressDay}
            />

            {/* Leyenda */}
            <div className="mt-4 px-2 flex items-center justify-center">
              <Legend />
            </div>

            <div className="mt-3 text-center text-[11px] text-stone-400 px-4">
              Mantén pulsado un día para añadir un comentario · El año del PDF es el que estés
              viendo
            </div>
          </>
        )}
      </main>

      {/* BARRA DE CONTROL (sticky abajo) */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <ControlBar
          selectedParent={selectedParent}
          setSelectedParent={setSelectedParent}
          festivoOn={festivoOn}
          setFestivoOn={setFestivoOn}
          noLectivoOn={noLectivoOn}
          setNoLectivoOn={setNoLectivoOn}
        />
      </div>

      {/* MODALES */}
      <Dashboard
        open={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        dias={dias}
        historial={historial}
        year={cursor.getFullYear()}
      />
      <CommentModal
        open={!!commentDay}
        day={commentDay}
        data={commentDay ? dias[commentDay.key] : null}
        onClose={() => setCommentDay(null)}
        onSave={onSaveComment}
      />
    </div>
  );
}
