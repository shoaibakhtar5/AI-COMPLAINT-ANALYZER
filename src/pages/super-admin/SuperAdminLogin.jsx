import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, Lock, ShieldCheck, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../../components/AnimatedBackground';
import AuthCard from '../../components/AuthCard';
import AuthInput from '../../components/AuthInput';
import Button from '../../components/Button';
import { brand } from '../../data/brand';
import { useSuperAdminAuth } from '../../state/superAdminAuth';
import { useToast } from '../../state/toast';

const MotionDiv = motion.div;

export default function SuperAdminLogin() {
  const auth = useSuperAdminAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const from = location.state?.from || '/super-admin/dashboard';
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [shakeKey, setShakeKey] = useState(0);
  const canSubmit = useMemo(() => !loading, [loading]);

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!usernameOrEmail.trim()) next.usernameOrEmail = 'Enter super admin username or email.';
    if (!password) next.password = 'Enter password.';
    setErrors(next);
    if (Object.keys(next).length) {
      setShakeKey((value) => value + 1);
      toast.error('Missing details', 'Complete the highlighted fields to continue.', { durationMs: 2800 });
      return;
    }

    setLoading(true);
    try {
      await auth.login({ usernameOrEmail, password, remember });
      toast.success('Platform verified', 'Opening the super admin dashboard.', { durationMs: 2200 });
      navigate(from, { replace: true });
    } catch (error) {
      const message = error?.message || 'Unable to sign in as super admin.';
      setErrors({ form: message });
      setShakeKey((value) => value + 1);
      toast.error('Super admin sign in failed', message, { durationMs: 4200 });
    } finally {
      setLoading(false);
    }
  };

  if (auth.isAuthed) {
    return <Navigate to="/super-admin/dashboard" replace />;
  }

  return (
    <AnimatedBackground>
      <div className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6">
        <Button variant="secondary" size="sm" onClick={() => navigate('/admin/login', { replace: true })}>
          Company Login
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
            eyebrow="Platform Owner Access"
            title={`${brand.name} Super Admin`}
            description="Sign in to manage companies, platform users, usage, and super admin settings."
            className="max-w-4xl lg:grid-cols-[minmax(0,0.96fr)_minmax(300px,0.64fr)]"
            aside={
              <div className="space-y-4">
                <div className="rounded-lg border border-t-accent/20 bg-t-accent-subtle p-4">
                  <div className="mb-3 flex items-center gap-2.5 text-t-accent">
                    <ShieldCheck className="h-4 w-4" />
                    <p className="label-caps">Platform Control Plane</p>
                  </div>
                  <p className="text-xs leading-5 text-t-text-muted">
                    Super admin sessions are separate from company workspace sessions and require platform-level authorization.
                  </p>
                </div>
                <div className="rounded-lg border border-t-border bg-t-panel p-4 text-xs leading-5 text-t-text-muted">
                  Development credentials are seeded only when no super admin exists.
                </div>
              </div>
            }
          >
            <form className="space-y-4" onSubmit={submit}>
              <AuthInput
                label="Username or Email"
                icon={UserRound}
                value={usernameOrEmail}
                onChange={(event) => setUsernameOrEmail(event.target.value)}
                placeholder="superadmin"
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
                  <input checked={remember} onChange={(e) => setRemember(e.target.checked)} type="checkbox" className="rounded border-t-border bg-t-panel" style={{ accentColor: 'var(--t-accent)' }} />
                  Remember me
                </label>
                <Link to="/admin/login" className="text-t-text-muted transition hover:text-t-accent">
                  Company workspace
                </Link>
              </div>

              <Button type="submit" size="md" className="h-11 w-full" loading={loading} disabled={!canSubmit}>
                {loading ? 'Verifying platform access...' : 'Login as Super Admin'}
              </Button>
            </form>
          </AuthCard>
        </MotionDiv>
      </div>
    </AnimatedBackground>
  );
}

