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
      .catch(() => {
        setError('Failed to load applications');
        setApps([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (a: AppSummary) => {
    onSelectApp(a.id, a.name);
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

  return (
    <div className="apps-page">
      <div className="app-hero">
        <div>
          <h2>Applications</h2>
          <p className="muted">Create, open, and manage what you build in ProtoBuilder.</p>
          {error && <div className="panel-placeholder error">{error}</div>}
          {loading && !error && <div className="panel-placeholder">Loading applications...</div>}
        </div>
        <button className="primary" onClick={() => navigate('/apps/new')}>
          + New Application
        </button>
      </div>
      <div className="apps-grid">
        <div className="app-card new" onClick={() => navigate('/apps/new')}>
          <div className="app-card-header">
            <span className="app-name">+ New Application</span>
          </div>
          <p className="muted small">Start with name, description, theme, connectors</p>
        </div>
        {apps.map((a) => (
          <div key={a.id} className="app-card" onClick={() => handleSelect(a)}>
            <div className="app-card-header">
              <span className="app-name">{a.name}</span>
              <button className="icon-btn danger" aria-label="Delete app" onClick={(e) => handleDelete(a.id, e)}>
                ×
              </button>
            </div>
            <p className="muted small">Click to open in the builder</p>
          </div>
        ))}
      </div>
    </div>
  );
}


