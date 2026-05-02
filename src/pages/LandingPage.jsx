import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Gauge, LockKeyhole, RadioTower, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card, { CardBody } from '../components/Card';

const MotionDiv = motion.div;

const heroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDRCOvYkL6ztknRC0OLgyPTg8aIJsqPklI3gNQLh8KfnlysnlqLtyyOEm1mHmKBUX18BTwjqXlda7KgRhG5FLoyUUoGyRciLo24oGSSeduVPC8DKe8lDAYgj_caU0LPf8UHiG-9fw1SRlxSpybd-ECYxIw0QLcZf2aXo-8ESd9iinYzIXSZdKImvLWlELudAX6iJr5D9xitqZ4-DLBfOfCWxZYxdKGDIekinJ1LBM5xDl9_vhC_-oLdKseAiYA6oLiiBSlwXpGL3LAT';

const features = [
  {
    title: 'Auto Classification',
    text: 'NLP routing separates billing disputes, service defects, privacy exposure, and security incidents before queues overload.',
    icon: BrainCircuit,
  },
  {
    title: 'Sentiment Analysis',
    text: 'Real-time frustration markers and brand-risk scores surface the exact complaints that need executive action.',
    icon: Gauge,
  },
  {
    title: 'Secure Evidence Trail',
    text: 'Every customer attachment, note, and AI decision stays auditable for compliance teams and resolution leaders.',
    icon: LockKeyhole,
  },
];

const trust = [
  ['98.4%', 'AI accuracy'],
  ['4.2m', 'Mean response'],
  ['500+', 'Enterprise teams'],
  ['99.99%', 'Uptime SLA'],
];

export default function LandingPage() {
  return (
    <main className="pt-20">
      <section className="relative isolate flex min-h-[760px] items-center overflow-hidden lg:min-h-[86vh]">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-background/72 to-background" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <MotionDiv
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mx-auto max-w-4xl"
          >
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-crimson-600/30 bg-crimson-600/10 px-4 py-2 text-sm font-semibold text-crimson-300">
              <ShieldCheck className="h-4 w-4" />
              Crimson Protocol Enabled
            </div>
            <h1 className="font-display text-5xl font-black text-white sm:text-6xl lg:text-7xl">
              AI-Powered Customer Complaint Analyzer
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
              Transform raw feedback into actionable intelligence. Aegis AI classifies, scores, tracks, and resolves customer complaints with enterprise-grade control.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button as={Link} to="/submit" size="lg" icon={Zap}>
                Submit Complaint
              </Button>
              <Button as={Link} to="/admin/dashboard" size="lg" variant="secondary" icon={ArrowRight}>
                View Analytics
              </Button>
            </div>
          </MotionDiv>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-4 lg:px-8">
        {trust.map(([value, label]) => (
          <Card key={label} className="bg-black/35">
            <CardBody>
              <p className="font-display text-3xl font-black text-white">{value}</p>
              <p className="label-caps mt-2 text-zinc-500">{label}</p>
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label-caps text-crimson-500">Autonomous Intelligence Stack</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white">Designed for high-stakes complaint operations</h2>
          </div>
          <p className="max-w-xl text-zinc-400">
            The prototype’s cockpit-style interface becomes a real product surface with responsive forms, dashboards, charts, and management views.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="group overflow-hidden bg-panel/90">
              <CardBody>
                <feature.icon className="mb-8 h-8 w-8 text-crimson-500 transition group-hover:scale-110" />
                <h3 className="font-display text-xl font-bold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{feature.text}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border border-crimson-600/20 bg-black/40 p-8 shadow-crimson md:p-12">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="label-caps text-crimson-400">Ready to secure your reputation?</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white">Launch a controlled complaint command center in minutes.</h2>
              <p className="mt-4 text-zinc-400">
                Use the customer portal for submission and tracking, then move directly into admin analytics and AI triage.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              <Button as={Link} to="/onboarding" size="lg" icon={RadioTower}>
                Initialize Protocol
              </Button>
              <Button as={Link} to="/track" size="lg" variant="secondary">
                Track Complaint
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
