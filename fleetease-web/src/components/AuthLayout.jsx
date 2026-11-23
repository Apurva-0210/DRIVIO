import React from 'react';
import DrivioLogo from './DrivioLogo';
import { ShieldCheck, Bus, Compass, Navigation, Award, CheckCircle2 } from 'lucide-react';

export default function AuthLayout({ children, subtitle = "Unified Intercity Transit & Fleet OS" }) {
  return (
    <div className="d-flex flex-column flex-lg-row" style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* LEFT BRAND HERO PANEL */}
      <div
        className="col-12 col-lg-5 col-xl-5 d-flex flex-column justify-content-between p-4 p-md-5 text-white position-relative"
        style={{
          background: 'linear-gradient(145deg, #0A1124 0%, #101B35 55%, #132448 100%)',
          minHeight: '320px',
          overflow: 'hidden',
        }}
      >
        {/* Subtle geometric highway vector overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 140,
            opacity: 0.12,
            pointerEvents: 'none',
          }}
        >
          <svg viewBox="0 0 500 140" fill="none" style={{ width: '100%', height: '100%' }}>
            <path d="M0,140 Q150,40 250,90 T500,40 L500,140 Z" fill="#246BFD" />
            <path d="M0,140 Q180,60 300,110 T500,80 L500,140 Z" fill="#19C5E8" />
            <line x1="0" y1="130" x2="500" y2="130" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="10 8" />
          </svg>
        </div>

        {/* Top Header: Brand Logo */}
        <div className="position-relative z-1 mb-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <DrivioLogo size={38} theme="dark" />
          </div>
          <span
            className="badge rounded-pill text-uppercase px-2 py-1"
            style={{
              background: 'rgba(25, 197, 232, 0.12)',
              color: '#19C5E8',
              border: '1px solid rgba(25, 197, 232, 0.3)',
              fontSize: '0.6875rem',
              letterSpacing: '0.08em',
              fontWeight: 700,
            }}
          >
            Intercity Transit OS
          </span>
        </div>

        {/* Middle: Brand Pitch & Highlights */}
        <div className="position-relative z-1 my-auto py-3 py-lg-4">
          <h1
            className="fw-bold mb-3"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.125rem)',
              lineHeight: 1.25,
              color: '#FFFFFF',
              letterSpacing: '-0.5px',
            }}
          >
            Unified Transit Operations & Digital Ticketing
          </h1>
          <p
            className="mb-4"
            style={{
              fontSize: '0.9375rem',
              color: '#94A3B8',
              lineHeight: 1.6,
              maxWidth: 440,
            }}
          >
            Connecting fleet managers, counter agents, route drivers, and passengers through certified GPS schedules, Fastag automation, and verified boarding passes.
          </p>

          {/* 3 Metric Proof Points */}
          <div className="row g-2 mb-4" style={{ maxWidth: 440 }}>
            <div className="col-4">
              <div
                className="p-2 rounded-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="fw-bold text-white" style={{ fontSize: '1.125rem' }}>14+</div>
                <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>Intercity Routes</div>
              </div>
            </div>
            <div className="col-4">
              <div
                className="p-2 rounded-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="fw-bold text-white" style={{ fontSize: '1.125rem' }}>98.4%</div>
                <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>On-Time Rate</div>
              </div>
            </div>
            <div className="col-4">
              <div
                className="p-2 rounded-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="fw-bold text-white" style={{ fontSize: '1.125rem' }}>100%</div>
                <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>Digital Passes</div>
              </div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div
            className="p-3 rounded-3"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              maxWidth: 440,
            }}
          >
            <p className="fst-italic mb-2" style={{ fontSize: '0.8125rem', color: '#CBD5E1', lineHeight: 1.5 }}>
              "DRIVIO completely modernized our corridor operations with real-time tracking, transparent driver schedules, and instant boarding passes."
            </p>
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: 22, height: 22, background: '#246BFD', fontSize: '0.65rem' }}
              >
                FO
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>
                Fleet Operations & Regional Dispatch
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Trust & Compliance Tabs (Matching Home Page Design) */}
        <div className="position-relative z-1 pt-3">
          <div className="row g-2" style={{ maxWidth: 440 }}>
            <div className="col-12 col-sm-6">
              <div
                className="d-flex align-items-center gap-2.5 p-2.5 rounded-3 h-100"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    background: 'rgba(16, 185, 129, 0.16)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck size={20} color="#34D399" />
                </div>
                <div>
                  <div className="fw-bold text-white" style={{ fontSize: '0.8125rem', lineHeight: 1.2 }}>
                    256-Bit SSL Encryption
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
                    Bank-grade security
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6">
              <div
                className="d-flex align-items-center gap-2.5 p-2.5 rounded-3 h-100"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    background: 'rgba(56, 189, 248, 0.16)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Navigation size={18} color="#38BDF8" />
                </div>
                <div>
                  <div className="fw-bold text-white" style={{ fontSize: '0.8125rem', lineHeight: 1.2 }}>
                    AIS-140 Certified GPS
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
                    Live telemetry & SOS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT AUTH FORM CONTAINER */}
      <div
        className="col-12 col-lg-7 col-xl-7 d-flex align-items-center justify-content-center p-4 p-md-5"
        style={{
          backgroundColor: '#F8FAFC',
          minHeight: '100vh',
        }}
      >
        <div style={{ width: '100%', maxWidth: 520 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
