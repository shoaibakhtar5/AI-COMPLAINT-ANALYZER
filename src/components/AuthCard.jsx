import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { cn } from '../utils/cn';

const MotionSection = motion.section;

export default function AuthCard({ eyebrow, title, description, children, aside, className }) {
  const reduceMotion = useReducedMotion();

  return (
    <MotionSection
      initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.985 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'mx-auto grid w-full max-w-5xl overflow-hidden rounded-xl border border-t-border bg-t-surface shadow-panel backdrop-blur-2xl lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.65fr)]',
        className,
      )}
    >
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="mb-4 flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-t-accent/30 bg-t-accent-subtle accent-glow">
            <ShieldCheck className="h-5 w-5 text-t-accent" />
          </span>
          <div>
            {eyebrow ? <p className="label-caps text-t-accent">{eyebrow}</p> : null}
            <h1 className="mt-1.5 font-display text-2xl font-black text-t-text sm:text-3xl">{title}</h1>
            {description ? <p className="mt-1.5 max-w-xl text-sm leading-5 text-t-text-muted">{description}</p> : null}
          </div>
        </div>
        {children}
      </div>
      {aside ? <aside className="border-t border-t-border bg-t-panel p-4 sm:p-5 lg:border-l lg:border-t-0">{aside}</aside> : null}
    </MotionSection>
  );
}
