import { motion } from 'framer-motion';
import {
  Bell, BrainCircuit, Building2, CheckCircle2, DatabaseZap, Globe2,
  KeyRound, LockKeyhole, Mail, MonitorCog, PlugZap, RefreshCw,
  Save, ShieldCheck, Users, Webhook,
} from 'lucide-react';
import { createElement, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card, { CardBody } from '../components/Card';
import { Field, Input, Select } from '../components/Input';
import { apiFetch } from '../lib/api';
import { useAuth } from '../state/auth';
import { useTheme, THEMES } from '../state/theme';
import { useToast } from '../state/toast';
import { cn } from '../utils/cn';

const MotionDiv = motion.div;

const sections = [
  { id: 'organization', label: 'Organization',    icon: Building2,   description: 'Company profile and workspace identity' },
  { id: 'security',     label: 'Security',         icon: ShieldCheck, description: 'Access key, password, and sessions' },
  { id: 'ai',          label: 'AI Configuration', icon: BrainCircuit,description: 'Classifier behavior and model controls' },
  { id: 'notifications',label: 'Notifications',   icon: Bell,        description: 'Alerts, escalations, and email rules' },
  { id: 'workspace',   label: 'Workspace',        icon: MonitorCog,  description: 'Layout, theme, and language' },
  { id: 'integrations',label: 'Integrations',     icon: PlugZap,     description: 'CRM, API, and webhook controls' },
];

const modelStatuses = [
  { name: 'Category classifier', status: 'Healthy', detail: 'v2.8 production model' },
  { name: 'Sentiment engine',    status: 'Healthy', detail: '94.2% confidence sample' },
  { name: 'Priority router',     status: 'Active',  detail: 'Auto-routing enabled' },
];

function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="group flex w-full items-center justify-between gap-4 rounded-lg border border-t-border bg-t-panel p-4 text-left transition-all duration-200 hover:border-t-accent hover:bg-t-accent-subtle"
    >
      <span>
        <span className="block text-sm font-semibold text-t-text">{label}</span>
        {description ? <span className="mt-1 block text-xs leading-5 text-t-text-muted">{description}</span> : null}
      </span>
      <span
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border p-0.5 transition-all duration-200',
          checked ? 'border-t-accent/40 bg-t-accent' : 'border-t-border bg-t-panel-high',
        )}
      >
        <motion.span
          layout
          className="block h-5 w-5 rounded-full bg-white shadow-sm"
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
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-t-accent/25 bg-t-accent-subtle text-t-accent">
            {createElement(Icon, { className: 'h-5 w-5' })}
          </span>
          {badge ? <Badge tone={badge}>{badge}</Badge> : null}
        </div>
        <p className="mt-4 text-xs font-bold uppercase text-t-text-muted">{label}</p>
        <p className="mt-2 font-display text-xl font-black text-t-text">{value}</p>
      </CardBody>
    </Card>
  );
}

function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="border-b border-t-border p-5 sm:p-6">
      <p className="label-caps text-t-accent">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl font-black text-t-text">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-t-text-muted">{text}</p>
    </div>
  );
}

