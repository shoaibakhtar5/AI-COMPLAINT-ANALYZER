import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import { brand } from '../data/brand';

const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionP = motion.p;

const messages = [
  'Initializing Intelligence...',
  'Loading Complaint Engine...',
  'Preparing Dashboard...',
  'Securing Workspace...',
];

export default function SplashScreen() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);
  const duration = reduceMotion ? 650 : 1900;

  useEffect(() => {
    const cycle = window.setInterval(() => setIndex((value) => (value + 1) % messages.length), reduceMotion ? 320 : 470);
    const timer = window.setTimeout(() => setVisible(false), duration);
    return () => {
      window.clearInterval(cycle);
      window.clearTimeout(timer);
    };
  }, [duration, reduceMotion]);

  const progressTransition = useMemo(
    () => ({ duration: reduceMotion ? 0.45 : duration / 1000 - 0.12, ease: [0.22, 1, 0.36, 1] }),
    [duration, reduceMotion],
  );

  return (
    <AnimatePresence>
      {visible ? (
        <MotionDiv
          className="fixed inset-0 z-[120] grid place-items-center overflow-hidden bg-[#08080b]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <MotionDiv
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(127,29,29,0.34),transparent_38%),linear-gradient(135deg,#09090b_0%,#141218_52%,#250606_100%)]"
            animate={reduceMotion ? undefined : { backgroundPosition: ['0% 0%', '20% 10%', '0% 0%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative w-full max-w-md px-6 text-center">
            <MotionDiv
              className="mx-auto grid h-20 w-20 place-items-center rounded-lg border border-crimson-500/30 bg-crimson-600/10 shadow-crimson"
              animate={reduceMotion ? undefined : { scale: [1, 1.04, 1], rotate: [0, 2, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <BrainCircuit className="h-10 w-10 text-crimson-200" />
            </MotionDiv>
            <MotionH1
              className="mt-7 font-display text-3xl font-black text-white"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {brand.name}
            </MotionH1>
            <div className="mt-3 h-7 overflow-hidden">
              <AnimatePresence mode="wait">
                <MotionP
                  key={messages[index]}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                  className="text-sm font-medium text-crimson-200/90"
                >
                  {messages[index]}
                </MotionP>
              </AnimatePresence>
            </div>
            <div className="mx-auto mt-7 h-1.5 max-w-xs overflow-hidden rounded-full bg-white/10">
              <MotionDiv
                className="h-full rounded-full bg-gradient-to-r from-crimson-900 via-crimson-500 to-red-300"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={progressTransition}
              />
            </div>
          </div>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  );
}
