import { RefreshCw, Search, ShieldOff, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card, { CardBody, CardHeader } from '../../components/Card';
import { Input, Select, Textarea } from '../../components/Input';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import { superAdminFetch } from '../../lib/superAdminApi';
import { useToast } from '../../state/toast';

function DetailMetric({ label, value }) {
  return (
    <div className="rounded-lg border border-t-border bg-t-panel p-4">
      <p className="label-caps text-t-text-muted">{label}</p>
      <p className="mt-2 font-display text-xl font-black text-t-text">{value}</p>
    </div>
  );
}

export default function SuperAdminCompanies() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(() => {
    const value = params.get('status')?.toLowerCase();
    if (value === 'active') return 'Active';
    if (value === 'suspended') return 'Suspended';
    return 'All';
  });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState('');
  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (status !== 'All') params.set('status', status);
      setRows(await superAdminFetch(`/companies?${params.toString()}`));
    } catch (error) {
      toast.error('Companies unavailable', error.message || 'Could not load companies.', { durationMs: 3600 });
    } finally {
      setLoading(false);
    }
  }, [query, status, toast]);

  useEffect(() => {
    const value = params.get('status')?.toLowerCase();
    const next = value === 'active' ? 'Active' : value === 'suspended' ? 'Suspended' : 'All';
    setStatus((current) => (current === next ? current : next));
    const qValue = params.get('q');
    if (qValue !== null) {
      setQuery((current) => (current === qValue ? current : qValue));
    }
  }, [params]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 220);
    return () => window.clearTimeout(timer);
  }, [load]);

  const openDetail = async (company) => {
    setSelected(company);
    setDetail(null);
    try {
      setDetail(await superAdminFetch(`/companies/${encodeURIComponent(company.id)}`));
    } catch (error) {
      toast.error('Company detail unavailable', error.message || 'Could not load company detail.', { durationMs: 3600 });
    }
  };

  const openDetailById = useCallback(async (companyId) => {
    setSelected({ id: companyId, company_name: 'Company detail' });
    setDetail(null);
    try {
      const payload = await superAdminFetch(`/companies/${encodeURIComponent(companyId)}`);
      setSelected(payload.company);
      setDetail(payload);
    } catch (error) {
      setSelected(null);
      const next = new URLSearchParams(params);
      next.delete('company');
      setParams(next, { replace: true });
      toast.error('Company detail unavailable', error.message || 'Could not load company detail.', { durationMs: 3600 });
    }
  }, [params, setParams, toast]);

  useEffect(() => {
    const companyId = params.get('company');
    if (!companyId || selected?.id === companyId) return;
    void openDetailById(companyId);
  }, [openDetailById, params, selected?.id]);

  const openAction = (type, company) => {
    setActionType(type);
    setActionTarget(company);
    setReason('');
    setConfirmation('');
  };

  const onStatusChange = (value) => {
    setStatus(value);
    const next = new URLSearchParams(params);
    if (value === 'All') next.delete('status');
    else next.set('status', value.toLowerCase());
    setParams(next, { replace: true });
  };

  const closeDetail = () => {
    setSelected(null);
    setDetail(null);
    if (params.has('company')) {
      const next = new URLSearchParams(params);
      next.delete('company');
      setParams(next, { replace: true });
    }
  };

  const applyCompanyUpdate = (updated) => {
    setRows((prev) => {
      if (status !== 'All' && updated.status !== status) {
        return prev.filter((item) => item.id !== updated.id);
      }
      return prev.map((item) => (item.id === updated.id ? updated : item));
    });
    if (selected?.id === updated.id) {
      setSelected(updated);
      setDetail((prev) => (prev ? { ...prev, company: updated } : prev));
    }
  };

  const runCompanyAction = async () => {
    if (!actionTarget) return;
    setBusyId(actionTarget.id);
    try {
      if (actionType === 'suspend') {
        const updated = await superAdminFetch(`/companies/${encodeURIComponent(actionTarget.id)}/suspend`, { method: 'PATCH', body: { reason } });
        applyCompanyUpdate(updated);
        toast.success('Company suspended', `${updated.company_name} users can no longer login.`, { durationMs: 3000 });
      } else if (actionType === 'reactivate') {
        const updated = await superAdminFetch(`/companies/${encodeURIComponent(actionTarget.id)}/reactivate`, { method: 'PATCH' });
        applyCompanyUpdate(updated);
        toast.success('Company reactivated', `${updated.company_name} can login again.`, { durationMs: 3000 });
      } else if (actionType === 'delete') {
        await superAdminFetch(`/companies/${encodeURIComponent(actionTarget.id)}?confirmation=${encodeURIComponent(confirmation.trim())}`, { method: 'DELETE' });
        setRows((prev) => prev.filter((item) => item.id !== actionTarget.id));
        if (selected?.id === actionTarget.id) {
          setSelected(null);
          setDetail(null);
        }
        toast.success('Company deleted', `${actionTarget.company_name} was deleted.`, { durationMs: 3000 });
      }
      setActionTarget(null);
      setActionType('');
    } catch (error) {
      toast.error('Action failed', error.message || 'The company action could not be completed.', { durationMs: 4200 });
    } finally {
      setBusyId('');
    }
  };

  const columns = [
    { key: 'company_name', label: 'Company name', widthClassName: 'min-w-[220px] max-w-[260px]', render: (row) => <span className="block truncate font-semibold text-t-text">{row.company_name}</span> },
    { key: 'business_email', label: 'Business email', widthClassName: 'min-w-[220px] max-w-[260px]' },
    { key: 'industry', label: 'Industry' },
    { key: 'owner_name', label: 'Owner name' },
    { key: 'users_count', label: 'Users' },
    { key: 'complaints_count', label: 'Complaints' },
    { key: 'analyses_count', label: 'AI analyses' },
    { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    { key: 'created_at', label: 'Created', render: (row) => new Date(row.created_at).toLocaleDateString() },
    {
      key: 'actions',
      label: 'Actions',
      colClassName: 'w-[236px]',
      widthClassName: 'min-w-[236px] max-w-[236px]',
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2">
          {row.status === 'Suspended' ? (
            <Button size="sm" variant="secondary" icon={RefreshCw} loading={busyId === row.id} disabled={Boolean(busyId)} className="whitespace-nowrap px-2.5" onClick={(event) => { event.stopPropagation(); openAction('reactivate', row); }}>Reactivate</Button>
          ) : (
            <Button size="sm" variant="secondary" icon={ShieldOff} loading={busyId === row.id} disabled={Boolean(busyId)} className="whitespace-nowrap px-2.5" onClick={(event) => { event.stopPropagation(); openAction('suspend', row); }}>Suspend</Button>
          )}
          <Button size="sm" variant="danger" icon={Trash2} disabled={Boolean(busyId)} className="whitespace-nowrap px-2.5" onClick={(event) => { event.stopPropagation(); openAction('delete', row); }}>Delete</Button>
        </div>
      ),
    },
  ];

  const expectedDelete = actionTarget?.company_name || '';

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1500px] space-y-6 overflow-hidden">
      <div>
        <p className="label-caps text-t-accent">Company Management</p>
        <h1 className="mt-2 font-display text-3xl font-black text-t-text sm:text-4xl">Registered Companies</h1>
        <p className="mt-2 max-w-3xl text-t-text-muted">Manage workspace status, usage, and platform access for every registered company.</p>
      </div>

      <Card className="min-w-0 max-w-full overflow-hidden">
        <CardHeader title="Companies" eyebrow="PostgreSQL workspaces" />
        <CardBody className="min-w-0 max-w-full space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-t-text-faint" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" placeholder="Search companies, email, industry..." />
            </div>
            <Select value={status} onChange={(e) => onStatusChange(e.target.value)} className="lg:w-48">
              <option>All</option>
              <option>Active</option>
              <option>Suspended</option>
            </Select>
          </div>
          {status !== 'All' ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-t-accent/20 bg-t-accent-subtle px-3 py-2">
              <span className="label-caps text-t-accent">Active filter</span>
              <Badge>Status: {status}</Badge>
            </div>
          ) : null}
          {loading ? <Loader label="Loading companies..." /> : null}
          {rows.length ? (
            <Table columns={columns} rows={rows} rowKey="id" onRowClick={(row) => void openDetail(row)} tableMinWidth="min-w-[1360px]" className="min-w-0 max-w-full" />
          ) : (
            <div className="rounded-lg border border-t-border bg-t-panel p-8 text-center text-sm text-t-text-muted">No companies match the current filters.</div>
          )}
        </CardBody>
      </Card>

      <Modal open={Boolean(selected)} title={selected?.company_name || 'Company detail'} onClose={closeDetail} className="max-w-5xl">
        {!detail ? (
          <Loader label="Loading company detail..." />
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <DetailMetric label="Users" value={detail.company.users_count} />
              <DetailMetric label="Complaints" value={detail.analytics.complaints_count} />
              <DetailMetric label="AI analyses" value={detail.company.analyses_count} />
              <DetailMetric label="Bulk uploads" value={detail.analytics.uploads_count} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-lg border border-t-border bg-t-panel p-4">
                <p className="label-caps text-t-text-muted">Company information</p>
                <div className="mt-4 space-y-2 text-sm text-t-text-muted">
                  <p><span className="font-semibold text-t-text">Email:</span> {detail.company.business_email}</p>
                  <p><span className="font-semibold text-t-text">Owner:</span> {detail.company.owner_name || 'Unassigned'}</p>
                  <p><span className="font-semibold text-t-text">Industry:</span> {detail.company.industry}</p>
                  <p><span className="font-semibold text-t-text">Users:</span> {detail.company.users_count}</p>
                  <p><span className="font-semibold text-t-text">Complaints:</span> {detail.company.complaints_count}</p>
                  <p><span className="font-semibold text-t-text">AI analyses:</span> {detail.company.analyses_count}</p>
                  <p><span className="font-semibold text-t-text">Bulk uploads:</span> {detail.company.uploads_count}</p>
                  <p><span className="font-semibold text-t-text">Status:</span> {detail.company.status}</p>
                  <p><span className="font-semibold text-t-text">Created:</span> {new Date(detail.company.created_at).toLocaleDateString()}</p>
                  {detail.company.suspended_reason ? <p><span className="font-semibold text-t-text">Reason:</span> {detail.company.suspended_reason}</p> : null}
                </div>
              </section>
              <section className="rounded-lg border border-t-border bg-t-panel p-4">
                <p className="label-caps text-t-text-muted">Recent activity</p>
                <div className="mt-4 space-y-3">
                  {detail.recent_activity.length ? detail.recent_activity.map((item) => (
                    <div key={item.id} className="text-sm text-t-text-muted">
                      <p className="font-semibold text-t-text">{item.action}</p>
                      <p className="text-xs text-t-text-faint">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                  )) : <p className="text-sm text-t-text-muted">No activity yet.</p>}
                </div>
              </section>
            </div>
            <Table columns={[
              { key: 'owner_name', label: 'User' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role' },
              { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
              { key: 'last_login', label: 'Last login', render: (row) => row.last_login ? new Date(row.last_login).toLocaleString() : 'Never' },
            ]} rows={detail.users} rowKey="id" tableMinWidth="min-w-[820px]" />
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(actionTarget)}
        title={actionType === 'delete' ? 'Delete company' : actionType === 'suspend' ? 'Suspend company' : 'Reactivate company'}
        onClose={() => (busyId ? null : setActionTarget(null))}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" disabled={Boolean(busyId)} onClick={() => setActionTarget(null)}>Cancel</Button>
            <Button
              variant={actionType === 'delete' ? 'danger' : 'primary'}
              loading={Boolean(busyId)}
              disabled={Boolean(busyId) || (actionType === 'delete' && confirmation !== expectedDelete)}
              onClick={() => void runCompanyAction()}
            >
              {busyId ? 'Working...' : actionType === 'delete' ? 'Delete Company' : actionType === 'suspend' ? 'Suspend Company' : 'Reactivate Company'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-t-text-muted">
            {actionType === 'delete'
              ? 'This will permanently delete this company and its related workspace data. This action cannot be undone.'
              : actionType === 'suspend'
                ? `Suspended users from ${actionTarget?.company_name} will not be able to login.`
                : `${actionTarget?.company_name} users will be able to login again.`}
          </p>
          {actionType === 'suspend' ? (
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Suspension reason..." />
          ) : null}
          {actionType === 'delete' ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-t-text-muted">Type the company name to confirm: <span className="text-t-text">{expectedDelete}</span></p>
              <Input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder={expectedDelete} />
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
