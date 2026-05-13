import { Activity, Cable, CheckCircle2, PlugZap, Settings2, Unplug, Zap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card, { CardBody, CardHeader } from '../components/Card';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { apiFetch } from '../lib/api';
import { useToast } from '../state/toast';

function normalizeConnector(item) {
  return {
    ...item,
    recordsToday: item.records_today ?? item.recordsToday ?? 0,
    description: item.config?.description ?? `${item.name} connector for complaint operations.`,
  };
}

function normalizeConnectionActivity(activity) {
  if (!Array.isArray(activity)) return [];
  return activity.filter((item) => item.entity_type === 'integration' || String(item.action || '').includes('integration'));
}

function ConfigTile({ label, value }) {
  return (
    <div className="rounded-lg border border-t-border bg-t-panel p-4">
      <p className="label-caps text-t-text-muted">{label}</p>
      <p className="mt-2 break-all text-sm font-semibold text-t-text">{value || 'Not configured'}</p>
    </div>
  );
}

export default function Integrations() {
  const toast = useToast();
  const [connectors, setConnectors] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [selected, setSelected] = useState(null);
  const [testingId, setTestingId] = useState('');
  const [loading, setLoading] = useState(true);
  const loadErrorShown = useRef(false);

  const loadIntegrations = useCallback(async () => {
    setLoading(true);
    try {
      const [items, activity] = await Promise.all([apiFetch('/integrations'), apiFetch('/integrations/activity')]);
      setConnectors((items ?? []).map(normalizeConnector));
      setActivityFeed(normalizeConnectionActivity(activity));
      loadErrorShown.current = false;
    } catch (error) {
      if (!loadErrorShown.current) {
        loadErrorShown.current = true;
        toast.error('Integrations unavailable', error.message || 'Could not load integration registry.', { durationMs: 3600 });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadIntegrations();
  }, [loadIntegrations]);

  const summary = useMemo(() => {
    const connected = connectors.filter((item) => ['Connected', 'Active'].includes(item.status)).length;
    const pending = connectors.filter((item) => item.status === 'Pending').length;
    return [
      { label: 'Connected Apps', value: connected },
      { label: 'Pending Setup', value: pending },
      { label: 'Records Today', value: connectors.reduce((sum, item) => sum + item.recordsToday, 0).toLocaleString() },
    ];
  }, [connectors]);

  const updateConnector = async (id, patch) => {
    const body = {
      ...patch,
      records_today: patch.recordsToday,
    };
    delete body.recordsToday;
    try {
      const updated = await apiFetch(`/integrations/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body,
      });
      setConnectors((prev) => prev.map((item) => (item.id === id ? normalizeConnector(updated) : item)));
      return normalizeConnector(updated);
    } catch (error) {
      toast.error('Integration update failed', error.message || 'Could not update this connector.', { durationMs: 3600 });
      throw error;
    }
  };

  const connect = async (connector) => {
    try {
      await updateConnector(connector.id, { status: 'Pending', health: 'Configuration needed', latency: 'N/A' });
      toast.info('Integration pending', `${connector.name} is ready for configuration.`, { durationMs: 2800 });
    } catch {
      // updateConnector already surfaced the error.
    }
  };

  const disconnect = async (connector) => {
    try {
      await updateConnector(connector.id, { status: 'Disconnected', health: 'Paused', recordsToday: 0, latency: 'N/A' });
      toast.info('Integration disconnected', `${connector.name} intake paused.`, { durationMs: 2800 });
    } catch {
      // updateConnector already surfaced the error.
    }
  };

  const testConnection = async (connector) => {
    setTestingId(connector.id);
    try {
      const updated = await apiFetch(`/integrations/${encodeURIComponent(connector.id)}/test`, { method: 'POST' });
      setConnectors((prev) => prev.map((item) => (item.id === connector.id ? normalizeConnector(updated) : item)));
      toast.success('Connection test passed', `${connector.name} responded successfully.`, { durationMs: 2800 });
    } catch (error) {
      toast.error('Connection test failed', error.message || `${connector.name} did not respond.`, { durationMs: 3600 });
    } finally {
      setTestingId('');
    }
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
          <p className="label-caps text-t-accent">Company App Connections</p>
          <h1 className="mt-2 font-display text-3xl font-black text-t-text sm:text-4xl">Integrations</h1>
          <p className="mt-2 max-w-3xl text-t-text-muted">
            Connect website forms, mobile apps, CRM tickets, support inboxes, and REST API sources to the complaint analyzer.
          </p>
        </div>
        <Button icon={PlugZap} onClick={() => toast.info('Developer API', 'API key management is handled by the backend workspace security layer.', { durationMs: 3200 })}>
          Generate API Key
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <Card key={item.label}>
            <CardBody>
              <p className="label-caps text-t-text-muted">{item.label}</p>
              <p className="mt-3 font-display text-4xl font-black text-t-text">{item.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {loading ? <Loader label="Loading workspace integrations..." /> : null}
          {!loading && connectors.length === 0 ? (
            <Card className="border-dashed border-t-border bg-t-panel">
              <CardBody className="py-10 text-center">
                <PlugZap className="mx-auto h-10 w-10 text-t-accent" />
                <h2 className="mt-4 font-display text-xl font-bold text-t-text">No integrations configured</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-t-text-muted">
                  This workspace has no connected apps yet. Add connectors through your backend integration registry or API provisioning flow.
                </p>
              </CardBody>
            </Card>
          ) : null}
          {!loading && connectors.map((connector) => (
            <Card key={connector.id} className="overflow-hidden">
              <CardBody>
                <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="flex gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-t-accent/20 bg-t-accent-subtle">
                      <Cable className="h-6 w-6 text-t-accent" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-display text-xl font-bold text-t-text">{connector.name}</h2>
                        <Badge>{connector.status}</Badge>
                      </div>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-t-text-muted">{connector.description}</p>
                      <div className="mt-4 flex flex-wrap gap-3 text-xs text-t-text-muted">
                        <span>{connector.type}</span>
                        <span>Health: {connector.health}</span>
                        <span>Latency: {connector.latency}</span>
                        <span>Today: {connector.recordsToday}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {connector.status === 'Disconnected' || connector.status === 'Pending' ? (
                      <Button size="sm" icon={Zap} onClick={() => void connect(connector)}>
                        Connect
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" icon={Unplug} onClick={() => void disconnect(connector)}>
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
            {!loading && activityFeed.length === 0 ? (
              <div>
                <p className="font-display text-sm font-bold text-t-text">No connection activity yet</p>
                <p className="mt-2 text-sm leading-6 text-t-text-muted">
                  Events from connected apps will appear here once integrations start sending data.
                </p>
              </div>
            ) : null}
            {activityFeed.map((item) => (
              <div key={item.id} className="flex gap-3 border-b border-t-border pb-4 last:border-0 last:pb-0">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-t-accent-subtle text-t-accent">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-t-text">{item.entity_type}</p>
                  <p className="mt-1 text-sm leading-6 text-t-text-muted">{item.action}</p>
                  <p className="mt-2 text-xs text-t-text-faint">{new Date(item.timestamp).toLocaleString()}</p>
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
              onClick={async () => {
                try {
                  await updateConnector(selected.id, { config: selected.config ?? {} });
                  toast.success('Configuration saved', `${selected?.name} settings saved.`, { durationMs: 2600 });
                  setSelected(null);
                } catch {
                  // updateConnector already surfaced the error.
                }
              }}
            >
              Save Configuration
            </Button>
          </div>
        }
      >
        {selected ? (
          <div className="space-y-5">
            <p className="text-sm leading-6 text-t-text-muted">{selected.description}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <ConfigTile label="Webhook Endpoint" value={selected.config?.webhook || selected.config?.webhookUrl} />
              <ConfigTile label="Sync Mode" value={selected.config?.syncMode} />
              <ConfigTile label="Mapped Fields" value={Array.isArray(selected.config?.mappedFields) ? selected.config.mappedFields.join(', ') : selected.config?.mappedFields} />
              <ConfigTile label="AI Pipeline" value={selected.config?.aiPipeline} />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
