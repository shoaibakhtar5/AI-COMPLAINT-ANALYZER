import { NavLink, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BarChart3,
  BrainCircuit,
  Gauge,
  LogOut,
  PlugZap,
  Settings,
  ShieldAlert,
  UploadCloud,
  X,
} from 'lucide-react';
import { useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import { cn } from '../utils/cn';
import { useAuth } from '../state/auth';
import { useToast } from '../state/toast';

const MotionAside = motion.aside;

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: Gauge },
  { label: 'Complaints', to: '/admin/complaints', icon: ShieldAlert },
  { label: 'Bulk Upload', to: '/admin/bulk-upload', icon: UploadCloud },
  { label: 'Integrations', to: '/admin/integrations', icon: PlugZap },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'AI Lab', to: '/admin/ai-lab', icon: BrainCircuit },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const doLogout = async () => {
    setConfirmLogout(false);
    toast.info('Signing out', 'Clearing secure session…', { durationMs: 1800 });
    await auth.logout();
    toast.success('Logged out', 'Session cleared.', { durationMs: 2200 });
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <MotionAside
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-white/10 bg-zinc-950/85 pt-6 shadow-panel backdrop-blur-2xl transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-6 pb-8">
          <NavLink to="/admin/dashboard" className="group">
            <p className="font-display text-xl font-black uppercase text-white">Crimson AI</p>
            <p className="label-caps mt-1 text-crimson-500">Complaint Analyzer</p>
          </NavLink>
          <Button className="lg:hidden" variant="ghost" size="sm" icon={X} onClick={onClose} aria-label="Close menu" />
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-4 px-6 py-4 font-display text-sm font-semibold uppercase text-zinc-500 transition hover:bg-white/5 hover:text-white',
                  isActive && 'bg-crimson-600/10 text-crimson-400',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'absolute left-0 top-2 h-8 w-1 rounded-r-full bg-crimson-600 transition',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={() => setConfirmLogout(true)}
            className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-sm font-semibold uppercase text-zinc-500 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </MotionAside>

      <Modal
        open={confirmLogout}
        title="Confirm logout"
        onClose={() => setConfirmLogout(false)}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setConfirmLogout(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doLogout}>
              Logout
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-6 text-zinc-300">
          You’re about to end this admin session. Any unsaved edits in open modals will be lost.
        </p>
      </Modal>
    </>
  );
}
