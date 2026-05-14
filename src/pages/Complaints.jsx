import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BrainCircuit,
  Download,
  Filter,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card, { CardBody, CardHeader } from '../components/Card';
import ComplaintDetailView from '../components/ComplaintDetailView';
import ComplaintsTable from '../components/ComplaintsTable';
import { Field, Input, Select, Textarea } from '../components/Input';
import Modal from '../components/Modal';
import { complaintCategories } from '../data/complaints';
import { apiDownload } from '../lib/api';
import { useAuth } from '../state/auth';
import { useComplaints } from '../state/complaints';
import { useToast } from '../state/toast';
import { cn } from '../utils/cn';

const PAGE_SIZES = [6, 10, 15];
const STATUSES = ['All', 'Pending Analysis', 'Solved', 'Analysis Failed'];
const ANALYSIS_STATES = ['All', 'Not Analyzed', 'Analyzed', 'Failed'];
const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];

const STATUS_BY_PARAM = {
  pending: 'Pending Analysis',
  'pending-analysis': 'Pending Analysis',
  pendinganalysis: 'Pending Analysis',
  'analysis-failed': 'Analysis Failed',
  failed: 'Analysis Failed',
  solved: 'Solved',
  resolved: 'Solved',
};

const STATUS_TO_PARAM = {
  Solved: 'solved',
  'Pending Analysis': 'pending-analysis',
  'Analysis Failed': 'analysis-failed',
};

const ANALYSIS_BY_PARAM = {
  analyzed: 'Analyzed',
  'not-analyzed': 'Not Analyzed',
  notanalyzed: 'Not Analyzed',
  failed: 'Failed',
};

