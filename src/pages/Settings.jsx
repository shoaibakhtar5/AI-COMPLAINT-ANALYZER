import { Save, Shield, SlidersHorizontal, UserCog } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/Button';
import Card, { CardBody, CardHeader } from '../components/Card';
import { Field, Input, Select } from '../components/Input';
import Modal from '../components/Modal';
import { useToast } from '../state/toast';

export default function Settings() {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);

  const [orgName, setOrgName] = useState('Global Systems Inc.');
  const [bizEmail, setBizEmail] = useState('admin@globalsystems.com');
  const [industry, setIndustry] = useState('Financial Services');
  const [volume, setVolume] = useState('10k - 50k');
  const [rules, setRules] = useState([
    { label: 'Auto-route critical complaints', enabled: true },
    { label: 'Require legal review on privacy exposure', enabled: true },
    { label: 'Use strict sentiment thresholds', enabled: false },
  ]);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1100));
    setSaving(false);
    toast.success('Saved successfully', 'Settings updated across the workspace.', { durationMs: 2800 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-crimson-500">Crimson Protocol</p>
          <h1 className="mt-2 font-display text-4xl font-black text-white">System Settings</h1>
          <p className="mt-2 text-zinc-400">Configure global complaint routing, security tiers, and automation thresholds.</p>
        </div>
        <Button icon={Save} loading={saving} onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card>
          <CardBody className="text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-crimson-600/40 bg-crimson-700/20 font-display text-2xl font-black text-white">
              CA
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-white">Commander Archer</h2>
            <p className="label-caps mt-2 text-crimson-500">Level 5 Clearance</p>
            <div className="mt-6 rounded-lg bg-black/25 p-4 text-left">
              <p className="label-caps text-zinc-500">Workspace</p>
              <p className="mt-2 text-sm text-zinc-300">Aegis AI Enterprise Security</p>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Organization Controls" eyebrow="Administrative profile" />
            <CardBody className="grid gap-5 md:grid-cols-2">
              <Field label="Organization Name"><Input value={orgName} onChange={(e) => setOrgName(e.target.value)} /></Field>
              <Field label="Business Email"><Input value={bizEmail} onChange={(e) => setBizEmail(e.target.value)} inputMode="email" /></Field>
              <Field label="Industry Type">
                <Select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  <option>Financial Services</option>
                  <option>Healthcare</option>
                  <option>Retail</option>
                  <option>Energy</option>
                </Select>
              </Field>
              <Field label="Expected Monthly Volume">
                <Select value={volume} onChange={(e) => setVolume(e.target.value)}>
                  <option>1k - 10k</option>
                  <option>10k - 50k</option>
                  <option>50k - 250k</option>
                </Select>
              </Field>
            </CardBody>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="AI Routing Rules" eyebrow="Automation" />
              <CardBody className="space-y-4">
                {rules.map((r) => (
                  <button
                    type="button"
                    key={r.label}
                    onClick={() => setRules((prev) => prev.map((x) => (x.label === r.label ? { ...x, enabled: !x.enabled } : x)))}
                    className="flex w-full items-center justify-between rounded-lg bg-black/25 p-4 text-left transition hover:bg-black/30"
                  >
                    <div className="flex items-center gap-3">
                      <SlidersHorizontal className="h-5 w-5 text-crimson-500" />
                      <span className="text-sm text-zinc-300">{r.label}</span>
                    </div>
                    <span className={`h-6 w-11 rounded-full p-1 ${r.enabled ? 'bg-crimson-600' : 'bg-zinc-700'}`}>
                      <span className={`block h-4 w-4 rounded-full bg-white transition ${r.enabled ? 'translate-x-5' : ''}`} />
                    </span>
                  </button>
                ))}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Security Tier" eyebrow="Access controls" />
              <CardBody className="space-y-4">
                <div className="rounded-lg border border-crimson-600/25 bg-crimson-600/10 p-4">
                  <Shield className="mb-4 h-6 w-6 text-crimson-400" />
                  <p className="font-display font-bold text-white">Zero Trust Evidence Vault</p>
                  <p className="mt-2 text-sm text-zinc-400">Attachments and AI explanations are retained with immutable access logs.</p>
                </div>
                <Button variant="secondary" icon={UserCog} className="w-full" onClick={() => setRolesOpen(true)}>
                  Manage Roles
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        open={rolesOpen}
        title="Role management"
        onClose={() => setRolesOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRolesOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                toast.success('Roles updated', 'Access controls saved for the demo workspace.', { durationMs: 2600 });
                setRolesOpen(false);
              }}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-zinc-300">
            This demo includes a mock role editor so every action is functional. Assign roles and save to see immediate feedback.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {['Administrator', 'Analyst', 'Responder', 'Auditor'].map((role) => (
              <div key={role} className="rounded-lg border border-white/10 bg-black/25 p-4">
                <p className="font-display text-sm font-bold text-white">{role}</p>
                <p className="mt-1 text-xs text-zinc-500">Demo role</p>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
