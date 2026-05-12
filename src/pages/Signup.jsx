import { motion, useReducedMotion } from 'framer-motion';
import { Building2, CheckCircle2, Lock, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import AuthCard from '../components/AuthCard';
import AuthInput from '../components/AuthInput';
import Button from '../components/Button';
import { useAuth } from '../state/auth';
import { useToast } from '../state/toast';

const MotionDiv = motion.div;

export default function Signup() {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [ownerName, setOwnerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!ownerName.trim()) next.ownerName = 'Enter the workspace owner name.';
    if (!companyName.trim()) next.companyName = 'Enter your company name.';
    if (!businessEmail.trim()) next.businessEmail = 'Enter a business email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail.trim())) next.businessEmail = 'Enter a valid business email.';
    if (!password) next.password = 'Create a password.';
    else if (password.length < 8) next.password = 'Use at least 8 characters.';
    if (!confirmPassword) next.confirmPassword = 'Confirm your password.';
    else if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      toast.error('Workspace details needed', 'Please complete the highlighted fields.', { durationMs: 3400 });
      return;
    }

    setLoading(true);
    await auth.saveSignupDraft({ ownerName, companyName, businessEmail, password });
    setLoading(false);
    toast.success('Account details saved', 'Continue with secure workspace setup.', { durationMs: 2600 });
    navigate('/onboarding', {
      replace: true,
      state: { ownerName, companyName, businessEmail },
    });
  };

  return (
    <AnimatedBackground>
      <div className="flex min-h-screen items-center justify-center px-4 pb-6 pt-24 sm:px-6 lg:px-8">
        <AuthCard
          eyebrow="Create Company Workspace"
          title="Start your complaint intelligence workspace"
          description="Create an owner account first. You will configure your company secret key in the next step."
          className="max-w-5xl"
          aside={
            <div className="space-y-4">
              <MotionDiv
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.4 }}
                className="rounded-lg border border-t-border bg-t-panel p-4"
              >
                <p className="label-caps text-t-accent">Setup Flow</p>
                <div className="mt-4 space-y-3">
                  {[
                    ['Account', 'Create workspace owner credentials'],
                    ['Company', 'Add company profile and industry'],
                    ['Secret Key', 'Create a private workspace login key'],
                  ].map(([title, text], index) => (
                    <div key={title} className="flex gap-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-t-accent/30 bg-t-accent-subtle text-xs font-bold text-t-accent">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-t-text">{title}</p>
                        <p className="mt-0.5 text-xs leading-5 text-t-text-muted">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </MotionDiv>
              <div className="rounded-lg border border-t-success/30 bg-t-success-subtle p-4">
                <div className="mb-2 flex items-center gap-2 text-t-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <p className="label-caps">Backend Connected</p>
                </div>
                <p className="text-xs leading-5 text-t-text-muted">
                  Signup starts a secure workspace flow and persists the final organization through the FastAPI backend.
                </p>
              </div>
            </div>
          }
        >
          <form className="space-y-4" onSubmit={submit}>
            <AuthInput label="Owner Full Name" icon={UserRound} value={ownerName} onChange={(event) => setOwnerName(event.target.value)} placeholder="Workspace owner" error={errors.ownerName} autoComplete="name" />
            <AuthInput label="Company Name" icon={Building2} value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Company name" error={errors.companyName} autoComplete="organization" />
            <AuthInput label="Business Email" icon={Mail} type="email" value={businessEmail} onChange={(event) => setBusinessEmail(event.target.value)} placeholder="owner@company.com" error={errors.businessEmail} autoComplete="email" />
            <div className="grid gap-4 md:grid-cols-2">
              <AuthInput label="Password" icon={Lock} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create password" error={errors.password} autoComplete="new-password" />
              <AuthInput label="Confirm Password" icon={Lock} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm password" error={errors.confirmPassword} autoComplete="new-password" />
            </div>
            <Button type="submit" size="md" className="h-11 w-full" loading={loading} disabled={loading}>
              {loading ? 'Creating workspace...' : 'Create Workspace'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-t-text-muted">
            Already have an account?{' '}
            <Link to="/admin/login" className="font-semibold text-t-accent transition hover:text-t-text">
              Login
            </Link>
          </p>
        </AuthCard>
      </div>
    </AnimatedBackground>
  );
}
