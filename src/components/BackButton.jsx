import { ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

const MotionButton = motion.button;

const logicalBackRoutes = [
  { match: /^\/admin\/complaints\/[^/]+/, target: '/admin/complaints' },
  { match: /^\/admin\/(complaints|bulk-upload|integrations|analytics|ai-lab|settings)$/, target: '/admin/dashboard' },
  { match: /^\/onboarding$/, target: '/signup' },
  { match: /^\/(signup|submit|track)$/, target: '/' },
];

function resolveBackTarget(pathname, fallback, stateFrom) {
  if (typeof stateFrom === 'string' && stateFrom.startsWith('/') && stateFrom !== pathname) {
    return stateFrom;
  }

  const route = logicalBackRoutes.find((item) => item.match.test(pathname));
  if (route) return route.target;

  if (pathname.startsWith('/admin/') && pathname !== '/admin/dashboard') return '/admin/dashboard';
  return fallback;
}

export default function BackButton({ fallback = '/', className }) {
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const goBack = () => {
    navigate(resolveBackTarget(location.pathname, fallback, location.state?.from), { replace: true });
  };

  return (
    <MotionButton
      type="button"
      onClick={goBack}
      initial={reduceMotion ? false : { opacity: 0, x: -12 }}
      animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
      whileHover={reduceMotion ? undefined : { y: -1, x: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-zinc-950/55 px-3 text-sm font-semibold text-zinc-300 shadow-panel backdrop-blur-xl transition hover:border-crimson-500/35 hover:bg-crimson-600/10 hover:text-white hover:shadow-crimson focus-crimson',
        className,
      )}
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </MotionButton>
  );
}
