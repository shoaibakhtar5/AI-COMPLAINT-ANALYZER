import { AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

export default function AuthInput({ label, error, hint, icon: Icon, className, inputClassName, right, ...props }) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="label-caps block text-zinc-500">{label}</span>
      <div className="relative">
        {Icon ? <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" /> : null}
        <input
          className={cn(
            'h-10 w-full rounded-lg border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-crimson-600 focus:ring-2 focus:ring-crimson-700/40',
            Icon && 'pl-10',
            right && 'pr-10',
            error && 'border-crimson-500/50 bg-crimson-950/10 ring-2 ring-crimson-700/25',
            inputClassName,
          )}
          {...props}
        />
        {right}
      </div>
      {error || hint ? (
        <span className={cn('flex items-center gap-1.5 text-xs leading-4', error ? 'text-crimson-200' : 'text-zinc-500')}>
          {error ? <AlertCircle className="h-3 w-3" /> : null}
          {error || hint}
        </span>
      ) : null}
    </label>
  );
}
