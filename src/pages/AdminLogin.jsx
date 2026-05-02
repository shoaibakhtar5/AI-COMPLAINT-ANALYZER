import { Eye, EyeOff, KeyRound, Lock, ShieldCheck, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card, { CardBody } from '../components/Card';
import { Field, Input } from '../components/Input';
import { useAuth } from '../state/auth';
import { useToast } from '../state/toast';

const loginImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCMvxgRjZ3dBv5KXXiHf2QU3NGlRe5f7DNfkUhDxDrwbP9NMOkf28-mcNhitkBMan2SK9bPuc4ViMehK_eKHjta9ZTYPrQaZ2iJd5-3fgENw7o_DFJfkNZTYZ-X5mFe3j86P22mwYIF3KxzzkntfT5vi2mUh414zVJjMBFGDPwsFNIHBAmPt2rq5bp9Orkg3QyKJoqYx4_tYymhhGAa0MGgnwsjN2jHK7rYLRqNbe_OmXE2_tEET_yOD8Wn4zjtlOJJ0JzyGJB9c-56';

const MotionDiv = motion.div;

export default function AdminLogin() {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [shakeKey, setShakeKey] = useState(0);

  const demo = auth.demo;

  const canSubmit = useMemo(() => {
    return !loading;
  }, [loading]);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter valid email';
    if (!password) next.password = 'Password required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setShakeKey((k) => k + 1);
      toast.error('Login failed', 'Please fix the highlighted fields.', { durationMs: 3200 });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await auth.login({ email, password, remember });
      toast.success('Access granted', 'Redirecting to command dashboard…', { durationMs: 2200 });
      navigate(from, { replace: true });
    } catch (err) {
      setShakeKey((k) => k + 1);
      const msg = err?.code === 'AUTH_INVALID' ? 'Incorrect email or password. Please try again.' : 'Unable to authorize. Try again.';
      setErrors({ form: msg });
      toast.error('Login failed', msg, { durationMs: 4200 });
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(demo.email);
    setPassword(demo.password);
    setErrors({});
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black p-4">
      <img src={loginImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 grayscale" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#2a0808_0%,#050506_65%)] opacity-90" />
      <section className="relative z-10 grid w-full max-w-5xl gap-5 lg:grid-cols-[420px_1fr]">
        <MotionDiv
          key={shakeKey}
          animate={errors.form ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.42 }}
          className="glass-edge crimson-glow w-full rounded-lg p-6 shadow-panel sm:p-8"
        >
          <div className="mb-7 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-crimson-700 shadow-crimson">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-xl font-black uppercase text-white">Admin Login</h1>
                <p className="label-caps mt-1 text-zinc-500">Aegis AI Enterprise Access</p>
              </div>
            </div>
            <div className="hidden sm:block">
              <Button variant="secondary" size="sm" onClick={fillDemo} disabled={loading}>
                Use demo
              </Button>
            </div>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <Field
              label="Admin Email"
              hint={errors.email ? errors.email : 'Use the demo card credentials below.'}
              className={errors.email ? 'text-crimson-200' : undefined}
            >
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600" />
                <Input
                  className={errors.email ? 'border-crimson-600/40 ring-1 ring-crimson-600/20 pl-12' : 'pl-12'}
                  placeholder="admin@complaintai.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputMode="email"
                  autoComplete="email"
                />
              </div>
            </Field>

            <Field label="Password" hint={errors.password ? errors.password : ''} className={errors.password ? 'text-crimson-200' : undefined}>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600" />
                <Input
                  className={errors.password ? 'border-crimson-600/40 ring-1 ring-crimson-600/20 pl-12 pr-12' : 'pl-12 pr-12'}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {errors.form ? (
              <div className="rounded-lg border border-crimson-600/30 bg-crimson-600/10 p-4 text-sm text-crimson-200 shadow-crimson">
                <p className="font-semibold">Incorrect email or password</p>
                <p className="mt-1 text-crimson-100/80">Please try again.</p>
              </div>
            ) : null}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-500">
                <input
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  type="checkbox"
                  className="rounded border-zinc-700 bg-zinc-900 text-crimson-600 focus:ring-crimson-700"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => toast.info('Password assistance', 'For the demo, use the credentials on this page.', { durationMs: 3200 })}
                className="text-zinc-500 transition hover:text-crimson-400"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" icon={KeyRound} loading={loading} disabled={!canSubmit}>
              {loading ? 'Authorizing…' : 'Authorize Access'}
            </Button>
          </form>

          <p className="mt-7 border-t border-white/10 pt-5 text-center text-xs leading-5 text-zinc-600">
            Restricted enterprise system. Unauthorized access attempts are logged by Aegis AI Core.
          </p>
        </MotionDiv>

        <div className="space-y-4">
          <Card className="bg-black/40">
            <CardBody>
              <p className="label-caps text-crimson-400">Demo Admin Access</p>
              <div className="mt-4 grid gap-3 rounded-lg border border-white/10 bg-black/25 p-4">
                <div>
                  <p className="text-xs text-zinc-500">Admin Email</p>
                  <p className="mt-1 font-mono text-sm text-white">{demo.email}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Password</p>
                  <p className="mt-1 font-mono text-sm text-white">{demo.password}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={fillDemo} disabled={loading}>
                    Fill form
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard?.writeText(`${demo.email}\n${demo.password}`);
                      toast.success('Copied', 'Demo credentials copied to clipboard.', { durationMs: 2200 });
                    }}
                    disabled={loading}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                This build uses a mock authentication layer (local/session storage) so every admin route, logout, and guard behaves like a real product in demo mode.
              </p>
            </CardBody>
          </Card>

          <Card className="bg-panel/70">
            <CardBody>
              <p className="label-caps text-zinc-500">Premium demo UX</p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                <li>• Loading spinner + disabled state</li>
                <li>• Animated error state (shake + glow)</li>
                <li>• Dismissible toast notifications</li>
                <li>• Protected admin navigation</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </section>
    </main>
  );
}
