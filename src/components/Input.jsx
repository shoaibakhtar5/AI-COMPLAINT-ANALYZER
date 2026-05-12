import { cn } from '../utils/cn';

export function Field({ label, hint, children, className }) {
  return (
    <label className={cn('block space-y-2', className)}>
      <span className="label-caps block">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-t-text-muted">{hint}</span> : null}
    </label>
  );
}

const control =
  'h-10 w-full rounded-lg border border-t-border bg-t-surface px-3 py-0 text-sm leading-5 text-t-text placeholder:text-t-text-faint transition-all duration-200 focus-accent';

export function Input({ className, ...props }) {
  return <input className={cn(control, className)} {...props} />;
}

export function Textarea({ className, rows = 5, ...props }) {
  return <textarea rows={rows} className={cn(control, 'h-auto resize-none py-3 leading-6', className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(control, 'appearance-none pr-9 leading-10', className)} {...props}>
      {children}
    </select>
  );
}
