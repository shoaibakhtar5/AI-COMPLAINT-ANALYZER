export const aiExampleComplaints = [
  'Product arrived damaged and cannot be used.',
  'Delivery was delayed and tracking has not updated.',
  'Subscription was charged twice for the same billing period.',
  'App is crashing during login and blocks account access.',
  'Refund has not been received after returning the item.',
  'Customer support is not responding to my tickets.',
];

export const aiModelCards = [
  { name: 'Category Classifier', version: 'Production API', metric: 'Live', label: 'Status' },
  { name: 'Sentiment Engine', version: 'Production API', metric: 'Live', label: 'Status' },
  { name: 'Priority Router', version: 'Production API', metric: 'Live', label: 'Status' },
];

const mappings = [
  {
    keywords: ['product', 'damaged', 'broken', 'defective', 'wrong item'],
    response: {
      category: 'Product Issue',
      sentiment: 'Negative',
      priority: 'High',
      confidence: 94,
      department: 'Product Support',
      summary: 'Product quality issue detected. The customer needs replacement, repair, or return support.',
    },
  },
  {
    keywords: ['delivery', 'delayed', 'late', 'tracking', 'shipment'],
    response: {
      category: 'Delivery Issue',
      sentiment: 'Frustrated',
      priority: 'High',
      confidence: 91,
      department: 'Logistics Support',
      summary: 'Delivery delay detected. The case should route to logistics with tracking context.',
    },
  },
  {
    keywords: ['login', 'password', 'app', 'crashing', 'bug'],
    response: {
      category: 'Technical Support',
      sentiment: 'Negative',
      priority: 'Critical',
      confidence: 96,
      department: 'Technical Support Team',
      summary: 'Technical access issue detected. Engineering support should review the application error.',
    },
  },
  {
    keywords: ['refund', 'return', 'money back', 'not received'],
    response: {
      category: 'Refund Issue',
      sentiment: 'Negative',
      priority: 'Medium',
      confidence: 89,
      department: 'Payments & Refunds',
      summary: 'Refund issue detected. The payments team should verify return status and refund timing.',
    },
  },
  {
    keywords: ['billing', 'charged twice', 'invoice', 'incorrect amount'],
    response: {
      category: 'Billing Issue',
      sentiment: 'Negative',
      priority: 'High',
      confidence: 92,
      department: 'Billing Department',
      summary: 'Billing issue detected. The customer needs charge review and invoice correction.',
    },
  },
  {
    keywords: ['support', 'not responding', 'callback', 'ticket'],
    response: {
      category: 'Customer Service',
      sentiment: 'Frustrated',
      priority: 'Medium',
      confidence: 86,
      department: 'Customer Experience',
      summary: 'Service recovery issue caused by delayed support response and repeated contact attempts.',
    },
  },
];

export function analyzeComplaintText(text) {
  const normalized = text.toLowerCase();
  const match = mappings.find((mapping) => mapping.keywords.some((keyword) => normalized.includes(keyword)));

  return (
    match?.response ?? {
      category: 'General Complaint',
      sentiment: normalized.length > 80 ? 'Concerned' : 'Neutral',
      priority: normalized.length > 120 ? 'Medium' : 'Low',
      confidence: normalized.length > 40 ? 78 : 62,
      department: 'Customer Operations',
      summary: 'General complaint detected. More detail will improve category and priority confidence.',
    }
  );
}
