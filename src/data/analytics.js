export const complaintsByCategory = [
  { category: 'Product Issue', complaints: 186 },
  { category: 'Delivery Issue', complaints: 142 },
  { category: 'Technical Support', complaints: 131 },
  { category: 'Refund Issue', complaints: 119 },
  { category: 'Billing Issue', complaints: 98 },
  { category: 'Customer Service', complaints: 84 },
];

export const monthlyComplaintVolume = [
  { month: 'Nov', complaints: 920, solved: 812 },
  { month: 'Dec', complaints: 1040, solved: 938 },
  { month: 'Jan', complaints: 1175, solved: 1064 },
  { month: 'Feb', complaints: 1098, solved: 1011 },
  { month: 'Mar', complaints: 1284, solved: 1186 },
  { month: 'Apr', complaints: 1419, solved: 1302 },
  { month: 'May', complaints: 642, solved: 578 },
];

export const sentimentTrend = [
  { day: 'Mon', negative: 42, frustrated: 31, neutral: 18, positive: 9 },
  { day: 'Tue', negative: 47, frustrated: 28, neutral: 16, positive: 9 },
  { day: 'Wed', negative: 39, frustrated: 34, neutral: 19, positive: 8 },
  { day: 'Thu', negative: 53, frustrated: 29, neutral: 12, positive: 6 },
  { day: 'Fri', negative: 58, frustrated: 25, neutral: 11, positive: 6 },
  { day: 'Sat', negative: 44, frustrated: 27, neutral: 21, positive: 8 },
  { day: 'Sun', negative: 49, frustrated: 26, neutral: 17, positive: 8 },
];

export const priorityBreakdown = [
  { name: 'Critical', value: 16 },
  { name: 'High', value: 31 },
  { name: 'Medium', value: 38 },
  { name: 'Low', value: 15 },
];

export const resolutionTimeTrend = [
  { week: 'W1', hours: 18.4, target: 16 },
  { week: 'W2', hours: 16.9, target: 16 },
  { week: 'W3', hours: 14.7, target: 16 },
  { week: 'W4', hours: 13.2, target: 16 },
  { week: 'W5', hours: 12.6, target: 16 },
  { week: 'W6', hours: 11.8, target: 16 },
];

export const departmentLoad = [
  { department: 'Customer Operations', open: 42, slaRisk: 11 },
  { department: 'Technical Support Team', open: 38, slaRisk: 8 },
  { department: 'Logistics Support', open: 31, slaRisk: 6 },
  { department: 'Payments & Refunds', open: 28, slaRisk: 5 },
  { department: 'Quality Assurance', open: 22, slaRisk: 4 },
];

export const sourceMix = [
  { source: 'Mobile App', volume: 36 },
  { source: 'Website Form', volume: 24 },
  { source: 'Email Inbox', volume: 18 },
  { source: 'Call Center', volume: 14 },
  { source: 'REST API', volume: 8 },
];
