import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import { cn } from '../utils/cn';

export default function Modal({ open, title, children, onClose, footer, className }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
        className={cn('w-full max-w-2xl rounded-lg border border-white/10 bg-panel shadow-panel', className)}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="font-display text-xl font-bold text-white">{title}</h2>
          <Button variant="ghost" size="sm" icon={X} onClick={onClose} aria-label="Close modal" />
        </div>
        <div className="p-5">{children}</div>
        {footer ? <div className="border-t border-white/10 p-5">{footer}</div> : null}
      </div>
    </div>
  );
}
