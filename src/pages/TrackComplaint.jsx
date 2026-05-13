import { Download, FileText, MessageSquare, Search, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import Card, { CardBody, CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import { Field, Input } from '../components/Input';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { apiFetch } from '../lib/api';
import { normalizeComplaint } from '../state/complaints';
import { useToast } from '../state/toast';

export default function TrackComplaint() {
  const toast = useToast();
  const [params] = useSearchParams();
  const seeded = params.get('id') ?? '';

  const [complaintId, setComplaintId] = useState(seeded);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [confirmEscalate, setConfirmEscalate] = useState(false);

  const statusFlow = useMemo(() => {
    const base = result?.timeline?.length
      ? result.timeline.map((t) => ({ label: t.label, completed: Boolean(t.completed) }))
      : [
          { label: 'Received', completed: true },
          { label: 'AI Analysis', completed: result?.status === 'Solved' },
          { label: 'Solved', completed: result?.status === 'Solved' },
        ];
    return base;
  }, [result]);
  const resolutionTeam = useMemo(() => {
    if (!result) return [];
    const handler = result.assignee && result.assignee !== 'Unassigned' ? result.assignee : 'Operations team';
    return [handler];
  }, [result]);

  const lookup = useCallback(async (id) => {
    const value = String(id ?? '').trim();
    if (!value) {
      toast.error('Tracking failed', 'Complaint ID required.', { durationMs: 3200 });
      setNotFound(false);
      setResult(null);
      return;
    }
    setLoading(true);
    setNotFound(false);
    setResult(null);
    try {
      const c = normalizeComplaint(await apiFetch(`/public/track/${encodeURIComponent(value)}`, { token: null }));
      setResult(c);
      toast.success('Signal locked', `Tracking loaded for ${c.id}.`, { durationMs: 2400 });
    } catch {
      setNotFound(true);
      toast.error('Complaint not found', 'Verify the ID and try again.', { durationMs: 4200 });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!seeded) return;
    void lookup(seeded);
  }, [lookup, seeded]);

  const downloadReport = () => {
    if (!result) {
      toast.error('No complaint loaded', 'Enter a valid complaint ID first.', { durationMs: 3200 });
      return;
    }
    const payload = {
      id: result.id,
      customer: result.customer,
      status: result.status,
      priority: result.priority,
      timeline: result.timeline,
      details: result.message,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentra-complaint-${result.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report generated', 'Downloaded tracking report.', { durationMs: 2600 });
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="mb-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="label-caps text-t-accent">Tracking Console</p>
          <h1 className="mt-3 font-display text-4xl font-black text-t-text">Track Complaint</h1>
          <p className="mt-3 text-t-text-muted">Enter your complaint ID to view status, timeline, and resolution activity.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon={Download} onClick={downloadReport} disabled={!result}>
            Generate Report
          </Button>
          <Button icon={FileText} onClick={() => setConfirmEscalate(true)} disabled={!result}>
            Escalate Case
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader title="Complaint ID Lookup" eyebrow="Tracking input" />
        <CardBody>
          <form
            className="grid gap-4 sm:grid-cols-[1fr_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              void lookup(complaintId);
            }}
          >
            <Field label="Complaint ID" hint="Example: AE-9942">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-t-text-faint" />
                <Input value={complaintId} onChange={(e) => setComplaintId(e.target.value)} className="pl-12" placeholder="AE-9942" />
              </div>
            </Field>
            <div className="flex items-end">
              <Button type="submit" size="lg" className="h-[50px] w-full sm:w-auto" loading={loading}>
                {loading ? 'Scanning...' : 'Track'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {loading ? <Loader label="Loading complaint timeline..." /> : null}
      {notFound ? (
        <Card className="border-t-error/30 bg-t-error-subtle">
          <CardBody>
            <p className="font-display text-xl font-bold text-t-error">Complaint not found</p>
            <p className="mt-2 text-sm leading-6 text-t-error">Double-check the ID and try again. If you just submitted, wait a moment and retry.</p>
          </CardBody>
        </Card>
      ) : null}

      {result ? (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <Card>
            <CardHeader title="Complaint Lifecycle" eyebrow="Customer complaint lifecycle" />
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-4">
                {statusFlow.map((step) => (
                  <div key={step.label} className="relative rounded-lg border border-t-border bg-t-panel p-4">
                    <div className={`mb-4 grid h-9 w-9 place-items-center rounded-full ${step.completed ? 'bg-t-accent text-t-text' : 'bg-t-panel-high text-t-text-muted'}`}>
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <p className="font-display text-sm font-bold text-t-text">{step.label}</p>
                    <p className="mt-1 text-xs text-t-text-muted">{step.completed ? 'Completed' : 'Pending'}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader title="Verification Log" eyebrow="Chain of custody" />
              <CardBody className="space-y-4 text-sm">
                {['Source origin confirmed', 'Customer record validated', result.status === 'Solved' ? 'AI category assigned' : 'Awaiting AI analysis', result.status === 'Solved' ? 'Confidence score locked' : 'Confidence pending'].map((item) => (
                  <div key={item} className="flex items-center justify-between border-b border-t-border pb-3 last:border-0 last:pb-0">
                    <span className="text-t-text-muted">{item}</span>
                    <span className="text-t-accent">Verified</span>
                  </div>
                ))}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Live Activity" eyebrow="Latest movements" />
              <CardBody className="space-y-4">
                {(result.status === 'Solved' ? ['Classification rules applied', 'Priority score calculated', 'Resolution status updated'] : ['Complaint received', 'Queued for AI review', 'Analysis pending']).map((item, index) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-t-accent" />
                    <div>
                      <p className="text-sm font-semibold text-t-text">{item}</p>
                      <p className="text-xs text-t-text-muted">{index + 4} min ago</p>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </section>

        <aside className="space-y-6">
          <Card>
            <CardHeader title="Sentra AI" eyebrow="Current assessment" />
            <CardBody>
              <Badge>{result.status}</Badge>
              <p className="mt-4 text-sm leading-6 text-t-text-muted">{result.message}</p>
              <div className="mt-6">
                <p className="label-caps text-t-text-muted">Confidence Score</p>
                <p className="mt-2 font-display text-4xl font-black text-t-text">{result.risk ?? 'Pending'}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-t-panel-high">
                  <div className="h-full bg-t-accent" style={{ width: result.risk ? `${Math.min(Number(result.risk), 100)}%` : '0%' }} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Resolution Team" eyebrow="Case handlers" />
            <CardBody className="space-y-3">
              {resolutionTeam.map((name) => (
                <div key={name} className="flex items-center gap-3 rounded-lg bg-t-panel p-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-t-accent-subtle font-display text-sm font-bold text-t-accent">
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-t-text">{name}</p>
                    <p className="text-xs text-t-text-muted">Online</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Button className="w-full" variant="secondary" icon={MessageSquare}>
            Contact Handler
          </Button>
        </aside>
      </div>
      ) : null}

      <Modal
        open={confirmEscalate}
        title="Escalate case"
        onClose={() => setConfirmEscalate(false)}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setConfirmEscalate(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!result) return;
                setConfirmEscalate(false);
                try {
                  const updated = normalizeComplaint(await apiFetch(`/public/track/${encodeURIComponent(result.id)}/escalate`, { method: 'POST', token: null }));
                  toast.success('Escalated', 'Escalation request was added to this complaint.', { durationMs: 3200 });
                  setResult(updated);
                } catch (error) {
                  toast.error('Escalation failed', error.message || 'Could not escalate this complaint.', { durationMs: 3600 });
                }
              }}
            >
              Escalate now
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-6 text-t-text-muted">
          Escalation adds a review request to this complaint without changing AI analysis fields.
        </p>
      </Modal>
    </main>
  );
}
