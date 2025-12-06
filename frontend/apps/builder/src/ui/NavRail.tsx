import { NavLink } from 'react-router-dom';

type NavRailProps = {
  selectedApp?: string | null;
};

export function NavRail({ selectedApp }: NavRailProps) {
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
      <NavLink title="Workflows" className="nav-item icon" to="/workflows">
        🔀
      </NavLink>
      <NavLink title="Users" className="nav-item icon" to="/users">
        👥
      </NavLink>
      <NavLink title="Deployments" className="nav-item icon" to="/deployments">
        ☁️
      </NavLink>
    </aside>
  );
}


