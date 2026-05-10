import { motion } from 'framer-motion';
import {
  Bell,
  BrainCircuit,
  Building2,
  CheckCircle2,
  DatabaseZap,
  Globe2,
  KeyRound,
  LockKeyhole,
  Mail,
  MonitorCog,
  PlugZap,
  RefreshCw,
  Save,
  ShieldCheck,
  Users,
  Webhook,
} from 'lucide-react';
import { createElement, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card, { CardBody } from '../components/Card';
import { Field, Input, Select } from '../components/Input';
import { useToast } from '../state/toast';
import { cn } from '../utils/cn';

const MotionDiv = motion.div;

const sections = [
  { id: 'organization', label: 'Organization', icon: Building2, description: 'Company profile and workspace identity' },
  { id: 'security', label: 'Security', icon: ShieldCheck, description: 'Access key, password, and sessions' },
  { id: 'ai', label: 'AI Configuration', icon: BrainCircuit, description: 'Classifier behavior and model controls' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts, escalations, and email rules' },
  { id: 'workspace', label: 'Workspace', icon: MonitorCog, description: 'Layout, theme, and language' },
  { id: 'integrations', label: 'Integrations', icon: PlugZap, description: 'CRM, API, and webhook placeholders' },
];

const modelStatuses = [
  { name: 'Category classifier', status: 'Healthy', detail: 'v2.8 production mock' },
  { name: 'Sentiment engine', status: 'Healthy', detail: '94.2% confidence sample' },
  { name: 'Priority router', status: 'Active', detail: 'Auto-routing enabled' },
];

function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="group flex w-full items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/25 p-4 text-left transition hover:border-crimson-500/35 hover:bg-crimson-950/10"
    >
      <span>
        <span className="block text-sm font-semibold text-white">{label}</span>
        {description ? <span className="mt-1 block text-xs leading-5 text-zinc-500">{description}</span> : null}
      </span>
      <span
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border p-0.5 transition',
          checked ? 'border-crimson-500/40 bg-crimson-600 shadow-crimson' : 'border-white/10 bg-zinc-800',
        )}
      >
        <motion.span
          layout
          className="block h-5 w-5 rounded-full bg-white"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        />
      </span>
    </button>
  );
}

function SettingsMetric({ label, value, icon: Icon, badge }) {
  return (
    <Card className="hover:-translate-y-0">
      <CardBody>
        <div className="flex items-center justify-between gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-crimson-500/25 bg-crimson-700/10 text-crimson-200">
            {createElement(Icon, { className: 'h-5 w-5' })}
          </span>
          {badge ? <Badge tone={badge}>{badge}</Badge> : null}
        </div>
        <p className="mt-4 text-xs font-bold uppercase text-zinc-500">{label}</p>
        <p className="mt-2 font-display text-xl font-black text-white">{value}</p>
      </CardBody>
    </Card>
  );
}

function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="border-b border-white/10 p-5 sm:p-6">
      <p className="label-caps text-crimson-400">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl font-black text-white">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{text}</p>
    </div>
  );
}

