import { Plus, Save, ShieldOff } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card, { CardBody, CardHeader } from '../../components/Card';
import { Field, Input } from '../../components/Input';
import Table from '../../components/Table';
import { superAdminFetch } from '../../lib/superAdminApi';
import { useSuperAdminAuth } from '../../state/superAdminAuth';
import { useToast } from '../../state/toast';
import { SUPER_ADMIN_LAYOUTS, normalizeSuperAdminLayout, superAdminLayoutClasses } from '../../utils/superAdminLayout';

export default function SuperAdminSettings() {
  const auth = useSuperAdminAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({
    username: auth.admin?.username ?? '',
    email: auth.admin?.email ?? '',
    display_name: auth.admin?.display_name ?? '',
  });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [newAdmin, setNewAdmin] = useState({ display_name: '', email: '', username: '', temporary_password: '' });
  const [layoutDraft, setLayoutDraft] = useState(normalizeSuperAdminLayout(auth.admin?.layout_preference));
  const [admins, setAdmins] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingLayout, setSavingLayout] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [busyAdminId, setBusyAdminId] = useState('');

  useEffect(() => {
    setProfile({
      username: auth.admin?.username ?? '',
      email: auth.admin?.email ?? '',
      display_name: auth.admin?.display_name ?? '',
    });
    setLayoutDraft(normalizeSuperAdminLayout(auth.admin?.layout_preference));
  }, [auth.admin]);

  const layoutClasses = superAdminLayoutClasses(auth.admin?.layout_preference);

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

  const saveLayout = async () => {
    setSavingLayout(true);
    try {
      await superAdminFetch('/settings', { method: 'PATCH', body: { layout_preference: layoutDraft } });
      await auth.refreshAdmin();
      toast.success('Layout saved', 'Super Admin layout preference updated.', { durationMs: 2600 });
    } catch (error) {
      toast.error('Layout save failed', error.message || 'Could not save layout preference.', { durationMs: 4200 });
    } finally {
      setSavingLayout(false);
    }
  };

  const createAdmin = async () => {
    setCreatingAdmin(true);
    try {
      const created = await superAdminFetch('/admins', { method: 'POST', body: newAdmin });
      setAdmins((prev) => [...prev, created]);
      setNewAdmin({ display_name: '', email: '', username: '', temporary_password: '' });
      toast.success('Super admin added', `${created.username} can now access the platform admin panel.`, { durationMs: 3000 });
    } catch (error) {
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
    <div className={`mx-auto w-full max-w-[1300px] ${layoutClasses.page}`}>
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
        <CardHeader title="Layout Settings" eyebrow="Super admin only">
          <p className="mt-2 text-sm leading-6 text-t-text-muted">
            Choose how Super Admin pages are arranged. Changes apply only after Save Changes and never affect company workspaces.
          </p>
        </CardHeader>
        <CardBody className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {SUPER_ADMIN_LAYOUTS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setLayoutDraft(option.id)}
                className={`rounded-lg border p-4 text-left transition-all duration-200 ${
                  layoutDraft === option.id
                    ? 'border-t-accent bg-t-accent-subtle shadow-[0_0_0_2px_var(--t-accent-subtle)]'
                    : 'border-t-border bg-t-panel hover:border-t-border-strong'
                }`}
              >
                <span className="block font-display text-sm font-bold text-t-text">{option.label}</span>
                <span className="mt-2 block text-xs leading-5 text-t-text-muted">{option.description}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-t-text-muted">
              Current saved layout: <span className="font-semibold text-t-text">{normalizeSuperAdminLayout(auth.admin?.layout_preference)}</span>
            </p>
            <Button icon={Save} loading={savingLayout} disabled={savingLayout || layoutDraft === normalizeSuperAdminLayout(auth.admin?.layout_preference)} onClick={() => void saveLayout()}>
              {savingLayout ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader title="Manage Super Admins" eyebrow="Platform owners" />
        <CardBody className="min-w-0 space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Name"><Input value={newAdmin.display_name} onChange={(e) => setNewAdmin((prev) => ({ ...prev, display_name: e.target.value }))} /></Field>
            <Field label="Email"><Input value={newAdmin.email} onChange={(e) => setNewAdmin((prev) => ({ ...prev, email: e.target.value }))} inputMode="email" /></Field>
            <Field label="Username"><Input value={newAdmin.username} onChange={(e) => setNewAdmin((prev) => ({ ...prev, username: e.target.value }))} /></Field>
            <Field label="Temporary Password"><Input type="password" value={newAdmin.temporary_password} onChange={(e) => setNewAdmin((prev) => ({ ...prev, temporary_password: e.target.value }))} /></Field>
          </div>
          <Button icon={Plus} loading={creatingAdmin} disabled={creatingAdmin} onClick={() => void createAdmin()}>
            {creatingAdmin ? 'Adding...' : 'Add Super Admin'}
          </Button>
          <Table columns={adminColumns} rows={admins} rowKey="id" tableMinWidth="min-w-[920px]" density={layoutClasses.tableDensity} />
        </CardBody>
      </Card>
    </div>
  );
}
