import { Eye, Power, RotateCcw, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card, { CardBody, CardHeader } from '../../components/Card';
import { Input, Select } from '../../components/Input';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import { superAdminFetch } from '../../lib/superAdminApi';
import { useToast } from '../../state/toast';

export default function SuperAdminUsers() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (status !== 'All') params.set('status', status);
      setRows(await superAdminFetch(`/users?${params.toString()}`));
    } catch (error) {
      toast.error('Users unavailable', error.message || 'Could not load platform users.', { durationMs: 3600 });
    } finally {
      setLoading(false);
    }
  }, [query, status, toast]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 220);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    const qValue = params.get('q');
    if (qValue !== null) {
      setQuery((current) => (current === qValue ? current : qValue));
    }
  }, [params]);

  useEffect(() => {
    const userId = params.get('user');
    if (!userId || selected?.id === userId || loading) return;
    const match = rows.find((row) => row.id === userId);
    if (match) setSelected(match);
  }, [loading, params, rows, selected?.id]);

  const closeDetail = () => {
    setSelected(null);
    if (params.has('user')) {
      const next = new URLSearchParams(params);
      next.delete('user');
      setParams(next, { replace: true });
    }
  };

  const setUserActive = async (row, active) => {
    setBusyId(row.id);
    try {
      const updated = await superAdminFetch(`/users/${encodeURIComponent(row.id)}/${active ? 'activate' : 'deactivate'}`, { method: 'PATCH' });
      setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      if (selected?.id === updated.id) setSelected(updated);
      toast.success(active ? 'User activated' : 'User deactivated', `${updated.email} updated.`, { durationMs: 2800 });
    } catch (error) {
      toast.error('User update failed', error.message || 'Could not update this user.', { durationMs: 4200 });
    } finally {
      setBusyId('');
    }
  };

  const columns = [
    { key: 'owner_name', label: 'Name', widthClassName: 'min-w-[180px] max-w-[220px]', render: (row) => <span className="font-semibold text-t-text">{row.owner_name}</span> },
    { key: 'email', label: 'Email', widthClassName: 'min-w-[220px] max-w-[260px]' },
    { key: 'company', label: 'Company', widthClassName: 'min-w-[220px] max-w-[260px]' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    { key: 'created_at', label: 'Created', render: (row) => new Date(row.created_at).toLocaleDateString() },
    { key: 'last_login', label: 'Last login', render: (row) => row.last_login ? new Date(row.last_login).toLocaleString() : 'Never' },
    {
      key: 'actions',
      label: 'Actions',
      colClassName: 'w-[260px]',
      widthClassName: 'min-w-[260px] max-w-[260px]',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" icon={Eye} onClick={(event) => { event.stopPropagation(); setSelected(row); }}>View</Button>
          <Button
            size="sm"
            variant={row.is_active ? 'danger' : 'secondary'}
            icon={row.is_active ? Power : RotateCcw}
            loading={busyId === row.id}
            disabled={Boolean(busyId)}
            onClick={(event) => {
              event.stopPropagation();
              void setUserActive(row, !row.is_active);
            }}
          >
            {row.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <div>
        <p className="label-caps text-t-accent">User Management</p>
        <h1 className="mt-2 font-display text-3xl font-black text-t-text sm:text-4xl">Platform Users</h1>
        <p className="mt-2 max-w-3xl text-t-text-muted">View and manage users across all company workspaces without exposing passwords.</p>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader title="All users" eyebrow="Company accounts" />
        <CardBody className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-t-text-faint" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" placeholder="Search users, email, company, role..." />
            </div>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="lg:w-44">
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </Select>
          </div>
          {loading ? <Loader label="Loading users..." /> : null}
          {rows.length ? (
            <Table columns={columns} rows={rows} rowKey="id" onRowClick={setSelected} tableMinWidth="min-w-[1280px]" />
          ) : (
            <div className="rounded-lg border border-t-border bg-t-panel p-8 text-center text-sm text-t-text-muted">No users match the current filters.</div>
          )}
        </CardBody>
      </Card>

      <Modal open={Boolean(selected)} title={selected?.owner_name || 'User detail'} onClose={closeDetail}>
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-t-border bg-t-panel p-4">
              <p className="label-caps text-t-text-muted">Account</p>
              <div className="mt-4 space-y-2 text-sm text-t-text-muted">
                <p><span className="font-semibold text-t-text">Email:</span> {selected.email}</p>
                <p><span className="font-semibold text-t-text">Company:</span> {selected.company}</p>
                <p><span className="font-semibold text-t-text">Role:</span> {selected.role}</p>
                <p><span className="font-semibold text-t-text">Status:</span> {selected.status}</p>
                <p><span className="font-semibold text-t-text">Last login:</span> {selected.last_login ? new Date(selected.last_login).toLocaleString() : 'Never'}</p>
              </div>
            </div>
            <div className="rounded-lg border border-t-border bg-t-panel p-4">
              <p className="label-caps text-t-text-muted">Password reset</p>
              <p className="mt-2 text-sm leading-6 text-t-text-muted">Password reset is intentionally disabled here until a secure delivery channel is configured.</p>
              <Button className="mt-4" variant="secondary" disabled>Reset Password Coming Soon</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
