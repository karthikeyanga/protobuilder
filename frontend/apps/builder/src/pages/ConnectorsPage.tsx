import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createConnector, listConnectors, updateConnector, type ConnectorConfig } from '../services/connectorService';

type ConnectorRow = { id?: string; config: ConnectorConfig };

const blankConnector = (): ConnectorConfig => ({
  name: '',
  version: '0.0.1',
  kind: 'REST',
  request: { method: 'GET', url: '' }
});

export function ConnectorsPage() {
  const { appId } = useParams();
  const [connectors, setConnectors] = useState<ConnectorRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<ConnectorConfig>(blankConnector());

  const selected = useMemo(() => connectors.find((c) => c.id === selectedId) ?? connectors[0], [connectors, selectedId]);

  useEffect(() => {
    if (!appId) return;
    setLoading(true);
    setError(null);
    listConnectors(appId)
      .then((rows) => {
        setConnectors(rows.map((r) => ({ id: r.dto.id, config: r.config })));
        if (rows.length > 0) {
          setSelectedId(rows[0].dto.id);
          setDraft(rows[0].config);
        }
      })
      .catch(() => setError('Failed to load connectors'))
      .finally(() => setLoading(false));
  }, [appId]);

  useEffect(() => {
    if (selected) setDraft(selected.config);
  }, [selected]);

  const save = async () => {
    if (!appId) return;
    if (!draft.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (selected?.id) {
        const updated = await updateConnector(appId, selected.id, draft);
        setConnectors((prev) => prev.map((c) => (c.id === selected.id ? { id: updated.dto.id, config: updated.config } : c)));
      } else {
        const created = await createConnector(appId, draft);
        setConnectors((prev) => [{ id: created.dto.id, config: created.config }, ...prev]);
        setSelectedId(created.dto.id);
      }
    } catch {
      setError('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const newConnector = () => {
    setSelectedId(undefined);
    setDraft(blankConnector());
  };

  if (!appId) return <div className="panel-placeholder error">No app selected.</div>;

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Connectors</h3>
        <div className="inline-form">
          <button className="ghost small" onClick={newConnector}>+ New Connector</button>
          <button className="ghost small" onClick={save} disabled={saving || !draft.name.trim()}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="panel-placeholder">Loading connectors...</div>
      ) : error ? (
        <div className="panel-placeholder error">{error}</div>
      ) : (
        <div className="entity-grid">
          <div className="entity-list">
            {connectors.length === 0 && <div className="muted">No connectors yet.</div>}
            {connectors.map((c) => (
              <div key={c.id} className={`list-row ${c.id === selectedId ? 'active' : ''}`} onClick={() => setSelectedId(c.id)}>
                <div>
                  <div className="title">{c.config.name}</div>
                  <div className="muted small">{c.config.kind} · v{c.config.version}</div>
                  <div className="muted small">{c.config.request?.url}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="entity-editor">
            <div className="inline-form">
              <input placeholder="Name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
              <input placeholder="Version" value={draft.version} onChange={(e) => setDraft((d) => ({ ...d, version: e.target.value }))} />
              <select value={draft.kind} onChange={(e) => setDraft((d) => ({ ...d, kind: e.target.value as ConnectorConfig['kind'] }))}>
                <option value="REST">REST</option>
                <option value="GraphQL">GraphQL</option>
                <option value="DB">DB</option>
                <option value="Storage">Storage</option>
              </select>
            </div>

            <div className="field-editor">
              <div className="field-row">
                <input
                  placeholder="URL / DSN"
                  value={draft.request?.url ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, request: { ...(d.request ?? {}), url: e.target.value } }))}
                />
                {draft.kind === 'REST' && (
                  <select
                    value={draft.request?.method ?? 'GET'}
                    onChange={(e) => setDraft((d) => ({ ...d, request: { ...(d.request ?? {}), method: e.target.value } }))}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                )}
                <input
                  placeholder="Headers JSON"
                  value={draft.request?.headers ? JSON.stringify(draft.request.headers) : ''}
                  onChange={(e) => {
                    try {
                      const parsed = e.target.value ? (JSON.parse(e.target.value) as Record<string, string>) : undefined;
                      setDraft((d) => ({ ...d, request: { ...(d.request ?? {}), headers: parsed } }));
                      setError(null);
                    } catch {
                      setError('Invalid headers JSON');
                    }
                  }}
                />
              </div>
              <div className="field-row">
                <select
                  value={draft.auth?.type ?? 'none'}
                  onChange={(e) => setDraft((d) => ({ ...d, auth: { ...(d.auth ?? {}), type: e.target.value as any } }))}
                >
                  <option value="none">Auth: none</option>
                  <option value="apiKey">Auth: API Key</option>
                  <option value="bearer">Auth: Bearer</option>
                </select>
                {draft.auth?.type === 'apiKey' && (
                  <>
                    <input placeholder="Key name" value={draft.auth.keyName ?? ''} onChange={(e) => setDraft((d) => ({ ...d, auth: { ...(d.auth ?? {}), keyName: e.target.value } }))} />
                    <input placeholder="Key value" value={draft.auth.token ?? ''} onChange={(e) => setDraft((d) => ({ ...d, auth: { ...(d.auth ?? {}), token: e.target.value } }))} />
                  </>
                )}
                {draft.auth?.type === 'bearer' && (
                  <input placeholder="Bearer token" value={draft.auth.token ?? ''} onChange={(e) => setDraft((d) => ({ ...d, auth: { ...(d.auth ?? {}), token: e.target.value } }))} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
