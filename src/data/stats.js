export const companyProfile = {
  name: 'Nexus Bank Enterprise',
  shortName: 'Nexus Bank',
  workspace: 'Complaint Intelligence Cloud',
  plan: 'Enterprise Plus',
  adminName: 'Irfan Marwat',
  adminRole: 'Operations Admin',
};

export const dashboardKpiDefinitions = [
  { id: 'total', label: 'Total Complaints', icon: 'Inbox' },
  { id: 'pending', label: 'Pending Complaints', icon: 'Clock' },
  { id: 'resolved', label: 'Resolved Complaints', icon: 'CheckCircle2' },
  { id: 'highPriority', label: 'High Priority Cases', icon: 'ShieldAlert' },
  { id: 'avgResolution', label: 'Avg Resolution Time', icon: 'Timer' },
  { id: 'accuracy', label: 'AI Accuracy Score', icon: 'BrainCircuit' },
];

export const notificationFeed = [
  {
    id: 'NF-1',
    title: 'Fraud Operations SLA risk',
    text: 'Unauthorized transaction queue has 2 critical cases near SLA breach.',
    time: '5 min ago',
  },
  {
    id: 'NF-2',
    title: 'Mobile app login spike',
    text: 'App Login category is 31% above its rolling daily baseline.',
    time: '18 min ago',
  },
  {
    id: 'NF-3',
    title: 'CRM connector pending review',
    text: 'CRM System integration needs API key confirmation before activation.',
    time: '41 min ago',
  },
];

export const quickActions = [
  { label: 'Analyze single complaint', to: '/admin/ai-lab' },
  { label: 'Upload CSV batch', to: '/admin/bulk-upload' },
  { label: 'Configure integrations', to: '/admin/integrations' },
];

export function buildDashboardKpis(records) {
  const total = records.length;
  const pending = records.filter((item) => item.status === 'Pending').length;
  const resolved = records.filter((item) => item.status === 'Resolved').length;
  const highPriority = records.filter((item) => ['Critical', 'High'].includes(item.priority)).length;
  const resolvedWithTime = records.filter((item) => Number.isFinite(item.resolution_time_hours));
  const avgResolution =
    resolvedWithTime.reduce((sum, item) => sum + item.resolution_time_hours, 0) / Math.max(1, resolvedWithTime.length);
  const avgConfidence = records.reduce((sum, item) => sum + item.confidence, 0) / Math.max(1, records.length);

  return [
    { id: 'total', value: total.toLocaleString(), change: '+18.4%', tone: 'neutral' },
    { id: 'pending', value: pending.toLocaleString(), change: '+6 today', tone: 'warning' },
    { id: 'resolved', value: resolved.toLocaleString(), change: '92.1% SLA met', tone: 'success' },
    { id: 'highPriority', value: highPriority.toLocaleString(), change: 'Critical watchlist', tone: 'danger' },
    { id: 'avgResolution', value: `${avgResolution.toFixed(1)}h`, change: '-12% vs last week', tone: 'success' },
    { id: 'accuracy', value: `${avgConfidence.toFixed(1)}%`, change: 'Mock classifier', tone: 'success' },
  ];
}

export const operationsSnapshot = [
  { label: 'AI triage coverage', value: '100%', detail: 'All demo cases classified' },
  { label: 'Connected sources', value: '4/5', detail: 'Website, app, email, API active' },
  { label: 'Escalation queue', value: '3', detail: 'Critical banking cases' },
];
