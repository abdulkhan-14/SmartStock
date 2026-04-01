import { NavLink } from 'react-router-dom';

const navStyle = {
  backgroundColor: '#1F4E79',
  padding: '0 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '60px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
};

const brandStyle = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '700',
  textDecoration: 'none',
  letterSpacing: '0.5px',
};

const linksStyle = {
  display: 'flex',
  gap: '8px',
};

const linkStyle = {
  color: '#cce0f5',
  textDecoration: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '15px',
  fontWeight: '500',
  transition: 'background-color 0.2s, color 0.2s',
};

const activeLinkStyle = {
  ...linkStyle,
  backgroundColor: 'rgba(255,255,255,0.15)',
  color: '#ffffff',
};

export default function Navbar() {
  return (
    <nav style={navStyle}>
      <NavLink to="/" style={brandStyle}>
        SmartStock
      </NavLink>
      <div style={linksStyle}>
        <NavLink
          to="/"
          end
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/inventory"
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          Inventory
        </NavLink>
        <NavLink
          to="/alerts"
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          Alerts
        </NavLink>
      </div>
    </nav>
  );
}
