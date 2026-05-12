import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClipboardCheck, Filter, Plus, Search, UserPlus } from 'lucide-react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card, { CardBody, CardHeader } from '../components/Card';
import { Field, Input, Select, Textarea } from '../components/Input';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { complaintCategories } from '../data/complaints';
import { useAuth } from '../state/auth';
import { useComplaints } from '../state/complaints';
import { useToast } from '../state/toast';
import { cn } from '../utils/cn';

const PAGE_SIZES = [6, 10, 15];
const STATUSES = ['All', 'Pending', 'In Progress', 'Escalated', 'Resolved'];
const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];

const STATUS_BY_PARAM = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  inprogress: 'In Progress',
  escalated: 'Escalated',
  resolved: 'Resolved',
};

const STATUS_TO_PARAM = {
  Pending: 'pending',
  'In Progress': 'in-progress',
  Escalated: 'escalated',
  Resolved: 'resolved',
};

const PRIORITY_BY_PARAM = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const PRIORITY_TO_PARAM = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
};

function fromParam(value, map) {
  if (!value) return 'All';
  return map[value.trim().toLowerCase()] ?? 'All';
}

export default function Complaints() {
  const toast = useToast();
  const auth = useAuth();
  const db = useComplaints();
  const refreshComplaints = db.refresh;
  const [params, setParams] = useSearchParams();

  const [selected, setSelected] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [status, setStatus] = useState(() => fromParam(params.get('status'), STATUS_BY_PARAM));
  const [priority, setPriority] = useState(() => fromParam(params.get('priority'), PRIORITY_BY_PARAM));
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const assignees = useMemo(() => {
    const owner = auth.user?.owner_name || auth.user?.name;
    return ['Unassigned', owner].filter(Boolean);
  }, [auth.user?.name, auth.user?.owner_name]);

  useEffect(() => {
    setQuery(params.get('q') ?? '');
    setStatus(fromParam(params.get('status'), STATUS_BY_PARAM));
    setPriority(fromParam(params.get('priority'), PRIORITY_BY_PARAM));
  }, [params]);

  useEffect(() => setPage(1), [query, status, priority, pageSize]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshComplaints({
        q: query.trim(),
        status: status === 'All' ? '' : status,
        priority: priority === 'All' ? '' : priority,
        pageSize: 100,
      });
    }, 220);
    return () => window.clearTimeout(timer);
  }, [priority, query, refreshComplaints, status]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return db.items
      .filter((c) => (status === 'All' ? true : c.status === status))
      .filter((c) => (priority === 'All' ? true : c.priority === priority))
      .filter((c) => {
        if (!q) return true;
        const hay = `${c.id} ${c.customer_name} ${c.complaint_text} ${c.assignee} ${c.category} ${c.department} ${c.source}`.toLowerCase();
        return hay.includes(q);
      });
  }, [db.items, priority, query, status]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey] ?? '').toLowerCase();
      const bv = String(b[sortKey] ?? '').toLowerCase();
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [filtered, sortDir, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = useMemo(() => sorted.slice((page - 1) * pageSize, page * pageSize), [page, pageSize, sorted]);
  const hasActiveFilters = Boolean(query.trim()) || status !== 'All' || priority !== 'All';
  const activeFilters = [
    status !== 'All' ? { label: 'Status', value: status } : null,
    priority !== 'All' ? { label: 'Priority', value: priority } : null,
    query.trim() ? { label: 'Search', value: query.trim() } : null,
  ].filter(Boolean);

  const columns = [
    { key: 'id', label: 'Case', sortable: true, sticky: 'left' },
    { key: 'customer_name', label: 'Customer', sortable: true },
    { key: 'complaint_text', label: 'Complaint', wrap: true, render: (row) => <span className="line-clamp-2">{row.complaint_text}</span> },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true, render: (row) => <Badge>{row.priority}</Badge> },
    { key: 'status', label: 'Status', sortable: true, render: (row) => <Badge>{row.status}</Badge> },
    { key: 'department', label: 'Department' },
    { key: 'source', label: 'Source' },
  ];

  const onSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const updateUrlFilters = (updates) => {
    const next = new URLSearchParams(params);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'All') next.delete(key);
      else next.set(key, value);
    });

    setParams(next, { replace: true });
  };

  const onQueryChange = (value) => {
    setQuery(value);
    updateUrlFilters({ q: value.trim() ? value : '' });
  };

  const onStatusChange = (value) => {
    setStatus(value);
    updateUrlFilters({ status: STATUS_TO_PARAM[value] ?? '' });
  };

  const onPriorityChange = (value) => {
    setPriority(value);
    updateUrlFilters({ priority: PRIORITY_TO_PARAM[value] ?? '' });
  };

  const resetFilters = () => {
    setQuery('');
    setStatus('All');
    setPriority('All');
    setParams(new URLSearchParams(), { replace: true });
  };

  const openNew = () => {
    setSelected({
      id: 'NEW',
      customer_name: '',
      contactEmail: '',
      complaint_text: '',
      category: 'ATM Issue',
      source: 'Admin Upload',
      status: 'Pending',
      priority: 'Medium',
      sentiment: 'Neutral',
      confidence: 82,
      department: 'Digital Banking Operations',
      assignee: 'Unassigned',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
      _mode: 'create',
    });
  };

  const saveSelected = async () => {
    if (!selected) return;
    try {
      if (selected._mode === 'create') {
        if (!selected.customer_name.trim() || selected.complaint_text.trim().length < 20) {
          toast.error('Missing details', 'Add customer name and a complaint longer than 20 characters.', { durationMs: 3600 });
          return;
        }
        const created = await db.submit({
          name: selected.customer_name,
          email: selected.contactEmail,
          subject: selected.complaint_text.slice(0, 72),
          message: selected.complaint_text,
          category: selected.category,
          department: selected.department,
        });
        await db.update(created.id, {
          priority: selected.priority,
          sentiment: selected.sentiment,
          source: selected.source,
        });
        toast.success('Case created', `${created.id} added to the enterprise queue.`, { durationMs: 2800 });
        setSelected(null);
        return;
      }
      await db.update(selected.id, selected);
      toast.success('Case saved', `${selected.id} updated.`, { durationMs: 2600 });
      setSelected(null);
    } catch (error) {
      toast.error('Save failed', error.message || 'The complaint could not be saved.', { durationMs: 4200 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-t-accent">Complaint Operations</p>
          <h1 className="mt-2 font-display text-3xl font-black text-t-text sm:text-4xl">Complaint Management</h1>
          <p className="mt-2 max-w-3xl text-t-text-muted">Search, audit, assign, and resolve AI-classified complaint records from every connected source.</p>
        </div>
        <Button icon={Plus} onClick={openNew}>
          Add Complaint
        </Button>
      </div>

      <Card>
        <CardHeader
          title="Enterprise Queue"
          eyebrow="Database-backed records"
          action={
            <Button
              variant="secondary"
              icon={Filter}
              className={hasActiveFilters ? 'border-t-accent/40 bg-t-accent-subtle text-t-text' : undefined}
              onClick={() => setFilterOpen(true)}
            >
              Filter
            </Button>
          }
        />
        <CardBody>
          <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-t-text-faint" />
              <Input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                className={cn('pl-10', query.trim() && 'border-t-accent/40 bg-t-accent-subtle')}
                placeholder="Search by customer, complaint, category, department, source..."
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className={cn('h-11 w-40', status !== 'All' && 'border-t-accent/40 bg-t-accent-subtle')}
              >
                {STATUSES.map((item) => <option key={item}>{item}</option>)}
              </Select>
              <Select
                value={priority}
                onChange={(e) => onPriorityChange(e.target.value)}
                className={cn('h-11 w-40', priority !== 'All' && 'border-t-accent/40 bg-t-accent-subtle')}
              >
                {PRIORITIES.map((item) => <option key={item}>{item}</option>)}
              </Select>
              <Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="h-11 w-24">
                {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
              </Select>
            </div>
          </div>
          {activeFilters.length ? (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-t-accent/20 bg-t-accent-subtle px-3 py-2">
              <span className="label-caps text-t-accent">Active filter</span>
              {activeFilters.map((item) => (
                <Badge key={`${item.label}-${item.value}`} className="border-t-accent/30 bg-t-accent-subtle text-t-accent">
                  {item.label}: {item.value}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="ml-auto" onClick={resetFilters}>
                Clear
              </Button>
            </div>
          ) : null}
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-t-text-muted">
              Showing <span className="font-semibold text-t-text">{paged.length}</span> of <span className="font-semibold text-t-text">{sorted.length}</span> records
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Prev
              </Button>
              <span className="text-sm text-t-text-muted">{page} / {totalPages}</span>
              <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          </div>
          <Table columns={columns} rows={paged} onRowClick={setSelected} sort={{ key: sortKey, dir: sortDir }} onSort={onSort} />
        </CardBody>
      </Card>

      <Modal
        open={Boolean(selected)}
        title={selected ? (selected._mode === 'create' ? 'Add single complaint' : selected.id) : 'Complaint'}
        onClose={() => setSelected(null)}
        placement="right"
        className="max-w-4xl"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
            {selected?._mode !== 'create' ? (
              <>
                <Button variant="secondary" icon={UserPlus} onClick={() => setSelected((prev) => ({ ...prev, assignee: prev.assignee === 'Unassigned' ? assignees.find((item) => item !== 'Unassigned') || 'Unassigned' : prev.assignee, status: prev.status === 'Pending' ? 'In Progress' : prev.status }))}>
                  Assign
                </Button>
                <Button variant="secondary" icon={ClipboardCheck} onClick={() => setSelected((prev) => ({ ...prev, status: 'Resolved' }))}>
                  Resolve
                </Button>
              </>
            ) : null}
            <Button onClick={saveSelected}>{selected?._mode === 'create' ? 'Create Case' : 'Save Changes'}</Button>
          </div>
        }
      >
        {selected ? (
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Customer Name">
                <Input value={selected.customer_name} onChange={(e) => setSelected((prev) => ({ ...prev, customer_name: e.target.value }))} />
              </Field>
              <Field label="Customer Email">
                <Input value={selected.contactEmail ?? selected.customer_email ?? ''} onChange={(e) => setSelected((prev) => ({ ...prev, contactEmail: e.target.value }))} inputMode="email" />
              </Field>
              <Field label="Category">
                <Select value={selected.category} onChange={(e) => setSelected((prev) => ({ ...prev, category: e.target.value }))}>
                  {complaintCategories.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </Field>
              <Field label="Department">
                <Input value={selected.department} onChange={(e) => setSelected((prev) => ({ ...prev, department: e.target.value }))} />
              </Field>
              <Field label="Priority">
                <Select value={selected.priority} onChange={(e) => setSelected((prev) => ({ ...prev, priority: e.target.value }))}>
                  {PRIORITIES.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={selected.status} onChange={(e) => setSelected((prev) => ({ ...prev, status: e.target.value }))}>
                  {STATUSES.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}
                </Select>
              </Field>
              <Field label="Source">
                <Input value={selected.source} onChange={(e) => setSelected((prev) => ({ ...prev, source: e.target.value }))} />
              </Field>
              <Field label="Assignee">
                <Select value={selected.assignee} onChange={(e) => setSelected((prev) => ({ ...prev, assignee: e.target.value }))}>
                  {assignees.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Complaint Text">
              <Textarea rows={7} value={selected.complaint_text} onChange={(e) => setSelected((prev) => ({ ...prev, complaint_text: e.target.value }))} />
            </Field>
            <Field label="Internal Notes">
              <Textarea rows={4} value={selected.notes ?? ''} onChange={(e) => setSelected((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Resolution notes, callback status, evidence links..." />
            </Field>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={filterOpen}
        title="Filter and sort queue"
        onClose={() => setFilterOpen(false)}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setFilterOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                resetFilters();
                setSortKey('date');
                setSortDir('desc');
                setFilterOpen(false);
              }}
            >
              Reset
            </Button>
          </div>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Sort by">
            <Select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
              <option value="date">Date</option>
              <option value="customer_name">Customer</option>
              <option value="category">Category</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
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
