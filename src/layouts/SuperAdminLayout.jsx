import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, Building2, Gauge, LogOut, Menu, Search, Settings, ShieldCheck, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Input } from '../components/Input';
import { brand } from '../data/brand';
import { superAdminFetch } from '../lib/superAdminApi';
import { useSuperAdminAuth } from '../state/superAdminAuth';
import { THEMES, useTheme } from '../state/theme';
import { cn } from '../utils/cn';

const MotionAside = motion.aside;

const navItems = [
  { label: 'Overview', to: '/super-admin/dashboard', icon: Gauge },
  { label: 'Companies', to: '/super-admin/companies', icon: Building2 },
  { label: 'Users', to: '/super-admin/users', icon: Users },
  { label: 'Analytics', to: '/super-admin/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/super-admin/settings', icon: Settings },
];

function SuperSidebar({ open, onClose }) {
  const reduceMotion = useReducedMotion();
  const auth = useSuperAdminAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const navigate = useNavigate();

  const doLogout = async () => {
    setConfirmLogout(false);
    await auth.logout();
    navigate('/super-admin/login', { replace: true });
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <MotionAside
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-t-border pt-6 shadow-panel backdrop-blur-2xl transition-transform lg:translate-x-0',
          'bg-t-surface/90',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-6 pb-8">
          <NavLink to="/super-admin/dashboard" replace className="group">
            <p className="font-display text-xl font-black uppercase text-t-text">{brand.name}</p>
            <p className="label-caps mt-1 text-t-accent">Platform Admin</p>
          </NavLink>
          <Button className="lg:hidden" variant="ghost" size="sm" icon={X} onClick={onClose} aria-label="Close menu" />
        </div>

        <nav className="flex-1 space-y-0.5 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              replace
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-3 rounded-lg px-4 py-3 font-display text-sm font-semibold transition-all duration-200',
                  isActive ? 'bg-t-accent-subtle text-t-accent' : 'text-t-text-muted hover:bg-t-panel hover:text-t-text',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? <span className="absolute left-0 top-2 h-8 w-1 rounded-r-full bg-t-accent" /> : null}
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

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

      <Modal
        open={confirmLogout}
        title="Confirm logout"
        onClose={() => setConfirmLogout(false)}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setConfirmLogout(false)}>Cancel</Button>
            <Button variant="danger" onClick={doLogout}>Logout</Button>
          </div>
        }
      >
        <p className="text-sm leading-6 text-t-text-muted">End this platform admin session.</p>
      </Modal>
    </>
  );
}

const emptySearchResults = { companies: [], users: [], activity: [] };

function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(emptySearchResults);
  const [error, setError] = useState('');

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults(emptySearchResults);
      setLoading(false);
      setError('');
      setOpen(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    setOpen(true);
    const timer = window.setTimeout(() => {
      superAdminFetch(`/search?q=${encodeURIComponent(term)}`)
        .then((payload) => {
          if (cancelled) return;
          setResults({
            companies: payload.companies ?? [],
            users: payload.users ?? [],
            activity: payload.activity ?? [],
          });
        })
        .catch((err) => {
          if (cancelled) return;
          setResults(emptySearchResults);
          setError(err.message || 'Search unavailable.');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const groups = [
    { key: 'companies', label: 'Companies' },
    { key: 'users', label: 'Users' },
    { key: 'activity', label: 'Activity' },
  ];
  const hasResults = groups.some((group) => results[group.key]?.length);

  const openResult = (item) => {
    navigate(item.to);
    setOpen(false);
    setQuery('');
  };

  const submit = (event) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    navigate(`/super-admin/companies?q=${encodeURIComponent(term)}`);
    setOpen(false);
  };

  return (
    <form className="relative w-full" onSubmit={submit}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-t-text-faint" />
      <Input
        className="h-10 rounded-full py-2 pl-10 pr-10 text-sm"
        placeholder="Search companies, users, activity..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          if (query.trim().length >= 2) setOpen(true);
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 140)}
        aria-expanded={open}
      />
      {query ? (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setQuery('');
            setOpen(false);
          }}
          className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-t-text-faint transition hover:bg-t-panel-high hover:text-t-text"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
      {open ? (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-t-border bg-t-surface shadow-[0_18px_45px_var(--t-shadow-strong)]">
          <div className="max-h-[440px] overflow-y-auto p-2 premium-table-scrollbar">
            {loading ? <p className="px-3 py-4 text-sm text-t-text-muted">Searching...</p> : null}
            {!loading && error ? <p className="px-3 py-4 text-sm text-t-error">{error}</p> : null}
            {!loading && !error && !hasResults ? (
              <p className="px-3 py-4 text-sm text-t-text-muted">No matching results found</p>
            ) : null}
            {!loading && !error && hasResults ? groups.map((group) => (
              results[group.key]?.length ? (
                <div key={group.key} className="py-2">
                  <p className="px-3 pb-2 label-caps text-t-accent">{group.label}</p>
                  <div className="space-y-1">
                    {results[group.key].map((item) => (
                      <button
                        key={`${group.key}-${item.id}`}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => openResult(item)}
                        className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-t-accent-subtle"
                      >
                        <span className="block truncate text-sm font-semibold text-t-text">{item.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-t-text-muted">{item.subtitle}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null
            )) : null}
          </div>
        </div>
      ) : null}
    </form>
  );
}

export default function SuperAdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const auth = useSuperAdminAuth();
  const { setTheme } = useTheme();
  const showBack = location.pathname !== '/super-admin/dashboard';

  useEffect(() => {
    if (THEMES[auth.admin?.theme]) {
      setTheme(auth.admin.theme);
    }
  }, [auth.admin?.theme, setTheme]);

  return (
    <div className="min-h-screen bg-t-bg text-t-text transition-theme duration-theme">
      <SuperSidebar open={open} onClose={() => setOpen(false)} />
      <header className="fixed left-0 right-0 top-0 z-30 flex h-20 items-center justify-between border-b border-t-border px-4 shadow-panel backdrop-blur-xl lg:left-72 lg:px-8" style={{ background: 'var(--t-nav-bg)' }}>
        <div className="flex min-w-0 items-center gap-4">
          <Button className="lg:hidden" variant="ghost" size="sm" icon={Menu} onClick={() => setOpen(true)} aria-label="Open menu" />
          <div className="min-w-0">
            <p className="truncate font-display text-base font-black uppercase text-t-text sm:text-lg">Platform Admin</p>
            <p className="label-caps hidden truncate sm:block">SaaS Control Plane</p>
          </div>
        </div>
        <div className="hidden w-full max-w-md items-center gap-2 md:flex">
          <GlobalSearch />
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden h-10 w-10 place-items-center rounded-full border border-t-accent/40 bg-t-accent-subtle text-t-accent sm:grid">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-xs font-bold text-t-text">{auth.admin?.display_name || 'Super Admin'}</p>
            <p className="label-caps truncate text-t-accent">super_admin</p>
          </div>
        </div>
      </header>
      <main className="min-h-screen px-4 pb-10 pt-24 lg:ml-72 lg:px-8">
        {showBack ? (
          <div className="mb-5">
            <BackButton fallback="/super-admin/dashboard" />
          </div>
        ) : null}
        <Outlet />
      </main>
    </div>
  );
}

