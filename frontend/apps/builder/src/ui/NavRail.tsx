import { NavLink } from 'react-router-dom';

type NavRailProps = {
  selectedApp?: string | null;
};

export function NavRail({ selectedApp }: NavRailProps) {
  const workflowsPath = selectedApp ? `/apps/${selectedApp}/workflows` : '/workflows';
  const usersPath = '/users';
  const deploymentsPath = '/deployments';
  return (
    <aside className="nav-rail">
      <div className="nav-title">Navigation</div>
      <NavLink title="Applications" className={({ isActive }) => `nav-item icon ${isActive ? 'active' : ''}`} to="/apps">
        🏠
      </NavLink>
      <NavLink
        title="Builder"
        className={({ isActive }) => `nav-item icon ${isActive ? 'active' : ''}`}
        to={selectedApp ? `/apps/${selectedApp}/editor` : '/apps'}
      >
        🛠
      </NavLink>
      <NavLink title="Workflows" className={({ isActive }) => `nav-item icon ${isActive ? 'active' : ''}`} to={workflowsPath}>
        🔀
      </NavLink>
      <NavLink title="Users" className={({ isActive }) => `nav-item icon ${isActive ? 'active' : ''}`} to={usersPath}>
        👥
      </NavLink>
      <NavLink title="Deployments" className={({ isActive }) => `nav-item icon ${isActive ? 'active' : ''}`} to={deploymentsPath}>
        ☁️
      </NavLink>
    </aside>
  );
}


