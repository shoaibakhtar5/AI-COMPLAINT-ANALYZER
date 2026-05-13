import { cn } from '../utils/cn';

// Semantic status tones use CSS variable-aware classes so they work across themes
const tones = {
  Critical:        'border-t-error/50   bg-t-error-subtle   text-t-error',
  Escalated:       'border-t-error/50   bg-t-error-subtle   text-t-error',
  Pending:         'border-t-warning/40 bg-t-warning-subtle text-t-warning',
  'Pending Analysis': 'border-t-warning/40 bg-t-warning-subtle text-t-warning',
  'Not Analyzed':  'border-t-border    bg-t-panel         text-t-text-muted',
  'In Progress':   'border-t-info/40   bg-t-info-subtle   text-t-info',
  'Analysis Failed': 'border-t-error/50 bg-t-error-subtle text-t-error',
  Active:          'border-t-warning/40 bg-t-warning-subtle text-t-warning',
  Investigating:   'border-t-info/40   bg-t-info-subtle   text-t-info',
  Queued:          'border-t-border    bg-t-panel         text-t-text-muted',
  Solved:          'border-t-success/40 bg-t-success-subtle text-t-success',
  Negative:        'border-t-error/50   bg-t-error-subtle   text-t-error',
  Frustrated:      'border-t-warning/40 bg-t-warning-subtle text-t-warning',
  Concerned:       'border-t-warning/40 bg-t-warning-subtle text-t-warning',
  Positive:        'border-t-success/40 bg-t-success-subtle text-t-success',
  Neutral:         'border-t-border    bg-t-panel         text-t-text-muted',
  High:            'border-t-error/50   bg-t-error-subtle   text-t-error',
  Medium:          'border-t-warning/40 bg-t-warning-subtle text-t-warning',
  Low:             'border-t-success/40 bg-t-success-subtle text-t-success',
  Connected:       'border-t-success/40 bg-t-success-subtle text-t-success',
  Healthy:         'border-t-success/40 bg-t-success-subtle text-t-success',
  'Review Needed': 'border-t-warning/40 bg-t-warning-subtle text-t-warning',
  Completed:       'border-t-success/40 bg-t-success-subtle text-t-success',
};

export default function Badge({ children, tone, className }) {
  const key = tone || children;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        tones[key] || 'border-t-border bg-t-panel text-t-text-muted',
        className,
      )}
    >
      {children}
    </span>
  );
}
