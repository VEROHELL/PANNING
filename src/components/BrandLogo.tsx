import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16',
    hero: 'h-20 sm:h-28',
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Precision Metallic Emblem SVG Vectorized from official PANNING by Armored Bass */}
      <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
        <svg
          viewBox="0 0 420 160"
          className="h-full w-auto drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="30%" stopColor="#94A3B8" />
              <stop offset="50%" stopColor="#F1F5F9" />
              <stop offset="70%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            <linearGradient id="glowBlue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <radialGradient id="centerKnob" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="60%" stopColor="#94A3B8" />
              <stop offset="90%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1E293B" />
            </radialGradient>
          </defs>

          {/* Left Wing Armored Geometry */}
          <path
            d="M20 80 L90 80 L110 65 L145 65 L155 75 L135 80 L155 85 L145 95 L110 95 L90 80 Z"
            fill="url(#metalGrad)"
            stroke="#1E293B"
            strokeWidth="2"
          />
          {/* Left Hex Cutouts & Cyan LED Accents */}
          <line x1="30" y1="80" x2="80" y2="80" stroke="url(#glowBlue)" strokeWidth="2.5" />
          <polygon points="105,73 118,68 130,73 130,87 118,92 105,87" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.2" />

          {/* Right Wing Armored Geometry */}
          <path
            d="M400 80 L330 80 L310 65 L275 65 L265 75 L285 80 L265 85 L275 95 L310 95 L330 80 Z"
            fill="url(#metalGrad)"
            stroke="#1E293B"
            strokeWidth="2"
          />
          {/* Right Hex Cutouts & Cyan LED Accents */}
          <line x1="340" y1="80" x2="390" y2="80" stroke="url(#glowBlue)" strokeWidth="2.5" />
          <polygon points="315,73 302,68 290,73 290,87 302,92 315,87" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.2" />

          {/* Outer Acoustic Radar Arcs */}
          <path
            d="M 140 45 A 75 75 0 0 1 280 45"
            stroke="url(#metalGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M 155 30 A 92 92 0 0 1 265 30"
            stroke="url(#metalGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 140 115 A 75 75 0 0 0 280 115"
            stroke="url(#metalGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M 155 130 A 92 92 0 0 0 265 130"
            stroke="url(#metalGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Concentric Dial Base */}
          <circle cx="210" cy="80" r="54" fill="#0F172A" stroke="url(#metalGrad)" strokeWidth="3.5" />
          <circle cx="210" cy="80" r="46" fill="url(#metalGrad)" stroke="#1E293B" strokeWidth="2" />
          <circle cx="210" cy="80" r="38" fill="url(#centerKnob)" />

          {/* Knurled Outer Ring Marks */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            const rad = (angle * Math.PI) / 180;
            const x1 = 210 + Math.cos(rad) * 43;
            const y1 = 80 + Math.sin(rad) * 43;
            const x2 = 210 + Math.cos(rad) * 47;
            const y2 = 80 + Math.sin(rad) * 47;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="1.5" />;
          })}

          {/* Panning Needle / Dial Pointer */}
          <polygon points="210,75 250,80 210,85 204,80" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx="210" cy="80" r="6" fill="#38BDF8" />
        </svg>
      </div>

      {/* Brand Typographic Wordmark */}
      {showSubtitle && (
        <div className="mt-1.5 flex flex-col items-center text-center">
          <span className="font-extrabold tracking-[0.25em] text-slate-900 text-sm sm:text-base md:text-lg uppercase font-display leading-tight">
            PANNING
          </span>
          <span className="text-[9px] sm:text-[10px] tracking-[0.35em] text-slate-500 font-mono uppercase font-bold">
            by ARMORED BASS
          </span>
        </div>
      )}
    </div>
  );
};
