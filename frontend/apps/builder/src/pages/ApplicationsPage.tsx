import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApps, deleteApp, createApp, type AppSummary } from '../services/appService';

type ApplicationsPageProps = {
  onSelectApp: (id: string, name: string) => void;
};

export function ApplicationsPage({ onSelectApp }: ApplicationsPageProps) {
  const [apps, setApps] = useState<AppSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApps()
      .then((data) => setApps(data))
      .catch(() => setError('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (a: AppSummary) => {
    const appName = a.id === 'new' ? 'Untitled App' : a.name;
    onSelectApp(a.id, appName);
    if (a.id !== 'new') {
      navigate(`/apps/${a.id}/editor`);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === 'new') return;
    const ok = window.confirm('Delete this app?');
    if (!ok) return;
    try {
      await deleteApp(id);
      setApps((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError('Failed to delete app');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim() || 'Untitled App';
    try {
      const summary = await createApp(name, { appId: '', version: '0.0.1', entities: [], connectors: [], pages: [], widgets: [], workflows: [] });
      setApps((prev) => [{ id: summary.id, name: summary.name }, ...prev.filter((a) => a.id !== 'new')]);
      onSelectApp(summary.id, summary.name);
      navigate(`/apps/${summary.id}/checklist`);
      setNewName('');
    } catch {
      setError('Failed to create app');
    }
  };

  if (loading) {
    return <div className="panel-placeholder">Loading applications...</div>;
  }

  if (error) {
    return <div className="panel-placeholder error">{error}</div>;
  }

  return (
    <>
      <form className="inline-form apps-new-form" onSubmit={handleCreate}>
        <input
          placeholder="New app name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" className="ghost small">Create</button>
      </form>
      <div className="apps-grid">
        {apps.map((a) => (
          <div key={a.id} className={`app-card ${a.id === 'new' ? 'new' : ''}`} onClick={() => handleSelect(a)}>
            <span>{a.name}</span>
            {a.id !== 'new' && (
              <button className="icon-btn danger" aria-label="Delete app" onClick={(e) => handleDelete(a.id, e)}>
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}


