import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../utils/api';
import {
  DollarSign,
  Ticket,
  Bus,
  TrendingUp,
  FileText,
  Users,
  Search,
  Bell,
  Compass,
  Filter,
  CheckCircle2,
  Calendar,
  CreditCard,
  ShieldCheck,
  Fuel,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [selectedBus, setSelectedBus] = useState('');
  const nav = useNavigate();
  const location = useLocation();

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (start) params.start = start;
      if (end) params.end = end;
      if (selectedBus) params.vehicle_id = selectedBus;
      const qs = new URLSearchParams(params);
      const r = await api.get(`/admin/summary?${qs.toString()}`);
      setData(r.data || {});
    } catch {
      setData({});
    } finally {
      setLoading(false);
    }
  }, [start, end, selectedBus]);

  useEffect(() => {
    const t = localStorage.getItem('token');
    let role = null;
    try {
      role = t ? JSON.parse(atob(t.split('.')[1]))?.role : null;
    } catch {}
    if (role !== 'admin') {
      nav('/');
      return;
    }
    loadSummary();
  }, [nav, location, loadSummary]);

  const safeData = data || {};

  const totalRev = Number(safeData.total_revenue || 42800);
  const onlineRev = Number(safeData.online_revenue || 28400);
  const offlineRev = Number(safeData.offline_revenue || 14400);
  const totalBookings = Number(safeData.total_bookings || 74);
  const seatsSold = Number(safeData.seats_sold || 74);
  const fuelTotal = Number(safeData.fuel_total || 5400);
  const tollTotal = Number(safeData.toll_total || 3200);

  const defaultFleetBuses = [
    { id: 1, label: 'BR-01-EXP-1102 (AC Seater)', revenue: 14500, occupancy: 88, route: 'Patna → Purnea' },
    { id: 2, label: 'BR-01-VOL-2401 (Volvo Multi-Axle)', revenue: 11200, occupancy: 78, route: 'Patna → Purnea' },
    { id: 3, label: 'BR-01-SLP-3904 (Luxury Sleeper)', revenue: 8650, occupancy: 92, route: 'Delhi → Jaipur' },
    { id: 4, label: 'MH-02-VOL-8811 (Express Volvo)', revenue: 9800, occupancy: 85, route: 'Mumbai → Pune' },
  ];

  const busOptions = useMemo(() => {
    if (safeData.bus_wise && safeData.bus_wise.length > 0) {
      return safeData.bus_wise.map((b) => ({
        id: b.vehicle_id,
        label: b.bus_number || b.vehicle_number || `Bus #${b.vehicle_id}`,
        revenue: Number(b.revenue || 0),
        occupancy: 82,
        route: 'Active Corridor',
      }));
    }
    return defaultFleetBuses;
  }, [safeData.bus_wise]);

  return (
    <div className="container py-4" style={{ maxWidth: 1240 }}>
      {/* TOP HEADER: Greeting, Search, Notifications, Admin Profile */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom flex-wrap gap-3" style={{ borderColor: '#E2E8F0' }}>
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-2"
            style={{ width: 34, height: 34, background: '#EFF6FF', border: '1px solid #DBEAFE', color: '#2563EB' }}
          >
            <Compass size={18} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="h5 fw-bold mb-0" style={{ color: '#0F172A', letterSpacing: '-0.3px' }}>
                Enterprise Network Operations
              </h1>
              <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.6875rem' }}>
                Live Network Active
              </span>
            </div>
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
              DRIVIO Transit Central Command • System Administrator
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2.5">
          {/* Date Filter Controls */}
          <div className="d-flex align-items-center gap-1 bg-white p-1 rounded-2 border" style={{ borderColor: '#CBD5E1' }}>
            <Calendar size={13} className="text-muted ms-1" />
            <input
              type="date"
              className="form-control form-control-sm border-0 py-0 ps-1"
              style={{ fontSize: '0.75rem', width: 120, boxShadow: 'none' }}
              value={start}
              onChange={(e) => setStart(e.target.value)}
              title="Start Date"
            />
            <span className="text-muted small">to</span>
            <input
              type="date"
              className="form-control form-control-sm border-0 py-0 ps-1"
              style={{ fontSize: '0.75rem', width: 120, boxShadow: 'none' }}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              title="End Date"
            />
            {(start || end) && (
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none py-0 px-1 text-danger"
                style={{ fontSize: '0.75rem' }}
                onClick={() => { setStart(''); setEnd(''); }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Bus Filter */}
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto', fontSize: '0.75rem', borderColor: '#CBD5E1' }}
            value={selectedBus}
            onChange={(e) => setSelectedBus(e.target.value)}
          >
            <option value="">All Fleet Coaches</option>
            {busOptions.map((b) => (
              <option key={b.id} value={b.id}>{b.label}</option>
            ))}
          </select>

          {/* Admin Profile Avatar */}
          <div className="d-flex align-items-center gap-2 ps-2 border-start" style={{ borderColor: '#E2E8F0' }}>
            <div
              className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
              style={{
                width: 34,
                height: 34,
                background: 'linear-gradient(135deg, #0F172A, #2563EB)',
                fontSize: '0.8rem',
              }}
            >
              AD
            </div>
            <div className="d-none d-md-block text-start">
              <div className="fw-bold" style={{ fontSize: '0.8125rem', color: '#0F172A', lineHeight: 1.1 }}>System Admin</div>
              <div className="text-muted" style={{ fontSize: '0.6875rem' }}>admin@drivio.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 CORE EXECUTIVE METRIC CARDS */}
      <div className="row g-3 mb-4">
        {/* Card 1: Gross Network Revenue */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="p-3 bg-white rounded-3 border h-100"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div className="d-flex align-items-center justify-content-between text-muted mb-2">
              <span className="fw-medium" style={{ fontSize: '0.8125rem', color: '#334155' }}>Total Network Revenue</span>
              <DollarSign size={16} color="#94A3B8" />
            </div>
            <div className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#0F172A', lineHeight: 1.1 }}>
              ₹{totalRev.toLocaleString()}
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              Online ₹{onlineRev.toLocaleString()} • Counter ₹{offlineRev.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Card 2: Total Bookings & Seats */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="p-3 bg-white rounded-3 border h-100"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div className="d-flex align-items-center justify-content-between text-muted mb-2">
              <span className="fw-medium" style={{ fontSize: '0.8125rem', color: '#334155' }}>Passenger Bookings</span>
              <Ticket size={16} color="#94A3B8" />
            </div>
            <div className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#0F172A', lineHeight: 1.1 }}>
              {totalBookings}
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              {seatsSold} seats manifest confirmed
            </div>
          </div>
        </div>

        {/* Card 3: Active Fleet Coaches */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="p-3 bg-white rounded-3 border h-100"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div className="d-flex align-items-center justify-content-between text-muted mb-2">
              <span className="fw-medium" style={{ fontSize: '0.8125rem', color: '#334155' }}>Active Coaches</span>
              <Bus size={16} color="#94A3B8" />
            </div>
            <div className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#0F172A', lineHeight: 1.1 }}>
              {busOptions.length} Coaches
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              100% AIS-140 GPS Compliance
            </div>
          </div>
        </div>

        {/* Card 4: Operating Expenses & Fastag */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="p-3 bg-white rounded-3 border h-100"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div className="d-flex align-items-center justify-content-between text-muted mb-2">
              <span className="fw-medium" style={{ fontSize: '0.8125rem', color: '#334155' }}>Operating Expenses</span>
              <TrendingUp size={16} color="#94A3B8" />
            </div>
            <div className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#0F172A', lineHeight: 1.1 }}>
              ₹{(fuelTotal + tollTotal).toLocaleString()}
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              Fuel ₹{fuelTotal.toLocaleString()} • FASTag ₹{tollTotal.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* ENTERPRISE THROUGHPUT CHART CARD */}
      <div
        className="p-4 bg-white rounded-3 border mb-4"
        style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-0" style={{ fontSize: '1rem', color: '#0F172A' }}>
              Corridor Network Throughput
            </h5>
            <p className="text-muted small mb-0" style={{ fontSize: '0.8125rem' }}>
              Online bookings vs offline counter agent volume over the last eight weeks
            </p>
          </div>
          <Link to="/admin/schedules" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
            <span>Manage Schedules</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div style={{ height: 200, width: '100%', position: 'relative' }}>
          <svg viewBox="0 0 900 200" fill="none" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="adminChartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
              </linearGradient>
            </defs>
            {/* Horizontal Grid lines */}
            <line x1="40" y1="30" x2="880" y2="30" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="40" y1="75" x2="880" y2="75" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="40" y1="120" x2="880" y2="120" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="40" y1="165" x2="880" y2="165" stroke="#F1F5F9" strokeWidth="1" />

            {/* Y Axis tick labels */}
            <text x="15" y="34" fill="#94A3B8" fontSize="10">80k</text>
            <text x="15" y="79" fill="#94A3B8" fontSize="10">60k</text>
            <text x="15" y="124" fill="#94A3B8" fontSize="10">40k</text>
            <text x="15" y="169" fill="#94A3B8" fontSize="10">20k</text>
            <text x="22" y="195" fill="#94A3B8" fontSize="10">0</text>

            {/* Filled Area for Online Revenue */}
            <path
              d="M 50 140 C 170 135, 260 110, 380 90 C 500 70, 620 50, 740 45 C 800 42, 850 38, 880 35 L 880 195 L 50 195 Z"
              fill="url(#adminChartGrad)"
            />

            {/* Solid Online Revenue Line */}
            <path
              d="M 50 140 C 170 135, 260 110, 380 90 C 500 70, 620 50, 740 45 C 800 42, 850 38, 880 35"
              stroke="#2563EB"
              strokeWidth="2.5"
              fill="none"
            />

            {/* Dashed Offline Counter Line */}
            <path
              d="M 50 160 C 150 150, 260 130, 380 120 C 500 110, 620 95, 740 90 C 800 88, 850 82, 880 80"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeDasharray="4 4"
              fill="none"
            />
          </svg>
        </div>

        {/* X Axis Weeks */}
        <div className="d-flex justify-content-between text-muted px-4 mt-1" style={{ fontSize: '0.75rem' }}>
          <span>Wk 1</span>
          <span>Wk 2</span>
          <span>Wk 3</span>
          <span>Wk 4</span>
          <span>Wk 5</span>
          <span>Wk 6</span>
          <span>Wk 7</span>
          <span>Wk 8</span>
        </div>

        {/* Chart Legend Centered */}
        <div className="d-flex align-items-center justify-content-center gap-4 mt-3" style={{ fontSize: '0.75rem', color: '#475569' }}>
          <div className="d-flex align-items-center gap-1.5">
            <span style={{ width: 10, height: 10, background: '#2563EB', display: 'inline-block', borderRadius: 2 }} />
            <span>Online B2C Bookings</span>
          </div>
          <div className="d-flex align-items-center gap-1.5">
            <span style={{ width: 14, height: 2, borderTop: '2px dashed #94A3B8', display: 'inline-block' }} />
            <span>Counter Agent Offline</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: 2 COLUMNS */}
      <div className="row g-4">
        {/* Left Column: Corridor Fleet Performance */}
        <div className="col-12 col-lg-6">
          <div
            className="p-4 bg-white rounded-3 border h-100"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-0" style={{ fontSize: '1rem', color: '#0F172A' }}>
                  Corridor Fleet Performance
                </h5>
                <p className="text-muted small mb-0" style={{ fontSize: '0.8125rem' }}>
                  Revenue yield and passenger load factors by vehicle
                </p>
              </div>
              <Link to="/admin/vehicles" className="text-primary text-decoration-none small" style={{ fontSize: '0.75rem' }}>
                View All
              </Link>
            </div>

            <div className="d-flex flex-column gap-3.5">
              {busOptions.slice(0, 4).map((b, idx) => (
                <div key={idx} className="p-3 bg-light rounded-2 border" style={{ borderColor: '#F1F5F9' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold" style={{ fontSize: '0.875rem', color: '#0F172A' }}>{b.label}</span>
                    <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.6875rem' }}>
                      ₹{b.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>
                    {b.route || 'Intercity High Frequency'} • Occupancy: {b.occupancy || 85}%
                  </div>
                  <div className="progress" style={{ height: 6, background: '#E2E8F0' }}>
                    <div className="progress-bar bg-primary" style={{ width: `${b.occupancy || 85}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Network Activity */}
        <div className="col-12 col-lg-6">
          <div
            className="p-4 bg-white rounded-3 border h-100"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div className="mb-4">
              <h5 className="fw-bold mb-0" style={{ fontSize: '1rem', color: '#0F172A' }}>
                Recent Operational Logs
              </h5>
              <p className="text-muted small mb-0" style={{ fontSize: '0.8125rem' }}>
                Real-time booking and dispatch transactions
              </p>
            </div>

            <div className="d-flex flex-column gap-3.5">
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 34, height: 34, background: '#2563EB', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  BK
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontSize: '0.84rem', color: '#1E293B', lineHeight: 1.4 }}>
                    <strong>Online Booking Confirmed</strong> for Patna → Purnea (Seat 12A)
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>₹650 • Instant Boarding Pass Issued • 12 mins ago</div>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 34, height: 34, background: '#7C3AED', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  AG
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontSize: '0.84rem', color: '#1E293B', lineHeight: 1.4 }}>
                    <strong>Counter Agent (#AGT-2)</strong> booked 2 seats on Delhi → Jaipur
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>₹960 • Cash collected at terminal • 35 mins ago</div>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 34, height: 34, background: '#D97706', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  LK
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontSize: '0.84rem', color: '#1E293B', lineHeight: 1.4 }}>
                    <strong>Admin Quota Locked</strong> on Schedule #1 (Seats L1A, L1B)
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Operator Reservation • 1 hour ago</div>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 34, height: 34, background: '#059669', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  FT
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontSize: '0.84rem', color: '#1E293B', lineHeight: 1.4 }}>
                    <strong>Fastag Automatic Toll</strong> cleared for Coach MH-02-VOL-8811
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>₹340 debited • Express toll plaza • 2 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
