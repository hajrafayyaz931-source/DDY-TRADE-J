import React from 'react';
import { Sparkles, Calendar, Plus, RefreshCw, BarChart3, LineChart, Inbox } from 'lucide-react';

export function ChartSkeletonLoader({ title = 'Loading Chart...' }: { title?: string }) {
  return (
    <div className="trade-card rounded-2xl p-5 border border-[#8B5CF6]/20 bg-[#07060A]/80 backdrop-blur-2xl relative overflow-hidden">
      {/* Shimmer sweep effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8B5CF6]/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]/40 animate-pulse" />
          <div className="h-4 w-36 bg-[#8B5CF6]/20 rounded" />
        </div>
        <div className="h-3 w-20 bg-[#8B5CF6]/15 rounded" />
      </div>

      <div className="h-44 w-full flex items-end gap-2 pt-6 pb-2 border-b border-[#8B5CF6]/10">
        {[40, 65, 30, 80, 50, 90, 45, 70, 85, 35, 60, 75].map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className="flex-1 rounded-t bg-gradient-to-t from-[#8B5CF6]/10 to-[#8B5CF6]/25 animate-pulse"
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 text-[11px] font-mono text-[#A78BFA]/50">
        <div className="h-3 w-16 bg-[#8B5CF6]/15 rounded" />
        <div className="h-3 w-24 bg-[#8B5CF6]/15 rounded" />
      </div>
    </div>
  );
}

export function MetricSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="trade-card rounded-2xl p-4 border border-[#8B5CF6]/20 bg-[#07060A]/80 animate-pulse space-y-2.5"
        >
          <div className="h-2.5 w-14 bg-[#8B5CF6]/20 rounded" />
          <div className="h-6 w-20 bg-[#8B5CF6]/30 rounded my-1" />
          <div className="h-2 w-16 bg-[#8B5CF6]/15 rounded" />
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="trade-card rounded-2xl p-10 border border-[#8B5CF6]/25 bg-[#07060A]/90 backdrop-blur-2xl text-center flex flex-col items-center justify-center my-6 shadow-2xl relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute w-64 h-64 rounded-full bg-[#8B5CF6]/10 blur-3xl pointer-events-none -top-10" />

      {/* Icon with glowing ring */}
      <div className="w-16 h-16 rounded-3xl bg-[#0D0B14] border border-[#8B5CF6]/40 flex items-center justify-center text-[#C084FC] shadow-[0_0_24px_rgba(139,92,246,0.35)] mb-4 relative group">
        <Icon size={28} className="transition-transform group-hover:scale-110" />
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#10B981] animate-ping" />
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#10B981]" />
      </div>

      <h3 className="text-base font-bold text-white tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#A78BFA] max-w-sm leading-relaxed mb-5 font-sans">
        {description}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="btn-premium-purple px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-[0_0_16px_rgba(139,92,246,0.4)]"
          >
            <Plus size={14} />
            <span>{actionText}</span>
          </button>
        )}

        {secondaryActionText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="btn-glass-subtle px-4 py-2 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-2"
          >
            <RefreshCw size={13} className="text-[#A78BFA]" />
            <span>{secondaryActionText}</span>
          </button>
        )}
      </div>
    </div>
  );
}
