import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { ArrowUpRight, BrainCircuit, CheckCircle2, CircleCheck, Clock3, Eye, Inbox, ShieldAlert, Timer, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card, { CardBody, CardHeader } from '../components/Card';
import ChartCard from '../components/ChartCard';
import Modal from '../components/Modal';
import Table from '../components/Table';
import {
  complaintsByCategory,
  monthlyComplaintVolume,
  priorityBreakdown,
  resolutionTimeTrend,
  sentimentTrend,
} from '../data/analytics';
import {
  buildDashboardKpis,
  companyProfile,
  dashboardKpiDefinitions,
  notificationFeed,
  operationsSnapshot,
} from '../data/stats';
import { useComplaints } from '../state/complaints';
import { useToast } from '../state/toast';

const MotionDiv = motion.div;

const iconMap = {
  total: Inbox,
  pending: Clock3,
  resolved: CheckCircle2,
  highPriority: ShieldAlert,
  avgResolution: Timer,
  accuracy: BrainCircuit,
};

const chartColors = ['#dc2626', '#991b1b', '#ef4444', '#71717a'];

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const db = useComplaints();
  const [selected, setSelected] = useState(null);

  const kpis = useMemo(() => {
    const values = buildDashboardKpis(db.items);
    return dashboardKpiDefinitions.map((definition) => ({
      ...definition,
      ...values.find((item) => item.id === definition.id),
    }));
  }, [db.items]);

  const recentRows = useMemo(() => db.items.slice(0, 7), [db.items]);

  const assignCase = async (row) => {
    await db.update(row.id, { assignee: row.assignee === 'Unassigned' ? 'Amina Siddiqui' : row.assignee, status: row.status === 'Pending' ? 'In Progress' : row.status });
    toast.success('Case assigned', `${row.id} routed to the operations queue.`, { durationMs: 2600 });
  };

  const resolveCase = async (row) => {
    await db.update(row.id, { status: 'Resolved', resolution_time_hours: row.resolution_time_hours ?? 6.4 });
    toast.success('Case resolved', `${row.id} marked resolved in the mock workflow.`, { durationMs: 2600 });
  };

  const columns = [
    { key: 'id', label: 'Case' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'complaint_text', label: 'Complaint', wrap: true, render: (row) => <span className="line-clamp-2">{row.complaint_text}</span> },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority', render: (row) => <Badge>{row.priority}</Badge> },
    { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" icon={Eye} onClick={(event) => { event.stopPropagation(); setSelected(row); }}>
            View
          </Button>
          <Button size="sm" variant="secondary" icon={UserPlus} onClick={(event) => { event.stopPropagation(); void assignCase(row); }}>
            Assign
          </Button>
          <Button size="sm" icon={CircleCheck} onClick={(event) => { event.stopPropagation(); void resolveCase(row); }}>
            Resolve
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
        <div>
          <p className="label-caps text-crimson-500">{companyProfile.plan}</p>
          <h1 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">Admin Dashboard</h1>
          <p className="mt-2 max-w-3xl text-zinc-400">
            Live complaint intake, AI classification quality, SLA exposure, and resolution operations for enterprise service teams.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon={ArrowUpRight} onClick={() => navigate('/admin/bulk-upload')}>
            Bulk Upload
          </Button>
          <Button icon={BrainCircuit} onClick={() => navigate('/admin/ai-lab')}>
            Analyze Complaint
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map((stat, index) => {
          const Icon = iconMap[stat.id] ?? Inbox;
          return (
            <MotionDiv
              key={stat.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
            >
              <Card className="h-full overflow-hidden bg-gradient-to-br from-panel/95 via-zinc-950/95 to-crimson-950/30">
                <CardBody>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="label-caps text-zinc-500">{stat.label}</span>
                    <span className="grid h-10 w-10 place-items-center rounded-lg border border-crimson-600/20 bg-crimson-600/10">
                      <Icon className="h-5 w-5 text-crimson-400" />
                    </span>
                  </div>
                  <p className="font-display text-3xl font-black text-white">{stat.value}</p>
                  <p
                    className={`mt-2 text-sm ${
                      stat.tone === 'success'
                        ? 'text-emerald-400'
                        : stat.tone === 'warning'
                          ? 'text-amber-300'
                          : stat.tone === 'danger'
                            ? 'text-crimson-300'
                            : 'text-zinc-400'
                    }`}
                  >
                    {stat.change}
                  </p>
                </CardBody>
              </Card>
            </MotionDiv>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Complaints by Category" eyebrow="AI classification distribution">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintsByCategory}>
                <XAxis dataKey="category" stroke="#71717a" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 11 }} />
                <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(220,38,38,0.08)' }} contentStyle={{ background: '#111113', border: '1px solid #2a2a2a', color: '#fff' }} />
                <Bar dataKey="complaints" fill="#dc2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Monthly Complaint Volume" eyebrow="Intake vs resolved">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyComplaintVolume}>
                <XAxis dataKey="month" stroke="#71717a" tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#111113', border: '1px solid #2a2a2a', color: '#fff' }} />
                <Area type="monotone" dataKey="complaints" stroke="#dc2626" fill="#dc2626" fillOpacity={0.18} strokeWidth={3} />
                <Area type="monotone" dataKey="resolved" stroke="#71717a" fill="#71717a" fillOpacity={0.12} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px_1fr]">
        <ChartCard title="Sentiment Trend" eyebrow="Seven-day customer emotion">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentTrend}>
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

        <ChartCard title="Priority Breakdown" eyebrow="Current severity mix">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={priorityBreakdown} dataKey="value" nameKey="name" innerRadius={58} outerRadius={94} paddingAngle={4}>
                  {priorityBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111113', border: '1px solid #2a2a2a', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Resolution Time Trend" eyebrow="Average hours to close">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resolutionTimeTrend}>
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

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader
            title="Recent Complaints"
            eyebrow="Operational queue"
            action={
              <Button variant="ghost" onClick={() => navigate('/admin/complaints')}>
                View all
              </Button>
            }
          />
          <CardBody>
            <Table columns={columns} rows={recentRows} onRowClick={setSelected} />
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Executive Signals" eyebrow="Today" />
            <CardBody className="space-y-4">
              {notificationFeed.map((item) => (
                <div key={item.id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">{item.text}</p>
                  <p className="mt-2 text-xs text-zinc-600">{item.time}</p>
                </div>
              ))}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Operations Snapshot" eyebrow="Enterprise readiness" />
            <CardBody className="space-y-4">
              {operationsSnapshot.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-zinc-500">{item.detail}</p>
                  </div>
                  <p className="font-display text-2xl font-black text-crimson-300">{item.value}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        open={Boolean(selected)}
        title={selected ? `${selected.id} - ${selected.category}` : 'Complaint'}
        onClose={() => setSelected(null)}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setSelected(null);
                navigate('/admin/complaints');
              }}
            >
              Open Queue
            </Button>
          </div>
        }
      >
        {selected ? (
          <div className="space-y-5">
            <p className="text-sm leading-6 text-zinc-300">{selected.complaint_text}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                <p className="label-caps text-zinc-500">Customer</p>
                <p className="mt-2 text-sm font-semibold text-white">{selected.customer_name}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                <p className="label-caps text-zinc-500">Department</p>
                <p className="mt-2 text-sm font-semibold text-white">{selected.department}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                <p className="label-caps text-zinc-500">Confidence</p>
                <p className="mt-2 font-display text-2xl font-black text-white">{selected.confidence}%</p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
