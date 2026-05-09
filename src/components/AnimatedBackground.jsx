import { motion, useReducedMotion } from 'framer-motion';

const MotionDiv = motion.div;

export default function AnimatedBackground({ children }) {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08080b] text-white">
      <MotionDiv
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(220,38,38,0.22),transparent_30%),radial-gradient(circle_at_78%_12%,rgba(127,29,29,0.2),transparent_28%),linear-gradient(135deg,#09090b_0%,#141218_50%,#260707_100%)]"
        animate={reduceMotion ? undefined : { backgroundPosition: ['0% 0%', '8% 6%', '0% 0%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40" />
      <MotionDiv
        className="absolute -left-24 top-28 h-72 w-72 rounded-full bg-crimson-700/10 blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, 38, 0], y: [0, -18, 0], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <MotionDiv
        className="absolute -right-28 bottom-10 h-96 w-96 rounded-full bg-red-950/30 blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, -32, 0], y: [0, 26, 0], opacity: [0.28, 0.48, 0.28] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative z-10">{children}</div>
    </main>
  );
}
