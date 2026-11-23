import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  MapPin,
  Calendar,
  ArrowRight,
  Shield,
  Clock,
  Compass,
  Star,
  Bus,
  Search,
  CheckCircle2,
  Users,
  ArrowUpDown,
  ShieldCheck,
  Navigation,
  FileText,
  Lock
} from 'lucide-react';
import { loadGoogleMapsPlaces } from '../utils/loadGoogleMaps';

export default function Home() {
  const nav = useNavigate();
  const [source, setSource] = useState('Patna');
  const [destination, setDestination] = useState('Purnea');
  const [tripType, setTripType] = useState('oneway');
  const [dateOut, setDateOut] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [dateBack, setDateBack] = useState('');
  const [latest, setLatest] = useState([]);
  const defaultSources = ['Patna', 'Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Hyderabad', 'Pune', 'Jaipur', 'Muzaffarpur', 'Gaya', 'Chennai', 'Purnea'];
  const defaultDestinations = ['Purnea', 'Jaipur', 'Pune', 'Chennai', 'Muzaffarpur', 'Gaya', 'Chandigarh', 'Ahmedabad', 'Vijayawada', 'Siliguri', 'Delhi', 'Patna', 'Bengaluru', 'Mumbai'];

  const [places, setPlaces] = useState({
    sources: defaultSources,
    destinations: defaultDestinations
  });
  const [mapsReady, setMapsReady] = useState(
    !!(typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places)
  );
  const acRefs = useRef({});

  const handleSourceSelect = (val) => {
    setSource(val);
    if (destination === val) {
      const next = places.destinations.find((d) => d !== val) || '';
      setDestination(next);
    }
  };

  const handleDestinationSelect = (val) => {
    setDestination(val);
    if (source === val) {
      const next = places.sources.find((s) => s !== val) || '';
      setSource(next);
    }
  };

  const setupAutocomplete = (key) => (el) => {
    if (!el || acRefs.current[key]) return;
    if (!(window.google && window.google.maps && window.google.maps.places)) return;
    const ac = new window.google.maps.places.Autocomplete(el, { types: ['(cities)'] });
    ac.addListener('place_changed', () => {
      const p = ac.getPlace();
      const name = p.formatted_address || p.name || el.value;
      if (key === 'source') setSource(name);
      else setDestination(name);
    });
    acRefs.current[key] = ac;
  };

  useEffect(() => {
    const t = localStorage.getItem('token');
    let role = null;
    try {
      role = t ? JSON.parse(atob(t.split('.')[1]))?.role : null;
    } catch {}
    if (role) {
      if (role === 'admin') { nav('/admin/dashboard', { replace: true }); return; }
      if (role === 'agent') { nav('/agent/trips', { replace: true }); return; }
      if (role === 'driver') { nav('/driver/dashboard', { replace: true }); return; }
      if (role === 'manager') { nav('/manager/fleet', { replace: true }); return; }
      if (role === 'company_admin') { nav('/company/charter', { replace: true }); return; }
      if (role === 'customer') { nav('/my-bookings', { replace: true }); return; }
    }

    api
      .get('/testimonials')
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : Array.isArray(r.data?.data) ? r.data.data : [];
        setLatest(list.slice(0, 3));
      })
      .catch(() => setLatest([]));

    api
      .get('/routes/cities')
      .then((r) => {
        const sList = Array.isArray(r.data?.sources) && r.data.sources.length ? r.data.sources : defaultSources;
        const dList = Array.isArray(r.data?.destinations) && r.data.destinations.length ? r.data.destinations : defaultDestinations;
        setPlaces({
          sources: Array.from(new Set([...defaultSources, ...sList])).sort(),
          destinations: Array.from(new Set([...defaultDestinations, ...dList])).sort()
        });
      })
      .catch(() => {});

    (async () => {
      try {
        await loadGoogleMapsPlaces();
        setMapsReady(true);
      } catch {
        setMapsReady(false);
      }
    })();
  }, [nav]);

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ source, destination, tripType, dateOut, dateBack }).toString();
    nav(`/search?${params}`);
  };

  const sampleCorridors = [
    { source: 'Patna', destination: 'Purnea', time: '5h 30m', fare: '₹650', buses: '14 daily' },
    { source: 'Delhi', destination: 'Jaipur', time: '4h 45m', fare: '₹480', buses: '28 daily' },
    { source: 'Mumbai', destination: 'Pune', time: '3h 15m', fare: '₹350', buses: '36 daily' },
    { source: 'Bengaluru', destination: 'Chennai', time: '6h 00m', fare: '₹720', buses: '22 daily' },
  ];

  return (
    <div>
      {/* Unslopped Hero Section */}
      <section className="hero-transit">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-2 py-1 mb-3 rounded" style={{ background: 'var(--fe-surface-raised)', border: '1px solid var(--fe-border)', fontSize: '0.8125rem', color: 'var(--fe-text-secondary)' }}>
                <span className="route-dot" style={{ width: 6, height: 6 }}></span>
                <span>DRIVIO Intercity Bus Network & Digital Ticketing</span>
              </div>

              <h1 className="display-6 fw-bold mb-3" style={{ color: 'var(--fe-text-primary)' }}>
                Reliable intercity travel, with transparent schedules
              </h1>
              <p className="mb-4" style={{ color: 'var(--fe-text-secondary)', fontSize: '1rem', maxWidth: 560, lineHeight: 1.6 }}>
                Reserve verified seat layouts, monitor live departures, and board without printed tickets across regional corridors.
              </p>

              {/* Search Console */}
              <div
                className="p-4 bg-white"
                style={{
                  border: '1px solid var(--fe-border)',
                  borderRadius: 'var(--fe-radius-lg)',
                  boxShadow: 'var(--fe-shadow-sm)',
                }}
              >
                {/* Segmented Control */}
                <div className="d-flex gap-2 mb-3">
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{
                      background: tripType === 'oneway' ? 'var(--fe-accent)' : 'var(--fe-surface-raised)',
                      color: tripType === 'oneway' ? '#ffffff' : 'var(--fe-text-secondary)',
                      border: '1px solid',
                      borderColor: tripType === 'oneway' ? 'var(--fe-accent)' : 'var(--fe-border)',
                      padding: '4px 12px',
                    }}
                    onClick={() => setTripType('oneway')}
                  >
                    One-way
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{
                      background: tripType === 'return' ? 'var(--fe-accent)' : 'var(--fe-surface-raised)',
                      color: tripType === 'return' ? '#ffffff' : 'var(--fe-text-secondary)',
                      border: '1px solid',
                      borderColor: tripType === 'return' ? 'var(--fe-accent)' : 'var(--fe-border)',
                      padding: '4px 12px',
                    }}
                    onClick={() => setTripType('return')}
                  >
                    Round trip
                  </button>
                </div>

                <form onSubmit={submit}>
                  <div className="row g-3 align-items-end">
                    <div className="col-12 col-md-5">
                      <label className="form-label d-flex align-items-center gap-1">
                        <MapPin size={13} color="var(--fe-accent)" />
                        <span>Origin city</span>
                      </label>
                      <select
                        className="form-select"
                        value={source}
                        onChange={(e) => handleSourceSelect(e.target.value)}
                        required
                      >
                        <option value="" disabled>Select origin city</option>
                        {places.sources.filter((s) => s !== destination).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-2 d-flex justify-content-center pb-1">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-1"
                        style={{ height: 38 }}
                        title="Swap Origin and Destination"
                        onClick={() => {
                          const tmp = source;
                          setSource(destination);
                          setDestination(tmp);
                        }}
                      >
                        <ArrowUpDown size={14} />
                      </button>
                    </div>

                    <div className="col-12 col-md-5">
                      <label className="form-label d-flex align-items-center gap-1">
                        <Compass size={13} color="var(--fe-accent)" />
                        <span>Destination</span>
                      </label>
                      <select
                        className="form-select"
                        value={destination}
                        onChange={(e) => handleDestinationSelect(e.target.value)}
                        required
                      >
                        <option value="" disabled>Select destination</option>
                        {places.destinations.filter((d) => d !== source).map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className={tripType === 'return' ? 'col-6' : 'col-12 col-md-8'}>
                      <label className="form-label d-flex align-items-center gap-1">
                        <Calendar size={13} color="var(--fe-accent)" />
                        <span>Departure date</span>
                      </label>
                      <input
                        type="date"
                        className="form-control tabular-nums"
                        value={dateOut}
                        onChange={(e) => setDateOut(e.target.value)}
                        required
                      />
                    </div>

                    {tripType === 'return' && (
                      <div className="col-6">
                        <label className="form-label d-flex align-items-center gap-1">
                          <Calendar size={13} color="var(--fe-accent)" />
                          <span>Return date</span>
                        </label>
                        <input
                          type="date"
                          className="form-control tabular-nums"
                          value={dateBack}
                          onChange={(e) => setDateBack(e.target.value)}
                        />
                      </div>
                    )}

                    <div className={tripType === 'return' ? 'col-12' : 'col-12 col-md-4 d-flex align-items-end'}>
                      <button
                        type="submit"
                        className="btn btn-accent w-100 d-flex align-items-center justify-content-center gap-2"
                        style={{ height: 38 }}
                      >
                        <Search size={15} />
                        <span>Search buses</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Popular route tags */}
              <div className="d-flex align-items-center gap-2 mt-3 flex-wrap" style={{ fontSize: '0.8125rem' }}>
                <span className="text-muted">Popular:</span>
                {['Patna → Purnea', 'Delhi → Jaipur', 'Mumbai → Pune'].map((pair) => {
                  const [s, d] = pair.split(' → ');
                  return (
                    <button
                      key={pair}
                      type="button"
                      onClick={() => {
                        setSource(s);
                        setDestination(d);
                      }}
                      className="btn btn-sm btn-outline-secondary py-0 px-2"
                      style={{ fontSize: '0.75rem', height: 24, lineHeight: '22px' }}
                    >
                      {pair}
                    </button>
                  );
                })}
              </div>

              {/* Hero Security & Compliance Reassurance */}
              <div className="d-flex align-items-center gap-3 mt-3 flex-wrap text-muted" style={{ fontSize: '0.75rem' }}>
                <span className="d-inline-flex align-items-center gap-1">
                  <ShieldCheck size={14} color="#10B981" />
                  <span style={{ color: 'var(--fe-text-primary)', fontWeight: 600 }}>256-Bit SSL</span> Encrypted
                </span>
                <span>•</span>
                <span className="d-inline-flex align-items-center gap-1">
                  <Navigation size={13} color="#246BFD" />
                  <span style={{ color: 'var(--fe-text-primary)', fontWeight: 600 }}>AIS-140</span> Certified GPS
                </span>
                <span>•</span>
                <span className="d-inline-flex align-items-center gap-1">
                  <CheckCircle2 size={13} color="#0EA5E9" />
                  Manifest Guaranteed
                </span>
              </div>
            </div>

            {/* Right Side Moment: Tactile Departures Board Preview */}
            <div className="col-lg-5">
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--fe-border)',
                  borderRadius: 'var(--fe-radius-xl)',
                  boxShadow: 'var(--fe-shadow-md)',
                  padding: 24,
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--fe-border)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--fe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Live Departure Board
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--fe-text-primary)' }}>
                      Patna Intercity Terminal
                    </div>
                  </div>
                  <span className="badge badge-subtle-success d-flex align-items-center gap-1">
                    <span className="route-dot" style={{ width: 6, height: 6, background: 'var(--fe-success)' }}></span>
                    <span>On Schedule</span>
                  </span>
                </div>

                {/* Departure Card 1 */}
                <div
                  className="p-3 mb-3 rounded"
                  style={{ background: 'var(--fe-surface-raised)', border: '1px solid var(--fe-border)' }}
                >
                  <div className="d-flex justify-content-between align-items-baseline mb-2">
                    <div className="fw-semibold" style={{ fontSize: '0.9375rem' }}>
                      Express Coach #BR-01-2024
                    </div>
                    <div className="price fw-semibold" style={{ color: 'var(--fe-accent)', fontSize: '1rem' }}>
                      ₹650
                    </div>
                  </div>

                  {/* Route Connector Line */}
                  <div className="d-flex align-items-center justify-content-between my-2">
                    <div>
                      <div className="time-stamp fw-semibold" style={{ fontSize: '1.125rem' }}>07:30</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Patna Junction</div>
                    </div>

                    <div className="flex-grow-1 mx-3 text-center">
                      <div className="text-muted" style={{ fontSize: '0.6875rem' }}>5h 30m • Direct</div>
                      <div className="route-connector my-1">
                        <span className="route-dot"></span>
                        <div className="route-line"></div>
                        <span className="route-dot-dest"></span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--fe-text-secondary)' }}>AC Multi-Axle</div>
                    </div>

                    <div className="text-end">
                      <div className="time-stamp fw-semibold" style={{ fontSize: '1.125rem' }}>13:00</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Purnea Bus Stand</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-2" style={{ borderColor: 'var(--fe-border)', fontSize: '0.75rem' }}>
                    <span className="text-muted">18 seats available</span>
                    <Link
                      to="/search?source=Patna&destination=Purnea"
                      className="text-decoration-none fw-medium d-flex align-items-center gap-1"
                      style={{ color: 'var(--fe-accent)' }}
                    >
                      <span>Select seat</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>

                {/* Departure Card 2 */}
                <div
                  className="p-3 rounded"
                  style={{ background: 'var(--fe-surface-raised)', border: '1px solid var(--fe-border)' }}
                >
                  <div className="d-flex justify-content-between align-items-baseline mb-2">
                    <div className="fw-semibold" style={{ fontSize: '0.9375rem' }}>
                      Night Sleeper #BR-01-7788
                    </div>
                    <div className="price fw-semibold" style={{ color: 'var(--fe-accent)', fontSize: '1rem' }}>
                      ₹850
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between my-2">
                    <div>
                      <div className="time-stamp fw-semibold" style={{ fontSize: '1.125rem' }}>21:45</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Patna Junction</div>
                    </div>

                    <div className="flex-grow-1 mx-3 text-center">
                      <div className="text-muted" style={{ fontSize: '0.6875rem' }}>6h 00m • Sleeper</div>
                      <div className="route-connector my-1">
                        <span className="route-dot"></span>
                        <div className="route-line"></div>
                        <span className="route-dot-dest"></span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--fe-text-secondary)' }}>2x1 Luxury Sleeper</div>
                    </div>

                    <div className="text-end">
                      <div className="time-stamp fw-semibold" style={{ fontSize: '1.125rem' }}>03:45</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Purnea Bus Stand</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-2" style={{ borderColor: 'var(--fe-border)', fontSize: '0.75rem' }}>
                    <span className="text-muted">7 berths left</span>
                    <Link
                      to="/search?source=Patna&destination=Purnea"
                      className="text-decoration-none fw-medium d-flex align-items-center gap-1"
                      style={{ color: 'var(--fe-accent)' }}
                    >
                      <span>Select berth</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Fleet Certification Strip */}
      <section className="py-3" style={{ background: '#ffffff', borderBottom: '1px solid var(--fe-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div className="container">
          <div className="row g-3 align-items-center justify-content-center">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="d-flex align-items-center justify-content-start gap-2 p-2 rounded-2" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={22} color="#10B981" />
                </div>
                <div>
                  <div className="fw-bold" style={{ fontSize: '0.84rem', color: '#0F172A', lineHeight: 1.2 }}>256-Bit SSL Encryption</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>Bank-grade payment security</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="d-flex align-items-center justify-content-start gap-2 p-2 rounded-2" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(36, 107, 253, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Navigation size={20} color="#246BFD" />
                </div>
                <div>
                  <div className="fw-bold" style={{ fontSize: '0.84rem', color: '#0F172A', lineHeight: 1.2 }}>AIS-140 Certified GPS</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>Govt-approved telemetry & SOS</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="d-flex align-items-center justify-content-start gap-2 p-2 rounded-2" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(25, 197, 232, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={20} color="#0284C7" />
                </div>
                <div>
                  <div className="fw-bold" style={{ fontSize: '0.84rem', color: '#0F172A', lineHeight: 1.2 }}>DRIVIO Seat Assurance</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>Guaranteed manifest locking</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="d-flex align-items-center justify-content-start gap-2 p-2 rounded-2" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={20} color="#8B5CF6" />
                </div>
                <div>
                  <div className="fw-bold" style={{ fontSize: '0.84rem', color: '#0F172A', lineHeight: 1.2 }}>Digital Boarding Pass</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>Instant QR & PDF download</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Corridors */}
      <section className="py-5" style={{ background: '#ffffff', borderBottom: '1px solid var(--fe-border)' }}>
        <div className="container">
          <div className="d-flex align-items-baseline justify-content-between mb-4">
            <div>
              <h2 className="mb-1" style={{ fontSize: '1.25rem' }}>
                Major transit corridors
              </h2>
              <p className="text-muted small mb-0">High-frequency routes with guaranteed scheduled services</p>
            </div>
            <Link to="/search" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
              <span>View all routes</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="row g-3">
            {sampleCorridors.map((c) => (
              <div key={`${c.source}-${c.destination}`} className="col-12 col-md-6 col-lg-3">
                <div
                  className="p-3 h-100 rounded"
                  style={{
                    background: 'var(--fe-surface)',
                    border: '1px solid var(--fe-border)',
                    boxShadow: 'var(--fe-shadow-xs)',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge badge-subtle-primary">{c.buses}</span>
                    <span className="price fw-semibold" style={{ fontSize: '0.9375rem', color: 'var(--fe-accent)' }}>
                      From {c.fare}
                    </span>
                  </div>
                  <div className="fw-semibold mb-1" style={{ fontSize: '1rem', color: 'var(--fe-text-primary)' }}>
                    {c.source} → {c.destination}
                  </div>
                  <div className="text-muted small mb-3">Average duration: {c.time}</div>
                  <Link
                    to={`/search?source=${c.source}&destination=${c.destination}`}
                    className="btn btn-outline-secondary btn-sm w-100"
                    style={{ fontSize: '0.8125rem' }}
                  >
                    View departures
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Craft Indicators */}
      <section className="py-5" style={{ background: 'var(--fe-bg)', borderBottom: '1px solid var(--fe-border)' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div className="d-flex gap-3">
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--fe-radius-md)',
                    background: 'var(--fe-accent-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--drivio-blue)',
                    flexShrink: 0,
                  }}
                >
                  <Shield size={20} />
                </div>
                <div>
                  <div className="fw-semibold mb-1" style={{ fontSize: '0.9375rem' }}>
                    DRIVIO Seat Assurance
                  </div>
                  <p className="text-muted mb-0" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                    Your chosen seat is locked in the manifest. No overbooking or seat reassignment at the boarding gate.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="d-flex gap-3">
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--fe-radius-md)',
                    background: 'var(--fe-accent-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--fe-accent)',
                    flexShrink: 0,
                  }}
                >
                  <Clock size={20} />
                </div>
                <div>
                  <div className="fw-semibold mb-1" style={{ fontSize: '0.9375rem' }}>
                    GPS live schedule
                  </div>
                  <p className="text-muted mb-0" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                    Real-time vehicle telemetry feeds live departure status and arrival ETAs directly to your booking screen.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="d-flex gap-3">
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--fe-radius-md)',
                    background: 'var(--fe-accent-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--fe-accent)',
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="fw-semibold mb-1" style={{ fontSize: '0.9375rem' }}>
                    Paperless boarding
                  </div>
                  <p className="text-muted mb-0" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                    Receive SMS and email digital boarding passes with QR codes for fast contactless verification by the driver.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Traveler Reviews */}
      <section className="py-5" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="d-flex align-items-baseline justify-content-between mb-4">
            <div>
              <h2 className="mb-1" style={{ fontSize: '1.25rem' }}>
                Traveler feedback
              </h2>
              <p className="text-muted small mb-0">Verified passengers from recent intercity departures</p>
            </div>
            <Link to="/testimonials" className="btn btn-outline-secondary btn-sm">
              See all reviews
            </Link>
          </div>

          <div className="row g-3">
            {(latest.length > 0 ? latest : [
              {
                id: 1,
                name: 'Vikas Sahni',
                comment: 'The Patna to Purnea coach departed right on time. Very clean sleeper berth and respectful driver.',
                rating: 5,
                created_at: new Date().toISOString(),
              },
              {
                id: 2,
                name: 'Priyanka Sen',
                comment: 'Seat selection matched the bus layout exactly. Charging sockets worked and AC was comfortable throughout.',
                rating: 5,
                created_at: new Date().toISOString(),
              },
              {
                id: 3,
                name: 'Anand Jha',
                comment: 'Digital ticket on phone was smooth. No waiting at the counter. Reliable schedule.',
                rating: 4,
                created_at: new Date().toISOString(),
              },
            ]).map((t) => (
              <div key={t.id} className="col-12 col-md-4">
                <div
                  className="p-3 h-100 rounded"
                  style={{
                    background: 'var(--fe-surface)',
                    border: '1px solid var(--fe-border)',
                    boxShadow: 'var(--fe-shadow-xs)',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="fw-semibold" style={{ fontSize: '0.875rem' }}>
                      {t.name}
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          color={i < (t.rating || 5) ? 'var(--fe-warning)' : 'var(--fe-border-strong)'}
                          fill={i < (t.rating || 5) ? 'var(--fe-warning)' : 'transparent'}
                        />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--fe-text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                    "{t.comment}"
                  </p>
                  <div className="text-muted tabular-nums" style={{ fontSize: '0.6875rem' }}>
                    {new Date(t.created_at || Date.now()).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}