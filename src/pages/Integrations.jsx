import { Activity, Cable, CheckCircle2, PlugZap, Settings2, Unplug, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card, { CardBody, CardHeader } from '../components/Card';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { integrationActivity, integrationConnectors } from '../data/integrations';
import { useToast } from '../state/toast';

export default function Integrations() {
  const toast = useToast();
  const [connectors, setConnectors] = useState(integrationConnectors);
  const [selected, setSelected] = useState(null);
  const [testingId, setTestingId] = useState('');

  const summary = useMemo(() => {
    const connected = connectors.filter((item) => ['Connected', 'Active'].includes(item.status)).length;
    const pending = connectors.filter((item) => item.status === 'Pending').length;
    return [
      { label: 'Connected Apps', value: connected },
      { label: 'Pending Setup', value: pending },
      { label: 'Records Today', value: connectors.reduce((sum, item) => sum + item.recordsToday, 0).toLocaleString() },
    ];
  }, [connectors]);

  const updateConnector = (id, patch) => {
    setConnectors((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const connect = (connector) => {
    updateConnector(connector.id, { status: 'Connected', health: 'Healthy', latency: connector.latency === 'N/A' ? '61ms' : connector.latency });
    toast.success('Integration connected', `${connector.name} is now connected in demo mode.`, { durationMs: 2800 });
  };

  const disconnect = (connector) => {
    updateConnector(connector.id, { status: 'Disconnected', health: 'Paused', recordsToday: 0, latency: 'N/A' });
    toast.info('Integration disconnected', `${connector.name} intake paused.`, { durationMs: 2800 });
  };

  const testConnection = async (connector) => {
    setTestingId(connector.id);
    await new Promise((resolve) => setTimeout(resolve, 950));
    setTestingId('');
    toast.success('Connection test passed', `${connector.name} responded successfully.`, { durationMs: 2800 });
  };

  const columns = [
    { key: 'name', label: 'Connector' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    { key: 'health', label: 'Health', render: (row) => <Badge>{row.health}</Badge> },
    { key: 'recordsToday', label: 'Records Today' },
    { key: 'latency', label: 'Latency' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-crimson-500">Company App Connections</p>
          <h1 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">Integrations</h1>
          <p className="mt-2 max-w-3xl text-zinc-400">
            Connect website forms, mobile apps, CRM tickets, support inboxes, and REST API sources to the complaint analyzer.
          </p>
        </div>
        <Button icon={PlugZap} onClick={() => toast.info('Developer API', 'Mock API key panel is available through REST API Configure.', { durationMs: 3200 })}>
          Generate API Key
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <Card key={item.label}>
            <CardBody>
              <p className="label-caps text-zinc-500">{item.label}</p>
              <p className="mt-3 font-display text-4xl font-black text-white">{item.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {connectors.map((connector) => (
            <Card key={connector.id} className="overflow-hidden">
              <CardBody>
                <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="flex gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-crimson-600/25 bg-crimson-600/10">
                      <Cable className="h-6 w-6 text-crimson-300" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-display text-xl font-bold text-white">{connector.name}</h2>
                        <Badge>{connector.status}</Badge>
                      </div>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{connector.description}</p>
                      <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
                        <span>{connector.type}</span>
                        <span>Health: {connector.health}</span>
                        <span>Latency: {connector.latency}</span>
                        <span>Today: {connector.recordsToday}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {connector.status === 'Disconnected' || connector.status === 'Pending' ? (
                      <Button size="sm" icon={Zap} onClick={() => connect(connector)}>
                        Connect
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" icon={Unplug} onClick={() => disconnect(connector)}>
                        Disconnect
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" icon={Activity} loading={testingId === connector.id} disabled={testingId === connector.id} onClick={() => void testConnection(connector)}>
                      Test
                    </Button>
                    <Button size="sm" variant="ghost" icon={Settings2} onClick={() => setSelected(connector)}>
                      Configure
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader title="Connection Activity" eyebrow="Latest source events" />
          <CardBody className="space-y-4">
            {integrationActivity.map((item) => (
              <div key={item.id} className="flex gap-3 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-crimson-600/10 text-crimson-300">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{item.connector}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">{item.event}</p>
                  <p className="mt-2 text-xs text-zinc-600">{item.time}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Integration Registry" eyebrow="Tabular operations view" />
        <CardBody>
          <Table columns={columns} rows={connectors} rowKey="id" onRowClick={setSelected} />
        </CardBody>
      </Card>

      <Modal
        open={Boolean(selected)}
        title={selected ? `Configure ${selected.name}` : 'Configure integration'}
        onClose={() => setSelected(null)}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                toast.success('Configuration saved', `${selected?.name} settings saved in mock mode.`, { durationMs: 2600 });
                setSelected(null);
              }}
            >
              Save Configuration
            </Button>
          </div>
        }
      >
        {selected ? (
          <div className="space-y-5">
            <p className="text-sm leading-6 text-zinc-300">{selected.description}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                <p className="label-caps text-zinc-500">Webhook Endpoint</p>
                <p className="mt-2 break-all font-mono text-xs text-zinc-300">https://api.crimson-ai.local/intake/{selected.id}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                <p className="label-caps text-zinc-500">Sync Mode</p>
                <p className="mt-2 text-sm font-semibold text-white">Real-time + nightly reconciliation</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                <p className="label-caps text-zinc-500">Mapped Fields</p>
                <p className="mt-2 text-sm text-zinc-300">customer_name, complaint_text, source, date, contact</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                <p className="label-caps text-zinc-500">AI Pipeline</p>
                <p className="mt-2 text-sm text-zinc-300">Category, sentiment, priority, department routing</p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
