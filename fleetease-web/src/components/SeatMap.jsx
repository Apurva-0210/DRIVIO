import React from 'react';
import { Check, Disc, Lock } from 'lucide-react';

export default function SeatMap({
  layoutType = '2x2',
  rows = 10,
  upperDeck = false,
  selected = [],
  onToggle = () => {},
  disabledSeats = [],
  lockedSeats = [],
  compact = false,
  adminMode = false,
}) {
  const isSleeper = layoutType === '2x1_sleeper' || layoutType === '2x1_luxury';
  const seatW = compact ? (isSleeper ? 44 : 34) : (isSleeper ? 56 : 42);
  const seatH = compact ? (isSleeper ? 50 : 34) : (isSleeper ? 64 : 42);

  const buildLayout = (type, rowCount, deckLabel = 'L') => {
    const items = [];
    if (type === '2x2') {
      // 2 | aisle | 2
      for (let r = 1; r <= rowCount; r++) {
        items.push(`${deckLabel}${r}A`);
        items.push(`${deckLabel}${r}B`);
        items.push(null); // aisle spacer
        items.push(`${deckLabel}${r}C`);
        items.push(`${deckLabel}${r}D`);
      }
      return { cols: 5, items };
    }
    // 2x1 sleeper (two berths on left, aisle, single berth on right)
    for (let r = 1; r <= rowCount; r++) {
      items.push(`${deckLabel}${r}A`);
      items.push(`${deckLabel}${r}B`);
      items.push(null); // aisle
      items.push(`${deckLabel}${r}U`);
    }
    return { cols: 4, items };
  };

  const lower = buildLayout(layoutType, rows, 'L');
  const upper = upperDeck ? buildLayout(layoutType, rows, 'U') : null;

  const ds = new Set((disabledSeats || []).map((s) => String(s).toUpperCase()));
  const ls = new Set((lockedSeats || []).map((s) => String(s).toUpperCase()));

  const SeatItem = ({ label }) => {
    if (!label) {
      return <div style={{ width: seatW, height: seatH }} />;
    }
    const upLabel = String(label).toUpperCase();
    const isLocked = ls.has(upLabel);
    const isDis = ds.has(upLabel);
    const isSel = selected.includes(label);

    // For customers, locked seats appear simply as booked/occupied
    const isOccupiedForCustomer = isDis || isLocked;
    const canClick = adminMode ? !isDis : !isOccupiedForCustomer;

    let bg = '#ffffff';
    let borderColor = 'var(--fe-border-strong)';
    let textColor = 'var(--fe-text-primary)';

    if (isSel) {
      bg = 'var(--fe-accent)';
      borderColor = 'var(--fe-accent)';
      textColor = '#ffffff';
    } else if (adminMode && isLocked) {
      // Only admin sees the amber Admin Quota badge
      bg = '#FEF3C7';
      borderColor = '#F59E0B';
      textColor = '#92400E';
    } else if (isOccupiedForCustomer) {
      // Normal booked seat
      bg = '#F1F5F9';
      borderColor = '#CBD5E1';
      textColor = '#94A3B8';
    }

    return (
      <button
        type="button"
        onClick={() => canClick && onToggle(label, isLocked)}
        disabled={!canClick}
        className={`seat-btn ${isSel ? 'selected' : (adminMode && isLocked) ? 'admin-locked' : isOccupiedForCustomer ? 'booked' : ''}`}
        style={{
          width: seatW,
          height: seatH,
          borderRadius: isSleeper ? 'var(--fe-radius-sm)' : 'var(--fe-radius-md)',
          position: 'relative',
          padding: 2,
          background: bg,
          borderColor: borderColor,
          color: textColor,
          cursor: canClick ? 'pointer' : 'not-allowed',
        }}
        title={`Seat ${label} (${adminMode && isLocked ? 'Admin Quota (Locked)' : isOccupiedForCustomer ? 'Occupied' : isSel ? 'Selected' : 'Available'})`}
      >
        <span className="tabular-nums" style={{ fontSize: compact ? '0.6875rem' : '0.75rem', fontWeight: 600 }}>
          {label}
        </span>
        {adminMode && isLocked && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              color: '#D97706',
            }}
          >
            <Lock size={compact ? 8 : 10} />
          </span>
        )}
        {isSel && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'var(--fe-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={9} strokeWidth={3} color="#ffffff" />
          </span>
        )}
      </button>
    );
  };

  const Cabin = ({ layout, title }) => (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--fe-border)',
        borderRadius: 'var(--fe-radius-md)',
        padding: compact ? '12px 14px' : '20px 24px',
        boxShadow: 'var(--fe-shadow-xs)',
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-2 pb-1.5 border-bottom" style={{ borderColor: 'var(--fe-border)' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fe-text-primary)' }}>
          {title}
        </span>
        {/* Front of bus indicator */}
        <div className="d-flex align-items-center gap-1.5 text-muted" style={{ fontSize: '0.6875rem' }}>
          <span>Front / Driver</span>
          <Disc size={13} color="var(--fe-text-muted)" />
        </div>
      </div>

      <div
        className="d-grid justify-content-center"
        style={{
          gridTemplateColumns: `repeat(${layout.cols}, ${seatW}px)`,
          gap: compact ? 5 : 8,
        }}
      >
        {layout.items.map((lab, idx) => (
          <SeatItem key={lab || `spacer-${idx}`} label={lab} />
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* Legend */}
      <div className="d-flex align-items-center gap-3 mb-3 flex-wrap" style={{ fontSize: '0.75rem' }}>
        <div className="d-flex align-items-center gap-1.5">
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              border: '1px solid var(--fe-border-strong)',
              background: '#ffffff',
            }}
          />
          <span className="text-secondary">Available</span>
        </div>

        <div className="d-flex align-items-center gap-1.5">
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              background: 'var(--fe-accent)',
            }}
          />
          <span className="text-secondary">Selected</span>
        </div>

        <div className="d-flex align-items-center gap-1.5">
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
            }}
          />
          <span className="text-muted">Booked (Occupied)</span>
        </div>

        {adminMode && (
          <div className="d-flex align-items-center gap-1.5">
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: '#FEF3C7',
                border: '1px solid #F59E0B',
              }}
            />
            <span style={{ color: '#B45309', fontWeight: 600 }}>Admin Quota (Locked)</span>
          </div>
        )}
      </div>

      {/* Cabin layouts */}
      <div className="row g-3">
        <div className={upper ? 'col-12 col-md-6' : 'col-12'}>
          <Cabin layout={lower} title={upper ? 'Lower Deck' : 'Cabin Layout'} />
        </div>
        {upper && (
          <div className="col-12 col-md-6">
            <Cabin layout={upper} title="Upper Deck" />
          </div>
        )}
      </div>
    </div>
  );
}