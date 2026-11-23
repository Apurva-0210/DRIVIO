import React from 'react';
import { Link } from 'react-router-dom';
import DrivioLogo from './DrivioLogo';
import { ShieldCheck, Clock, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--fe-border)', marginTop: 'auto' }}>
      <div className="container py-5">
        <div className="row g-4 justify-content-between">
          <div className="col-lg-4 col-md-6">
            <div className="mb-3">
              <DrivioLogo size={28} />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--fe-text-secondary)', maxWidth: 320, lineHeight: 1.6 }}>
              Intercity passenger transit network and fleet operations. Verified scheduled departures, seat selection, and digital ticketing.
            </p>
            <div className="d-flex flex-wrap align-items-center gap-3 mt-3 text-muted" style={{ fontSize: '0.75rem' }}>
              <div className="d-flex align-items-center gap-1">
                <ShieldCheck size={14} color="var(--fe-success)" />
                <span>256-Bit SSL Secured</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <Clock size={14} color="var(--drivio-blue)" />
                <span>AIS-140 Certified GPS</span>
              </div>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fe-text-primary)', marginBottom: 12 }}>
              Booking
            </div>
            <ul className="list-unstyled mb-0 d-flex flex-column gap-2" style={{ fontSize: '0.8125rem' }}>
              <li><Link to="/search" className="text-decoration-none" style={{ color: 'var(--fe-text-secondary)' }}>Search routes</Link></li>
              <li><Link to="/gallery" className="text-decoration-none" style={{ color: 'var(--fe-text-secondary)' }}>Fleet gallery</Link></li>
              <li><Link to="/testimonials" className="text-decoration-none" style={{ color: 'var(--fe-text-secondary)' }}>Traveler reviews</Link></li>
              <li><Link to="/track-bus" className="text-decoration-none" style={{ color: 'var(--fe-text-secondary)' }}>Track your bus</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-3 col-6">
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fe-text-primary)', marginBottom: 12 }}>
              Popular corridors
            </div>
            <ul className="list-unstyled mb-0 d-flex flex-column gap-2" style={{ fontSize: '0.8125rem' }}>
              <li><Link to="/search?source=Patna&destination=Purnea" className="text-decoration-none" style={{ color: 'var(--fe-text-secondary)' }}>Patna → Purnea</Link></li>
              <li><Link to="/search?source=Delhi&destination=Jaipur" className="text-decoration-none" style={{ color: 'var(--fe-text-secondary)' }}>Delhi → Jaipur</Link></li>
              <li><Link to="/search?source=Mumbai&destination=Pune" className="text-decoration-none" style={{ color: 'var(--fe-text-secondary)' }}>Mumbai → Pune</Link></li>
              <li><Link to="/search?source=Bengaluru&destination=Chennai" className="text-decoration-none" style={{ color: 'var(--fe-text-secondary)' }}>Bengaluru → Chennai</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fe-text-primary)', marginBottom: 12 }}>
              Operations & support
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--fe-text-secondary)', lineHeight: 1.6 }}>
              <div className="d-flex align-items-start gap-2 mb-2">
                <MapPin size={15} className="mt-1" style={{ flexShrink: 0, color: 'var(--fe-text-muted)' }} />
                <span>Sector 62, Noida, Uttar Pradesh 201301</span>
              </div>
              <div className="mb-1">
                Support: <a href="mailto:support@drivio.com" className="text-decoration-none" style={{ color: 'var(--drivio-blue)' }}>support@drivio.com</a>
              </div>
              <div>
                Helpline: <a href="tel:+912067186800" className="text-decoration-none tabular-nums" style={{ color: 'var(--fe-text-primary)', fontWeight: 600 }}>(020) 67186800</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-top mt-4 pt-3 d-flex flex-wrap justify-content-between align-items-center" style={{ borderColor: 'var(--fe-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--fe-text-muted)' }}>
            © {new Date().getFullYear()} DRIVIO Transit Technologies. All rights reserved.
          </div>
          <div className="d-flex gap-3" style={{ fontSize: '0.75rem' }}>
            <Link to="/contact" className="text-decoration-none" style={{ color: 'var(--fe-text-muted)' }}>Contact</Link>
            <Link to="/testimonials" className="text-decoration-none" style={{ color: 'var(--fe-text-muted)' }}>Reviews</Link>
            <span style={{ color: 'var(--fe-text-muted)' }}>Security & Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}