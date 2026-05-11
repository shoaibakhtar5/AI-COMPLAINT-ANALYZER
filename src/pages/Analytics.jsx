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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Card, { CardBody, CardHeader } from '../components/Card';
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
      monthlyComplaintVolume: (raw.monthly_complaint_volume ?? []).map((item) => ({ month: item.month, complaints: item.complaints, resolved: item.resolved ?? 0 })),
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
    void loadCharts();
  }, [loadCharts]);

  const refresh = async () => {
    setRefreshing(true);
    toast.info('Refreshing analytics', 'Recalculating complaint intelligence from the database.', { durationMs: 2200 });
    try {
      await loadCharts();
      toast.success('Analytics updated', 'Dashboard data refreshed from PostgreSQL.', { durationMs: 2600 });
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
          <p className="label-caps text-crimson-500">Enterprise Analytics</p>
          <h1 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">Complaint Intelligence</h1>
          <p className="mt-2 max-w-3xl text-zinc-400">Category volume, customer sentiment, resolution trends, intake sources, and department SLA pressure.</p>
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

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <ChartCard title="Monthly Complaint Volume" eyebrow="Intake and closures">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyComplaintVolume}>
                <XAxis dataKey="month" stroke="#71717a" tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#111113', border: '1px solid #2a2a2a', color: '#fff' }} />
                <Area type="monotone" dataKey="complaints" stroke="#dc2626" fill="#dc2626" fillOpacity={0.18} strokeWidth={3} />
                <Area type="monotone" dataKey="resolved" stroke="#71717a" fill="#71717a" fillOpacity={0.12} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Source Mix" eyebrow="Connected app intake">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.sourceMix}>
                <CartesianGrid stroke="#2a2a2a" vertical={false} />
                <XAxis dataKey="source" stroke="#71717a" tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(220,38,38,0.08)' }} contentStyle={{ background: '#111113', border: '1px solid #2a2a2a', color: '#fff' }} />
                <Bar dataKey="volume" fill="#dc2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Sentiment Trend" eyebrow="Negative and frustrated pressure">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.sentimentTrend}>
                <XAxis dataKey="day" stroke="#71717a" tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#111113', border: '1px solid #2a2a2a', color: '#fff' }} />
                <Line type="monotone" dataKey="negative" stroke="#dc2626" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="frustrated" stroke="#f97316" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="neutral" stroke="#71717a" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Resolution Time" eyebrow="Actual vs target">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.resolutionTimeTrend}>
                <XAxis dataKey="week" stroke="#71717a" tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#111113', border: '1px solid #2a2a2a', color: '#fff' }} />
                <Line type="monotone" dataKey="hours" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#dc2626', r: 4 }} />
                <Line type="monotone" dataKey="target" stroke="#71717a" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]">
        <ChartCard title="Category Ranking" eyebrow="Classification leaders" className="min-w-0 overflow-hidden">
          <div className="h-[24rem] min-h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.complaintsByCategory} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                <XAxis type="number" stroke="#71717a" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="category" stroke="#71717a" tickLine={false} axisLine={false} width={126} />
                <Tooltip cursor={{ fill: 'rgba(220,38,38,0.08)' }} contentStyle={{ background: '#111113', border: '1px solid #2a2a2a', color: '#fff' }} />
                <Bar dataKey="complaints" fill="#991b1b" radius={[0, 8, 8, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
