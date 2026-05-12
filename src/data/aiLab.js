export const aiExampleComplaints = [
  'ATM deducted money but no cash received.',
  'Credit card blocked suddenly while I was travelling.',
  'App login is not working and OTP arrives late.',
  'Refund not received after a failed payment.',
  'Unauthorized transaction detected on my account.',
  'Customer support is not responding to my tickets.',
];

export const aiModelCards = [
  { name: 'Category Classifier', version: 'Production API', metric: 'Live', label: 'Status' },
  { name: 'Sentiment Engine', version: 'Production API', metric: 'Live', label: 'Status' },
  { name: 'Priority Router', version: 'Production API', metric: 'Live', label: 'Status' },
];

const mappings = [
  {
    keywords: ['atm', 'cash', 'deducted', 'withdraw'],
    response: {
      category: 'ATM Issue',
      sentiment: 'Negative',
      priority: 'High',
      confidence: 94,
      department: 'Digital Banking Operations',
      summary: 'Cash dispensing failure with financial impact. Customer needs fast reversal validation.',
    },
  },
  {
    keywords: ['credit card', 'card blocked', 'blocked', 'travel'],
    response: {
      category: 'Card Services',
      sentiment: 'Frustrated',
      priority: 'High',
      confidence: 91,
      department: 'Card Risk Review',
      summary: 'Card access issue likely caused by risk rules or payment state mismatch.',
    },
  },
  {
    keywords: ['login', 'otp', 'password', 'app'],
    response: {
      category: 'App Login',
      sentiment: 'Negative',
      priority: 'Critical',
      confidence: 96,
      department: 'Mobile Platform Engineering',
      summary: 'Authentication disruption affecting digital banking access and approvals.',
    },
  },
  {
    keywords: ['refund', 'reversal', 'failed payment'],
    response: {
      category: 'Refund Delay',
      sentiment: 'Negative',
      priority: 'Medium',
      confidence: 89,
      department: 'Payments Reconciliation',
      summary: 'Payment reversal needs transaction trace and merchant settlement confirmation.',
    },
  },
  {
    keywords: ['unauthorized', 'fraud', 'transaction', 'otp'],
    response: {
      category: 'Unauthorized Transaction',
      sentiment: 'Negative',
      priority: 'Critical',
      confidence: 97,
      department: 'Fraud Operations',
      summary: 'Potential fraud case requiring immediate account protection and dispute workflow.',
    },
  },
  {
    keywords: ['support', 'not responding', 'callback', 'ticket'],
    response: {
      category: 'Support Delay',
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
      category: 'General Service Complaint',
      sentiment: normalized.length > 80 ? 'Concerned' : 'Neutral',
      priority: normalized.length > 120 ? 'Medium' : 'Low',
      confidence: normalized.length > 40 ? 78 : 62,
      department: 'Customer Experience',
      summary: 'General complaint detected. More detail will improve category and priority confidence.',
    }
  );
}
