import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Database,
  Gauge,
  Layers3,
  LockKeyhole,
  MessageSquare,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import AnimatedCounter from '../components/AnimatedCounter';
import Button from '../components/Button';
import DarkVeil from '../components/DarkVeil';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal';
import { brand } from '../data/brand';

const MotionDiv = motion.div;

const heroMetrics = [
  { label: 'Complaints analyzed', value: 1245 },
  { label: 'Avg. confidence', value: 94.2, suffix: '%', decimals: 1 },
  { label: 'Urgent cases routed', value: 218 },
  { label: 'Resolution lift', value: 37, suffix: '%' },
];

const featureCards = [
  {
    title: 'AI Classification Engine',
    text: 'Automatically detects complaint category, urgency, sentiment, and the best operational route.',
    icon: BrainCircuit,
  },
  {
    title: 'Real-Time Monitoring',
    text: 'Track volume spikes, SLA pressure, and risk patterns before they become executive escalations.',
    icon: RadioTower,
  },
  {
    title: 'Secure Workspace',
    text: 'A clean company workspace flow with secret-key access and admin-ready authentication patterns.',
    icon: LockKeyhole,
  },
  {
    title: 'Enterprise Analytics',
    text: 'Understand complaint trends with crisp summaries, confidence scoring, and leadership dashboards.',
    icon: BarChart3,
  },
  {
    title: 'Priority Routing',
    text: 'Critical issues move to the right team with context, metadata, and recommended next steps.',
    icon: Workflow,
  },
  {
    title: 'Operational Memory',
    text: 'Keep notes, status changes, sources, and customer history aligned in one calm admin surface.',
    icon: Database,
  },
];

const workflowSteps = [
  { title: 'Customer Complaint', text: 'Raw text, source, and customer metadata enter the workspace.', icon: MessageSquare },
  { title: 'AI Classification', text: 'The model tags category, department, and confidence.', icon: BrainCircuit },
  { title: 'Sentiment Detection', text: 'Tone, urgency, and escalation risk are scored instantly.', icon: Activity },
  { title: 'Priority Routing', text: 'Cases are routed to the right queue with clear priority.', icon: Zap },
  { title: 'Analytics Dashboard', text: 'Leaders get live trends, heatmaps, and resolution signals.', icon: Gauge },
];

const analyticsCards = [
  { label: 'Complaint Trends', value: 68, suffix: '%', text: 'Volume stabilized after AI-assisted routing.', icon: BarChart3 },
  { label: 'AI Confidence', value: 94.2, suffix: '%', decimals: 1, text: 'High-confidence classification across active queues.', icon: BrainCircuit },
  { label: 'Urgency Heatmap', value: 18, text: 'Critical cases detected across digital channels.', icon: Activity },
  { label: 'Resolution Metrics', value: 42, suffix: 'm', text: 'Median time saved on first triage response.', icon: Clock3 },
];

const trustCards = [
  { title: 'Secure Infrastructure', text: 'Workspace access, admin roles, and secret-key login patterns are designed for business teams.', icon: ShieldCheck },
  { title: 'AI Classification Engine', text: 'Complaint text becomes structured intelligence without burying staff in manual tagging.', icon: Layers3 },
  { title: 'Enterprise Analytics', text: 'Executives see trends, categories, sources, departments, and SLA pressure at a glance.', icon: BarChart3 },
  { title: 'Real-Time Monitoring', text: 'Operations teams react quickly as high-priority cases and surges appear.', icon: RadioTower },
];

const previewRows = [
  { caseId: 'CMP-93482', customer: 'Shoaib', complaint: 'ATM deducted money but no cash was dispensed...', priority: 'Medium', status: 'Pending' },
  { caseId: 'CMP-10482', customer: 'Ayesha Khan', complaint: 'Mobile app login failing before payment approval...', priority: 'High', status: 'Escalated' },
  { caseId: 'CMP-1070', customer: 'Hina Qureshi', complaint: 'Unauthorized transaction reported on account...', priority: 'Critical', status: 'In Progress' },
];

