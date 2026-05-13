export const complaints = [];

export const complaintStatusFlow = [
  { label: 'Received', completedStatuses: ['Pending', 'In Progress', 'Escalated', 'Solved'] },
  { label: 'Classified', completedStatuses: ['Pending', 'In Progress', 'Escalated', 'Solved'] },
  { label: 'Assigned', completedStatuses: ['In Progress', 'Escalated', 'Solved'] },
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
