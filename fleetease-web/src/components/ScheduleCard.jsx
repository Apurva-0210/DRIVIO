import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Bus, Clock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function ScheduleCard({ schedule, onSelect }) {
  const dep = new Date(schedule.departure);
  const arr = schedule.arrival ? new Date(schedule.arrival) : null;
  const [perSeat, setPerSeat] = useState(schedule.fare || null);
  const [loadingQuote, setLoadingQuote] = useState(true);

  // Format times nicely (e.g. "07:30" or "7:30 PM")
  const depTime = dep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const arrTime = arr ? arr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : null;
  const depDate = dep.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });

  // Calculate duration if both departure and arrival exist
  let durationStr = '';
  if (arr) {
    const diffMs = arr.getTime() - dep.getTime();
    if (diffMs > 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      durationStr = `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
    }
  }
  if (!durationStr && schedule.distance_km) {
    // Estimating ~45 km/h if arrival time is not explicitly in DB
    const estHours = Math.max(1, Math.round(schedule.distance_km / 45));
    durationStr = `~${estHours}h (${schedule.distance_km} km)`;
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingQuote(true);
        const body = {
          source: schedule.source,
          destination: schedule.destination,
          busType: schedule.bus_type || schedule.vehicle_type || 'AC Seater',
          date: schedule.departure,
          seatsCount: 1,
          role: 'customer',
          method: 'fixed',
          distanceKm: schedule.distance_km,
        };
        const r = await api.post('/fare/quote', body);
        if (!alive) return;
        const val = Number(r.data?.perSeat || r.data?.total || 0);
        setPerSeat(val > 0 ? val : schedule.fare || 650);
      } catch (e) {
        if (alive) {
          setPerSeat(schedule.fare || 650);
        }
      } finally {
        if (alive) setLoadingQuote(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [
    schedule.source,
    schedule.destination,
    schedule.bus_type,
    schedule.vehicle_type,
    schedule.departure,
    schedule.distance_km,
    schedule.fare,
  ]);

  const busType = schedule.bus_type || schedule.vehicle_type || 'AC Express';
  const busNumber = schedule.bus_number || schedule.vehicle_number || 'BR-01-EXP';
  const availableSeats = schedule.available_seats || schedule.capacity || 24;

  return (
    <div
      className="p-3 p-md-4 mb-3"
      style={{
        background: '#ffffff',
        border: '1px solid var(--fe-border)',
        borderRadius: 'var(--fe-radius-lg)',
        boxShadow: 'var(--fe-shadow-xs)',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
      }}
    >
      <div className="row align-items-center g-3">
        {/* Left: Bus & Route Details */}
        <div className="col-lg-8 col-md-7">
          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <span className="badge badge-subtle-primary d-flex align-items-center gap-1">
              <Bus size={12} />
              <span>{busType}</span>
            </span>
            <span className="text-muted tabular-nums" style={{ fontSize: '0.75rem' }}>
              {busNumber}
            </span>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>•</span>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>{depDate}</span>
          </div>

          {/* Route line & timing */}
          <div className="d-flex align-items-center justify-content-between my-3">
            <div>
              <div className="time-stamp fw-semibold" style={{ fontSize: '1.25rem', color: 'var(--fe-text-primary)' }}>
                {depTime}
              </div>
              <div className="fw-medium text-truncate" style={{ fontSize: '0.875rem', color: 'var(--fe-text-secondary)', maxWidth: 160 }}>
                {schedule.source}
              </div>
            </div>

            <div className="flex-grow-1 mx-3 mx-md-4 text-center">
              <div className="text-muted tabular-nums" style={{ fontSize: '0.75rem' }}>
                {durationStr}
              </div>
              <div className="route-connector my-1">
                <span className="route-dot"></span>
                <div className="route-line"></div>
                <span className="route-dot-dest"></span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--fe-text-muted)' }}>
                {schedule.distance_km ? `${schedule.distance_km} km` : 'Scheduled stop'}
              </div>
            </div>

            <div className="text-end">
              <div className="time-stamp fw-semibold" style={{ fontSize: '1.25rem', color: 'var(--fe-text-primary)' }}>
                {arrTime || '—'}
              </div>
              <div className="fw-medium text-truncate" style={{ fontSize: '0.875rem', color: 'var(--fe-text-secondary)', maxWidth: 160 }}>
                {schedule.destination}
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3 text-muted pt-2 border-top" style={{ borderColor: 'var(--fe-border)', fontSize: '0.75rem' }}>
            <span className="tabular-nums" style={{ color: 'var(--fe-success)', fontWeight: 500 }}>
              {availableSeats} seats open
            </span>
            <span>•</span>
            <span>Live GPS tracking enabled</span>
          </div>
        </div>

        {/* Right: Fare & Booking Action */}
        <div className="col-lg-4 col-md-5 text-md-end border-top border-md-top-0 pt-3 pt-md-0">
          <div className="mb-2">
            <span className="text-muted small">Fare per seat</span>
            <div className="price fw-semibold" style={{ fontSize: '1.5rem', color: 'var(--fe-accent)', lineHeight: 1.1 }}>
              {perSeat ? `₹${perSeat}` : loadingQuote ? 'Checking…' : '₹650'}
            </div>
            <div className="text-muted" style={{ fontSize: '0.6875rem' }}>Inclusive of taxes & insurance</div>
          </div>

          <button
            className="btn btn-accent d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2"
            onClick={() => onSelect && onSelect(schedule)}
            style={{ minWidth: 140 }}
          >
            <span>Select seat</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}