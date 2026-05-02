import { motion } from 'framer-motion';
import { CheckCircle2, Download, FileSpreadsheet, Play, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card, { CardBody, CardHeader } from '../components/Card';
import Table from '../components/Table';
import { mockAnalyzedRows, uploadHistory, uploadProcessingSteps, uploadTemplateColumns } from '../data/uploads';
import { useToast } from '../state/toast';

const MotionDiv = motion.div;

const resultColumns = [
  { key: 'complaint_text', label: 'Complaint Text', wrap: true },
  { key: 'predicted_category', label: 'Predicted Category' },
  { key: 'sentiment', label: 'Sentiment', render: (row) => <Badge>{row.sentiment}</Badge> },
  { key: 'priority', label: 'Priority', render: (row) => <Badge>{row.priority}</Badge> },
  { key: 'department', label: 'Department' },
  { key: 'confidence', label: 'Confidence' },
];

const historyColumns = [
  { key: 'id', label: 'Batch' },
  { key: 'file', label: 'File' },
  { key: 'rows', label: 'Rows' },
  { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'uploadedAt', label: 'Uploaded' },
];

export default function BulkUpload() {
  const toast = useToast();
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [activeStep, setActiveStep] = useState(null);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);

  const pickFile = () => inputRef.current?.click();

  const runSimulation = async () => {
    if (!fileName) {
      toast.error('Upload required', 'Select a CSV or XLSX file before processing.', { durationMs: 3200 });
      return;
    }
    setProcessing(true);
    setResults([]);
    for (const step of uploadProcessingSteps) {
      setActiveStep(step.id);
      setProgress(step.progress);
      toast.info(step.label, step.detail, { durationMs: 1400 });
      await new Promise((resolve) => setTimeout(resolve, 850));
    }
    setResults(mockAnalyzedRows);
    setProcessing(false);
    toast.success('AI analysis complete', `${mockAnalyzedRows.length} complaints classified from the mock batch.`, { durationMs: 3200 });
  };

  const exportResults = () => {
    const payload = JSON.stringify(results, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export ready', 'Bulk analysis results downloaded as JSON.', { durationMs: 2600 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-crimson-500">Bulk Intake</p>
          <h1 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">Bulk Upload</h1>
          <p className="mt-2 max-w-3xl text-zinc-400">
            Upload CSV or XLSX complaint files and simulate the complete AI classification pipeline before backend integration.
          </p>
        </div>
        <Button icon={Download} variant="secondary" onClick={exportResults} disabled={!results.length}>
          Export Results
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="overflow-hidden">
          <CardHeader title="Upload Complaint File" eyebrow="CSV / XLSX simulation" />
          <CardBody>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setFileName(file.name);
                setResults([]);
                setProgress(0);
                setActiveStep(null);
                toast.success('File selected', `${file.name} is ready for mock analysis.`, { durationMs: 2600 });
              }}
            />
            <button
              type="button"
              onClick={pickFile}
              className="group flex min-h-64 w-full flex-col items-center justify-center rounded-lg border border-dashed border-crimson-600/35 bg-crimson-600/5 p-8 text-center transition hover:border-crimson-500/70 hover:bg-crimson-600/10"
            >
              <span className="grid h-16 w-16 place-items-center rounded-lg border border-crimson-600/30 bg-black/35 shadow-crimson">
                <UploadCloud className="h-8 w-8 text-crimson-300 transition group-hover:scale-110" />
              </span>
              <span className="mt-5 font-display text-xl font-bold text-white">{fileName || 'Drop or select enterprise complaint file'}</span>
              <span className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Expected columns: {uploadTemplateColumns.join(', ')}.
              </span>
            </button>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button className="w-full" variant="secondary" icon={FileSpreadsheet} onClick={pickFile} disabled={processing}>
                Select File
              </Button>
              <Button className="w-full" icon={Play} onClick={runSimulation} loading={processing} disabled={processing}>
                {processing ? 'Processing...' : 'Run AI Analysis'}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="AI Processing Pipeline" eyebrow="Frontend-only simulation" />
          <CardBody>
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-white">Batch progress</span>
                <span className="text-zinc-500">{progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-zinc-900">
                <motion.div
                  className="h-full bg-gradient-to-r from-crimson-900 via-crimson-600 to-red-400"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>
            </div>

            <div className="grid gap-3">
              {uploadProcessingSteps.map((step, index) => {
                const complete = progress >= step.progress;
                const active = activeStep === step.id;
                return (
                  <MotionDiv
                    key={step.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`rounded-lg border p-4 transition ${
                      active
                        ? 'border-crimson-600/40 bg-crimson-600/10 shadow-crimson'
                        : complete
                          ? 'border-emerald-500/20 bg-emerald-500/5'
                          : 'border-white/10 bg-black/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 grid h-7 w-7 place-items-center rounded-full ${complete ? 'bg-emerald-500/15 text-emerald-300' : 'bg-zinc-800 text-zinc-500'}`}>
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-white">{step.label}</p>
                        <p className="mt-1 text-sm leading-6 text-zinc-500">{step.detail}</p>
                      </div>
                    </div>
                  </MotionDiv>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Analyzed Output" eyebrow="Mock AI model response" />
        <CardBody>
          {results.length ? (
            <Table columns={resultColumns} rows={results} />
          ) : (
            <div className="rounded-lg border border-white/10 bg-black/25 p-8 text-center">
              <p className="font-display text-xl font-bold text-white">No batch results yet</p>
              <p className="mt-2 text-sm text-zinc-500">Select a file and run AI analysis to populate this enterprise review table.</p>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Recent Uploads" eyebrow="Audit history" />
        <CardBody>
          <Table columns={historyColumns} rows={uploadHistory} />
        </CardBody>
      </Card>
    </div>
  );
}
