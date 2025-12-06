import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApp } from '../services/appService';

type NewAppPageProps = {
  onCreated: (id: string, name: string) => void;
};

export function NewAppPage({ onCreated }: NewAppPageProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim() || 'Untitled App';
    setLoading(true);
    setError(null);
    try {
      const summary = await createApp(trimmed, {
        appId: '',
        version: '0.0.1',
        entities: [],
        connectors: [],
        pages: ['Page1'],
        pageLayouts: { Page1: [] },
        widgets: [],
        workflows: [],
        description
      } as any);
      onCreated(summary.id, summary.name);
      navigate(`/apps/${summary.id}/checklist`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create app');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-app-page">
      <div className="new-app-hero">
        <div>
          <p className="eyebrow">ProtoBuilder</p>
          <h1>Spin up a new application</h1>
          <p className="muted">Name it, add context, and we will scaffold pages, entities, and connectors.</p>
        </div>
        <div className="hero-badges">
          <span className="badge">GitHub theme</span>
          <span className="badge">Drag & drop UI</span>
          <span className="badge">Workflow-ready</span>
        </div>
      </div>

      <div className="new-app-grid">
        <div className="card glass">
          <div className="card-header">
            <div>
              <h3>Application details</h3>
              <p className="muted">We’ll use this to name the config, routes, and exports.</p>
            </div>
            <button className="ghost" type="button" onClick={() => navigate('/apps')}>
              ← Back to list
            </button>
          </div>

          <form className="form-vertical" onSubmit={handleSubmit}>
            <label>
              Application name
              <input
                required
                placeholder="e.g., Claims Intake Portal"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Description (optional)
              <textarea
                placeholder="What does this app do?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </label>
            {error && <div className="panel-placeholder error">{error}</div>}
            <div className="actions space-between">
              <button type="button" className="ghost" onClick={() => navigate('/apps')} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="primary" disabled={loading}>
                {loading ? 'Creating…' : 'Create app'}
              </button>
            </div>
          </form>
        </div>

        <div className="card outline">
          <h4>What you’ll configure next</h4>
          <ul className="checklist">
            <li>Entities with nested fields, constraints, enums, and references</li>
            <li>Data connectors (REST/GraphQL/DB) and auth profiles</li>
            <li>Pages with drag-and-drop controls and snap-to-grid</li>
            <li>Workflows (Kogito-ready) with user tasks and actions</li>
            <li>Theme tokens and GitHub-like light/dark palettes</li>
          </ul>
          <div className="pill-row">
            <span className="pill">Autosave</span>
            <span className="pill">Soft delete</span>
            <span className="pill">Exportable</span>
          </div>
        </div>
      </div>
    </div>
  );
}

