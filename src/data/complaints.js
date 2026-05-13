export const complaints = [];

export const complaintStatusFlow = [
  { label: 'Received', completedStatuses: ['Pending Analysis', 'Analysis Failed', 'Solved'] },
  { label: 'AI Analysis', completedStatuses: ['Solved'] },
  { label: 'Solved', completedStatuses: ['Solved'] },
];

export const complaintCategories = [
  'Product Issue',
  'Delivery Issue',
  'Billing Issue',
  'Refund Issue',
  'Technical Support',
  'Customer Service',
  'Account Issue',
  'Service Delay',
  'Quality Complaint',
  'General Complaint',
];
