import { Download, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
import { apiFetch } from '../lib/api';
import { useToast } from '../state/toast';

const departmentColumns = [
  { key: 'department', label: 'Department', colClassName: 'w-[45%]', widthClassName: 'min-w-[190px]' },
  { key: 'open', label: 'Open Cases', colClassName: 'w-[27%]', widthClassName: 'min-w-[120px]' },
  {
    key: 'slaRisk',
    label: 'SLA Risk',
    colClassName: 'w-[28%]',
    widthClassName: 'min-w-[120px]',
    render: (row) => <Badge tone={row.slaRisk > 8 ? 'High' : 'Medium'}>{row.slaRisk}</Badge>,
  },
];

export default function Analytics() {
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [charts, setCharts] = useState({
    complaintsByCategory: [],
    departmentLoad: [],
    monthlyComplaintVolume: [],
    resolutionTimeTrend: [],
    sentimentTrend: [],
    sourceMix: [],
  });

  const loadCharts = useCallback(async () => {
    const raw = await apiFetch('/analytics/charts');
    const next = {
      complaintsByCategory: (raw.complaints_by_category ?? []).map((item) => ({ category: item.name, complaints: item.value })),
      departmentLoad: (raw.department_load ?? []).map((item) => ({
        department: item.department,
        open: item.cases,
        slaRisk: Math.max(1, Math.round((100 - Number(item.confidence || 0)) / 4)),
      })),
      monthlyComplaintVolume: (raw.monthly_complaint_volume ?? []).map((item) => ({ month: item.month, complaints: item.complaints, solved: item.solved ?? 0 })),
      resolutionTimeTrend: (raw.resolution_time_trend ?? []).map((item) => ({ week: item.month, hours: item.hours, target: 8 })),
      sentimentTrend: (raw.sentiment_trend ?? []).map((item) => ({
        day: item.month,
        negative: item.negative ?? 0,
        frustrated: item.frustrated ?? 0,
        neutral: item.neutral ?? 0,
      })),
      sourceMix: (raw.source_mix ?? []).map((item) => ({ source: item.name, volume: item.value })),
    };
    setCharts(next);
    return next;
  }, []);

  useEffect(() => {
    loadCharts().catch(() => {});
  }, [loadCharts]);

  const refresh = async () => {
    setRefreshing(true);
    toast.info('Refreshing analytics', 'Recalculating complaint intelligence from the database.', { durationMs: 2200 });
    try {
      await loadCharts();
      toast.success('Analytics updated', 'Dashboard data refreshed from PostgreSQL.', { durationMs: 2600 });
    } catch (error) {
      toast.error('Refresh failed', error.message || 'Analytics could not be refreshed.', { durationMs: 3600 });
    } finally {
      setRefreshing(false);
    }
  };

  const exportDataset = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      ...charts,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaint-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export ready', 'Analytics dataset downloaded as JSON.', { durationMs: 2600 });
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
          <Button variant="secondary" icon={Download} onClick={exportDataset}>
            Export Dataset
          </Button>
          <Button icon={RefreshCw} onClick={refresh} loading={refreshing} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {refreshing ? <Loader label="Re-indexing analytics..." /> : null}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <ChartCard title="Monthly Complaint Volume" eyebrow="Intake and closures">
          <ChartFrame className="h-80" minHeight={320}>
              <AreaChart data={charts.monthlyComplaintVolume}>
                <XAxis dataKey="month" stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }} />
                <Area type="monotone" dataKey="complaints" stroke="var(--t-accent)" fill="var(--t-accent)" fillOpacity={0.18} strokeWidth={3} />
                <Area type="monotone" dataKey="solved" stroke="var(--t-text-muted)" fill="var(--t-text-muted)" fillOpacity={0.12} strokeWidth={3} />
              </AreaChart>
          </ChartFrame>
        </ChartCard>

        <ChartCard title="Source Mix" eyebrow="Connected app intake">
          <ChartFrame className="h-80" minHeight={320}>
              <BarChart data={charts.sourceMix}>
                <CartesianGrid stroke="var(--t-border)" vertical={false} />
                <XAxis dataKey="source" stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'var(--t-accent-subtle)' }} contentStyle={{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }} />
                <Bar dataKey="volume" fill="var(--t-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
          </ChartFrame>
        </ChartCard>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <ChartCard title="Sentiment Trend" eyebrow="Negative and frustrated pressure">
          <ChartFrame className="h-72" minHeight={288}>
              <LineChart data={charts.sentimentTrend}>
                <XAxis dataKey="day" stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }} />
                <Line type="monotone" dataKey="negative" stroke="var(--t-error)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="frustrated" stroke="var(--t-warning)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="neutral" stroke="var(--t-text-muted)" strokeWidth={3} dot={false} />
              </LineChart>
          </ChartFrame>
        </ChartCard>

        <ChartCard title="Resolution Time" eyebrow="Actual vs target">
          <ChartFrame className="h-72" minHeight={288}>
              <LineChart data={charts.resolutionTimeTrend}>
                <XAxis dataKey="week" stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }} />
                <Line type="monotone" dataKey="hours" stroke="var(--t-error)" strokeWidth={3} dot={{ fill: 'var(--t-error)', r: 4 }} />
                <Line type="monotone" dataKey="target" stroke="var(--t-text-muted)" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              </LineChart>
          </ChartFrame>
        </ChartCard>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]">
        <ChartCard title="Category Ranking" eyebrow="Classification leaders" className="min-w-0 overflow-hidden">
          <ChartFrame className="h-[24rem]" minHeight={360}>
              <BarChart data={charts.complaintsByCategory} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                <XAxis type="number" stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="category" stroke="var(--t-text-muted)" tickLine={false} axisLine={false} width={126} />
                <Tooltip cursor={{ fill: 'var(--t-accent-subtle)' }} contentStyle={{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }} />
                <Bar dataKey="complaints" fill="var(--t-accent-dark)" radius={[0, 8, 8, 0]} barSize={30} />
              </BarChart>
          </ChartFrame>
        </ChartCard>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader title="Department Load" eyebrow="Open cases and SLA risk" />
          <CardBody>
            <Table columns={departmentColumns} rows={charts.departmentLoad} rowKey="department" tableMinWidth="min-w-[520px]" />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
