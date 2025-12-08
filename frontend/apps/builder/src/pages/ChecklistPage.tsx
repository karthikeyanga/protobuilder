type ChecklistItem = { id: string; title: string; desc: string; action: string };

const defaultChecklist: ChecklistItem[] = [
  { id: 'entities', title: 'Define Entities', desc: 'Model fields, constraints, hints.', action: 'Open Entities' },
  { id: 'connectors', title: 'Set up Connectors', desc: 'REST/GraphQL/DB/storage + auth.', action: 'Open Connectors' },
  { id: 'workflows', title: 'Define Workflows', desc: 'Map tasks to pages, signals.', action: 'Open Workflows' },
  { id: 'pages', title: 'Build Pages', desc: 'Forms, lists, bindings, validations.', action: 'Open Pages' },
  { id: 'widgets', title: 'Create Widgets', desc: 'Reusable UI with inputs/outputs.', action: 'Open Widgets' },
  { id: 'permissions', title: 'Permissions', desc: 'Roles, page/action access, tasks.', action: 'Set Permissions' },
  { id: 'theme', title: 'Theme & Nav', desc: 'Branding, navigation, route exposure.', action: 'Theme & Nav' },
  { id: 'release', title: 'Test & Release', desc: 'Mocks, approvals, deploy/export.', action: 'Release' }
];

import { useNavigate, useParams } from 'react-router-dom';

type ChecklistPageProps = {
  appName: string | null;
};

export function ChecklistPage({ appName }: ChecklistPageProps) {
  const navigate = useNavigate();
  const params = useParams();
  const appId = params.appId ?? 'untitled-app';
  const appLabel = appName || params.appId || 'this app';

  const goTo = (id: string) => {
    switch (id) {
      case 'entities':
        navigate(`/apps/${appId}/entities`);
        break;
      case 'connectors':
        navigate(`/apps/${appId}/connectors`);
        break;
      case 'workflows':
        navigate(`/apps/${appId}/workflows`);
        break;
      case 'pages':
        navigate(`/apps/${appId}/pages`);
        break;
      case 'widgets':
        navigate(`/apps/${appId}/widgets`);
        break;
      case 'permissions':
        navigate(`/apps/${appId}/permissions`);
        break;
      case 'theme':
        navigate(`/apps/${appId}/theme`);
        break;
      case 'release':
        navigate(`/apps/${appId}/editor`);
        break;
      default:
        navigate(`/apps/${appId}/editor`);
    }
  };

  return (
    <div className="checklist-grid">
      {defaultChecklist.map((item) => (
        <div key={item.id} className="check-card">
          <div className="check-title">{item.title}</div>
          <div className="check-desc">{item.desc}</div>
          <button className="ghost small" onClick={() => goTo(item.id)}>
            {item.action}
            {` for ${appLabel}`}
          </button>
        </div>
      ))}
    </div>
  );
}


