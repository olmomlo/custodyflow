import { Star, Sparkles, MessageSquare } from 'lucide-react';

export function Legend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-600 items-center">
      <LegendItem swatchClass="bg-padre-bg border-padre-border" label="Padre" />
      <LegendItem swatchClass="bg-madre-bg border-madre-border" label="Madre" />
      <LegendItem
        icon={<Sparkles className="w-3 h-3 text-festivo" />}
        label={<span className="text-festivo font-bold">Festivo</span>}
      />
      <LegendItem icon={<Star className="w-3 h-3 text-amber-600 fill-amber-400" />} label="No lectivo" />
      <LegendItem icon={<MessageSquare className="w-3 h-3 text-stone-500" />} label="Con comentario" />
    </div>
  );
}

function LegendItem({ swatchClass, icon, label }) {
  return (
    <div className="flex items-center gap-1.5">
      {swatchClass && <span className={`w-3.5 h-3.5 rounded border ${swatchClass}`} />}
      {icon}
      <span>{label}</span>
    </div>
  );
}
