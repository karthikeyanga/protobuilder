import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createEntity, listEntities, updateEntity, deleteEntity, type EntityConfig, type EntityField } from '../services/entityService';
import { JsonEditor } from 'jsoneditor-react';
import 'jsoneditor/dist/jsoneditor.css';

type EntityRow = { id?: string; config: EntityConfig };
type FieldDraft = EntityField;

const blankField = (): FieldDraft => ({
  name: '',
  kind: 'primitive',
  type: 'string',
  ref: '',
  constraints: { required: false },
  display: {}
});

export function EntitiesPage() {
  const { appId } = useParams();
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<EntityConfig>({ name: '', version: '0.0.1', fields: [] });
  const [fieldDraft, setFieldDraft] = useState<FieldDraft>(blankField());
  const [editorMode, setEditorMode] = useState<'ui' | 'json'>('ui');
  const selected = useMemo(() => entities.find((e) => e.id === selectedId), [entities, selectedId]);
  const entityNames = useMemo(() => entities.map((e) => e.config.name).filter(Boolean), [entities]);

  useEffect(() => {
    if (!appId) return;
    setLoading(true);
    setError(null);
    listEntities(appId)
      .then((rows) => {
        setEntities(rows.map((r) => ({ id: r.dto.id, config: r.config })));
        if (rows.length > 0) {
          setSelectedId(rows[0].dto.id);
          setDraft(rows[0].config);
        } else {
          setDraft({ name: '', version: '0.0.1', fields: [] });
        }
      })
      .catch(() => setError('Failed to load entities'))
      .finally(() => setLoading(false));
  }, [appId]);

  useEffect(() => {
    if (selected) {
      setDraft(selected.config);
    } else if (entities.length === 0) {
      setDraft({ name: '', version: '0.0.1', fields: [] });
    }
  }, [selected, entities.length]);

  const addField = () => {
    if (!fieldDraft.name.trim()) return;
    setDraft((d) => ({ ...d, fields: [...d.fields, fieldDraft] }));
    setFieldDraft(blankField());
  };

  const removeField = (name: string) => setDraft((d) => ({ ...d, fields: d.fields.filter((f) => f.name !== name) }));

  const saveEntity = async () => {
    if (!appId) return;
    setSaving(true);
    setError(null);
    try {
      if (selected?.id) {
        const updated = await updateEntity(appId, selected.id, draft);
        setEntities((prev) => prev.map((e) => (e.id === selected.id ? { id: updated.dto.id, config: updated.config } : e)));
      } else {
        const created = await createEntity(appId, draft);
        setEntities((prev) => [{ id: created.dto.id, config: created.config }, ...prev]);
        setSelectedId(created.dto.id);
      }
    } catch {
      setError('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const saveDraftLocal = () => {
    if (!appId || !draft.name) return;
    localStorage.setItem(`pb:${appId}:entity:${draft.name}`, JSON.stringify(draft));
  };

  const loadDraftLocal = () => {
    if (!appId || !draft.name) return;
    const raw = localStorage.getItem(`pb:${appId}:entity:${draft.name}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as EntityConfig;
        setDraft(parsed);
      } catch {
        /* ignore */
      }
    }
  };

  const newEntity = () => {
    setSelectedId(undefined);
    setDraft({ name: '', version: '0.0.1', fields: [] });
  };

  if (!appId) return <div className="panel-placeholder error">No app selected.</div>;

  return (
    <div className="panel entity-panel">
      <div className="panel-header">
        <h3>Entities</h3>
        <div className="inline-form">
          <button className="ghost small" onClick={newEntity}>+ New Entity</button>
          <button className="ghost small" onClick={saveDraftLocal} disabled={!draft.name.trim()}>Save Draft (local)</button>
          <button className="ghost small" onClick={loadDraftLocal} disabled={!draft.name.trim()}>Load Draft</button>
          <button className="ghost small" onClick={saveEntity} disabled={saving || !draft.name.trim()}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="panel-placeholder">Loading entities...</div>
      ) : error ? (
        <div className="panel-placeholder error">{error}</div>
      ) : (
        <div className="entity-layout">
          <div className="entity-list-pane">
            <div className="pane-title">Entities</div>
            {entities.length === 0 && <div className="muted">No entities yet.</div>}
            {entities.map((e) => (
              <div
                key={e.id}
                className={`list-row ${e.id === selectedId ? 'active' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(e.id)}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    setSelectedId(e.id);
                  }
                }}
              >
                <div>
                  <div className="title">{e.config.name}</div>
                  <div className="muted">v{e.config.version}</div>
                  <div className="muted small">{e.config.fields.length} fields</div>
                </div>
                <button
                  className="ghost small"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    if (!window.confirm('Delete this entity?')) return;
                    deleteEntity(appId, e.id)
                      .then(() => {
                        setEntities((prev) => {
                          const next = prev.filter((en) => en.id !== e.id);
                          const nextSelected = next[0]?.id;
                          setSelectedId((sid) => (sid === e.id ? nextSelected : sid));
                          return next;
                        });
                        setStatusMsg?.('Deleted entity'); // optional external setter
                      })
                      .catch(() => setError('Delete failed'));
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="entity-editor-pane">
            <div className="editor-tabs">
              <button className={editorMode === 'ui' ? 'active' : ''} onClick={() => setEditorMode('ui')}>
                Form
              </button>
              <button className={editorMode === 'json' ? 'active' : ''} onClick={() => setEditorMode('json')}>
                JSON
              </button>
            </div>

            {editorMode === 'ui' ? (
              <div className="form-pane stack">
                <div className="inline-form">
                  <input placeholder="Name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                  <input placeholder="Version" value={draft.version} onChange={(e) => setDraft((d) => ({ ...d, version: e.target.value }))} />
                </div>

                <div className="field-editor">
                  <div className="field-row">
                    <input placeholder="Field name" value={fieldDraft.name} onChange={(e) => setFieldDraft((f) => ({ ...f, name: e.target.value }))} />
                    <select value={fieldDraft.kind} onChange={(e) => setFieldDraft((f) => ({ ...f, kind: e.target.value as FieldDraft['kind'] }))}>
                      <option value="primitive">Primitive</option>
                      <option value="object">Object</option>
                      <option value="reference">Reference</option>
                      <option value="list">List</option>
                    </select>
                    {fieldDraft.kind === 'primitive' && (
                      <select value={fieldDraft.type} onChange={(e) => setFieldDraft((f) => ({ ...f, type: e.target.value }))}>
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="date">date</option>
                      </select>
                    )}
                    {fieldDraft.kind === 'reference' && (
                      <>
                        <select
                          value={fieldDraft.ref ?? ''}
                          onChange={(e) => setFieldDraft((f) => ({ ...f, ref: e.target.value }))}
                        >
                          <option value="">Select entity</option>
                          {entityNames.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                        <select value={fieldDraft.cardinality ?? 'one'} onChange={(e) => setFieldDraft((f) => ({ ...f, cardinality: e.target.value as 'one' | 'many' }))}>
                          <option value="one">one</option>
                          <option value="many">many</option>
                        </select>
                      </>
                    )}
                    {fieldDraft.kind === 'list' && (
                      <select
                        value={fieldDraft.ref ?? ''}
                        onChange={(e) => setFieldDraft((f) => ({ ...f, ref: e.target.value }))}
                      >
                        <option value="">Select item entity</option>
                        {entityNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    )}
                    <label className="checkbox-inline">
                      <input
                        type="checkbox"
                        checked={Boolean(fieldDraft.constraints?.required)}
                        onChange={(e) => setFieldDraft((f) => ({ ...f, constraints: { ...(f.constraints ?? {}), required: e.target.checked } }))}
                      /> required
                    </label>
                    <button className="ghost small" onClick={addField} disabled={!fieldDraft.name.trim()}>
                      Add field
                    </button>
                  </div>
                  <div className="field-row">
                    <input
                      placeholder="Min"
                      type="number"
                      value={fieldDraft.constraints?.min ?? ''}
                      onChange={(e) => setFieldDraft((f) => ({ ...f, constraints: { ...(f.constraints ?? {}), min: e.target.value ? Number(e.target.value) : undefined } }))}
                    />
                    <input
                      placeholder="Max"
                      type="number"
                      value={fieldDraft.constraints?.max ?? ''}
                      onChange={(e) => setFieldDraft((f) => ({ ...f, constraints: { ...(f.constraints ?? {}), max: e.target.value ? Number(e.target.value) : undefined } }))}
                    />
                    <input
                      placeholder="Allowed values (comma)"
                      value={(fieldDraft.constraints?.allowedValues ?? []).join(',')}
                      onChange={(e) =>
                        setFieldDraft((f) => ({
                          ...f,
                          constraints: {
                            ...(f.constraints ?? {}),
                            allowedValues: e.target.value ? e.target.value.split(',').map((v) => v.trim()).filter(Boolean) : undefined
                          }
                        }))
                      }
                    />
                    <input
                      placeholder="Regex pattern"
                      value={fieldDraft.constraints?.pattern ?? ''}
                      onChange={(e) => setFieldDraft((f) => ({ ...f, constraints: { ...(f.constraints ?? {}), pattern: e.target.value || undefined } }))}
                    />
                    <input
                      placeholder="Derived expression"
                      value={fieldDraft.derivedFrom ?? ''}
                      onChange={(e) => setFieldDraft((f) => ({ ...f, derivedFrom: e.target.value || undefined }))}
                    />
                  </div>
                  <div className="field-row">
                    <input
                      placeholder="Label"
                      value={fieldDraft.display?.label ?? ''}
                      onChange={(e) => setFieldDraft((f) => ({ ...f, display: { ...(f.display ?? {}), label: e.target.value || undefined } }))}
                    />
                    <input
                      placeholder="Description"
                      value={fieldDraft.display?.description ?? ''}
                      onChange={(e) => setFieldDraft((f) => ({ ...f, display: { ...(f.display ?? {}), description: e.target.value || undefined } }))}
                    />
                    <input
                      placeholder="Placeholder"
                      value={fieldDraft.display?.placeholder ?? ''}
                      onChange={(e) => setFieldDraft((f) => ({ ...f, display: { ...(f.display ?? {}), placeholder: e.target.value || undefined } }))}
                    />
                    <input
                      placeholder="Hint"
                      value={fieldDraft.display?.hint ?? ''}
                      onChange={(e) => setFieldDraft((f) => ({ ...f, display: { ...(f.display ?? {}), hint: e.target.value || undefined } }))}
                    />
                  </div>
                </div>

                <div className="list">
                  {draft.fields.length === 0 && <div className="muted">No fields added.</div>}
                  {draft.fields.map((f) => (
                    <div key={f.name} className="list-row">
                      <div>
                        <div className="title">
                          {f.name} <span className="muted small">({f.kind}{f.type ? `:${f.type}` : ''}{f.ref ? `→${f.ref}` : ''}{f.cardinality ? `/${f.cardinality}` : ''})</span>
                        </div>
                        <div className="muted small">
                          {f.constraints?.required ? 'required ' : ''}
                          {f.constraints?.min !== undefined ? `min:${f.constraints.min} ` : ''}
                          {f.constraints?.max !== undefined ? `max:${f.constraints.max} ` : ''}
                          {f.constraints?.allowedValues ? `enum:${f.constraints.allowedValues.join('|')} ` : ''}
                          {f.constraints?.pattern ? `regex:${f.constraints.pattern}` : ''}
                        </div>
                        {f.derivedFrom && <div className="muted small">derived: {f.derivedFrom}</div>}
                      </div>
                      <button className="ghost small" onClick={() => removeField(f.name)}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="json-pane">
                <div className="pane-title">JSON Editor</div>
                <div className="json-editor">
                  <JsonEditor
                    value={draft}
                    onChange={(next) => setDraft(next as EntityConfig)}
                    mode="tree"
                    allowedModes={['tree', 'code']}
                    mainMenuBar={false}
                    statusBar
                    navigationBar
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
