import { ShieldCheck } from 'lucide-react';

export default function Loader({ label = 'Synchronizing Sentra workspace' }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-lg border border-crimson-600/40 bg-crimson-700/20 shadow-crimson">
        <ShieldCheck className="h-7 w-7 animate-pulse text-crimson-400" />
      </div>
      <p className="label-caps text-zinc-500">{label}</p>
    </div>
  );
}
