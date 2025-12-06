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
  );
}


