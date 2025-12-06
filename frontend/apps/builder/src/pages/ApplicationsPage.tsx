import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApps, deleteApp, type AppSummary } from '../services/appService';

type ApplicationsPageProps = {
  onSelectApp: (id: string, name: string) => void;
};

export function ApplicationsPage({ onSelectApp }: ApplicationsPageProps) {
  const [apps, setApps] = useState<AppSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApps()
      .then((data) => setApps(data))
      .catch(() => setError('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (a: AppSummary) => {
    const appName = a.id === 'new' ? 'Untitled App' : a.name;
    if (a.id === 'new') {
      navigate('/apps/new');
      return;
    }
    onSelectApp(a.id, appName);
    navigate(`/apps/${a.id}/editor`);
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

  if (loading) {
    return <div className="panel-placeholder">Loading applications...</div>;
  }

  if (error) {
    return <div className="panel-placeholder error">{error}</div>;
  }

  return (
    <div className="apps-page">
      <div className="app-hero">
        <div>
          <h2>Applications</h2>
          <p className="muted">Create, open, and manage what you build in ProtoBuilder.</p>
        </div>
        <button className="primary" onClick={() => handleSelect({ id: 'new', name: '+ New Application' })}>
          + New Application
        </button>
      </div>
      <div className="apps-grid">
        {apps.map((a) => (
          <div key={a.id} className={`app-card ${a.id === 'new' ? 'new' : ''}`} onClick={() => handleSelect(a)}>
            <div className="app-card-header">
              <span className="app-name">{a.name}</span>
              {a.id !== 'new' && (
                <button className="icon-btn danger" aria-label="Delete app" onClick={(e) => handleDelete(a.id, e)}>
                  ×
                </button>
              )}
            </div>
            {a.id !== 'new' && <p className="muted small">Click to open in the builder</p>}
            {a.id === 'new' && <p className="muted small">Start with name, description, theme, connectors</p>}
          </div>
        ))}
      </div>
    </div>
  );
}


