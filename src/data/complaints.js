export const complaints = [];

export const complaintStatusFlow = [
  { label: 'Received', completedStatuses: ['Pending', 'In Progress', 'Escalated', 'Resolved'] },
  { label: 'Classified', completedStatuses: ['Pending', 'In Progress', 'Escalated', 'Resolved'] },
  { label: 'Assigned', completedStatuses: ['In Progress', 'Escalated', 'Resolved'] },
  { label: 'Resolved', completedStatuses: ['Resolved'] },
];

export const complaintCategories = [
  'ATM Issue',
  'Card Services',
  'App Login',
  'Refund Delay',
  'Unauthorized Transaction',
  'Support Delay',
  'Claim Processing',
  'Loan Servicing',
  'Funds Transfer',
  'Wallet Top-up',
  'Policy Renewal',
  'Card Delivery',
];
