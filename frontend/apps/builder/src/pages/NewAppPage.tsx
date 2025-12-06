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
    <div className="panel">
      <h2>Create a new application</h2>
      <p className="muted">Give your application a name and optional description.</p>
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
        <div className="actions">
          <button type="button" className="ghost" onClick={() => navigate('/apps')} disabled={loading}>
            Cancel
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create app'}
          </button>
        </div>
      </form>
    </div>
  );
}

