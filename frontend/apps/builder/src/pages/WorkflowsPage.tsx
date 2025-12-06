import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createWorkflow, listWorkflows, updateWorkflow, type WorkflowConfig } from '../services/workflowService';

type WorkflowRow = { id?: string; config: WorkflowConfig };
type WorkflowsPageProps = { global?: boolean };

const blankWorkflow = (): WorkflowConfig => ({
  name: '',
  version: '0.0.1',
  description: '',
  pageRef: ''
});

export function WorkflowsPage({ global }: WorkflowsPageProps) {
  const { appId } = useParams();
  const [workflows, setWorkflows] = useState<WorkflowRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState<WorkflowConfig>(blankWorkflow());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(() => workflows.find((w) => w.id === selectedId) ?? workflows[0], [workflows, selectedId]);

  useEffect(() => {
    if (!appId) return;
    setLoading(true);
    setError(null);
    listWorkflows(appId)
      .then((rows) => {
        setWorkflows(rows.map((r) => ({ id: r.dto.id, config: r.config })));
        if (rows.length > 0) {
          setSelectedId(rows[0].dto.id);
          setDraft(rows[0].config);
        }
      })
      .catch(() => setError('Failed to load workflows'))
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
        const updated = await updateWorkflow(appId, selected.id, draft);
        setWorkflows((prev) => prev.map((w) => (w.id === selected.id ? { id: updated.dto.id, config: updated.config } : w)));
      } else {
        const created = await createWorkflow(appId, draft);
        setWorkflows((prev) => [{ id: created.dto.id, config: created.config }, ...prev]);
        setSelectedId(created.dto.id);
      }
    } catch {
      setError('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const newWf = () => {
    setSelectedId(undefined);
    setDraft(blankWorkflow());
  };

  if (!appId && !global) {
    return <div className="panel-placeholder error">No app selected.</div>;
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>{global ? 'Global Workflows' : 'Workflows'}</h3>
        <div className="inline-form">
          <button className="ghost small" onClick={newWf}>+ New Workflow</button>
          <button className="ghost small" onClick={save} disabled={saving || !draft.name.trim()}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="panel-placeholder">Loading workflows...</div>
      ) : error ? (
        <div className="panel-placeholder error">{error}</div>
      ) : (
        <div className="entity-grid">
          <div className="entity-list">
            {workflows.length === 0 && <div className="muted">No workflows yet.</div>}
            {workflows.map((w) => (
              <div key={w.id} className={`list-row ${w.id === selectedId ? 'active' : ''}`} onClick={() => setSelectedId(w.id)}>
                <div>
                  <div className="title">{w.config.name}</div>
                  <div className="muted small">v{w.config.version}</div>
                  {w.config.pageRef && <div className="muted small">Page: {w.config.pageRef}</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="entity-editor">
            <div className="inline-form">
              <input placeholder="Name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
              <input placeholder="Version" value={draft.version} onChange={(e) => setDraft((d) => ({ ...d, version: e.target.value }))} />
              <input placeholder="Page ref" value={draft.pageRef ?? ''} onChange={(e) => setDraft((d) => ({ ...d, pageRef: e.target.value }))} />
            </div>
            <textarea
              placeholder="Description"
              value={draft.description ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  );
}
