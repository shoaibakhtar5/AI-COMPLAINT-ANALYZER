import { Bell, Grid3X3, Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { Input } from './Input';
import { useToast } from '../state/toast';

export default function Navbar({ onMenu }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const runSearch = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) {
      toast.info('Global scan', 'Type a query to search complaints.', { durationMs: 2600 });
      return;
    }
    navigate(`/admin/complaints?q=${encodeURIComponent(query)}`);
    toast.success('Scan launched', `Searching complaints for “${query}”.`, { durationMs: 2600 });
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-zinc-950/70 px-4 shadow-2xl shadow-crimson-950/10 backdrop-blur-xl lg:left-72 lg:px-8">
      <div className="flex items-center gap-4">
        <Button className="lg:hidden" variant="ghost" size="sm" icon={Menu} onClick={onMenu} aria-label="Open menu" />
        <div>
          <p className="font-display text-lg font-black uppercase text-white">Crimson Analyzer</p>
          <p className="label-caps hidden text-zinc-500 sm:block">Complaint Intelligence Command</p>
        </div>
      </div>

      <form onSubmit={runSearch} className="hidden w-full max-w-sm items-center gap-2 md:flex">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 rounded-full py-2 pl-10 text-sm"
            placeholder="Global scan..."
          />
        </div>
      </form>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => toast.info('Notifications', '3 active protocol alerts in your queue.', { durationMs: 3200 })}
          className="relative rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-crimson-600" />
        </button>
        <button
          type="button"
          onClick={() => toast.info('Command apps', 'Opening tool switcher (demo).', { durationMs: 2400 })}
          className="hidden rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white sm:block"
          aria-label="Apps"
        >
          <Grid3X3 className="h-5 w-5" />
        </button>
        <div className="hidden h-8 w-px bg-white/10 sm:block" />
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold text-white">CMD. ARCHER</p>
            <p className="label-caps text-crimson-500">Level 5</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full border border-crimson-600/40 bg-crimson-700/20 font-display text-sm font-bold text-white">
            CA
          </div>
        </div>
      </div>
    </header>
  );
}
