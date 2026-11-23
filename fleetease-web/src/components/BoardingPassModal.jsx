import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  X, 
  Download, 
  Printer, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Clock, 
  Hourglass, 
  Navigation, 
  Armchair,
  Bus,
  ShieldCheck,
  Lock
} from 'lucide-react';

export default function BoardingPassModal({ booking, onClose }) {
  const ticketRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  // Official verified booking details (immutable after purchase)
  const passengerName = booking?.passenger_name || booking?.customer_name || 'Apurva Sharma';
  const passengerAge = booking?.passenger_age || '28';
  const passengerGender = booking?.passenger_gender || 'Male';
  const seatLabel = booking?.seat_label || booking?.seats || '12A';

  // Format booking details
  const ticketId = booking?.ticket_id || booking?.booking_id 
    ? `DRV-BUS-2026-${String(booking.booking_id || 387).padStart(4, '0')}`
    : 'DRV-BUS-2026-0387';

  const sourceCity = booking?.source || 'Pune';
  const sourceCode = (sourceCity.slice(0, 3)).toUpperCase();
  const destCity = booking?.destination || 'Nashik';
  const destCode = (destCity.slice(0, 3)).toUpperCase();

  const sourceTerminal = booking?.pickup_location || `${sourceCity} Central Terminal`;
  const destTerminal = booking?.drop_location || `${destCity} CBS Bus Stand`;

  const busNumber = booking?.bus_number || booking?.vehicle_number || 'DRV-4092';
  const travelDate = booking?.travel_date || booking?.departure 
    ? new Date(booking.travel_date || booking.departure).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '23 Nov 2026';

  const depTime = booking?.departure 
    ? new Date(booking.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '09:00 AM';

  const arrTime = booking?.arrival 
    ? new Date(booking.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '12:30 PM';

  const duration = booking?.duration || '3 h 30 m';
  const distance = booking?.distance_km ? `${booking.distance_km} km` : '215 km';

  // Export to PDF
  const handleDownloadPdf = async () => {
    if (!ticketRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3, // crisp 300DPI
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [260, 110], // Boarding pass landscape aspect ratio
      });
      pdf.addImage(imgData, 'PNG', 5, 5, 250, 100);
      pdf.save(`DRIVIO_Boarding_Pass_${ticketId}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="modal show d-block"
      style={{
        backgroundColor: 'rgba(16, 27, 53, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1060,
      }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered" style={{ maxWidth: 1060 }}>
        <div
          className="modal-content border-0 shadow-lg"
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            background: '#F8FAFC',
          }}
        >
          {/* Modal Top Control Bar */}
          <div
            className="d-flex align-items-center justify-content-between px-4 py-3 bg-white border-bottom"
            style={{ borderColor: 'var(--fe-border)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <span
                className="d-flex align-items-center justify-content-center text-white rounded-circle"
                style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #246BFD, #19C5E8)' }}
              >
                <Bus size={18} />
              </span>
              <div>
                <h5 className="mb-0 fw-bold" style={{ color: 'var(--fe-text-primary)', fontSize: '1.0625rem' }}>
                  DRIVIO Digital Boarding Pass
                </h5>
                <span className="text-muted small">Verified e-Ticket & NFC Ready</span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                style={{ height: 36 }}
              >
                <Printer size={15} />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="btn btn-sm btn-accent d-flex align-items-center gap-2 text-white"
                style={{
                  background: 'linear-gradient(135deg, #246BFD, #0052e0)',
                  border: 'none',
                  height: 36,
                  fontWeight: 600,
                  padding: '0 16px',
                }}
              >
                <Download size={15} />
                <span>{downloading ? 'Generating PDF…' : 'Download PDF Ticket'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-sm btn-light border p-1 rounded-circle ms-2"
                style={{ width: 32, height: 32 }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="modal-body p-4">
            {/* Official Confirmed Status Notice */}
            <div
              className="d-flex align-items-center justify-content-between p-2.5 px-3 mb-4 rounded-3"
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                fontSize: '0.8125rem',
              }}
            >
              <div className="d-flex align-items-center gap-2 text-dark">
                <ShieldCheck size={16} color="#059669" />
                <span className="fw-semibold">Verified Confirmed Boarding Pass</span>
                <span className="text-muted">•</span>
                <span className="text-muted">Passenger: <strong>{passengerName}</strong></span>
                <span className="text-muted">•</span>
                <span className="text-muted">Seat Assigned: <strong className="text-primary">{seatLabel}</strong></span>
              </div>
              <div className="d-flex align-items-center gap-1.5 text-secondary" style={{ fontSize: '0.75rem' }}>
                <Lock size={12} className="text-muted" />
                <span className="badge bg-white text-secondary border">Non-Transferable</span>
              </div>
            </div>

            {/* THE DRIVIO BOARDING PASS TICKET CARD (Capturable for PDF) */}
            <div className="d-flex justify-content-center">
              <div
                ref={ticketRef}
                style={{
                  width: 960,
                  minHeight: 330,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  boxShadow: '0 12px 36px rgba(16, 27, 53, 0.12)',
                  border: '1.5px solid #246BFD',
                  display: 'flex',
                  overflow: 'hidden',
                  position: 'relative',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {/* LEFT MAIN TICKET BODY */}
                <div style={{ flex: '1 1 73%', display: 'flex', flexDirection: 'column' }}>
                  {/* Top Header Banner */}
                  <div
                    style={{
                      background: 'linear-gradient(90deg, #0D1B3E 0%, #102A6B 55%, #1958D0 100%)',
                      padding: '14px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#FFFFFF',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#19C5E8', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>
                        <span>&gt;&gt;</span>
                        <span style={{ color: '#FFFFFF', fontWeight: 800 }}>DRIVIO Fleet</span>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem', fontWeight: 300 }}>|</span>
                      <div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '0.2px' }}>
                          Fleet Boarding Pass
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#CBD5E1', letterSpacing: '0.3px' }}>
                          Intercity Certified Bus Service
                        </div>
                      </div>
                    </div>

                    {/* Bus Illustration Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: 20 }}>
                      <Bus size={18} color="#19C5E8" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }}>EXPRESS INTERCITY</span>
                    </div>
                  </div>

                  {/* Metadata Bar */}
                  <div
                    style={{
                      padding: '12px 24px',
                      background: '#F8FAFC',
                      borderBottom: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 24,
                      fontSize: '0.8125rem',
                    }}
                  >
                    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '3px 10px', borderRadius: 6, fontWeight: 700, color: '#1D4ED8' }}>
                      <span style={{ color: '#64748B', fontWeight: 500, marginRight: 6 }}>Ticket ID</span>
                      {ticketId}
                    </div>

                    <div>
                      <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block' }}>Service</span>
                      <strong style={{ color: '#0F172A' }}>{sourceCity} – {destCity}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block' }}>Bus No.</span>
                      <strong style={{ color: '#0F172A' }}>{busNumber}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block' }}>Passenger</span>
                      <strong style={{ color: '#246BFD' }}>{passengerName} ({passengerAge}y)</strong>
                    </div>

                    <div style={{ marginLeft: 'auto' }}>
                      <span
                        style={{
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#065F46',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 20,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <CheckCircle2 size={13} color="#059669" /> Confirmed
                      </span>
                    </div>
                  </div>

                  {/* Main Corridor Visual: Pune (PNQ) ---> [Bus] ---> Nashik (NSK) */}
                  <div style={{ padding: '20px 24px 12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Origin */}
                    <div style={{ maxWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#246BFD', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                        <MapPin size={16} />
                        <span>FROM</span>
                      </div>
                      <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.15, marginTop: 2 }}>
                        {sourceCity} <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 600 }}>({sourceCode})</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: 3 }}>
                        {sourceTerminal}
                      </div>
                    </div>

                    {/* Central Transit Arrow with Centered Bus */}
                    <div style={{ flex: 1, padding: '0 24px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          background: '#246BFD',
                          color: '#FFFFFF',
                          borderRadius: 8,
                          padding: '6px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 4px 10px rgba(36, 107, 253, 0.25)',
                          marginBottom: 8,
                        }}
                      >
                        <Bus size={18} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Direct Corridor</span>
                      </div>
                      {/* Arrow line */}
                      <div style={{ width: '100%', height: 3, background: 'linear-gradient(90deg, #246BFD, #19C5E8)', position: 'relative' }}>
                        <div
                          style={{
                            position: 'absolute',
                            right: -2,
                            top: -4,
                            width: 0,
                            height: 0,
                            borderTop: '5px solid transparent',
                            borderBottom: '5px solid transparent',
                            borderLeft: '9px solid #19C5E8',
                          }}
                        />
                      </div>
                    </div>

                    {/* Destination */}
                    <div style={{ maxWidth: 220, textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, color: '#19C5E8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                        <MapPin size={16} />
                        <span>TO</span>
                      </div>
                      <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.15, marginTop: 2 }}>
                        {destCity} <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 600 }}>({destCode})</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: 3 }}>
                        {destTerminal}
                      </div>
                    </div>
                  </div>

                  {/* Travel Parameters Horizontal Row */}
                  <div
                    style={{
                      margin: '10px 24px 16px 24px',
                      padding: '12px 18px',
                      background: '#F1F5F9',
                      borderRadius: 12,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      gap: 12,
                      textAlign: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#246BFD', fontSize: '0.7rem', fontWeight: 600 }}>
                        <Calendar size={12} /> Travel Date
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                        {travelDate}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#246BFD', fontSize: '0.7rem', fontWeight: 600 }}>
                        <Clock size={12} /> Departure
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                        {depTime}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#246BFD', fontSize: '0.7rem', fontWeight: 600 }}>
                        <Clock size={12} /> Arrival (ETA)
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                        {arrTime}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#246BFD', fontSize: '0.7rem', fontWeight: 600 }}>
                        <Hourglass size={12} /> Duration
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                        {duration}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#246BFD', fontSize: '0.7rem', fontWeight: 600 }}>
                        <Navigation size={12} /> Distance
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                        {distance}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#246BFD', fontSize: '0.7rem', fontWeight: 600 }}>
                        <Armchair size={12} /> Seat
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#246BFD', marginTop: 1 }}>
                        {seatLabel}
                      </div>
                    </div>
                  </div>

                  {/* Scenic Mountain Landscape Footer Vector */}
                  <div style={{ marginTop: 'auto', position: 'relative', height: 28, overflow: 'hidden' }}>
                    <svg viewBox="0 0 700 28" fill="none" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                      <path d="M0,28 L0,16 Q40,6 90,14 T200,10 T320,16 T440,8 T560,18 T700,12 L700,28 Z" fill="#E2E8F0" opacity="0.6" />
                      <path d="M0,28 L0,20 Q60,10 130,18 T270,14 T400,22 T530,12 T650,20 T700,16 L700,28 Z" fill="#CBD5E1" opacity="0.7" />
                      <line x1="0" y1="26" x2="700" y2="26" stroke="#246BFD" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
                    </svg>
                  </div>
                </div>

                {/* VERTICAL TEAR-OFF CUTOUT LINE */}
                <div
                  style={{
                    width: 24,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Top Notch Cutout */}
                  <div
                    style={{
                      width: 24,
                      height: 14,
                      background: '#F8FAFC',
                      borderBottomLeftRadius: 14,
                      borderBottomRightRadius: 14,
                      border: '1.5px solid #246BFD',
                      borderTop: 'none',
                      marginTop: -1,
                    }}
                  />
                  {/* Perforated dotted line */}
                  <div
                    style={{
                      flex: 1,
                      borderLeft: '2px dashed #CBD5E1',
                      margin: '4px 0',
                    }}
                  />
                  {/* Bottom Notch Cutout */}
                  <div
                    style={{
                      width: 24,
                      height: 14,
                      background: '#F8FAFC',
                      borderTopLeftRadius: 14,
                      borderTopRightRadius: 14,
                      border: '1.5px solid #246BFD',
                      borderBottom: 'none',
                      marginBottom: -1,
                    }}
                  />
                </div>

                {/* RIGHT TEAR-OFF BOARDING STUB */}
                <div
                  style={{
                    flex: '0 0 25%',
                    padding: '16px 18px',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Stub Header */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#246BFD', fontWeight: 800, fontSize: '0.9375rem' }}>
                      <span>&gt;&gt;</span>
                      <span style={{ color: '#0F172A' }}>DRIVIO Fleet</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: 1 }}>
                      Boarding Gate Verification
                    </div>
                    <div style={{ marginTop: 8, fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>
                      {ticketId}
                    </div>
                  </div>

                  {/* Stub Passenger Details */}
                  <div style={{ fontSize: '0.75rem', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '8px 0', margin: '8px 0' }}>
                    <div className="d-flex justify-content-between mb-1">
                      <span style={{ color: '#64748B' }}>Passenger:</span>
                      <strong style={{ color: '#0F172A', maxWidth: 110, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {passengerName}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span style={{ color: '#64748B' }}>Seat:</span>
                      <strong style={{ color: '#246BFD', fontSize: '0.875rem' }}>{seatLabel}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span style={{ color: '#64748B' }}>Bus No:</span>
                      <strong style={{ color: '#0F172A' }}>{busNumber}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span style={{ color: '#64748B' }}>Route:</span>
                      <strong style={{ color: '#0F172A' }}>{sourceCode} → {destCode}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span style={{ color: '#64748B' }}>Date:</span>
                      <span>{travelDate}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: '#64748B' }}>Dep:</span>
                      <span>{depTime}</span>
                    </div>
                  </div>

                  {/* QR Code and Barcode Container */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    {/* High-res SVG QR Code */}
                    <div style={{ padding: 4, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6 }}>
                      <QRCodeSVG
                        value={`DRIVIO:${ticketId}:${passengerName}:${seatLabel}:${sourceCity}-${destCity}`}
                        size={64}
                        level="H"
                        includeMargin={false}
                      />
                    </div>

                    {/* CSS Barcode lines */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <div
                        style={{
                          height: 52,
                          width: '100%',
                          display: 'flex',
                          alignItems: 'stretch',
                          gap: 1.5,
                          justifyContent: 'center',
                          padding: '0 4px',
                        }}
                      >
                        {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 3, 1, 2, 4, 2, 1, 3, 1].map((w, i) => (
                          <div
                            key={i}
                            style={{
                              width: w,
                              backgroundColor: '#0F172A',
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.6rem', color: '#94A3B8', letterSpacing: 1.5, marginTop: 2 }}>
                        *{ticketId.slice(-6)}*
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer bg-light border-top px-4 py-2" style={{ borderColor: 'var(--fe-border)' }}>
            <span className="text-muted small me-auto d-flex align-items-center gap-1">
              <ShieldCheck size={14} color="#059669" />
              <span>Valid for boarding without paper printout. Show PDF or QR to bus driver.</span>
            </span>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-sm btn-accent text-white"
              onClick={handleDownloadPdf}
              disabled={downloading}
            >
              {downloading ? 'Downloading…' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