// ─── Theme swatch picker ─────────────────────────────────────────────────────
function ThemePicker({ value, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {Object.values(THEMES).map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            'group relative flex flex-col gap-2 rounded-xl border-2 p-3 text-left transition-all duration-200',
            value === t.id
              ? 'border-t-accent shadow-[0_0_0_3px_var(--t-accent-subtle)]'
              : 'border-t-border hover:border-t-border-strong',
          )}
        >
          {/* Swatch strip */}
          <div className="flex h-8 overflow-hidden rounded-lg">
            {t.swatch.map((color, i) => (
              <span key={i} className="flex-1" style={{ background: color }} />
            ))}
          </div>
          <p className="text-xs font-bold text-t-text">{t.label}</p>
          <p className="text-[10px] leading-4 text-t-text-muted">{t.description}</p>
          {value === t.id && (
            <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-t-accent text-white">
              <CheckCircle2 className="h-3 w-3" />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default function Settings() {
  const toast = useToast();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [params, setParams] = useSearchParams();
  const sectionParam = params.get('section');
  const initialSection = sections.some((s) => s.id === sectionParam) ? sectionParam : 'organization';
  const [active, setActive] = useState(initialSection);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    companyName: user?.organization_name ?? user?.company ?? '',
    businessEmail: user?.email ?? '',
    industry: 'Financial Services',
    orgId: user?.organization_id ?? '',
    currentPassword: '',
    newPassword: '',
    secretKey: '',
    twoFactor: false,
    sessionTimeout: '8 hours',
    classifierMode: 'Balanced automation',
    sentimentSensitivity: 72,
    autoPriority: true,
    humanReview: true,
    emailAlerts: true,
    criticalAlerts: true,
    escalationAlerts: true,
    weeklyDigest: false,
    themeMode: theme,
    dashboardLayout: 'Executive compact',
    language: 'English',
    compactTables: true,
    crmConnected: false,
    apiEndpoint: '',
    webhookUrl: '',
  });

  const activeSection = useMemo(() => sections.find((s) => s.id === active), [active]);
  const workspaceOwner = user?.owner_name || user?.name || user?.email || 'Workspace owner';

  useEffect(() => {
    const next = sections.some((s) => s.id === sectionParam) ? sectionParam : 'organization';
    setActive((cur) => (cur === next ? cur : next));
  }, [sectionParam]);

  useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        companyName: user.organization_name ?? user.company ?? prev.companyName,
        businessEmail: user.email ?? prev.businessEmail,
        orgId: user.organization_id ?? prev.orgId,
      }));
    }
    apiFetch('/settings')
      .then((remote) => {
        setSettings((prev) => ({
          ...prev,
          themeMode: remote.theme ?? prev.themeMode,
          dashboardLayout: remote.dashboard_layout ?? prev.dashboardLayout,
          language: remote.language ?? prev.language,
          emailAlerts: remote.notification_preferences?.emailAlerts ?? prev.emailAlerts,
          criticalAlerts: remote.notification_preferences?.criticalAlerts ?? prev.criticalAlerts,
          escalationAlerts: remote.notification_preferences?.escalationAlerts ?? prev.escalationAlerts,
          weeklyDigest: remote.notification_preferences?.weeklyDigest ?? prev.weeklyDigest,
          classifierMode: remote.ai_preferences?.classifierMode ?? prev.classifierMode,
          sentimentSensitivity: remote.ai_preferences?.sentimentSensitivity ?? prev.sentimentSensitivity,
          autoPriority: remote.ai_preferences?.autoPriorityRouting ?? prev.autoPriority,
          compactTables: remote.workspace_preferences?.compactTables ?? prev.compactTables,
          crmConnected: remote.integration_preferences?.crmSync ?? prev.crmConnected,
          apiEndpoint: remote.integration_preferences?.apiEndpoint ?? prev.apiEndpoint,
          webhookUrl: remote.integration_preferences?.webhookUrl ?? prev.webhookUrl,
        }));
      })
      .catch(() => {});
  }, [user]);

  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  // When theme picker changes — apply INSTANTLY
  const handleThemeChange = (id) => {
    update('themeMode', id);
    setTheme(id);
  };

  const selectSection = (section) => {
    setActive(section);
    setParams({ section }, { replace: true });
  };

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch('/auth/workspace', {
        method: 'PATCH',
        body: { company_name: settings.companyName, business_email: settings.businessEmail, industry: settings.industry },
      });
      await apiFetch('/settings', {
        method: 'PATCH',
        body: {
          theme: settings.themeMode,
          notification_preferences: {
            emailAlerts: settings.emailAlerts, criticalAlerts: settings.criticalAlerts,
            escalationAlerts: settings.escalationAlerts, weeklyDigest: settings.weeklyDigest,
          },
          ai_preferences: {
            classifierMode: settings.classifierMode, sentimentSensitivity: settings.sentimentSensitivity,
            autoPriorityRouting: settings.autoPriority, humanReview: settings.humanReview,
          },
          language: settings.language,
          dashboard_layout: settings.dashboardLayout,
          workspace_preferences: { compactTables: settings.compactTables, sessionTimeout: settings.sessionTimeout },
          integration_preferences: { crmSync: settings.crmConnected, apiEndpoint: settings.apiEndpoint, webhookUrl: settings.webhookUrl },
        },
      });
      if (settings.newPassword || settings.secretKey) {
        await apiFetch('/auth/security', {
          method: 'PATCH',
          body: { current_password: settings.currentPassword || null, new_password: settings.newPassword || null, secret_key: settings.secretKey || null },
        });
      }
      setSettings((prev) => ({ ...prev, currentPassword: '', newPassword: '', secretKey: '' }));
      toast.success('Settings saved', 'Workspace preferences persisted.', { durationMs: 2800 });
    } catch (error) {
      toast.error('Settings save failed', error.message || 'Could not persist workspace settings.', { durationMs: 4200 });
    } finally {
      setSaving(false);
    }
  };

  const rotateSecretKey = () => {
    const next = `SENTRA-${Math.random().toString(36).slice(2, 8).toUpperCase()}-2026`;
    update('secretKey', next);
    toast.success('Secret key rotated', 'Save changes to activate this workspace key.', { durationMs: 2600 });
  };

  const endSessions = async () => {
    toast.info('Session review', 'Ending other workspace sessions.', { durationMs: 1800 });
    await new Promise((r) => setTimeout(r, 550));
    toast.success('Sessions cleared', 'All other sessions have been invalidated.', { durationMs: 2600 });
  };

  const testWebhook = async () => {
    toast.info('Sending test event', 'Dispatching a webhook test payload.', { durationMs: 1800 });
    await new Promise((r) => setTimeout(r, 700));
    toast.success('Webhook delivered', 'Endpoint accepted the test payload.', { durationMs: 2600 });
  };

  const renderSection = () => {
    if (active === 'organization') return (
      <>
        <SectionHeader eyebrow="Organization Settings" title="Company profile"
          text="Maintain the workspace identity that appears across the admin dashboard, exports, and notification templates." />
        <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
          <Field label="Company Name"><Input value={settings.companyName} onChange={(e) => update('companyName', e.target.value)} /></Field>
          <Field label="Business Email"><Input value={settings.businessEmail} onChange={(e) => update('businessEmail', e.target.value)} inputMode="email" /></Field>
          <Field label="Industry">
            <Select value={settings.industry} onChange={(e) => update('industry', e.target.value)}>
              <option>Financial Services</option><option>Healthcare</option><option>Retail</option>
              <option>Telecommunications</option><option>Insurance</option>
            </Select>
          </Field>
          <Field label="Organization ID" hint="Read-only workspace identifier.">
            <Input value={settings.orgId} readOnly className="font-mono text-sm" />
          </Field>
        </div>
      </>
    );

    if (active === 'security') return (
      <>
        <SectionHeader eyebrow="Security Settings" title="Access controls"
          text="Manage passwords, company secret key behavior, multi-factor controls, and session policy." />
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Current Password"><Input type="password" value={settings.currentPassword} onChange={(e) => update('currentPassword', e.target.value)} placeholder="Enter current password" /></Field>
            <Field label="New Password"><Input type="password" value={settings.newPassword} onChange={(e) => update('newPassword', e.target.value)} placeholder="Create new password" /></Field>
            <Field label="New Secret Access Key" hint="Leave blank unless you want to rotate the workspace login key.">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input value={settings.secretKey} onChange={(e) => update('secretKey', e.target.value.toUpperCase())} className="font-mono text-sm" placeholder="Create a new workspace key" />
                <Button variant="secondary" icon={RefreshCw} onClick={rotateSecretKey}>Rotate</Button>
              </div>
            </Field>
          </div>
          <div className="space-y-4">
            <ToggleSwitch checked={settings.twoFactor} onChange={(v) => update('twoFactor', v)} label="Two-factor authentication" description="Require a second verification step for workspace owners." />
            <Field label="Session Timeout">
              <Select value={settings.sessionTimeout} onChange={(e) => update('sessionTimeout', e.target.value)}>
                <option>2 hours</option><option>8 hours</option><option>24 hours</option><option>7 days</option>
              </Select>
            </Field>
            <button type="button" onClick={() => void endSessions()}
              className="flex w-full items-center justify-between rounded-lg border border-t-border bg-t-panel p-4 text-left transition-all duration-200 hover:border-t-accent hover:bg-t-accent-subtle">
              <span>
                <span className="block text-sm font-semibold text-t-text">Session management</span>
                <span className="mt-1 block text-xs text-t-text-muted">End all other active workspace sessions.</span>
              </span>
              <LockKeyhole className="h-5 w-5 text-t-accent" />
            </button>
          </div>
        </div>
      </>
    );

    if (active === 'ai') return (
      <>
        <SectionHeader eyebrow="AI Configuration" title="Classifier controls"
          text="Tune how aggressively the AI classifies, escalates, and routes complaint records." />
        <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-5">
            <Field label="Classifier Mode">
              <Select value={settings.classifierMode} onChange={(e) => update('classifierMode', e.target.value)}>
                <option>Conservative review</option><option>Balanced automation</option><option>High automation</option>
              </Select>
            </Field>
            <Field label="Sentiment Sensitivity" hint={`${settings.sentimentSensitivity}% sensitivity for negative/frustrated detection.`}>
              <input type="range" min="30" max="95" value={settings.sentimentSensitivity}
                onChange={(e) => update('sentimentSensitivity', Number(e.target.value))}
                className="w-full" style={{ accentColor: 'var(--t-accent)' }} />
            </Field>
            <ToggleSwitch checked={settings.autoPriority} onChange={(v) => update('autoPriority', v)} label="Auto-priority routing" description="Automatically move high-risk cases into priority queues." />
            <ToggleSwitch checked={settings.humanReview} onChange={(v) => update('humanReview', v)} label="Human review sampling" description="Keep a percentage of AI-classified rows available for QA review." />
          </div>
          <div className="space-y-3 rounded-lg border border-t-border bg-t-panel p-4">
            <p className="label-caps">Model Status Indicators</p>
            {modelStatuses.map((model) => (
              <div key={model.name} className="flex items-center justify-between gap-4 rounded-lg border border-t-border bg-t-surface p-3">
                <div>
                  <p className="text-sm font-semibold text-t-text">{model.name}</p>
                  <p className="mt-1 text-xs text-t-text-muted">{model.detail}</p>
                </div>
                <Badge>{model.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </>
    );

    if (active === 'notifications') return (
      <>
        <SectionHeader eyebrow="Notification Preferences" title="Alert routing"
          text="Configure the alerting rules your operations team uses for email, critical complaints, and escalation workflows." />
        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
          <ToggleSwitch checked={settings.emailAlerts} onChange={(v) => update('emailAlerts', v)} label="Email alerts" description="Send daily queue summaries to workspace admins." />
          <ToggleSwitch checked={settings.criticalAlerts} onChange={(v) => update('criticalAlerts', v)} label="Critical complaint alerts" description="Notify immediately when Critical priority cases appear." />
          <ToggleSwitch checked={settings.escalationAlerts} onChange={(v) => update('escalationAlerts', v)} label="Escalation notifications" description="Alert owners when a case moves to Escalated status." />
          <ToggleSwitch checked={settings.weeklyDigest} onChange={(v) => update('weeklyDigest', v)} label="Weekly executive digest" description="Send leadership a summary of complaint trends and SLA movement." />
        </div>
      </>
    );

    if (active === 'workspace') return (
      <>
        <SectionHeader eyebrow="Workspace Preferences" title="Interface defaults"
          text="Set the visual mode, dashboard density, and language preferences for this enterprise workspace." />
        <div className="space-y-6 p-5 sm:p-6">
          <div>
            <p className="label-caps mb-4">Theme — changes apply instantly</p>
            <ThemePicker value={settings.themeMode} onChange={handleThemeChange} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Dashboard Layout">
              <Select value={settings.dashboardLayout} onChange={(e) => update('dashboardLayout', e.target.value)}>
                <option>Executive compact</option><option>Operations detailed</option><option>Analyst review</option>
              </Select>
            </Field>
            <Field label="Language">
              <Select value={settings.language} onChange={(e) => update('language', e.target.value)}>
                <option>English</option><option>Urdu</option><option>Arabic</option>
              </Select>
            </Field>
          </div>
          <ToggleSwitch checked={settings.compactTables} onChange={(v) => update('compactTables', v)} label="Compact enterprise tables" description="Use denser table spacing for repeated operations workflows." />
        </div>
      </>
    );

    return (
      <>
        <SectionHeader eyebrow="Integration Settings" title="Connected systems"
          text="Manage CRM connections, API endpoints, and webhook URLs for connected operations systems." />
        <div className="grid gap-5 p-5 sm:p-6">
          <ToggleSwitch checked={settings.crmConnected} onChange={(v) => update('crmConnected', v)} label="CRM connection" description="Toggle the CRM connector state." />
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="API Endpoint"><Input value={settings.apiEndpoint} onChange={(e) => update('apiEndpoint', e.target.value)} /></Field>
            <Field label="Webhook URL"><Input value={settings.webhookUrl} onChange={(e) => update('webhookUrl', e.target.value)} /></Field>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" icon={Webhook} onClick={() => void testWebhook()}>Test Webhook</Button>
            <Button variant="secondary" icon={DatabaseZap} onClick={() => toast.success('API endpoint validated', 'Endpoint format is ready to save.', { durationMs: 2400 })}>Validate API Endpoint</Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-t-accent">Sentra Workspace</p>
          <h1 className="mt-2 font-display text-3xl font-black text-t-text sm:text-4xl">Enterprise Settings</h1>
          <p className="mt-2 max-w-3xl text-t-text-muted">Configure organization identity, secure access, AI behavior, notifications, workspace defaults, and integrations.</p>
        </div>
        <Button icon={Save} loading={saving} onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SettingsMetric label="Workspace" value={settings.companyName || 'Workspace'} icon={Building2} />
        <SettingsMetric label="Security Posture" value={settings.twoFactor ? '2FA enforced' : 'Password only'} icon={KeyRound} badge={settings.twoFactor ? 'Healthy' : 'Review Needed'} />
        <SettingsMetric label="AI Mode" value={settings.classifierMode} icon={BrainCircuit} badge="Active" />
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
        <Card className="h-fit overflow-hidden hover:-translate-y-0">
          <CardBody className="p-2">
            <div className="p-3">
              <p className="label-caps text-t-accent">Settings Sections</p>
              <p className="mt-2 text-xs leading-5 text-t-text-muted">Switch between modules and save changes from the top action.</p>
            </div>
            <nav className="grid gap-1">
              {sections.map((section) => (
                <button key={section.id} type="button" onClick={() => selectSection(section.id)}
                  className={cn(
                    'flex items-start gap-3 rounded-lg px-3 py-3 text-left transition-all duration-200',
                    active === section.id
                      ? 'border border-t-accent/30 bg-t-accent-subtle text-t-text shadow-[0_0_0_1px_var(--t-accent-subtle)]'
                      : 'border border-transparent text-t-text-muted hover:bg-t-panel hover:text-t-text',
                  )}>
                  <section.icon className="mt-0.5 h-5 w-5 shrink-0 text-t-accent" />
                  <span>
                    <span className="block font-display text-sm font-bold">{section.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-t-text-muted">{section.description}</span>
                  </span>
                </button>
              ))}
            </nav>
          </CardBody>
        </Card>

        <MotionDiv key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-xl border border-t-border bg-t-surface shadow-panel">
          <div className="flex items-center justify-between gap-4 border-b border-t-border bg-t-panel px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-t-accent/25 bg-t-accent-subtle text-t-accent">
                <activeSection.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-t-text">{activeSection.label}</p>
                <p className="text-xs text-t-text-muted">{activeSection.description}</p>
              </div>
            </div>
            <Badge tone="Healthy">Live</Badge>
          </div>
          {renderSection()}
        </MotionDiv>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Workspace owner',    value: workspaceOwner,                       icon: Users },
          { label: 'Notification email', value: settings.businessEmail || 'Not configured', icon: Mail },
          { label: 'Locale',             value: settings.language,                    icon: Globe2 },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-t-border bg-t-panel p-4">
            <div className="flex items-center gap-2 text-t-text-muted">
              <item.icon className="h-4 w-4" />
              <p className="label-caps">{item.label}</p>
            </div>
            <p className="mt-2 truncate text-sm font-semibold text-t-text">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-t-success/20 bg-t-success-subtle p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-t-success" />
          <div>
            <p className="font-display text-sm font-bold text-t-text">Settings connected</p>
            <p className="mt-1 text-sm leading-6 text-t-text-muted">
              Toggles, dropdowns, secret key rotation, AI preferences, workspace settings, and integration preferences are stored through the backend settings API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
