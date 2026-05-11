export const uploadProcessingSteps = [
  { id: 'read', label: 'Reading file', detail: 'Validating file name, size, and supported columns.', progress: 18 },
  { id: 'parse', label: 'Parsing rows', detail: 'Normalizing customer name, complaint text, date, and source fields.', progress: 38 },
  { id: 'send', label: 'Sending to AI model', detail: 'Streaming normalized complaint text to the backend classifier endpoint.', progress: 58 },
  { id: 'analyze', label: 'Analyzing complaints', detail: 'Predicting category, sentiment, priority, and target department.', progress: 82 },
  { id: 'return', label: 'Returning results', detail: 'Writing analyzed rows into the admin review table.', progress: 100 },
];

export const uploadTemplateColumns = [
  'customer_name',
  'complaint_text',
  'date',
  'source',
  'account_type',
  'contact',
];

export const mockAnalyzedRows = [
  {
    id: 'BULK-001',
    complaint_text: 'ATM deducted money but no cash received from branch lobby machine.',
    predicted_category: 'ATM Issue',
    sentiment: 'Negative',
    priority: 'High',
    department: 'Digital Banking Operations',
    confidence: '94%',
  },
  {
    id: 'BULK-002',
    complaint_text: 'Credit card blocked suddenly during travel despite full payment.',
    predicted_category: 'Card Services',
    sentiment: 'Frustrated',
    priority: 'High',
    department: 'Card Risk Review',
    confidence: '91%',
  },
  {
    id: 'BULK-003',
    complaint_text: 'Refund not received after failed ecommerce payment reversal.',
    predicted_category: 'Refund Delay',
    sentiment: 'Negative',
    priority: 'Medium',
    department: 'Payments Reconciliation',
    confidence: '89%',
  },
  {
    id: 'BULK-004',
    complaint_text: 'Customer support not responding to repeated ticket follow-ups.',
    predicted_category: 'Support Delay',
    sentiment: 'Frustrated',
    priority: 'Medium',
    department: 'Customer Experience',
    confidence: '86%',
  },
  {
    id: 'BULK-005',
    complaint_text: 'Unauthorized transaction detected and customer denies OTP sharing.',
    predicted_category: 'Unauthorized Transaction',
    sentiment: 'Negative',
    priority: 'Critical',
    department: 'Fraud Operations',
    confidence: '97%',
  },
];

export const uploadHistory = [
  {
    id: 'UP-7821',
    file: 'nexus-bank-complaints-april.csv',
    rows: 1240,
    status: 'Completed',
    accuracy: '93.8%',
    uploadedAt: 'Today 09:20',
    uploadedAtFull: 'May 9, 2026 at 09:20',
    processingStatus: 'AI analysis complete',
    categories: [
      { label: 'ATM Issue', value: 412 },
      { label: 'Refund Delay', value: 286 },
      { label: 'Unauthorized Transaction', value: 198 },
      { label: 'Card Services', value: 164 },
    ],
    sentimentDistribution: [
      { label: 'Negative', value: 52 },
      { label: 'Frustrated', value: 31 },
      { label: 'Neutral', value: 12 },
      { label: 'Positive', value: 5 },
    ],
    priorityBreakdown: [
      { label: 'Critical', value: 74 },
      { label: 'High', value: 218 },
      { label: 'Medium', value: 711 },
      { label: 'Low', value: 237 },
    ],
    logs: [
      'Validated 1,240 rows against complaint intake schema.',
      'Detected 4 high-volume categories and 74 critical cases.',
      'Routed fraud and ATM records to operations queues.',
      'Generated analyst review table with confidence metadata.',
    ],
  },
  {
    id: 'UP-7818',
    file: 'mobile-app-feedback.xlsx',
    rows: 486,
    status: 'Completed',
    accuracy: '91.4%',
    uploadedAt: 'Yesterday 16:05',
    uploadedAtFull: 'May 8, 2026 at 16:05',
    processingStatus: 'Ready for review',
    categories: [
      { label: 'App Login', value: 184 },
      { label: 'Payment Failure', value: 122 },
      { label: 'KYC Delay', value: 98 },
      { label: 'Support Delay', value: 82 },
    ],
    sentimentDistribution: [
      { label: 'Negative', value: 46 },
      { label: 'Frustrated', value: 38 },
      { label: 'Neutral', value: 11 },
      { label: 'Positive', value: 5 },
    ],
    priorityBreakdown: [
      { label: 'Critical', value: 19 },
      { label: 'High', value: 102 },
      { label: 'Medium', value: 289 },
      { label: 'Low', value: 76 },
    ],
    logs: [
      'Parsed workbook tabs and normalized mobile-app channel data.',
      'Flagged login spike across digital banking users.',
      'Assigned payment failures to reconciliation review.',
      'Prepared 486 rows for QA sampling.',
    ],
  },
  {
    id: 'UP-7810',
    file: 'call-center-transcripts.csv',
    rows: 2190,
    status: 'Review Needed',
    accuracy: '88.6%',
    uploadedAt: 'Apr 30 11:44',
    uploadedAtFull: 'April 30, 2026 at 11:44',
    processingStatus: 'Human QA recommended',
    categories: [
      { label: 'Support Delay', value: 802 },
      { label: 'Refund Delay', value: 511 },
      { label: 'Card Services', value: 438 },
      { label: 'Account Closure', value: 265 },
    ],
    sentimentDistribution: [
      { label: 'Negative', value: 49 },
      { label: 'Frustrated', value: 29 },
      { label: 'Neutral', value: 19 },
      { label: 'Positive', value: 3 },
    ],
    priorityBreakdown: [
      { label: 'Critical', value: 88 },
      { label: 'High', value: 365 },
      { label: 'Medium', value: 1260 },
      { label: 'Low', value: 477 },
    ],
    logs: [
      'Imported transcript batch with 2,190 conversation records.',
      'Detected lower model confidence on noisy call summaries.',
      'Marked 312 rows for analyst sampling.',
      'Review recommended before committing queue updates.',
    ],
  },
];

export function buildUploadPreview(upload) {
  return mockAnalyzedRows.map((row, index) => ({
    ...row,
    id: `${upload.id}-${String(index + 1).padStart(3, '0')}`,
  }));
}
