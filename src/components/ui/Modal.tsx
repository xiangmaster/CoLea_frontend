import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, footer, width = 480 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl shadow-brand-900/20 ring-1 ring-slate-100 slide-in overflow-hidden"
        style={{ width, maxWidth: '94vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/60">{footer}</div>}
      </div>
    </div>
  );
}
