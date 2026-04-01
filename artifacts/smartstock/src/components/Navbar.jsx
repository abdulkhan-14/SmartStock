import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="ss-navbar">
      <NavLink to="/" className="ss-navbar-brand">SmartStock</NavLink>
      <div className="ss-navbar-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? 'ss-nav-link ss-nav-link-active' : 'ss-nav-link'
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            isActive ? 'ss-nav-link ss-nav-link-active' : 'ss-nav-link'
          }
        >
          Inventory
        </NavLink>
        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            isActive ? 'ss-nav-link ss-nav-link-active' : 'ss-nav-link'
          }
        >
          Alerts
        </NavLink>
      </div>
    </nav>
  );
}
