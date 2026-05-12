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
