import { AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

export default function AuthInput({ label, error, hint, icon: Icon, className, inputClassName, right, ...props }) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="label-caps block">{label}</span>
      <div className="relative">
        {Icon ? <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-t-text-faint" /> : null}
        <input
          className={cn(
            'h-10 w-full rounded-lg border border-t-border bg-t-surface px-3 text-sm text-t-text outline-none transition-all duration-200 placeholder:text-t-text-faint focus-accent',
            Icon && 'pl-10',
            right && 'pr-10',
            error && 'border-t-error/50 bg-t-error-subtle ring-2 ring-t-error/20',
            inputClassName,
          )}
          {...props}
        />
        {right}
      </div>
      {error || hint ? (
        <span className={cn('flex items-center gap-1.5 text-xs leading-4', error ? 'text-t-error' : 'text-t-text-muted')}>
          {error ? <AlertCircle className="h-3 w-3" /> : null}
          {error || hint}
        </span>
      ) : null}
    </label>
  );
}
