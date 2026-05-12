import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';
import { cn } from '../utils/cn';

const MotionDiv = motion.div;

export default function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  className,
  bodyClassName,
  footerClassName,
  placement = 'center',
}) {
  const panelRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <MotionDiv
          className={cn(
            'fixed inset-0 z-[80] flex p-3 sm:p-6',
            'bg-black/60 backdrop-blur-md',
            placement === 'right' ? 'items-stretch justify-end p-0 sm:p-0' : 'items-center justify-center',
          )}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <MotionDiv
            role="dialog"
            aria-modal="true"
            aria-label={title}
            ref={panelRef}
            initial={reduceMotion ? false : placement === 'right' ? { opacity: 0, x: 42 } : { opacity: 0, y: 18, scale: 0.97 }}
            animate={reduceMotion ? undefined : placement === 'right' ? { opacity: 1, x: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : placement === 'right' ? { opacity: 0, x: 24 } : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-t-border bg-t-surface shadow-panel backdrop-blur-2xl',
              placement === 'right' ? 'h-full max-h-full max-w-xl rounded-none sm:rounded-l-xl' : 'max-h-[90vh]',
              className,
            )}
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-t-border bg-t-panel p-5">
              <h2 className="min-w-0 truncate font-display text-xl font-bold text-t-text">{title}</h2>
              <Button variant="ghost" size="sm" icon={X} onClick={onClose} aria-label="Close modal" />
            </div>
            <div className={cn('flex-1 overflow-y-auto p-5', bodyClassName)}>{children}</div>
            {footer ? <div className={cn('shrink-0 border-t border-t-border bg-t-panel p-5', footerClassName)}>{footer}</div> : null}
          </MotionDiv>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  );
}
