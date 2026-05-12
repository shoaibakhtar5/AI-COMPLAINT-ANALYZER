import { motion, useReducedMotion } from 'framer-motion';

const MotionDiv = motion.div;

export default function AnimatedBackground({ children }) {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen overflow-hidden bg-t-bg text-t-text">
      <div className="absolute inset-0 bg-grid-overlay opacity-40" />
      <MotionDiv
        className="absolute -left-24 top-28 h-72 w-72 rounded-full bg-t-accent-glow blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, 38, 0], y: [0, -18, 0], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <MotionDiv
        className="absolute -right-28 bottom-10 h-96 w-96 rounded-full bg-t-accent-glow blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, -32, 0], y: [0, 26, 0], opacity: [0.28, 0.48, 0.28] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative z-10">{children}</div>
    </main>
  );
}
