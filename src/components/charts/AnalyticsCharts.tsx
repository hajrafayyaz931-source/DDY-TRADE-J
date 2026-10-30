import React, { useState } from 'react';
import { Trade } from '../../types/trade';
import { 
  formatCurrency, 
  calculateAssetBreakdown, 
  calculateReturnDistribution, 
  calculatePeriodBreakdown 
} from '../../utils/calculations';

// 1. Daily PnL Bar Chart with Crosshair Synchronization
export function DailyPnlBarChart({
  trades,
  embedded = false,
  hoveredDate = null,
  onHoverDate,
}: {
  trades: Trade[];
  embedded?: boolean;
  hoveredDate?: string | null;
  onHoverDate?: (date: string | null) => void;
}) {
  // Aggregate PnL and trade statistics by Date
  const pnlByDate: Record<string, { pnl: number; count: number; wins: number }> = {};
  trades.forEach(t => {
    if (!pnlByDate[t.date]) {
      pnlByDate[t.date] = { pnl: 0, count: 0, wins: 0 };
    }
    pnlByDate[t.date].pnl += t.pnl;
    pnlByDate[t.date].count += 1;
    if (t.pnl > 0) pnlByDate[t.date].wins += 1;
  });

  const sortedDates = Object.keys(pnlByDate).sort().slice(-14); // Last 14 days
  const values = sortedDates.map(d => pnlByDate[d].pnl);
  const maxAbs = Math.max(...values.map(Math.abs), 50);

  return (
    <div
      onMouseLeave={() => onHoverDate?.(null)}
      className={embedded ? 'w-full h-full flex flex-col justify-between' : 'trade-card rounded-2xl p-5 border border-[#8B5CF6]/20'}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]"></span>
          <h4 className="text-sm font-bold text-slate-100">
            Daily Realized PnL ($)
          </h4>
          {hoveredDate && pnlByDate[hoveredDate] && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/45 text-[#C084FC] font-mono font-bold animate-pulse-subtle shadow-[0_0_8px_rgba(139,92,246,0.3)]">
              Crosshair: {hoveredDate.slice(5)}
            </span>
          )}
        </div>
        <span className="text-xs text-[#94A3B8] font-mono">Last 14 Sessions</span>
      </div>

      <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-4 pb-2 border-b border-[#8B5CF6]/15 relative select-none">
        {/* Zero Baseline Line */}
        <div className="absolute left-0 right-0 top-1/2 border-t border-[#8B5CF6]/20 border-dashed pointer-events-none"></div>

        {sortedDates.map((date) => {
          const stats = pnlByDate[date];
          const val = stats.pnl;
          const isPos = val >= 0;
          const heightPct = Math.min(100, Math.max(8, (Math.abs(val) / maxAbs) * 45));
          const isSynced = hoveredDate === date;
          const winRate = stats.count > 0 ? Math.round((stats.wins / stats.count) * 100) : 0;

          return (
            <div
              key={date}
              onMouseEnter={() => onHoverDate?.(date)}
              className={`flex-1 flex flex-col items-center h-full justify-center group relative cursor-pointer transition-all ${
                isSynced ? 'bg-[#8B5CF6]/15 rounded-xl' : ''
              }`}
            >
              {/* Synchronized Vertical Crosshair Guide */}
              {isSynced && (
                <div className="absolute inset-y-0 w-px bg-[#C084FC] shadow-[0_0_8px_#C084FC] pointer-events-none z-10" />
              )}

              {/* Floating Tooltip Callout */}
              <div
                className={`transition-all duration-150 absolute -top-12 bg-[#0E0A1A]/95 backdrop-blur-xl border px-2.5 py-1.5 rounded-xl text-[10px] font-mono whitespace-nowrap z-30 pointer-events-none shadow-2xl ${
                  isSynced
                    ? 'opacity-100 scale-100 border-[#C084FC] ring-2 ring-[#C084FC]/30'
                    : 'opacity-0 group-hover:opacity-100 border-[#8B5CF6]/30'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-300 font-semibold">{date.slice(5)}:</span>
                  <span className={isPos ? 'text-[#10B981] font-bold' : 'text-[#F43F5E] font-bold'}>
                    {isPos ? '+' : ''}{formatCurrency(val)}
                  </span>
                </div>
                <div className="text-[9px] text-[#94A3B8]">
                  {stats.count} trade{stats.count > 1 ? 's' : ''} • {winRate}% WR
                </div>
              </div>

              {/* Bar container */}
              <div className="w-full flex flex-col items-center h-full justify-center">
                {isPos ? (
                  <div className="w-full h-1/2 flex items-end justify-center">
                    <div
                      style={{ height: `${heightPct * 2}%` }}
                      className={`w-3/4 max-w-[24px] bg-[#10B981] rounded-t-sm transition-all ${
                        isSynced
                          ? 'ring-2 ring-[#C084FC] shadow-[0_0_18px_rgba(16,185,129,0.7)] brightness-125 scale-y-105'
                          : 'shadow-[0_0_10px_rgba(16,185,129,0.3)] group-hover:brightness-125'
                      }`}
                    />
                  </div>
                ) : (
                  <div className="w-full h-1/2 flex items-start justify-center">
                    <div
                      style={{ height: `${heightPct * 2}%` }}
                      className={`w-3/4 max-w-[24px] bg-[#F43F5E] rounded-b-sm transition-all ${
                        isSynced
                          ? 'ring-2 ring-[#C084FC] shadow-[0_0_18px_rgba(244,63,94,0.7)] brightness-125 scale-y-105'
                          : 'shadow-[0_0_10px_rgba(244,63,94,0.3)] group-hover:brightness-125'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Date label */}
              <span className={`text-[9px] font-mono mt-1 transition-colors ${
                isSynced ? 'text-[#C084FC] font-bold' : 'text-[#64748B]'
              }`}>
                {date.slice(8)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 2. R-Multiple Distribution Histogram
export function RMultipleHistogram({ trades }: { trades: Trade[] }) {
  const buckets = [
    { label: '< -1R', count: 0, pnl: 0 },
    { label: '-1R to 0R', count: 0, pnl: 0 },
    { label: '0R to 1R', count: 0, pnl: 0 },
    { label: '1R to 2R', count: 0, pnl: 0 },
    { label: '2R to 3R', count: 0, pnl: 0 },
    { label: '> 3R', count: 0, pnl: 0 },
  ];

  trades.forEach(t => {
    const r = t.rMultiple ?? (t.pnl > 0 ? 1 : -1);
    if (r < -1) {
      buckets[0].count++;
      buckets[0].pnl += t.pnl;
    } else if (r < 0) {
      buckets[1].count++;
      buckets[1].pnl += t.pnl;
    } else if (r <= 1) {
      buckets[2].count++;
      buckets[2].pnl += t.pnl;
    } else if (r <= 2) {
      buckets[3].count++;
      buckets[3].pnl += t.pnl;
    } else if (r <= 3) {
      buckets[4].count++;
      buckets[4].pnl += t.pnl;
    } else {
      buckets[5].count++;
      buckets[5].pnl += t.pnl;
    }
  });

  const maxCount = Math.max(...buckets.map(b => b.count), 1);

  return (
    <div className="trade-card rounded-2xl p-5 border border-[#8B5CF6]/20">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
          R-Multiple Distribution
        </h4>
        <span className="text-xs text-[#94A3B8] font-mono">Frequency by R-Multiple</span>
      </div>

      <div className="space-y-3 pt-2">
        {buckets.map((b, i) => {
          const pct = (b.count / maxCount) * 100;
          const isWin = i >= 2;

          return (
            <div key={b.label} className="flex items-center gap-3 text-xs">
              <span className="w-20 text-[#94A3B8] font-mono shrink-0">{b.label}</span>
              <div className="flex-1 h-6 bg-[#07060A] rounded-md overflow-hidden p-0.5 border border-[#8B5CF6]/20">
                <div
                  style={{ width: `${Math.max(b.count > 0 ? 6 : 0, pct)}%` }}
                  className={`h-full rounded-sm transition-all flex items-center px-2 text-[10px] font-bold font-mono text-white ${
                    isWin ? 'bg-[#10B981]' : 'bg-[#F43F5E]'
                  }`}
                >
                  {b.count > 0 && `${b.count}`}
                </div>
              </div>
              <span className={`w-14 text-right font-mono font-bold shrink-0 ${b.pnl >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                {b.pnl >= 0 ? '+' : ''}{Math.round(b.pnl)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 3. Win / Loss / Breakeven Donut Chart
export function WinLossDonutChart({ trades, embedded = false }: { trades: Trade[]; embedded?: boolean }) {
  const wins = trades.filter(t => t.pnl > 0.01).length;
  const losses = trades.filter(t => t.pnl < -0.01).length;
  const ties = trades.length - wins - losses;
  const total = trades.length || 1;

  const winPct = (wins / total) * 100;
  const lossPct = (losses / total) * 100;
  const tiePct = (ties / total) * 100;

  // SVG Circumference = 2 * PI * r = 2 * 3.14159 * 40 = 251.3
  const circ = 251.3;
  const winStroke = (winPct / 100) * circ;
  const lossStroke = (lossPct / 100) * circ;
  const tieStroke = (tiePct / 100) * circ;

  return (
    <div className={embedded ? 'w-full h-full flex flex-col justify-between' : 'trade-card rounded-2xl p-5 border border-[#8B5CF6]/20 flex flex-col justify-between'}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]"></span>
          Win / Loss Breakdown
        </h4>
        <span className="text-xs text-[#94A3B8] font-mono">{trades.length} Trades</span>
      </div>

      <div className="flex items-center justify-center py-4 relative">
        <svg viewBox="0 0 100 100" className="w-36 h-36 -rotate-90">
          {/* Background circle */}
          <circle cx="50" cy="50" r="40" stroke="#161028" strokeWidth="12" fill="none" />
          
          {/* Win slice */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#10B981"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${winStroke} ${circ}`}
            strokeDashoffset="0"
          />

          {/* Loss slice */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#F43F5E"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${lossStroke} ${circ}`}
            strokeDashoffset={-winStroke}
          />

          {/* Tie slice */}
          {ties > 0 && (
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#8B5CF6"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${tieStroke} ${circ}`}
              strokeDashoffset={-(winStroke + lossStroke)}
            />
          )}
        </svg>

        {/* Center Win Rate */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black font-mono text-white">{winPct.toFixed(1)}%</span>
          <span className="text-[10px] text-[#A78BFA] uppercase tracking-wider font-semibold">Win Rate</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#8B5CF6]/15 text-center text-xs font-mono">
        <div>
          <div className="text-[11px] text-[#94A3B8]">Wins</div>
          <div className="font-bold text-[#10B981]">{wins} ({winPct.toFixed(0)}%)</div>
        </div>
        <div>
          <div className="text-[11px] text-[#94A3B8]">Losses</div>
          <div className="font-bold text-[#F43F5E]">{losses} ({lossPct.toFixed(0)}%)</div>
        </div>
        <div>
          <div className="text-[11px] text-[#94A3B8]">Scratch/Tie</div>
          <div className="font-bold text-[#C084FC]">{ties} ({tiePct.toFixed(0)}%)</div>
        </div>
      </div>
    </div>
  );
}

// 4. Performance by Strategy Bar Chart
export function PerformanceByStrategyChart({ trades }: { trades: Trade[] }) {
  const stratStats: Record<string, { wins: number; total: number; pnl: number }> = {};
  trades.forEach(t => {
    const s = t.strategy || 'Other';
    if (!stratStats[s]) stratStats[s] = { wins: 0, total: 0, pnl: 0 };
    stratStats[s].total++;
    if (t.pnl > 0) stratStats[s].wins++;
    stratStats[s].pnl += t.pnl;
  });

  const sorted = Object.entries(stratStats).sort((a, b) => b[1].pnl - a[1].pnl);
  const maxPnl = Math.max(...sorted.map(s => Math.abs(s[1].pnl)), 100);

  return (
    <div className="trade-card rounded-2xl p-5 border border-[#8B5CF6]/20 bg-[#07060A]/70 backdrop-blur-2xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_#8B5CF6]"></span>
          Performance by Strategy Setup
        </h4>
        <span className="text-xs text-[#A78BFA] font-mono">Net PnL & Win Rate</span>
      </div>

      <div className="space-y-3.5">
        {sorted.map(([name, data]) => {
          const winRate = Math.round((data.wins / data.total) * 100);
          const widthPct = Math.min(100, Math.max(12, (Math.abs(data.pnl) / maxPnl) * 100));
          const isPos = data.pnl >= 0;

          return (
            <div key={name} className="text-xs">
              <div className="flex items-center justify-between mb-1.5 font-mono">
                <span className="font-semibold text-slate-200">{name}</span>
                <span className={isPos ? 'text-[#10B981] font-bold' : 'text-[#F43F5E] font-bold'}>
                  {isPos ? '+' : ''}{formatCurrency(data.pnl)} ({winRate}% WR • {data.total} trades)
                </span>
              </div>
              <div className="h-3 w-full bg-[#0D0B14] rounded-full overflow-hidden border border-[#8B5CF6]/20">
                <div
                  style={{ width: `${widthPct}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${isPos ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]' : 'bg-[#F43F5E] shadow-[0_0_8px_#F43F5E]'}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 5. Performance by Trading Session
export function PerformanceBySessionChart({ trades }: { trades: Trade[] }) {
  const sessionStats: Record<string, { wins: number; total: number; pnl: number }> = {};
  trades.forEach(t => {
    const s = t.session || 'Other';
    if (!sessionStats[s]) sessionStats[s] = { wins: 0, total: 0, pnl: 0 };
    sessionStats[s].total++;
    if (t.pnl > 0) sessionStats[s].wins++;
    sessionStats[s].pnl += t.pnl;
  });

  const sorted = Object.entries(sessionStats).sort((a, b) => b[1].pnl - a[1].pnl);

  return (
    <div className="trade-card rounded-2xl p-5 border border-[#8B5CF6]/20 bg-[#07060A]/70 backdrop-blur-2xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A78BFA] shadow-[0_0_8px_#A78BFA]"></span>
          Performance by Trading Session
        </h4>
        <span className="text-xs text-[#A78BFA] font-mono">Session Edge</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sorted.map(([session, data]) => {
          const winRate = Math.round((data.wins / data.total) * 100);
          const isPos = data.pnl >= 0;

          return (
            <div key={session} className="p-3.5 rounded-xl bg-[#0D0B14]/80 border border-[#8B5CF6]/20 flex flex-col justify-between hover:border-[#8B5CF6]/40 transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-300 block truncate">{session}</span>
                <span className="text-[11px] text-[#A78BFA]/80 font-mono">{data.total} trade(s) • {winRate}% Win</span>
              </div>
              <div className={`text-base font-extrabold font-mono mt-2 ${isPos ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                {isPos ? '+' : ''}{formatCurrency(data.pnl)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 6. Return Distribution Chart (Win/Loss Histogram)
export function ReturnDistributionChart({ trades }: { trades: Trade[] }) {
  const buckets = calculateReturnDistribution(trades);
  const maxCount = Math.max(...buckets.map(b => b.count), 1);

  return (
    <div className="trade-card rounded-2xl p-5 border border-[#8B5CF6]/20 bg-[#07060A]/70 backdrop-blur-2xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_#8B5CF6]"></span>
          Win / Loss Return Distribution
        </h4>
        <span className="text-xs text-[#A78BFA] font-mono">Profitability Skew</span>
      </div>

      <div className="space-y-2.5 pt-2">
        {buckets.map((b) => {
          const widthPct = Math.max(6, (b.count / maxCount) * 100);
          const isWin = b.type === 'win';
          const isLoss = b.type === 'loss';

          return (
            <div key={b.range} className="text-xs">
              <div className="flex items-center justify-between mb-1 font-mono">
                <span className="text-slate-300 font-semibold">{b.range}</span>
                <span className={`font-bold ${isWin ? 'text-[#10B981]' : isLoss ? 'text-[#F43F5E]' : 'text-[#C084FC]'}`}>
                  {b.count} trade{b.count === 1 ? '' : 's'}
                </span>
              </div>
              <div className="h-3 w-full bg-[#0D0B14] rounded-full overflow-hidden border border-[#8B5CF6]/20">
                <div
                  style={{ width: `${b.count > 0 ? widthPct : 0}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    isWin 
                      ? 'bg-gradient-to-r from-[#10B981] to-[#34D399] shadow-[0_0_8px_#10B981]' 
                      : isLoss 
                      ? 'bg-gradient-to-r from-[#F43F5E] to-[#FB7185] shadow-[0_0_8px_#F43F5E]' 
                      : 'bg-[#C084FC]'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 7. Profit by Currency Pair / Asset Analysis
export function AssetPerformanceChart({ trades }: { trades: Trade[] }) {
  const assets = calculateAssetBreakdown(trades);
  const maxAbsPnl = Math.max(...assets.map(a => Math.abs(a.pnl)), 100);

  return (
    <div className="trade-card rounded-2xl p-5 border border-[#8B5CF6]/20 bg-[#07060A]/70 backdrop-blur-2xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]"></span>
          Profit by Currency Pair / Asset
        </h4>
        <span className="text-xs text-[#A78BFA] font-mono">{assets.length} Active Instruments</span>
      </div>

      <div className="space-y-3">
        {assets.map((item) => {
          const isPos = item.pnl >= 0;
          const widthPct = Math.min(100, Math.max(10, (Math.abs(item.pnl) / maxAbsPnl) * 100));

          return (
            <div key={item.symbol} className="p-3 rounded-xl bg-[#0D0B14]/80 border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/40 transition-colors">
              <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{item.symbol}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1C1433] text-[#C084FC] border border-[#8B5CF6]/30">
                    {item.assetClass}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${isPos ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                    {isPos ? '+' : ''}{formatCurrency(item.pnl)}
                  </span>
                  <span className="text-[10px] text-[#A78BFA]/70 ml-2">
                    ({item.winRate}% WR • {item.trades} trades)
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-[#07060A] rounded-full overflow-hidden border border-[#8B5CF6]/15">
                <div
                  style={{ width: `${widthPct}%` }}
                  className={`h-full rounded-full ${isPos ? 'bg-[#10B981]' : 'bg-[#F43F5E]'}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 8. Period Breakdown (Daily / Weekly / Monthly Switcher)
export function PeriodBreakdownChart({ trades }: { trades: Trade[] }) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const data = calculatePeriodBreakdown(trades, period);
  const maxPnl = Math.max(...data.map(d => Math.abs(d.pnl)), 50);

  return (
    <div className="trade-card rounded-2xl p-5 border border-[#8B5CF6]/20 bg-[#07060A]/70 backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C084FC] shadow-[0_0_8px_#C084FC]"></span>
          Performance Breakdown
        </h4>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/30 text-xs">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                period === p
                  ? 'bg-[#8B5CF6] text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                  : 'text-[#A78BFA] hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {data.slice(-8).map((item) => {
          const isPos = item.pnl >= 0;
          const barWidth = Math.min(100, Math.max(8, (Math.abs(item.pnl) / maxPnl) * 100));

          return (
            <div key={item.label} className="p-3 rounded-xl bg-[#0D0B14]/70 border border-[#8B5CF6]/20">
              <div className="flex items-center justify-between mb-1 text-xs font-mono">
                <span className="font-bold text-slate-200">{item.label}</span>
                <span className={`font-bold ${isPos ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                  {isPos ? '+' : ''}{formatCurrency(item.pnl)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#A78BFA]/80 font-mono mb-1.5">
                <span>{item.tradesCount} executions</span>
                <span>Win Rate: {item.winRate}%</span>
              </div>
              <div className="h-2 w-full bg-[#07060A] rounded-full overflow-hidden border border-[#8B5CF6]/15">
                <div
                  style={{ width: `${barWidth}%` }}
                  className={`h-full rounded-full ${isPos ? 'bg-[#10B981]' : 'bg-[#F43F5E]'}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
