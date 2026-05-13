import { motion } from 'framer-motion';
import { CheckCircle2, Download, FileSearch, FileSpreadsheet, Layers3, Play, ScanLine, UploadCloud } from 'lucide-react';
import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card, { CardBody, CardHeader } from '../components/Card';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { uploadProcessingSteps, uploadTemplateColumns } from '../data/uploads';
import { apiFetch } from '../lib/api';
import { useToast } from '../state/toast';

const MotionDiv = motion.div;

const resultColumns = [
  { key: 'complaint_text', label: 'Complaint Text', wrap: true },
  { key: 'category', label: 'Predicted Category' },
  { key: 'sentiment', label: 'Sentiment', render: (row) => <Badge>{row.sentiment}</Badge> },
  { key: 'priority', label: 'Priority', render: (row) => <Badge>{row.priority}</Badge> },
  { key: 'status', label: 'Status', render: (row) => <Badge>{row.status || 'Solved'}</Badge> },
  { key: 'department', label: 'Department' },
  { key: 'confidence', label: 'Confidence', render: (row) => `${row.confidence}%` },
];

const historyColumns = [
  { key: 'id', label: 'Batch' },
  {
    key: 'file',
    label: 'File',
    render: (row) => (
      <span className="inline-flex min-w-0 items-center gap-2">
        <FileSpreadsheet className="h-4 w-4 shrink-0 text-t-accent" />
        <span className="truncate">{row.file}</span>
      </span>
    ),
  },
  { key: 'rows', label: 'Rows' },
  { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
  { key: 'accuracy', label: 'AI Confidence' },
  { key: 'uploadedAt', label: 'Uploaded' },
];

const previewColumns = [
  { key: 'id', label: 'Case ID' },
  { key: 'complaint_text', label: 'Complaint Preview', wrap: true },
  { key: 'category', label: 'Category' },
  { key: 'sentiment', label: 'Sentiment', render: (row) => <Badge>{row.sentiment}</Badge> },
  { key: 'priority', label: 'Priority', render: (row) => <Badge>{row.priority}</Badge> },
  { key: 'status', label: 'Status', render: (row) => <Badge>{row.status || 'Solved'}</Badge> },
];

function formatDate(value) {
  if (!value) return 'Just now';
  return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function toDistribution(summary, key) {
  return Object.entries(summary?.[key] ?? {}).map(([label, value]) => ({ label, value }));
}

function normalizeUpload(upload) {
  const confidence = upload.analysis_summary?.averageConfidence ?? 0;
  return {
    ...upload,
    file: upload.file_name,
    rows: upload.total_rows,
    status: upload.upload_status,
    accuracy: confidence ? `${confidence}%` : 'Pending',
    uploadedAt: formatDate(upload.upload_timestamp),
  };
}

function DistributionMeter({ item, total }) {
  const width = Math.max(7, Math.round((item.value / Math.max(total, 1)) * 100));
  const color = item.label === 'Critical' || item.label === 'High' || item.label === 'Negative' ? 'bg-t-error' : item.label === 'Medium' ? 'bg-t-warning' : 'bg-t-success';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="truncate font-semibold text-t-text">{item.label}</span>
        <span className="font-display text-sm font-bold text-t-text">{item.value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-t-panel-high">
        <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.55 }} />
      </div>
    </div>
  );
}

function AnalysisMetric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-t-border bg-t-panel p-4">
      <div className="flex items-center gap-2 text-t-text-muted">
        {createElement(Icon, { className: 'h-4 w-4' })}
        <p className="label-caps">{label}</p>
      </div>
      <p className="mt-2 font-display text-2xl font-black text-t-text">{value}</p>
    </div>
  );
}

