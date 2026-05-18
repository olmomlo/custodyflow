import { useEffect, useState } from 'react';
import { X, Trash2, Save } from 'lucide-react';
import { dateUtils } from '../lib/dateUtils';

export function CommentModal({ open, day, data, onClose, onSave }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (open) {
      setText(data?.comentario || '');
    }
  }, [open, data]);

  if (!open || !day) return null;

  const handleSave = () => {
    onSave(text);
    onClose();
  };

  const handleDelete = () => {
    onSave('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-stone-900/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-2xl md:rounded-2xl shadow-modal w-full md:max-w-md p-5 animate-slide-up"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Comentario
            </p>
            <h3 className="text-lg font-bold text-stone-900">
              {dateUtils.formatDayLong(day.date)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe una nota para este día..."
          rows={5}
          className="w-full p-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-200 outline-none transition text-sm text-stone-800 resize-none"
          autoFocus
        />

        <div className="flex gap-2 mt-4">
          {data?.comentario && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition font-semibold text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          )}
          <button
            onClick={handleSave}
            className="ml-auto flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition font-semibold text-sm"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
