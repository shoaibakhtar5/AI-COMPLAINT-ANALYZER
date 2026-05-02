import { NavLink, Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Button from '../components/Button';

const links = [
  { label: 'Platform', to: '/' },
  { label: 'Submit', to: '/submit' },
  { label: 'Track', to: '/track' },
  { label: 'Admin', to: '/admin/login' },
];

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-app text-white">
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-crimson-700 shadow-crimson">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-black uppercase">Aegis AI</span>
          </NavLink>
          <nav className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-display text-sm font-semibold transition ${isActive ? 'text-crimson-400' : 'text-zinc-400 hover:text-white'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button as={NavLink} to="/admin/login" size="sm" className="h-10">
              Admin Login
            </Button>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
