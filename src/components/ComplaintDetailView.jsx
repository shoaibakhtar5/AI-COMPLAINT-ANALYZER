import { BrainCircuit, Building2, CalendarClock, FileText, Loader2, Timer } from 'lucide-react';
import Badge from './Badge';

function confidenceText(value) {
  if (value == null || value === '') return 'Not Analyzed';
  const numeric = Number(value);
  const percent = numeric <= 1 ? numeric * 100 : numeric;
  return `${percent.toFixed(1)}%`;
}

function formatDate(value) {
  if (!value) return 'Not Analyzed';
  return new Date(value).toLocaleString();
}

function isAnalyzed(complaint) {
  return complaint.status === 'Solved' && Boolean(complaint.category && complaint.priority && complaint.sentiment && complaint.confidence != null);
}

function DetailTile({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-lg border border-t-border bg-t-panel p-4">
      <div className="flex min-w-0 items-center gap-2 text-t-text-muted">
        {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
        <p className="label-caps min-w-0 truncate">{label}</p>
      </div>
      <p className="mt-2 break-words text-sm font-semibold leading-6 text-t-text">{value || 'Unassigned'}</p>
    </div>
  );
}

function AnalysisMetric({ label, value, badge }) {
  return (
    <div className="min-w-0 rounded-lg border border-t-border bg-t-surface p-4 text-center">
      <p className="label-caps truncate text-t-text-muted">{label}</p>
      {badge ? (
        <div className="mt-2 flex min-w-0 justify-center">
          <Badge className="max-w-full justify-center break-words text-center leading-5">{value || 'Not Analyzed'}</Badge>
        </div>
      ) : (
        <p className="mt-2 break-words font-display text-lg font-black leading-6 text-t-text">{value || 'Not Analyzed'}</p>
      )}
    </div>
  );
}

export default function ComplaintDetailView({ complaint, workspaceName = 'Workspace', analyzing = false }) {
  const analyzed = isAnalyzed(complaint);
  const failed = complaint.status === 'Analysis Failed';

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div className="rounded-lg border border-t-border bg-t-panel p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="label-caps text-t-accent">Complaint profile</p>
            <h3 className="mt-2 break-words font-display text-2xl font-black text-t-text">{complaint.customer_name}</h3>
            <p className="mt-2 break-words text-sm leading-6 text-t-text-muted">{workspaceName} - {complaint.source}</p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Badge>{complaint.status}</Badge>
            {!analyzed ? <Badge>Not Analyzed</Badge> : null}
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DetailTile label="Source" value={complaint.source} icon={Building2} />
        <DetailTile label="Received" value={formatDate(complaint.created_at || complaint.createdAt)} icon={CalendarClock} />
        <DetailTile label="Department" value={analyzed ? complaint.department : 'Unassigned'} icon={FileText} />
        <DetailTile label="Analyzed At" value={analyzed ? formatDate(complaint.analyzed_at) : 'Not Analyzed'} icon={Timer} />
      </div>

      {!analyzed ? (
        <section className="rounded-lg border border-t-warning/20 bg-t-warning-subtle p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="label-caps text-t-warning">{failed ? 'Analysis failed' : 'Pending AI review'}</p>
              <p className="mt-2 text-sm leading-6 text-t-text-muted">
                {failed
                  ? complaint.ai_explanation || 'The AI model could not analyze this complaint. Retry analysis when ready.'
                  : 'This complaint has not been analyzed yet.'}
              </p>
            </div>
            {analyzing ? (
              <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-t-warning">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </div>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-t-accent/20 bg-t-accent-subtle p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="label-caps text-t-accent">AI analysis</p>
              <p className="mt-1 text-sm text-t-text-muted">Persisted classifier result for this saved complaint.</p>
            </div>
            {analyzing ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-t-accent">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <AnalysisMetric label="Category" value={complaint.category} badge />
            <AnalysisMetric label="Department" value={complaint.department} />
            <AnalysisMetric label="Sentiment" value={complaint.sentiment} badge />
            <AnalysisMetric label="Priority" value={complaint.priority} badge />
            <AnalysisMetric label="Confidence" value={confidenceText(complaint.confidence)} />
            <AnalysisMetric label="Status" value={complaint.status} badge />
          </div>

          <div className="mt-4 rounded-lg border border-t-border bg-t-surface p-4">
            <p className="label-caps text-t-text-muted">Explanation</p>
            <p className="mt-2 break-words text-sm leading-6 text-t-text-muted">
              {complaint.ai_explanation || 'No AI explanation has been recorded yet.'}
            </p>
          </div>
        </section>
      )}

      <div className="grid min-w-0 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-t-border bg-t-panel p-5">
          <p className="label-caps">Complaint text</p>
          <p className="mt-3 break-words text-sm leading-7 text-t-text">{complaint.complaint_text}</p>
        </section>
        <section className="rounded-lg border border-t-border bg-t-panel p-5">
          <p className="label-caps">Notes</p>
          <p className="mt-3 break-words text-sm leading-7 text-t-text-muted">
            {complaint.notes || 'No internal notes captured yet.'}
          </p>
        </section>
      </div>
    </div>
  );
}
