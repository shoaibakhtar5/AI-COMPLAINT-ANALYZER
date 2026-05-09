import { motion } from 'framer-motion';
import { Activity, BarChart3, CheckCircle2, Clock3, Download, FileSearch, FileSpreadsheet, Layers3, Play, ScanLine, UploadCloud } from 'lucide-react';
import { createElement, useRef, useState } from 'react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card, { CardBody, CardHeader } from '../components/Card';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { buildUploadPreview, mockAnalyzedRows, uploadHistory, uploadProcessingSteps, uploadTemplateColumns } from '../data/uploads';
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
  {
    key: 'file',
    label: 'File',
    render: (row) => (
      <span className="inline-flex min-w-0 items-center gap-2">
        <FileSpreadsheet className="h-4 w-4 shrink-0 text-crimson-300" />
        <span className="truncate">{row.file}</span>
      </span>
    ),
  },
  { key: 'rows', label: 'Rows' },
  { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'uploadedAt', label: 'Uploaded' },
];

const previewColumns = [
  { key: 'id', label: 'Preview ID' },
  { key: 'complaint_text', label: 'Complaint Preview', wrap: true },
  { key: 'predicted_category', label: 'Category' },
  { key: 'sentiment', label: 'Sentiment', render: (row) => <Badge>{row.sentiment}</Badge> },
  { key: 'priority', label: 'Priority', render: (row) => <Badge>{row.priority}</Badge> },
];

function DistributionMeter({ item, total, tone = 'crimson' }) {
  const width = Math.max(7, Math.round((item.value / Math.max(total, 1)) * 100));
  const color = tone === 'neutral' ? 'bg-zinc-500' : item.label === 'Critical' || item.label === 'High' || item.label === 'Negative' ? 'bg-crimson-600' : item.label === 'Frustrated' || item.label === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="truncate font-semibold text-zinc-200">{item.label}</span>
        <span className="font-display text-sm font-bold text-white">{item.value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function AnalysisMetric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-4">
      <div className="flex items-center gap-2 text-zinc-500">
        {createElement(Icon, { className: 'h-4 w-4' })}
        <p className="label-caps">{label}</p>
      </div>
      <p className="mt-2 font-display text-2xl font-black text-white">{value}</p>
    </div>
  );
}

