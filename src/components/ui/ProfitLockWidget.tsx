import React, { useState, useEffect, useMemo } from 'react';
import { Trade } from '../../types/trade';
import { formatCurrency } from '../../utils/calculations';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Coins, 
  SlidersHorizontal,
  Flame
} from 'lucide-react';

interface ProfitLockWidgetProps {
  trades: Trade[];
  startingBalance?: number;
  onOpenLogTrade?: () => void;
}

export function ProfitLockWidget({
  trades,
  startingBalance = 1000,
  onOpenLogTrade,
}: ProfitLockWidgetProps) {
  // Profit Lock Settings saved in LocalStorage
  const [dailyTarget, setDailyTarget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tradepath_profit_lock_target');
      if (saved) return Number(saved);
    } catch {}
    return 100; // $100 default daily target
  });

  const [lockPercent, setLockPercent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tradepath_profit_lock_percent');
      if (saved) return Number(saved);
    } catch {}
    return 70; // 70% default profit lock
  });

  const [autoLockActive, setAutoLockActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tradepath_profit_lock_enabled');
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return true;
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('tradepath_profit_lock_target', String(dailyTarget));
      localStorage.setItem('tradepath_profit_lock_percent', String(lockPercent));
      localStorage.setItem('tradepath_profit_lock_enabled', JSON.stringify(autoLockActive));
    } catch {}
  }, [dailyTarget, lockPercent, autoLockActive]);

  // Calculate today's realized PnL
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTrades = useMemo(() => {
    return trades.filter(t => t.date === todayStr);
  }, [trades, todayStr]);

  const todayPnl = useMemo(() => {
    return todayTrades.reduce((acc, t) => acc + t.pnl, 0);
  }, [todayTrades]);

  // Target trigger evaluation
  const targetTriggerAmount = dailyTarget;
  const isTargetMet = todayPnl >= targetTriggerAmount;
  const lockedAmount = isTargetMet ? (todayPnl * (lockPercent / 100)) : 0;
  const playableBuffer = isTargetMet ? (todayPnl - lockedAmount) : Math.max(0, todayPnl);

  const lockProgressPct = Math.min(100, Math.max(0, Math.round((todayPnl / dailyTarget) * 100)));

  return (
    <div className="trade-card rounded-2xl p-5 border border-[var(--border-subtle)] bg-[var(--surface-primary)] backdrop-blur-2xl shadow-xl space-y-4 relative overflow-hidden">
      {/* Background radial glow when lock is active */}
      {isTargetMet && (
        <div className="absolute w-64 h-64 rounded-full bg-[#10B981]/15 blur-3xl pointer-events-none -top-10 -left-10" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl p-0.5 flex items-center justify-center transition-all ${
            isTargetMet 
              ? 'bg-gradient-to-tr from-[#10B981] to-[#6EE7B7] text-[#07060A] shadow-[0_0_18px_rgba(16,185,129,0.5)]' 
              : 'bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 text-[var(--accent-primary)]'
          }`}>
            {isTargetMet ? <Lock size={18} /> : <Unlock size={18} />}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Profit Lock Shield</span>
              {isTargetMet && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 font-mono font-bold animate-pulse shadow-[0_0_8px_#10B981]">
                  PROFIT LOCKED VAULT
                </span>
              )}
            </h3>
            <p className="text-[11px] text-[var(--accent-secondary)]">
              Automated capital preservation guard once daily target is met
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-1.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] text-[var(--accent-secondary)] hover:text-white border border-[var(--border-subtle)] transition-colors"
          title="Configure Profit Lock Rules"
        >
          <SlidersHorizontal size={15} />
        </button>
      </div>

      {/* Inline Settings Configuration Panel */}
      {isEditing && (
        <div className="p-3.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-hover)] space-y-3 animate-in fade-in duration-150 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <span className="text-white font-bold">Configure Profit Lock Rules</span>
            <button
              onClick={() => setAutoLockActive(!autoLockActive)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                autoLockActive ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {autoLockActive ? 'Auto Lock: ENABLED' : 'Auto Lock: DISABLED'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[var(--accent-secondary)] block text-[10px] mb-1">
                Daily Profit Trigger ($):
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(Math.max(10, Number(e.target.value)))}
                className="w-full bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-white outline-none font-bold"
              />
            </div>

            <div>
              <label className="text-[var(--accent-secondary)] block text-[10px] mb-1">
                Lock Percentage (%):
              </label>
              <select
                value={lockPercent}
                onChange={(e) => setLockPercent(Number(e.target.value))}
                className="w-full bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-white outline-none font-bold"
              >
                <option value="50">Lock 50% of Gains</option>
                <option value="70">Lock 70% of Gains (Recommended)</option>
                <option value="80">Lock 80% of Gains</option>
                <option value="100">Lock 100% (Hard Stop Session)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Status & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        {/* Today Realized PnL */}
        <div className="p-3 rounded-xl bg-[var(--surface-secondary)]/80 border border-[var(--border-subtle)] space-y-1">
          <span className="text-[10px] text-[var(--accent-secondary)] block">Today's Realized PnL</span>
          <span className={`text-lg font-black ${todayPnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {todayPnl >= 0 ? '+' : ''}{formatCurrency(todayPnl)}
          </span>
          <span className="text-[9px] text-[#CBD5E1] block">
            Target: <strong className="text-white">${dailyTarget}</strong>
          </span>
        </div>

        {/* Locked Amount */}
        <div className={`p-3 rounded-xl border space-y-1 ${
          isTargetMet 
            ? 'bg-[#10B981]/10 border-[#10B981]/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
            : 'bg-[var(--surface-secondary)]/80 border-[var(--border-subtle)]'
        }`}>
          <span className="text-[10px] text-[var(--accent-secondary)] block flex items-center gap-1">
            <Lock size={12} className={isTargetMet ? 'text-[#10B981]' : 'text-[var(--accent-secondary)]'} />
            Secured Locked Capital
          </span>
          <span className={`text-lg font-black ${isTargetMet ? 'text-[#10B981]' : 'text-slate-400'}`}>
            {formatCurrency(lockedAmount)}
          </span>
          <span className="text-[9px] text-[#CBD5E1] block">
            {isTargetMet ? `${lockPercent}% Profit Vaulted` : 'Awaiting Target'}
          </span>
        </div>

        {/* Playable Buffer */}
        <div className="p-3 rounded-xl bg-[var(--surface-secondary)]/80 border border-[var(--border-subtle)] space-y-1">
          <span className="text-[10px] text-[var(--accent-secondary)] block">Remaining Playable Buffer</span>
          <span className="text-lg font-black text-[var(--accent-secondary)]">
            {formatCurrency(playableBuffer)}
          </span>
          <span className="text-[9px] text-[#CBD5E1] block">
            Max Risk Allowance
          </span>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-[var(--accent-secondary)] flex items-center gap-1">
            <Coins size={12} className="text-[#F59E0B]" />
            Profit Lock Threshold Progress:
          </span>
          <span className="text-white font-bold">{lockProgressPct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] overflow-hidden p-0.5">
          <div 
            style={{ width: `${lockProgressPct}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              isTargetMet 
                ? 'bg-[#10B981] shadow-[0_0_12px_#10B981]' 
                : 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]'
            }`}
          />
        </div>
      </div>

      {/* Target Met Warning Banner */}
      {isTargetMet && (
        <div className="p-3 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-start gap-2.5 text-xs text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-in fade-in duration-200">
          <ShieldCheck size={18} className="text-[#10B981] shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <span className="font-bold text-white block">Profit Lock Active: Close Trading Day!</span>
            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              You have secured ${lockedAmount.toFixed(2)} in your profit vault ({lockPercent}% of today's ${todayPnl.toFixed(2)} gain). Do not give this back to the market through overtrading.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
