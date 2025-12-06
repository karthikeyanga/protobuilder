import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApps, type AppSummary } from '../services/appService';

type ApplicationsPageProps = {
  onSelectApp: (id: string, name: string) => void;
};

export function ApplicationsPage({ onSelectApp }: ApplicationsPageProps) {
  const [apps, setApps] = useState<AppSummary[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApps().then(setApps);
  }, []);

  const handleSelect = (a: AppSummary) => {
    const appName = a.id === 'new' ? 'Untitled App' : a.name;
    onSelectApp(a.id, appName);
    if (a.id === 'new') {
      navigate(`/apps/${encodeURIComponent(appName)}/checklist`);
    } else {
      navigate(`/apps/${a.id}/editor`);
    }
  };

  return (
    <div className="apps-grid">
      {apps.map((a) => (
        <div key={a.id} className={`app-card ${a.id === 'new' ? 'new' : ''}`} onClick={() => handleSelect(a)}>
          {a.name}
        </div>
      ))}
    </div>
  );
}


