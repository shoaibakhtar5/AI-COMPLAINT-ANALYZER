import { Download, Plus, ShieldAlert, TrendingUp, Zap } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Modal from '../components/Modal';
import { useComplaints } from '../state/complaints';
import { useToast } from '../state/toast';
import { dashboardStats, incidentVelocity, liveSignals } from '../data/stats';

const columns = [
  { key: 'id', label: 'Case' },
  { key: 'subject', label: 'Complaint' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
  { key: 'risk', label: 'AI Risk', render: (row) => <span className="font-display font-bold text-white">{row.risk}</span> },
  { key: 'updatedAt', label: 'Updated' },
];

export default function Dashboard() {
  const toast = useToast();
  const navigate = useNavigate();
  const db = useComplaints();
  const [selected, setSelected] = useState(null);

  const exportReport = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      totals: { complaints: db.items.length },
      sample: db.items.slice(0, 8),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export ready', 'Report downloaded as JSON.', { durationMs: 2600 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-crimson-500">Operational Overview</p>
          <h1 className="mt-2 font-display text-4xl font-black text-white">Security Command</h1>
          <p className="mt-2 text-zinc-400">Real-time complaint intelligence, escalation pressure, and AI resolution signals.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon={Download} onClick={exportReport}>
            Export Report
          </Button>
          <Button
            icon={Plus}
            onClick={() => {
              toast.info('New incident', 'Routing to the submission portal…', { durationMs: 1800 });
              navigate('/submit');
            }}
          >
            New Incident
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <div className="mb-4 flex items-center justify-between">
                <span className="label-caps text-zinc-500">{stat.label}</span>
                <Zap className="h-4 w-4 text-crimson-500" />
              </div>
              <p className="font-display text-3xl font-black text-white">{stat.value}</p>
              <p className={`mt-2 text-sm ${stat.tone === 'success' ? 'text-emerald-400' : stat.tone === 'warning' ? 'text-amber-400' : 'text-crimson-400'}`}>
                {stat.change} from last cycle
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <ChartCard title="Incident Velocity" eyebrow="Seven-day signal density">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentVelocity}>
                <CartesianGrid stroke="#2a2a2a" vertical={false} />
                <XAxis dataKey="day" stroke="#71717a" tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(220,38,38,0.08)' }} contentStyle={{ background: '#111113', border: '1px solid #2a2a2a', color: '#fff' }} />
                <Bar dataKey="active" fill="#3f3f46" radius={[6, 6, 0, 0]} />
                <Bar dataKey="critical" fill="#dc2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <Card>
          <CardHeader title="AI Threat Lab" eyebrow="Active recommendations" />
          <CardBody className="space-y-4">
            <div className="rounded-lg border border-crimson-600/25 bg-crimson-600/10 p-4">
              <div className="mb-3 flex items-center gap-2 text-crimson-300">
                <ShieldAlert className="h-5 w-5" />
                <span className="label-caps">Protocol alert</span>
              </div>
              <p className="text-sm leading-6 text-zinc-300">
                Privacy exposure complaints are clustering around account verification scripts. Recommend policy patch.
              </p>
            </div>
            {liveSignals.map((signal) => (
              <div key={signal} className="flex items-start gap-3 rounded-lg bg-black/25 p-3">
                <TrendingUp className="mt-0.5 h-4 w-4 text-crimson-500" />
                <p className="text-sm text-zinc-400">{signal}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Active Complaints"
          eyebrow="Command queue"
          action={
            <Button variant="ghost" onClick={() => navigate('/admin/complaints')}>
              View all
            </Button>
          }
        />
        <CardBody>
          <Table columns={columns} rows={db.items.slice(0, 5)} onRowClick={setSelected} />
        </CardBody>
      </Card>

      <Modal
        open={Boolean(selected)}
        title={selected ? `Complaint ${selected.id}` : 'Complaint'}
        onClose={() => setSelected(null)}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (selected) navigate(`/admin/complaints`);
              }}
            >
              Open in queue
            </Button>
          </div>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-black/25 p-4">
              <p className="label-caps text-crimson-400">{selected.category}</p>
              <p className="mt-2 font-display text-xl font-bold text-white">{selected.subject}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{selected.message}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-black/25 p-4">
                <p className="label-caps text-zinc-500">Status</p>
                <div className="mt-2">
                  <Badge>{selected.status}</Badge>
                </div>
              </div>
              <div className="rounded-lg bg-black/25 p-4">
                <p className="label-caps text-zinc-500">Priority</p>
                <p className="mt-2 font-display text-xl font-bold text-white">{selected.priority}</p>
              </div>
              <div className="rounded-lg bg-black/25 p-4">
                <p className="label-caps text-zinc-500">Handler</p>
                <p className="mt-2 text-white">{selected.assignee}</p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
