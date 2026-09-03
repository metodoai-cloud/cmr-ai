import React from 'react';

interface CrmLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CrmLogo: React.FC<CrmLogoProps> = ({ size = 36, className, style }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id="crmia-card-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="crmia-ia-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>

      {/* Modern Rounded App Badge Frame */}
      <rect width="128" height="128" rx="28" fill="url(#crmia-card-bg)" />
      <rect x="2" y="2" width="124" height="124" rx="26" stroke="#38bdf8" strokeWidth="2.5" strokeOpacity="0.45" />

      {/* CRM Bold Typography */}
      <text
        x="64"
        y="56"
        fontFamily="'Outfit', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="39"
        fontWeight="900"
        letterSpacing="-1.2"
        fill="#ffffff"
        textAnchor="middle"
      >
        CRM
      </text>

      {/* IA Bold Typography with Electric Cyan Accent */}
      <text
        x="64"
        y="100"
        fontFamily="'Outfit', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="38"
        fontWeight="900"
        letterSpacing="2"
        fill="url(#crmia-ia-grad)"
        textAnchor="middle"
      >
        IA
      </text>
    </svg>
  );
};

export default CrmLogo;
