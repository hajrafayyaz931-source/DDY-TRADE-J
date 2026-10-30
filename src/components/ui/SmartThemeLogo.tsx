import React from 'react';
import { ThemeId } from '../../types/visuals';

interface SmartThemeLogoProps {
  className?: string;
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  activeTheme?: ThemeId;
}

export function SmartThemeLogo({
  className = '',
  showSubtitle = true,
  size = 'md',
  activeTheme = 'quotex-cyber',
}: SmartThemeLogoProps) {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Dynamic Themed Vector Logo Icon */}
      <div 
        className="relative shrink-0 rounded-xl p-0.5 transition-all duration-300 group-hover:scale-105"
        style={{
          width: iconSize,
          height: iconSize,
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, #10B981 50%, var(--accent-secondary) 100%)',
          boxShadow: '0 0 18px var(--glow-color)',
        }}
      >
        <div 
          className="w-full h-full rounded-[10px] flex items-center justify-center p-1 relative overflow-hidden transition-colors duration-300"
          style={{
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          {/* Subtle Ambient Radial Glow inside logo */}
          <div 
            className="absolute inset-0 opacity-40 blur-sm pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 60% 40%, var(--accent-primary) 0%, transparent 70%)',
            }}
          />

          {/* Precision SVG Vector Emblem: 3 Ascending Bars + Curved Arrow Swoosh */}
          <svg 
            viewBox="0 0 40 40" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full relative z-10 transition-transform duration-300 group-hover:scale-105"
          >
            <defs>
              <linearGradient id="smartThemeBarGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="var(--accent-primary)" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>

              <linearGradient id="smartThemeArrowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="var(--accent-secondary)" />
                <stop offset="100%" stopColor="var(--accent-primary)" />
              </linearGradient>

              <filter id="smartThemeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ascending Chart Bars */}
            {/* Bar 1 (Left - Shortest) */}
            <rect 
              x="17" 
              y="22" 
              width="4.2" 
              height="11" 
              rx="1.5" 
              fill="url(#smartThemeBarGrad)" 
              opacity="0.9"
            />

            {/* Bar 2 (Middle - Medium) */}
            <rect 
              x="22.5" 
              y="16" 
              width="4.2" 
              height="17" 
              rx="1.5" 
              fill="url(#smartThemeBarGrad)" 
            />

            {/* Bar 3 (Right - Tallest) */}
            <rect 
              x="28" 
              y="11" 
              width="4.2" 
              height="22" 
              rx="1.5" 
              fill="url(#smartThemeBarGrad)" 
            />

            {/* Sweeping Dynamic Accent Swoosh Arrow */}
            <path 
              d="M 12 28 C 10 24, 11 17, 16 12 C 19 9, 24 7.5, 29 8" 
              stroke="url(#smartThemeArrowGrad)" 
              strokeWidth="2.8" 
              strokeLinecap="round"
              filter="url(#smartThemeGlow)"
            />

            {/* Arrowhead */}
            <path 
              d="M 25 6 L 31 8 L 27.5 13.5 Z" 
              fill="url(#smartThemeArrowGrad)" 
              filter="url(#smartThemeGlow)"
            />

            {/* Bottom Swoop Flare Arc */}
            <path 
              d="M 11.5 27 C 13.5 32, 19 35, 25 35 C 29 35, 33 33, 35 29" 
              stroke="var(--accent-primary)" 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeOpacity="0.45"
            />
          </svg>
        </div>
      </div>

      {/* Typography: DDY TRADE + JOURNAL */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span 
            className="font-black text-sm sm:text-base tracking-tight font-sans text-white transition-colors duration-200"
            style={{
              textShadow: '0 0 12px var(--glow-color)',
            }}
          >
            DDY TRADE
          </span>

          <span 
            className="text-[9px] px-1.5 py-0.5 rounded font-black font-mono uppercase tracking-wider transition-all duration-300"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)',
              color: 'var(--accent-secondary)',
              border: '1px solid color-mix(in srgb, var(--accent-primary) 45%, transparent)',
              boxShadow: '0 0 10px var(--glow-color)',
            }}
          >
            JOURNAL
          </span>
        </div>

        {showSubtitle && (
          <span 
            className="text-[9px] font-mono hidden xl:block leading-none mt-0.5 transition-colors duration-300"
            style={{ color: 'var(--accent-secondary)' }}
          >
            Quotex Visual Trading Terminal v4.2
          </span>
        )}
      </div>
    </div>
  );
}
