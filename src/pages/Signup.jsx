import { Apple, ShieldCheck, Star } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card, { CardBody } from '../components/Card';
import { Field, Input } from '../components/Input';
import { useToast } from '../state/toast';

const signupImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDXCdnggzyE0ONfPdjuRtCls7V8ctVbyePLHs4dKsJsKYPcpSMSPUcvzzjHPvpGWhrITjG6p8quw-Erc_1LrLoKODS1aYnc2pcwLbwdCEMIqQY7mzWnMTbzdfJQHgS_hyOPKp78S4KcC31TAbl51W8p5_DDlhD2SCKzJrwWFMqr1H2mz-WL4jqwhXx9vCaMTrcdAPCs8p_pYtgfSm9Rk_rimRTPelCTjHYUwXBrtNnUMG3gHwQTzQ9KF-wySg5twcpxN25UOG4JsGoi';

export default function Signup() {
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = 'Name required';
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
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    toast.success('Account initialized', 'Demo account created. Redirecting to admin login…', { durationMs: 3200 });
    navigate('/admin/login', { replace: true });
  };

  return (
    <main className="grid min-h-screen pt-20 lg:grid-cols-2">
      <section className="relative hidden min-h-[720px] items-center overflow-hidden p-10 lg:flex">
        <img src={signupImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" />
        <div className="relative max-w-lg">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-crimson-600/30 bg-crimson-600/10 px-4 py-2 text-sm text-crimson-300">
            <ShieldCheck className="h-4 w-4" />
            Trusted by industry leaders
          </div>
          <h1 className="font-display text-5xl font-black text-white">Secure the Future of Intelligence.</h1>
          <p className="mt-5 leading-7 text-zinc-300">
            Join teams leveraging Aegis AI to resolve complex complaint anomalies faster than traditional support protocols.
          </p>
          <Card className="mt-8 max-w-md bg-black/45">
            <CardBody>
              <div className="mb-3 flex gap-1 text-crimson-500">
                {Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-sm leading-6 text-zinc-300">
                "Aegis changed our executive support posture from reactive triage to command-grade prevention."
              </p>
              <p className="mt-4 label-caps text-zinc-500">NovaAir Voice Operations</p>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-10">
        <Card className="w-full max-w-lg">
          <CardBody className="p-6 sm:p-8">
            <h2 className="font-display text-3xl font-black text-white">Initialize Account</h2>
            <p className="mt-2 text-zinc-400">Access the Aegis AI Command Center.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Button
                variant="secondary"
                onClick={() => toast.info('OAuth (demo)', 'Google sign-in simulated for the premium demo.', { durationMs: 3200 })}
              >
                Google
              </Button>
              <Button
                variant="secondary"
                icon={Apple}
                onClick={() => toast.info('OAuth (demo)', 'Apple sign-in simulated for the premium demo.', { durationMs: 3200 })}
              >
                Apple
              </Button>
            </div>
            <div className="my-7 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="label-caps text-zinc-600">Or protocol email</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <form className="space-y-4" onSubmit={submit}>
              <Field label="Full Identity Name" hint={errors.name} className={errors.name ? 'text-crimson-200' : undefined}>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jonathan Doe" className={errors.name ? 'border-crimson-600/40 ring-1 ring-crimson-600/20' : ''} />
              </Field>
              <Field label="Secured Email Address" hint={errors.email} className={errors.email ? 'text-crimson-200' : undefined}>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="j.doe@enterprise.com" className={errors.email ? 'border-crimson-600/40 ring-1 ring-crimson-600/20' : ''} />
              </Field>
              <Field label="Access Passphrase" hint={errors.pw1} className={errors.pw1 ? 'text-crimson-200' : undefined}>
                <Input value={pw1} onChange={(e) => setPw1(e.target.value)} type="password" placeholder="Create passphrase" className={errors.pw1 ? 'border-crimson-600/40 ring-1 ring-crimson-600/20' : ''} />
              </Field>
              <Field label="Confirm Passphrase" hint={errors.pw2} className={errors.pw2 ? 'text-crimson-200' : undefined}>
                <Input value={pw2} onChange={(e) => setPw2(e.target.value)} type="password" placeholder="Confirm passphrase" className={errors.pw2 ? 'border-crimson-600/40 ring-1 ring-crimson-600/20' : ''} />
              </Field>
              <Button className="h-14 w-full" type="submit" loading={loading} disabled={loading}>
                {loading ? 'Initializing…' : 'Initialize Deployment'}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-zinc-500">
              Already authenticated? <Link to="/admin/login" className="font-semibold text-crimson-400">Sign in here</Link>
            </p>
          </CardBody>
        </Card>
      </section>
    </main>
  );
}
