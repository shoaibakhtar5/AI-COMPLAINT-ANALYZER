import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, ShieldCheck, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import BackButton from '../components/BackButton';
import { brand } from '../data/brand';

const MotionHeader = motion.header;
const MotionDiv = motion.div;

const links = [
  { label: 'Platform',  to: '/#platform',  hash: '#platform' },
  { label: 'Features',  to: '/#features',  hash: '#features' },
  { label: 'Analytics', to: '/#analytics', hash: '#analytics' },
  { label: 'Security',  to: '/#security',  hash: '#security' },
];

export default function PublicLayout() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const showBack = location.pathname !== '/';

  useEffect(() => {
    setMobileOpen(false);
  }, [location.hash, location.pathname]);

  const isSectionActive = (link) => {
    if (location.pathname !== '/') return false;
    if (link.hash === '#platform') return !location.hash || location.hash === '#platform';
    return location.hash === link.hash;
  };

  const navLinkClass = (link) =>
    `rounded-full px-4 py-2 font-display text-sm font-semibold transition-all duration-200 ${
      isSectionActive(link)
        ? 'bg-t-accent-subtle text-t-accent shadow-[inset_0_0_0_1px_var(--t-accent-subtle)]'
        : 'text-t-text-muted hover:bg-t-panel hover:text-t-text'
    }`;

  return (
    <div className="min-h-screen bg-t-bg text-t-text transition-theme duration-theme">
      <MotionHeader
        initial={reduceMotion ? false : { opacity: 0, y: -18 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 right-0 top-0 z-40 px-3 pt-4 sm:px-6"
      >
        <div className="relative mx-auto max-w-5xl">
          <div
            className="mx-auto flex w-full items-center justify-between gap-2 rounded-full border border-t-border px-2 py-2 shadow-panel backdrop-blur-2xl sm:w-fit sm:gap-3 sm:px-3"
            style={{ background: 'var(--t-nav-bg)' }}
          >
            <NavLink
              to="/"
              className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition hover:bg-t-panel sm:pr-4"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-t-accent shadow-[0_0_20px_var(--t-accent-glow)]">
                <ShieldCheck className="h-5 w-5 text-white" />
              </span>
              <span className="hidden whitespace-nowrap font-display text-base font-black uppercase text-t-text sm:block">
                {brand.name}
              </span>
            </NavLink>

            <nav className="hidden items-center gap-1 md:flex">
              {links.map((link) => (
                <Link key={link.hash} to={link.to} className={navLinkClass(link)}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <NavLink
              to="/admin/login"
              className="hidden rounded-full bg-t-accent px-5 py-2.5 font-display text-sm font-bold text-white shadow-[0_4px_14px_var(--t-accent-glow)] transition hover:bg-t-accent-hover md:inline-flex"
            >
              Admin Login
            </NavLink>

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="grid h-10 w-10 place-items-center rounded-full border border-t-border bg-t-panel text-t-text-muted transition hover:bg-t-panel-high hover:text-t-text md:hidden"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          {mobileOpen ? (
            <MotionDiv
              initial={reduceMotion ? false : { opacity: 0, y: -8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              className="relative mx-auto mt-3 w-full max-w-sm rounded-3xl border border-t-border bg-t-surface p-2 shadow-panel backdrop-blur-2xl md:hidden"
            >
              <nav className="grid gap-1">
                {links.map((link) => (
                  <Link
                    key={link.hash}
                    to={link.to}
                    className={`${navLinkClass(link)} justify-center text-center`}
                  >
                    {link.label}
                  </Link>
                ))}
                <NavLink
                  to="/admin/login"
                  className="mt-1 rounded-full bg-t-accent px-4 py-2.5 text-center font-display text-sm font-bold text-white shadow-[0_4px_14px_var(--t-accent-glow)] transition hover:bg-t-accent-hover"
                >
                  Admin Login
                </NavLink>
              </nav>
            </MotionDiv>
          ) : null}
        </div>
      </MotionHeader>

      {showBack ? (
        <div className="fixed left-4 top-24 z-30 sm:left-6 lg:left-8">
          <BackButton fallback="/" />
        </div>
      ) : null}

      <Outlet />
    </div>
  );
}
