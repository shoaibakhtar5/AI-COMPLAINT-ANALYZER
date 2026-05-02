export const uploadProcessingSteps = [
  { id: 'read', label: 'Reading file', detail: 'Validating file name, size, and supported columns.', progress: 18 },
  { id: 'parse', label: 'Parsing rows', detail: 'Normalizing customer name, complaint text, date, and source fields.', progress: 38 },
  { id: 'send', label: 'Sending to AI model', detail: 'Mock request prepared for the future classification endpoint.', progress: 58 },
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
  { id: 'UP-7821', file: 'nexus-bank-complaints-april.csv', rows: 1240, status: 'Completed', accuracy: '93.8%', uploadedAt: 'Today 09:20' },
  { id: 'UP-7818', file: 'mobile-app-feedback.xlsx', rows: 486, status: 'Completed', accuracy: '91.4%', uploadedAt: 'Yesterday 16:05' },
  { id: 'UP-7810', file: 'call-center-transcripts.csv', rows: 2190, status: 'Review Needed', accuracy: '88.6%', uploadedAt: 'Apr 30 11:44' },
];
