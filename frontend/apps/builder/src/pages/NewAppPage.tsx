import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApp } from '../services/appService';

type NewAppPageProps = {
  onCreated: (id: string, name: string) => void;
};

export function NewAppPage({ onCreated }: NewAppPageProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [initialPage, setInitialPage] = useState('Page1');
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
        pages: [initialPage],
        pageLayouts: { [initialPage]: [] },
        widgets: [],
        workflows: []
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
          <p className="eyebrow">Applications</p>
          <h1>Spin up a new application</h1>
          <p className="muted">Name it, add context, and we will scaffold the first page for you. You can refine entities, connectors, and workflows after creation.</p>
        </div>
        <button className="ghost" type="button" onClick={() => navigate('/apps')}>
          ← Back to list
        </button>
      </div>

      <div className="new-app-grid">
        <div className="card glass stack">
          <h3>Application details</h3>
          <p className="muted">We’ll name your config, routes, and exports from these basics.</p>
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
            <label>
              First page name
              <input
                placeholder="e.g., IntakeForm"
                value={initialPage}
                onChange={(e) => setInitialPage(e.target.value || 'Page1')}
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

        <div className="card outline stack">
          <h4>What happens after create</h4>
          <ul className="checklist">
            <li>We take you to the Checklist to set entities, connectors, and pages.</li>
            <li>Your first page is scaffolded; drag-and-drop controls and snap-to-grid are ready.</li>
            <li>Workflows (Kogito-ready) and user tasks can be attached later.</li>
            <li>Theme tokens ship with GitHub-like light/dark palettes.</li>
          </ul>
          <div className="pill-row">
            <span className="pill">Drag & drop</span>
            <span className="pill">Autosave</span>
            <span className="pill">Soft delete</span>
            <span className="pill">Exportable</span>
          </div>
        </div>
      </div>
    </div>
  );
}

