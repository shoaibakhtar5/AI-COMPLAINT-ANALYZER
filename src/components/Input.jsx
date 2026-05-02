import { cn } from '../utils/cn';

export function Field({ label, hint, children, className }) {
  return (
    <label className={cn('block space-y-2', className)}>
      <span className="label-caps block text-zinc-500">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}

const control =
  'w-full rounded-lg border border-white/10 bg-black/35 px-4 py-3 text-white placeholder:text-zinc-700 transition focus-crimson';

export function Input({ className, ...props }) {
  return <input className={cn(control, className)} {...props} />;
}

export function Textarea({ className, rows = 5, ...props }) {
  return <textarea rows={rows} className={cn(control, 'resize-none', className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(control, 'appearance-none', className)} {...props}>
      {children}
    </select>
  );
}
