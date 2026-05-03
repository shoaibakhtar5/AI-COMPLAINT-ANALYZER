import { Bell, ChevronDown, Menu, Search, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { Input } from './Input';
import { useToast } from '../state/toast';
import { companyProfile, notificationFeed, quickActions } from '../data/stats';

const MotionHeader = motion.header;

export default function Navbar({ onMenu }) {
  const toast = useToast();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [q, setQ] = useState('');

  const runSearch = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) {
      toast.info('Global search', 'Type a customer, complaint, source, or department.', { durationMs: 2600 });
      return;
    }
    navigate(`/admin/complaints?q=${encodeURIComponent(query)}`);
    toast.success('Search launched', `Searching complaints for "${query}".`, { durationMs: 2600 });
  };

  return (
    <MotionHeader
      initial={reduceMotion ? false : { opacity: 0, y: -18 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
      className="fixed left-0 right-0 top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-zinc-950/70 px-4 shadow-2xl shadow-crimson-950/10 backdrop-blur-xl lg:left-72 lg:px-8"
    >
      <div className="flex min-w-0 items-center gap-4">
        <Button className="lg:hidden" variant="ghost" size="sm" icon={Menu} onClick={onMenu} aria-label="Open menu" />
        <div className="min-w-0">
          <p className="truncate font-display text-base font-black uppercase text-white sm:text-lg">{companyProfile.name}</p>
          <p className="label-caps hidden truncate text-zinc-500 sm:block">{companyProfile.workspace}</p>
        </div>
      </div>

      <form onSubmit={runSearch} className="hidden w-full max-w-md items-center gap-2 md:flex">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 rounded-full py-2 pl-10 text-sm"
            placeholder="Search complaints, customers, sources..."
          />
        </div>
      </form>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => toast.info(notificationFeed[0].title, notificationFeed[0].text, { durationMs: 3600 })}
          className="relative rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-crimson-600" />
        </button>
        <Button
          variant="secondary"
          size="sm"
          icon={Sparkles}
          className="hidden sm:inline-flex"
          onClick={() => {
            const action = quickActions[0];
            toast.info('Quick action', `Opening ${action.label}.`, { durationMs: 2200 });
            navigate(action.to);
          }}
        >
          Actions
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
        <div className="hidden h-8 w-px bg-white/10 sm:block" />
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold text-white">{companyProfile.adminName}</p>
            <p className="label-caps text-crimson-500">{companyProfile.adminRole}</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full border border-crimson-600/40 bg-crimson-700/20 font-display text-sm font-bold text-white">
            CA
          </div>
        </div>
      </div>
    </MotionHeader>
  );
}
