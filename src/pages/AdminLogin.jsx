import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import AuthCard from '../components/AuthCard';
import AuthInput from '../components/AuthInput';
import Button from '../components/Button';
import SecretKeyField from '../components/SecretKeyField';
import { brand } from '../data/brand';
import { useAuth } from '../state/auth';
import { useToast } from '../state/toast';

const MotionDiv = motion.div;

function authErrorMessage(code) {
  if (code === 'SECRET_KEY_INVALID') return 'Invalid company secret key.';
  if (code === 'PASSWORD_INVALID') return 'Incorrect password.';
  if (code === 'WORKSPACE_NOT_FOUND') return 'Workspace not found for this username or email.';
  return 'Unable to sign in. Please try again.';
}

export default function AdminLogin() {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const from = location.state?.from || '/admin/dashboard';
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

  const fillDemo = () => {
    setUsernameOrEmail(auth.demo.email);
    setPassword(auth.demo.password);
    setSecretKey(auth.demo.secretKey);
    setErrors({});
  };

  return (
    <AnimatedBackground>
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
                <div className="rounded-lg border border-crimson-500/20 bg-crimson-600/10 p-4">
                  <div className="mb-3 flex items-center gap-2.5 text-crimson-200">
                    <Sparkles className="h-4 w-4" />
                    <p className="label-caps">Demo Workspace</p>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <p className="text-zinc-500">Username or Email</p>
                      <p className="mt-0.5 font-mono text-white">{auth.demo.email}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Password</p>
                      <p className="mt-0.5 font-mono text-white">{auth.demo.password}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Company Secret Key</p>
                      <p className="mt-0.5 font-mono text-white">{auth.demo.secretKey}</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="mt-4" onClick={fillDemo} disabled={loading}>
                    Fill demo credentials
                  </Button>
                </div>
                <div className="space-y-2.5 rounded-lg border border-white/10 bg-black/25 p-4">
                  {['Workspace key verification', 'Protected admin routes', 'Frontend-ready API structure'].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-xs text-zinc-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
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
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              <SecretKeyField value={secretKey} onChange={(event) => setSecretKey(event.target.value)} placeholder="NEXUS-SECURE-2026" error={errors.secretKey} />

              <AnimatePresence>
                {errors.form ? (
                  <MotionDiv
                    initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                    className="flex gap-2.5 rounded-lg border border-crimson-500/30 bg-crimson-600/10 p-3 text-sm text-crimson-100"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{errors.form}</span>
                  </MotionDiv>
                ) : null}
              </AnimatePresence>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2 text-zinc-500">
                  <input
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    type="checkbox"
                    className="rounded border-zinc-700 bg-zinc-900 text-crimson-600 focus:ring-crimson-700"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => toast.info('Password reset', 'Password reset is ready for API integration in a future build.', { durationMs: 3200 })}
                  className="text-zinc-500 transition hover:text-crimson-300"
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" size="md" className="h-11 w-full" loading={loading} disabled={!canSubmit}>
                {success ? 'Workspace verified' : loading ? 'Verifying workspace...' : 'Login'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-zinc-500">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="font-semibold text-crimson-300 transition hover:text-white">
                Create Company Workspace
              </Link>
            </p>
          </AuthCard>
        </MotionDiv>
      </div>
    </AnimatedBackground>
  );
}