const ANALYSIS_TO_PARAM = {
  Analyzed: 'analyzed',
  'Not Analyzed': 'not-analyzed',
  Failed: 'failed',
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
  const [analysisState, setAnalysisState] = useState(() => fromParam(params.get('analysis'), ANALYSIS_BY_PARAM));
  const [priority, setPriority] = useState(() => fromParam(params.get('priority'), PRIORITY_BY_PARAM));
  const [categoryFilter, setCategoryFilter] = useState(params.get('category') ?? 'All');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [analyzingId, setAnalyzingId] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [exporting, setExporting] = useState('');
  const workspaceName = auth.user?.organization_name || auth.user?.company || 'Workspace';

  useEffect(() => {
    setQuery(params.get('q') ?? '');
    setStatus(fromParam(params.get('status'), STATUS_BY_PARAM));
    setAnalysisState(fromParam(params.get('analysis'), ANALYSIS_BY_PARAM));
    setPriority(fromParam(params.get('priority'), PRIORITY_BY_PARAM));
    setCategoryFilter(params.get('category') ?? 'All');
  }, [params]);

  useEffect(() => setPage(1), [query, status, analysisState, priority, categoryFilter, pageSize]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshComplaints({
        q: query.trim(),
        status: status === 'All' ? '' : status,
        analysis_state: analysisState === 'All' ? '' : analysisState,
        priority: priority === 'All' ? '' : priority,
        category: categoryFilter === 'All' ? '' : categoryFilter,
        pageSize: 100,
      });
    }, 220);
    return () => window.clearTimeout(timer);
  }, [analysisState, categoryFilter, priority, query, refreshComplaints, status]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return db.items
      .filter((c) => (status === 'All' ? true : c.status === status))
      .filter((c) => {
        if (analysisState === 'All') return true;
        if (analysisState === 'Analyzed') return c.status === 'Solved';
        if (analysisState === 'Failed') return c.status === 'Analysis Failed';
        return c.status === 'Pending Analysis';
      })
      .filter((c) => (priority === 'All' ? true : c.status === 'Solved' && c.priority === priority))
      .filter((c) => (categoryFilter === 'All' ? true : c.status === 'Solved' && c.category === categoryFilter))
      .filter((c) => {
        if (!q) return true;
        const hay = `${c.id} ${c.customer_name} ${c.complaint_text} ${c.assignee} ${c.category} ${c.department} ${c.source}`.toLowerCase();
        return hay.includes(q);
      });
  }, [analysisState, categoryFilter, db.items, priority, query, status]);

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
  const hasActiveFilters = Boolean(query.trim()) || status !== 'All' || analysisState !== 'All' || priority !== 'All' || categoryFilter !== 'All';
  const activeFilters = [
    status !== 'All' ? { label: 'Status', value: status } : null,
    analysisState !== 'All' ? { label: 'Analysis', value: analysisState } : null,
    priority !== 'All' ? { label: 'Priority', value: priority } : null,
    categoryFilter !== 'All' ? { label: 'Category', value: categoryFilter } : null,
    query.trim() ? { label: 'Search', value: query.trim() } : null,
  ].filter(Boolean);

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

  const onAnalysisStateChange = (value) => {
    setAnalysisState(value);
    updateUrlFilters({ analysis: ANALYSIS_TO_PARAM[value] ?? '' });
  };

  const onPriorityChange = (value) => {
    setPriority(value);
    updateUrlFilters({ priority: PRIORITY_TO_PARAM[value] ?? '' });
  };

  const onCategoryChange = (value) => {
    setCategoryFilter(value);
    updateUrlFilters({ category: value === 'All' ? '' : value });
  };

  const resetFilters = () => {
    setQuery('');
    setStatus('All');
    setAnalysisState('All');
    setPriority('All');
    setCategoryFilter('All');
    setParams(new URLSearchParams(), { replace: true });
  };

  const openNew = () => {
    setSelected({
      id: 'NEW',
      customer_name: '',
      contactEmail: '',
      complaint_text: '',
      category: null,
      source: 'Admin Upload',
      status: 'Pending Analysis',
      priority: null,
      sentiment: null,
      confidence: null,
      department: null,
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
          source: selected.source || 'Admin Upload',
        });
        toast.success('Case created', `${created.id} is pending AI analysis.`, { durationMs: 2800 });
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

  const deleteComplaint = async () => {
    if (!deleteTarget?.id) return;
    setDeletingId(deleteTarget.id);
    try {
      await db.remove(deleteTarget.id);
      if (selected?.id === deleteTarget.id) setSelected(null);
      toast.success('Complaint deleted', `${deleteTarget.id} was removed from PostgreSQL.`, { durationMs: 2800 });
      setDeleteTarget(null);
    } catch (error) {
      toast.error('Delete failed', error.message || 'The complaint could not be deleted.', { durationMs: 4200 });
    } finally {
      setDeletingId('');
    }
  };

  const selectedAnalyzed = selected?.status === 'Solved' && Boolean(selected.category && selected.priority && selected.sentiment && selected.confidence != null);
  const viewingSolved = status === 'Solved';

  const buildExportParams = (overrides = {}) => {
    const exportParams = new URLSearchParams({ format: 'xlsx' });
    const nextStatus = overrides.status ?? status;
    const nextScope = overrides.scope;
    if (nextScope) exportParams.set('scope', nextScope);
    if (query.trim() && !nextScope) exportParams.set('q', query.trim());
    if (nextStatus && nextStatus !== 'All' && !nextScope) exportParams.set('status', nextStatus);
    if (analysisState !== 'All' && !nextScope) exportParams.set('analysis_state', analysisState);
    if (priority !== 'All' && !nextScope) exportParams.set('priority', priority);
    if (categoryFilter !== 'All' && !nextScope) exportParams.set('category', categoryFilter);
    return exportParams;
  };

  const downloadWorkbook = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `complaint_export_${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportWorkbook = async ({ kind, label, params: exportParams }) => {
    setExporting(kind);
    try {
      const { blob, filename } = await apiDownload(`/complaints/export?${exportParams.toString()}`, { timeoutMs: 60000 });
      downloadWorkbook(blob, filename);
      toast.success('Export ready', `${label} downloaded as an Excel workbook.`, { durationMs: 3000 });
    } catch (error) {
      toast.error('Export failed', error.message || `${label} could not be exported.`, { durationMs: 4200 });
    } finally {
      setExporting('');
    }
  };

  const exportSolvedComplaints = () => exportWorkbook({
    kind: 'solved',
    label: 'Solved complaints',
    params: buildExportParams({ status: 'Solved' }),
  });

  const exportFullSummary = () => exportWorkbook({
    kind: 'full',
    label: 'Full complaint summary',
    params: buildExportParams({ scope: 'full' }),
  });

  return (
    <div className="min-w-0 max-w-full space-y-6 overflow-hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-t-accent">Complaint Operations</p>
          <h1 className="mt-2 font-display text-3xl font-black text-t-text sm:text-4xl">Complaint Management</h1>
          <p className="mt-2 max-w-3xl text-t-text-muted">Search, audit, analyze, and solve AI-classified complaint records from every connected source.</p>
        </div>
        <Button icon={Plus} onClick={openNew}>
          Add Complaint
        </Button>
      </div>

      <Card className="min-w-0 max-w-full overflow-hidden">
        <CardHeader
          title="Enterprise Queue"
          eyebrow="Database-backed records"
          action={
            <div className="flex flex-wrap justify-end gap-2">
              {viewingSolved ? (
                <Button
                  variant="secondary"
                  icon={Download}
                  loading={exporting === 'solved'}
                  disabled={Boolean(exporting)}
                  className="w-full whitespace-nowrap sm:w-auto"
                  onClick={exportSolvedComplaints}
                >
                  {exporting === 'solved' ? 'Exporting...' : 'Export Solved Complaints'}
                </Button>
              ) : null}
              <Button
                variant="secondary"
                icon={Download}
                loading={exporting === 'full'}
                disabled={Boolean(exporting)}
                className="w-full whitespace-nowrap sm:w-auto"
                onClick={exportFullSummary}
              >
                {exporting === 'full' ? 'Exporting...' : 'Export Full Summary'}
              </Button>
              <Button
                variant="secondary"
                icon={Filter}
                className={cn('w-full whitespace-nowrap sm:w-auto', hasActiveFilters && 'border-t-accent/40 bg-t-accent-subtle text-t-text')}
                onClick={() => setFilterOpen(true)}
              >
                Filter
              </Button>
            </div>
          }
        />
        <CardBody className="min-w-0 max-w-full">
          <div className="mb-3 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                aria-label="Status filter"
                className={cn('h-10 w-full sm:w-40', status !== 'All' && 'border-t-accent/40 bg-t-accent-subtle')}
              >
                {STATUSES.map((item) => <option key={item}>{item}</option>)}
              </Select>
              <Select
                value={analysisState}
                onChange={(e) => onAnalysisStateChange(e.target.value)}
                aria-label="Analysis filter"
                className={cn('h-10 w-full sm:w-44', analysisState !== 'All' && 'border-t-accent/40 bg-t-accent-subtle')}
              >
                {ANALYSIS_STATES.map((item) => <option key={item}>{item}</option>)}
              </Select>
              <Select
                value={priority}
                onChange={(e) => onPriorityChange(e.target.value)}
                aria-label="Priority filter"
                className={cn('h-10 w-full sm:w-40', priority !== 'All' && 'border-t-accent/40 bg-t-accent-subtle')}
              >
                {PRIORITIES.map((item) => <option key={item}>{item}</option>)}
              </Select>
              <Select
                value={categoryFilter}
                onChange={(e) => onCategoryChange(e.target.value)}
                aria-label="Category filter"
                className={cn('h-10 w-full sm:w-44', categoryFilter !== 'All' && 'border-t-accent/40 bg-t-accent-subtle')}
              >
                <option>All</option>
                {complaintCategories.map((item) => <option key={item}>{item}</option>)}
              </Select>
              <Select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                aria-label="Rows per page"
                className="h-10 w-full sm:w-24"
              >
                {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-full whitespace-nowrap sm:w-auto"
                disabled={!hasActiveFilters}
                onClick={resetFilters}
              >
                Clear filters
              </Button>
            </div>
            <div className="relative max-w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-t-text-faint" />
              <Input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                className={cn('h-10 pl-10', query.trim() && 'border-t-accent/40 bg-t-accent-subtle')}
                placeholder="Search by customer, complaint, category, department, source..."
              />
            </div>
          </div>
          {activeFilters.length ? (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-t-accent/20 bg-t-accent-subtle px-3 py-1.5">
              <span className="label-caps text-t-accent">Active filter</span>
              {activeFilters.map((item) => (
                <Badge key={`${item.label}-${item.value}`} className="border-t-accent/30 bg-t-accent-subtle text-t-accent">
                  {item.label}: {item.value}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="ml-auto h-8" onClick={resetFilters}>
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
          <ComplaintsTable
            rows={paged}
            onView={setSelected}
            onAnalyze={(row) => void analyzeCase(row)}
            onDelete={setDeleteTarget}
            analyzingId={analyzingId}
            deletingId={deletingId}
            sort={{ key: sortKey, dir: sortDir }}
            onSort={onSort}
          />
        </CardBody>
      </Card>

      <Modal
        open={Boolean(selected)}
        title={selected ? (selected._mode === 'create' ? 'Add single complaint' : selected.id) : 'Complaint'}
        onClose={() => setSelected(null)}
        placement={selected?._mode === 'create' ? 'right' : 'center'}
        className={selected?._mode === 'create' ? 'max-w-4xl' : 'max-w-5xl'}
        bodyClassName={selected?._mode === 'create' ? undefined : 'p-0'}
        footerClassName={selected?._mode === 'create' ? undefined : 'p-4 sm:p-5'}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
            {selected?._mode !== 'create' ? (
              <>
                <Button
                  variant="danger"
                  icon={Trash2}
                  loading={Boolean(selected && deletingId === selected.id)}
                  disabled={Boolean(selected && (deletingId === selected.id || analyzingId === selected.id))}
                  onClick={() => setDeleteTarget(selected)}
                >
                  {selected && deletingId === selected.id ? 'Deleting...' : 'Delete'}
                </Button>
                <Button
                  variant={selectedAnalyzed ? 'secondary' : 'primary'}
                  icon={BrainCircuit}
                  loading={Boolean(selected && analyzingId === selected.id)}
                  disabled={Boolean(selected && analyzingId === selected.id)}
                  onClick={() => void analyzeCase(selected)}
                >
                  {selected && analyzingId === selected.id
                    ? 'Analyzing...'
                    : selected?.status === 'Analysis Failed'
                      ? 'Retry Analysis'
                      : selectedAnalyzed
                        ? 'Re-analyze'
                        : 'Run AI Analysis'}
                </Button>
              </>
            ) : (
              <Button onClick={saveSelected}>Create Case</Button>
            )}
          </div>
        }
      >
        {selected?._mode === 'create' ? (
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Customer Name">
                <Input value={selected.customer_name} onChange={(e) => setSelected((prev) => ({ ...prev, customer_name: e.target.value }))} />
              </Field>
              <Field label="Customer Email">
                <Input value={selected.contactEmail ?? selected.customer_email ?? ''} onChange={(e) => setSelected((prev) => ({ ...prev, contactEmail: e.target.value }))} inputMode="email" />
              </Field>
              <Field label="Source">
                <Input value={selected.source} onChange={(e) => setSelected((prev) => ({ ...prev, source: e.target.value }))} />
              </Field>
            </div>
            <Field label="Complaint Text">
              <Textarea rows={7} value={selected.complaint_text} onChange={(e) => setSelected((prev) => ({ ...prev, complaint_text: e.target.value }))} />
            </Field>
            <Field label="Internal Notes">
              <Textarea rows={4} value={selected.notes ?? ''} onChange={(e) => setSelected((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Resolution notes, callback status, evidence links..." />
            </Field>
          </div>
        ) : selected ? (
          <ComplaintDetailView complaint={selected} workspaceName={workspaceName} analyzing={analyzingId === selected.id} />
        ) : null}
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete complaint"
        onClose={() => (deletingId ? null : setDeleteTarget(null))}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" disabled={Boolean(deletingId)} onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" icon={Trash2} loading={Boolean(deletingId)} disabled={Boolean(deletingId)} onClick={() => void deleteComplaint()}>
              {deletingId ? 'Deleting...' : 'Delete Complaint'}
            </Button>
          </div>
        }
      >
        <div className="rounded-lg border border-t-border bg-t-panel p-4">
          <p className="font-display text-base font-bold text-t-text">Are you sure you want to delete this complaint?</p>
          <p className="mt-2 text-sm leading-6 text-t-text-muted">
            {deleteTarget?.id} will be permanently removed from PostgreSQL. This only deletes the complaint record and its stored analysis fields.
          </p>
        </div>
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