export default function BulkUpload() {
  const toast = useToast();
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [progress, setProgress] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const historyErrorShown = useRef(false);

  const loadHistory = useCallback(async () => {
    try {
      const uploads = await apiFetch('/uploads');
      setHistory((uploads ?? []).map(normalizeUpload));
    } catch (error) {
      if (!historyErrorShown.current) {
        historyErrorShown.current = true;
        toast.error('Upload history unavailable', error.message || 'Could not load stored upload batches.', { durationMs: 3600 });
      }
    }
  }, [toast]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const pickFile = () => inputRef.current?.click();

  const openUpload = async (upload) => {
    setSelectedUpload(upload);
    setLoadingAnalysis(true);
    try {
      const detail = await apiFetch(`/uploads/${encodeURIComponent(upload.id)}`);
      const normalized = normalizeUpload(detail);
      setSelectedUpload({ ...normalized, detail });
      setResults((detail.complaints ?? []).map((item) => ({ ...item, confidence: item.confidence_score })));
      toast.info('Batch analysis opened', `${detail.file_name} is ready for review.`, { durationMs: 2400 });
    } catch (error) {
      toast.error('Batch unavailable', error.message || 'Could not open this upload analysis.', { durationMs: 3600 });
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const runUpload = async () => {
    if (!selectedFile) {
      toast.error('Upload required', 'Select a CSV or XLSX file before processing.', { durationMs: 3200 });
      return;
    }

    setProcessing(true);
    setResults([]);
    setProcessedRows(0);
    setProgress(0);
    const formData = new FormData();
    formData.append('file', selectedFile);
    const uploadPromise = apiFetch('/uploads', { method: 'POST', body: formData });

    for (const step of uploadProcessingSteps) {
      setActiveStep(step.id);
      setProgress(step.progress);
      setProcessedRows(Math.round((step.progress / 100) * 1000));
      await new Promise((resolve) => window.setTimeout(resolve, 420));
    }

    try {
      const upload = await uploadPromise;
      await loadHistory();
      await openUpload(upload);
      toast.success('AI analysis complete', `${upload.processed_rows} complaints classified and stored in PostgreSQL.`, { durationMs: 3200 });
    } catch (error) {
      toast.error('Upload failed', error.message || 'The file could not be processed.', { durationMs: 3600 });
    } finally {
      setProcessing(false);
      setActiveStep(null);
    }
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

  const summary = selectedUpload?.detail?.analysis_summary ?? {};
  const categoryDistribution = toDistribution(summary, 'categoriesDetected');
  const sentimentDistribution = toDistribution(summary, 'sentimentDistribution');
  const priorityBreakdown = toDistribution(summary, 'priorityBreakdown');
  const logs = selectedUpload?.detail?.processing_logs ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-t-accent">Bulk Intake</p>
          <h1 className="mt-2 font-display text-3xl font-black text-t-text sm:text-4xl">Bulk Upload</h1>
          <p className="mt-2 max-w-3xl text-t-text-muted">Upload CSV or XLSX complaint files, run AI classification, and persist analyzed cases to PostgreSQL.</p>
        </div>
        <Button icon={Download} variant="secondary" onClick={exportResults} disabled={!results.length}>
          Export Results
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="overflow-hidden">
          <CardHeader title="Upload Complaint File" eyebrow="CSV / XLSX analysis" />
          <CardBody>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setSelectedFile(file);
                setResults([]);
                setProgress(0);
                setProcessedRows(0);
                setActiveStep(null);
                toast.success('File selected', `${file.name} is ready for AI analysis.`, { durationMs: 2600 });
              }}
            />
            <motion.button
              type="button"
              onClick={pickFile}
              animate={selectedFile && !processing ? { boxShadow: ['0 0 0 rgba(198, 138, 82,0)', '0 0 34px rgba(198, 138, 82,0.18)', '0 0 0 rgba(198, 138, 82,0)'] } : undefined}
              transition={{ duration: 1.8, repeat: selectedFile && !processing ? Infinity : 0, ease: 'easeInOut' }}
              className="group flex min-h-64 w-full flex-col items-center justify-center rounded-lg border border-dashed border-t-accent/40 bg-t-accent-subtle p-8 text-center transition hover:border-t-accent hover:bg-t-accent/20"
            >
              <span className="grid h-16 w-16 place-items-center rounded-lg border border-t-accent/30 bg-t-panel shadow-panel">
                <UploadCloud className="h-8 w-8 text-t-accent transition group-hover:scale-110" />
              </span>
              <span className="mt-5 font-display text-xl font-bold text-t-text">{selectedFile?.name || 'Drop or select enterprise complaint file'}</span>
              <span className="mt-2 max-w-md text-sm leading-6 text-t-text-muted">Expected columns: {uploadTemplateColumns.join(', ')}.</span>
            </motion.button>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button className="w-full" variant="secondary" icon={FileSpreadsheet} onClick={pickFile} disabled={processing}>
                Select File
              </Button>
              <Button className="w-full" icon={Play} onClick={runUpload} loading={processing} disabled={processing}>
                {processing ? 'Processing...' : 'Run AI Analysis'}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="AI Processing Pipeline" eyebrow="Database-backed workflow" />
          <CardBody>
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-t-text">Batch progress</span>
                <span className="text-t-text-muted">{progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-t-panel-high">
                <motion.div className="h-full bg-t-accent" animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} />
              </div>
              <p className="mt-3 text-sm text-t-text-muted">
                Estimated rows scanned: <span className="font-semibold text-t-text">{processedRows.toLocaleString()}</span>
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
                    className={`rounded-lg border p-4 transition ${active ? 'border-t-accent/40 bg-t-accent-subtle shadow-panel' : complete ? 'border-t-success-subtle bg-t-success-subtle' : 'border-t-border bg-t-panel'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 grid h-7 w-7 place-items-center rounded-full ${complete ? 'bg-t-success-subtle text-t-success' : 'bg-t-panel-high text-t-text-faint'}`}>
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-t-text">{step.label}</p>
                        <p className="mt-1 text-sm leading-6 text-t-text-muted">{step.detail}</p>
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
        <CardHeader title="Analyzed Output" eyebrow="AI model response" />
        <CardBody>
          {results.length ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <AnalysisMetric label="Complaints" value={results.length.toLocaleString()} icon={Layers3} />
                <AnalysisMetric label="Avg. Confidence" value={summary.averageConfidence ? `${summary.averageConfidence}%` : 'Live'} icon={ScanLine} />
                <AnalysisMetric label="Categories" value={categoryDistribution.length} icon={FileSearch} />
                <AnalysisMetric label="Warnings" value={selectedUpload?.failed_rows ?? 0} icon={CheckCircle2} />
              </div>
              <Table columns={resultColumns} rows={results} tableMinWidth="min-w-[1040px]" />
            </div>
          ) : (
            <div className="rounded-lg border border-t-border bg-t-panel p-8 text-center text-sm text-t-text-muted">Run an upload or open a previous batch to review analyzed complaints.</div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Upload History" eyebrow="Stored batch runs" />
        <CardBody>
          <Table columns={historyColumns} rows={history} onRowClick={(row) => void openUpload(row)} tableMinWidth="min-w-[820px]" />
        </CardBody>
      </Card>

      <Modal
        open={Boolean(selectedUpload)}
        title={selectedUpload ? selectedUpload.file : 'Upload analysis'}
        onClose={() => setSelectedUpload(null)}
        className="max-w-4xl"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setSelectedUpload(null)}>
              Close
            </Button>
            <Button icon={Download} onClick={exportResults} disabled={!results.length}>
              Export Batch
            </Button>
          </div>
        }
      >
        {loadingAnalysis ? (
          <div className="rounded-lg border border-t-border bg-t-panel p-8 text-center text-sm text-t-text-muted">Loading batch intelligence and complaint previews.</div>
        ) : selectedUpload ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <AnalysisMetric label="Rows" value={selectedUpload.rows ?? 0} icon={Layers3} />
              <AnalysisMetric label="Processed" value={selectedUpload.processed_rows ?? 0} icon={CheckCircle2} />
              <AnalysisMetric label="Failed" value={selectedUpload.failed_rows ?? 0} icon={ScanLine} />
              <AnalysisMetric label="Confidence" value={selectedUpload.accuracy} icon={FileSearch} />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {[
                ['Categories detected', categoryDistribution],
                ['Sentiment distribution', sentimentDistribution],
                ['Priority breakdown', priorityBreakdown],
              ].map(([title, distribution]) => (
                <section key={title} className="rounded-lg border border-t-border bg-t-panel p-4">
                  <p className="label-caps text-t-text-muted">{title}</p>
                  <div className="mt-4 space-y-4">
                    {distribution.map((item) => (
                      <DistributionMeter key={item.label} item={item} total={selectedUpload.processed_rows || 1} />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <section className="rounded-lg border border-t-border bg-t-panel p-4">
              <p className="label-caps text-t-text-muted">Processing logs</p>
              <div className="mt-4 space-y-2">
                {logs.map((log, index) => (
                  <div key={`${log.message}-${index}`} className="rounded-lg border border-t-border bg-t-panel-high px-3 py-2 text-sm text-t-text-muted">
                    <span className="font-semibold text-t-accent">{log.level}</span> - {log.message}
                  </div>
                ))}
              </div>
            </section>

            <Table columns={previewColumns} rows={results.slice(0, 8)} tableMinWidth="min-w-[840px]" />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
