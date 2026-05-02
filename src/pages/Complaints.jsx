import { useEffect, useMemo, useState } from 'react';
import { Filter, Plus, Search } from 'lucide-react';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Card, { CardBody, CardHeader } from '../components/Card';
import { Field, Input, Select, Textarea } from '../components/Input';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { useComplaints } from '../state/complaints';
import { useToast } from '../state/toast';

const columns = [
  { key: 'id', label: 'Case' },
  { key: 'customer', label: 'Customer' },
  { key: 'company', label: 'Organization' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
  { key: 'sentiment', label: 'Sentiment', render: (row) => <Badge>{row.sentiment}</Badge> },
  { key: 'assignee', label: 'Handler' },
  { key: 'updatedAt', label: 'Updated' },
];

const PAGE_SIZES = [5, 10, 15];
const ASSIGNEES = ['Archer Vale', 'Mara Thorne', 'Nora Malik', 'Leah Ortiz', 'Ilya Cross', 'Unassigned'];

export default function Complaints() {
  const toast = useToast();
  const db = useComplaints();

  const [selected, setSelected] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [sortKey, setSortKey] = useState('updatedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [query, status, priority, pageSize]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return db.items
      .filter((c) => (status === 'All' ? true : c.status === status))
      .filter((c) => (priority === 'All' ? true : c.priority === priority))
      .filter((c) => {
        if (!q) return true;
        const hay = `${c.id} ${c.customer} ${c.company} ${c.subject} ${c.assignee} ${c.category}`.toLowerCase();
        return hay.includes(q);
      });
  }, [db.items, priority, query, status]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const get = (c) => {
      const v = c[sortKey];
      if (typeof v === 'number') return v;
      return String(v ?? '').toLowerCase();
    };
    return [...filtered].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [filtered, sortDir, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = useMemo(() => sorted.slice((page - 1) * pageSize, page * pageSize), [page, pageSize, sorted]);

  const onSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const openNew = () => {
    setSelected({
      id: 'NEW',
      customer: '',
      contactEmail: '',
      company: 'Direct Consumer',
      subject: '',
      category: 'System Failure',
      channel: 'Internal',
      status: 'Pending',
      priority: 'P2',
      sentiment: 'Neutral',
      risk: 63.0,
      department: 'Infrastructure Ops',
      assignee: 'Unassigned',
      createdAt: '—',
      updatedAt: '—',
      message: '',
      notes: '',
      timeline: [],
      _mode: 'create',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-crimson-500">Complaint Operations</p>
          <h1 className="mt-2 font-display text-4xl font-black text-white">Complaint Management</h1>
          <p className="mt-2 text-zinc-400">Audit, route, and resolve AI-classified complaint records.</p>
        </div>
        <Button icon={Plus} onClick={openNew}>
          Create Case
        </Button>
      </div>

      <Card>
        <CardHeader
          title="Enterprise Queue"
          eyebrow="Live case table"
          action={
            <div className="flex gap-2">
              <Button variant="secondary" icon={Filter} onClick={() => setFilterOpen(true)}>
                Filter
              </Button>
            </div>
          }
        />
        <CardBody>
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" placeholder="Search complaint, company, handler…" />
            </div>
            <div className="flex items-center justify-between gap-3 md:justify-end">
              <div className="hidden items-center gap-3 text-sm text-zinc-400 md:flex">
                <span className="label-caps text-zinc-500">Rows</span>
                <Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="h-11">
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                  Prev
                </Button>
                <span className="text-sm text-zinc-500">
                  {page} / {totalPages}
                </span>
                <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  Next
                </Button>
              </div>
            </div>
          </div>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              Showing <span className="font-semibold text-white">{paged.length}</span> of{' '}
              <span className="font-semibold text-white">{sorted.length}</span>
            </p>
            <div className="flex items-center gap-3 md:hidden">
              <span className="label-caps text-zinc-500">Rows</span>
              <Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="h-11">
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Table
            columns={columns.map((c) => ({ ...c, sortable: true }))}
            rows={paged}
            onRowClick={setSelected}
            sort={{ key: sortKey, dir: sortDir }}
            onSort={onSort}
          />
        </CardBody>
      </Card>

      <Modal
        open={Boolean(selected)}
        title={selected ? (selected._mode === 'create' ? 'Create complaint case' : selected.id) : 'Complaint'}
        onClose={() => setSelected(null)}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
            {selected?._mode === 'create' ? (
              <Button
                onClick={async () => {
                  if (!selected.customer.trim() || !selected.contactEmail?.trim() || !selected.subject.trim() || selected.message.trim().length < 20) {
                    toast.error('Missing details', 'Add customer name, email, subject, and a longer description.', { durationMs: 4200 });
                    return;
                  }
                  const created = await db.submit({
                    name: selected.customer,
                    email: selected.contactEmail,
                    subject: selected.subject,
                    message: selected.message,
                    category: selected.category,
                    department: selected.department,
                  });
                  toast.success('Case created', `${created.id} added to the queue.`, { durationMs: 3200 });
                  setSelected(null);
                }}
              >
                Create Case
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await db.advanceStatus(selected.id);
                    toast.success('Status updated', 'Workflow advanced successfully.', { durationMs: 2600 });
                    setSelected(null);
                  }}
                >
                  Advance Status
                </Button>
                <Button
                  onClick={async () => {
                    await db.update(selected.id, {
                      assignee: selected.assignee,
                      notes: selected.notes ?? '',
                      status: selected.status,
                      priority: selected.priority,
                    });
                    toast.success('Saved', 'Complaint changes saved successfully.', { durationMs: 2600 });
                    setSelected(null);
                  }}
                >
                  Save Changes
                </Button>
              </>
            )}
          </div>
        }
      >
        {selected ? (
          <div className="space-y-5">
            <div>
              <p className="label-caps text-crimson-500">{selected.category}</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-white">{selected._mode === 'create' ? 'New complaint case' : selected.subject}</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-black/25 p-4">
                <p className="label-caps text-zinc-500">Risk</p>
                <p className="mt-2 font-display text-2xl font-bold text-white">{selected.risk}</p>
              </div>
              <div className="rounded-lg bg-black/25 p-4">
                <p className="label-caps text-zinc-500">Status</p>
                <div className="mt-2">
                  <Select value={selected.status} onChange={(e) => setSelected((p) => ({ ...p, status: e.target.value }))} className="h-11">
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </Select>
                </div>
              </div>
              <div className="rounded-lg bg-black/25 p-4">
                <p className="label-caps text-zinc-500">Handler</p>
                <div className="mt-2">
                  <Select value={selected.assignee} onChange={(e) => setSelected((p) => ({ ...p, assignee: e.target.value }))} className="h-11">
                    {ASSIGNEES.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Customer name">
                <Input value={selected.customer} onChange={(e) => setSelected((p) => ({ ...p, customer: e.target.value }))} placeholder="Customer name" />
              </Field>
              <Field label="Customer email">
                <Input value={selected.contactEmail ?? ''} onChange={(e) => setSelected((p) => ({ ...p, contactEmail: e.target.value }))} placeholder="name@company.com" inputMode="email" />
              </Field>
              <Field label="Subject">
                <Input value={selected.subject} onChange={(e) => setSelected((p) => ({ ...p, subject: e.target.value }))} placeholder="Short summary" />
              </Field>
              <Field label="Priority">
                <Select value={selected.priority} onChange={(e) => setSelected((p) => ({ ...p, priority: e.target.value }))}>
                  <option>P0</option>
                  <option>P1</option>
                  <option>P2</option>
                  <option>P3</option>
                </Select>
              </Field>
            </div>

            <Field label="Complaint details" hint="Minimum 20 characters for demo validation.">
              <Textarea rows={7} value={selected.message} onChange={(e) => setSelected((p) => ({ ...p, message: e.target.value }))} placeholder="Describe the incident in detail…" />
            </Field>

            <Field label="Internal notes">
              <Textarea rows={4} value={selected.notes ?? ''} onChange={(e) => setSelected((p) => ({ ...p, notes: e.target.value }))} placeholder="Add operator notes for this case…" />
            </Field>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={filterOpen}
        title="Filter & sort"
        onClose={() => setFilterOpen(false)}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setFilterOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setQuery('');
                setStatus('All');
                setPriority('All');
                setSortKey('updatedAt');
                setSortDir('desc');
                toast.success('Filters reset', 'Queue view restored to defaults.', { durationMs: 2400 });
                setFilterOpen(false);
              }}
            >
              Reset
            </Button>
          </div>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option>All</option>
              <option>P0</option>
              <option>P1</option>
              <option>P2</option>
              <option>P3</option>
            </Select>
          </Field>
          <Field label="Sort by">
            <Select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
              <option value="updatedAt">Updated</option>
              <option value="id">Case ID</option>
              <option value="customer">Customer</option>
              <option value="company">Organization</option>
              <option value="status">Status</option>
              <option value="assignee">Handler</option>
            </Select>
          </Field>
          <Field label="Direction">
            <Select value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
