import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface MetricCardWithTooltipProps {
  title: string;
  value: React.ReactNode;
  sub?: string;
  isPositive?: boolean;
  tooltipTitle?: string;
  tooltipText: string;
  formula?: string;
  whyItMatters?: string;
  badge?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  accentColor?: string;
  loading?: boolean;
}

export function MetricCardWithTooltip({
  title,
  value,
  sub,
  isPositive,
  tooltipTitle,
  tooltipText,
  formula,
  whyItMatters,
  badge,
  icon: Icon,
  accentColor,
  loading = false,
}: MetricCardWithTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (loading) {
    return (
      <div className="trade-card rounded-2xl p-4 border border-[#8B5CF6]/20 bg-[#07060A]/80 animate-pulse space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-[#8B5CF6]/20 rounded" />
          <div className="h-3 w-3 bg-[#8B5CF6]/20 rounded-full" />
        </div>
        <div className="h-6 w-24 bg-[#8B5CF6]/30 rounded my-1" />
        <div className="h-2.5 w-20 bg-[#8B5CF6]/15 rounded" />
      </div>
    );
  }

  return (
    <div 
      className="trade-card rounded-2xl p-4 border border-[#8B5CF6]/20 bg-[#07060A]/80 backdrop-blur-2xl relative group hover:border-[#8B5CF6]/45 transition-all"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[10px] text-[#A78BFA] uppercase tracking-wider font-mono font-semibold truncate">
          {title}
        </span>
        <div className="flex items-center gap-1">
          {badge && (
            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#1C1433] text-[#C084FC] border border-[#8B5CF6]/30">
              {badge}
            </span>
          )}
          <button 
            type="button"
            className="text-[#A78BFA]/60 hover:text-[#C084FC] transition-colors p-0.5 rounded cursor-help"
            aria-label={`About ${title}`}
          >
            <HelpCircle size={11} />
          </button>
        </div>
      </div>

      <div className="text-xl font-black font-mono text-white tracking-tight">
        {value}
      </div>

      {sub && (
        <span className={`text-[10px] font-mono mt-0.5 block truncate ${
          isPositive === true ? 'text-[#10B981]' : isPositive === false ? 'text-[#EF4444]' : 'text-[#A78BFA]/75'
        }`}>
          {sub}
        </span>
      )}

      {/* Floating Institutional Dark Purple Glass Tooltip */}
      {showTooltip && (
        <div 
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-2xl bg-[#0D0B14]/98 border border-[#8B5CF6]/45 shadow-[0_12px_32px_rgba(0,0,0,0.85),0_0_20px_rgba(139,92,246,0.3)] backdrop-blur-2xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6] shadow-[0_0_6px_#8B5CF6]"></span>
            <span>{tooltipTitle || title}</span>
          </div>

          <p className="text-[11px] text-slate-200 leading-relaxed font-sans mb-1.5">
            {tooltipText}
          </p>

          {formula && (
            <div className="p-1.5 rounded-lg bg-[#07060A] border border-[#8B5CF6]/20 font-mono text-[10px] text-[#C084FC] mb-1.5">
              <span className="text-[#A78BFA]/70 block text-[9px] uppercase">Formula:</span>
              {formula}
            </div>
          )}

          {whyItMatters && (
            <div className="text-[10px] text-[#10B981] font-mono flex items-start gap-1">
              <span className="font-bold">Edge:</span>
              <span className="text-slate-300">{whyItMatters}</span>
            </div>
          )}

          {/* Pointer Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2.5 h-2.5 bg-[#0D0B14] border-r border-b border-[#8B5CF6]/45 rotate-45" />
        </div>
      )}
    </div>
  );
}
