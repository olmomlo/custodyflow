import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

const STORAGE_KEY = 'custodia.usuario';

export function useUsuario() {
  const [usuario, setUsuario] = useState(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  const guardar = (u) => {
    localStorage.setItem(STORAGE_KEY, u);
    setUsuario(u);
  };

  return { usuario, guardar };
}

/**
 * Modal que se muestra al abrir la app por primera vez para que el usuario
 * indique si es el padre o la madre. Esto se usa para registrar quién hizo
 * cada cambio en el historial.
 */
export function UserSelectorModal({ open, onSelect }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-modal max-w-sm w-full p-6 animate-slide-up">
        <h2 className="text-xl font-bold text-stone-900 mb-1">¿Quién eres?</h2>
        <p className="text-sm text-stone-500 mb-5">
          Esto se usa para registrar quién hace cada cambio. Puedes cambiarlo después.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => onSelect('padre')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-padre-bg hover:bg-padre-bgHover transition border border-padre-border/60"
          >
            <span className="font-semibold text-padre-deep">Padre</span>
            <span className="w-5 h-5 rounded-full bg-padre-accent" />
          </button>
          <button
            onClick={() => onSelect('madre')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-madre-bg hover:bg-madre-bgHover transition border border-madre-border/60"
          >
            <span className="font-semibold text-madre-deep">Madre</span>
            <span className="w-5 h-5 rounded-full bg-madre-accent" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Botón compacto en el header que muestra quién está usando la app y
 * permite cambiarlo.
 */
export function UserChip({ usuario, onChange }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    if (open) {
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }
  }, [open]);

  const colorClasses =
    usuario === 'padre'
      ? 'bg-padre-bg text-padre-deep border-padre-border'
      : 'bg-madre-bg text-madre-deep border-madre-border';

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold transition ${colorClasses}`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            usuario === 'padre' ? 'bg-padre-accent' : 'bg-madre-accent'
          }`}
        />
        <span className="capitalize">{usuario}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-card border border-stone-200 py-1 min-w-[140px] z-30 animate-slide-up">
          {['padre', 'madre'].map((u) => (
            <button
              key={u}
              onClick={() => {
                onChange(u);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-stone-50 transition text-sm"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  u === 'padre' ? 'bg-padre-accent' : 'bg-madre-accent'
                }`}
              />
              <span className="flex-1 text-left capitalize text-stone-700">{u}</span>
              {usuario === u && <Check className="w-3.5 h-3.5 text-stone-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
