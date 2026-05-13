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
import { useAuth } from '../state/auth';
import { useComplaints } from '../state/complaints';
import { useToast } from '../state/toast';

function MetaTile({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-t-border bg-t-panel p-4">
      <div className="flex items-center gap-2 text-t-text-muted">
        {Icon ? <Icon className="h-4 w-4" /> : null}
        <p className="label-caps">{label}</p>
      </div>
      <p className="mt-2 break-words text-sm font-semibold leading-6 text-t-text">{value || 'Unassigned'}</p>
    </div>
  );
}

function ComplaintCard({ row, onView, onAssign, onResolve }) {
  return (
    <button type="button" onClick={() => onView(row)}
      className="w-full rounded-xl border border-t-border bg-t-surface p-4 text-left shadow-panel transition-all duration-200 hover:border-t-border-strong hover:shadow-[0_8px_32px_var(--t-shadow)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-sm font-bold text-t-text">{row.id}</p>
          <p className="mt-1 truncate text-sm text-t-text-muted">{row.customer_name}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge>{row.priority}</Badge>
          <Badge>{row.status}</Badge>
        </div>
      </div>
      <p className="mt-4 truncate text-sm font-semibold text-t-text">{row.complaint_text}</p>
      <p className="mt-2 text-xs text-t-text-muted">{row.category}</p>
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
          Solve
        </Button>
      </div>
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const auth = useAuth();
  const db = useComplaints();
  const refreshComplaints = db.refresh;
  const [selected, setSelected] = useState(null);
  const workspaceName = auth.user?.organization_name || auth.user?.company || 'Workspace';
  const defaultAssignee = auth.user?.owner_name || auth.user?.name || 'Operations queue';

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
        id: 'solved',
        title: 'Solved',
        value: countByStatus('Solved'),
        change: 'AI analyzed successfully',
        icon: CheckCircle2,
        route: '/admin/complaints',
        filterParams: { status: 'solved' },
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
      assignee: row.assignee === 'Unassigned' ? defaultAssignee : row.assignee,
      status: row.status === 'Pending' ? 'In Progress' : row.status,
    };

    try {
      await db.update(row.id, updates);
      setSelected((prev) => (prev?.id === row.id ? { ...prev, ...updates } : prev));
      toast.success('Case assigned', `${row.id} routed to the operations queue.`, { durationMs: 2600 });
    } catch (error) {
      toast.error('Assignment failed', error.message || `${row.id} could not be updated.`, { durationMs: 3600 });
    }
  };

  const resolveCase = async (row) => {
    const updates = {
      status: 'Solved',
      resolution_time_hours: row.resolution_time_hours ?? 6.4,
    };

    try {
      await db.update(row.id, updates);
      setSelected((prev) => (prev?.id === row.id ? { ...prev, ...updates } : prev));
      toast.success('Case solved', `${row.id} marked solved in the operations workflow.`, { durationMs: 2600 });
    } catch (error) {
      toast.error('Resolution failed', error.message || `${row.id} could not be updated.`, { durationMs: 3600 });
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Case ID',
      colClassName: 'w-28',
      widthClassName: 'min-w-[112px] max-w-[112px]',
      cellClassName: 'font-display font-bold text-t-text',
    },
    {
      key: 'customer_name',
      label: 'Customer',
      colClassName: 'w-36',
      widthClassName: 'min-w-[144px] max-w-[144px]',
      cellClassName: 'font-semibold text-t-text',
    },
    {
      key: 'complaint_text',
      label: 'Complaint',
      colClassName: 'w-[360px]',
      widthClassName: 'min-w-[320px] max-w-[360px]',
      render: (row) => (
        <span title={row.complaint_text} className="block truncate pr-4 text-t-text">
          {row.complaint_text}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      colClassName: 'w-40',
      widthClassName: 'min-w-[150px] max-w-[160px]',
    },
    {
      key: 'priority',
      label: 'Priority',
      colClassName: 'w-28',
      widthClassName: 'min-w-[112px] max-w-[112px]',
      render: (row) => <Badge>{row.priority}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      colClassName: 'w-28',
      widthClassName: 'min-w-[112px] max-w-[112px]',
      render: (row) => <Badge>{row.status}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      colClassName: 'w-[260px]',
      widthClassName: 'min-w-[260px] max-w-[260px]',
      render: (row) => (
        <div className="flex min-w-[244px] items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            icon={Eye}
            className="whitespace-nowrap px-2.5"
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
            className="whitespace-nowrap px-2.5"
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
            className="whitespace-nowrap px-2.5"
            onClick={(event) => {
              event.stopPropagation();
              void resolveCase(row);
            }}
          >
            Solve
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-8 overflow-hidden">
      <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
        <div>
      <p className="label-caps text-t-accent">Enterprise Workspace</p>
      <h1 className="mt-2 font-display text-3xl font-black text-t-text sm:text-4xl">Admin Dashboard</h1>
      <p className="mt-2 max-w-3xl text-t-text-muted">Enterprise complaint queue overview for {workspaceName} operations.</p>
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

      <Card className="overflow-hidden border-t-border bg-t-surface">
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
          <p className="max-w-2xl text-sm leading-6 text-t-text-muted">
            Latest cases with enough room for review, assignment, and solved-case actions.
          </p>
        </CardHeader>
        <CardBody className="p-3 sm:p-5 lg:p-6">
          <div className="hidden md:block">
            <Table columns={columns} rows={recentRows} onRowClick={setSelected} tableMinWidth="min-w-[1180px]" />
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

      <Modal open={Boolean(selected)} title={selected ? selected.id : 'Complaint details'}
        onClose={() => setSelected(null)}
        className="max-w-4xl"
        bodyClassName="p-0" footerClassName="p-4 sm:p-5"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button variant="secondary" icon={UserPlus} onClick={() => selected && void assignCase(selected)}>
              Assign
            </Button>
            <Button variant="secondary" icon={CircleCheck} onClick={() => selected && void resolveCase(selected)}>
              Mark Solved
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
              <div className="rounded-lg border border-t-border bg-t-panel p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="label-caps text-t-accent">Complaint profile</p>
                    <h3 className="mt-2 font-display text-2xl font-black text-t-text">{selected.customer_name}</h3>
                    <p className="mt-2 text-sm leading-6 text-t-text-muted">{workspaceName} - {selected.department}</p>
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
              <MetaTile label="Customer Type" value={selected.customer_type} icon={Inbox} />
              <MetaTile label="Resolution Hours" value={selected.resolution_time_hours ? `${selected.resolution_time_hours} hrs` : 'Solved'} icon={Timer} />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-lg border border-t-border bg-t-panel p-5">
                <p className="label-caps">Complaint text</p>
                <p className="mt-3 text-sm leading-7 text-t-text">{selected.complaint_text}</p>
              </section>
              <section className="rounded-lg border border-t-border bg-t-panel p-5">
                <p className="label-caps">Notes</p>
                <p className="mt-3 text-sm leading-7 text-t-text-muted">
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
