import { Activity, BrainCircuit, Building2, CheckCircle2, Database, UploadCloud, Users } from 'lucide-react';
import { createElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/Badge';
import Card, { CardBody, CardHeader } from '../../components/Card';
import Loader from '../../components/Loader';
import Table from '../../components/Table';
import { superAdminFetch } from '../../lib/superAdminApi';
import { useToast } from '../../state/toast';

function Metric({ label, value, icon: Icon, hint, to }) {
  const navigate = useNavigate();
  return (
    <Card
      as="button"
      type="button"
      className="w-full text-left"
      onClick={() => navigate(to, { replace: true })}
    >
      <CardBody>
        <div className="flex items-center justify-between gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-t-accent/25 bg-t-accent-subtle text-t-accent">
            {createElement(Icon, { className: 'h-5 w-5' })}
          </span>
          <Badge>Live</Badge>
        </div>
        <p className="mt-4 label-caps text-t-text-muted">{label}</p>
        <p className="mt-2 font-display text-3xl font-black text-t-text">{value}</p>
        {hint ? <p className="mt-2 text-sm text-t-text-muted">{hint}</p> : null}
      </CardBody>
    </Card>
  );
}

const companyColumns = [
  { key: 'company_name', label: 'Company', widthClassName: 'min-w-[220px] max-w-[260px]' },
  { key: 'business_email', label: 'Business Email', widthClassName: 'min-w-[220px] max-w-[260px]' },
  { key: 'owner_name', label: 'Owner', widthClassName: 'min-w-[180px] max-w-[220px]' },
  { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
  { key: 'created_at', label: 'Created', render: (row) => new Date(row.created_at).toLocaleDateString() },
];

export default function SuperAdminDashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ summary: {}, recent_companies: [], activity: [] });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await superAdminFetch('/dashboard'));
    } catch (error) {
      toast.error('Platform dashboard unavailable', error.message || 'Could not load platform metrics.', { durationMs: 3600 });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const metrics = useMemo(() => {
    const s = data.summary ?? {};
    return [
      { label: 'Total Companies', value: s.total_companies ?? 0, icon: Building2, hint: 'Registered workspaces', to: '/super-admin/companies' },
      { label: 'Active Companies', value: s.active_companies ?? 0, icon: CheckCircle2, hint: 'Allowed to sign in', to: '/super-admin/companies?status=active' },
      { label: 'Suspended Companies', value: s.suspended_companies ?? 0, icon: Activity, hint: 'Blocked at login', to: '/super-admin/companies?status=suspended' },
      { label: 'Total Users', value: s.total_users ?? 0, icon: Users, hint: 'Workspace users', to: '/super-admin/users' },
      { label: 'Complaints Processed', value: s.total_complaints ?? 0, icon: Database, hint: 'Stored complaints', to: '/super-admin/analytics?section=complaints' },
      { label: 'AI Analyses', value: s.total_ai_analyses ?? 0, icon: BrainCircuit, hint: 'Solved/analyzed records', to: '/super-admin/analytics?section=ai-analyses' },
      { label: 'Bulk Uploads', value: s.total_bulk_uploads ?? 0, icon: UploadCloud, hint: 'Uploaded batches', to: '/super-admin/analytics?section=bulk-uploads' },
    ];
  }, [data.summary]);

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <div>
        <p className="label-caps text-t-accent">Platform Overview</p>
        <h1 className="mt-2 font-display text-3xl font-black text-t-text sm:text-4xl">Super Admin Dashboard</h1>
        <p className="mt-2 max-w-3xl text-t-text-muted">Platform-wide company, usage, and activity intelligence from PostgreSQL.</p>
      </div>

      {loading ? <Loader label="Loading platform metrics..." /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <Metric key={metric.label} {...metric} />)}
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader title="Recent Company Registrations" eyebrow="Newest workspaces" />
          <CardBody className="min-w-0">
            {data.recent_companies?.length ? (
              <Table columns={companyColumns} rows={data.recent_companies} rowKey="id" tableMinWidth="min-w-[900px]" />
            ) : (
              <div className="rounded-lg border border-t-border bg-t-panel p-8 text-center text-sm text-t-text-muted">No companies registered yet.</div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Platform Activity" eyebrow="Latest events" />
          <CardBody className="space-y-4">
            {data.activity?.length ? data.activity.slice(0, 6).map((item) => (
              <div key={item.id} className="border-b border-t-border pb-4 last:border-0 last:pb-0">
                <p className="text-sm font-semibold text-t-text">{item.action}</p>
                <p className="mt-1 text-xs text-t-text-muted">{item.entity_type} {item.entity_id ? `- ${item.entity_id}` : ''}</p>
                <p className="mt-2 text-xs text-t-text-faint">{new Date(item.timestamp).toLocaleString()}</p>
              </div>
            )) : (
              <p className="text-sm text-t-text-muted">No platform activity yet.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
