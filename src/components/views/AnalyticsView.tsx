import React, { useState, useMemo, useEffect } from 'react';
import { Trade, TradingStats, TradingAccount } from '../../types/trade';
import { 
  DailyPnlBarChart, 
  RMultipleHistogram, 
  WinLossDonutChart, 
  PerformanceByStrategyChart, 
  PerformanceBySessionChart,
  ReturnDistributionChart,
  AssetPerformanceChart,
  PeriodBreakdownChart
} from '../charts/AnalyticsCharts';
import { DedicatedDrawdownChart } from '../charts/DedicatedDrawdownChart';
import { RiskHeatmapCalendar } from '../charts/RiskHeatmapCalendar';
import { MetricCardWithTooltip } from '../ui/MetricCardWithTooltip';
import { MistakeTagsCloud } from '../ui/MistakeTagsCloud';
import { ChartSkeletonLoader, MetricSkeletonGrid, EmptyState } from '../ui/SkeletonAndEmptyStates';
import { formatCurrency, calculateStats, calculateProjectedGrowth } from '../../utils/calculations';
import { PerformanceReportModal } from '../modals/PerformanceReportModal';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  ShieldCheck, 
  Flame, 
  PieChart, 
  Activity, 
  Calendar as CalendarIcon,
  AlertTriangle,
  Sparkles,
  Download,
  Calculator,
  Compass,
  Zap,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RotateCcw,
  Clock,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export type DateRangePreset = 'all' | '7d' | '14d' | '30d' | 'this_month' | 'last_month' | 'custom';

interface AnalyticsViewProps {
  trades: Trade[];
  stats: TradingStats;
  account?: TradingAccount;
  onOpenLogTrade?: () => void;
}

