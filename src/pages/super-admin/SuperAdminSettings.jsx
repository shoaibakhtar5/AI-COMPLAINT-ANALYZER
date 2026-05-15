import { CheckCircle2, Eye, EyeOff, Plus, Save, ShieldOff } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card, { CardBody, CardHeader } from '../../components/Card';
import { Field, Input } from '../../components/Input';
import Table from '../../components/Table';
import { superAdminFetch } from '../../lib/superAdminApi';
import { useSuperAdminAuth } from '../../state/superAdminAuth';
import { THEMES, useTheme } from '../../state/theme';
import { useToast } from '../../state/toast';
import { cn } from '../../utils/cn';

function normalizeTheme(value, fallback = 'warm') {
  return THEMES[value] ? value : fallback;
}

function ThemePicker({ value, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {Object.values(THEMES).map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onChange(theme.id)}
          className={cn(
            'group relative flex flex-col gap-2 rounded-xl border-2 p-3 text-left transition-all duration-200',
            value === theme.id
              ? 'border-t-accent shadow-[0_0_0_3px_var(--t-accent-subtle)]'
              : 'border-t-border hover:border-t-border-strong',
          )}
        >
          <div className="flex h-8 overflow-hidden rounded-lg">
            {theme.swatch.map((color, index) => (
              <span key={index} className="flex-1" style={{ background: color }} />
            ))}
          </div>
          <p className="text-xs font-bold text-t-text">{theme.label}</p>
          <p className="text-[10px] leading-4 text-t-text-muted">{theme.description}</p>
          {value === theme.id ? (
            <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-t-accent text-white">
              <CheckCircle2 className="h-3 w-3" />
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

function PasswordInput({ value, onChange, visible, onToggle, placeholder }) {
  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-t-text-muted transition hover:bg-t-panel-high hover:text-t-text"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function SuperAdminSettings() {
  const auth = useSuperAdminAuth();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState({
    username: auth.admin?.username ?? '',
    email: auth.admin?.email ?? '',
    display_name: auth.admin?.display_name ?? '',
  });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [newAdmin, setNewAdmin] = useState({ display_name: '', email: '', username: '', password: '', confirm_password: '' });
  const [themeDraft, setThemeDraft] = useState(normalizeTheme(auth.admin?.theme, theme));
  const [admins, setAdmins] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [busyAdminId, setBusyAdminId] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [adminFormError, setAdminFormError] = useState('');

  const savedTheme = normalizeTheme(auth.admin?.theme, theme);
  const adminValidation = useMemo(() => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors = {};
    if (!newAdmin.display_name.trim()) errors.display_name = 'Name is required.';
    if (!newAdmin.email.trim()) errors.email = 'Email is required.';
    else if (!emailPattern.test(newAdmin.email.trim())) errors.email = 'Enter a valid email address.';
    if (!newAdmin.username.trim()) errors.username = 'Username is required.';
    if (!newAdmin.password) errors.password = 'Password is required.';
    else if (newAdmin.password.length < 8) errors.password = 'Password must be at least 8 characters.';
    if (!newAdmin.confirm_password) errors.confirm_password = 'Confirm password is required.';
    else if (newAdmin.password !== newAdmin.confirm_password) errors.confirm_password = 'Passwords do not match.';
    return { errors, valid: Object.keys(errors).length === 0 };
  }, [newAdmin]);

  useEffect(() => {
    setProfile({
      username: auth.admin?.username ?? '',
      email: auth.admin?.email ?? '',
      display_name: auth.admin?.display_name ?? '',
    });
    setThemeDraft(normalizeTheme(auth.admin?.theme, theme));
  }, [auth.admin, theme]);

  const loadAdmins = useCallback(async () => {
    try {
      setAdmins(await superAdminFetch('/admins'));
    } catch (error) {
      toast.error('Super admins unavailable', error.message || 'Could not load super admin accounts.', { durationMs: 3600 });
    }
  }, [toast]);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  useEffect(() => {
    setAdminFormError('');
  }, [newAdmin.display_name, newAdmin.email, newAdmin.username, newAdmin.password, newAdmin.confirm_password]);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await superAdminFetch('/settings/profile', { method: 'PATCH', body: profile });
      await auth.refreshAdmin();
      toast.success('Profile saved', 'Super admin profile updated.', { durationMs: 2600 });
    } catch (error) {
      toast.error('Profile save failed', error.message || 'Could not update profile.', { durationMs: 4200 });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    setSavingPassword(true);
    try {
      await superAdminFetch('/settings/password', { method: 'PATCH', body: passwords });
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      toast.success('Password updated', 'Use the new password on your next platform login.', { durationMs: 2800 });
    } catch (error) {
      toast.error('Password update failed', error.message || 'Could not update password.', { durationMs: 4200 });
    } finally {
      setSavingPassword(false);
    }
  };

  const saveTheme = async () => {
    setSavingTheme(true);
    try {
      await superAdminFetch('/settings', { method: 'PATCH', body: { theme: themeDraft } });
      const updated = await auth.refreshAdmin();
      const nextTheme = normalizeTheme(updated?.theme, themeDraft);
      setTheme(nextTheme);
      setThemeDraft(nextTheme);
      toast.success('Theme saved', 'Super Admin theme preference updated.', { durationMs: 2600 });
    } catch (error) {
      toast.error('Theme save failed', error.message || 'Could not save theme preference.', { durationMs: 4200 });
    } finally {
      setSavingTheme(false);
    }
  };

  const createAdmin = async () => {
    if (!adminValidation.valid) {
      setAdminFormError('Complete all required fields before adding a super admin.');
      return;
    }
    setCreatingAdmin(true);
    setAdminFormError('');
    try {
      const created = await superAdminFetch('/admins', {
        method: 'POST',
        body: {
          display_name: newAdmin.display_name.trim(),
          email: newAdmin.email.trim(),
          username: newAdmin.username.trim(),
          password: newAdmin.password,
          confirm_password: newAdmin.confirm_password,
        },
      });
      await loadAdmins();
      setNewAdmin({ display_name: '', email: '', username: '', password: '', confirm_password: '' });
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      toast.success('Super admin added', `${created.username} can now access the platform admin panel.`, { durationMs: 3000 });
    } catch (error) {
      setAdminFormError(error.message || 'Could not create super admin.');
      toast.error('Add super admin failed', error.message || 'Could not create super admin.', { durationMs: 4200 });
    } finally {
      setCreatingAdmin(false);
    }
  };

  const disableAdmin = async (admin) => {
    setBusyAdminId(admin.id);
    try {
      const updated = await superAdminFetch(`/admins/${encodeURIComponent(admin.id)}/disable`, { method: 'PATCH' });
      setAdmins((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast.success('Super admin disabled', `${updated.username} can no longer login.`, { durationMs: 2800 });
    } catch (error) {
      toast.error('Disable failed', error.message || 'Could not disable this super admin.', { durationMs: 4200 });
    } finally {
      setBusyAdminId('');
    }
  };

  const adminColumns = [
    { key: 'display_name', label: 'Name' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'is_active', label: 'Status', render: (row) => <Badge>{row.is_active ? 'Active' : 'Disabled'}</Badge> },
    { key: 'last_login', label: 'Last login', render: (row) => row.last_login ? new Date(row.last_login).toLocaleString() : 'Never' },
    {
      key: 'actions',
      label: 'Action',
      render: (row) => (
        <Button
          size="sm"
          variant="danger"
          icon={ShieldOff}
          loading={busyAdminId === row.id}
          disabled={!row.is_active || row.id === auth.admin?.id || Boolean(busyAdminId)}
          onClick={(event) => {
            event.stopPropagation();
            void disableAdmin(row);
          }}
        >
          Disable
        </Button>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1300px] space-y-6">
      <div>
        <p className="label-caps text-t-accent">Platform Settings</p>
        <h1 className="mt-2 font-display text-3xl font-black text-t-text sm:text-4xl">Super Admin Settings</h1>
        <p className="mt-2 max-w-3xl text-t-text-muted">Manage your profile, security, and platform owner accounts.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Profile Settings" eyebrow="Account identity" />
          <CardBody className="space-y-4">
            <Field label="Display Name"><Input value={profile.display_name} onChange={(e) => setProfile((prev) => ({ ...prev, display_name: e.target.value }))} /></Field>
            <Field label="Username"><Input value={profile.username} onChange={(e) => setProfile((prev) => ({ ...prev, username: e.target.value }))} /></Field>
            <Field label="Email"><Input value={profile.email} onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))} inputMode="email" /></Field>
            <Button icon={Save} loading={savingProfile} disabled={savingProfile} onClick={() => void saveProfile()}>
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Security Settings" eyebrow="Password" />
          <CardBody className="space-y-4">
            <Field label="Current Password"><Input type="password" value={passwords.current_password} onChange={(e) => setPasswords((prev) => ({ ...prev, current_password: e.target.value }))} /></Field>
            <Field label="New Password"><Input type="password" value={passwords.new_password} onChange={(e) => setPasswords((prev) => ({ ...prev, new_password: e.target.value }))} /></Field>
            <Field label="Confirm New Password"><Input type="password" value={passwords.confirm_password} onChange={(e) => setPasswords((prev) => ({ ...prev, confirm_password: e.target.value }))} /></Field>
            <Button icon={Save} loading={savingPassword} disabled={savingPassword} onClick={() => void savePassword()}>
              {savingPassword ? 'Saving...' : 'Change Password'}
            </Button>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Theme Settings" eyebrow="Super admin visual mode">
          <p className="mt-2 text-sm leading-6 text-t-text-muted">
            Choose the visual theme for Super Admin pages using the same theme system as the normal Admin Settings page.
          </p>
        </CardHeader>
        <CardBody className="space-y-5">
          <ThemePicker value={themeDraft} onChange={setThemeDraft} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-t-text-muted">
              Current saved theme: <span className="font-semibold text-t-text">{THEMES[savedTheme]?.label}</span>
            </p>
            <Button icon={Save} loading={savingTheme} disabled={savingTheme || themeDraft === savedTheme} onClick={() => void saveTheme()}>
              {savingTheme ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader title="Manage Super Admins" eyebrow="Platform owners" />
        <CardBody className="min-w-0 space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Name">
              <Input value={newAdmin.display_name} onChange={(e) => setNewAdmin((prev) => ({ ...prev, display_name: e.target.value }))} />
            </Field>
            <Field label="Email">
              <Input value={newAdmin.email} onChange={(e) => setNewAdmin((prev) => ({ ...prev, email: e.target.value }))} inputMode="email" />
              {newAdmin.email && adminValidation.errors.email ? <p className="text-xs text-t-error">{adminValidation.errors.email}</p> : null}
            </Field>
            <Field label="Username">
              <Input value={newAdmin.username} onChange={(e) => setNewAdmin((prev) => ({ ...prev, username: e.target.value }))} />
            </Field>
            <Field label="Password">
              <PasswordInput
                value={newAdmin.password}
                visible={showNewPassword}
                onToggle={() => setShowNewPassword((prev) => !prev)}
                onChange={(e) => setNewAdmin((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Create password"
              />
              {newAdmin.password && adminValidation.errors.password ? <p className="text-xs text-t-error">{adminValidation.errors.password}</p> : null}
            </Field>
            <Field label="Confirm Password">
              <PasswordInput
                value={newAdmin.confirm_password}
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((prev) => !prev)}
                onChange={(e) => setNewAdmin((prev) => ({ ...prev, confirm_password: e.target.value }))}
                placeholder="Confirm password"
              />
              {newAdmin.confirm_password && adminValidation.errors.confirm_password ? <p className="text-xs text-t-error">{adminValidation.errors.confirm_password}</p> : null}
            </Field>
          </div>
          {adminFormError ? <p className="rounded-lg border border-t-error/20 bg-t-error-subtle px-3 py-2 text-sm text-t-error">{adminFormError}</p> : null}
          <Button icon={Plus} loading={creatingAdmin} disabled={creatingAdmin || !adminValidation.valid} onClick={() => void createAdmin()}>
            {creatingAdmin ? 'Adding...' : 'Add Super Admin'}
          </Button>
          <Table columns={adminColumns} rows={admins} rowKey="id" tableMinWidth="min-w-[920px]" />
        </CardBody>
      </Card>
    </div>
  );
}
