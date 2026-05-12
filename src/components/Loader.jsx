import { ShieldCheck } from 'lucide-react';

export default function Loader({ label = 'Synchronizing Sentra workspace' }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-lg border border-t-accent/40 bg-t-accent-subtle shadow-panel">
        <ShieldCheck className="h-7 w-7 animate-pulse text-t-accent" />
      </div>
      <p className="label-caps text-t-text-muted">{label}</p>
    </div>
  );
}
