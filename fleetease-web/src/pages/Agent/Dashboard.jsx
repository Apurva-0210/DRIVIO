import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../utils/api';
import {
  Bus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  Search,
  Bell,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Plus,
  Compass,
  FileText,
  User,
  CreditCard,
  Building,
  HelpCircle
} from 'lucide-react';

export default function AgentDashboard() {
  const [stats, setStats] = useState({
    todayBookings: 8,
    pendingPayments: 2,
    totalCustomers: 142,
    availableBuses: 6,
  });
  const [revenue, setRevenue] = useState({ today: 4250, total: 38900 });
  const [searchQuery, setSearchQuery] = useState('');
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, tripsRes, bookingsRes, revRes] = await Promise.all([
          api.get('/agent/dashboard/stats').catch(() => ({ data: {} })),
          api.get('/agent/trips/upcoming').catch(() => ({ data: [] })),
          api.get('/agent/bookings/recent').catch(() => ({ data: [] })),
          api.get('/agent/stats').catch(() => ({ data: {} })),
        ]);

        const rawTrips = Array.isArray(tripsRes.data) && tripsRes.data.length ? tripsRes.data : [
          { id: 1, routeName: 'Patna → Purnea', busNumber: 'BR-01-EXP-1102', departureTime: '06:30 AM', availableSeats: 16, fare: 650, progress: 68 },
          { id: 2, routeName: 'Delhi → Jaipur', busNumber: 'DL-01-EXP-5520', departureTime: '07:00 AM', availableSeats: 22, fare: 480, progress: 45 },
          { id: 3, routeName: 'Mumbai → Pune', busNumber: 'MH-02-VOL-8811', departureTime: '08:00 AM', availableSeats: 12, fare: 350, progress: 90 },
        ];

        const rawBookings = Array.isArray(bookingsRes.data) && bookingsRes.data.length ? bookingsRes.data : [
          { id: 'AG-101', customerName: 'Ramesh Sahay', route: 'Patna → Purnea', seat: '12A,12B', amount: 1300, payment: 'Cash', status: 'confirmed', time: '12 mins ago' },
          { id: 'AG-102', customerName: 'Manish Pandey', route: 'Delhi → Jaipur', seat: '04C', amount: 480, payment: 'UPI', status: 'confirmed', time: '35 mins ago' },
          { id: 'AG-103', customerName: 'Kavita Roy', route: 'Mumbai → Pune', seat: '18A', amount: 350, payment: 'Cash', status: 'confirmed', time: '1 hour ago' },
          { id: 'AG-104', customerName: 'Deepak Jha', route: 'Patna → Purnea', seat: '09D', amount: 650, payment: 'Pending', status: 'pending', time: '2 hours ago' },
        ];

        setStats({
          todayBookings: statsRes.data?.todayBookings || 8,
          pendingPayments: statsRes.data?.pendingPayments || 2,
          totalCustomers: statsRes.data?.totalCustomers || 142,
          availableBuses: statsRes.data?.availableBuses || 6,
        });
        setUpcomingTrips(rawTrips);
        setRecentBookings(rawBookings);
        setRevenue({
          today: Number(revRes?.data?.today?.amt || 4250),
          total: Number(revRes?.data?.total?.amt || 38900),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [location]);

  const filteredBookings = recentBookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <div className="text-muted mt-2 small">Loading Agent Console…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
        {/* Top bar with greeting & action buttons */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-warning-subtle text-warning-emphasis border px-2 py-1" style={{ fontSize: '0.75rem' }}>
                Counter Terminal Online
              </span>
              <span className="text-muted small">Terminal ID: DRV-AG-PATNA-01</span>
            </div>
            <h1 className="h4 fw-bold mb-0 mt-1" style={{ color: '#0F172A', letterSpacing: '-0.3px' }}>
              Station Counter Console
            </h1>
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
              Station Agent: Sanjay Verma • Regional Ticket Dispatch
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="input-group" style={{ width: 240 }}>
              <span className="input-group-text bg-white border-end-0">
                <Search size={14} color="#94A3B8" />
              </span>
              <input
                type="text"
                className="form-control form-control-sm border-start-0 ps-0"
                placeholder="Search passenger or PNR…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link to="/agent/trips" className="btn btn-sm btn-accent text-white d-flex align-items-center gap-1 shadow-sm">
              <Plus size={15} /> <span>New Booking</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI METRIC CARDS */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 bg-white rounded-3 border" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div className="d-flex align-items-center justify-content-between text-muted mb-2" style={{ fontSize: '0.8125rem' }}>
                <span className="fw-medium">Today&apos;s Bookings</span>
                <Ticket size={16} color="#64748B" />
              </div>
              <div className="h4 fw-bold mb-1" style={{ color: '#0F172A' }}>
                {stats.todayBookings}
              </div>
              <div className="small text-success d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                <span>+3 from morning shift</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 bg-white rounded-3 border" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div className="d-flex align-items-center justify-content-between text-muted mb-2" style={{ fontSize: '0.8125rem' }}>
                <span className="fw-medium">Today&apos;s Counter Revenue</span>
                <DollarSign size={16} color="#64748B" />
              </div>
              <div className="h4 fw-bold mb-1" style={{ color: '#0F172A' }}>
                ₹{revenue.today.toLocaleString()}
              </div>
              <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                Commission (5%): ₹{(revenue.today * 0.05).toFixed(0)}
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 bg-white rounded-3 border" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div className="d-flex align-items-center justify-content-between text-muted mb-2" style={{ fontSize: '0.8125rem' }}>
                <span className="fw-medium">Total Passengers Served</span>
                <Users size={16} color="#64748B" />
              </div>
              <div className="h4 fw-bold mb-1" style={{ color: '#0F172A' }}>
                {stats.totalCustomers}
              </div>
              <div className="small text-primary d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                <span>94% repeat rate</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 bg-white rounded-3 border" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div className="d-flex align-items-center justify-content-between text-muted mb-2" style={{ fontSize: '0.8125rem' }}>
                <span className="fw-medium">Available Corridor Buses</span>
                <Bus size={16} color="#64748B" />
              </div>
              <div className="h4 fw-bold mb-1" style={{ color: '#0F172A' }}>
                {stats.availableBuses} Fleet Units
              </div>
              <div className="small text-success d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                <span>All routes on schedule</span>
              </div>
            </div>
          </div>
        </div>

        {/* AGENT PERFORMANCE SPLINE CHART */}
        <div className="p-4 bg-white rounded-3 border mb-4" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 className="fw-bold mb-0" style={{ fontSize: '1rem', color: '#0F172A' }}>
                Counter Sales & Ticket Issuance Trend
              </h5>
              <p className="text-muted small mb-0">Daily counter tickets issued vs scheduled booking target</p>
            </div>
            <div className="d-flex align-items-center gap-3 small text-muted" style={{ fontSize: '0.75rem' }}>
              <span className="d-flex align-items-center gap-1">
                <span style={{ width: 10, height: 10, background: '#0F172A', display: 'inline-block', borderRadius: 2 }} />
                <span>Tickets Sold</span>
              </span>
              <span className="d-flex align-items-center gap-1">
                <span style={{ width: 14, height: 2, borderTop: '2px dashed #94A3B8', display: 'inline-block' }} />
                <span>Target Baseline</span>
              </span>
            </div>
          </div>

          <div style={{ height: 180, width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 900 180" fill="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="agentChartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#246BFD" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#246BFD" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 50 130 Q 150 110, 250 90 T 450 70 T 650 45 T 850 30 L 850 170 L 50 170 Z"
                fill="url(#agentChartGradient)"
              />
              <path
                d="M 50 130 Q 150 110, 250 90 T 450 70 T 650 45 T 850 30"
                stroke="#246BFD"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M 50 100 Q 150 120, 250 110 T 450 85 T 650 60 T 850 55"
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

        {/* BOTTOM SECTION: CORRIDOR SCHEDULES & COUNTER MANIFEST */}
        <div className="row g-4">
          {/* Upcoming Corridor Departures */}
          <div className="col-12 col-lg-7">
            <div className="p-4 bg-white rounded-3 border h-100" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h5 className="fw-bold mb-0" style={{ fontSize: '1rem', color: '#0F172A' }}>
                    Departures & Available Seats
                  </h5>
                  <p className="text-muted small mb-0">High-demand intercity departures from your terminal</p>
                </div>
                <Link to="/agent/trips" className="btn btn-xs btn-outline-primary py-1 px-2" style={{ fontSize: '0.75rem' }}>
                  Open Seat Selector
                </Link>
              </div>

              <div className="d-flex flex-column gap-3">
                {upcomingTrips.map((trip) => (
                  <div key={trip.id} className="p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong style={{ color: '#0F172A', fontSize: '0.9375rem' }}>{trip.routeName}</strong>
                      <span className="badge bg-white text-primary border">{trip.busNumber}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center text-muted small mb-2" style={{ fontSize: '0.8125rem' }}>
                      <span>Departs: {trip.departureTime} • Fare: ₹{trip.fare}</span>
                      <strong className="text-success">{trip.availableSeats} seats open</strong>
                    </div>
                    {/* Booking Load Factor Progress Bar */}
                    <div className="progress" style={{ height: 6 }}>
                      <div className="progress-bar bg-primary" style={{ width: `${trip.progress || 60}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Counter Bookings */}
          <div className="col-12 col-lg-5">
            <div className="p-4 bg-white rounded-3 border h-100" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h5 className="fw-bold mb-0" style={{ fontSize: '1rem', color: '#0F172A' }}>
                    Recent Counter Sales
                  </h5>
                  <p className="text-muted small mb-0">Latest offline ticket receipts</p>
                </div>
                {/* Status Filter Dropdown */}
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto', fontSize: '0.75rem' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="d-flex flex-column gap-3">
                {filteredBookings.map((b) => (
                  <div key={b.id} className="d-flex align-items-center justify-content-between pb-2 border-bottom" style={{ borderColor: '#F1F5F9' }}>
                    <div>
                      <div className="fw-semibold" style={{ fontSize: '0.8125rem', color: '#0F172A' }}>
                        {b.customerName}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {b.route} • Seats: {b.seat}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold" style={{ fontSize: '0.8125rem', color: '#0F172A' }}>
                        ₹{b.amount}
                      </div>
                      <span
                        className={`badge ${
                          b.status === 'confirmed' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'
                        }`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {b.status}
                      </span>
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
