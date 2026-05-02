import { cn } from '../utils/cn';

export default function Table({ columns, rows, className, rowKey = 'id', onRowClick, sort, onSort }) {
  return (
    <div className={cn('overflow-x-auto rounded-lg border border-white/10', className)}>
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-black/30">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase text-zinc-500',
                  column.sortable && 'select-none',
                )}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => onSort?.(column.key)}
                    className="group inline-flex items-center gap-2 transition hover:text-white"
                  >
                    <span>{column.label}</span>
                    {sort?.key === column.key ? (
                      <span className="text-[10px] font-black text-crimson-400">{sort.dir === 'asc' ? '▲' : '▼'}</span>
                    ) : (
                      <span className="text-[10px] font-black text-zinc-700 transition group-hover:text-zinc-400">▲▼</span>
                    )}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-panel/70">
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={() => onRowClick?.(row)}
              className={cn('transition hover:bg-white/[0.035]', onRowClick && 'cursor-pointer')}
            >
              {columns.map((column) => (
                <td key={column.key} className={cn('px-4 py-4 text-sm text-zinc-300', column.wrap ? 'min-w-72 whitespace-normal leading-6' : 'whitespace-nowrap', column.cellClassName)}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
