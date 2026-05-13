import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Inbox,
  ShieldAlert,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card, { CardBody, CardHeader } from '../components/Card';
import ComplaintDetailView from '../components/ComplaintDetailView';
import ComplaintsTable from '../components/ComplaintsTable';
import DashboardCard from '../components/DashboardCard';
import Modal from '../components/Modal';
import { useAuth } from '../state/auth';
import { useComplaints } from '../state/complaints';
import { useToast } from '../state/toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const auth = useAuth();
  const db = useComplaints();
  const refreshComplaints = db.refresh;
  const [selected, setSelected] = useState(null);
  const [analyzingId, setAnalyzingId] = useState('');
  const workspaceName = auth.user?.organization_name || auth.user?.company || 'Workspace';

  useEffect(() => {
    void refreshComplaints();
  }, [refreshComplaints]);

  const summaryCards = useMemo(() => {
    const countByStatus = (status) => db.items.filter((item) => item.status === status).length;
    const countByPriority = (priority) => db.items.filter((item) => item.status === 'Solved' && item.priority === priority).length;

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
        title: 'Pending Analysis',
        value: countByStatus('Pending Analysis'),
        change: 'Awaiting AI review',
        icon: Clock3,
        route: '/admin/complaints',
        filterParams: { status: 'pending-analysis' },
        tone: 'warning',
      },
      {
        id: 'analysis-failed',
        title: 'Analysis Failed',
        value: countByStatus('Analysis Failed'),
        change: 'Retry needed',
        icon: Activity,
        route: '/admin/complaints',
        filterParams: { status: 'analysis-failed' },
        tone: 'danger',
      },
      {
        id: 'solved',
        title: 'Solved',
        value: countByStatus('Solved'),
        change: 'AI analyzed successfully',
        icon: CheckCircle2,
        route: '/admin/complaints',
        filterParams: { status: 'Solved' },
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

  const analyzeCase = async (row) => {
    setSelected((prev) => (prev?.id === row.id ? prev : row));
    setAnalyzingId(row.id);
    try {
      const analyzed = await db.analyze(row);
      setSelected(analyzed);
      if (analyzed.status === 'Analysis Failed') {
        toast.error('AI analysis failed', analyzed.ai_explanation || `${row.id} could not be analyzed.`, { durationMs: 4200 });
      } else {
        toast.success('AI analysis complete', `${row.id} was classified and marked solved.`, { durationMs: 3000 });
      }
    } catch (error) {
      toast.error('AI analysis failed', error.message || `${row.id} could not be analyzed.`, { durationMs: 4200 });
    } finally {
      setAnalyzingId('');
    }
  };

  const selectedAnalyzed = selected?.status === 'Solved' && Boolean(selected.category && selected.priority && selected.sentiment && selected.confidence != null);

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1500px] space-y-8 overflow-hidden">
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

      <Card className="min-w-0 max-w-full overflow-hidden border-t-border bg-t-surface">
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
            Latest cases with enough room for review, AI analysis, and solved-case actions.
          </p>
        </CardHeader>
        <CardBody className="min-w-0 max-w-full p-3 sm:p-5 lg:p-6">
          <ComplaintsTable
            rows={recentRows}
            onView={setSelected}
            onAnalyze={(row) => void analyzeCase(row)}
            analyzingId={analyzingId}
          />
        </CardBody>
      </Card>

      <Modal open={Boolean(selected)} title={selected ? selected.id : 'Complaint details'}
        onClose={() => setSelected(null)}
        className="max-w-5xl"
        bodyClassName="p-0" footerClassName="p-4 sm:p-5"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button
              variant={selectedAnalyzed ? 'secondary' : 'primary'}
              icon={BrainCircuit}
              loading={Boolean(selected && analyzingId === selected.id)}
              disabled={Boolean(selected && analyzingId === selected.id)}
              onClick={() => selected && void analyzeCase(selected)}
            >
              {selected && analyzingId === selected.id
                ? 'Analyzing...'
                : selected?.status === 'Analysis Failed'
                  ? 'Retry Analysis'
                  : selectedAnalyzed
                    ? 'Re-analyze'
                    : 'Run AI Analysis'}
            </Button>
          </div>
        }
      >
        {selected ? (
          <ComplaintDetailView complaint={selected} workspaceName={workspaceName} analyzing={analyzingId === selected.id} />
        ) : null}
      </Modal>
    </div>
  );
}
