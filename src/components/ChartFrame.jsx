import { useEffect, useRef, useState } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '../utils/cn';

export default function ChartFrame({ children, className, minHeight = 288, label = 'Loading chart...' }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const update = () => {
      const rect = node.getBoundingClientRect();
      const next = {
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height)),
      };
      setSize((current) => (current.width === next.width && current.height === next.height ? current : next));
    };

    update();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(node);
    window.addEventListener('resize', update);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const ready = size.width > 0 && size.height > 0;

  return (
    <div ref={ref} className={cn('relative w-full min-w-0 overflow-hidden', className)} style={{ minHeight }}>
      {ready ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          {children}
        </ResponsiveContainer>
      ) : (
        <div className="grid h-full min-h-[inherit] place-items-center rounded-lg border border-t-border bg-t-panel text-xs font-semibold uppercase tracking-wide text-t-text-faint">
          {label}
        </div>
      )}
    </div>
  );
}
