import { Download, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Card, { CardBody, CardHeader } from '../components/Card';
import ChartCard from '../components/ChartCard';
import Table from '../components/Table';
import { allocation, neuralPrediction, systemLoad, threatDensity, topVectors } from '../data/analytics';
import Loader from '../components/Loader';
import { useToast } from '../state/toast';

const vectorColumns = [
  { key: 'source', label: 'Vector' },
  { key: 'region', label: 'Region' },
  { key: 'severity', label: 'Severity', render: (row) => <Badge tone={row.severity}>{row.severity}</Badge> },
  { key: 'volume', label: 'Volume' },
];

const colors = ['#dc2626', '#991b1b', '#52525b', '#27272a'];

export default function Analytics() {
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    toast.info('Refreshing engine', 'Pulling latest intelligence signals…', { durationMs: 2400 });
    await new Promise((r) => setTimeout(r, 1300));
    setRefreshing(false);
    toast.success('Analytics updated', 'Dashboards refreshed successfully.', { durationMs: 2600 });
  };

  const exportDataset = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      topVectors,
      allocation,
      neuralPrediction,
      systemLoad,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export ready', 'Dataset downloaded as JSON.', { durationMs: 2600 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-crimson-500">Neural Intelligence</p>
          <h1 className="mt-2 font-display text-4xl font-black text-white">Analytics Intelligence</h1>
          <p className="mt-2 text-zinc-400">Density maps, prediction curves, system load, and target vectors.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon={Download} onClick={exportDataset}>
            Export Dataset
          </Button>
          <Button icon={RefreshCw} onClick={refresh} loading={refreshing} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh Engine'}
          </Button>
        </div>
      </div>

      {refreshing ? <Loader label="Re-indexing analytics…" /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartCard title="Threat Density Heatmap" eyebrow="Live complaint pressure">
          <div className="grid grid-cols-7 gap-2">
            {threatDensity.flatMap((row, rowIndex) =>
              row.map((value, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="aspect-square rounded-md border border-white/5"
                  style={{ backgroundColor: `rgba(220, 38, 38, ${Math.max(value / 110, 0.16)})` }}
                  title={`${value}% density`}
                />
              )),
            )}
          </div>
        </ChartCard>

        <ChartCard title="Neural Prediction" eyebrow="Projected escalation">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={neuralPrediction}>
                <XAxis dataKey="name" stroke="#71717a" tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#111113', border: '1px solid #2a2a2a', color: '#fff' }} />
                <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="System Load Variance" eyebrow="Core services" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={systemLoad}>
                <XAxis dataKey="name" stroke="#71717a" tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#111113', border: '1px solid #2a2a2a', color: '#fff' }} />
                <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#dc2626', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Asset Allocation" eyebrow="Response tiers">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={allocation} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
                  {allocation.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111113', border: '1px solid #2a2a2a', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <Card>
        <CardHeader title="Top Target Intelligence Vectors" eyebrow="Ranked complaint sources" />
        <CardBody>
          <Table columns={vectorColumns} rows={topVectors} rowKey="source" />
        </CardBody>
      </Card>
    </div>
  );
}
