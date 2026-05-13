/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { apiFetch, getAccessToken } from '../lib/api';

function titleFromComplaint(text) {
  const firstSentence = String(text ?? '').split(/[.!?]/)[0] ?? '';
  return firstSentence.length > 74 ? `${firstSentence.slice(0, 74)}...` : firstSentence;
}

function confidencePercent(value) {
  if (value == null || value === '') return null;
  const numeric = Number(value || 0);
  return numeric <= 1 ? numeric * 100 : numeric;
}

function normalizeStatus(status) {
  if (['Pending', 'In Progress', 'Escalated'].includes(status)) return 'Pending Analysis';
  if (status === 'Resolved') return 'Solved';
  return status || 'Pending Analysis';
}

export function normalizeComplaint(c) {
  const complaintText = c.complaint_text ?? c.message ?? '';
  const customerName = c.customer_name ?? c.customer ?? 'Unknown Customer';
  const created = c.created_at ?? c.createdAt ?? c.date ?? new Date().toISOString();
  const date = c.date ?? String(created).slice(0, 10);
  const source = c.source ?? c.channel ?? 'Portal';
  const status = normalizeStatus(c.status);
  const confidence = confidencePercent(c.confidence_score ?? c.confidence ?? c.risk);
  const analyzed = status === 'Solved' && Boolean(c.category && c.sentiment && c.priority && confidence != null);

  return {
    ...c,
    status,
    customer_name: customerName,
    complaint_text: complaintText,
    date,
    source,
    customer: customerName,
    subject: c.subject ?? titleFromComplaint(complaintText),
    message: complaintText,
    channel: c.channel ?? source,
    risk: confidence,
    confidence,
    confidence_score: confidence,
    category: analyzed ? c.category : null,
    sentiment: analyzed ? c.sentiment : null,
    priority: analyzed ? c.priority : null,
    department: analyzed ? c.department : null,
    ai_explanation: analyzed || status === 'Analysis Failed' ? c.ai_explanation : null,
    analyzed_at: c.analyzed_at ?? c.analyzedAt ?? null,
    isAnalyzed: analyzed,
    createdAt: c.createdAt ?? c.created_at ?? date,
    updatedAt: c.updatedAt ?? c.updated_at ?? c.last_activity ?? date,
    contactEmail: c.contactEmail ?? c.customer_email ?? c.contact_email ?? '',
    notes: c.notes ?? '',
    timeline:
      c.timeline ??
      [
        { label: 'Received', at: date, completed: true },
        { label: 'AI Analysis', at: c.analyzed_at ? 'AI complete' : '-', completed: analyzed },
        { label: 'Solved', at: status === 'Solved' ? 'Completed' : '-', completed: status === 'Solved' },
      ],
  };
}

const ComplaintsContext = createContext(null);

function upsert(list, item) {
  const normalized = normalizeComplaint(item);
  const exists = list.some((entry) => entry.id === normalized.id);
  return exists ? list.map((entry) => (entry.id === normalized.id ? normalized : entry)) : [normalized, ...list];
}

export function ComplaintsProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async (filters = {}) => {
    if (!getAccessToken()) {
      setItems([]);
      return [];
    }

    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page_size: filters.pageSize ?? 100 });
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'pageSize') params.set(key, value);
      });
      const response = await apiFetch(`/complaints?${params.toString()}`);
      const next = (response.items ?? []).map(normalizeComplaint);
      setItems(next);
      return next;
    } catch (err) {
      setError(err.message || 'Unable to load complaints');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(
    (id) => items.find((c) => c.id.toLowerCase() === String(id).trim().toLowerCase()) ?? null,
    [items],
  );

  const fetchById = useCallback(
    async (id) => {
      const cached = getById(id);
      if (cached) return cached;
      const item = await apiFetch(`/complaints/${encodeURIComponent(id)}`);
      const normalized = normalizeComplaint(item);
      setItems((prev) => upsert(prev, normalized));
      return normalized;
    },
    [getById],
  );

  const submit = useCallback(async ({ name, email, subject, message, category, department, source, attachmentName }) => {
    const item = await apiFetch('/complaints', {
      method: 'POST',
      body: {
        customer_name: name,
        customer_email: email || null,
        complaint_text: message,
        category: category || null,
        department: department || null,
        source: source ?? 'Portal',
        notes: [subject, attachmentName ? `Attachment: ${attachmentName}` : ''].filter(Boolean).join('\n'),
      },
    });
    const normalized = normalizeComplaint(item);
    setItems((prev) => upsert(prev, normalized));
    return normalized;
  }, []);

  const update = useCallback(async (id, patch) => {
    const body = {
      customer_name: patch.customer_name,
      customer_email: patch.customer_email ?? patch.contactEmail,
      complaint_text: patch.complaint_text,
      category: patch.category,
      sentiment: patch.sentiment,
      priority: patch.priority,
      status: patch.status,
      department: patch.department,
      source: patch.source,
      assignee: patch.assignee,
      notes: patch.notes,
      resolution_time_hours: patch.resolution_time_hours,
    };
    const item = await apiFetch(`/complaints/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined)),
    });
    const normalized = normalizeComplaint(item);
    setItems((prev) => upsert(prev, normalized));
    return normalized;
  }, []);

  const analyze = useCallback(
    async (complaint) => {
      const source = typeof complaint === 'string' ? getById(complaint) : complaint;
      if (!source?.id || !source?.complaint_text) throw new Error('Complaint text is required for AI analysis.');

      const item = await apiFetch(`/complaints/${encodeURIComponent(source.id)}/analyze`, { method: 'POST' });
      const normalized = normalizeComplaint(item);
      setItems((prev) => upsert(prev, normalized));
      return normalized;
    },
    [getById],
  );

  const advanceStatus = useCallback(async (id) => {
    const item = await apiFetch(`/complaints/${encodeURIComponent(id)}/advance`, { method: 'POST' });
    const normalized = normalizeComplaint(item);
    setItems((prev) => upsert(prev, normalized));
    return normalized;
  }, []);

  const api = useMemo(
    () => ({
      items,
      loading,
      error,
      refresh,
      getById,
      fetchById,
      submit,
      update,
      analyze,
      advanceStatus,
    }),
    [advanceStatus, analyze, error, fetchById, getById, items, loading, refresh, submit, update],
  );

  return <ComplaintsContext.Provider value={api}>{children}</ComplaintsContext.Provider>;
}

export function useComplaints() {
  const ctx = useContext(ComplaintsContext);
  if (!ctx) throw new Error('useComplaints must be used within ComplaintsProvider');
  return ctx;
}
