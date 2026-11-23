import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import { User, Mail, Phone, Award, Calendar, Shield, Bus } from 'lucide-react';

export default function Profile() {
  const nav = useNavigate();
  const location = useLocation();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      nav('/login');
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const r = await api.get('/auth/me');
        setMe(r.data || null);
      } catch {
        setMe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [nav, location]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
        <div className="text-muted small">Loading account profile…</div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">Unable to load profile data.</p>
        <Link to="/login" className="btn btn-accent btn-sm">
          Log in again
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <div className="mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--fe-border)' }}>
        <h2 className="mb-1" style={{ fontSize: '1.375rem' }}>
          Account Profile
        </h2>
        <div className="text-muted small">
          Passenger credentials and loyalty points status
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--fe-border)' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--fe-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '1.25rem',
            }}
          >
            {me.name ? me.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="fw-bold" style={{ fontSize: '1.125rem' }}>
              {me.name}
            </div>
            <div className="text-muted small">{me.email}</div>
            <span className="badge badge-subtle-primary text-capitalize mt-1">
              {me.role} Member
            </span>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-1 text-muted small">
              <Mail size={14} />
              <span>Email address</span>
            </div>
            <div className="fw-medium text-truncate">{me.email}</div>
          </div>

          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-1 text-muted small">
              <Phone size={14} />
              <span>Phone number</span>
            </div>
            <div className="fw-medium tabular-nums">{me.phone || '—'}</div>
          </div>

          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-1 text-muted small">
              <Award size={14} color="var(--drivio-blue)" />
              <span>DRIVIO transit points</span>
            </div>
            <div className="fw-bold tabular-nums" style={{ color: 'var(--drivio-blue)' }}>
              {me.points ?? 0} points
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-1 text-muted small">
              <Calendar size={14} />
              <span>Registered date</span>
            </div>
            <div className="fw-medium tabular-nums">
              {me.created_at ? new Date(me.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Active'}
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2">
        <Link to="/my-bookings" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
          <Bus size={13} />
          <span>View my bookings</span>
        </Link>
        <Link to="/search" className="btn btn-accent btn-sm">
          Book a new journey
        </Link>
      </div>
    </div>
  );
}