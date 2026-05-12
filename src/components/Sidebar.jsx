import { NavLink } from 'react-router-dom';
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
import { brand } from '../data/brand';
import useSecureLogout from '../hooks/useSecureLogout';
import { cn } from '../utils/cn';

const MotionAside = motion.aside;

const navItems = [
  { label: 'Dashboard',    to: '/admin/dashboard',   icon: Gauge },
  { label: 'Complaints',   to: '/admin/complaints',  icon: ShieldAlert },
  { label: 'Bulk Upload',  to: '/admin/bulk-upload', icon: UploadCloud },
  { label: 'Integrations', to: '/admin/integrations',icon: PlugZap },
  { label: 'Analytics',    to: '/admin/analytics',   icon: BarChart3 },
  { label: 'AI Lab',       to: '/admin/ai-lab',      icon: BrainCircuit },
  { label: 'Settings',     to: '/admin/settings',    icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const reduceMotion = useReducedMotion();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const secureLogout = useSecureLogout();

  const doLogout = async () => {
    setConfirmLogout(false);
    await secureLogout();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <MotionAside
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-t-border pt-6 shadow-panel backdrop-blur-2xl transition-transform lg:translate-x-0',
          'bg-t-surface/90',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-6 pb-8">
          <NavLink to="/admin/dashboard" replace className="group">
            <p className="font-display text-xl font-black uppercase text-t-text">{brand.name}</p>
            <p className="label-caps mt-1 text-t-accent">{brand.tagline ?? 'Operations Cloud'}</p>
          </NavLink>
          <Button className="lg:hidden" variant="ghost" size="sm" icon={X} onClick={onClose} aria-label="Close menu" />
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              replace
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-3 rounded-lg px-4 py-3 font-display text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-t-accent-subtle text-t-accent'
                    : 'text-t-text-muted hover:bg-t-panel hover:text-t-text',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-2 h-8 w-1 rounded-r-full bg-t-accent" />
                  )}
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-t-border p-3">
          <button
            type="button"
            onClick={() => setConfirmLogout(true)}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-t-text-muted transition-all duration-200 hover:bg-t-error-subtle hover:text-t-error"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </MotionAside>

      {/* Logout confirm modal */}
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
        <p className="text-sm leading-6 text-t-text-muted">
          You are about to end this admin session. Any unsaved edits in open modals will be lost.
        </p>
      </Modal>
    </>
  );
}
