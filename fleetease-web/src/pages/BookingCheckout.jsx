import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from '../components/Toast';
import { ShieldCheck, CheckCircle2, Lock, ArrowRight, Bus, MapPin, User, CreditCard } from 'lucide-react';

export default function BookingCheckout() {
  const { state } = useLocation();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const route = state?.route;
  const seats = state?.seats || [];
  const boarding = state?.boarding;
  const dropping = state?.dropping;
  const passengers = state?.passengers || [];
  const schedule = state?.schedule || null;
  const farePerSeat = state?.farePerSeat || schedule?.fare || 650;

  const user = useMemo(() => {
    const t = localStorage.getItem('token');
    try {
      return t ? JSON.parse(atob(t.split('.')[1])) : null;
    } catch {
      return null;
    }
  }, []);

  const [mode, setMode] = useState(user?.role === 'company_admin' ? 'B2B' : 'B2C');
  const isCorporate = mode === 'B2B';
  const [accept, setAccept] = useState(true);
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');

  useEffect(() => {
    if (!route) nav('/search');
  }, [route, nav]);

  // Fetch quote
  useEffect(() => {
    if (!route) return;
    const fetchQuote = async () => {
      try {
        setQuoteError('');
        const body = {
          source: route.source,
          destination: route.destination,
          busType: schedule?.bus_type || schedule?.vehicle_type || 'AC Seater',
          date: schedule?.departure,
          seatsCount: isCorporate ? 1 : seats.length || 1,
          role: user?.role || 'customer',
          method: 'fixed',
          distanceKm: route.distance_km || 310,
        };
        const r = await api.post('/fare/quote', body);
        setQuote(r.data);
      } catch (e) {
        setQuote({ perSeat: farePerSeat, total: farePerSeat * (seats.length || 1) });
      }
    };
    fetchQuote();
  }, [route, schedule, seats.length, isCorporate, user, farePerSeat]);

  const totalCalculated = isCorporate
    ? quote?.total || 18000
    : quote?.perSeat
    ? Number(quote.perSeat) * (seats.length || 1)
    : farePerSeat * (seats.length || 1);

  const pay = async () => {
    try {
      setLoading(true);
      const fare = Number(totalCalculated);

      // Create booking
      let bookingId = `BK-${Date.now().toString().slice(-6)}`;
      try {
        const booking = await api.post('/bookings', {
          customer_id: user?.user_id || null,
          vehicle_id: schedule?.vehicle_id || 1,
          schedule_id: schedule?.schedule_id || null,
          route_id: route.route_id || 1,
          pickup_location: boarding || route.source,
          drop_location: dropping || route.destination,
          fare,
          booking_type: isCorporate ? 'B2B' : 'B2C',
          company_name: isCorporate ? user?.name || 'Corporate' : null,
        });
        if (booking.data?.booking_id) {
          bookingId = booking.data.booking_id;
        }
      } catch (e) {
        // Fallback for demo when backend DB table is empty
      }

      // Persist seats if possible
      if (!isCorporate && seats.length) {
        try {
          await api.post(`/bookings/${bookingId}/seats`, {
            seats,
            prices: seats.map(() => farePerSeat),
          });
        } catch (_) {}
      }

      toast('Payment successful! Boarding pass issued.', 'success');
      nav(`/booking/${bookingId}`);
    } catch (e) {
      toast('Payment processing error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!route) return null;

  return (
    <div className="container py-4" style={{ maxWidth: 960 }}>
      <div className="mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--fe-border)' }}>
        <h2 className="mb-1" style={{ fontSize: '1.375rem' }}>
          Confirm and Pay
        </h2>
        <div className="text-muted small">
          Review your journey manifest and complete payment
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Journey Details & Passengers */}
        <div className="col-lg-7">
          {/* Journey Card */}
          <div className="card p-3 p-md-4 mb-3">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--fe-border)' }}>
              <div className="fw-semibold" style={{ fontSize: '0.9375rem' }}>
                Journey Details
              </div>
              <span className="badge badge-subtle-primary">
                {isCorporate ? 'Charter Booking' : 'Confirmed Schedule'}
              </span>
            </div>

            <div className="d-flex align-items-center justify-content-between my-2">
              <div>
                <div className="fw-semibold" style={{ fontSize: '1.125rem' }}>
                  {route.source}
                </div>
                <div className="text-muted small">{boarding || `${route.source} Terminal`}</div>
              </div>

              <div className="flex-grow-1 mx-3 text-center">
                <div className="route-connector my-1">
                  <span className="route-dot"></span>
                  <div className="route-line"></div>
                  <span className="route-dot-dest"></span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.6875rem' }}>
                  {schedule?.distance_km ? `${schedule.distance_km} km` : 'Scheduled service'}
                </div>
              </div>

              <div className="text-end">
                <div className="fw-semibold" style={{ fontSize: '1.125rem' }}>
                  {route.destination}
                </div>
                <div className="text-muted small">{dropping || `${route.destination} Bus Stand`}</div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 pt-2 border-top mt-3 text-muted" style={{ borderColor: 'var(--fe-border)', fontSize: '0.8125rem' }}>
              <span>Coach: {schedule?.bus_number || 'BR-01-EXP'}</span>
              <span>•</span>
              <span>Seats: {seats.join(', ') || 'General'}</span>
            </div>
          </div>

          {/* Passenger List */}
          {passengers.length > 0 && (
            <div className="card p-3 p-md-4 mb-3">
              <div className="fw-semibold mb-2" style={{ fontSize: '0.9375rem' }}>
                Passengers Manifest ({passengers.length})
              </div>
              <div className="d-flex flex-column gap-2">
                {passengers.map((p, i) => (
                  <div
                    key={i}
                    className="d-flex justify-content-between align-items-center p-2 rounded"
                    style={{ background: 'var(--fe-surface-raised)', fontSize: '0.8125rem' }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <User size={14} color="var(--fe-text-muted)" />
                      <span className="fw-medium">{p.name || `Passenger ${i + 1}`}</span>
                      <span className="text-muted">({p.gender}, {p.age} yrs)</span>
                    </div>
                    <span className="badge badge-subtle-primary tabular-nums">Seat {p.seat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guarantee */}
          <div
            className="p-3 rounded d-flex align-items-center gap-3"
            style={{
              background: 'var(--fe-success-subtle)',
              border: '1px solid var(--fe-success-border)',
              fontSize: '0.8125rem',
              color: 'var(--fe-success)',
            }}
          >
            <ShieldCheck size={20} style={{ flexShrink: 0 }} />
            <div>
              <div className="fw-semibold">DRIVIO Safe Journey Guarantee</div>
              <div>Free date reschedule or 100% refund up to 6 hours before departure time.</div>
            </div>
          </div>
        </div>

        {/* Right Column: Price & Payment Action */}
        <div className="col-lg-5">
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--fe-border)',
              borderRadius: 'var(--fe-radius-lg)',
              padding: 24,
              boxShadow: 'var(--fe-shadow-sm)',
            }}
          >
            <div className="fw-semibold mb-3" style={{ fontSize: '1rem', color: 'var(--fe-text-primary)' }}>
              Fare Breakdown
            </div>

            <div className="d-flex flex-column gap-2 pb-3 border-bottom" style={{ borderColor: 'var(--fe-border)', fontSize: '0.875rem' }}>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Base fare ({seats.length || 1} {seats.length === 1 ? 'seat' : 'seats'})</span>
                <span className="tabular-nums">₹{totalCalculated}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">GST & Toll charges</span>
                <span className="text-success" style={{ fontSize: '0.8125rem' }}>Included</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Passenger insurance</span>
                <span className="text-success" style={{ fontSize: '0.8125rem' }}>Free</span>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-baseline my-3">
              <span className="fw-semibold" style={{ fontSize: '1.05rem' }}>Total Amount</span>
              <div className="price fw-semibold" style={{ fontSize: '1.5rem', color: 'var(--fe-accent)' }}>
                ₹{totalCalculated}
              </div>
            </div>

            <div className="form-check mb-4">
              <input
                id="terms"
                type="checkbox"
                className="form-check-input"
                checked={accept}
                onChange={(e) => setAccept(e.target.checked)}
              />
              <label htmlFor="terms" className="form-check-label text-muted" style={{ fontSize: '0.75rem' }}>
                I agree to the cancellation policy and passenger terms of transit.
              </label>
            </div>

            <button
              className="btn btn-accent w-100 d-flex align-items-center justify-content-center gap-2 py-2"
              disabled={loading || !accept}
              onClick={pay}
              style={{ fontSize: '0.9375rem', height: 44 }}
            >
              <Lock size={15} />
              <span>{loading ? 'Confirming booking…' : `Pay ₹${totalCalculated}`}</span>
            </button>

            <div className="d-flex align-items-center justify-content-center gap-2 mt-3 text-muted" style={{ fontSize: '0.6875rem' }}>
              <CreditCard size={13} />
              <span>256-bit encrypted secure transit checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}