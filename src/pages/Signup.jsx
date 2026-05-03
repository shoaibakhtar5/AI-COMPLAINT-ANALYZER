import { Apple, Building2, Mail, ShieldCheck, Star, UserRound } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card, { CardBody } from '../components/Card';
import { Field, Input } from '../components/Input';
import { useToast } from '../state/toast';

const signupImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDXCdnggzyE0ONfPdjuRtCls7V8ctVbyePLHs4dKsJsKYPcpSMSPUcvzzjHPvpGWhrITjG6p8quw-Erc_1LrLoKODS1aYnc2pcwLbwdCEMIqQY7mzWnMTbzdfJQHgS_hyOPKp78S4KcC31TAbl51W8p5_DDlhD2SCKzJrwWFMqr1H2mz-WL4jqwhXx9vCaMTrcdAPCs8p_pYtgfSm9Rk_rimRTPelCTjHYUwXBrtNnUMG3gHwQTzQ9KF-wySg5twcpxN25UOG4JsGoi';

const MotionDiv = motion.div;

export default function Signup() {
  const toast = useToast();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = 'Full name required';
    if (!company.trim()) next.company = 'Company name required';
    if (!email.trim()) next.email = 'Email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter valid email';
    if (!pw1) next.pw1 = 'Password required';
    else if (pw1.length < 6) next.pw1 = 'Password must be at least 6 characters';
    if (!pw2) next.pw2 = 'Confirm your password';
    else if (pw2 !== pw1) next.pw2 = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Signup failed', 'Please fix the highlighted fields.', { durationMs: 3600 });
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1150));
    setLoading(false);
    toast.success('Account created', 'Opening onboarding for your complaint workspace.', { durationMs: 3200 });
    navigate('/onboarding', { replace: true });
  };

  return (
    <main className="grid min-h-screen pt-20 lg:grid-cols-2">
      <section className="relative hidden min-h-[720px] items-center overflow-hidden p-10 lg:flex">
        <img src={signupImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35 grayscale" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(185,28,28,0.34),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.94),rgba(0,0,0,0.76)_62%,transparent)]"
          animate={reduceMotion ? undefined : { backgroundPosition: ['0% 0%', '10% 4%', '0% 0%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <MotionDiv
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-lg"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-crimson-600/30 bg-crimson-600/10 px-4 py-2 text-sm text-crimson-300">
            <ShieldCheck className="h-4 w-4" />
            Enterprise onboarding
          </div>
          <h1 className="font-display text-5xl font-black text-white">Create a premium complaint intelligence workspace.</h1>
          <p className="mt-5 leading-7 text-zinc-300">
            Bring raw customer complaints, app issues, refunds, fraud reports, and support tickets into one AI-assisted admin platform.
          </p>
          <Card className="mt-8 max-w-md bg-black/45">
            <CardBody>
              <div className="mb-3 flex gap-1 text-crimson-500">
                {Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-sm leading-6 text-zinc-300">
                "The admin flow feels like a mature operations product, not a prototype."
              </p>
              <p className="mt-4 label-caps text-zinc-500">Enterprise Service Lead</p>
            </CardBody>
          </Card>
        </MotionDiv>
      </section>

      <section className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-10">
        <MotionDiv
          initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg"
        >
          <Card>
            <CardBody className="p-6 sm:p-8">
              <h2 className="font-display text-3xl font-black text-white">Create Account</h2>
              <p className="mt-2 text-zinc-400">Start your AI Complaint Analyzer workspace.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <Button variant="secondary" onClick={() => toast.info('OAuth demo', 'Google sign-up is simulated in this frontend build.', { durationMs: 3000 })}>
                  Google
                </Button>
                <Button variant="secondary" icon={Apple} onClick={() => toast.info('OAuth demo', 'Apple sign-up is simulated in this frontend build.', { durationMs: 3000 })}>
                  Apple
                </Button>
              </div>
              <div className="my-7 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="label-caps text-zinc-600">Or use email</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <form className="space-y-4" onSubmit={submit}>
                <Field label="Full Name" hint={errors.name} className={errors.name ? 'text-crimson-200' : undefined}>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600" />
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Irfan Marwat" className={`pl-12 ${errors.name ? 'border-crimson-600/40 ring-1 ring-crimson-600/20' : ''}`} />
                  </div>
                </Field>
                <Field label="Company Name" hint={errors.company} className={errors.company ? 'text-crimson-200' : undefined}>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600" />
                    <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Nexus Bank" className={`pl-12 ${errors.company ? 'border-crimson-600/40 ring-1 ring-crimson-600/20' : ''}`} />
                  </div>
                </Field>
                <Field label="Email" hint={errors.email} className={errors.email ? 'text-crimson-200' : undefined}>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600" />
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="admin@company.com" className={`pl-12 ${errors.email ? 'border-crimson-600/40 ring-1 ring-crimson-600/20' : ''}`} />
                  </div>
                </Field>
                <Field label="Password" hint={errors.pw1} className={errors.pw1 ? 'text-crimson-200' : undefined}>
                  <Input value={pw1} onChange={(e) => setPw1(e.target.value)} type="password" placeholder="Create password" className={errors.pw1 ? 'border-crimson-600/40 ring-1 ring-crimson-600/20' : ''} />
                </Field>
                <Field label="Confirm Password" hint={errors.pw2} className={errors.pw2 ? 'text-crimson-200' : undefined}>
                  <Input value={pw2} onChange={(e) => setPw2(e.target.value)} type="password" placeholder="Confirm password" className={errors.pw2 ? 'border-crimson-600/40 ring-1 ring-crimson-600/20' : ''} />
                </Field>
                <Button className="h-14 w-full" type="submit" loading={loading} disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-zinc-500">
                Already have an account?{' '}
                <Link to="/admin/login" className="font-semibold text-crimson-400 transition hover:text-white">
                  Login
                </Link>
              </p>
            </CardBody>
          </Card>
        </MotionDiv>
      </section>
    </main>
  );
}
