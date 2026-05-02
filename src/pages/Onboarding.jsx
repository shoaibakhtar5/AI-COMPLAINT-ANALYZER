import { Building2, CheckCircle2, LockKeyhole, Rocket, ServerCog, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card, { CardBody } from '../components/Card';
import { Field, Input, Select } from '../components/Input';
import { useToast } from '../state/toast';

export default function Onboarding() {
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [org, setOrg] = useState('');
  const [email, setEmail] = useState('');
  const [admin, setAdmin] = useState('');
  const [role, setRole] = useState('');
  const [phrase, setPhrase] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!org.trim()) next.org = 'Organization required';
    if (!email.trim()) next.email = 'Business email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter valid email';
    if (!admin.trim()) next.admin = 'Administrator name required';
    if (!role.trim()) next.role = 'Role required';
    if (!phrase.trim() || phrase.length < 6) next.phrase = 'Passphrase must be at least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const establish = async () => {
    if (!validate()) {
      toast.error('Setup blocked', 'Please fix the highlighted fields.', { durationMs: 3600 });
      return;
    }
    setLoading(true);
    toast.info('Establishing infrastructure', 'Provisioning secure workspace…', { durationMs: 2400 });
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    toast.success('Protocol established', 'Workspace initialized. Redirecting to admin login…', { durationMs: 3200 });
    navigate('/admin/login');
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <p className="label-caps text-crimson-500">Command Analyzer</p>
        <h1 className="mt-3 font-display text-4xl font-black text-white">Initialize Aegis Protocol</h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
          Establish your secure enterprise environment. All transmissions are encrypted using military-grade Crimson Protocol standards.
        </p>
      </div>

      <Card className="mx-auto max-w-5xl overflow-hidden">
        <div className="grid lg:grid-cols-[1.4fr_0.8fr]">
          <CardBody className="space-y-8">
            <section>
              <div className="mb-5 flex items-center gap-3">
                <Building2 className="h-6 w-6 text-crimson-500" />
                <h2 className="font-display text-xl font-bold text-white">Organization Identity</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Organization Name" hint={errors.org} className={errors.org ? 'text-crimson-200' : undefined}>
                  <Input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Global Systems Inc." className={errors.org ? 'border-crimson-600/40 ring-1 ring-crimson-600/20' : ''} />
                </Field>
                <Field label="Business Email" hint={errors.email} className={errors.email ? 'text-crimson-200' : undefined}>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@globalsystems.com" type="email" className={errors.email ? 'border-crimson-600/40 ring-1 ring-crimson-600/20' : ''} />
                </Field>
                <Field label="Industry Type">
                  <Select defaultValue="Financial Services">
                    <option>Financial Services</option>
                    <option>Healthcare</option>
                    <option>Retail</option>
                    <option>Technology</option>
                  </Select>
                </Field>
                <Field label="Expected Monthly Volume">
                  <Select defaultValue="10k - 50k">
                    <option>1k - 10k</option>
                    <option>10k - 50k</option>
                    <option>50k - 250k</option>
                  </Select>
                </Field>
              </div>
            </section>

            <section>
              <div className="mb-5 flex items-center gap-3">
                <LockKeyhole className="h-6 w-6 text-crimson-500" />
                <h2 className="font-display text-xl font-bold text-white">Administrative Control</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Administrator Name" hint={errors.admin} className={errors.admin ? 'text-crimson-200' : undefined}>
                  <Input value={admin} onChange={(e) => setAdmin(e.target.value)} placeholder="Commander" className={errors.admin ? 'border-crimson-600/40 ring-1 ring-crimson-600/20' : ''} />
                </Field>
                <Field label="Role Identification" hint={errors.role} className={errors.role ? 'text-crimson-200' : undefined}>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="CTO / SecOps Lead" className={errors.role ? 'border-crimson-600/40 ring-1 ring-crimson-600/20' : ''} />
                </Field>
                <Field label="Security Access Phrase" hint={errors.phrase} className={errors.phrase ? 'text-crimson-200 md:col-span-2' : 'md:col-span-2'}>
                  <Input value={phrase} onChange={(e) => setPhrase(e.target.value)} type="password" placeholder="Create passphrase" className={errors.phrase ? 'border-crimson-600/40 ring-1 ring-crimson-600/20' : ''} />
                </Field>
              </div>
            </section>

            <Button size="lg" icon={Rocket} className="h-14 w-full" onClick={establish} loading={loading} disabled={loading}>
              Establish Infrastructure
            </Button>
          </CardBody>

          <aside className="border-t border-white/10 bg-black/35 p-6 lg:border-l lg:border-t-0">
            <div className="space-y-4">
              {[
                ['Security Preview', 'AES-256 evidence archive activated'],
                ['AI Routing', 'Complaint taxonomy model loaded'],
                ['Infrastructure', 'Private analytics workspace prepared'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-lg border border-white/10 bg-panel/70 p-4">
                  <div className="mb-2 flex items-center gap-2 text-crimson-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="label-caps">{title}</span>
                  </div>
                  <p className="text-sm text-zinc-400">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-lg border border-crimson-600/20 bg-crimson-600/10 p-4">
              <ServerCog className="mb-4 h-6 w-6 text-crimson-400" />
              <p className="text-sm leading-6 text-zinc-300">
                Aegis AI operates on permissioned controls. By initiating setup, you confirm authority to represent the listed organization.
              </p>
            </div>
          </aside>
        </div>
      </Card>
    </main>
  );
}
