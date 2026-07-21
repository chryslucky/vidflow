import React from 'react';

export default function Logo({ size = 'md', animate = true, showText = true }) {
  const sizes = {
    xs: { box: 'w-7 h-7', text: 'text-sm', gap: 'gap-1.5' },
    sm: { box: 'w-9 h-9', text: 'text-base', gap: 'gap-2' },
    md: { box: 'w-11 h-11', text: 'text-xl', gap: 'gap-2.5' },
    lg: { box: 'w-16 h-16', text: 'text-3xl', gap: 'gap-3' },
    xl: { box: 'w-24 h-24', text: 'text-5xl', gap: 'gap-4' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center ${s.gap}`}>
      <div className={`${s.box} relative ${animate ? 'logo-animated' : ''}`}>
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <defs>
            <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff0a1f" />
              <stop offset="50%" stopColor="#e50914" />
              <stop offset="100%" stopColor="#b30710" />
            </linearGradient>
            <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Outer rounded square with gradient */}
          <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#lg1)" />
          {/* Inner subtle border */}
          <rect x="4" y="4" width="56" height="56" rx="14" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          {/* Ring around play button */}
          <circle cx="32" cy="32" r="22" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2 4" />
          {/* Play triangle */}
          <path d="M25 20 L25 44 L46 32 Z" fill="url(#lg2)" filter="url(#glow)" />
          {/* Highlight */}
          <path d="M25 20 L25 32 L36 26 Z" fill="rgba(255,255,255,0.3)" />
        </svg>
        {animate && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none" style={{
            background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
            animation: 'shimmer 3s infinite',
            backgroundSize: '200% 100%',
          }} />
        )}
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${s.text} font-black tracking-tight font-display`}>
            Vid<span className="text-gradient">Flow</span>
          </span>
          {(size === 'lg' || size === 'xl') && (
            <span className="text-[10px] text-vf-gray tracking-widest uppercase mt-1">Stream Beyond Limits</span>
          )}
        </div>
      )}
    </div>
  );
}