export default function Settings() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const sectionParam = params.get('section');
  const initialSection = sections.some((section) => section.id === sectionParam) ? sectionParam : 'organization';
  const [active, setActive] = useState(initialSection);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'Nexus Bank Enterprise',
    businessEmail: 'operations@nexusbank.demo',
    industry: 'Financial Services',
    orgId: 'SENTRA-OPS-4821',
    currentPassword: '',
    newPassword: '',
    secretKey: 'NEXUS-SECURE-2026',
    twoFactor: true,
    sessionTimeout: '8 hours',
    classifierMode: 'Balanced automation',
    sentimentSensitivity: 72,
    autoPriority: true,
    humanReview: true,
    emailAlerts: true,
    criticalAlerts: true,
    escalationAlerts: true,
    weeklyDigest: false,
    themeMode: 'Dark red system',
    dashboardLayout: 'Executive compact',
    language: 'English',
    compactTables: true,
    crmConnected: false,
    apiEndpoint: 'https://api.company.com/complaints',
    webhookUrl: 'https://hooks.company.com/sentra-events',
  });

  const activeSection = useMemo(() => sections.find((section) => section.id === active), [active]);

  useEffect(() => {
    const next = sections.some((section) => section.id === sectionParam) ? sectionParam : 'organization';
    setActive((current) => (current === next ? current : next));
  }, [sectionParam]);

  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));
  const selectSection = (section) => {
    setActive(section);
    setParams({ section }, { replace: true });
  };

  const save = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 850));
    setSaving(false);
    toast.success('Settings saved', 'Workspace preferences updated in mock mode.', { durationMs: 2800 });
  };

  const rotateSecretKey = () => {
    const next = `SENTRA-${Math.random().toString(36).slice(2, 8).toUpperCase()}-2026`;
    update('secretKey', next);
    toast.success('Secret key rotated', 'New mock workspace key generated.', { durationMs: 2600 });
  };

  const endSessions = async () => {
    toast.info('Session review', 'Ending other sessions in mock security mode.', { durationMs: 1800 });
    await new Promise((resolve) => setTimeout(resolve, 550));
    toast.success('Sessions cleared', 'All other demo sessions have been invalidated.', { durationMs: 2600 });
  };

  const testWebhook = async () => {
    toast.info('Sending test event', 'Dispatching a mock complaint.updated webhook.', { durationMs: 1800 });
    await new Promise((resolve) => setTimeout(resolve, 700));
    toast.success('Webhook delivered', 'Mock endpoint accepted the test payload.', { durationMs: 2600 });
  };

  const renderSection = () => {
    if (active === 'organization') {
      return (
        <>
          <SectionHeader
            eyebrow="Organization Settings"
            title="Company profile"
            text="Maintain the workspace identity that appears across the admin dashboard, exports, and notification templates."
          />
          <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
            <Field label="Company Name">
              <Input value={settings.companyName} onChange={(event) => update('companyName', event.target.value)} />
            </Field>
            <Field label="Business Email">
              <Input value={settings.businessEmail} onChange={(event) => update('businessEmail', event.target.value)} inputMode="email" />
            </Field>
            <Field label="Industry">
              <Select value={settings.industry} onChange={(event) => update('industry', event.target.value)}>
                <option>Financial Services</option>
                <option>Healthcare</option>
                <option>Retail</option>
                <option>Telecommunications</option>
                <option>Insurance</option>
              </Select>
            </Field>
            <Field label="Organization ID" hint="Read-only mock workspace identifier.">
              <Input value={settings.orgId} readOnly className="font-mono text-sm text-zinc-300" />
            </Field>
          </div>
        </>
      );
    }

    if (active === 'security') {
      return (
        <>
          <SectionHeader
            eyebrow="Security Settings"
            title="Access controls"
            text="Manage passwords, company secret key behavior, multi-factor controls, and session policy."
          />
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
            <div className="space-y-4">
              <Field label="Current Password">
                <Input type="password" value={settings.currentPassword} onChange={(event) => update('currentPassword', event.target.value)} placeholder="Enter current password" />
              </Field>
              <Field label="New Password">
                <Input type="password" value={settings.newPassword} onChange={(event) => update('newPassword', event.target.value)} placeholder="Create new password" />
              </Field>
              <Field label="Secret Access Key" hint="Required for secure company workspace login.">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input value={settings.secretKey} onChange={(event) => update('secretKey', event.target.value.toUpperCase())} className="font-mono text-sm" />
                  <Button variant="secondary" icon={RefreshCw} onClick={rotateSecretKey}>
                    Rotate
                  </Button>
                </div>
              </Field>
            </div>
            <div className="space-y-4">
              <ToggleSwitch checked={settings.twoFactor} onChange={(value) => update('twoFactor', value)} label="Two-factor authentication" description="Require a second verification step for workspace owners." />
              <Field label="Session Timeout">
                <Select value={settings.sessionTimeout} onChange={(event) => update('sessionTimeout', event.target.value)}>
                  <option>2 hours</option>
                  <option>8 hours</option>
                  <option>24 hours</option>
                  <option>7 days</option>
                </Select>
              </Field>
              <button
                type="button"
                onClick={() => void endSessions()}
                className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-black/25 p-4 text-left transition hover:border-crimson-500/35 hover:bg-crimson-950/10"
              >
                <span>
                  <span className="block text-sm font-semibold text-white">Session management</span>
                  <span className="mt-1 block text-xs text-zinc-500">End all other active demo sessions.</span>
                </span>
                <LockKeyhole className="h-5 w-5 text-crimson-300" />
              </button>
            </div>
          </div>
        </>
      );
    }

    if (active === 'ai') {
      return (
        <>
          <SectionHeader
            eyebrow="AI Configuration"
            title="Classifier controls"
            text="Tune how aggressively the mock AI classifies, escalates, and routes complaint records."
          />
          <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[1fr_0.9fr]">
            <div className="space-y-5">
              <Field label="Classifier Mode">
                <Select value={settings.classifierMode} onChange={(event) => update('classifierMode', event.target.value)}>
                  <option>Conservative review</option>
                  <option>Balanced automation</option>
                  <option>High automation</option>
                </Select>
              </Field>
              <Field label="Sentiment Sensitivity" hint={`${settings.sentimentSensitivity}% sensitivity for negative/frustrated detection.`}>
                <input
                  type="range"
                  min="30"
                  max="95"
                  value={settings.sentimentSensitivity}
                  onChange={(event) => update('sentimentSensitivity', Number(event.target.value))}
                  className="w-full accent-crimson-600"
                />
              </Field>
              <ToggleSwitch checked={settings.autoPriority} onChange={(value) => update('autoPriority', value)} label="Auto-priority routing" description="Automatically move high-risk cases into priority queues." />
              <ToggleSwitch checked={settings.humanReview} onChange={(value) => update('humanReview', value)} label="Human review sampling" description="Keep a percentage of AI-classified rows available for QA review." />
            </div>
            <div className="space-y-3 rounded-lg border border-white/10 bg-black/25 p-4">
              <p className="label-caps text-zinc-400">Model Status Indicators</p>
              {modelStatuses.map((model) => (
                <div key={model.name} className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-white/[0.03] p-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{model.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{model.detail}</p>
                  </div>
                  <Badge>{model.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </>
      );
    }

    if (active === 'notifications') {
      return (
        <>
          <SectionHeader
            eyebrow="Notification Preferences"
            title="Alert routing"
            text="Simulate the alerting rules your operations team would use for email, critical complaints, and escalation workflows."
          />
          <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
            <ToggleSwitch checked={settings.emailAlerts} onChange={(value) => update('emailAlerts', value)} label="Email alerts" description="Send daily queue summaries to workspace admins." />
            <ToggleSwitch checked={settings.criticalAlerts} onChange={(value) => update('criticalAlerts', value)} label="Critical complaint alerts" description="Notify immediately when Critical priority cases appear." />
            <ToggleSwitch checked={settings.escalationAlerts} onChange={(value) => update('escalationAlerts', value)} label="Escalation notifications" description="Alert owners when a case moves to Escalated status." />
            <ToggleSwitch checked={settings.weeklyDigest} onChange={(value) => update('weeklyDigest', value)} label="Weekly executive digest" description="Send leadership a summary of complaint trends and SLA movement." />
          </div>
        </>
      );
    }

    if (active === 'workspace') {
      return (
        <>
          <SectionHeader
            eyebrow="Workspace Preferences"
            title="Interface defaults"
            text="Set the visual mode, dashboard density, and language preferences for this mock enterprise workspace."
          />
          <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
            <Field label="Theme Mode">
              <Select value={settings.themeMode} onChange={(event) => update('themeMode', event.target.value)}>
                <option>Dark red system</option>
                <option>Midnight graphite</option>
                <option>High contrast dark</option>
              </Select>
            </Field>
            <Field label="Dashboard Layout">
              <Select value={settings.dashboardLayout} onChange={(event) => update('dashboardLayout', event.target.value)}>
                <option>Executive compact</option>
                <option>Operations detailed</option>
                <option>Analyst review</option>
              </Select>
            </Field>
            <Field label="Language">
              <Select value={settings.language} onChange={(event) => update('language', event.target.value)}>
                <option>English</option>
                <option>Urdu</option>
                <option>Arabic</option>
              </Select>
            </Field>
            <ToggleSwitch checked={settings.compactTables} onChange={(value) => update('compactTables', value)} label="Compact enterprise tables" description="Use denser table spacing for repeated operations workflows." />
          </div>
        </>
      );
    }

    return (
      <>
        <SectionHeader
          eyebrow="Integration Settings"
          title="Connected systems"
          text="Manage placeholder CRM connections, API endpoints, and webhook URLs so the frontend is ready for backend integration."
        />
        <div className="grid gap-5 p-5 sm:p-6">
          <ToggleSwitch checked={settings.crmConnected} onChange={(value) => update('crmConnected', value)} label="CRM connection" description="Toggle the mock CRM connector state." />
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="API Endpoint">
              <Input value={settings.apiEndpoint} onChange={(event) => update('apiEndpoint', event.target.value)} />
            </Field>
            <Field label="Webhook URL">
              <Input value={settings.webhookUrl} onChange={(event) => update('webhookUrl', event.target.value)} />
            </Field>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" icon={Webhook} onClick={() => void testWebhook()}>
              Test Webhook
            </Button>
            <Button variant="secondary" icon={DatabaseZap} onClick={() => toast.success('API placeholder saved', 'Endpoint stored in mock settings state.', { durationMs: 2400 })}>
              Validate API Endpoint
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-crimson-500">Sentra Workspace</p>
          <h1 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">Enterprise Settings</h1>
          <p className="mt-2 max-w-3xl text-zinc-400">
            Configure organization identity, secure access, AI behavior, notifications, workspace defaults, and integration placeholders.
          </p>
        </div>
        <Button icon={Save} loading={saving} onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SettingsMetric label="Workspace" value={settings.companyName} icon={Building2} />
        <SettingsMetric label="Security Posture" value={settings.twoFactor ? '2FA enforced' : 'Password only'} icon={KeyRound} badge={settings.twoFactor ? 'Healthy' : 'Review Needed'} />
        <SettingsMetric label="AI Mode" value={settings.classifierMode} icon={BrainCircuit} badge="Active" />
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
        <Card className="h-fit overflow-hidden hover:-translate-y-0">
          <CardBody className="p-2">
            <div className="p-3">
              <p className="label-caps text-crimson-400">Settings Sections</p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">Switch between modules and save changes from the top action.</p>
            </div>
            <nav className="grid gap-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => selectSection(section.id)}
                  className={cn(
                    'flex items-start gap-3 rounded-lg px-3 py-3 text-left transition',
                    active === section.id ? 'border border-crimson-500/30 bg-crimson-600/[0.12] text-white shadow-crimson' : 'border border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-white',
                  )}
                >
                  <section.icon className="mt-0.5 h-5 w-5 shrink-0 text-crimson-300" />
                  <span>
                    <span className="block font-display text-sm font-bold">{section.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-zinc-500">{section.description}</span>
                  </span>
                </button>
              ))}
            </nav>
          </CardBody>
        </Card>

        <MotionDiv
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-lg border border-white/10 bg-panel/95 shadow-panel"
        >
          <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-black/20 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-crimson-500/25 bg-crimson-700/10 text-crimson-200">
                <activeSection.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-white">{activeSection.label}</p>
                <p className="text-xs text-zinc-500">{activeSection.description}</p>
              </div>
            </div>
            <Badge tone="Healthy">Mock Live</Badge>
          </div>
          {renderSection()}
        </MotionDiv>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Workspace owner', value: 'Irfan Marwat', icon: Users },
          { label: 'Notification email', value: settings.businessEmail, icon: Mail },
          { label: 'Locale', value: settings.language, icon: Globe2 },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-zinc-500">
              <item.icon className="h-4 w-4" />
              <p className="label-caps">{item.label}</p>
            </div>
            <p className="mt-2 truncate text-sm font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-emerald-400/15 bg-emerald-500/10 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />
          <div>
            <p className="font-display text-sm font-bold text-white">Frontend functionality simulated</p>
            <p className="mt-1 text-sm leading-6 text-zinc-400">
              Toggles, dropdowns, secret key rotation, sessions, webhook tests, and save actions update local state and show production-style feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
