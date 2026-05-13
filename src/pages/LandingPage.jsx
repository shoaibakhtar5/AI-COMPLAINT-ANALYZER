import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity, ArrowRight, BarChart3, BrainCircuit, CheckCircle2,
  Clock3, Database, Gauge, Layers3, LockKeyhole, MessageSquare,
  RadioTower, ShieldCheck, Sparkles, Users, Workflow, Zap,
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
  { title: 'AI Classification Engine', text: 'Automatically detects complaint category, urgency, sentiment, and the best operational route.', icon: BrainCircuit },
  { title: 'Real-Time Monitoring', text: 'Track volume spikes, SLA pressure, and risk patterns before they become executive escalations.', icon: RadioTower },
  { title: 'Secure Workspace', text: 'A clean company workspace flow with secret-key access and admin-ready authentication patterns.', icon: LockKeyhole },
  { title: 'Enterprise Analytics', text: 'Understand complaint trends with crisp summaries, confidence scoring, and leadership dashboards.', icon: BarChart3 },
  { title: 'Priority Routing', text: 'Critical issues move to the right team with context, metadata, and recommended next steps.', icon: Workflow },
  { title: 'Operational Memory', text: 'Keep notes, status changes, sources, and customer history aligned in one calm admin surface.', icon: Database },
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
  { caseId: 'CMP-93482', customer: 'Shoaib', complaint: 'Product arrived damaged and cannot be used...', priority: 'Medium', status: 'Solved' },
  { caseId: 'CMP-10482', customer: 'Ayesha Khan', complaint: 'Delivery was delayed and tracking has not updated...', priority: 'High', status: 'Solved' },
  { caseId: 'CMP-1070', customer: 'Hina Qureshi', complaint: 'Subscription was charged twice this month...', priority: 'Critical', status: 'Solved' },
];

function MetricPill({ metric, index }) {
  return (
    <Reveal delay={index * 0.06}>
      <div className="rounded-xl border border-t-border bg-t-surface/80 px-4 py-3 shadow-panel backdrop-blur">
        <p className="font-display text-2xl font-black text-t-text">
          <AnimatedCounter value={metric.value} decimals={metric.decimals ?? 0} suffix={metric.suffix ?? ''} />
        </p>
        <p className="mt-1 text-xs text-t-text-muted">{metric.label}</p>
      </div>
    </Reveal>
  );
}

