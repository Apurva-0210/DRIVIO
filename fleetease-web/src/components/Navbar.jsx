import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import DrivioLogo from './DrivioLogo';
import { Phone, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const nav = useNavigate();
  const token = localStorage.getItem('token');
  let role = null;
  if (token) {
    try {
      role = JSON.parse(atob(token.split('.')[1]))?.role || null;
    } catch (_) {}
  }
  const [me, setMe] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!token) {
      setMe(null);
      return;
    }
    api
      .get('/auth/me')
      .then((r) => {
        if (alive) setMe(r.data || null);
      })
      .catch(() => {
        if (alive) setMe(null);
      });

    return () => {
      alive = false;
    };
  }, [token]);

  const logout = () => {
    localStorage.removeItem('token');
    setMe(null);
    window.location.href = '/login';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-drivio sticky-top">
      <div className="container-fluid px-3 px-lg-4">
        <Link className="navbar-brand me-4" to="/" style={{ textDecoration: 'none' }}>
          <DrivioLogo size={28} />
        </Link>

        <button
          className="navbar-toggler border-0 p-1"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarsMain"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarsMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
            {role === 'admin' && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin/dashboard">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin/schedules">
                    Schedules
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin/vehicles">
                    Vehicles
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin/bookings">
                    Bookings
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin/users">
                    Users
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin/bills">
                    Bills
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin/refunds">
                    Refunds
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin/gallery">
                    Gallery
                  </NavLink>
                </li>
              </>
            )}

            {role === 'agent' && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/agent/dashboard">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/agent/trips">
                    Counter Bookings
                  </NavLink>
                </li>
              </>
            )}

            {role === 'driver' && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/driver/dashboard">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/driver/routes">
                    Routes
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/driver/seats">
                    Seats
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/driver/tracker">
                    Live GPS
                  </NavLink>
                </li>
              </>
            )}

            {role === 'manager' && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/manager/dashboard">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/manager/fleet">
                    Fleet & Vehicles
                  </NavLink>
                </li>
              </>
            )}

            {role === 'company_admin' && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/company/charter">
                    Charter Operations
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/company/requests">
                    Requests
                  </NavLink>
                </li>
              </>
            )}

            {role === 'customer' && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/my-bookings">
                    My Bookings & Miles
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/search">
                    Search Routes
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/track-bus">
                    Live Bus Tracking
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/gallery">
                    Fleet Gallery
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/testimonials">
                    Reviews
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/contact">
                    Contact
                  </NavLink>
                </li>
              </>
            )}

            {!role && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/">
                    Home
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/search">
                    Search Routes
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/gallery">
                    Fleet Gallery
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/testimonials">
                    Reviews
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/contact">
                    Contact
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Helpline phone link */}
            <a
              href="tel:+912067186800"
              className="d-none d-xl-flex align-items-center gap-1 text-decoration-none"
              style={{ fontSize: '0.8125rem', color: 'var(--fe-text-secondary)', fontWeight: 500 }}
            >
              <Phone size={14} color="var(--fe-text-muted)" />
              <span className="tabular-nums">(020) 67186800</span>
            </a>

            {!token ? (
              <div className="d-flex align-items-center gap-2">
                <Link
                  className="btn btn-outline-secondary"
                  to="/login"
                  style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                >
                  Log in
                </Link>
                <Link
                  className="btn btn-accent"
                  to="/register"
                  style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-2 dropdown-toggle"
                  data-bs-toggle="dropdown"
                  style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                >
                  <User size={15} />
                  <span>{me?.name || me?.email?.split('@')[0] || 'Account'}</span>
                </button>
                <div
                  className="dropdown-menu dropdown-menu-end p-2 mt-1 shadow-sm"
                  style={{ minWidth: 220, border: '1px solid var(--fe-border)', borderRadius: 'var(--fe-radius-md)' }}
                >
                  <div className="px-2 py-1">
                    <div className="fw-semibold text-truncate" style={{ fontSize: '0.875rem' }}>
                      {me?.name || 'Traveler'}
                    </div>
                    <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                      {me?.email}
                    </div>
                    <span className="badge badge-subtle-primary mt-1 text-capitalize">
                      {role || me?.role || 'User'}
                    </span>
                  </div>
                  <hr className="my-2" style={{ borderColor: 'var(--fe-border)' }} />
                  <Link className="dropdown-item py-1 px-2 rounded" to="/profile" style={{ fontSize: '0.8125rem' }}>
                    Profile settings
                  </Link>
                  {role === 'customer' && (
                    <Link className="dropdown-item py-1 px-2 rounded" to="/my-bookings" style={{ fontSize: '0.8125rem' }}>
                      My bookings
                    </Link>
                  )}
                  <button
                    className="dropdown-item py-1 px-2 rounded text-danger d-flex align-items-center gap-2 mt-1"
                    onClick={logout}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    <LogOut size={13} />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}