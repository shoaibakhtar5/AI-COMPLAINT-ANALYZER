import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import AuthCard from '../components/AuthCard';
import AuthInput from '../components/AuthInput';
import Button from '../components/Button';
import SecretKeyField from '../components/SecretKeyField';
import { brand } from '../data/brand';
import { useAuth } from '../state/auth';
import { useSuperAdminAuth } from '../state/superAdminAuth';
import { useToast } from '../state/toast';

const MotionDiv = motion.div;

function authErrorMessage(code) {
  if (code === 'SECRET_KEY_INVALID') return 'Invalid company secret key.';
  if (code === 'PASSWORD_INVALID') return 'Incorrect password.';
  if (code === 'WORKSPACE_SUSPENDED') return 'Your workspace has been suspended. Contact platform support.';
  if (code === 'WORKSPACE_NOT_FOUND') return 'Workspace not found for this username or email.';
  return 'Unable to sign in. Please try again.';
}

export default function AdminLogin() {
  const auth = useAuth();
  const superAuth = useSuperAdminAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const from = location.state?.reason === 'logged-out' ? '/admin/dashboard' : location.state?.from || '/admin/dashboard';
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [shakeKey, setShakeKey] = useState(0);

  const canSubmit = useMemo(() => !loading && !success, [loading, success]);

  const validate = () => {
    const next = {};
    if (!usernameOrEmail.trim()) next.usernameOrEmail = 'Enter your username or business email.';
    if (!password) next.password = 'Enter your password.';
    if (!secretKey.trim()) next.secretKey = 'Enter your company secret key.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      setShakeKey((value) => value + 1);
      toast.error('Missing details', 'Complete the highlighted fields to continue.', { durationMs: 3200 });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await auth.login({ usernameOrEmail, password, secretKey, remember });
      setSuccess(true);
      toast.success('Workspace verified', 'Opening your complaint dashboard.', { durationMs: 2200 });
      await new Promise((resolve) => setTimeout(resolve, 650));
      navigate(from, { replace: true });
    } catch (error) {
      const message = authErrorMessage(error?.code);
      setErrors({ form: message, [error?.code === 'SECRET_KEY_INVALID' ? 'secretKey' : error?.code === 'PASSWORD_INVALID' ? 'password' : 'usernameOrEmail']: message });
      setShakeKey((value) => value + 1);
      toast.error('Sign in failed', message, { durationMs: 4200 });
    } finally {
      setLoading(false);
    }
  };

  if (auth.isAuthed) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (superAuth.isAuthed) {
    return <Navigate to="/super-admin/dashboard" replace />;
  }

  return (
    <AnimatedBackground>
      <div className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6">
        <Button variant="secondary" size="sm" onClick={() => navigate('/super-admin/login', { replace: true })}>
          Super Admin
        </Button>
      </div>
      <div className="flex min-h-screen items-center justify-center px-4 py-5 sm:px-6 lg:px-8">
        <MotionDiv
          key={shakeKey}
          animate={errors.form ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
          transition={{ duration: 0.34 }}
          className="w-full"
        >
          <AuthCard
            eyebrow="Secure Workspace Login"
            title={`Sign in to ${brand.name}`}
            description="Access your company workspace with your account credentials and private workspace key."
            className="max-w-4xl lg:grid-cols-[minmax(0,0.96fr)_minmax(300px,0.64fr)]"
            aside={
              <div className="space-y-4">
                <div className="rounded-lg border border-t-accent/20 bg-t-accent-subtle p-4">
                  <div className="mb-3 flex items-center gap-2.5 text-t-accent">
                    <ShieldCheck className="h-4 w-4" />
                    <p className="label-caps">Secure Workspace Access</p>
                  </div>
                  <p className="text-xs leading-5 text-t-text-muted">
                    Sign in with the business email, password, and private company key created during workspace setup.
                  </p>
                </div>
                <div className="space-y-2.5 rounded-lg border border-t-border bg-t-panel p-4">
                  {['Workspace key verification', 'Protected admin routes', 'Frontend-ready API structure'].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-xs text-t-text-muted">
                      <CheckCircle2 className="h-3.5 w-3.5 text-t-success" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            }
          >
            <form className="space-y-4" onSubmit={submit}>
              <AuthInput
                label="Username or Email"
                icon={Mail}
                value={usernameOrEmail}
                onChange={(event) => setUsernameOrEmail(event.target.value)}
                placeholder="admin@company.com"
                autoComplete="username"
                error={errors.usernameOrEmail}
              />
              <AuthInput
                label="Password"
                icon={Lock}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                autoComplete="current-password"
                error={errors.password}
                right={
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-t-text-muted transition hover:bg-t-panel-high hover:text-t-text"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              <SecretKeyField value={secretKey} onChange={(event) => setSecretKey(event.target.value)} placeholder="COMPANY-SECURE-2026" error={errors.secretKey} />

              <AnimatePresence>
                {errors.form ? (
                  <MotionDiv
                    initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                    className="flex gap-2.5 rounded-lg border border-t-error/30 bg-t-error-subtle p-3 text-sm text-t-error"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{errors.form}</span>
                  </MotionDiv>
                ) : null}
              </AnimatePresence>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2 text-t-text-muted">
                  <input checked={remember} onChange={(e) => setRemember(e.target.checked)} type="checkbox"
                    className="rounded border-t-border bg-t-panel" style={{ accentColor: 'var(--t-accent)' }} />
                  Remember me
                </label>
                <button type="button"
                  onClick={() => toast.info('Password reset', 'Password reset is ready for API integration in a future build.', { durationMs: 3200 })}
                  className="text-t-text-muted transition hover:text-t-accent">
                  Forgot password?
                </button>
              </div>

              <Button type="submit" size="md" className="h-11 w-full" loading={loading} disabled={!canSubmit}>
                {success ? 'Workspace verified' : loading ? 'Verifying workspace...' : 'Login'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-t-text-muted">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="font-semibold text-t-accent transition hover:text-t-text">Create Company Workspace</Link>
            </p>
          </AuthCard>
        </MotionDiv>
      </div>
    </AnimatedBackground>
  );
}
