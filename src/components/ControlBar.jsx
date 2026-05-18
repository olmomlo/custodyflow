import { Star, Sparkles } from 'lucide-react';

/**
 * Barra de selección que define el "pincel" que se aplicará al pulsar un día.
 * - Selector de progenitor: Ninguno / Padre / Madre
 * - Toggle Festivo
 * - Toggle No lectivo
 */
export function ControlBar({
  selectedParent,
  setSelectedParent,
  festivoOn,
  setFestivoOn,
  noLectivoOn,
  setNoLectivoOn,
}) {
  return (
    <div className="bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-[0_-2px_12px_-4px_rgba(0,0,0,0.04)] safe-bottom">
      <div className="max-w-4xl mx-auto px-3 py-3 flex flex-col gap-2.5">
        {/* Selector de progenitor */}
        <div className="bg-stone-100 rounded-xl p-1 flex gap-1">
          <ParentOption
            label="Ninguno"
            active={selectedParent === null}
            onClick={() => setSelectedParent(null)}
            dotColor="bg-stone-300"
          />
          <ParentOption
            label="Padre"
            active={selectedParent === 'padre'}
            onClick={() => setSelectedParent('padre')}
            dotColor="bg-padre-accent"
            activeClass="bg-padre-bg text-padre-deep"
          />
          <ParentOption
            label="Madre"
            active={selectedParent === 'madre'}
            onClick={() => setSelectedParent('madre')}
            dotColor="bg-madre-accent"
            activeClass="bg-madre-bg text-madre-deep"
          />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-2">
          <ToggleButton
            active={festivoOn}
            onClick={() => setFestivoOn(!festivoOn)}
            icon={<Sparkles className="w-4 h-4" />}
            label="Festivo"
            activeClass="bg-red-50 text-red-700 border-red-200"
          />
          <ToggleButton
            active={noLectivoOn}
            onClick={() => setNoLectivoOn(!noLectivoOn)}
            icon={<Star className="w-4 h-4" />}
            label="No lectivo"
            activeClass="bg-amber-50 text-amber-800 border-amber-200"
          />
        </div>
      </div>
    </div>
  );
}

function ParentOption({ label, active, onClick, dotColor, activeClass = 'bg-white text-stone-900 shadow-soft' }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
        active ? activeClass : 'text-stone-500 hover:text-stone-700'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      {label}
    </button>
  );
}

function ToggleButton({ active, onClick, icon, label, activeClass }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition ${
        active
          ? activeClass
          : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
