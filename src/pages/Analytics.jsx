import { Download, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Card, { CardBody, CardHeader } from '../components/Card';
import ChartFrame from '../components/ChartFrame';
import ChartCard from '../components/ChartCard';
import Loader from '../components/Loader';
import Table from '../components/Table';
import { apiDownload, apiFetch } from '../lib/api';
import { useToast } from '../state/toast';

const departmentColumns = [
  { key: 'department', label: 'Department', colClassName: 'w-[45%]', widthClassName: 'min-w-[190px]' },
  { key: 'cases', label: 'Cases', colClassName: 'w-[27%]', widthClassName: 'min-w-[120px]' },
  {
    key: 'confidence',
    label: 'Avg. Confidence',
    colClassName: 'w-[28%]',
    widthClassName: 'min-w-[140px]',
    render: (row) => <Badge>{`${row.confidence}%`}</Badge>,
  },
];

const emptyCharts = {
  complaintsByCategory: [],
  departmentLoad: [],
  monthlyComplaintVolume: [],
  priorityDistribution: [],
  resolutionTimeTrend: [],
  sentimentTrend: [],
  sourceMix: [],
};

const emptySummary = {
  total: 0,
  solved: 0,
  pending: 0,
  failed: 0,
  highPriority: 0,
  critical: 0,
  avgConfidence: 0,
  avgResolutionHours: 0,
};

function EmptyChart({ label = 'No analytics data yet', minHeight = 288 }) {
  return (
    <div className="grid place-items-center rounded-lg border border-t-border bg-t-panel p-6 text-center text-sm text-t-text-muted" style={{ minHeight }}>
      {label}
    </div>
  );
}

function ChartSlot({ data, className, minHeight, children, emptyLabel }) {
  if (!data.length) return <EmptyChart label={emptyLabel} minHeight={minHeight} />;
  return (
    <ChartFrame className={className} minHeight={minHeight}>
      {children}
    </ChartFrame>
  );
}

function MetricCard({ label, value, hint }) {
  return (
    <Card>
      <CardBody>
        <p className="label-caps text-t-text-muted">{label}</p>
        <p className="mt-3 font-display text-3xl font-black text-t-text">{value}</p>
        {hint ? <p className="mt-2 text-sm text-t-text-muted">{hint}</p> : null}
      </CardBody>
    </Card>
  );
}

export default function Analytics() {
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [summary, setSummary] = useState(emptySummary);
  const [charts, setCharts] = useState(emptyCharts);
  const [uploadStats, setUploadStats] = useState({ batches: 0, processed: 0, failed: 0 });

  const loadAnalytics = useCallback(async () => {
    const [dashboardRaw, chartsRaw, uploadsRaw] = await Promise.all([
      apiFetch('/analytics/dashboard'),
      apiFetch('/analytics/charts'),
      apiFetch('/uploads'),
    ]);

    const nextSummary = {
      total: dashboardRaw.total ?? 0,
      solved: dashboardRaw.solved ?? dashboardRaw.resolved ?? 0,
      pending: dashboardRaw.pending ?? 0,
      failed: dashboardRaw.analysis_failed ?? dashboardRaw.in_progress ?? 0,
      highPriority: dashboardRaw.high_priority ?? 0,
      critical: dashboardRaw.critical ?? 0,
      avgConfidence: dashboardRaw.avg_confidence ?? 0,
      avgResolutionHours: dashboardRaw.avg_resolution_hours ?? 0,
    };

    const nextCharts = {
      complaintsByCategory: (chartsRaw.complaints_by_category ?? []).map((item) => ({ category: item.name, complaints: item.value })),
      departmentLoad: (chartsRaw.department_load ?? []).map((item) => ({
        department: item.department,
        cases: item.cases,
        confidence: Number(item.confidence || 0),
      })),
      monthlyComplaintVolume: (chartsRaw.monthly_complaint_volume ?? []).map((item) => ({ month: item.month, complaints: item.complaints, solved: item.solved ?? 0 })),
      priorityDistribution: (chartsRaw.priority_distribution ?? []).map((item) => ({ priority: item.name, complaints: item.value })),
      resolutionTimeTrend: (chartsRaw.resolution_time_trend ?? []).map((item) => ({ week: item.month, hours: item.hours, target: 8 })),
      sentimentTrend: (chartsRaw.sentiment_trend ?? []).map((item) => ({
        day: item.month,
        negative: item.negative ?? 0,
        frustrated: item.frustrated ?? 0,
        neutral: item.neutral ?? 0,
        positive: item.positive ?? 0,
      })),
      sourceMix: (chartsRaw.source_mix ?? []).map((item) => ({ source: item.name, volume: item.value })),
    };

    const uploads = uploadsRaw ?? [];
    setSummary(nextSummary);
    setCharts(nextCharts);
    setUploadStats({
      batches: uploads.length,
      processed: uploads.reduce((sum, item) => sum + Number(item.processed_rows || 0), 0),
      failed: uploads.reduce((sum, item) => sum + Number(item.failed_rows || 0), 0),
    });
    return { summary: nextSummary, charts: nextCharts };
  }, []);

  useEffect(() => {
    loadAnalytics().catch(() => {
      setSummary(emptySummary);
      setCharts(emptyCharts);
      setUploadStats({ batches: 0, processed: 0, failed: 0 });
    });
  }, [loadAnalytics]);

  const hasData = summary.total > 0;

  const metricCards = useMemo(() => [
    { label: 'Total Complaints', value: summary.total.toLocaleString(), hint: 'Stored records' },
    { label: 'Solved', value: summary.solved.toLocaleString(), hint: 'AI analyzed' },
    { label: 'Pending Analysis', value: summary.pending.toLocaleString(), hint: 'Awaiting AI review' },
    { label: 'Analysis Failed', value: summary.failed.toLocaleString(), hint: 'Retry needed' },
    { label: 'Avg. Confidence', value: `${summary.avgConfidence}%`, hint: 'Analyzed records' },
    { label: 'Upload Batches', value: uploadStats.batches.toLocaleString(), hint: `${uploadStats.processed.toLocaleString()} rows processed` },
  ], [summary, uploadStats]);

  const refresh = async () => {
    setRefreshing(true);
    toast.info('Refreshing analytics', 'Recalculating complaint intelligence from PostgreSQL.', { durationMs: 2200 });
    try {
      await loadAnalytics();
      toast.success('Analytics updated', 'Dashboard data refreshed from PostgreSQL.', { durationMs: 2600 });
    } catch (error) {
      toast.error('Refresh failed', error.message || 'Analytics could not be refreshed.', { durationMs: 3600 });
    } finally {
      setRefreshing(false);
    }
  };

  const downloadWorkbook = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `analytics_report_${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportAnalytics = async () => {
    setExporting(true);
    try {
      const { blob, filename } = await apiDownload('/analytics/export', { timeoutMs: 60000 });
      downloadWorkbook(blob, filename);
      toast.success('Export ready', 'Analytics report downloaded as an Excel workbook.', { durationMs: 2800 });
    } catch (error) {
      toast.error('Export failed', error.message || 'Analytics could not be exported.', { durationMs: 4200 });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-t-accent">Enterprise Analytics</p>
          <h1 className="mt-2 font-display text-3xl font-black text-t-text sm:text-4xl">Complaint Intelligence</h1>
          <p className="mt-2 max-w-3xl text-t-text-muted">Category volume, customer sentiment, resolution trends, intake sources, and department SLA pressure.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon={Download} onClick={exportAnalytics} loading={exporting} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export Analytics'}
          </Button>
          <Button icon={RefreshCw} onClick={refresh} loading={refreshing} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {refreshing ? <Loader label="Re-indexing analytics..." /> : null}

      {!hasData ? (
        <Card className="border-dashed border-t-border bg-t-panel">
          <CardBody className="py-10 text-center">
            <h2 className="font-display text-xl font-bold text-t-text">No analytics data yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-t-text-muted">
              Upload or create complaints to populate database-backed analytics. No demo analytics are shown.
            </p>
          </CardBody>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {metricCards.map((item) => <MetricCard key={item.label} {...item} />)}
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <ChartCard title="Monthly Complaint Volume" eyebrow="Intake and closures">
          <ChartSlot data={charts.monthlyComplaintVolume} className="h-80" minHeight={320} emptyLabel="No volume trend data yet">
            <AreaChart data={charts.monthlyComplaintVolume}>
              <XAxis dataKey="month" stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }} />
              <Area type="monotone" dataKey="complaints" stroke="var(--t-accent)" fill="var(--t-accent)" fillOpacity={0.18} strokeWidth={3} />
              <Area type="monotone" dataKey="solved" stroke="var(--t-text-muted)" fill="var(--t-text-muted)" fillOpacity={0.12} strokeWidth={3} />
            </AreaChart>
          </ChartSlot>
        </ChartCard>

        <ChartCard title="Source Mix" eyebrow="Connected app intake">
          <ChartSlot data={charts.sourceMix} className="h-80" minHeight={320} emptyLabel="No source data yet">
            <BarChart data={charts.sourceMix}>
              <CartesianGrid stroke="var(--t-border)" vertical={false} />
              <XAxis dataKey="source" stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'var(--t-accent-subtle)' }} contentStyle={{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }} />
              <Bar dataKey="volume" fill="var(--t-accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartSlot>
        </ChartCard>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <ChartCard title="Sentiment Trend" eyebrow="Customer pressure">
          <ChartSlot data={charts.sentimentTrend} className="h-72" minHeight={288} emptyLabel="No sentiment trend data yet">
            <LineChart data={charts.sentimentTrend}>
              <XAxis dataKey="day" stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }} />
              <Line type="monotone" dataKey="negative" stroke="var(--t-error)" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="frustrated" stroke="var(--t-warning)" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="neutral" stroke="var(--t-text-muted)" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="positive" stroke="var(--t-success)" strokeWidth={3} dot={false} />
            </LineChart>
          </ChartSlot>
        </ChartCard>

        <ChartCard title="Resolution Time" eyebrow="Actual vs target">
          <ChartSlot data={charts.resolutionTimeTrend} className="h-72" minHeight={288} emptyLabel="No resolution trend data yet">
            <LineChart data={charts.resolutionTimeTrend}>
              <XAxis dataKey="week" stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }} />
              <Line type="monotone" dataKey="hours" stroke="var(--t-error)" strokeWidth={3} dot={{ fill: 'var(--t-error)', r: 4 }} />
              <Line type="monotone" dataKey="target" stroke="var(--t-text-muted)" strokeDasharray="4 4" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartSlot>
        </ChartCard>
      </div>

      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        <ChartCard title="Category Ranking" eyebrow="Classification leaders" className="min-w-0 overflow-hidden">
          <ChartSlot data={charts.complaintsByCategory} className="h-80" minHeight={320} emptyLabel="No category data yet">
            <BarChart data={charts.complaintsByCategory} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
              <XAxis type="number" stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="category" stroke="var(--t-text-muted)" tickLine={false} axisLine={false} width={126} />
              <Tooltip cursor={{ fill: 'var(--t-accent-subtle)' }} contentStyle={{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }} />
              <Bar dataKey="complaints" fill="var(--t-accent-dark)" radius={[0, 8, 8, 0]} barSize={30} />
            </BarChart>
          </ChartSlot>
        </ChartCard>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader title="Department Distribution" eyebrow="Database workload" />
          <CardBody className="min-w-0">
            {charts.departmentLoad.length ? (
              <Table columns={departmentColumns} rows={charts.departmentLoad} rowKey="department" tableMinWidth="min-w-[520px]" />
            ) : (
              <div className="grid min-h-80 place-items-center rounded-lg border border-t-border bg-t-panel p-8 text-center text-sm text-t-text-muted">No department data yet.</div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
