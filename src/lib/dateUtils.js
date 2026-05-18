import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  startOfYear,
  endOfYear,
  getDay,
} from 'date-fns';
import { es } from 'date-fns/locale';

// La semana en España empieza en lunes
const WEEK_OPTS = { weekStartsOn: 1, locale: es };

export const dateUtils = {
  /** Formato YYYY-MM-DD para guardar en BD */
  toKey(date) {
    return format(date, 'yyyy-MM-dd');
  },

  fromKey(key) {
    return parseISO(key);
  },

  /** Lista de días para mostrar en la rejilla mensual (incluye relleno del mes anterior/siguiente) */
  getCalendarDays(date) {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const gridStart = startOfWeek(monthStart, WEEK_OPTS);
    const gridEnd = endOfWeek(monthEnd, WEEK_OPTS);

    return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((d) => ({
      date: d,
      key: format(d, 'yyyy-MM-dd'),
      day: d.getDate(),
      inMonth: isSameMonth(d, date),
      isToday: isToday(d),
      weekday: getDay(d),
    }));
  },

  /** Nombre del mes con año, ej. "Mayo 2026" */
  formatMonthYear(date) {
    const txt = format(date, 'MMMM yyyy', { locale: es });
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  },

  formatDayLong(date) {
    const txt = format(date, "EEEE d 'de' MMMM yyyy", { locale: es });
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  },

  formatRelative(date) {
    return format(date, "d MMM HH:mm", { locale: es });
  },

  weekdayShort(date) {
    const txt = format(date, 'EEE', { locale: es });
    return txt.charAt(0).toUpperCase() + txt.slice(1, 3);
  },

  /** Etiquetas L M X J V S D */
  weekdayLabels() {
    return ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  },

  addMonth(date, n) {
    return n >= 0 ? addMonths(date, n) : subMonths(date, -n);
  },

  startOfYear,
  endOfYear,
  eachDayOfInterval,
  isSameMonth,
};
