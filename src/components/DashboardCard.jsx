import { motion, useReducedMotion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';
import { cn } from '../utils/cn';
import { useNavigate } from 'react-router-dom';

const MotionButton = motion.button;

const toneClasses = {
  neutral: {
    change: 'text-zinc-400',
    icon: 'border-crimson-600/20 bg-crimson-600/10 text-crimson-400',
    glow: 'group-hover:shadow-[0_0_36px_rgba(220,38,38,0.18)]',
  },
  warning: {
    change: 'text-amber-300',
    icon: 'border-amber-400/25 bg-amber-500/10 text-amber-200',
    glow: 'group-hover:shadow-[0_0_36px_rgba(245,158,11,0.14)]',
  },
  info: {
    change: 'text-sky-300',
    icon: 'border-sky-400/25 bg-sky-500/10 text-sky-200',
    glow: 'group-hover:shadow-[0_0_36px_rgba(56,189,248,0.14)]',
  },
  success: {
    change: 'text-emerald-400',
    icon: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200',
    glow: 'group-hover:shadow-[0_0_36px_rgba(16,185,129,0.14)]',
  },
  danger: {
    change: 'text-crimson-300',
    icon: 'border-crimson-500/30 bg-crimson-600/15 text-crimson-300',
    glow: 'group-hover:shadow-[0_0_42px_rgba(220,38,38,0.24)]',
  },
};

function toPath(route, filterParams) {
  const params = new URLSearchParams();
  Object.entries(filterParams ?? {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const query = params.toString();
  return query ? `${route}?${query}` : route;
}

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  route = '/admin/complaints',
  filterParams,
  change,
  tone = 'neutral',
  decimals = 0,
  suffix = '',
  active = false,
}) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const styles = toneClasses[tone] ?? toneClasses.neutral;
  const target = toPath(route, filterParams);

  return (
    <MotionButton
      type="button"
      aria-label={`Open ${title} complaints`}
      onClick={() => navigate(target)}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}
      whileTap={reduceMotion ? undefined : { y: -1, scale: 0.985 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative h-full w-full cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-panel/95 via-zinc-950/95 to-crimson-950/25 p-5 text-left shadow-panel outline-none transition',
        'focus-crimson hover:border-crimson-500/40',
        styles.glow,
        active && 'border-crimson-500/50 shadow-crimson',
      )}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="label-caps text-zinc-500 transition group-hover:text-zinc-300">{title}</span>
        <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-lg border transition group-hover:scale-105', styles.icon)}>
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </span>
      </div>
      <p className="font-display text-3xl font-black text-white">
        <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
      </p>
      {change ? <p className={cn('mt-2 text-sm', styles.change)}>{change}</p> : null}
    </MotionButton>
  );
}