export function AnalyticsView({ trades, stats: initialStats, account, onOpenLogTrade }: AnalyticsViewProps) {
  const [assetFilter, setAssetFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<DateRangePreset>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const defaultAccount: TradingAccount = account || {
    id: 'acc-default',
    name: 'Primary Trading Account',
    broker: 'Quotex Financial',
    type: 'Binary Options',
    startingBalance: 1000,
    currentBalance: 1000 + initialStats.netPnl,
    currency: 'USD',
    dailyLossLimit: 200,
    maxDrawdownLimit: 500,
    color: '#8B5CF6',
  };

  // Determine latest date in trades as anchor point for relative date ranges
  const anchorDateStr = useMemo(() => {
    if (!trades.length) return new Date().toISOString().slice(0, 10);
    const sorted = [...trades].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0].date;
  }, [trades]);

  // Compute date range [startDate, endDate] based on preset
  const { startDate, endDate, dateRangeLabel } = useMemo(() => {
    if (datePreset === 'all') {
      return { startDate: null, endDate: null, dateRangeLabel: 'All Recorded History' };
    }

    const anchor = new Date(anchorDateStr);

    if (datePreset === '7d') {
      const start = new Date(anchor);
      start.setDate(start.getDate() - 7);
      const sStr = start.toISOString().slice(0, 10);
      return { startDate: sStr, endDate: anchorDateStr, dateRangeLabel: `Last 7 Days (${sStr} to ${anchorDateStr})` };
    }

    if (datePreset === '14d') {
      const start = new Date(anchor);
      start.setDate(start.getDate() - 14);
      const sStr = start.toISOString().slice(0, 10);
      return { startDate: sStr, endDate: anchorDateStr, dateRangeLabel: `Last 14 Days (${sStr} to ${anchorDateStr})` };
    }

    if (datePreset === '30d') {
      const start = new Date(anchor);
      start.setDate(start.getDate() - 30);
      const sStr = start.toISOString().slice(0, 10);
      return { startDate: sStr, endDate: anchorDateStr, dateRangeLabel: `Last 30 Days (${sStr} to ${anchorDateStr})` };
    }

    if (datePreset === 'this_month') {
      const y = anchor.getFullYear();
      const m = String(anchor.getMonth() + 1).padStart(2, '0');
      const sStr = `${y}-${m}-01`;
      return { startDate: sStr, endDate: anchorDateStr, dateRangeLabel: `This Month (${y}-${m})` };
    }

    if (datePreset === 'last_month') {
      const prev = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1);
      const y = prev.getFullYear();
      const m = String(prev.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(anchor.getFullYear(), anchor.getMonth(), 0).getDate();
      const sStr = `${y}-${m}-01`;
      const eStr = `${y}-${m}-${lastDay}`;
      return { startDate: sStr, endDate: eStr, dateRangeLabel: `Last Month (${y}-${m})` };
    }

    if (datePreset === 'custom') {
      return {
        startDate: customStart || null,
        endDate: customEnd || null,
        dateRangeLabel: customStart && customEnd ? `Custom: ${customStart} to ${customEnd}` : 'Custom Date Range',
      };
    }

    return { startDate: null, endDate: null, dateRangeLabel: 'All History' };
  }, [datePreset, anchorDateStr, customStart, customEnd]);

  // Smooth brief transition effect on filter switch
  const handleDatePresetChange = (preset: DateRangePreset) => {
    setIsLoading(true);
    setDatePreset(preset);
    setTimeout(() => {
      setIsLoading(false);
    }, 180);
  };

  const handleAssetFilterChange = (filter: string) => {
    setIsLoading(true);
    setAssetFilter(filter);
    setTimeout(() => {
      setIsLoading(false);
    }, 180);
  };

  // Filtered trades by date range and asset class
  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      // Date filter
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;

      // Asset filter
      if (assetFilter !== 'all') {
        if (assetFilter === 'binary') {
          if (t.type !== 'binary') return false;
        } else {
          if (t.assetClass !== assetFilter) return false;
        }
      }

      return true;
    });
  }, [trades, startDate, endDate, assetFilter]);

  // Dynamically recalculated stats for the filtered trades
  const stats = useMemo(() => {
    return calculateStats(filteredTrades, defaultAccount.startingBalance);
  }, [filteredTrades, defaultAccount.startingBalance]);

  // Growth calculator interactive state
  const [calcStartBal, setCalcStartBal] = useState<number>(account?.startingBalance || 1000);
  const [calcWinRate, setCalcWinRate] = useState<number>(stats.winRate || 65);
  const [calcRiskPct, setCalcRiskPct] = useState<number>(2);
  const [calcPayoff, setCalcPayoff] = useState<number>(stats.payoffRatio > 0 && stats.payoffRatio < 10 ? Number(stats.payoffRatio.toFixed(1)) : 1.8);
  const [calcTradesPerDay, setCalcTradesPerDay] = useState<number>(3);
  const [calcDays, setCalcDays] = useState<number>(30);

  // Sync calculator when stats change
  useEffect(() => {
    if (stats.winRate > 0) {
      setCalcWinRate(Math.round(stats.winRate));
    }
  }, [stats.winRate]);

  // Weekday performance
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayStats: Record<string, { pnl: number; count: number; wins: number }> = {};
  daysOfWeek.forEach(d => { dayStats[d] = { pnl: 0, count: 0, wins: 0 }; });

  filteredTrades.forEach(t => {
    const d = new Date(t.date);
    if (!isNaN(d.getTime())) {
      const dayName = daysOfWeek[d.getDay()];
      dayStats[dayName].pnl += t.pnl;
      dayStats[dayName].count++;
      if (t.pnl > 0) dayStats[dayName].wins++;
    }
  });

  // Projected growth results
  const projectedPoints = calculateProjectedGrowth(
    calcStartBal,
    calcWinRate,
    calcRiskPct,
    calcPayoff,
    calcTradesPerDay,
    calcDays
  );
  const finalProjected = projectedPoints[projectedPoints.length - 1]?.balance || calcStartBal;
  const projectedReturnPct = calcStartBal > 0 ? ((finalProjected - calcStartBal) / calcStartBal) * 100 : 0;

  // Daily Risk Limit analysis
  const dailyLossLimit = defaultAccount.dailyLossLimit || 200;
  const lossUsedToday = stats.dailyLossUsedToday || 0;
  const lossRemainingToday = Math.max(0, dailyLossLimit - lossUsedToday);
  const riskUsedPct = Math.min(100, (lossUsedToday / dailyLossLimit) * 100);
  const isRiskWarning = riskUsedPct >= 70 && riskUsedPct < 100;
  const isRiskBreached = riskUsedPct >= 100;

  return (
    <div className="space-y-6">
      {/* Top Header Command Station with Interactive Date Range Selector */}
      <div className="p-5 rounded-2xl bg-[#07060A]/90 border border-[#8B5CF6]/25 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.65)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#A78BFA]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_#8B5CF6] animate-pulse"></span>
              <span>INSTITUTIONAL QUANTITATIVE LAB</span>
              <span className="text-[#A78BFA]/50">•</span>
              <span className="text-white font-bold">{filteredTrades.length} Filtered Executions</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white mt-1 tracking-tight">
              Performance Analytics & Statistical Edge
            </h1>
            <p className="text-xs text-[#CBD5E1] mt-0.5">
              Deep econometric analysis, drawdown profiling, return distributions, and mathematical growth modeling
            </p>
          </div>

          {/* Quick Actions & Asset Filter */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-2 bg-[#0D0B14] px-3 py-1.5 rounded-xl border border-[#8B5CF6]/25">
              <span className="text-[#A78BFA] font-mono">Market:</span>
              <select
                value={assetFilter}
                onChange={e => handleAssetFilterChange(e.target.value)}
                className="bg-transparent text-white font-semibold outline-none font-mono cursor-pointer"
              >
                <option value="all" className="bg-[#0D0B14]">All Quotex Pairs</option>
                <option value="Quotex OTC Pairs" className="bg-[#0D0B14]">Quotex OTC Pairs</option>
                <option value="Quotex Live Forex Pairs" className="bg-[#0D0B14]">Quotex Live Forex Pairs</option>
              </select>
            </div>

            <button
              onClick={() => setIsReportOpen(true)}
              className="btn-premium-purple px-4 py-2 rounded-xl text-white font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
            >
              <Download size={14} />
              <span>Audit Report & Export</span>
            </button>
          </div>
        </div>

        {/* 1. Date Range Filter Toolbar */}
        <div className="pt-3 border-t border-[#8B5CF6]/15 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarIcon size={14} className="text-[#C084FC]" />
            <span className="text-xs font-mono font-bold text-[#A78BFA] uppercase tracking-wider">
              Date Horizon:
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all' as DateRangePreset, label: 'All Time' },
              { id: '7d' as DateRangePreset, label: 'Last 7 Days' },
              { id: '14d' as DateRangePreset, label: 'Last 14 Days' },
              { id: '30d' as DateRangePreset, label: 'Last 30 Days' },
              { id: 'this_month' as DateRangePreset, label: 'This Month' },
              { id: 'last_month' as DateRangePreset, label: 'Last Month' },
              { id: 'custom' as DateRangePreset, label: 'Custom Range' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => handleDatePresetChange(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  datePreset === p.id
                    ? 'bg-[#8B5CF6] text-white shadow-[0_0_12px_rgba(139,92,246,0.5)] scale-102'
                    : 'bg-[#0D0B14] text-[#CBD5E1] border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/45 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Active Range Readout Badge */}
          <div className="text-xs font-mono text-[#A78BFA] bg-[#0D0B14]/70 px-2.5 py-1 rounded-xl border border-[#8B5CF6]/20 self-start md:self-auto flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>{dateRangeLabel}</span>
          </div>
        </div>

        {/* Custom Date Range Selector Inputs (visible when custom is selected) */}
        {datePreset === 'custom' && (
          <div className="p-3.5 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/30 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-1 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#A78BFA]">From:</span>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="bg-[#07060A] border border-[#8B5CF6]/30 rounded-lg px-2.5 py-1 text-white outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#A78BFA]">To:</span>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="bg-[#07060A] border border-[#8B5CF6]/30 rounded-lg px-2.5 py-1 text-white outline-none"
              />
            </div>
            {(customStart || customEnd) && (
              <button
                onClick={() => {
                  setCustomStart('');
                  setCustomEnd('');
                }}
                className="text-[#C084FC] hover:underline ml-2"
              >
                Reset Custom
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pro Overtrading / Risk Alert Banner if triggered */}
      {stats.isOvertrading && (
        <div className="p-4 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/35 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-[#EF4444] animate-pulse" />
            <div>
              <span className="font-bold text-white block">Overtrading Risk Flag Triggered</span>
              <span>High execution frequency detected ({stats.tradesCountToday} trades). Maintain strict adherence to your daily limit.</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-[#EF4444]/25 text-white font-mono font-bold">
            Risk Guard Active
          </span>
        </div>
      )}

      {/* Empty State if no trades in selected filter */}
      {!isLoading && filteredTrades.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No Executions Found in Selected Range"
          description={`No trade executions match the active criteria (${dateRangeLabel}${assetFilter !== 'all' ? `, Asset: ${assetFilter}` : ''}). Adjust your dates or log a new trade.`}
          actionText="Log New Trade"
          onAction={onOpenLogTrade}
          secondaryActionText="Reset to All Time"
          onSecondaryAction={() => {
            setDatePreset('all');
            setAssetFilter('all');
          }}
        />
      ) : (
        <>
          {/* 3. Advanced Statistical KPI Matrix with Helpful Tooltips */}
          {isLoading ? (
            <MetricSkeletonGrid />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              <MetricCardWithTooltip
                title="Win Rate"
                value={`${stats.winRate}%`}
                sub={`${stats.winCount}W • ${stats.lossCount}L`}
                isPositive={stats.winRate >= 50}
                tooltipTitle="Win Rate (Trading Edge)"
                tooltipText="Percentage of total closed trades that yielded net positive profit. A cornerstone metric of statistical viability."
                formula="(Wins / Total Trades) × 100"
                whyItMatters="Paired with a positive payoff ratio (> 1:1.5), even a 50% win rate produces institutional compounding."
              />

              <MetricCardWithTooltip
                title="Profit Factor"
                value={stats.profitFactor > 50 ? '99.9' : stats.profitFactor.toFixed(2)}
                sub="Gross Gain / Loss"
                isPositive={stats.profitFactor >= 1.5}
                tooltipTitle="Profit Factor (Gross Gain vs Gross Loss)"
                tooltipText="The ratio of total gross profits to total gross losses. Institutional prop firms look for a Profit Factor above 1.75."
                formula="Gross Realized Wins / Absolute Gross Losses"
                whyItMatters="Values above 2.0 prove exceptional risk management and asymmetric returns."
              />

              <MetricCardWithTooltip
                title="Expectancy"
                value={`+${formatCurrency(stats.expectancy)}`}
                sub="Edge per execution"
                isPositive={stats.expectancy > 0}
                tooltipTitle="Mathematical Expectancy ($ per trade)"
                tooltipText="The average dollar amount you mathematically expect to earn (or lose) on every single executed trade over the long run."
                formula="(WinRate × AvgWin) - (LossRate × AvgLoss)"
                whyItMatters="Must remain strictly positive. A positive expectancy proves that your edge is real and reproducible."
              />

              <MetricCardWithTooltip
                title="Average R"
                value={`${stats.averageR > 0 ? '+' : ''}${stats.averageR.toFixed(2)}R`}
                sub={`Median: ${stats.medianR.toFixed(2)}R`}
                isPositive={stats.averageR > 0}
                tooltipTitle="Average R-Multiple (Risk:Reward)"
                tooltipText="The average multiple of initial planned risk realized per trade. Standardizes performance independent of account size."
                formula="Net PnL / Initial Monetary Risk"
                whyItMatters="An average R > 1.0R allows you to stay highly profitable even through losing streaks."
              />

              <MetricCardWithTooltip
                title="Max Drawdown"
                value={`-${formatCurrency(stats.maxDrawdown)}`}
                sub={`${stats.maxDrawdownPercent}% Peak-to-Valley`}
                isPositive={stats.maxDrawdownPercent < 6}
                tooltipTitle="Maximum Equity Drawdown"
                tooltipText="The largest monetary and percentage decline from historical account equity peak down to the deepest valley."
                formula="Max of (Historical Peak Balance - Current Trough)"
                whyItMatters="Crucial for prop-firm survival. Keeping drawdown under 5% preserves trading psychology and longevity."
              />

              <MetricCardWithTooltip
                title="Recovery Factor"
                value={stats.recoveryFactor.toFixed(2)}
                sub="Net PnL / Max DD"
                isPositive={stats.recoveryFactor >= 2}
                tooltipTitle="Recovery Factor (System Resiliency)"
                tooltipText="Measures how effectively and quickly the trading system rebounds and earns back its maximum drawdown."
                formula="Total Net Realized PnL / Maximum Dollar Drawdown"
                whyItMatters="A Recovery Factor > 3.0 indicates rapid recovery after adverse market regimes."
              />

              <MetricCardWithTooltip
                title="Consistency"
                value={`${stats.consistencyScore}/100`}
                sub="Grade A Quant"
                isPositive={stats.consistencyScore >= 80}
                tooltipTitle="Consistency & Distribution Index"
                tooltipText="Composite metric evaluating regularity of returns, absence of wild emotional outlier losses, and disciplined execution over time."
                formula="Composite of Win Rate, Profit Factor, & Rule Adherence"
                whyItMatters="Scores > 80 qualify for institutional capital allocation and prop scaling."
              />

              <MetricCardWithTooltip
                title="Risk Score"
                value={`${stats.riskManagementScore}/100`}
                sub="Capital Shield"
                isPositive={stats.riskManagementScore >= 80}
                tooltipTitle="Capital Shield & Risk Adherence"
                tooltipText="Audits adherence to stop loss discipline, strict daily loss caps, and absence of revenge/martingale over-leveraging."
                formula="Rule Compliance Score × 0.7 + Drawdown Protection × 0.3"
                whyItMatters="Prevents catastrophic blowups and guarantees survival during black swan volatility."
              />
            </div>
          )}

          {/* Best Day, Worst Day, Current Streak, and Daily Risk Limit Tracker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Best Day Card */}
            <div className="p-4 rounded-2xl bg-[#0D0B14]/80 border border-[#8B5CF6]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#CBD5E1] font-bold flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-[#10B981]" /> Best Trading Day
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] font-mono font-bold">
                  {stats.bestDay.date}
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-[#10B981]">
                +{formatCurrency(stats.bestDay.pnl)}
              </div>
              <span className="text-[11px] text-[#A78BFA] mt-1 block font-mono">
                Peak historical single-day performance
              </span>
            </div>

            {/* Worst Day Card */}
            <div className="p-4 rounded-2xl bg-[#0D0B14]/80 border border-[#8B5CF6]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#CBD5E1] font-bold flex items-center gap-1.5">
                  <TrendingDown size={14} className="text-[#EF4444]" /> Worst Trading Day
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] font-mono font-bold">
                  {stats.worstDay.date}
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-[#EF4444]">
                {formatCurrency(stats.worstDay.pnl)}
              </div>
              <span className="text-[11px] text-[#A78BFA] mt-1 block font-mono">
                Maximum controlled daily loss
              </span>
            </div>

            {/* Current & Best Streak Card */}
            <div className="p-4 rounded-2xl bg-[#0D0B14]/80 border border-[#8B5CF6]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#CBD5E1] font-bold flex items-center gap-1.5">
                  <Flame size={14} className="text-[#F59E0B]" /> Current Streak
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] font-mono font-bold">
                  Best: {stats.bestWinStreak}W
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-white flex items-center gap-2">
                {stats.currentStreakType === 'win' ? (
                  <span className="text-[#10B981] flex items-center gap-1">
                    🔥 {stats.currentStreak} Wins
                  </span>
                ) : stats.currentStreakType === 'loss' ? (
                  <span className="text-[#EF4444] flex items-center gap-1">
                    ⚠️ {stats.currentStreak} Losses
                  </span>
                ) : (
                  <span>Neutral</span>
                )}
              </div>
              <span className="text-[11px] text-[#A78BFA] mt-1 block font-mono">
                Max Drawdown Streak: {stats.worstLossStreak}L
              </span>
            </div>

            {/* Daily Risk Limit Tracker */}
            <div className="p-4 rounded-2xl bg-[#0D0B14]/80 border border-[#8B5CF6]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#CBD5E1] font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#8B5CF6]" /> Daily Risk Limit
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isRiskBreached ? 'bg-[#EF4444]/20 text-[#EF4444]' : isRiskWarning ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-[#10B981]/20 text-[#10B981]'
                }`}>
                  {isRiskBreached ? 'BREACHED' : isRiskWarning ? 'WARNING' : 'SAFE'}
                </span>
              </div>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-lg font-black text-white">${lossUsedToday.toFixed(0)}</span>
                <span className="text-xs text-[#CBD5E1]">of ${dailyLossLimit} limit</span>
              </div>
              <div className="h-2 w-full bg-[#07060A] rounded-full overflow-hidden mt-2 border border-[#8B5CF6]/20">
                <div
                  style={{ width: `${riskUsedPct}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    isRiskBreached ? 'bg-[#EF4444]' : isRiskWarning ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                  }`}
                />
              </div>
              <span className="text-[10px] text-[#A78BFA] mt-1.5 block font-mono">
                Remaining Loss Buffer: ${lossRemainingToday.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Risk Heatmap Calendar & Mistake Tags Cloud */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskHeatmapCalendar trades={filteredTrades} dailyLossLimit={dailyLossLimit} />
            <MistakeTagsCloud trades={filteredTrades} />
          </div>

          {/* 2. Dedicated Drawdown Chart below Daily Realized PnL */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
              <ChartSkeletonLoader title="Daily Realized PnL" />
            ) : (
              <DailyPnlBarChart trades={filteredTrades} />
            )}

            {isLoading ? (
              <ChartSkeletonLoader title="Drawdown & Underwater Analysis" />
            ) : (
              <DedicatedDrawdownChart trades={filteredTrades} startingBalance={defaultAccount.startingBalance} />
            )}
          </div>

          {/* Row 2: Period Breakdown & Return Distribution Histogram */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
              <ChartSkeletonLoader title="Period Breakdown" />
            ) : (
              <PeriodBreakdownChart trades={filteredTrades} />
            )}

            {isLoading ? (
              <ChartSkeletonLoader title="Return Distribution" />
            ) : (
              <ReturnDistributionChart trades={filteredTrades} />
            )}
          </div>

          {/* Row 3: Profit by Currency Pair / Asset & Win/Loss Edge */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {isLoading ? (
                <ChartSkeletonLoader title="Asset Performance" />
              ) : (
                <AssetPerformanceChart trades={filteredTrades} />
              )}
            </div>
            <div>
              {isLoading ? (
                <ChartSkeletonLoader title="Win / Loss Ratio" />
              ) : (
                <WinLossDonutChart trades={filteredTrades} />
              )}
            </div>
          </div>

          {/* Row 4: Trading Session Performance & Weekday Edge */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceBySessionChart trades={filteredTrades} />

            {/* Weekday Performance */}
            <div className="trade-card rounded-2xl p-5 border border-[#8B5CF6]/20 bg-[#07060A]/70 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]"></span>
                  Performance by Weekday
                </h4>
                <span className="text-xs text-[#CBD5E1] font-mono">Day-of-Week Edge</span>
              </div>

              <div className="space-y-3">
                {daysOfWeek.map((day) => {
                  const d = dayStats[day];
                  if (d.count === 0) return null;
                  const isPos = d.pnl >= 0;
                  const winRate = d.count > 0 ? Math.round((d.wins / d.count) * 100) : 0;

                  return (
                    <div key={day} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D0B14]/80 border border-[#8B5CF6]/20 text-xs font-mono">
                      <div>
                        <span className="font-bold text-white mr-2">{day}</span>
                        <span className="text-[#CBD5E1]">({d.count} trades • {winRate}% win)</span>
                      </div>
                      <span className={`font-bold ${isPos ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {isPos ? '+' : ''}{formatCurrency(d.pnl)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 5: Projected Account Growth Compound Calculator */}
          <div className="trade-card rounded-2xl p-6 border border-[#8B5CF6]/25 bg-[#07060A]/85 backdrop-blur-2xl shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#8B5CF6]/20">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#A78BFA]">
                  <Calculator size={15} className="text-[#C084FC]" />
                  <span>MATHEMATICAL EDGE SIMULATOR</span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">Projected Compound Account Growth</h3>
                <p className="text-xs text-[#CBD5E1]">
                  Simulate exponential account trajectory based on edge probability, position risk, and execution volume
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[11px] text-[#A78BFA] block">Projected Balance ({calcDays} Days)</span>
                <div className="text-2xl font-black text-[#10B981]">
                  {formatCurrency(finalProjected)}
                </div>
                <span className="text-xs text-[#C084FC] font-bold">
                  +{projectedReturnPct.toFixed(1)}% Expected Return
                </span>
              </div>
            </div>

            {/* Input Parameters Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-[11px] text-[#CBD5E1] font-medium block mb-1">Starting Capital ($)</label>
                <input
                  type="number"
                  value={calcStartBal}
                  onChange={e => setCalcStartBal(Math.max(10, parseFloat(e.target.value) || 100))}
                  className="w-full bg-[#0D0B14] border border-[#8B5CF6]/25 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#CBD5E1] font-medium block mb-1">Expected Win Rate (%)</label>
                <input
                  type="number"
                  value={calcWinRate}
                  onChange={e => setCalcWinRate(Math.min(99, Math.max(1, parseFloat(e.target.value) || 50)))}
                  className="w-full bg-[#0D0B14] border border-[#8B5CF6]/25 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#CBD5E1] font-medium block mb-1">Risk per Trade (%)</label>
                <input
                  type="number"
                  value={calcRiskPct}
                  onChange={e => setCalcRiskPct(Math.min(25, Math.max(0.2, parseFloat(e.target.value) || 1)))}
                  className="w-full bg-[#0D0B14] border border-[#8B5CF6]/25 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#CBD5E1] font-medium block mb-1">Payoff Ratio (R:R)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcPayoff}
                  onChange={e => setCalcPayoff(Math.max(0.5, parseFloat(e.target.value) || 1.5))}
                  className="w-full bg-[#0D0B14] border border-[#8B5CF6]/25 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#CBD5E1] font-medium block mb-1">Trades / Day</label>
                <input
                  type="number"
                  value={calcTradesPerDay}
                  onChange={e => setCalcTradesPerDay(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full bg-[#0D0B14] border border-[#8B5CF6]/25 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#CBD5E1] font-medium block mb-1">Horizon (Days)</label>
                <select
                  value={calcDays}
                  onChange={e => setCalcDays(parseInt(e.target.value))}
                  className="w-full bg-[#0D0B14] border border-[#8B5CF6]/25 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none cursor-pointer"
                >
                  <option value="15" className="bg-[#0D0B14]">15 Days</option>
                  <option value="30" className="bg-[#0D0B14]">30 Days (1 Month)</option>
                  <option value="60" className="bg-[#0D0B14]">60 Days (2 Months)</option>
                  <option value="90" className="bg-[#0D0B14]">90 Days (Quarter)</option>
                </select>
              </div>
            </div>

            {/* Milestones Progression */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#8B5CF6]/15">
              {[0.25, 0.5, 0.75, 1].map((pct) => {
                const dayIdx = Math.round(calcDays * pct);
                const pt = projectedPoints.find(p => p.day === dayIdx) || projectedPoints[projectedPoints.length - 1];
                return (
                  <div key={pct} className="p-3 rounded-xl bg-[#0D0B14]/80 border border-[#8B5CF6]/20">
                    <span className="text-[10px] text-[#A78BFA] font-mono block">Day {dayIdx} Projection</span>
                    <div className="text-base font-black font-mono text-white mt-0.5">
                      {formatCurrency(pt?.balance || 0)}
                    </div>
                    <span className="text-[10px] text-[#10B981] font-mono">
                      +{(calcStartBal > 0 && pt ? ((pt.balance - calcStartBal) / calcStartBal) * 100 : 0).toFixed(0)}% growth
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Performance Report Modal */}
      <PerformanceReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        trades={filteredTrades}
        stats={stats}
        account={defaultAccount}
      />
    </div>
  );
}
