import { useRef } from 'react';
import { Star, MessageSquare } from 'lucide-react';

/**
 * Una celda del calendario.
 * - Tap: aplica el estado actual de la barra (custodia/festivo/no_lectivo)
 * - Pulsación larga (o clic derecho en escritorio): abre el modal de comentario
 */
export function DayCell({ day, data, onTap, onLongPress }) {
  const timerRef = useRef(null);
  const triggeredLong = useRef(false);

  const custodia = data?.custodia;
  const festivo = data?.festivo;
  const noLectivo = data?.no_lectivo;
  const hasComment = !!data?.comentario;

  // Clases de fondo según custodia
  let bgClass = 'bg-white hover:bg-stone-50';
  let ringClass = 'border-stone-100';
  if (custodia === 'padre') {
    bgClass = 'bg-padre-bg hover:bg-padre-bgHover';
    ringClass = 'border-padre-border/50';
  } else if (custodia === 'madre') {
    bgClass = 'bg-madre-bg hover:bg-madre-bgHover';
    ringClass = 'border-madre-border/50';
  }

  const dayNumberClass = festivo ? 'text-festivo font-extrabold' : 'text-stone-900 font-semibold';

  const handlePointerDown = (e) => {
    triggeredLong.current = false;
    timerRef.current = setTimeout(() => {
      triggeredLong.current = true;
      onLongPress?.();
    }, 450);
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!triggeredLong.current) {
      onTap?.();
    }
  };

  const handlePointerCancel = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    triggeredLong.current = true;
    onLongPress?.();
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerCancel}
      onPointerCancel={handlePointerCancel}
      onContextMenu={handleContextMenu}
      className={`
        no-select relative aspect-square rounded-lg border transition
        flex flex-col items-center justify-center
        ${bgClass} ${ringClass}
        ${!day.inMonth ? 'opacity-30' : ''}
        ${day.isToday ? 'ring-2 ring-stone-900 ring-offset-1' : ''}
        active:scale-[0.97]
      `}
      aria-label={`Día ${day.day}`}
    >
      <span className={`text-sm md:text-base ${dayNumberClass}`}>{day.day}</span>

      {/* Icono no lectivo en esquina superior derecha */}
      {noLectivo && (
        <Star className="absolute top-1 right-1 w-3 h-3 text-amber-600 fill-amber-400" />
      )}

      {/* Indicador de comentario en esquina inferior derecha */}
      {hasComment && (
        <MessageSquare className="absolute bottom-1 right-1 w-3 h-3 text-stone-700" />
      )}
    </button>
  );
}
