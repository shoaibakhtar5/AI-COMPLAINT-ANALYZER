import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

const variants = {
  primary:
    'bg-crimson-700 text-white shadow-crimson hover:bg-crimson-600 border border-crimson-600/40',
  secondary:
    'bg-white/5 text-white hover:bg-white/10 border border-white/10',
  ghost:
    'bg-transparent text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent',
  danger:
    'bg-crimson-950 text-crimson-200 hover:bg-crimson-900 border border-crimson-700/40',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export default function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  as: Component = 'button',
  type = 'button',
  ...props
}) {
  return (
    <Component
      {...(Component === 'button' ? { type } : {})}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-display font-bold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60',
        'motion-safe:transform-gpu motion-safe:hover:-translate-y-0.5 hover:shadow-crimson focus-crimson',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </Component>
  );
}
