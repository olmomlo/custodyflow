import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { DayCell } from './DayCell';
import { dateUtils } from '../lib/dateUtils';

export function Calendar({
  cursor,
  setCursor,
  dias,
  onTapDay,
  onLongPressDay,
}) {
  const days = dateUtils.getCalendarDays(cursor);
  const weekdays = dateUtils.weekdayLabels();

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-soft p-3 md:p-4">
      {/* Cabecera del mes */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h2 className="text-lg md:text-xl font-bold text-stone-900 tracking-tight">
          {dateUtils.formatMonthYear(cursor)}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(dateUtils.addMonth(cursor, -1))}
            className="p-2 rounded-lg hover:bg-stone-100 transition text-stone-700"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCursor(new Date())}
            className="p-2 rounded-lg hover:bg-stone-100 transition text-stone-700"
            aria-label="Hoy"
            title="Hoy"
          >
            <CalendarDays className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCursor(dateUtils.addMonth(cursor, 1))}
            className="p-2 rounded-lg hover:bg-stone-100 transition text-stone-700"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Selector rápido de año */}
      <div className="flex items-center justify-end gap-2 mb-3 text-xs text-stone-500">
        <button
          onClick={() => setCursor(dateUtils.addMonth(cursor, -12))}
          className="hover:text-stone-800 transition px-1"
          aria-label="Año anterior"
        >
          « {cursor.getFullYear() - 1}
        </button>
        <span className="text-stone-300">·</span>
        <button
          onClick={() => setCursor(dateUtils.addMonth(cursor, 12))}
          className="hover:text-stone-800 transition px-1"
          aria-label="Año siguiente"
        >
          {cursor.getFullYear() + 1} »
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 md:gap-1.5 mb-1.5">
        {weekdays.map((wd, i) => (
          <div
            key={i}
            className={`text-center text-[11px] font-semibold uppercase tracking-wider py-1 ${
              i >= 5 ? 'text-stone-400' : 'text-stone-500'
            }`}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Rejilla de días */}
      <div className="grid grid-cols-7 gap-1 md:gap-1.5">
        {days.map((d) => (
          <DayCell
            key={d.key}
            day={d}
            data={dias[d.key]}
            onTap={() => onTapDay(d)}
            onLongPress={() => onLongPressDay(d)}
          />
        ))}
      </div>
    </div>
  );
}
