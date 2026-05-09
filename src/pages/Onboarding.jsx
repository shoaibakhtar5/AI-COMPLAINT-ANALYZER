import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Building2, CheckCircle2, ImagePlus, Mail, Sparkles, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import AuthCard from '../components/AuthCard';
import AuthInput from '../components/AuthInput';
import Button from '../components/Button';
import SecretKeyField from '../components/SecretKeyField';
import { Select } from '../components/Input';
import { useAuth } from '../state/auth';
import { useToast } from '../state/toast';
import { cn } from '../utils/cn';

const MotionDiv = motion.div;

const industries = ['Financial Services', 'Healthcare', 'Retail', 'Telecommunications', 'Insurance', 'Technology', 'Public Sector'];
const volumes = ['Under 500 complaints / month', '500 - 1,000 complaints / month', '1,000 - 5,000 complaints / month', '5,000 - 25,000 complaints / month', '25,000+ complaints / month'];

export default function Onboarding() {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const draft = useMemo(() => auth.getSignupDraft(), [auth]);

  const [companyName, setCompanyName] = useState(location.state?.companyName ?? draft?.companyName ?? '');
  const [ownerName, setOwnerName] = useState(location.state?.ownerName ?? draft?.ownerName ?? '');
  const [businessEmail, setBusinessEmail] = useState(location.state?.businessEmail ?? draft?.businessEmail ?? '');
  const [industry, setIndustry] = useState('Financial Services');
  const [volume, setVolume] = useState('1,000 - 5,000 complaints / month');
  const [secretKey, setSecretKey] = useState('');
  const [confirmSecretKey, setConfirmSecretKey] = useState('');
  const [logoName, setLogoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!businessEmail && draft?.businessEmail) setBusinessEmail(draft.businessEmail);
    if (!companyName && draft?.companyName) setCompanyName(draft.companyName);
    if (!ownerName && draft?.ownerName) setOwnerName(draft.ownerName);
  }, [businessEmail, companyName, draft, ownerName]);

  const progress = useMemo(() => {
    const completed = [companyName, ownerName, businessEmail, industry, volume, secretKey, confirmSecretKey].filter(Boolean).length;
    return Math.round((completed / 7) * 100);
  }, [businessEmail, companyName, confirmSecretKey, industry, ownerName, secretKey, volume]);

  const validate = () => {
    const next = {};
    if (!companyName.trim()) next.companyName = 'Enter the company name.';
    if (!ownerName.trim()) next.ownerName = 'Enter the owner name.';
    if (!businessEmail.trim()) next.businessEmail = 'Enter a business email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail.trim())) next.businessEmail = 'Enter a valid business email.';
    if (!secretKey.trim()) next.secretKey = 'Create a company secret key.';
    else if (secretKey.trim().length < 10) next.secretKey = 'Use at least 10 characters.';
    if (!confirmSecretKey.trim()) next.confirmSecretKey = 'Confirm the company secret key.';
    else if (confirmSecretKey.trim().toUpperCase() !== secretKey.trim().toUpperCase()) next.confirmSecretKey = 'Secret keys do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      toast.error('Setup incomplete', 'Please review the highlighted fields.', { durationMs: 3400 });
      return;
    }

    setLoading(true);
    await auth.initializeWorkspace({
      companyName,
      ownerName,
      businessEmail,
      industry,
      volume,
      secretKey,
      logoName,
    });
    setLoading(false);
    setSuccess(true);
    toast.success('Workspace successfully created', 'Opening your dashboard.', { durationMs: 2600 });
    await new Promise((resolve) => setTimeout(resolve, 1100));
    navigate('/admin/dashboard', { replace: true });
  };

  return (
    <AnimatedBackground>
      <div className="flex min-h-screen items-center justify-center px-4 pb-5 pt-24 sm:px-6 lg:px-8">
        <AuthCard
          eyebrow="Company Setup"
          title="Configure your secure workspace"
          description="Set up the company profile and private secret key your team will use to access this workspace."
          className="max-w-6xl lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.56fr)]"
          aside={
            <div className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="label-caps text-crimson-300">Setup Progress</p>
                  <span className="font-display text-xl font-black text-white">{progress}%</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-crimson-800 via-crimson-500 to-red-300"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>
                <div className="mt-4 space-y-2.5">
                  {['Company profile', 'Workspace volume', 'Secret key'].map((item, index) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-zinc-300">
                      <span className={cn('grid h-6 w-6 place-items-center rounded-full border text-[11px] font-bold', progress >= (index + 1) * 34 ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'border-white/10 bg-white/5 text-zinc-500')}>
                        {index + 1}
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-crimson-500/20 bg-crimson-600/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-crimson-200">
                  <Sparkles className="h-4 w-4" />
                  <p className="label-caps">Company Secret Key</p>
                </div>
                <p className="text-xs leading-5 text-zinc-300">
                  This key acts like a private workspace access code. Users need it together with their email and password when signing in.
                </p>
              </div>
            </div>
          }
        >
          <form className="space-y-3" onSubmit={submit}>
            <div className="grid gap-4 md:grid-cols-2">
              <AuthInput label="Company Name" icon={Building2} value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Nexus Bank" error={errors.companyName} />
              <AuthInput label="Owner Name" icon={UserRound} value={ownerName} onChange={(event) => setOwnerName(event.target.value)} placeholder="Irfan Marwat" error={errors.ownerName} />
              <AuthInput label="Business Email" icon={Mail} type="email" value={businessEmail} onChange={(event) => setBusinessEmail(event.target.value)} placeholder="owner@company.com" error={errors.businessEmail} />
              <label className="block space-y-2">
                <span className="label-caps block text-zinc-500">Industry Type</span>
                <Select value={industry} onChange={(event) => setIndustry(event.target.value)} className="h-10 py-0 text-sm">
                  {industries.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </label>
              <label className="block space-y-2 md:col-span-2">
                <span className="label-caps block text-zinc-500">Expected Complaint Volume</span>
                <Select value={volume} onChange={(event) => setVolume(event.target.value)} className="h-10 py-0 text-sm">
                  {volumes.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SecretKeyField value={secretKey} onChange={(event) => setSecretKey(event.target.value)} placeholder="NEXUS-SECURE-2026" error={errors.secretKey} helper="Required for secure company login." />
              <SecretKeyField label="Confirm Secret Key" value={confirmSecretKey} onChange={(event) => setConfirmSecretKey(event.target.value)} placeholder="Repeat company secret key" error={errors.confirmSecretKey} helper="" />
            </div>

            <label className="flex cursor-pointer flex-col gap-3 rounded-lg border border-dashed border-white/15 bg-black/20 p-3.5 transition hover:border-crimson-500/35 hover:bg-crimson-950/10 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-zinc-400">
                  <ImagePlus className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Company Logo Upload</p>
                  <p className="mt-1 text-xs text-zinc-500">{logoName || 'Optional. PNG or JPG recommended.'}</p>
                </div>
              </div>
              <span className="label-caps text-crimson-300">Choose File</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="sr-only"
                onChange={(event) => setLogoName(event.target.files?.[0]?.name ?? '')}
              />
            </label>

            <Button type="submit" size="md" className="h-11 w-full" loading={loading} disabled={loading || success}>
              {loading ? 'Creating secure workspace...' : 'Complete Company Setup'}
            </Button>
          </form>
        </AuthCard>
      </div>

      <AnimatePresence>
        {success ? (
          <MotionDiv
            className="fixed inset-0 z-[90] grid place-items-center bg-black/80 p-4 backdrop-blur-xl"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
          >
            <MotionDiv
              initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 16 }}
              animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-xl border border-emerald-400/20 bg-panel/95 p-6 text-center shadow-panel"
            >
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-200" />
              </div>
              <h2 className="mt-4 font-display text-xl font-black text-white">Workspace Successfully Created</h2>
              <p className="mt-2 text-sm leading-5 text-zinc-400">Your company workspace is ready. Redirecting to the admin dashboard.</p>
            </MotionDiv>
          </MotionDiv>
        ) : null}
      </AnimatePresence>
    </AnimatedBackground>
  );
}
