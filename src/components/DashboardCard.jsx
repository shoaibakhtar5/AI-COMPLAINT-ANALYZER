import { motion, useReducedMotion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';
import { cn } from '../utils/cn';
import { useNavigate } from 'react-router-dom';

const MotionButton = motion.button;

const toneClasses = {
  neutral: {
    change: 'text-t-text-muted',
    icon: 'border-t-accent/25 bg-t-accent-subtle text-t-accent',
    glow: 'group-hover:shadow-[0_0_36px_var(--t-accent-glow)]',
  },
  warning: {
    change: 'text-t-warning',
    icon: 'border-t-warning/25 bg-t-warning-subtle text-t-warning',
    glow: 'group-hover:shadow-[0_0_36px_rgba(212,163,115,0.2)]',
  },
  info: {
    change: 'text-t-info',
    icon: 'border-t-info/25 bg-t-info-subtle text-t-info',
    glow: 'group-hover:shadow-[0_0_36px_rgba(74,127,165,0.2)]',
  },
  success: {
    change: 'text-t-success',
    icon: 'border-t-success/25 bg-t-success-subtle text-t-success',
    glow: 'group-hover:shadow-[0_0_36px_rgba(91,138,114,0.2)]',
  },
  danger: {
    change: 'text-t-error',
    icon: 'border-t-error/25 bg-t-error-subtle text-t-error',
    glow: 'group-hover:shadow-[0_0_42px_var(--t-accent-glow)]',
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
      onClick={() => navigate(target, { replace: true })}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}
      whileTap={reduceMotion ? undefined : { y: -1, scale: 0.985 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative h-full w-full cursor-pointer overflow-hidden rounded-xl border border-t-border bg-t-surface p-5 text-left shadow-panel outline-none transition-all duration-200',
        'hover:border-t-border-strong',
        styles.glow,
        active && 'border-t-accent shadow-[0_0_0_2px_var(--t-accent-subtle)]',
      )}
    >
      {/* Subtle shimmer on hover */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-t-accent/30 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="label-caps transition group-hover:text-t-text">{title}</span>
        <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-lg border transition group-hover:scale-105', styles.icon)}>
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </span>
      </div>

      <p className="font-display text-3xl font-black text-t-text">
        <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
      </p>
      {change ? <p className={cn('mt-2 text-sm', styles.change)}>{change}</p> : null}
    </MotionButton>
  );
}
