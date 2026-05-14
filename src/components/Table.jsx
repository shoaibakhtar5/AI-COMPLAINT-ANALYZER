import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../utils/cn';

const MotionTr = motion.tr;

export default function Table({ columns, rows, className, tableClassName, tableMinWidth = 'min-w-[900px]', rowKey = 'id', onRowClick, sort, onSort, density = 'normal' }) {
  const reduceMotion = useReducedMotion();
  const hasColumnWidths = columns.some((column) => column.colClassName);
  const dense = density === 'dense';

  const headerCellClass = (column) =>
    cn(
      'whitespace-nowrap px-5 text-left text-xs font-bold uppercase tracking-[0.14em] text-t-text-muted',
      dense ? 'py-3' : 'py-4',
      'border-b border-t-border bg-t-panel backdrop-blur-xl',
      column.sticky === 'left' && 'sticky left-0 z-30 shadow-[2px_0_0_var(--t-border)]',
      column.sticky === 'right' && 'sticky right-0 z-30 shadow-[-2px_0_0_var(--t-border)]',
      column.sticky === 'right-wide' && '2xl:sticky 2xl:right-0 2xl:z-30 2xl:shadow-[-2px_0_0_var(--t-border)]',
      column.headerClassName,
    );

  const bodyCellClass = (column) =>
    cn(
      'align-middle border-b border-t-border px-5 text-sm text-t-text-muted transition first:pl-6 last:pr-6',
      dense ? 'py-3' : 'py-5',
      'overflow-hidden text-ellipsis',
      column.widthClassName ?? 'min-w-[120px] max-w-[260px]',
      column.wrap ? 'whitespace-normal break-words leading-6' : 'whitespace-nowrap truncate',
      column.sticky === 'left' && 'sticky left-0 z-20 bg-t-panel shadow-[2px_0_0_var(--t-border)]',
      column.sticky === 'right' && 'sticky right-0 z-20 bg-t-panel shadow-[-2px_0_0_var(--t-border)]',
      column.sticky === 'right-wide' && '2xl:sticky 2xl:right-0 2xl:z-20 2xl:shadow-[-2px_0_0_var(--t-border)]',
      column.cellClassName,
    );

  const cellContent = (column, row) => {
    if (column.render) return column.render(row);
    const value = row[column.key];
    return typeof value === 'string' || typeof value === 'number' ? (
      <span title={String(value)} className="inline-block max-w-full">
        {value}
      </span>
    ) : (
      value
    );
  };

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-t-border bg-t-surface shadow-panel', className)}>
      <div className="overflow-x-auto overflow-y-hidden rounded-2xl premium-table-scrollbar">
        <table className={cn('w-full border-separate border-spacing-0', tableMinWidth, hasColumnWidths && 'table-fixed', tableClassName)}>
          {hasColumnWidths ? (
            <colgroup>
              {columns.map((column) => (
                <col key={column.key} className={column.colClassName} />
              ))}
            </colgroup>
          ) : null}
          <thead className="sticky top-0 z-20">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={headerCellClass(column)}>
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort?.(column.key)}
                      className="group inline-flex items-center gap-2 transition hover:text-t-text"
                    >
                      <span>{column.label}</span>
                      {sort?.key === column.key ? (
                        <span className="text-[10px] font-black text-t-accent">{sort.dir === 'asc' ? 'ASC' : 'DESC'}</span>
                      ) : (
                        <span className="text-[10px] font-black text-t-text-faint transition group-hover:text-t-text-muted">SORT</span>
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-t-border bg-t-surface">
            {rows.map((row, index) => (
              <MotionTr
                key={row[rowKey]}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: Math.min(index * 0.035, 0.22), ease: 'easeOut' }}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'transition-all duration-150 odd:bg-t-panel/40 hover:bg-t-accent-subtle hover:shadow-[inset_3px_0_0_var(--t-accent)]',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className={bodyCellClass(column)}>
                    {cellContent(column, row)}
                  </td>
                ))}
              </MotionTr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
