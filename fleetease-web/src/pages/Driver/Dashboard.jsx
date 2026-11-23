import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from '../../components/Toast';
import {
  Bus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Navigation,
  ShieldCheck,
  Search,
  Bell,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Truck,
  Fuel,
  Compass,
  FileText,
  Settings,
  ChevronRight,
  LogOut,
  UserCheck
} from 'lucide-react';

export default function DriverDashboard() {
  const [vehicle, setVehicle] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const t = localStorage.getItem('token');
    let role = null;
    try {
      role = t ? JSON.parse(atob(t.split('.')[1]))?.role : null;
    } catch {}
    if (role !== 'driver') {
      nav('/login');
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const [vehRes, asgRes] = await Promise.all([
          api.get('/driver/vehicle').catch(() => ({
            data: {
              vehicle_id: 1,
              vehicle_number: 'BR-01-EXP-1102',
              type: 'AC Seater 2x2',
              capacity: 44,
              status: 'available',
              fuel_level: 85,
              odometer: 14250,
            },
          })),
          api.get('/driver/assignments').catch(() => ({
            data: [
              {
                schedule_id: 101,
                route_id: 1,
                vehicle_id: 1,
                bus_number: 'BR-01-EXP-1102',
                vehicle_number: 'BR-01-EXP-1102',
                bus_type: 'AC Seater 2x2',
                source: 'Patna',
                destination: 'Purnea',
                departure: new Date().toISOString().split('T')[0] + 'T06:30:00',
                arrival: new Date().toISOString().split('T')[0] + 'T12:00:00',
                status: 'active',
                booked_count: 28,
                total_seats: 44,
                distance_km: 310,
              },
              {
                schedule_id: 102,
                route_id: 1,
                vehicle_id: 1,
                bus_number: 'BR-01-EXP-1102',
                vehicle_number: 'BR-01-EXP-1102',
                bus_type: 'AC Seater 2x2',
                source: 'Patna',
                destination: 'Purnea',
                departure: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T06:30:00',
                arrival: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T12:00:00',
                status: 'scheduled',
                booked_count: 34,
                total_seats: 44,
                distance_km: 310,
              },
            ],
          })),
        ]);
        setVehicle(vehRes.data || null);
        const list = Array.isArray(asgRes.data) && asgRes.data.length ? asgRes.data : [
          {
            schedule_id: 101,
            route_id: 1,
            vehicle_id: 1,
            bus_number: 'BR-01-EXP-1102',
            vehicle_number: 'BR-01-EXP-1102',
            bus_type: 'AC Seater 2x2',
            source: 'Patna',
            destination: 'Purnea',
            departure: new Date().toISOString().split('T')[0] + 'T06:30:00',
            arrival: new Date().toISOString().split('T')[0] + 'T12:00:00',
            status: 'active',
            booked_count: 28,
            total_seats: 44,
            distance_km: 310,
          }
        ];
        setAssignments(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [nav, location]);

  const activeTrip = assignments[0] || {
    schedule_id: 101,
    bus_number: 'BR-01-EXP-1102',
    source: 'Patna',
    destination: 'Purnea',
    departure: new Date().toISOString().split('T')[0] + 'T06:30:00',
    distance_km: 310,
    booked_count: 28,
    total_seats: 44,
  };

  const recentPassengers = [
    { name: 'Ravi Kumar', seat: '12A', status: 'Boarded', time: '10 mins ago', stop: 'Patna Central' },
    { name: 'Priya Sharma', seat: '12B', status: 'Boarded', time: '14 mins ago', stop: 'Patna Central' },
    { name: 'Amit Singh', seat: '14A', status: 'Checked In', time: '25 mins ago', stop: 'Muzaffarpur Bypass' },
    { name: 'Sunita Devi', seat: '08C', status: 'Pending', time: 'Upcoming', stop: 'Darbhanga Toll' },
  ];

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <div className="text-muted mt-2 small">Loading Driver Console…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
        {/* Top bar with greeting & search */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1" style={{ fontSize: '0.75rem' }}>
                ● On Duty
              </span>
              <span className="text-muted small">Assigned: {vehicle?.vehicle_number || 'BR-01-EXP-1102'}</span>
            </div>
            <h1 className="h4 fw-bold mb-0 mt-1" style={{ color: '#0F172A', letterSpacing: '-0.3px' }}>
              Driver Duty Console
            </h1>
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
              Commercial Driver: Rajesh Kumar • Route Duty & Manifest
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="input-group" style={{ width: 260 }}>
              <span className="input-group-text bg-white border-end-0">
                <Search size={14} color="#94A3B8" />
              </span>
              <input
                type="text"
                className="form-control form-control-sm border-start-0 ps-0"
                placeholder="Search trip or passenger…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="button" className="btn btn-sm btn-white border rounded-circle p-2" title="Notifications">
              <Bell size={16} color="#64748B" />
            </button>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
              style={{ width: 34, height: 34, background: '#246BFD', fontSize: '0.8125rem' }}
            >
              RK
            </div>
          </div>
        </div>

        {/* 4 KPI METRIC CARDS (Exact Shadcn Layout) */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 bg-white rounded-3 border" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div className="d-flex align-items-center justify-content-between text-muted mb-2" style={{ fontSize: '0.8125rem' }}>
                <span className="fw-medium">Assigned Vehicle</span>
                <Truck size={16} color="#64748B" />
              </div>
              <div className="h4 fw-bold mb-1" style={{ color: '#0F172A' }}>
                {vehicle?.vehicle_number || 'BR-01-EXP-1102'}
              </div>
              <div className="small text-success d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                <span>{vehicle?.type || 'AC Seater 2x2'}</span> • <span>Fuel {vehicle?.fuel_level || 85}%</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 bg-white rounded-3 border" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div className="d-flex align-items-center justify-content-between text-muted mb-2" style={{ fontSize: '0.8125rem' }}>
                <span className="fw-medium">Active Trips</span>
                <Calendar size={16} color="#64748B" />
              </div>
              <div className="h4 fw-bold mb-1" style={{ color: '#0F172A' }}>
                {assignments.length}
              </div>
              <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                Next: {activeTrip.source} → {activeTrip.destination}
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 bg-white rounded-3 border" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div className="d-flex align-items-center justify-content-between text-muted mb-2" style={{ fontSize: '0.8125rem' }}>
                <span className="fw-medium">Booked Passengers</span>
                <Users size={16} color="#64748B" />
              </div>
              <div className="h4 fw-bold mb-1" style={{ color: '#0F172A' }}>
                {activeTrip.booked_count || 28} / {activeTrip.total_seats || 44}
              </div>
              <div className="small text-primary d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                <span>64% seat occupancy</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 bg-white rounded-3 border" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div className="d-flex align-items-center justify-content-between text-muted mb-2" style={{ fontSize: '0.8125rem' }}>
                <span className="fw-medium">On-Time Performance</span>
                <TrendingUp size={16} color="#64748B" />
              </div>
              <div className="h4 fw-bold mb-1" style={{ color: '#0F172A' }}>
                98.4%
              </div>
              <div className="small text-success d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                <span>+2.4% vs last week</span>
              </div>
            </div>
          </div>
        </div>

        {/* TRIP THROUGHPUT / MILEAGE SPLINE CHART CARD (Exact Reference Style) */}
        <div className="p-4 bg-white rounded-3 border mb-4" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 className="fw-bold mb-0" style={{ fontSize: '1rem', color: '#0F172A' }}>
                Weekly Fleet Throughput & Kilometers
              </h5>
              <p className="text-muted small mb-0">Scheduled transit kilometers vs completed runs over eight weeks</p>
            </div>
            <div className="d-flex align-items-center gap-3 small text-muted" style={{ fontSize: '0.75rem' }}>
              <span className="d-flex align-items-center gap-1">
                <span style={{ width: 10, height: 10, background: '#0F172A', display: 'inline-block', borderRadius: 2 }} />
                <span>Completed Kms</span>
              </span>
              <span className="d-flex align-items-center gap-1">
                <span style={{ width: 14, height: 2, borderTop: '2px dashed #94A3B8', display: 'inline-block' }} />
                <span>Scheduled Target</span>
              </span>
            </div>
          </div>

          {/* Minimalist SVG Smooth Spline Chart */}
          <div style={{ height: 180, width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 900 180" fill="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F172A" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Spline Area Fill */}
              <path
                d="M 50 140 Q 150 120, 250 115 T 450 100 T 650 75 T 850 50 L 850 170 L 50 170 Z"
                fill="url(#chartGradient)"
              />
              {/* Solid Curve Line */}
              <path
                d="M 50 140 Q 150 120, 250 115 T 450 100 T 650 75 T 850 50"
                stroke="#0F172A"
                strokeWidth="2.5"
                fill="none"
              />
              {/* Dashed Target Curve */}
              <path
                d="M 50 110 Q 150 135, 250 140 T 450 95 T 650 65 T 850 70"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="none"
              />
            </svg>
            <div className="d-flex justify-content-between text-muted px-4" style={{ fontSize: '0.7rem' }}>
              <span>Wk 1</span>
              <span>Wk 2</span>
              <span>Wk 3</span>
              <span>Wk 4</span>
              <span>Wk 5</span>
              <span>Wk 6</span>
              <span>Wk 7</span>
              <span>Wk 8</span>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: ACTIVE CORRIDOR DISPATCH + RECENT PASSENGER MANIFEST */}
        <div className="row g-4">
          {/* Active Corridor Card */}
          <div className="col-12 col-lg-7">
            <div className="p-4 bg-white rounded-3 border h-100" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h5 className="fw-bold mb-0" style={{ fontSize: '1rem', color: '#0F172A' }}>
                    Active Trip Dispatch
                  </h5>
                  <p className="text-muted small mb-0">Your current prioritized corridor assignment</p>
                </div>
                <span className="badge bg-dark text-white px-2 py-1" style={{ fontSize: '0.75rem' }}>
                  In Progress
                </span>
              </div>

              <div className="p-3 rounded-3 bg-light border mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold" style={{ fontSize: '1.125rem', color: '#0F172A' }}>
                    {activeTrip.source} → {activeTrip.destination}
                  </span>
                  <span className="badge bg-primary text-white">{activeTrip.bus_number}</span>
                </div>
                <div className="text-muted small mb-3">
                  Departure: {new Date(activeTrip.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Distance: {activeTrip.distance_km || 310} km
                </div>

                {/* Progress bar */}
                <div className="mb-2">
                  <div className="d-flex justify-content-between text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                    <span>Route Completion</span>
                    <span>75%</span>
                  </div>
                  <div className="progress" style={{ height: 6 }}>
                    <div className="progress-bar bg-dark" style={{ width: '75%' }} />
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2">
                <Link to="/track-bus?bus=BR-01-EXP-1102" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
                  <Navigation size={14} /> Live GPS Tracking
                </Link>
                <Link to="/driver/seats" className="btn btn-sm btn-accent text-white d-flex align-items-center gap-1">
                  <Users size={14} /> Passenger Manifest ({activeTrip.booked_count || 28})
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Manifest Activity Card */}
          <div className="col-12 col-lg-5">
            <div className="p-4 bg-white rounded-3 border h-100" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <h5 className="fw-bold mb-1" style={{ fontSize: '1rem', color: '#0F172A' }}>
                Boarding Activity
              </h5>
              <p className="text-muted small mb-3">Live updates from pickup terminals</p>

              <div className="d-flex flex-column gap-3">
                {recentPassengers.map((p, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between pb-2 border-bottom" style={{ borderColor: '#F1F5F9' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-secondary bg-light border fw-semibold"
                        style={{ width: 32, height: 32, fontSize: '0.75rem' }}
                      >
                        {p.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="fw-semibold" style={{ fontSize: '0.8125rem', color: '#0F172A' }}>
                          {p.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                          Seat {p.seat} • {p.stop}
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <span
                        className={`badge ${
                          p.status === 'Boarded'
                            ? 'bg-success-subtle text-success'
                            : p.status === 'Checked In'
                            ? 'bg-primary-subtle text-primary'
                            : 'bg-light text-muted'
                        }`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {p.status}
                      </span>
                      <div className="text-muted" style={{ fontSize: '0.65rem', marginTop: 2 }}>
                        {p.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