export default function BulkUpload() {
  const toast = useToast();
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [activeStep, setActiveStep] = useState(null);
  const [progress, setProgress] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const pickFile = () => inputRef.current?.click();

  const openUpload = async (upload) => {
    setSelectedUpload(upload);
    setLoadingAnalysis(true);
    await new Promise((resolve) => setTimeout(resolve, 620));
    setLoadingAnalysis(false);
    toast.info('Batch analysis opened', `${upload.file} is ready for review.`, { durationMs: 2400 });
  };

  const runSimulation = async () => {
    if (!fileName) {
      toast.error('Upload required', 'Select a CSV or XLSX file before processing.', { durationMs: 3200 });
      return;
    }
    setProcessing(true);
    setResults([]);
    setProcessedRows(0);
    for (const step of uploadProcessingSteps) {
      setActiveStep(step.id);
      setProgress(step.progress);
      setProcessedRows(Math.round((step.progress / 100) * 1240));
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
                setProcessedRows(0);
                setActiveStep(null);
                toast.success('File selected', `${file.name} is ready for mock analysis.`, { durationMs: 2600 });
              }}
            />
            <motion.button
              type="button"
              onClick={pickFile}
              animate={fileName && !processing ? { boxShadow: ['0 0 0 rgba(220,38,38,0)', '0 0 34px rgba(220,38,38,0.18)', '0 0 0 rgba(220,38,38,0)'] } : undefined}
              transition={{ duration: 1.8, repeat: fileName && !processing ? Infinity : 0, ease: 'easeInOut' }}
              className="group flex min-h-64 w-full flex-col items-center justify-center rounded-lg border border-dashed border-crimson-600/35 bg-crimson-600/5 p-8 text-center transition hover:border-crimson-500/70 hover:bg-crimson-600/10"
            >
              <span className="grid h-16 w-16 place-items-center rounded-lg border border-crimson-600/30 bg-black/35 shadow-crimson">
                <UploadCloud className="h-8 w-8 text-crimson-300 transition group-hover:scale-110" />
              </span>
              <span className="mt-5 font-display text-xl font-bold text-white">{fileName || 'Drop or select enterprise complaint file'}</span>
              <span className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Expected columns: {uploadTemplateColumns.join(', ')}.
              </span>
            </motion.button>

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
              <p className="mt-3 text-sm text-zinc-500">
                Processed rows: <span className="font-semibold text-white">{processedRows.toLocaleString()}</span>
              </p>
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
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4"
              >
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 18 }}
                  className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/15 text-emerald-200"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </motion.span>
                <div>
                  <p className="font-semibold text-white">Batch analysis complete</p>
                  <p className="text-sm text-zinc-400">Mock AI returned category, sentiment, priority, and department routing.</p>
                </div>
              </motion.div>
              <Table columns={resultColumns} rows={results} />
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 bg-black/25 p-8 text-center">
              <p className="font-display text-xl font-bold text-white">No batch results yet</p>
              <p className="mt-2 text-sm text-zinc-500">Select a file and run AI analysis to populate this enterprise review table.</p>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Recent Uploads"
          eyebrow="Audit history"
          action={<span className="text-xs font-semibold text-zinc-500">Click a batch to inspect AI analysis</span>}
        />
        <CardBody>
          <Table columns={historyColumns} rows={uploadHistory} onRowClick={(row) => void openUpload(row)} />
        </CardBody>
      </Card>

      <Modal
        open={Boolean(selectedUpload)}
        title={selectedUpload ? selectedUpload.file : 'Upload analysis'}
        onClose={() => setSelectedUpload(null)}
        placement="right"
        className="max-w-4xl border-crimson-500/20 bg-gradient-to-br from-panel/95 via-zinc-950/95 to-crimson-950/25"
        bodyClassName="p-0"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setSelectedUpload(null)}>
              Close
            </Button>
            <Button
              variant="secondary"
              icon={Download}
              onClick={() => {
                toast.success('Report queued', 'Mock batch report is ready for API export integration.', { durationMs: 2600 });
              }}
            >
              Export Report
            </Button>
            <Button
              icon={ScanLine}
              onClick={() => {
                setLoadingAnalysis(true);
                window.setTimeout(() => {
                  setLoadingAnalysis(false);
                  toast.success('Batch rescanned', 'AI analysis refreshed using mock pipeline state.', { durationMs: 2800 });
                }, 900);
              }}
            >
              Re-scan Batch
            </Button>
          </div>
        }
      >
        {selectedUpload ? (
          <div className="space-y-5 p-5 sm:p-6">
            {loadingAnalysis ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-lg border border-crimson-500/25 bg-crimson-600/10 p-4"
              >
                <ScanLine className="h-5 w-5 animate-pulse text-crimson-200" />
                <div>
                  <p className="font-display text-sm font-bold text-white">AI scanning indicators active</p>
                  <p className="mt-1 text-xs text-zinc-400">Loading mock batch intelligence and complaint previews.</p>
                </div>
              </motion.div>
            ) : null}

            <div className="rounded-lg border border-white/10 bg-black/30 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="label-caps text-crimson-400">{selectedUpload.id}</p>
                  <h2 className="mt-2 break-words font-display text-2xl font-black text-white">{selectedUpload.file}</h2>
                  <p className="mt-2 text-sm text-zinc-400">Uploaded {selectedUpload.uploadedAtFull}</p>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Badge>{selectedUpload.status}</Badge>
                  <Badge tone="Healthy">{selectedUpload.processingStatus}</Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <AnalysisMetric label="Total Complaints" value={selectedUpload.rows.toLocaleString()} icon={FileSearch} />
              <AnalysisMetric label="AI Accuracy" value={selectedUpload.accuracy} icon={BarChart3} />
              <AnalysisMetric label="Detected Categories" value={selectedUpload.categories.length} icon={Layers3} />
              <AnalysisMetric label="Uploaded" value={selectedUpload.uploadedAt} icon={Clock3} />
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <section className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-crimson-300" />
                  <p className="label-caps text-zinc-400">Categories Detected</p>
                </div>
                <div className="space-y-4">
                  {selectedUpload.categories.map((item) => (
                    <DistributionMeter key={item.label} item={item} total={selectedUpload.rows} />
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-crimson-300" />
                  <p className="label-caps text-zinc-400">Sentiment Distribution</p>
                </div>
                <div className="space-y-4">
                  {selectedUpload.sentimentDistribution.map((item) => (
                    <DistributionMeter key={item.label} item={item} total={100} tone="neutral" />
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-crimson-300" />
                  <p className="label-caps text-zinc-400">Priority Breakdown</p>
                </div>
                <div className="space-y-4">
                  {selectedUpload.priorityBreakdown.map((item) => (
                    <DistributionMeter key={item.label} item={item} total={selectedUpload.rows} />
                  ))}
                </div>
              </section>
            </div>

            <section className="rounded-lg border border-white/10 bg-black/25 p-4">
              <div className="mb-4 flex items-center gap-2">
                <ScanLine className="h-4 w-4 text-crimson-300" />
                <p className="label-caps text-zinc-400">Processing Logs</p>
              </div>
              <div className="grid gap-3">
                {selectedUpload.logs.map((log, index) => (
                  <motion.div
                    key={log}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.24, delay: index * 0.04 }}
                    className="flex gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-3 text-sm text-zinc-300"
                  >
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-crimson-500 shadow-[0_0_18px_rgba(220,38,38,0.7)]" />
                    {log}
                  </motion.div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="label-caps text-zinc-400">Complaint Preview Table</p>
                <span className="text-xs text-zinc-500">First 5 normalized rows</span>
              </div>
              <Table
                columns={previewColumns}
                rows={buildUploadPreview(selectedUpload)}
                tableMinWidth="min-w-[780px]"
              />
            </section>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
