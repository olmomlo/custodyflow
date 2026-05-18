import { X, BarChart3, Clock } from 'lucide-react';
import { dateUtils } from '../lib/dateUtils';

/**
 * Calcula las estadísticas del año en curso a partir del objeto `dias`.
 */
function calcularEstadisticas(dias, year) {
  let padre = 0,
    madre = 0,
    festivos = 0,
    noLectivos = 0,
    asignados = 0;

  for (const key in dias) {
    if (!key.startsWith(String(year))) continue;
    const d = dias[key];
    if (d.custodia === 'padre') {
      padre++;
      asignados++;
    } else if (d.custodia === 'madre') {
      madre++;
      asignados++;
    }
    if (d.festivo) festivos++;
    if (d.no_lectivo) noLectivos++;
  }

  return { padre, madre, festivos, noLectivos, asignados };
}

function pct(parte, total) {
  if (!total) return '0';
  return ((parte / total) * 100).toFixed(1).replace(/\.0$/, '');
}

const CAMPO_LABEL = {
  custodia: 'Custodia',
  festivo: 'Festivo',
  no_lectivo: 'No lectivo',
  comentario: 'Comentario',
  estado: 'Estado',
};

function formatValor(campo, valor) {
  if (valor === null || valor === undefined || valor === '') return '—';
  if (campo === 'comentario') {
    const t = String(valor);
    return t.length > 40 ? t.slice(0, 40) + '…' : t;
  }
  return valor;
}

function formatFechaCambio(iso) {
  const d = new Date(iso);
  return dateUtils.formatRelative(d);
}

function formatFechaDia(fechaStr) {
  const [y, m, d] = fechaStr.split('-');
  return `${d}/${m}/${y}`;
}

export function Dashboard({ open, onClose, dias, historial, year }) {
  if (!open) return null;

  const stats = calcularEstadisticas(dias, year);

  // Filtra el historial de los últimos 2 meses
  const ahora = new Date();
  const hace2Meses = new Date(ahora.getTime() - 1000 * 60 * 60 * 24 * 62);
  const cambiosRecientes = historial.filter((h) => new Date(h.created_at) >= hace2Meses);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-stone-900/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-2xl md:rounded-2xl shadow-modal w-full md:max-w-2xl max-h-[85vh] flex flex-col animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-stone-700" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Cuadro de mando
              </p>
              <h2 className="text-lg font-bold text-stone-900">Año {year}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 text-stone-500"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scroll */}
        <div className="overflow-y-auto scroll-area px-5 py-4 space-y-6">
          {/* Estadísticas custodia */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Reparto de custodia
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Padre"
                value={stats.padre}
                pct={pct(stats.padre, stats.asignados)}
                bgClass="bg-padre-bg"
                textClass="text-padre-deep"
                accentClass="bg-padre-accent"
              />
              <StatCard
                label="Madre"
                value={stats.madre}
                pct={pct(stats.madre, stats.asignados)}
                bgClass="bg-madre-bg"
                textClass="text-madre-deep"
                accentClass="bg-madre-accent"
              />
            </div>

            {/* Barra de proporción */}
            <div className="mt-3 h-2.5 rounded-full overflow-hidden bg-stone-100 flex">
              <div
                className="bg-padre-accent transition-all"
                style={{ width: `${pct(stats.padre, stats.asignados)}%` }}
              />
              <div
                className="bg-madre-accent transition-all"
                style={{ width: `${pct(stats.madre, stats.asignados)}%` }}
              />
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              Total asignados: <strong>{stats.asignados}</strong> días
            </p>
          </section>

          {/* Otros contadores */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Otros
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Festivos" value={stats.festivos} colorClass="text-festivo" />
              <MiniStat label="No lectivos" value={stats.noLectivos} colorClass="text-amber-700" />
            </div>
          </section>

          {/* Historial */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Últimos cambios (2 meses)
              </h3>
            </div>
            {cambiosRecientes.length === 0 ? (
              <p className="text-sm text-stone-500 py-4 text-center">No hay cambios recientes.</p>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto scroll-area pr-1">
                {cambiosRecientes.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-stone-50 border border-stone-100"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          c.autor === 'padre' ? 'bg-padre-accent' : 'bg-madre-accent'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-stone-800 truncate">
                          <strong>{formatFechaDia(c.fecha)}</strong> · {CAMPO_LABEL[c.campo]}:{' '}
                          <span className="text-stone-500">{formatValor(c.campo, c.valor_anterior)}</span>{' '}
                          → <span>{formatValor(c.campo, c.valor_nuevo)}</span>
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5 capitalize">
                          {c.autor} · {formatFechaCambio(c.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, pct, bgClass, textClass, accentClass }) {
  return (
    <div className={`p-4 rounded-xl ${bgClass}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${accentClass}`} />
        <span className={`text-sm font-semibold ${textClass}`}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-3xl font-extrabold tracking-tight ${textClass}`}>{value}</span>
        <span className={`text-sm font-medium ${textClass} opacity-70`}>días</span>
      </div>
      <p className={`text-xs ${textClass} opacity-70 mt-0.5`}>{pct}% del total</p>
    </div>
  );
}

function MiniStat({ label, value, colorClass }) {
  return (
    <div className="p-3 rounded-xl border border-stone-200 bg-white">
      <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">{label}</p>
      <p className={`text-2xl font-bold mt-0.5 ${colorClass}`}>{value}</p>
    </div>
  );
}