const heatmap = [
  ['bg-crimson-900/30', 'bg-crimson-800/40', 'bg-crimson-700/60', 'bg-crimson-500/80'],
  ['bg-crimson-950/30', 'bg-crimson-900/35', 'bg-crimson-700/50', 'bg-crimson-600/70'],
  ['bg-zinc-800/70', 'bg-crimson-900/35', 'bg-crimson-800/55', 'bg-crimson-700/65'],
];

function MetricPill({ metric, index }) {
  return (
    <Reveal delay={index * 0.06}>
      <div className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 backdrop-blur">
        <p className="font-display text-2xl font-black text-white">
          <AnimatedCounter value={metric.value} decimals={metric.decimals ?? 0} suffix={metric.suffix ?? ''} />
        </p>
        <p className="mt-1 text-xs text-zinc-500">{metric.label}</p>
      </div>
    </Reveal>
  );
}

function SectionHeading({ eyebrow, title, text, center = false }) {
  return (
    <Reveal className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="label-caps text-crimson-400">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-black text-white sm:text-4xl">{title}</h2>
      {text ? <p className="mt-4 text-base leading-7 text-zinc-400">{text}</p> : null}
    </Reveal>
  );
}

function ProductPreview({ reduceMotion }) {
  return (
    <MotionDiv
      initial={reduceMotion ? false : { opacity: 0, y: 34, scale: 0.98 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.68, ease: [0.22, 1, 0.36, 1] }}
      className="relative isolate mx-auto mt-14 w-full max-w-6xl"
    >
      <div className="pointer-events-none absolute -inset-x-10 -inset-y-12 -z-10 bg-[radial-gradient(ellipse_at_50%_42%,rgba(220,38,38,0.24),rgba(127,29,29,0.18)_34%,rgba(20,18,24,0)_72%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-4 -bottom-16 -z-10 h-40 bg-[linear-gradient(180deg,rgba(185,28,28,0.22),rgba(20,18,24,0))] blur-2xl" />
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-zinc-950/78 shadow-panel backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson-500/60 to-transparent" />
        <div className="flex flex-col gap-4 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="label-caps text-crimson-400">Live Intelligence Console</p>
            <h3 className="mt-1 font-display text-lg font-black text-white">Complaint Operations Overview</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-crimson-500 shadow-[0_0_18px_rgba(239,68,68,0.85)]" />
            <span className="text-xs font-semibold text-zinc-400">Streaming insights</span>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="min-w-0 border-b border-white/10 lg:border-b-0 lg:border-r">
            <div className="overflow-x-auto premium-table-scrollbar">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[92px_1fr_1.4fr_90px_110px] border-b border-white/10 bg-black/35 px-4 py-3 text-[0.68rem] font-bold uppercase text-zinc-500 sm:px-5">
                  <span>Case</span>
                  <span>Customer</span>
                  <span>Complaint</span>
                  <span>Priority</span>
                  <span>Status</span>
                </div>
                {previewRows.map((row, index) => (
                  <motion.div
                    key={row.caseId}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.34, delay: 0.9 + index * 0.09 }}
                    className="grid grid-cols-[92px_1fr_1.4fr_90px_110px] items-center gap-3 border-b border-white/10 px-4 py-4 text-sm last:border-b-0 sm:px-5"
                  >
                    <span className="truncate font-semibold text-zinc-300">{row.caseId}</span>
                    <span className="truncate text-zinc-300">{row.customer}</span>
                    <span className="truncate text-zinc-400">{row.complaint}</span>
                    <span
                      className={`w-fit rounded-full border px-2.5 py-1 text-xs font-bold ${
                        row.priority === 'Critical'
                          ? 'border-crimson-400/50 bg-crimson-500/15 text-crimson-100'
                          : row.priority === 'High'
                            ? 'border-red-400/45 bg-red-500/10 text-red-200'
                            : 'border-yellow-400/35 bg-yellow-500/10 text-yellow-200'
                      }`}
                    >
                      {row.priority}
                    </span>
                    <span className="w-fit rounded-full border border-sky-400/35 bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-100">
                      {row.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-4 sm:p-5">
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center justify-between">
                <p className="label-caps text-zinc-500">AI Confidence</p>
                <BrainCircuit className="h-4 w-4 text-crimson-400" />
              </div>
              <p className="mt-3 font-display text-3xl font-black text-white">
                <AnimatedCounter value={94.2} decimals={1} suffix="%" />
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  className="h-full rounded-full bg-crimson-600"
                  initial={reduceMotion ? false : { width: '0%' }}
                  animate={reduceMotion ? undefined : { width: '94%' }}
                  transition={{ duration: 0.9, delay: 1.05, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <p className="label-caps text-zinc-500">Urgency Heatmap</p>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {heatmap.flatMap((row, rowIndex) =>
                  row.map((cell, cellIndex) => (
                    <motion.span
                      key={`${rowIndex}-${cellIndex}`}
                      initial={reduceMotion ? false : { opacity: 0.2, scale: 0.94 }}
                      animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                      transition={{ duration: 0.34, delay: 1.1 + (rowIndex + cellIndex) * 0.04 }}
                      className={`h-10 rounded-md border border-white/10 ${cell}`}
                    />
                  )),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
}

export default function LandingPage() {
  const reduceMotion = useReducedMotion();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return undefined;

    const targetId = decodeURIComponent(location.hash.slice(1));
    const timer = window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({
        block: 'start',
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [location.hash, reduceMotion]);

  return (
    <main className="overflow-hidden pt-20">
      <section id="platform" className="relative isolate min-h-[calc(100vh-5rem)] scroll-mt-24 overflow-hidden">
        <div className="darkveil-layer opacity-100">
          <DarkVeil
            hueShift={-10}
            noiseIntensity={0.04}
            scanlineIntensity={0.05}
            speed={0.36}
            scanlineFrequency={1.05}
            warpAmount={0.28}
            resolutionScale={0.82}
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(127,29,29,0.12),transparent_48%,rgba(0,0,0,0.04)_78%),linear-gradient(180deg,rgba(9,9,11,0.18),rgba(9,9,11,0.54)_62%,rgba(9,9,11,0.88))]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.052)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.038)_1px,transparent_1px)] bg-[size:72px_72px] opacity-16" />
        <motion.div
          aria-hidden="true"
          className="absolute left-0 right-0 top-20 h-44 origin-left -skew-y-6 bg-gradient-to-r from-crimson-950/0 via-crimson-500/16 to-crimson-950/0 blur-3xl"
          animate={reduceMotion ? undefined : { x: ['-8%', '8%', '-8%'], opacity: [0.24, 0.42, 0.24] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30rem] bg-[linear-gradient(180deg,transparent_0%,rgba(56,10,15,0.16)_36%,rgba(20,18,24,0.58)_70%,#141218_100%)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <MotionDiv
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-crimson-500/30 bg-crimson-700/10 px-4 py-2 text-xs font-bold text-crimson-100 shadow-crimson backdrop-blur"
            >
              <Sparkles className="h-4 w-4" />
              {brand.shortName} intelligence cloud
            </MotionDiv>

            <MotionDiv
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.58, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="mt-6 font-display text-4xl font-black text-white sm:text-5xl lg:text-6xl">
                AI-Powered Complaint Intelligence for Modern Enterprises
              </h1>
            </MotionDiv>

            <MotionDiv
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.52, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
                {brand.name} turns scattered customer complaints into structured intelligence: classification, sentiment, priority routing, and executive analytics in one premium workspace.
              </p>
            </MotionDiv>

            <MotionDiv
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"
            >
              <Button as={Link} to="/admin/dashboard" size="lg" icon={Zap}>
                Launch Platform
              </Button>
              <Button as={Link} to="/#analytics" size="lg" variant="secondary" icon={ArrowRight}>
                View Analytics
              </Button>
            </MotionDiv>
          </div>

          <ProductPreview reduceMotion={reduceMotion} />
        </div>
      </section>

      <section className="relative -mt-28 isolate overflow-hidden px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 -top-28 h-56 bg-[linear-gradient(180deg,transparent_0%,rgba(64,13,17,0.22)_42%,rgba(20,18,24,0.72)_78%,rgba(20,18,24,0.96)_100%)] blur-sm" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(55,10,15,0.18)_26%,rgba(20,18,24,0.9)_64%,rgba(20,18,24,0.98)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,transparent_0%,rgba(185,28,28,0.08)_42%,transparent_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {heroMetrics.map((metric, index) => (
            <MetricPill key={metric.label} metric={metric} index={index} />
          ))}
        </div>
      </section>

      <section id="features" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Platform Features"
          title="A cleaner operating system for complaint teams"
          text="Designed for enterprise workflows where speed, clarity, and trust matter more than noise."
        />
        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.06}>
              <motion.article
                whileHover={reduceMotion ? undefined : { y: -5, scale: 1.01 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="h-full rounded-lg border border-white/10 bg-panel/85 p-5 shadow-panel backdrop-blur transition hover:border-crimson-500/35 hover:shadow-crimson"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg border border-crimson-500/25 bg-crimson-700/12 text-crimson-200">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-display text-lg font-black text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{feature.text}</p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/20 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            center
            eyebrow="AI Workflow"
            title="From complaint text to operational action"
            text="A simple, visible flow that helps teams understand what the AI is doing and where each case should go next."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {workflowSteps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.08}>
                <div className="relative h-full rounded-lg border border-white/10 bg-zinc-950/70 p-5 backdrop-blur">
                  {index < workflowSteps.length - 1 ? (
                    <div className="absolute left-[calc(100%-0.25rem)] top-9 hidden h-px w-6 bg-gradient-to-r from-crimson-500/70 to-transparent lg:block" />
                  ) : null}
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-crimson-700/18 text-crimson-100">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 font-display text-base font-black text-white">{step.title}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="analytics" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <SectionHeading
            eyebrow="Analytics Preview"
            title="Executive clarity without dashboard clutter"
            text="Analytics previews show how the platform exposes trends, confidence, urgency, and resolution momentum."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {analyticsCards.map((card, index) => (
              <Reveal key={card.label} delay={index * 0.08}>
                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  className="rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-panel transition hover:border-crimson-500/30 hover:bg-white/[0.055]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="label-caps text-zinc-500">{card.label}</p>
                      <p className="mt-3 font-display text-3xl font-black text-white">
                        <AnimatedCounter value={card.value} decimals={card.decimals ?? 0} suffix={card.suffix ?? ''} />
                      </p>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-lg border border-crimson-500/25 bg-crimson-700/12 text-crimson-200">
                      <card.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-zinc-400">{card.text}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          center
          eyebrow="Enterprise Trust"
          title="Built to feel secure, intelligent, and understandable"
          text="The interface keeps the business language clear so admins, managers, and reviewers can understand the workflow immediately."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {trustCards.map((card, index) => (
            <Reveal key={card.title} delay={index * 0.07}>
              <article className="h-full rounded-lg border border-white/10 bg-zinc-950/65 p-5">
                <card.icon className="h-6 w-6 text-crimson-400" />
                <h3 className="mt-5 font-display text-base font-black text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{card.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-lg border border-crimson-500/25 bg-zinc-950/85 p-7 shadow-crimson sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(185,28,28,0.18),transparent_42%,rgba(255,255,255,0.035))]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="label-caps text-crimson-300">Deploy the workspace</p>
                <h2 className="mt-3 font-display text-3xl font-black text-white sm:text-4xl">Transform Complaint Operations with AI</h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                  Give your company a premium complaint intelligence layer that looks focused, feels fast, and explains itself clearly.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button as={Link} to="/signup" size="lg" icon={Users}>
                  Request Access
                </Button>
                <Button as={Link} to="/admin/dashboard" size="lg" variant="secondary" icon={CheckCircle2}>
                  Launch Platform
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
