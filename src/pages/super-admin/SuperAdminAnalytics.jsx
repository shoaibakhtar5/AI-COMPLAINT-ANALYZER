import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import Button from '../../components/Button';
import Card, { CardBody, CardHeader } from '../../components/Card';
import ChartFrame from '../../components/ChartFrame';
import Loader from '../../components/Loader';
import Table from '../../components/Table';
import { superAdminFetch } from '../../lib/superAdminApi';
import { useToast } from '../../state/toast';

function distribution(items, key) {
  const map = new Map();
  items.forEach((item) => {
    const label = item[key] || 'Unassigned';
    map.set(label, (map.get(label) || 0) + 1);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

const topCompanyColumns = [
  { key: 'company_name', label: 'Company', widthClassName: 'min-w-[220px] max-w-[260px]' },
  { key: 'complaints_count', label: 'Complaints' },
  { key: 'analyses_count', label: 'AI analyses' },
  { key: 'uploads_count', label: 'Uploads' },
  { key: 'users_count', label: 'Users' },
];

export default function SuperAdminAnalytics() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({ summary: {} });
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, companyRows, userRows] = await Promise.all([
        superAdminFetch('/dashboard'),
        superAdminFetch('/companies'),
        superAdminFetch('/users'),
      ]);
      setDashboard(dash);
      setCompanies(companyRows ?? []);
      setUsers(userRows ?? []);
    } catch (error) {
      toast.error('Platform analytics unavailable', error.message || 'Could not load platform analytics.', { durationMs: 3600 });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const industryData = useMemo(() => distribution(companies, 'industry'), [companies]);
  const statusData = useMemo(() => distribution(companies, 'status'), [companies]);
  const roleData = useMemo(() => distribution(users, 'role'), [users]);
  const topCompanies = useMemo(
    () => [...companies].sort((a, b) => b.complaints_count - a.complaints_count).slice(0, 10),
    [companies],
  );
  const hasData = companies.length > 0 || users.length > 0;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-t-accent">Platform Analytics</p>
          <h1 className="mt-2 font-display text-3xl font-black text-t-text sm:text-4xl">SaaS Usage Intelligence</h1>
          <p className="mt-2 max-w-3xl text-t-text-muted">Database-backed platform summaries across companies, users, complaints, and AI usage.</p>
        </div>
        <Button icon={RefreshCw} onClick={() => void load()} loading={loading} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {loading ? <Loader label="Loading platform analytics..." /> : null}
      {!hasData ? (
        <Card className="border-dashed border-t-border bg-t-panel">
          <CardBody className="py-10 text-center text-sm text-t-text-muted">No platform analytics data yet. No demo analytics are shown.</CardBody>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Companies', dashboard.summary?.total_companies ?? 0],
          ['Users', dashboard.summary?.total_users ?? 0],
          ['Complaints', dashboard.summary?.total_complaints ?? 0],
          ['AI analyses', dashboard.summary?.total_ai_analyses ?? 0],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardBody>
              <p className="label-caps text-t-text-muted">{label}</p>
              <p className="mt-3 font-display text-3xl font-black text-t-text">{value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-3">
        {[
          ['Companies by Industry', industryData],
          ['Companies by Status', statusData],
          ['Users by Role', roleData],
        ].map(([title, data]) => (
          <Card key={title} className="min-w-0 overflow-hidden">
            <CardHeader title={title} eyebrow="Real records" />
            <CardBody className="min-w-0">
              {data.length ? (
                <ChartFrame className="h-72" minHeight={288}>
                  <BarChart data={data}>
                    <CartesianGrid stroke="var(--t-border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--t-text-muted)" tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'var(--t-accent-subtle)' }} contentStyle={{ background: 'var(--t-panel)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }} />
                    <Bar dataKey="value" fill="var(--t-accent)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartFrame>
              ) : (
                <div className="grid h-72 place-items-center rounded-lg border border-t-border bg-t-panel text-sm text-t-text-muted">No data yet.</div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader title="Top Companies by Complaint Volume" eyebrow="Usage leaders" />
        <CardBody className="min-w-0">
          {topCompanies.length ? (
            <Table columns={topCompanyColumns} rows={topCompanies} rowKey="id" tableMinWidth="min-w-[820px]" />
          ) : (
            <div className="rounded-lg border border-t-border bg-t-panel p-8 text-center text-sm text-t-text-muted">No company usage yet.</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
