import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import DrivioLogo from './DrivioLogo';
import {
  LayoutDashboard,
  Users,
  Bus,
  Calendar,
  FileText,
  MapPin,
  Home,
  UserCircle,
  LogOut,
  CreditCard,
  Image as GalleryIcon
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let user = null;
  if (token) {
    try {
      user = JSON.parse(atob(token.split('.')[1]));
    } catch (_) {}
  }

  const role = user?.role || 'customer';

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={17} /> },
    { name: 'Schedules', path: '/admin/schedules', icon: <Calendar size={17} /> },
    { name: 'Vehicles', path: '/admin/vehicles', icon: <Bus size={17} /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <FileText size={17} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={17} /> },
    { name: 'Bills & Tolls', path: '/admin/bills', icon: <CreditCard size={17} /> },
    { name: 'Fleet Gallery', path: '/admin/gallery', icon: <GalleryIcon size={17} /> },
  ];

  const driverNav = [
    { name: 'Dashboard', path: '/driver/dashboard', icon: <LayoutDashboard size={17} /> },
    { name: 'My Routes', path: '/driver/routes', icon: <MapPin size={17} /> },
    { name: 'Seats Manifest', path: '/driver/seats', icon: <Bus size={17} /> },
    { name: 'Live GPS', path: '/driver/tracker', icon: <MapPin size={17} /> },
  ];

  const agentNav = [
    { name: 'Agent Trips', path: '/agent/trips', icon: <Bus size={17} /> },
    { name: 'Dashboard', path: '/agent/dashboard', icon: <LayoutDashboard size={17} /> },
  ];

  const customerNav = [
    { name: 'Home', path: '/', icon: <Home size={17} /> },
    { name: 'Search Buses', path: '/search', icon: <Bus size={17} /> },
    { name: 'My Bookings', path: '/my-bookings', icon: <FileText size={17} /> },
  ];

  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return adminNav;
      case 'driver':
        return driverNav;
      case 'agent':
        return agentNav;
      default:
        return customerNav;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside
      style={{
        width: 250,
        height: '100%',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--fe-border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="p-3 border-bottom" style={{ borderColor: 'var(--fe-border)' }}>
        <DrivioLogo size={24} />
      </div>

      <div className="flex-grow-1 p-2 overflow-auto">
        <div className="text-uppercase text-muted px-3 py-2" style={{ fontSize: '0.6875rem', letterSpacing: '0.04em', fontWeight: 600 }}>
          Navigation
        </div>
        <nav className="d-flex flex-column gap-1">
          {getNavItems().map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `d-flex align-items-center gap-2 px-3 py-2 text-decoration-none rounded ${
                  isActive ? 'fw-semibold' : 'text-secondary'
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'var(--fe-accent-subtle)' : 'transparent',
                color: isActive ? 'var(--drivio-blue)' : 'var(--fe-text-secondary)',
                fontSize: '0.8125rem',
                height: 36,
                transition: 'background-color 120ms ease, color 120ms ease',
              })}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-3 border-top d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--fe-border)' }}>
        <div className="d-flex align-items-center gap-2 overflow-hidden">
          <UserCircle size={28} color="var(--fe-text-muted)" style={{ flexShrink: 0 }} />
          <div className="overflow-hidden">
            <div className="small fw-semibold text-truncate" style={{ fontSize: '0.8125rem', color: 'var(--fe-text-primary)' }}>
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </div>
            <div className="text-muted text-capitalize" style={{ fontSize: '0.6875rem' }}>
              {role}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-sm btn-outline-secondary p-1 border-0"
          title="Log out"
        >
          <LogOut size={16} color="var(--fe-text-muted)" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;