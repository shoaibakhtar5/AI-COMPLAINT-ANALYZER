import { Activity, Bot, Cpu, Rocket, TestTube2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Card, { CardBody, CardHeader } from '../components/Card';
import Modal from '../components/Modal';
import { useToast } from '../state/toast';

const models = [
  { name: 'Sentiment Matrix', version: 'v4.0.8', accuracy: '98.4%', status: 'Stable' },
  { name: 'Urgency Classifier', version: 'v2.9.1', accuracy: '96.8%', status: 'Training' },
  { name: 'Resolution Recommender', version: 'v3.3.5', accuracy: '94.2%', status: 'Stable' },
];

export default function AILab() {
  const toast = useToast();
  const [testOpen, setTestOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const runTest = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 1300));
    setBusy(false);
    setTestOpen(false);
    toast.success('Test completed', 'Model suite passed with 98.1% confidence.', { durationMs: 3200 });
  };

  const deploy = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 1500));
    setBusy(false);
    setDeployOpen(false);
    toast.success('Deployment successful', 'CrimsonAnalyzer promoted to production (demo).', { durationMs: 3200 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-crimson-500">Research Environment</p>
          <h1 className="mt-2 font-display text-4xl font-black text-white">AI Lab // v4.0.8</h1>
          <p className="mt-2 text-zinc-400">Inspect model performance, training status, and deployment controls.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon={TestTube2} onClick={() => setTestOpen(true)}>
            Launch Test
          </Button>
          <Button icon={Rocket} onClick={() => setDeployOpen(true)}>
            Deploy Model
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader title="Protocol Implementation" eyebrow="Current model script" />
          <CardBody>
            <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/60 p-5 text-sm leading-7 text-zinc-300">
{`model CrimsonAnalyzer {
  input: customer_complaint.text
  classify: category, urgency, sentiment
  guardrail: privacy_exposure >= 0.72
  route: highest_risk_department
  explain: confidence_markers
}`}
            </pre>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Active Fleet Status" eyebrow="Neural systems" />
          <CardBody className="space-y-4">
            <div className="rounded-lg bg-black/25 p-4">
              <p className="label-caps text-zinc-500">Model Accuracy</p>
              <p className="mt-2 font-display text-4xl font-black text-white">98.4%</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full w-[98%] bg-crimson-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-black/25 p-4">
                <Activity className="mb-3 h-5 w-5 text-crimson-500" />
                <p className="text-sm text-zinc-400">Latency</p>
                <p className="font-display text-xl font-bold text-white">84ms</p>
              </div>
              <div className="rounded-lg bg-black/25 p-4">
                <Cpu className="mb-3 h-5 w-5 text-crimson-500" />
                <p className="text-sm text-zinc-400">Load</p>
                <p className="font-display text-xl font-bold text-white">72%</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {models.map((model) => (
          <Card key={model.name}>
            <CardBody>
              <Bot className="mb-6 h-8 w-8 text-crimson-500" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">{model.name}</h2>
                  <p className="mt-1 text-sm text-zinc-500">{model.version}</p>
                </div>
                <Badge tone={model.status === 'Stable' ? 'Resolved' : 'Investigating'}>{model.status}</Badge>
              </div>
              <p className="mt-6 label-caps text-zinc-500">Accuracy</p>
              <p className="mt-2 font-display text-3xl font-black text-white">{model.accuracy}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal
        open={testOpen}
        title="Launch model test"
        onClose={() => (busy ? null : setTestOpen(false))}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setTestOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={runTest} loading={busy} disabled={busy}>
              {busy ? 'Running…' : 'Run tests'}
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-6 text-zinc-300">
          Runs the demo test suite (sentiment, urgency, and recommender checks) with simulated compute time.
        </p>
      </Modal>

      <Modal
        open={deployOpen}
        title="Deploy model"
        onClose={() => (busy ? null : setDeployOpen(false))}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeployOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={deploy} loading={busy} disabled={busy}>
              {busy ? 'Deploying…' : 'Deploy'}
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-6 text-zinc-300">
          Promotes the current model build into production for this demo workspace. Deployment includes safety checks and rollback hooks.
        </p>
      </Modal>
    </div>
  );
}
