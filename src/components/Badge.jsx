import { cn } from '../utils/cn';

const tones = {
  Critical: 'border-crimson-500/50 bg-crimson-600/15 text-crimson-300',
  Escalated: 'border-crimson-500/50 bg-crimson-600/15 text-crimson-300',
  Pending: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
  'In Progress': 'border-sky-400/40 bg-sky-500/10 text-sky-200',
  Active: 'border-orange-400/40 bg-orange-500/10 text-orange-200',
  Investigating: 'border-sky-400/40 bg-sky-500/10 text-sky-200',
  Queued: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-300',
  Resolved: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  Negative: 'border-crimson-500/50 bg-crimson-600/15 text-crimson-300',
  Frustrated: 'border-orange-400/40 bg-orange-500/10 text-orange-200',
  Concerned: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
  Positive: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  Neutral: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-300',
  High: 'border-crimson-500/50 bg-crimson-600/15 text-crimson-300',
  Medium: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
  Low: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  Connected: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  Healthy: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  'Review Needed': 'border-amber-400/40 bg-amber-500/10 text-amber-200',
  Completed: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
};

export default function Badge({ children, tone, className }) {
  const key = tone || children;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        tones[key] || 'border-white/10 bg-white/5 text-zinc-300',
        className,
      )}
    >
      {children}
    </span>
  );
}
