import { UploadCloud, ShieldAlert, Gauge, Send, Wand2, UserRound, Mail } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card, { CardBody } from '../components/Card';
import { Field, Input, Select, Textarea } from '../components/Input';
import Badge from '../components/Badge';
import { useComplaints } from '../state/complaints';
import { useToast } from '../state/toast';

export default function SubmitComplaint() {
  const toast = useToast();
  const db = useComplaints();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [category, setCategory] = useState('Security Breach');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [department, setDepartment] = useState('Cybersecurity Intelligence');
  const [attachmentName, setAttachmentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const sentiment = useMemo(() => {
    const m = message.toLowerCase();
    if (!m) return { tone: 'Neutral', pct: 40, urgency: 40 };
    const hot = ['breach', 'unauthorized', 'leak', 'stolen', 'fraud', 'lawsuit', 'angry', 'cancel', 'chargeback'];
    const hits = hot.reduce((n, w) => (m.includes(w) ? n + 1 : n), 0);
    const pct = Math.min(92, 45 + hits * 10);
    const urgency = Math.min(96, 50 + hits * 11);
    return { tone: hits >= 2 ? 'Negative' : hits === 1 ? 'Concerned' : 'Neutral', pct, urgency };
  }, [message]);

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = 'Name required';
    if (!email.trim()) next.email = 'Email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter valid email';
    if (!subject.trim()) next.subject = 'Subject required';
    if (message.trim().length < 20) next.message = 'Complaint text must be at least 20 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Submission blocked', 'Please fix the highlighted fields.', { durationMs: 3600 });
      return;
    }
    setLoading(true);
    try {
      const created = await db.submit({ name, email, subject, message, category, department, attachmentName });
      toast.success('Complaint submitted', `Your ID is ${created.id}. Redirecting to tracking…`, { durationMs: 3200 });
      navigate(`/track?id=${encodeURIComponent(created.id)}`, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="rounded-lg border border-white/10 bg-panel/90 p-5 shadow-panel sm:p-8">
          <p className="label-caps text-crimson-500">Crimson Protocol Enabled</p>
          <h1 className="mt-3 font-display text-4xl font-black text-white">Log New Incident</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Immediate AI classification and threat assessment for customer complaints, service failures, and compliance-sensitive cases.
          </p>

          <form className="mt-8 grid gap-5" onSubmit={onSubmit}>
            <Field label="Incident Category">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setCategory('Security Breach')}
                  className={`flex items-center justify-between rounded-lg border px-5 py-4 text-left transition ${
                    category === 'Security Breach'
                      ? 'border-crimson-600/40 bg-black/35 text-white shadow-crimson'
                      : 'border-white/10 bg-black/25 text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span>Security Breach</span>
                  <ShieldAlert className="h-5 w-5 text-crimson-500" />
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('System Failure')}
                  className={`flex items-center justify-between rounded-lg border px-5 py-4 text-left transition ${
                    category === 'System Failure'
                      ? 'border-crimson-600/40 bg-black/35 text-white shadow-crimson'
                      : 'border-white/10 bg-black/25 text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span>System Failure</span>
                  <Gauge className="h-5 w-5" />
                </button>
              </div>
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Full Name" hint={errors.name} className={errors.name ? 'text-crimson-200' : undefined}>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600" />
                  <Input value={name} onChange={(e) => setName(e.target.value)} className={errors.name ? 'pl-12 border-crimson-600/40 ring-1 ring-crimson-600/20' : 'pl-12'} placeholder="Your name" />
                </div>
              </Field>
              <Field label="Email" hint={errors.email} className={errors.email ? 'text-crimson-200' : undefined}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? 'pl-12 border-crimson-600/40 ring-1 ring-crimson-600/20' : 'pl-12'}
                    placeholder="you@email.com"
                    inputMode="email"
                    autoComplete="email"
                  />
                </div>
              </Field>
            </div>
            <Field label="Subject Title">
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} className={errors.subject ? 'border-crimson-600/40 ring-1 ring-crimson-600/20' : ''} placeholder="Brief summary of the complaint..." />
              {errors.subject ? <p className="mt-2 text-xs text-crimson-200">{errors.subject}</p> : null}
            </Field>
            <Field label="Detailed Description">
              <Textarea rows={8} value={message} onChange={(e) => setMessage(e.target.value)} className={errors.message ? 'border-crimson-600/40 ring-1 ring-crimson-600/20' : ''} placeholder="Provide as much detail as possible about the incident..." />
              {errors.message ? <p className="mt-2 text-xs text-crimson-200">{errors.message}</p> : null}
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Affected Department">
                <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option>Cybersecurity Intelligence</option>
                  <option>Revenue Assurance</option>
                  <option>Infrastructure Ops</option>
                  <option>Trust & Safety</option>
                </Select>
              </Field>
              <Field label="Attachment Evidence">
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setAttachmentName(e.target.files?.[0]?.name ?? '')}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-[50px] w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-black/25 text-zinc-500 transition hover:border-white/30 hover:text-white"
                >
                  <UploadCloud className="h-5 w-5" />
                  {attachmentName ? `Selected: ${attachmentName}` : 'Upload Media'}
                </button>
              </Field>
            </div>
            <Button type="submit" size="lg" icon={Send} className="h-14" loading={loading} disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Complaint'}
            </Button>
          </form>
        </section>

        <aside className="space-y-4">
          <Card className="bg-black/40">
            <CardBody>
              <div className="mb-4 flex items-center gap-2 text-crimson-400">
                <Wand2 className="h-5 w-5" />
                <span className="label-caps">Real-time AI Sentiment Analysis</span>
              </div>
              <p className="italic leading-7 text-zinc-300">
                {message.trim().length
                  ? `"${sentiment.tone} tone detected. Urgency keywords influence score. Severity score updates as you type."`
                  : '"Start typing the complaint details to see live AI analysis updates."'}
              </p>
            </CardBody>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Card>
              <CardBody>
                <div className="mb-3 flex items-center justify-between">
                  <span className="label-caps text-zinc-500">Sentiment</span>
                  <Badge tone={sentiment.tone === 'Negative' ? 'Negative' : sentiment.tone === 'Concerned' ? 'Investigating' : 'Resolved'}>
                    {sentiment.tone}
                  </Badge>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full bg-crimson-600" style={{ width: `${sentiment.pct}%` }} />
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-crimson-400">{sentiment.pct}%</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="mb-3 flex items-center justify-between">
                  <span className="label-caps text-zinc-500">Urgency</span>
                  <Badge tone={sentiment.urgency >= 85 ? 'High' : sentiment.urgency >= 65 ? 'Investigating' : 'Resolved'}>
                    {sentiment.urgency >= 85 ? 'Critical' : sentiment.urgency >= 65 ? 'High' : 'Normal'}
                  </Badge>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full bg-crimson-500" style={{ width: `${sentiment.urgency}%` }} />
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-crimson-300">{sentiment.urgency}%</p>
              </CardBody>
            </Card>
          </div>

          <Card className="bg-panel/70">
            <CardBody>
              <p className="label-caps text-zinc-500">Compliance Match</p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Similar to Article 42 / Crimson Security Charter. Legal review requested automatically.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-zinc-500">Avg. response</p>
                  <p className="font-display text-xl font-bold text-white">14m</p>
                </div>
                <div>
                  <p className="text-zinc-500">Queue position</p>
                  <p className="font-display text-xl font-bold text-crimson-400">#01</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>
    </main>
  );
}
