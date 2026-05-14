import {
  Bell,
  BellRing,
  Building2,
  Camera,
  ChevronDown,
  LogOut,
  Menu,
  MonitorCog,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { Input } from './Input';
import { useToast } from '../state/toast';
import { quickActions } from '../data/stats';
import useSecureLogout from '../hooks/useSecureLogout';
import { API_BASE_URL, apiFetch } from '../lib/api';
import { useAuth } from '../state/auth';

const MotionHeader = motion.header;
const MotionDiv = motion.div;

const profileMenuItems = [
  { label: 'View Profile',          section: 'organization', icon: UserRound },
  { label: 'Organization Settings', section: 'organization', icon: Building2 },
  { label: 'Security Settings',     section: 'security',     icon: ShieldCheck },
  { label: 'Notifications',         section: 'notifications',icon: BellRing },
  { label: 'Workspace Preferences', section: 'workspace',    icon: MonitorCog },
];

function initials(name) {
  return String(name || 'User')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
}

export default function Navbar({ onMenu }) {
  const toast = useToast();
  const auth = useAuth();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const secureLogout = useSecureLogout();
  const [q, setQ] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef(null);
  const fileRef = useRef(null);

  const profileName = auth.user?.name || auth.user?.owner_name || 'Workspace Owner';
  const profileRole = auth.user?.role || 'Workspace Admin';
  const workspaceName = auth.user?.company || auth.user?.organization_name || 'Workspace';
  const assetOrigin = API_BASE_URL.replace(/\/api\/?$/, '');

  useEffect(() => {
    if (!profileOpen) return undefined;
    const onPointerDown = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setProfileOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [profileOpen]);

  useEffect(() => () => {
    if (avatarUrl) URL.revokeObjectURL(avatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    if (auth.user?.avatar_url) {
      setAvatarUrl(auth.user.avatar_url.startsWith('http') ? auth.user.avatar_url : `${assetOrigin}${auth.user.avatar_url}`);
    } else {
      setAvatarUrl('');
    }
  }, [assetOrigin, auth.user?.avatar_url]);

  useEffect(() => {
    if (!auth.token) return;
    apiFetch('/integrations/notifications')
      .then((items) => setNotifications(items ?? []))
      .catch(() => setNotifications([]));
  }, [auth.token]);

  const runSearch = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) {
      toast.info('Global search', 'Type a customer, complaint, source, or department.', { durationMs: 2600 });
      return;
    }
    navigate(`/admin/complaints?q=${encodeURIComponent(query)}`, { replace: true });
    toast.success('Search launched', `Searching complaints for "${query}".`, { durationMs: 2600 });
  };

  const openSettingsSection = (section) => {
    setProfileOpen(false);
    navigate(`/admin/settings?section=${section}`, { replace: true });
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const nextUrl = URL.createObjectURL(file);
    setAvatarUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return nextUrl;
    });
    const formData = new FormData();
    formData.append('file', file);
    try {
      await apiFetch('/auth/avatar', { method: 'POST', body: formData });
      toast.success('Profile photo updated', 'Avatar saved to your workspace profile.', { durationMs: 2400 });
    } catch (error) {
      toast.error('Avatar upload failed', error.message || 'Could not save this image.', { durationMs: 2600 });
    }
  };

  return (
    <MotionHeader
      initial={reduceMotion ? false : { opacity: 0, y: -18 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
      className="fixed left-0 right-0 top-0 z-30 flex h-20 items-center justify-between border-b border-t-border px-4 shadow-panel backdrop-blur-xl lg:left-72 lg:px-8"
      style={{ background: 'var(--t-nav-bg)' }}
    >
      <div className="flex min-w-0 items-center gap-4">
        <Button className="lg:hidden" variant="ghost" size="sm" icon={Menu} onClick={onMenu} aria-label="Open menu" />
        <div className="min-w-0">
          <p className="truncate font-display text-base font-black uppercase text-t-text sm:text-lg">{workspaceName}</p>
          <p className="label-caps hidden truncate sm:block">Complaint Intelligence Cloud</p>
        </div>
      </div>

      <form onSubmit={runSearch} className="hidden w-full max-w-md items-center gap-2 md:flex">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-t-text-faint" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 rounded-full py-2 pl-10 text-sm"
            placeholder="Search complaints, customers, sources..."
          />
        </div>
      </form>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Bell */}
        <button
          type="button"
          onClick={async () => {
            const notification = notifications[0] ?? { title: 'Notifications', text: 'No new workspace notifications.' };
            toast.info(notification.title, notification.text, { durationMs: 3600 });
            if (notifications.some((item) => !item.read_at)) {
              try {
                const next = await apiFetch('/integrations/notifications/read', { method: 'POST' });
                setNotifications(next ?? []);
              } catch {
                // Keep the notification indicator untouched if the backend cannot mark it read.
              }
            }
          }}
          className="relative rounded-lg p-2 text-t-text-muted transition hover:bg-t-panel hover:text-t-text"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {notifications.some((item) => !item.read_at) ? (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-t-accent" />
          ) : null}
        </button>

        <Button
          variant="secondary"
          size="sm"
          icon={Sparkles}
          className="hidden sm:inline-flex"
          onClick={() => {
            const action = quickActions[0];
            toast.info('Quick action', `Opening ${action.label}.`, { durationMs: 2200 });
            navigate(action.to, { replace: true });
          }}
        >
          Actions
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>

        <div className="hidden h-8 w-px bg-t-border sm:block" />

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((value) => !value)}
            className="group flex items-center gap-3 rounded-full border border-t-border bg-t-surface py-1.5 pl-1.5 pr-2 transition-all duration-200 hover:border-t-accent hover:shadow-[0_0_0_2px_var(--t-accent-subtle)] sm:pr-3"
            aria-haspopup="menu"
            aria-expanded={profileOpen}
          >
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-t-accent/50 bg-t-accent-subtle font-display text-sm font-black text-t-accent">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" onError={() => setAvatarUrl('')} />
              ) : (
                initials(profileName)
              )}
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block max-w-36 truncate text-xs font-bold text-t-text">{profileName}</span>
              <span className="label-caps block max-w-36 truncate text-t-accent">{profileRole}</span>
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-t-text-muted transition ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {profileOpen ? (
              <MotionDiv
                role="menu"
                initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.96 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-t-border bg-t-surface shadow-panel backdrop-blur-2xl"
              >
                {/* Profile header */}
                <div className="relative border-b border-t-border p-4">
                  <div className="absolute inset-0 bg-t-accent-subtle opacity-50" />
                  <div className="relative flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="group/avatar relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-t-accent/35 bg-t-accent-subtle font-display text-base font-black text-t-accent"
                      aria-label="Upload profile photo"
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="h-full w-full object-cover" onError={() => setAvatarUrl('')} />
                      ) : (
                        initials(profileName)
                      )}
                      <span className="absolute inset-0 grid place-items-center bg-t-panel-high/40 opacity-0 transition group-hover/avatar:opacity-100">
                        <Camera className="h-4 w-4 text-t-text" />
                      </span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => void uploadAvatar(event)} />
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-black text-t-text">{profileName}</p>
                      <p className="mt-1 truncate text-xs text-t-text-muted">{profileRole}</p>
                      <p className="label-caps mt-2 text-t-accent">{workspaceName} workspace</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-2">
                  {profileMenuItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => openSettingsSection(item.section)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-t-text-muted transition-all duration-200 hover:bg-t-accent-subtle hover:text-t-text"
                      role="menuitem"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-t-panel text-t-accent">
                        <item.icon className="h-4 w-4" />
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t border-t-border p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      void secureLogout();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-t-error transition-all duration-200 hover:bg-t-error-subtle"
                    role="menuitem"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-t-error-subtle text-t-error">
                      <LogOut className="h-4 w-4" />
                    </span>
                    Logout
                  </button>
                </div>
              </MotionDiv>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </MotionHeader>
  );
}
