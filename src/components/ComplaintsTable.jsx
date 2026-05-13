import { BrainCircuit, Eye, RotateCcw } from 'lucide-react';
import Badge from './Badge';
import Button from './Button';
import Table from './Table';

function isAnalyzed(row) {
  return row.status === 'Solved' && Boolean(row.category && row.priority && row.sentiment && row.confidence != null);
}

function confidenceText(value) {
  if (value == null || value === '') return '';
  const numeric = Number(value);
  const percent = numeric <= 1 ? numeric * 100 : numeric;
  return `${percent.toFixed(0)}%`;
}

function AnalysisCell({ row }) {
  if (!isAnalyzed(row)) {
    const failed = row.status === 'Analysis Failed';
    return (
      <div className="min-w-0 space-y-1">
        <Badge>{failed ? 'Analysis Failed' : 'Not Analyzed'}</Badge>
        <p className="truncate text-xs text-t-text-muted">{failed ? 'Retry AI analysis' : 'Pending AI review'}</p>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 flex-wrap gap-1.5">
        <Badge className="max-w-full">{row.category}</Badge>
        <Badge>{row.priority}</Badge>
        <Badge>{row.sentiment}</Badge>
      </div>
      <p className="mt-1 text-xs font-semibold text-t-text-muted">{confidenceText(row.confidence)} confidence</p>
    </div>
  );
}

export default function ComplaintsTable({
  rows,
  onView,
  onAnalyze,
  analyzingId = '',
  sort,
  onSort,
}) {
  const sortable = Boolean(onSort);
  const columns = [
    {
      key: 'id',
      label: 'Case',
      sortable,
      sticky: 'left',
      colClassName: 'w-[112px]',
      widthClassName: 'min-w-[112px] max-w-[112px]',
      cellClassName: 'font-display font-bold text-t-text',
    },
    {
      key: 'customer_name',
      label: 'Customer',
      sortable,
      colClassName: 'w-[140px]',
      widthClassName: 'min-w-[140px] max-w-[140px]',
      cellClassName: 'font-semibold text-t-text',
      render: (row) => (
        <span title={row.customer_name} className="block truncate">
          {row.customer_name}
        </span>
      ),
    },
    {
      key: 'complaint_text',
      label: 'Complaint',
      colClassName: 'w-[220px]',
      widthClassName: 'min-w-[220px] max-w-[220px]',
      render: (row) => (
        <span title={row.complaint_text} className="block truncate text-t-text">
          {row.complaint_text}
        </span>
      ),
    },
    {
      key: 'analysis',
      label: 'Analysis',
      colClassName: 'w-[220px]',
      widthClassName: 'min-w-[220px] max-w-[220px]',
      render: (row) => <AnalysisCell row={row} />,
    },
    {
      key: 'status',
      label: 'Status',
      sortable,
      colClassName: 'w-[140px]',
      widthClassName: 'min-w-[140px] max-w-[140px]',
      render: (row) => <Badge>{row.status}</Badge>,
    },
    {
      key: 'actions',
      label: 'Action',
      colClassName: 'w-[180px]',
      widthClassName: 'min-w-[180px] max-w-[180px]',
      render: (row) => {
        const isLoading = analyzingId === row.id;
        const analyzed = isAnalyzed(row);
        const failed = row.status === 'Analysis Failed';
        const actionLabel = failed ? 'Retry Analysis' : analyzed ? 'View Analysis' : 'Analyze';
        const Icon = failed ? RotateCcw : analyzed ? Eye : BrainCircuit;

        return (
          <Button
            size="sm"
            variant={analyzed ? 'ghost' : 'secondary'}
            icon={Icon}
            loading={isLoading}
            disabled={isLoading}
            className="w-full whitespace-nowrap px-2.5"
            onClick={(event) => {
              event.stopPropagation();
              if (analyzed) onView?.(row);
              else onAnalyze?.(row);
            }}
          >
            {isLoading ? 'Analyzing...' : actionLabel}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="min-w-0 max-w-full">
      <Table
        columns={columns}
        rows={rows}
        onRowClick={onView}
        sort={sort}
        onSort={onSort}
        tableMinWidth="min-w-[1012px]"
        className="min-w-0 max-w-full"
      />
    </div>
  );
}
