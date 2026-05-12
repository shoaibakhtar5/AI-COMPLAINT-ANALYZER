import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useToast } from '../state/toast';
import { cn } from '../utils/cn';

const MotionDiv = motion.div;

const tones = {
  success: {
    icon: CheckCircle2,
    ring: 'border-t-success/30 bg-t-success-subtle',
    icon_color: 'text-t-success',
    title: 'text-t-text',
    message: 'text-t-text-muted',
  },
  error: {
    icon: AlertTriangle,
    ring: 'border-t-error/35 bg-t-error-subtle',
    icon_color: 'text-t-error',
    title: 'text-t-text',
    message: 'text-t-text-muted',
  },
  info: {
    icon: Info,
    ring: 'border-t-border bg-t-surface',
    icon_color: 'text-t-accent',
    title: 'text-t-text',
    message: 'text-t-text-muted',
  },
};

export default function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed right-4 top-24 z-[90] flex w-full max-w-sm flex-col gap-3 sm:right-6">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const tone = tones[t.tone] ?? tones.info;
          const Icon = tone.icon;
          return (
            <MotionDiv
              key={t.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className={cn(
                'pointer-events-auto overflow-hidden rounded-xl border shadow-panel backdrop-blur-xl',
                tone.ring,
              )}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3 p-4">
                <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-t-panel">
                  <Icon className={cn('h-5 w-5', tone.icon_color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('font-display text-sm font-black uppercase', tone.title)}>{t.title}</p>
                  {t.message ? <p className={cn('mt-1 text-sm leading-6', tone.message)}>{t.message}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="rounded-lg p-2 text-t-text-muted transition hover:bg-t-panel hover:text-t-text"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </MotionDiv>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
