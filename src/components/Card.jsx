import { cn } from '../utils/cn';

export default function Card({ children, className, as: Component = 'section', ...props }) {
  const Element = Component;

  return (
    <Element
      className={cn('rounded-lg border border-white/10 bg-panel/95 shadow-panel', className)}
      {...props}
    >
      {children}
    </Element>
  );
}

export function CardHeader({ eyebrow, title, action, children, className }) {
  return (
    <div className={cn('flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div>
        {eyebrow ? <p className="label-caps mb-2 text-crimson-500">{eyebrow}</p> : null}
        {title ? <h2 className="font-display text-xl font-bold text-white">{title}</h2> : null}
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({ children, className }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
