import { motion } from 'framer-motion';
import { BrainCircuit, ClipboardPaste, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card, { CardBody, CardHeader } from '../components/Card';
import { Textarea } from '../components/Input';
import { aiExampleComplaints, aiModelCards } from '../data/aiLab';
import { apiFetch } from '../lib/api';
import { useToast } from '../state/toast';

const MotionDiv = motion.div;

export default function AILab() {
  const toast = useToast();
  const [complaint, setComplaint] = useState(aiExampleComplaints[0]);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [runId, setRunId] = useState(0);

  const characterSignal = useMemo(() => {
    const length = complaint.trim().length;
    if (length > 120) return { label: 'Strong context', value: 92 };
    if (length > 50) return { label: 'Usable context', value: 74 };
    return { label: 'Short demo input', value: 48 };
  }, [complaint]);

  const analyze = async () => {
    if (complaint.trim().length < 6) {
      toast.error('More text needed', 'Enter a complaint sentence before analyzing.', { durationMs: 3000 });
      return;
    }
    setAnalyzing(true);
    try {
      const next = await apiFetch('/predict', {
        method: 'POST',
        body: { complaint_text: complaint },
      });
      setResult({ ...next, summary: next.explanation });
      setRunId((value) => value + 1);
      toast.success('AI response ready', `${next.category} detected with ${next.confidence}% confidence.`, { durationMs: 3000 });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-crimson-500">AI Operations Flow</p>
          <h1 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">Single Complaint Intelligence</h1>
          <p className="mt-2 max-w-3xl text-zinc-400">
            Type one complaint and run the backend AI classifier with the same response shape used by bulk uploads and queue automation.
          </p>
        </div>
        <Button icon={Sparkles} onClick={analyze} loading={analyzing} disabled={analyzing}>
          {analyzing ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader title="Complaint Input" eyebrow="Raw text" />
          <CardBody className="space-y-5">
            <Textarea
              rows={9}
              value={complaint}
              onChange={(event) => setComplaint(event.target.value)}
              placeholder="Example: ATM deducted money but no cash received."
              className="text-base leading-7"
            />
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="w-full md:max-w-xs">
                <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                  <span>{characterSignal.label}</span>
                  <span>{characterSignal.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
                  <div className="h-full bg-crimson-600" style={{ width: `${characterSignal.value}%` }} />
                </div>
              </div>
              <Button icon={BrainCircuit} onClick={analyze} loading={analyzing} disabled={analyzing}>
                {analyzing ? 'Analyzing...' : 'Run AI'}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="overflow-hidden bg-gradient-to-br from-panel/95 via-zinc-950 to-crimson-950/35">
          <CardHeader title="AI Response" eyebrow="Model output" />
          <CardBody>
            {analyzing ? (
              <div className="grid min-h-80 place-items-center text-center">
                <div>
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-crimson-400" />
                  <p className="mt-4 font-display text-xl font-bold text-white">Classifying complaint</p>
                  <p className="mt-2 text-sm text-zinc-500">Running inference and department routing.</p>
                </div>
              </div>
            ) : result ? (
              <MotionDiv key={runId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: 0.02 }}
                    className="rounded-lg border border-white/10 bg-black/25 p-4"
                  >
                    <p className="label-caps text-zinc-500">Category</p>
                    <p className="mt-2 font-display text-2xl font-black text-white">{result.category}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: 0.1 }}
                    className="rounded-lg border border-white/10 bg-black/25 p-4"
                  >
                    <p className="label-caps text-zinc-500">Department</p>
                    <p className="mt-2 text-sm font-semibold text-white">{result.department}</p>
                  </motion.div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: 0.18 }}
                    className="rounded-lg border border-white/10 bg-black/25 p-4"
                  >
                    <p className="label-caps text-zinc-500">Sentiment</p>
                    <div className="mt-2"><Badge>{result.sentiment}</Badge></div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: 0.26 }}
                    className="rounded-lg border border-white/10 bg-black/25 p-4"
                  >
                    <p className="label-caps text-zinc-500">Priority</p>
                    <div className="mt-2"><Badge>{result.priority}</Badge></div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: 0.34 }}
                    className="rounded-lg border border-white/10 bg-black/25 p-4"
                  >
                    <p className="label-caps text-zinc-500">Confidence</p>
                    <p className="mt-1 font-display text-2xl font-black text-white">{result.confidence}%</p>
                  </motion.div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-crimson-900 via-crimson-600 to-red-300"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.confidence}%` }}
                    transition={{ duration: 0.72, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <div className="rounded-lg border border-crimson-600/25 bg-crimson-600/10 p-4">
                  <p className="label-caps text-crimson-300">AI explanation</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{result.summary}</p>
                </div>
              </MotionDiv>
            ) : (
              <div className="grid min-h-80 place-items-center rounded-lg border border-white/10 bg-black/20 p-8 text-center">
                <div>
                  <BrainCircuit className="mx-auto h-10 w-10 text-crimson-400" />
                  <p className="mt-4 font-display text-xl font-bold text-white">Ready for inference</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">Run the classifier to generate category, sentiment, priority, routing, and explanation.</p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader title="Complaint Examples" eyebrow="One-click model checks" />
          <CardBody>
            <div className="grid gap-3 md:grid-cols-2">
              {aiExampleComplaints.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setComplaint(example);
                  }}
                  className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/25 p-4 text-left transition hover:border-crimson-600/40 hover:bg-crimson-600/10"
                >
                  <ClipboardPaste className="mt-1 h-4 w-4 shrink-0 text-crimson-400" />
                  <span className="text-sm leading-6 text-zinc-300">{example}</span>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Model Suite" eyebrow="Backend ready" />
          <CardBody className="space-y-4">
            {aiModelCards.map((model) => (
              <div key={model.name} className="flex items-center justify-between gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-crimson-600/10 text-crimson-300">
                    <Wand2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{model.name}</p>
                    <p className="text-xs text-zinc-500">{model.version}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-black text-white">{model.metric}</p>
                  <p className="text-xs text-zinc-500">{model.label}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