function SectionHeading({ eyebrow, title, text, center = false }) {
  return (
    <Reveal className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="label-caps text-t-accent">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-black text-t-text sm:text-4xl">{title}</h2>
      {text ? <p className="mt-4 text-base leading-7 text-t-text-muted">{text}</p> : null}
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
      <div className="pointer-events-none absolute -inset-x-10 -inset-y-12 -z-10 rounded-3xl blur-3xl"
        style={{ background: 'radial-gradient(ellipse at 50% 42%, var(--t-accent-glow), transparent 72%)' }} />
      <div className="relative overflow-hidden rounded-xl border border-t-border bg-t-surface shadow-panel backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-t-accent/60 to-transparent" />
        <div className="flex flex-col gap-4 border-b border-t-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="label-caps text-t-accent">Live Intelligence Console</p>
            <h3 className="mt-1 font-display text-lg font-black text-t-text">Complaint Operations Overview</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-t-accent shadow-[0_0_12px_var(--t-accent-glow)]" />
            <span className="text-xs font-semibold text-t-text-muted">Streaming insights</span>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="min-w-0 border-b border-t-border lg:border-b-0 lg:border-r">
            <div className="overflow-x-auto premium-table-scrollbar">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[92px_1fr_1.4fr_90px_110px] border-b border-t-border bg-t-panel px-4 py-3 text-[0.68rem] font-bold uppercase text-t-text-muted sm:px-5">
                  <span>Case</span><span>Customer</span><span>Complaint</span><span>Priority</span><span>Status</span>
                </div>
                {previewRows.map((row, index) => (
                  <motion.div key={row.caseId}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.34, delay: 0.9 + index * 0.09 }}
                    className="grid grid-cols-[92px_1fr_1.4fr_90px_110px] items-center gap-3 border-b border-t-border px-4 py-4 text-sm last:border-b-0 sm:px-5"
                  >
                    <span className="truncate font-semibold text-t-text">{row.caseId}</span>
                    <span className="truncate text-t-text">{row.customer}</span>
                    <span className="truncate text-t-text-muted">{row.complaint}</span>
                    <span className={`w-fit rounded-full border px-2.5 py-1 text-xs font-bold ${
                      row.priority === 'Critical' ? 'border-t-error/50 bg-t-error-subtle text-t-error'
                        : row.priority === 'High' ? 'border-t-error/40 bg-t-error-subtle text-t-error'
                        : 'border-t-warning/35 bg-t-warning-subtle text-t-warning'
                    }`}>{row.priority}</span>
                    <span className="w-fit rounded-full border border-t-info/35 bg-t-info-subtle px-2.5 py-1 text-xs font-bold text-t-info">{row.status}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-4 sm:p-5">
            <div className="rounded-lg border border-t-border bg-t-panel p-4">
              <div className="flex items-center justify-between">
                <p className="label-caps">AI Confidence</p>
                <BrainCircuit className="h-4 w-4 text-t-accent" />
              </div>
              <p className="mt-3 font-display text-3xl font-black text-t-text">
                <AnimatedCounter value={94.2} decimals={1} suffix="%" />
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-t-panel-high">
                <motion.div className="h-full rounded-full bg-t-accent"
                  initial={reduceMotion ? false : { width: '0%' }}
                  animate={reduceMotion ? undefined : { width: '94%' }}
                  transition={{ duration: 0.9, delay: 1.05, ease: 'easeOut' }} />
              </div>
            </div>
            <div className="rounded-lg border border-t-border bg-t-panel p-4">
              <p className="label-caps">Urgency Heatmap</p>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[0.3,0.5,0.7,0.9, 0.2,0.4,0.6,0.8, 0.15,0.35,0.55,0.75].map((opacity, i) => (
                  <motion.span key={i}
                    initial={reduceMotion ? false : { opacity: 0.2, scale: 0.94 }}
                    animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                    transition={{ duration: 0.34, delay: 1.1 + i * 0.04 }}
                    className="h-10 rounded-md border border-t-border"
                    style={{ background: `color-mix(in srgb, var(--t-accent) ${Math.round(opacity * 100)}%, transparent)` }} />
                ))}
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
      document.getElementById(targetId)?.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [location.hash, reduceMotion]);

  return (
    <main className="overflow-hidden pt-20">
      {/* ── Hero ── */}
      <section id="platform" className="relative isolate min-h-[calc(100vh-5rem)] scroll-mt-24 overflow-hidden">
        <div className="darkveil-layer opacity-100">
          <DarkVeil hueShift={-10} noiseIntensity={0.04} scanlineIntensity={0.05} speed={0.36} scanlineFrequency={1.05} warpAmount={0.28} resolutionScale={0.82} />
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, var(--t-accent-subtle) 0%, transparent 60%, var(--t-bg) 100%)' }} />

        <MotionDiv aria-hidden="true"
          className="absolute left-0 right-0 top-20 h-44 origin-left -skew-y-6 blur-3xl"
          style={{ background: 'linear-gradient(90deg, transparent, var(--t-accent-subtle), transparent)' }}
          animate={reduceMotion ? undefined : { x: ['-8%', '8%', '-8%'], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <MotionDiv initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-t-accent/30 bg-t-accent-subtle px-4 py-2 text-xs font-bold text-t-accent backdrop-blur">
              <Sparkles className="h-4 w-4" />
              {brand.shortName} intelligence cloud
            </MotionDiv>

            <MotionDiv initial={reduceMotion ? false : { opacity: 0, y: 22 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.58, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}>
              <h1 className="mt-6 font-display text-4xl font-black text-t-text sm:text-5xl lg:text-6xl">
                AI-Powered Complaint Intelligence for Modern Enterprises
              </h1>
            </MotionDiv>

            <MotionDiv initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.52, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-t-text-muted sm:text-lg">
                {brand.name} turns scattered customer complaints into structured intelligence: classification, sentiment, priority routing, and executive analytics in one premium workspace.
              </p>
            </MotionDiv>

            <MotionDiv initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button as={Link} to="/admin/dashboard" size="lg" icon={Zap}>Launch Platform</Button>
              <Button as={Link} to="/#analytics" size="lg" variant="secondary" icon={ArrowRight}>View Analytics</Button>
            </MotionDiv>
          </div>
          <ProductPreview reduceMotion={reduceMotion} />
        </div>
      </section>

      {/* ── Metrics strip ── */}
      <section className="relative px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {heroMetrics.map((metric, index) => <MetricPill key={metric.label} metric={metric} index={index} />)}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Platform Features" title="A cleaner operating system for complaint teams"
          text="Designed for enterprise workflows where speed, clarity, and trust matter more than noise." />
        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.06}>
              <motion.article whileHover={reduceMotion ? undefined : { y: -5, scale: 1.01 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="h-full rounded-xl border border-t-border bg-t-surface p-5 shadow-panel backdrop-blur transition-all duration-200 hover:border-t-border-strong hover:shadow-[0_8px_32px_var(--t-shadow)]">
                <div className="grid h-10 w-10 place-items-center rounded-lg border border-t-accent/25 bg-t-accent-subtle text-t-accent">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-display text-lg font-black text-t-text">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-t-text-muted">{feature.text}</p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Workflow ── */}
      <section className="border-y border-t-border bg-t-panel/50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading center eyebrow="AI Workflow" title="From complaint text to operational action"
            text="A simple, visible flow that helps teams understand what the AI is doing and where each case should go next." />
          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {workflowSteps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.08}>
                <div className="relative h-full rounded-xl border border-t-border bg-t-surface p-5 backdrop-blur">
                  {index < workflowSteps.length - 1 ? (
                    <div className="absolute left-[calc(100%-0.25rem)] top-9 hidden h-px w-6 bg-gradient-to-r from-t-accent/70 to-transparent lg:block" />
                  ) : null}
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-t-accent-subtle text-t-accent">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 font-display text-base font-black text-t-text">{step.title}</p>
                  <p className="mt-2 text-sm leading-6 text-t-text-muted">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Analytics ── */}
      <section id="analytics" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <SectionHeading eyebrow="Analytics Preview" title="Executive clarity without dashboard clutter"
            text="Analytics previews show how the platform exposes trends, confidence, urgency, and resolution momentum." />
          <div className="grid gap-4 sm:grid-cols-2">
            {analyticsCards.map((card, index) => (
              <Reveal key={card.label} delay={index * 0.08}>
                <motion.div whileHover={reduceMotion ? undefined : { y: -4 }}
                  className="rounded-xl border border-t-border bg-t-surface p-5 shadow-panel transition-all duration-200 hover:border-t-border-strong">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="label-caps">{card.label}</p>
                      <p className="mt-3 font-display text-3xl font-black text-t-text">
                        <AnimatedCounter value={card.value} decimals={card.decimals ?? 0} suffix={card.suffix ?? ''} />
                      </p>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-lg border border-t-accent/25 bg-t-accent-subtle text-t-accent">
                      <card.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-t-text-muted">{card.text}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust ── */}
      <section id="security" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading center eyebrow="Enterprise Trust" title="Built to feel secure, intelligent, and understandable"
          text="The interface keeps the business language clear so admins, managers, and reviewers can understand the workflow immediately." />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {trustCards.map((card, index) => (
            <Reveal key={card.title} delay={index * 0.07}>
              <article className="h-full rounded-xl border border-t-border bg-t-surface p-5 shadow-panel transition-all duration-200 hover:border-t-border-strong">
                <card.icon className="h-6 w-6 text-t-accent" />
                <h3 className="mt-5 font-display text-base font-black text-t-text">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-t-text-muted">{card.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-t-accent/25 bg-t-surface p-7 shadow-[0_0_0_1px_var(--t-accent-subtle),0_24px_70px_var(--t-shadow)] sm:p-10 lg:p-12">
            <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(ellipse at 20% 50%, var(--t-accent-subtle), transparent 60%)' }} />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="label-caps text-t-accent">Deploy the workspace</p>
                <h2 className="mt-3 font-display text-3xl font-black text-t-text sm:text-4xl">Transform Complaint Operations with AI</h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-t-text-muted sm:text-base">
                  Give your company a premium complaint intelligence layer that looks focused, feels fast, and explains itself clearly.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button as={Link} to="/signup" size="lg" icon={Users}>Request Access</Button>
                <Button as={Link} to="/admin/dashboard" size="lg" variant="secondary" icon={CheckCircle2}>Launch Platform</Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
