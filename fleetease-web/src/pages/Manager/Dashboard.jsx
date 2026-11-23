import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../utils/api';
import {
  Bus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Bell,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Plus,
  Compass,
  FileText,
  Briefcase,
  ShieldCheck,
  Truck,
  BarChart2,
  ChevronRight,
  Filter,
  Ticket
} from 'lucide-react';

export default function ManagerDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 28450,
    activeBookings: 48,
    availableVehicles: 6,
    activeStaff: 16,
    utilizationRate: 87,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState('month');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, bookingsRes] = await Promise.all([
          api.get('/manager/dashboard/stats').catch(() => ({ data: {} })),
          api.get('/manager/bookings/recent').catch(() => ({ data: [] })),
        ]);

        const rawBookings = Array.isArray(bookingsRes.data) && bookingsRes.data.length ? bookingsRes.data : [
          { id: 387, customerName: 'Apurva Sharma', route: 'Pune → Nashik', date: '23 Nov 2026', status: 'confirmed', amount: 650 },
          { id: 388, customerName: 'Ravi Kumar', route: 'Patna → Purnea', date: '23 Nov 2026', status: 'confirmed', amount: 650 },
          { id: 389, customerName: 'Priya Sharma', route: 'Delhi → Jaipur', date: '24 Nov 2026', status: 'confirmed', amount: 480 },
          { id: 390, customerName: 'Amit Singh', route: 'Mumbai → Pune', date: '24 Nov 2026', status: 'pending', amount: 350 },
        ];

        setStats({
          totalRevenue: statsRes.data?.totalRevenue || 28450,
          activeBookings: statsRes.data?.activeBookings || 48,
          availableVehicles: statsRes.data?.availableVehicles || 6,
          activeStaff: statsRes.data?.activeStaff || 16,
          utilizationRate: statsRes.data?.utilizationRate || 87,
        });
        setRecentBookings(rawBookings);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [location, datePreset]);

  const fleetVehicles = [
    { number: 'BR-01-EXP-1102', model: 'AC Seater 2x2', driver: 'Rajesh Kumar', status: 'Active Run', route: 'Patna → Purnea', progress: 75 },
    { number: 'BR-01-VOL-2401', model: 'Volvo Multi-Axle', driver: 'Manoj Singh', status: 'In Transit', route: 'Patna → Purnea', progress: 45 },
    { number: 'DL-01-EXP-5520', model: 'AC Seater 2x2', driver: 'Sunil Verma', status: 'Ready', route: 'Delhi → Jaipur', progress: 90 },
    { number: 'MH-02-VOL-8811', model: 'Volvo Multi-Axle', driver: 'Anil Rao', status: 'Ready', route: 'Mumbai → Pune', progress: 100 },
  ];

  const filteredBookings = recentBookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <div className="text-muted mt-2 small">Loading Fleet Operations…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 1240 }}>
      {/* TOP HEADER: Greeting, Search, Notifications, Avatar */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom" style={{ borderColor: '#E2E8F0' }}>
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-2"
            style={{ width: 34, height: 34, background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#334155' }}
          >
            <Compass size={16} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="h5 fw-bold mb-0" style={{ color: '#0F172A', letterSpacing: '-0.3px' }}>
                Fleet Operations Center
              </h1>
              <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.6875rem' }}>
                Fleet Live
              </span>
            </div>
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
              Operations Management • Intercity Coach Telemetry & Compliance
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm btn-light p-2 rounded-circle border"
            style={{ borderColor: '#E2E8F0', color: '#64748B' }}
            title="Search"
          >
            <Search size={16} />
          </button>

          <button
            type="button"
            className="btn btn-sm btn-light p-2 rounded-circle border position-relative"
            style={{ borderColor: '#E2E8F0', color: '#64748B' }}
            title="Notifications"
          >
            <Bell size={16} />
            <span
              className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
              style={{ width: 7, height: 7 }}
            />
          </button>

          {/* User profile avatar */}
          <div className="d-flex align-items-center gap-2 ps-2 border-start" style={{ borderColor: '#E2E8F0' }}>
            <div
              className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
              style={{
                width: 34,
                height: 34,
                background: 'linear-gradient(135deg, #101B35, #246BFD)',
                fontSize: '0.8rem',
              }}
            >
              OM
            </div>
            <div className="d-none d-md-block text-start">
              <div className="fw-bold" style={{ fontSize: '0.8125rem', color: '#0F172A', lineHeight: 1.1 }}>Operations Lead</div>
              <div className="text-muted" style={{ fontSize: '0.6875rem' }}>manager@drivio.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 STAT CARDS IN A ROW */}
      <div className="row g-3 mb-4">
        {/* Card 1: Total Fleet Revenue */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="p-3 bg-white rounded-3 border h-100"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div className="d-flex align-items-center justify-content-between text-muted mb-2">
              <span className="fw-medium" style={{ fontSize: '0.8125rem', color: '#334155' }}>Total Fleet Revenue</span>
              <DollarSign size={16} color="#94A3B8" />
            </div>
            <div className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#0F172A', lineHeight: 1.1 }}>
              ₹{stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '28,450'}
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              +12.4% vs last month
            </div>
          </div>
        </div>

        {/* Card 2: Active Corridor Trips */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="p-3 bg-white rounded-3 border h-100"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div className="d-flex align-items-center justify-content-between text-muted mb-2">
              <span className="fw-medium" style={{ fontSize: '0.8125rem', color: '#334155' }}>Active Corridor Trips</span>
              <Bus size={16} color="#94A3B8" />
            </div>
            <div className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#0F172A', lineHeight: 1.1 }}>
              {stats.activeBookings || 48} Runs
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              +6 scheduled today
            </div>
          </div>
        </div>

        {/* Card 3: Commercial Fleet Coaches */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="p-3 bg-white rounded-3 border h-100"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div className="d-flex align-items-center justify-content-between text-muted mb-2">
              <span className="fw-medium" style={{ fontSize: '0.8125rem', color: '#334155' }}>Commercial Coaches</span>
              <Truck size={16} color="#94A3B8" />
            </div>
            <div className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#0F172A', lineHeight: 1.1 }}>
              {stats.availableVehicles || 6} Coaches
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              {stats.utilizationRate || 94}% road ready • AIS-140 GPS
            </div>
          </div>
        </div>

        {/* Card 4: On-Time Punctuality */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="p-3 bg-white rounded-3 border h-100"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div className="d-flex align-items-center justify-content-between text-muted mb-2">
              <span className="fw-medium" style={{ fontSize: '0.8125rem', color: '#334155' }}>On-Time Punctuality</span>
              <TrendingUp size={16} color="#94A3B8" />
            </div>
            <div className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#0F172A', lineHeight: 1.1 }}>
              96.4%
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              +2.8% on-time departure rate
            </div>
          </div>
        </div>
      </div>

      {/* FLEET CORRIDOR THROUGHPUT CHART CARD */}
      <div
        className="p-4 bg-white rounded-3 border mb-4"
        style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
      >
        <div className="mb-3">
          <h5 className="fw-bold mb-0" style={{ fontSize: '1rem', color: '#0F172A' }}>
            Fleet Corridor Throughput
          </h5>
          <p className="text-muted small mb-0" style={{ fontSize: '0.8125rem' }}>
            Scheduled passenger dispatches vs completed arrivals over the last eight weeks
          </p>
        </div>

        <div style={{ height: 200, width: '100%', position: 'relative' }}>
          <svg viewBox="0 0 900 200" fill="none" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="areaCurveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E293B" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#1E293B" stopOpacity="0.01" />
              </linearGradient>
            </defs>
            {/* Horizontal Grid lines */}
            <line x1="40" y1="30" x2="880" y2="30" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="40" y1="75" x2="880" y2="75" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="40" y1="120" x2="880" y2="120" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="40" y1="165" x2="880" y2="165" stroke="#F1F5F9" strokeWidth="1" />

            {/* Y Axis tick labels */}
            <text x="15" y="34" fill="#94A3B8" fontSize="10">60</text>
            <text x="15" y="79" fill="#94A3B8" fontSize="10">45</text>
            <text x="15" y="124" fill="#94A3B8" fontSize="10">30</text>
            <text x="15" y="169" fill="#94A3B8" fontSize="10">15</text>
            <text x="22" y="195" fill="#94A3B8" fontSize="10">0</text>

            {/* Filled Area for Completed */}
            <path
              d="M 50 135 C 160 130, 240 105, 360 120 C 470 135, 560 95, 680 75 C 780 60, 830 50, 880 48 L 880 195 L 50 195 Z"
              fill="url(#areaCurveGrad)"
            />

            {/* Solid Completed Line */}
            <path
              d="M 50 135 C 160 130, 240 105, 360 120 C 470 135, 560 95, 680 75 C 780 60, 830 50, 880 48"
              stroke="#0F172A"
              strokeWidth="2.5"
              fill="none"
            />

            {/* Dashed Opened Line */}
            <path
              d="M 50 115 C 150 95, 260 145, 380 148 C 500 120, 600 50, 720 52 C 800 54, 840 75, 880 85"
              stroke="#64748B"
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
            <span style={{ width: 10, height: 10, background: '#64748B', display: 'inline-block', borderRadius: 2 }} />
            <span>Scheduled Departures</span>
          </div>
          <div className="d-flex align-items-center gap-1.5">
            <span style={{ width: 10, height: 10, background: '#0F172A', display: 'inline-block', borderRadius: 2 }} />
            <span>Completed Arrivals</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: 2 COLUMNS (Active Corridor Operations & Recent Fleet Activity) */}
      <div className="row g-4">
        {/* Left Column: Active Corridor Operations */}
        <div className="col-12 col-lg-6">
          <div
            className="p-4 bg-white rounded-3 border h-100"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div className="mb-4">
              <h5 className="fw-bold mb-0" style={{ fontSize: '1rem', color: '#0F172A' }}>
                Active Corridor Operations
              </h5>
              <p className="text-muted small mb-0" style={{ fontSize: '0.8125rem' }}>
                Real-time highway progress & live GPS telematics
              </p>
            </div>

            <div className="d-flex flex-column gap-4">
              {/* Corridor 1 */}
              <div>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <div className="fw-bold" style={{ fontSize: '0.875rem', color: '#0F172A' }}>
                    Patna → Purnea Express (BR-01-EXP-1102)
                  </div>
                  <span
                    className="badge rounded-pill px-2.5 py-1 text-white"
                    style={{ background: '#0F172A', fontSize: '0.6875rem', fontWeight: 600 }}
                  >
                    In Transit
                  </span>
                </div>
                <div className="text-muted small mb-2" style={{ fontSize: '0.8125rem' }}>
                  42/45 seats booked • GPS highway telemetry live
                </div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="progress flex-grow-1" style={{ height: 6, background: '#F1F5F9' }}>
                    <div className="progress-bar" style={{ width: '75%', background: '#0F172A' }} />
                  </div>
                  <span className="tabular-nums text-muted" style={{ fontSize: '0.75rem', minWidth: 32 }}>75%</span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <span
                      className="rounded-circle text-white d-flex align-items-center justify-content-center border border-2 border-white"
                      style={{ width: 22, height: 22, background: '#246BFD', fontSize: '0.6rem', fontWeight: 600 }}
                    >
                      RK
                    </span>
                    <span
                      className="rounded-circle text-white d-flex align-items-center justify-content-center border border-2 border-white"
                      style={{ width: 22, height: 22, background: '#10B981', fontSize: '0.6rem', fontWeight: 600, marginLeft: -6 }}
                    >
                      SV
                    </span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    ETA 18:30 Today
                  </span>
                </div>
              </div>

              {/* Corridor 2 */}
              <div className="pt-3 border-top" style={{ borderColor: '#F1F5F9' }}>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <div className="fw-bold" style={{ fontSize: '0.875rem', color: '#0F172A' }}>
                    Delhi → Jaipur Luxury Sleeper (DL-01-SLP-3904)
                  </div>
                  <span
                    className="badge rounded-pill px-2.5 py-1 text-secondary"
                    style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', fontSize: '0.6875rem', fontWeight: 600 }}
                  >
                    Boarding
                  </span>
                </div>
                <div className="text-muted small mb-2" style={{ fontSize: '0.8125rem' }}>
                  Manifest verification & luggage intake at terminal
                </div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="progress flex-grow-1" style={{ height: 6, background: '#F1F5F9' }}>
                    <div className="progress-bar" style={{ width: '35%', background: '#0F172A' }} />
                  </div>
                  <span className="tabular-nums text-muted" style={{ fontSize: '0.75rem', minWidth: 32 }}>35%</span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <span
                      className="rounded-circle text-white d-flex align-items-center justify-content-center border border-2 border-white"
                      style={{ width: 22, height: 22, background: '#6366F1', fontSize: '0.6rem', fontWeight: 600 }}
                    >
                      MN
                    </span>
                    <span
                      className="rounded-circle text-white d-flex align-items-center justify-content-center border border-2 border-white"
                      style={{ width: 22, height: 22, background: '#EC4899', fontSize: '0.6rem', fontWeight: 600, marginLeft: -6 }}
                    >
                      AP
                    </span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Departure 21:00
                  </span>
                </div>
              </div>

              {/* Corridor 3 */}
              <div className="pt-3 border-top" style={{ borderColor: '#F1F5F9' }}>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <div className="fw-bold" style={{ fontSize: '0.875rem', color: '#0F172A' }}>
                    Mumbai → Pune Superfast (MH-02-VOL-8811)
                  </div>
                  <span
                    className="badge rounded-pill px-2.5 py-1 text-white"
                    style={{ background: '#0F172A', fontSize: '0.6875rem', fontWeight: 600 }}
                  >
                    In Transit
                  </span>
                </div>
                <div className="text-muted small mb-2" style={{ fontSize: '0.8125rem' }}>
                  Fastag automated clearance at Expressway toll
                </div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="progress flex-grow-1" style={{ height: 6, background: '#F1F5F9' }}>
                    <div className="progress-bar" style={{ width: '88%', background: '#0F172A' }} />
                  </div>
                  <span className="tabular-nums text-muted" style={{ fontSize: '0.75rem', minWidth: 32 }}>88%</span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <span
                      className="rounded-circle text-white d-flex align-items-center justify-content-center border border-2 border-white"
                      style={{ width: 22, height: 22, background: '#0EA5E9', fontSize: '0.6rem', fontWeight: 600 }}
                    >
                      AR
                    </span>
                    <span
                      className="rounded-circle text-white d-flex align-items-center justify-content-center border border-2 border-white"
                      style={{ width: 22, height: 22, background: '#10B981', fontSize: '0.6rem', fontWeight: 600, marginLeft: -6 }}
                    >
                      SK
                    </span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    ETA 14:15 Today
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Fleet Activity */}
        <div className="col-12 col-lg-6">
          <div
            className="p-4 bg-white rounded-3 border h-100"
            style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <div className="mb-4">
              <h5 className="fw-bold mb-0" style={{ fontSize: '1rem', color: '#0F172A' }}>
                Recent Fleet Activity
              </h5>
              <p className="text-muted small mb-0" style={{ fontSize: '0.8125rem' }}>
                Live telemetry, manifest verifications, and fleet alerts
              </p>
            </div>

            <div className="d-flex flex-column gap-3.5">
              {/* Activity 1 */}
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 34, height: 34, background: '#2563EB', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  RK
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontSize: '0.84rem', color: '#1E293B', lineHeight: 1.4 }}>
                    <strong>Rajesh Kumar</strong> departed on-time for trip &ldquo;#DRV-102 (Patna → Purnea)&rdquo;
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    18 mins ago
                  </div>
                </div>
              </div>

              {/* Activity 2 */}
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 34, height: 34, background: '#059669', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  FT
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontSize: '0.84rem', color: '#1E293B', lineHeight: 1.4 }}>
                    <strong>Fastag Gateway</strong> toll auto-verified &ldquo;₹340 at Khed-Shivapur Toll Plaza&rdquo;
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    42 mins ago
                  </div>
                </div>
              </div>

              {/* Activity 3 */}
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 34, height: 34, background: '#7C3AED', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  SV
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontSize: '0.84rem', color: '#1E293B', lineHeight: 1.4 }}>
                    <strong>Sunil Verma</strong> verified 38 passenger boarding passes for &ldquo;Delhi → Jaipur&rdquo;
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    1 hour ago
                  </div>
                </div>
              </div>

              {/* Activity 4 */}
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 34, height: 34, background: '#DB2777', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  AR
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontSize: '0.84rem', color: '#1E293B', lineHeight: 1.4 }}>
                    <strong>Anil Rao</strong> completed arrival &ldquo;#DRV-103 (Mumbai → Pune)&rdquo; with zero delays
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    3 hours ago
                  </div>
                </div>
              </div>

              {/* Activity 5 */}
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 34, height: 34, background: '#D97706', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  RC
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontSize: '0.84rem', color: '#1E293B', lineHeight: 1.4 }}>
                    <strong>RTO Compliance Audit</strong> certified AIS-140 GPS fitness for &ldquo;BR-01-VOL-2401&rdquo;
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    5 hours ago
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
