import React from 'react';

export function LogoIcon({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g stroke="var(--color-cyan)" strokeWidth="12" fill="none" strokeLinecap="square">
        {/* Ray 1 (Top) */}
        <line x1="100" y1="35" x2="100" y2="55" />
        {/* Ray 2 (Top Left) */}
        <line x1="70" y1="42" x2="80" y2="58" />
        {/* Ray 3 (Top Right) */}
        <line x1="130" y1="42" x2="120" y2="58" />
        {/* Ray 4 (Bottom Left) */}
        <line x1="45" y1="65" x2="57" y2="76" />
        {/* Ray 5 (Bottom Right) */}
        <line x1="155" y1="65" x2="143" y2="76" />
        
        {/* Arc Outer Left */}
        <path d="M 57 100 A 43 43 0 0 1 95 58" />
        {/* Arc Outer Right */}
        <path d="M 105 58 A 43 43 0 0 1 143 100" />
        {/* Arc Inner */}
        <path d="M 70 100 A 30 30 0 0 1 130 100" />
        
        {/* Connectors (Horizontal segments on the arc) */}
        <line x1="60" y1="75" x2="70" y2="82" strokeWidth="8" />
        <line x1="140" y1="75" x2="130" y2="82" strokeWidth="8" />
      </g>
      
      {/* Base lines */}
      <g fill="var(--color-logo-base)">
        <rect x="25" y="110" width="150" height="8" />
        <rect x="60" y="125" width="80" height="8" />
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className || ''}`}>
      <LogoIcon size={80} />
      <div className="flex flex-col items-center mt-2">
        <span className="text-[var(--color-ink)] font-bold text-xl leading-none tracking-widest uppercase">
          Project
        </span>
        <span className="text-[var(--color-ink)] font-bold text-xl leading-none tracking-widest uppercase mt-1">
          Horizon
        </span>
      </div>
    </div>
  );
}

export function LogoHorizontal({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <LogoIcon size={36} />
      <div className="flex flex-col">
        <span className="text-[var(--color-ink)] font-bold text-sm leading-none tracking-widest uppercase">
          Project
        </span>
        <span className="text-[var(--color-ink)] font-bold text-sm leading-none tracking-widest uppercase mt-0.5">
          Horizon
        </span>
      </div>
    </div>
  );
}