import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleCheck,
  Clock3,
  Eye,
  FileText,
  Inbox,
  ShieldAlert,
  Timer,
  UserPlus,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card, { CardBody, CardHeader } from '../components/Card';
import DashboardCard from '../components/DashboardCard';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { companyProfile } from '../data/stats';
import { useComplaints } from '../state/complaints';
import { useToast } from '../state/toast';

function MetaTile({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-2 text-zinc-500">
        {Icon ? <Icon className="h-4 w-4" /> : null}
        <p className="label-caps">{label}</p>
      </div>
      <p className="mt-2 break-words text-sm font-semibold leading-6 text-white">{value || 'Unassigned'}</p>
    </div>
  );
}

function ComplaintCard({ row, onView, onAssign, onResolve }) {
  return (
    <button
      type="button"
      onClick={() => onView(row)}
      className="w-full rounded-lg border border-white/10 bg-panel/80 p-4 text-left shadow-panel transition hover:border-crimson-500/30 hover:bg-crimson-950/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-sm font-bold text-white">{row.id}</p>
          <p className="mt-1 truncate text-sm text-zinc-400">{row.customer_name}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge>{row.priority}</Badge>
          <Badge>{row.status}</Badge>
        </div>
      </div>
      <p className="mt-4 truncate text-sm font-semibold text-zinc-200">{row.complaint_text}</p>
      <p className="mt-2 text-xs text-zinc-500">{row.category}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button
          size="sm"
          variant="ghost"
          icon={Eye}
          className="w-full px-2"
          onClick={(event) => {
            event.stopPropagation();
            onView(row);
          }}
        >
          View
        </Button>
        <Button
          size="sm"
          variant="secondary"
          icon={UserPlus}
          className="w-full px-2"
          onClick={(event) => {
            event.stopPropagation();
            onAssign(row);
          }}
        >
          Assign
        </Button>
        <Button
          size="sm"
          icon={CircleCheck}
          className="w-full px-2"
          onClick={(event) => {
            event.stopPropagation();
            onResolve(row);
          }}
        >
          Resolve
        </Button>
      </div>
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const db = useComplaints();
  const refreshComplaints = db.refresh;
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    void refreshComplaints();
  }, [refreshComplaints]);

  const summaryCards = useMemo(() => {
    const countByStatus = (status) => db.items.filter((item) => item.status === status).length;
    const countByPriority = (priority) => db.items.filter((item) => item.priority === priority).length;

    return [
      {
        id: 'total',
        title: 'Total Complaints',
        value: db.items.length,
        change: 'All enterprise cases',
        icon: Inbox,
        route: '/admin/complaints',
        tone: 'neutral',
      },
      {
        id: 'pending',
        title: 'Pending',
        value: countByStatus('Pending'),
        change: 'Needs first response',
        icon: Clock3,
        route: '/admin/complaints',
        filterParams: { status: 'pending' },
        tone: 'warning',
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        value: countByStatus('In Progress'),
        change: 'Active operations',
        icon: Activity,
        route: '/admin/complaints',
        filterParams: { status: 'in-progress' },
        tone: 'info',
      },
      {
        id: 'resolved',
        title: 'Resolved',
        value: countByStatus('Resolved'),
        change: 'Closed successfully',
        icon: CheckCircle2,
        route: '/admin/complaints',
        filterParams: { status: 'resolved' },
        tone: 'success',
      },
      {
        id: 'high-priority',
        title: 'High Priority',
        value: countByPriority('High'),
        change: 'Critical watchlist',
        icon: ShieldAlert,
        route: '/admin/complaints',
        filterParams: { priority: 'high' },
        tone: 'danger',
      },
    ];
  }, [db.items]);

  const recentRows = useMemo(() => db.items.slice(0, 8), [db.items]);

  const assignCase = async (row) => {
    const updates = {
      assignee: row.assignee === 'Unassigned' ? 'Amina Siddiqui' : row.assignee,
      status: row.status === 'Pending' ? 'In Progress' : row.status,
    };

    await db.update(row.id, updates);
    setSelected((prev) => (prev?.id === row.id ? { ...prev, ...updates } : prev));
    toast.success('Case assigned', `${row.id} routed to the operations queue.`, { durationMs: 2600 });
  };

  const resolveCase = async (row) => {
    const updates = {
      status: 'Resolved',
      resolution_time_hours: row.resolution_time_hours ?? 6.4,
    };

    await db.update(row.id, updates);
    setSelected((prev) => (prev?.id === row.id ? { ...prev, ...updates } : prev));
    toast.success('Case resolved', `${row.id} marked resolved in the operations workflow.`, { durationMs: 2600 });
  };

  const columns = [
    {
      key: 'id',
      label: 'Case ID',
      sticky: 'left',
      colClassName: 'w-32',
      widthClassName: 'min-w-[128px] max-w-[128px]',
      cellClassName: 'font-display font-bold text-zinc-100',
    },
    {
      key: 'customer_name',
      label: 'Customer',
      colClassName: 'w-44',
      widthClassName: 'min-w-[176px] max-w-[176px]',
      cellClassName: 'font-semibold text-zinc-200',
    },
    {
      key: 'complaint_text',
      label: 'Complaint',
      colClassName: 'w-[420px]',
      widthClassName: 'min-w-[420px] max-w-[420px]',
      render: (row) => (
        <span title={row.complaint_text} className="block truncate pr-4 text-zinc-200">
          {row.complaint_text}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      colClassName: 'w-44',
      widthClassName: 'min-w-[176px] max-w-[176px]',
    },
    {
      key: 'priority',
      label: 'Priority',
      colClassName: 'w-32',
      widthClassName: 'min-w-[128px] max-w-[128px]',
      render: (row) => <Badge>{row.priority}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      colClassName: 'w-[140px]',
      widthClassName: 'min-w-[140px] max-w-[140px]',
      render: (row) => <Badge>{row.status}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      colClassName: 'w-[300px]',
      widthClassName: 'min-w-[300px] max-w-[300px]',
      render: (row) => (
        <div className="flex min-w-max items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            icon={Eye}
            className="whitespace-nowrap"
            onClick={(event) => {
              event.stopPropagation();
              setSelected(row);
            }}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={UserPlus}
            className="whitespace-nowrap"
            onClick={(event) => {
              event.stopPropagation();
              void assignCase(row);
            }}
          >
            Assign
          </Button>
          <Button
            size="sm"
            icon={CircleCheck}
            className="whitespace-nowrap"
            onClick={(event) => {
              event.stopPropagation();
              void resolveCase(row);
            }}
          >
            Resolve
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-8 overflow-hidden">
      <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
        <div>
          <p className="label-caps text-crimson-500">{companyProfile.plan}</p>
          <h1 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">Admin Dashboard</h1>
          <p className="mt-2 max-w-3xl text-zinc-400">Enterprise complaint queue overview for Nexus Bank operations.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon={ArrowUpRight} onClick={() => navigate('/admin/bulk-upload', { replace: true })}>
            Bulk Upload
          </Button>
          <Button icon={BrainCircuit} onClick={() => navigate('/admin/ai-lab', { replace: true })}>
            Analyze Complaint
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <DashboardCard key={card.id} {...card} />
        ))}
      </div>

      <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-panel/95 via-zinc-950/95 to-crimson-950/20">
        <CardHeader
          title="Recent Complaints"
          eyebrow="Operational queue"
          className="gap-5 p-6 sm:px-7"
          action={
            <Button variant="ghost" onClick={() => navigate('/admin/complaints', { replace: true })}>
              View all
            </Button>
          }
        >
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            Latest cases with enough room for review, assignment, and resolution actions.
          </p>
        </CardHeader>
        <CardBody className="p-3 sm:p-5 lg:p-6">
          <div className="hidden md:block">
            <Table columns={columns} rows={recentRows} onRowClick={setSelected} tableClassName="min-w-[1468px]" />
          </div>
          <div className="grid gap-3 md:hidden">
            {recentRows.map((row) => (
              <ComplaintCard
                key={row.id}
                row={row}
                onView={setSelected}
                onAssign={(item) => void assignCase(item)}
                onResolve={(item) => void resolveCase(item)}
              />
            ))}
          </div>
        </CardBody>
      </Card>

      <Modal
        open={Boolean(selected)}
        title={selected ? selected.id : 'Complaint details'}
        onClose={() => setSelected(null)}
        className="max-w-4xl border-crimson-500/20 bg-gradient-to-br from-panel/95 via-zinc-950/95 to-crimson-950/30"
        bodyClassName="p-0"
        footerClassName="p-4 sm:p-5"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button variant="secondary" icon={UserPlus} onClick={() => selected && void assignCase(selected)}>
              Assign
            </Button>
            <Button variant="secondary" icon={CircleCheck} onClick={() => selected && void resolveCase(selected)}>
              Mark Resolved
            </Button>
            <Button
              onClick={() => {
                setSelected(null);
                navigate('/admin/complaints', { replace: true });
              }}
            >
              Open Queue
            </Button>
          </div>
        }
      >
        {selected ? (
          <div className="space-y-5 p-5 sm:p-6">
            <div className="rounded-lg border border-crimson-500/20 bg-black/30 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_70px_rgba(0,0,0,0.28)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="label-caps text-crimson-400">Complaint profile</p>
                  <h3 className="mt-2 font-display text-2xl font-black text-white">{selected.customer_name}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{selected.company} - {selected.department}</p>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Badge>{selected.priority}</Badge>
                  <Badge>{selected.status}</Badge>
                  <Badge tone={selected.sentiment}>{selected.sentiment}</Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetaTile label="Category" value={selected.category} icon={FileText} />
              <MetaTile label="Source" value={selected.source} icon={Building2} />
              <MetaTile label="Assignee" value={selected.assignee} icon={UserPlus} />
              <MetaTile label="SLA Due" value={selected.sla_due} icon={CalendarClock} />
              <MetaTile label="Last Activity" value={selected.last_activity} icon={Clock3} />
              <MetaTile label="Confidence" value={`${selected.confidence}%`} icon={BrainCircuit} />
              <MetaTile label="Account Type" value={selected.account_type} icon={Inbox} />
              <MetaTile label="Resolution Hours" value={selected.resolution_time_hours ? `${selected.resolution_time_hours} hrs` : 'Open'} icon={Timer} />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-lg border border-white/10 bg-black/25 p-5">
                <p className="label-caps text-zinc-500">Complaint text</p>
                <p className="mt-3 text-sm leading-7 text-zinc-200">{selected.complaint_text}</p>
              </section>
              <section className="rounded-lg border border-white/10 bg-black/25 p-5">
                <p className="label-caps text-zinc-500">Notes</p>
                <p className="mt-3 text-sm leading-7 text-zinc-300">
                  {selected.notes || 'No internal notes captured yet. Use the queue to add resolution updates, callback notes, or evidence links.'}
                </p>
              </section>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
