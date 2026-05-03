import { ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

const MotionButton = motion.button;

export default function BackButton({ fallback = '/', className }) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
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
