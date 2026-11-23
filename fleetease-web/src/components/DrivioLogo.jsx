import React from 'react';

/**
 * DRIVIO Official Brand Icon & Logo Component
 * Based on the DRIVIO brand guideline:
 * - Midnight Navy: #101B35
 * - Electric Blue: #246BFD
 * - Cyan Blue: #19C5E8
 * - Light Grey: #E6E9F2
 */

export function DrivioIcon({ size = 32, theme = 'light', className = '' }) {
  const chassisColor = theme === 'dark' ? '#FFFFFF' : '#101B35';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-label="DRIVIO Icon"
    >
      <defs>
        <linearGradient id="drivioRoadGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#19C5E8" />
          <stop offset="60%" stopColor="#246BFD" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>

      {/* Outer D chassis - white on dark backgrounds, midnight navy on light */}
      <path
        d="M15 15C11.5 15 8 18 8 22C8 26 11.5 29 15 29H55C68 29 78 37 78 49C78 61 68 67 52 67H25C22 67 20 65 18 63C24 55 35 43 45 35C48 32.5 53 35 55 38C58 43 58 53 52 57C48 59.5 42 60 38 60H52C60 60 67 55 67 48C67 41 61 36 53 36H15C7 36 0 29 0 22C0 15 7 8 15 8H62C80 8 96 22 96 42C96 61 78 72 55 72H22C14 72 6 65 2 57C12 45 28 32 42 22C46 19 52 21 55 24C59 28 60 36 55 41C50 44 44 45 40 45H52C56 45 60 41 60 37C60 33 56 30 50 30H15Z"
        fill={chassisColor}
      />

      {/* Perspective Curved Highway Road */}
      <path
        d="M2 58C12 45 28 31 46 20C55 14 68 22 63 32C55 46 36 60 14 68C8 66 4 63 2 58Z"
        fill="url(#drivioRoadGrad)"
      />

      {/* Road inner edge cyan highlight */}
      <path
        d="M3 59C14 46 29 32 46 21C49 19 54 22 52 26C38 38 24 52 11 66C7 64 4 62 3 59Z"
        fill="#19C5E8"
        opacity="0.85"
      />

      {/* Dashed White Highway Lane Markings */}
      <g stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="3 3.5">
        <path d="M7 63C18 51 32 38 48 24" />
      </g>
    </svg>
  );
}

export default function DrivioLogo({ size = 32, theme = 'light', showText = true, className = '' }) {
  const textColor = theme === 'dark' ? '#FFFFFF' : '#101B35';

  return (
    <div
      className={`drivio-brand-mark d-inline-flex align-items-center gap-2 ${className}`}
      style={{ userSelect: 'none', lineHeight: 1 }}
    >
      <DrivioIcon size={size} theme={theme} />
      {showText && (
        <span
          style={{
            fontFamily: "'Montserrat', 'Inter', sans-serif",
            fontWeight: 800,
            fontSize: `${size * 0.72}px`,
            letterSpacing: '0.04em',
            color: textColor,
            textTransform: 'uppercase',
          }}
        >
          DRIVIO
        </span>
      )}
    </div>
  );
}