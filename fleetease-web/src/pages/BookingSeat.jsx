import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import SeatMap from '../components/SeatMap';
import api from '../utils/api';
import { ArrowLeft, ArrowRight, Bus, Check, MapPin, User, ShieldCheck } from 'lucide-react';

export default function BookingSeat() {
  const { state } = useLocation();
  const nav = useNavigate();
  const route = state?.route;
  const schedule = state?.schedule || null;

  const [step, setStep] = useState(1); // 1 Seats, 2 Stops, 3 Passenger, 4 Review
  const [selected, setSelected] = useState([]);
  const [layoutType, setLayoutType] = useState(
    route?.type?.toLowerCase().includes('sleeper') ? '2x1_sleeper' : '2x2'
  );
  const [upperDeck, setUpperDeck] = useState(layoutType !== '2x2');
  const [stops, setStops] = useState([]);
  const [boarding, setBoarding] = useState('');
  const [dropping, setDropping] = useState('');
  const [passengers, setPassengers] = useState([]);
  const [farePerSeat, setFarePerSeat] = useState(schedule?.fare || 650);
  const [disabledSeats, setDisabledSeats] = useState([]);

  useEffect(() => {
    const sid = schedule?.schedule_id || route?.route_id;
    if (sid) {
      api
        .get(`/admin/seats/${sid}`)
        .then((r) => {
          if (Array.isArray(r.data)) setDisabledSeats(r.data);
        })
        .catch(() => {});
    }
  }, [schedule, route]);

  useEffect(() => {
    if (!route) return;
    api
      .get(`/trips/${route.route_id || 1}/stops`)
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : [];
        if (list.length > 0) {
          setStops(list);
          setBoarding(list[0]?.name || route.source);
          setDropping(list[list.length - 1]?.name || route.destination);
        } else {
          setStops([
            { stop_id: 1, name: `${route.source} Terminal` },
            { stop_id: 2, name: `${route.source} Bypass` },
            { stop_id: 3, name: `${route.destination} Junction` },
            { stop_id: 4, name: `${route.destination} Bus Stand` },
          ]);
          setBoarding(`${route.source} Terminal`);
          setDropping(`${route.destination} Bus Stand`);
        }
      })
      .catch(() => {
        setStops([
          { stop_id: 1, name: `${route.source} Terminal` },
          { stop_id: 2, name: `${route.source} Bypass` },
          { stop_id: 3, name: `${route.destination} Junction` },
          { stop_id: 4, name: `${route.destination} Bus Stand` },
        ]);
        setBoarding(`${route.source} Terminal`);
        setDropping(`${route.destination} Bus Stand`);
      });
  }, [route]);

  const toggle = (seatLabel) => {
    setSelected((prev) => {
      const next = prev.includes(seatLabel)
        ? prev.filter((s) => s !== seatLabel)
        : [...prev, seatLabel];

      // Keep passengers array in sync
      const mapped = next.map(
        (label, i) => passengers[i] || { name: '', age: '', gender: 'Male', seat: label }
      );
      setPassengers(mapped);
      return next;
    });
  };

  const updatePassenger = (index, field, value) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const next = () => setStep((s) => Math.min(4, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const proceedToCheckout = () => {
    if (!route) return nav('/search');
    nav('/checkout', {
      state: {
        route,
        schedule,
        seats: selected,
        boarding,
        dropping,
        passengers,
        farePerSeat,
      },
    });
  };

  const totalFare = selected.length * farePerSeat;

  if (!route) {
    return (
      <div className="container py-5 text-center">
        <Bus size={36} color="var(--fe-text-muted)" className="mb-3" />
        <h4>No route selected</h4>
        <p className="text-muted">Please search and select a departure to book seats.</p>
        <Link to="/search" className="btn btn-accent">
          Go to route search
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Route Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--fe-border)' }}>
        <div>
          <button
            onClick={() => nav(-1)}
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 mb-2"
          >
            <ArrowLeft size={13} />
            <span>Back to departures</span>
          </button>
          <h2 className="mb-1" style={{ fontSize: '1.375rem' }}>
            {route.source} → {route.destination}
          </h2>
          <div className="text-muted small">
            {schedule?.bus_type || route.type || 'AC Express'} • {schedule?.departure ? new Date(schedule.departure).toLocaleDateString() : 'Scheduled Service'}
          </div>
        </div>

        <div className="text-end d-none d-md-block">
          <span className="text-muted small">Base fare</span>
          <div className="price fw-semibold" style={{ fontSize: '1.25rem', color: 'var(--fe-accent)' }}>
            ₹{farePerSeat} / seat
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="d-flex align-items-center gap-2 mb-4 overflow-auto pb-1" style={{ borderBottom: '1px solid var(--fe-border)' }}>
        {[
          { num: 1, label: 'Select seats' },
          { num: 2, label: 'Boarding & Drop' },
          { num: 3, label: 'Passenger details' },
          { num: 4, label: 'Review booking' },
        ].map((s) => {
          const isActive = step === s.num;
          const isDone = step > s.num;

          return (
            <button
              key={s.num}
              type="button"
              className="d-flex align-items-center gap-2 px-3 py-2 border-0 bg-transparent"
              style={{
                borderBottom: isActive ? '2px solid var(--fe-accent)' : '2px solid transparent',
                color: isActive ? 'var(--fe-accent)' : isDone ? 'var(--fe-text-primary)' : 'var(--fe-text-muted)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (s.num < step) setStep(s.num);
                else if (s.num === 2 && selected.length) setStep(2);
                else if (s.num === 3 && selected.length && boarding && dropping) setStep(3);
                else if (s.num === 4 && selected.length && passengers.every((p) => p.name && p.age)) setStep(4);
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: isActive ? 'var(--fe-accent)' : isDone ? 'var(--fe-success)' : 'var(--fe-surface-raised)',
                  color: isActive || isDone ? '#ffffff' : 'var(--fe-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6875rem',
                }}
              >
                {isDone ? <Check size={11} strokeWidth={3} /> : s.num}
              </span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      <div className="row g-4">
        {/* Main Step Content */}
        <div className="col-lg-8">
          {/* Step 1: Select Seats */}
          {step === 1 && (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                  Choose your seat(s)
                </div>
                <div className="d-flex align-items-center gap-2">
                  <select
                    className="form-select form-select-sm"
                    value={layoutType}
                    onChange={(e) => {
                      setLayoutType(e.target.value);
                      setUpperDeck(e.target.value !== '2x2');
                    }}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    <option value="2x2">2x2 Seater Coach</option>
                    <option value="2x1_sleeper">2x1 Sleeper Coach</option>
                    <option value="2x1_luxury">2x1 Luxury Sleeper</option>
                  </select>
                </div>
              </div>

              <SeatMap
                layoutType={layoutType}
                upperDeck={upperDeck}
                rows={10}
                selected={selected}
                disabledSeats={disabledSeats}
                onToggle={toggle}
              />

              <div className="d-flex justify-content-end mt-4">
                <button
                  className="btn btn-accent d-flex align-items-center gap-2 px-4"
                  disabled={!selected.length}
                  onClick={next}
                >
                  <span>Continue ({selected.length} {selected.length === 1 ? 'seat' : 'seats'})</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Boarding & Dropping Points */}
          {step === 2 && (
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 16 }}>
                Select boarding and drop stations
              </div>

              <div className="card p-3 p-md-4 mb-3">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center gap-1">
                      <MapPin size={13} color="var(--fe-accent)" />
                      <span>Boarding point ({route.source})</span>
                    </label>
                    <select
                      className="form-select"
                      value={boarding}
                      onChange={(e) => setBoarding(e.target.value)}
                    >
                      {stops.map((s) => (
                        <option key={`b-${s.stop_id}-${s.name}`} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <div className="text-muted small mt-1">Please report 15 mins prior to departure</div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center gap-1">
                      <MapPin size={13} color="var(--fe-accent)" />
                      <span>Dropping point ({route.destination})</span>
                    </label>
                    <select
                      className="form-select"
                      value={dropping}
                      onChange={(e) => setDropping(e.target.value)}
                    >
                      {stops.map((s) => (
                        <option key={`d-${s.stop_id}-${s.name}`} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <div className="text-muted small mt-1">Destination drop-off location</div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-outline-secondary" onClick={prev}>
                  Back to seats
                </button>
                <button
                  className="btn btn-accent d-flex align-items-center gap-2 px-4"
                  disabled={!boarding || !dropping}
                  onClick={next}
                >
                  <span>Passenger details</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Passenger Details */}
          {step === 3 && (
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 16 }}>
                Passenger manifest
              </div>

              <div className="d-flex flex-column gap-3 mb-4">
                {passengers.map((p, idx) => (
                  <div key={p.seat || idx} className="card p-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fw-semibold" style={{ fontSize: '0.875rem' }}>
                        Passenger {idx + 1}
                      </span>
                      <span className="badge badge-subtle-primary">Seat {p.seat}</span>
                    </div>

                    <div className="row g-2">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Full name</label>
                        <input
                          className="form-control form-control-sm"
                          placeholder="As on Government ID"
                          value={p.name}
                          onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-6 col-md-3">
                        <label className="form-label">Age</label>
                        <input
                          type="number"
                          className="form-control form-control-sm tabular-nums"
                          placeholder="Years"
                          min={1}
                          max={110}
                          value={p.age}
                          onChange={(e) => updatePassenger(idx, 'age', e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-6 col-md-3">
                        <label className="form-label">Gender</label>
                        <select
                          className="form-select form-select-sm"
                          value={p.gender}
                          onChange={(e) => updatePassenger(idx, 'gender', e.target.value)}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-outline-secondary" onClick={prev}>
                  Back
                </button>
                <button
                  className="btn btn-accent d-flex align-items-center gap-2 px-4"
                  disabled={passengers.some((p) => !p.name || !p.age)}
                  onClick={next}
                >
                  <span>Review booking</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review Booking */}
          {step === 4 && (
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 16 }}>
                Review booking details
              </div>

              <div className="card p-4 mb-4">
                <div className="row g-3 mb-3 pb-3 border-bottom" style={{ borderColor: 'var(--fe-border)' }}>
                  <div className="col-6">
                    <div className="text-muted small">Origin & Boarding</div>
                    <div className="fw-semibold">{route.source}</div>
                    <div className="small text-secondary">{boarding}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted small">Destination & Drop</div>
                    <div className="fw-semibold">{route.destination}</div>
                    <div className="small text-secondary">{dropping}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-muted small mb-2">Passengers & Seats</div>
                  {passengers.map((p, i) => (
                    <div key={i} className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'var(--fe-border-subtle)', fontSize: '0.875rem' }}>
                      <span>
                        {p.name} ({p.gender}, {p.age} yrs)
                      </span>
                      <span className="fw-semibold tabular-nums">Seat {p.seat}</span>
                    </div>
                  ))}
                </div>

                <div className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: 'var(--fe-success-subtle)', border: '1px solid var(--fe-success-border)', fontSize: '0.8125rem', color: 'var(--fe-success)' }}>
                  <ShieldCheck size={16} />
                  <span>Free cancellation up to 6 hours before departure time.</span>
                </div>
              </div>

              <div className="d-flex justify-content-between">
                <button className="btn btn-outline-secondary" onClick={prev}>
                  Back
                </button>
                <button
                  className="btn btn-accent d-flex align-items-center gap-2 px-4"
                  onClick={proceedToCheckout}
                >
                  <span>Proceed to checkout</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Drawer (Right Column) */}
        <div className="col-lg-4">
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--fe-border)',
              borderRadius: 'var(--fe-radius-lg)',
              padding: 20,
              boxShadow: 'var(--fe-shadow-sm)',
              position: 'sticky',
              top: 80,
            }}
          >
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 12, color: 'var(--fe-text-primary)' }}>
              Booking Summary
            </div>

            <div className="pb-3 border-bottom mb-3" style={{ borderColor: 'var(--fe-border)' }}>
              <div className="fw-semibold mb-1" style={{ fontSize: '0.9375rem' }}>
                {route.source} → {route.destination}
              </div>
              <div className="text-muted small">
                {schedule?.bus_type || route.type || 'AC Express'}
              </div>
            </div>

            <div className="d-flex flex-column gap-2 mb-3" style={{ fontSize: '0.8125rem' }}>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Seats selected</span>
                <span className="fw-semibold tabular-nums">
                  {selected.length ? selected.join(', ') : 'None'}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Fare per seat</span>
                <span className="tabular-nums">₹{farePerSeat}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Passenger count</span>
                <span className="tabular-nums">{selected.length}</span>
              </div>
            </div>

            <div className="pt-3 border-top d-flex justify-content-between align-items-baseline mb-3" style={{ borderColor: 'var(--fe-border)' }}>
              <span className="fw-semibold" style={{ fontSize: '0.9375rem' }}>Total Fare</span>
              <div className="price fw-semibold" style={{ fontSize: '1.375rem', color: 'var(--fe-accent)' }}>
                ₹{totalFare}
              </div>
            </div>

            <div className="text-muted small text-center">
              Includes all taxes, tolls & passenger insurance
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}