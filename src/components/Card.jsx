import { cn } from '../utils/cn';

export default function Card({ children, className, as: Component = 'section', ...props }) {
  const Element = Component;

  return (
    <Element
      className={cn(
        'rounded-xl border border-t-border bg-t-surface shadow-panel transition-all duration-200 ease-out',
        'motion-safe:transform-gpu motion-safe:hover:-translate-y-1',
        'hover:border-t-border-strong hover:shadow-[0_8px_32px_var(--t-shadow-strong)]',
        className,
      )}
      {...props}
    >
      {children}
    </Element>
  );
}

export function CardHeader({ eyebrow, title, action, children, className }) {
  return (
    <div className={cn('flex flex-col gap-3 border-b border-t-border p-5 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div>
        {eyebrow ? <p className="label-caps mb-2 text-t-accent">{eyebrow}</p> : null}
        {title ? <h2 className="font-display text-xl font-bold text-t-text">{title}</h2> : null}
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({ children, className }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
