import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useToast } from '../state/toast';
import { cn } from '../utils/cn';

const MotionDiv = motion.div;

const tones = {
  success: {
    icon: CheckCircle2,
    ring: 'border-emerald-500/25 bg-emerald-500/10',
    title: 'text-emerald-200',
    message: 'text-emerald-100/80',
  },
  error: {
    icon: AlertTriangle,
    ring: 'border-crimson-600/35 bg-crimson-600/10',
    title: 'text-crimson-200',
    message: 'text-crimson-100/80',
  },
  info: {
    icon: Info,
    ring: 'border-white/10 bg-white/5',
    title: 'text-white',
    message: 'text-zinc-300',
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
                'pointer-events-auto overflow-hidden rounded-lg border shadow-panel backdrop-blur-xl',
                tone.ring,
              )}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3 p-4">
                <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-lg bg-black/20">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('font-display text-sm font-black uppercase', tone.title)}>{t.title}</p>
                  {t.message ? <p className={cn('mt-1 text-sm leading-6', tone.message)}>{t.message}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
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

