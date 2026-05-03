import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Gauge, LockKeyhole, RadioTower, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import AnimatedCounter from '../components/AnimatedCounter';
import Button from '../components/Button';
import Card, { CardBody } from '../components/Card';
import Reveal from '../components/Reveal';

const MotionDiv = motion.div;

const heroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDRCOvYkL6ztknRC0OLgyPTg8aIJsqPklI3gNQLh8KfnlysnlqLtyyOEm1mHmKBUX18BTwjqXlda7KgRhG5FLoyUUoGyRciLo24oGSSeduVPC8DKe8lDAYgj_caU0LPf8UHiG-9fw1SRlxSpybd-ECYxIw0QLcZf2aXo-8ESd9iinYzIXSZdKImvLWlELudAX6iJr5D9xitqZ4-DLBfOfCWxZYxdKGDIekinJ1LBM5xDl9_vhC_-oLdKseAiYA6oLiiBSlwXpGL3LAT';

const features = [
  {
    title: 'AI Classification',
    text: 'Complaint categories, urgency, department routing, and confidence scoring from raw customer text.',
    icon: BrainCircuit,
  },
  {
    title: 'Executive Visibility',
    text: 'Live operational dashboards surface SLA risk, sentiment pressure, and source-level complaint volume.',
    icon: Gauge,
  },
  {
    title: 'Secure Workspace',
    text: 'Admin-side workflows are designed for regulated teams handling sensitive customer issues.',
    icon: LockKeyhole,
  },
];

const trust = [
  { value: 1245, label: 'Complaints analyzed', suffix: '' },
  { value: 978, label: 'Resolved cases', suffix: '' },
  { value: 18, label: 'Urgent escalations', suffix: '' },
  { value: 94.2, label: 'AI confidence', suffix: '%', decimals: 1 },
];

const previewRows = [
  ['ATM Issue', 'High', '94%'],
  ['App Login', 'Critical', '96%'],
  ['Refund Delay', 'Medium', '89%'],
];

export default function LandingPage() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="overflow-hidden pt-20">
      <section className="relative isolate flex min-h-[780px] items-center overflow-hidden lg:min-h-[88vh]">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-34 grayscale" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_68%_32%,rgba(185,28,28,0.35),transparent_36%),linear-gradient(110deg,rgba(0,0,0,0.94),rgba(10,10,14,0.76)_48%,rgba(69,10,10,0.7))]"
          animate={reduceMotion ? undefined : { backgroundPosition: ['0% 0%', '8% 4%', '0% 0%'] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:74px_74px] opacity-25" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_520px] lg:px-8">
          <div className="max-w-4xl">
            <MotionDiv
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-crimson-600/30 bg-crimson-600/10 px-4 py-2 text-sm font-semibold text-crimson-200"
            >
              <Sparkles className="h-4 w-4" />
              Enterprise complaint intelligence
            </MotionDiv>
            <MotionDiv
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.58, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-display text-5xl font-black text-white sm:text-6xl lg:text-7xl">AI Complaint Analyzer</h1>
            </MotionDiv>
            <MotionDiv
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.52, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                A premium AI-powered platform for banks, telecom teams, insurers, and enterprise support leaders who need to classify, route, and resolve complaints with confidence.
              </p>
            </MotionDiv>
            <MotionDiv
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Button as={Link} to="/admin/login" size="lg" icon={Zap}>
                Enter Admin
              </Button>
              <Button as={Link} to="/submit" size="lg" variant="secondary" icon={ArrowRight}>
                Submit Complaint
              </Button>
            </MotionDiv>
          </div>

          <MotionDiv
            initial={reduceMotion ? false : { opacity: 0, x: 46, scale: 0.97 }}
            animate={reduceMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.66, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block"
          >
            <div className="rounded-lg border border-white/10 bg-zinc-950/70 p-5 shadow-panel backdrop-blur-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="label-caps text-crimson-400">Live Admin Preview</p>
                  <p className="mt-1 font-display text-xl font-bold text-white">Complaint Operations</p>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-crimson-600/15 text-crimson-200">
                  <BrainCircuit className="h-6 w-6" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {trust.slice(0, 3).map((item, index) => (
                  <div key={item.label} className="rounded-lg border border-white/10 bg-black/25 p-4">
                    <p className="font-display text-2xl font-black text-white">
                      <AnimatedCounter value={item.value} decimals={item.decimals ?? 0} suffix={item.suffix} />
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{item.label}</p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-800">
                      <motion.div
                        className="h-full bg-crimson-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${72 + index * 8}%` }}
                        transition={{ duration: 0.9, delay: 0.9 + index * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
                {previewRows.map((row, index) => (
                  <motion.div
                    key={row[0]}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.34, delay: 1.05 + index * 0.08 }}
                    className="grid grid-cols-[1fr_90px_70px] gap-3 border-b border-white/5 bg-black/25 px-4 py-3 text-sm last:border-0"
                  >
                    <span className="text-zinc-300">{row[0]}</span>
                    <span className="text-crimson-200">{row[1]}</span>
                    <span className="text-zinc-400">{row[2]}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-4 lg:px-8">
        {trust.map((item, index) => (
          <Reveal key={item.label} delay={index * 0.08}>
            <Card className="bg-black/35">
              <CardBody>
                <p className="font-display text-3xl font-black text-white">
                  <AnimatedCounter value={item.value} decimals={item.decimals ?? 0} suffix={item.suffix} />
                </p>
                <p className="label-caps mt-2 text-zinc-500">{item.label}</p>
              </CardBody>
            </Card>
          </Reveal>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label-caps text-crimson-500">Autonomous Intelligence Stack</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white">Built for serious complaint operations</h2>
          </div>
          <p className="max-w-xl text-zinc-400">
            Purposeful automation, clear admin workflows, and motion that helps the interface feel responsive without getting in the way.
          </p>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.1}>
              <Card className="group overflow-hidden bg-panel/90">
                <CardBody>
                  <feature.icon className="mb-8 h-8 w-8 text-crimson-500 transition duration-300 group-hover:-translate-y-1 group-hover:text-crimson-300" />
                  <h3 className="font-display text-xl font-bold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{feature.text}</p>
                </CardBody>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-lg border border-crimson-600/20 bg-black/40 p-8 shadow-crimson md:p-12">
            <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <p className="label-caps text-crimson-400">Ready for the admin cockpit?</p>
                <h2 className="mt-3 font-display text-3xl font-bold text-white">Launch a premium complaint command center in minutes.</h2>
                <p className="mt-4 text-zinc-400">Use mock data now, then replace the data source with backend APIs and trained model responses later.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                <Button as={Link} to="/onboarding" size="lg" icon={RadioTower}>
                  Start Onboarding
                </Button>
                <Button as={Link} to="/track" size="lg" variant="secondary" icon={ShieldCheck}>
                  Track Complaint
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
