import React, { useState, useEffect, useMemo } from 'react';
import { Trade } from '../../types/trade';
import { formatCurrency } from '../../utils/calculations';
import { speakTargetAchieved, speakLossWarning } from '../../utils/soundEffects';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  SlidersHorizontal, 
  Award,
  Sparkles,
  Zap,
  Flame,
  Check
} from 'lucide-react';

interface DailyTargetTrackerWidgetProps {
  trades: Trade[];
  defaultDailyTarget?: number;
  defaultDailyLossLimit?: number;
}

export function DailyTargetTrackerWidget({
  trades,
  defaultDailyTarget = 100,
  defaultDailyLossLimit = 200,
}: DailyTargetTrackerWidgetProps) {
  // Settings with LocalStorage persistence
  const [targetProfit, setTargetProfit] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ddy_daily_profit_target');
      if (saved) return Number(saved);
    } catch {}
    return defaultDailyTarget;
  });

  const [maxLossLimit, setMaxLossLimit] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ddy_daily_loss_limit');
      if (saved) return Number(saved);
    } catch {}
    return defaultDailyLossLimit;
  });

  const [targetWinsCount, setTargetWinsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ddy_daily_wins_target');
      if (saved) return Number(saved);
    } catch {}
    return 5;
  });

  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('ddy_daily_profit_target', String(targetProfit));
      localStorage.setItem('ddy_daily_loss_limit', String(maxLossLimit));
      localStorage.setItem('ddy_daily_wins_target', String(targetWinsCount));
    } catch {}
  }, [targetProfit, maxLossLimit, targetWinsCount]);

  // Today's Date String YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);

  // Compute Today's Performance
  const { todayTrades, todayPnl, todayWins, todayLosses, todayTies, todayGrossWin, todayGrossLoss } = useMemo(() => {
    const list = trades.filter(t => t.date === todayStr);
    const net = list.reduce((acc, t) => acc + t.pnl, 0);
    const wins = list.filter(t => t.pnl > 0).length;
    const losses = list.filter(t => t.pnl < 0).length;
    const ties = list.filter(t => t.pnl === 0).length;
    const grossW = list.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
    const grossL = list.filter(t => t.pnl < 0).reduce((acc, t) => acc + Math.abs(t.pnl), 0);

    return {
      todayTrades: list,
      todayPnl: net,
      todayWins: wins,
      todayLosses: losses,
      todayTies: ties,
      todayGrossWin: grossW,
      todayGrossLoss: grossL,
    };
  }, [trades, todayStr]);

  // Target Progress %
  const profitProgressPct = Math.min(100, Math.max(0, Math.round((todayPnl / targetProfit) * 100)));
  const winsProgressPct = Math.min(100, Math.round((todayWins / targetWinsCount) * 100));

  // Loss Buffer Used %
  const lossBufferUsed = Math.min(100, Math.max(0, Math.round((todayGrossLoss / maxLossLimit) * 100)));

  // Status Evaluations
  const isProfitTargetMet = todayPnl >= targetProfit || todayWins >= targetWinsCount;
  const isLossLimitBreached = todayGrossLoss >= maxLossLimit || (todayPnl < 0 && Math.abs(todayPnl) >= maxLossLimit);
  const isLossWarning = !isLossLimitBreached && lossBufferUsed >= 70;

  useEffect(() => {
    if (isProfitTargetMet) {
      speakTargetAchieved(targetProfit, true);
    } else if (isLossLimitBreached) {
      speakLossWarning(maxLossLimit, true);
    }
  }, [isProfitTargetMet, isLossLimitBreached]);

  return (
    <div className="trade-card rounded-2xl p-5 border border-[var(--border-subtle)] bg-[var(--surface-primary)] backdrop-blur-2xl shadow-xl space-y-4 relative overflow-hidden">
      {/* Radial ambient glow */}
      {isProfitTargetMet ? (
        <div className="absolute w-64 h-64 rounded-full bg-[#10B981]/15 blur-3xl pointer-events-none -top-10 -right-10" />
      ) : isLossLimitBreached ? (
        <div className="absolute w-64 h-64 rounded-full bg-[#EF4444]/15 blur-3xl pointer-events-none -top-10 -right-10" />
      ) : (
        <div className="absolute w-48 h-48 rounded-full bg-[var(--glow-color)] opacity-40 blur-3xl pointer-events-none -top-10 -right-10" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl p-0.5 flex items-center justify-center transition-all ${
            isProfitTargetMet 
              ? 'bg-gradient-to-tr from-[#10B981] to-[#6EE7B7] text-[#07060A] shadow-[0_0_18px_rgba(16,185,129,0.5)]' 
              : isLossLimitBreached
              ? 'bg-gradient-to-tr from-[#EF4444] to-[#F87171] text-white shadow-[0_0_18px_rgba(239,68,68,0.5)]'
              : 'bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 text-[var(--accent-primary)]'
          }`}>
            <Target size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Daily Target & Risk Tracker</span>
              {isProfitTargetMet ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 font-mono font-bold animate-pulse">
                  TARGET ACHIEVED 🎯
                </span>
              ) : isLossLimitBreached ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 font-mono font-bold animate-pulse">
                  LIMIT BREACHED 🛑
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-secondary)] border border-[var(--accent-primary)]/40 font-mono font-bold">
                  IN PROGRESS ⚡
                </span>
              )}
            </h3>
            <p className="text-[11px] text-[var(--accent-secondary)]">
              Real-time daily win/loss goal monitoring & risk guardrail
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsConfiguring(!isConfiguring)}
          className="p-1.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] text-[var(--accent-secondary)] hover:text-white border border-[var(--border-subtle)] transition-colors"
          title="Configure Daily Goals"
        >
          <SlidersHorizontal size={15} />
        </button>
      </div>

      {/* Target Adjuster Form */}
      {isConfiguring && (
        <div className="p-3.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-hover)] space-y-3 font-mono text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <span className="text-white font-bold">Adjust Today's Goal Parameters</span>
            <button
              onClick={() => setIsConfiguring(false)}
              className="text-[var(--accent-secondary)] hover:text-white text-[10px] underline"
            >
              Done
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[var(--accent-secondary)] block text-[10px] mb-1">
                Daily Profit Target ($):
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={targetProfit}
                onChange={(e) => setTargetProfit(Math.max(10, Number(e.target.value)))}
                className="w-full bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-white outline-none font-bold"
              />
            </div>

            <div>
              <label className="text-[var(--accent-secondary)] block text-[10px] mb-1">
                Target ITM Wins Count:
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={targetWinsCount}
                onChange={(e) => setTargetWinsCount(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-white outline-none font-bold"
              />
            </div>

            <div>
              <label className="text-[var(--accent-secondary)] block text-[10px] mb-1">
                Max Daily Loss Limit ($):
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={maxLossLimit}
                onChange={(e) => setMaxLossLimit(Math.max(10, Number(e.target.value)))}
                className="w-full bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-white outline-none font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        {/* Realized Profit Progress */}
        <div className={`p-3.5 rounded-xl border space-y-1.5 ${
          todayPnl >= targetProfit 
            ? 'bg-[#10B981]/15 border-[#10B981]/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
            : 'bg-[var(--surface-secondary)]/80 border-[var(--border-subtle)]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--accent-secondary)]">Daily Profit Goal</span>
            <span className="text-[10px] font-bold text-white">{profitProgressPct}%</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className={`text-base font-black ${todayPnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {todayPnl >= 0 ? '+' : ''}{formatCurrency(todayPnl)}
            </span>
            <span className="text-[11px] text-[#CBD5E1]">/ ${targetProfit}</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-[var(--bg-primary)] rounded-full overflow-hidden p-0.5 border border-[var(--border-subtle)]">
            <div
              style={{ width: `${profitProgressPct}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                todayPnl >= targetProfit ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]' : 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]'
              }`}
            />
          </div>
        </div>

        {/* Wins Count Target */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-secondary)]/80 border border-[var(--border-subtle)] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--accent-secondary)]">ITM Wins Goal</span>
            <span className="text-[10px] font-bold text-white">{winsProgressPct}%</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-base font-black text-[var(--accent-secondary)]">
              {todayWins} <span className="text-xs text-[var(--accent-secondary)]/80 font-normal">Wins</span>
            </span>
            <span className="text-[11px] text-[#CBD5E1]">/ {targetWinsCount} Wins</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-[var(--bg-primary)] rounded-full overflow-hidden p-0.5 border border-[var(--border-subtle)]">
            <div
              style={{ width: `${winsProgressPct}%` }}
              className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-500 shadow-[0_0_8px_var(--glow-color)]"
            />
          </div>
        </div>

        {/* Loss Limit Buffer Guardrail */}
        <div className={`p-3.5 rounded-xl border space-y-1.5 ${
          isLossLimitBreached 
            ? 'bg-[#EF4444]/15 border-[#EF4444]/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
            : isLossWarning
            ? 'bg-[#F59E0B]/15 border-[#F59E0B]/40'
            : 'bg-[var(--surface-secondary)]/80 border-[var(--border-subtle)]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--accent-secondary)]">Max Loss Buffer</span>
            <span className={`text-[10px] font-bold ${
              isLossLimitBreached ? 'text-[#EF4444]' : isLossWarning ? 'text-[#F59E0B]' : 'text-[#10B981]'
            }`}>
              {lossBufferUsed}% Used
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className={`text-base font-black ${
              isLossLimitBreached ? 'text-[#EF4444]' : 'text-rose-300'
            }`}>
              -${todayGrossLoss.toFixed(2)}
            </span>
            <span className="text-[11px] text-[#CBD5E1]">/ -${maxLossLimit} Max</span>
          </div>

          {/* Loss Buffer Bar */}
          <div className="h-1.5 w-full bg-[var(--bg-primary)] rounded-full overflow-hidden p-0.5 border border-[var(--border-subtle)]">
            <div
              style={{ width: `${lossBufferUsed}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                isLossLimitBreached ? 'bg-[#EF4444]' : isLossWarning ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Target Met Banner */}
      {isProfitTargetMet && (
        <div className="p-3.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-start gap-2.5 text-xs text-emerald-200 animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="text-[#10B981] shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <span className="font-bold text-white block">Congratulations! Daily Goal Reached</span>
            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              You hit today's ${targetProfit} profit goal with {todayWins} ITM wins. Close your trading platform and lock in your gains!
            </p>
          </div>
        </div>
      )}

      {/* Limit Breached Banner */}
      {isLossLimitBreached && (
        <div className="p-3.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 flex items-start gap-2.5 text-xs text-rose-200 animate-in fade-in duration-200">
          <ShieldAlert size={18} className="text-[#EF4444] shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <span className="font-bold text-white block">Daily Loss Limit Reached</span>
            <p className="text-[11px] text-rose-200/90 leading-relaxed">
              You have used your -${maxLossLimit} daily risk limit (${todayGrossLoss.toFixed(2)} incurred). Stop trading now to preserve your capital.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
