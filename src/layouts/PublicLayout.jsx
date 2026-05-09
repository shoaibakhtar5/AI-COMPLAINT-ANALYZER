import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, ShieldCheck, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import BackButton from '../components/BackButton';
import { brand } from '../data/brand';

const MotionHeader = motion.header;
const MotionDiv = motion.div;

const links = [
  { label: 'Platform', to: '/#platform', hash: '#platform' },
  { label: 'Features', to: '/#features', hash: '#features' },
  { label: 'Analytics', to: '/#analytics', hash: '#analytics' },
  { label: 'Security', to: '/#security', hash: '#security' },
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
    `rounded-full px-4 py-2 font-display text-sm font-semibold transition ${
      isSectionActive(link)
        ? 'bg-crimson-500/15 text-crimson-100 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.16)]'
        : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-app text-white">
      <MotionHeader
        initial={reduceMotion ? false : { opacity: 0, y: -18 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 right-0 top-0 z-40 px-3 pt-4 sm:px-6"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-6 h-32 bg-[radial-gradient(circle_at_18%_0%,rgba(220,38,38,0.34),transparent_34%),radial-gradient(circle_at_82%_0%,rgba(127,29,29,0.3),transparent_32%),linear-gradient(180deg,rgba(9,9,11,0.96),rgba(24,24,27,0.72)_58%,transparent)] blur-sm"
        />
        <div className="relative mx-auto max-w-5xl">
          <div className="mx-auto flex w-full items-center justify-between gap-2 rounded-full border border-white/10 bg-zinc-950/72 px-2 py-2 shadow-[0_20px_55px_rgba(0,0,0,0.45),0_0_42px_rgba(220,38,38,0.14)] backdrop-blur-2xl sm:w-fit sm:gap-3 sm:px-3">
            <NavLink
              to="/"
              className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition hover:bg-white/[0.04] sm:pr-4"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-crimson-500 to-crimson-800 shadow-crimson">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="hidden whitespace-nowrap font-display text-base font-black uppercase sm:block">
                {brand.name}
              </span>
            </NavLink>
            <nav className="hidden items-center gap-1 md:flex">
              {links.map((link) => (
                <Link
                  key={link.hash}
                  to={link.to}
                  className={navLinkClass(link)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <NavLink
              to="/admin/login"
              className="hidden rounded-full bg-crimson-700 px-5 py-2.5 font-display text-sm font-bold text-white shadow-[0_12px_34px_rgba(185,28,28,0.28)] transition hover:bg-crimson-600 hover:shadow-[0_16px_44px_rgba(220,38,38,0.28)] md:inline-flex"
            >
              Admin Login
            </NavLink>
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-zinc-300 transition hover:bg-white/10 hover:text-white md:hidden"
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
              className="relative mx-auto mt-3 w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950/88 p-2 shadow-[0_20px_54px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:hidden"
            >
              <nav className="grid gap-1">
                {links.map((link) => (
                  <Link
                    key={link.hash}
                    to={link.to}
                    className={`${navLinkClass(link)} justify-center text-center ${isSectionActive(link) ? 'bg-crimson-700/15' : 'hover:bg-white/5'}`}
                  >
                    {link.label}
                  </Link>
                ))}
                <NavLink
                  to="/admin/login"
                  className="mt-1 rounded-full bg-crimson-700 px-4 py-2.5 text-center font-display text-sm font-bold text-white shadow-crimson transition hover:bg-crimson-600"
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
