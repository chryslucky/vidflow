import React, { useState, useEffect } from 'react';
import Logo from './Logo';

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('Initializing...');

  useEffect(() => {
    const steps = [
      { p: 20, t: 'Warming up engines...' },
      { p: 45, t: 'Loading your preferences...' },
      { p: 70, t: 'Curating your feed...' },
      { p: 100, t: "Ready to stream!" },
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i].p);
        setText(steps[i].t);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => onComplete?.(), 400);
      }
    }, 380);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[10000] bg-vf-black flex items-center justify-center flex-col gap-8 gr-mesh">
      <div className="relative">
        {/* Multiple rotating rings */}
        <div className="absolute inset-[-24px]" style={{ animation: 'spin-slow 4s linear infinite' }}>
          <svg viewBox="0 0 120 120" className="w-40 h-40">
            <circle cx="60" cy="60" r="58" fill="none" stroke="rgba(229,9,20,0.15)" strokeWidth="0.5" strokeDasharray="4 2" />
          </svg>
        </div>
        <div className="absolute inset-[-12px]" style={{ animation: 'spin-slow 3s linear infinite reverse' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-vf-red rounded-full" style={{ boxShadow: '0 0 20px rgba(229,9,20,0.9)' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-400 rounded-full opacity-70" />
        </div>
        {/* Progress ring */}
        <div className="w-32 h-32 rounded-full flex items-center justify-center relative">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(34,34,34,0.5)" strokeWidth="2" />
            <circle cx="50" cy="50" r="46" fill="none" stroke="url(#pg)" strokeWidth="3"
              strokeDasharray={`${progress * 2.89} 289`} strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.5s ease' }} />
            <defs>
              <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e50914" />
                <stop offset="100%" stopColor="#ff6b6b" />
              </linearGradient>
            </defs>
          </svg>
          <Logo size="lg" showText={false} />
        </div>
      </div>

      <Logo size="lg" animate={false} />

      <div className="text-center">
        <p className="text-vf-light text-sm mb-3 font-medium">{text}</p>
        <div className="w-64 h-1 bg-vf-border rounded-full overflow-hidden">
          <div className="h-full gr-red rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-vf-gray text-xs mt-2 font-display tracking-wider">{progress}%</p>
      </div>
    </div>
  );
}