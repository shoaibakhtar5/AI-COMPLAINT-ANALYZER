export const SUPER_ADMIN_LAYOUTS = [
  {
    id: 'Executive Compact',
    label: 'Executive Compact',
    description: 'Compact KPIs and balanced platform tables.',
  },
  {
    id: 'Comfortable Dashboard',
    label: 'Comfortable Dashboard',
    description: 'More breathing room for dashboard review.',
  },
  {
    id: 'Dense Admin Tables',
    label: 'Dense Admin Tables',
    description: 'Tighter rows and controls for high-volume operations.',
  },
  {
    id: 'Analytics Focused',
    label: 'Analytics Focused',
    description: 'Larger chart surfaces and analytics-forward spacing.',
  },
];

export function normalizeSuperAdminLayout(value) {
  return SUPER_ADMIN_LAYOUTS.some((item) => item.id === value) ? value : 'Executive Compact';
}

export function superAdminLayoutClasses(layoutValue) {
  const layout = normalizeSuperAdminLayout(layoutValue);
  return {
    layout,
    page: layout === 'Comfortable Dashboard' ? 'space-y-8' : layout === 'Dense Admin Tables' ? 'space-y-5' : 'space-y-6',
    cardBody: layout === 'Comfortable Dashboard' ? '!p-6 sm:!p-7' : layout === 'Dense Admin Tables' ? '!p-3 sm:!p-4' : '!p-5',
    gridGap: layout === 'Comfortable Dashboard' ? 'gap-6' : layout === 'Dense Admin Tables' ? 'gap-3' : 'gap-4',
    metricText: layout === 'Comfortable Dashboard' ? 'text-4xl' : layout === 'Dense Admin Tables' ? 'text-2xl' : 'text-3xl',
    tableDensity: layout === 'Dense Admin Tables' || layout === 'Executive Compact' ? 'dense' : 'normal',
    chartHeight: layout === 'Analytics Focused' ? 'h-96' : layout === 'Comfortable Dashboard' ? 'h-80' : 'h-72',
    chartMinHeight: layout === 'Analytics Focused' ? 384 : layout === 'Comfortable Dashboard' ? 320 : 288,
  };
}
