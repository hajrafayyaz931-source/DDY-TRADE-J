import React, { useState, useMemo } from 'react';
import { Trade } from '../../types/trade';
import { formatCurrency } from '../../utils/calculations';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface RiskHeatmapCalendarProps {
  trades: Trade[];
  dailyLossLimit?: number;
  onSelectDate?: (dateStr: string) => void;
}

interface DayCellData {
  dateStr: string;
  dayNum: number;
  tradesCount: number;
  pnl: number;
  winCount: number;
  rulesFollowedPct: number;
  maxDrawdown: number;
  riskGrade: 'S' | 'A' | 'B' | 'C' | 'F' | 'NONE';
  bgColor: string;
  borderColor: string;
}

export function RiskHeatmapCalendar({
  trades,
  dailyLossLimit = 200,
  onSelectDate,
}: RiskHeatmapCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<'risk' | 'pnl'>('risk');
  const [hoveredDay, setHoveredDay] = useState<DayCellData | null>(null);

  // Calendar month limits & navigation
  const monthYearLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Build grid of days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sun, 1 = Mon...

    const dayCells: DayCellData[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      const dayTrades = trades.filter(t => t.date === dateStr);
      const tradesCount = dayTrades.length;
      const netPnl = dayTrades.reduce((acc, t) => acc + t.pnl, 0);
      const wins = dayTrades.filter(t => t.pnl > 0).length;

      let totalR = 0;
      let followedR = 0;
      let maxDD = 0;
      let cumPnl = 0;
      let peakPnl = 0;

      dayTrades.forEach(t => {
        totalR += t.totalRules || 5;
        followedR += t.rulesFollowed;

        cumPnl += t.pnl;
        if (cumPnl > peakPnl) peakPnl = cumPnl;
        const dd = peakPnl - cumPnl;
        if (dd > maxDD) maxDD = dd;
      });

      const rulesPct = totalR > 0 ? Math.round((followedR / totalR) * 100) : 100;

      // Determine Risk Grade
      let grade: 'S' | 'A' | 'B' | 'C' | 'F' | 'NONE' = 'NONE';
      let bgColor = 'bg-[#0D0B14]/60';
      let borderColor = 'border-[#8B5CF6]/15';

      if (tradesCount > 0) {
        if (netPnl > 0 && rulesPct === 100) {
          grade = 'S';
          bgColor = viewMode === 'risk' 
            ? 'bg-[#10B981]/25 border-[#10B981]/60 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
            : 'bg-[#10B981]/25 border-[#10B981]/50';
          borderColor = 'border-[#10B981]';
        } else if (netPnl > 0 && rulesPct >= 80) {
          grade = 'A';
          bgColor = viewMode === 'risk'
            ? 'bg-[#10B981]/20 border-[#10B981]/40 text-emerald-200'
            : 'bg-[#10B981]/20 border-[#10B981]/40';
          borderColor = 'border-[#10B981]/60';
        } else if (netPnl >= 0) {
          grade = 'B';
          bgColor = 'bg-[#8B5CF6]/20 border-[#8B5CF6]/40 text-purple-200';
          borderColor = 'border-[#8B5CF6]/50';
        } else if (Math.abs(netPnl) <= dailyLossLimit && rulesPct >= 70) {
          grade = 'C';
          bgColor = 'bg-[#F59E0B]/20 border-[#F59E0B]/40 text-amber-200';
          borderColor = 'border-[#F59E0B]/50';
        } else {
          grade = 'F';
          bgColor = 'bg-[#EF4444]/25 border-[#EF4444]/60 text-rose-200 shadow-[0_0_12px_rgba(239,68,68,0.3)]';
          borderColor = 'border-[#EF4444]';
        }
      }

      dayCells.push({
        dateStr,
        dayNum: d,
        tradesCount,
        pnl: netPnl,
        winCount: wins,
        rulesFollowedPct: rulesPct,
        maxDrawdown: maxDD,
        riskGrade: grade,
        bgColor,
        borderColor,
      });
    }

    return { startingDayOfWeek, dayCells };
  }, [currentMonth, trades, dailyLossLimit, viewMode]);

  return (
    <div className="trade-card rounded-2xl p-5 border border-[#8B5CF6]/25 bg-[#07060A]/85 backdrop-blur-2xl shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#8B5CF6]/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#C084FC]">
            <CalendarIcon size={16} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Risk & Discipline Heatmap Calendar</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#C084FC] border border-[#8B5CF6]/40 font-mono font-bold">
                RISK PROFILING
              </span>
            </h3>
            <p className="text-[11px] text-[#A78BFA]">
              Daily executions evaluated by risk grade, intraday drawdown, and rule compliance
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Month Nav */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center bg-[#0D0B14] p-1 rounded-xl border border-[#8B5CF6]/25">
            <button
              onClick={() => setViewMode('risk')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'risk' ? 'bg-[#8B5CF6] text-white shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'text-[#A78BFA] hover:text-white'
              }`}
            >
              Risk Grade
            </button>
            <button
              onClick={() => setViewMode('pnl')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'pnl' ? 'bg-[#10B981] text-[#07060A] shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-[#A78BFA] hover:text-white'
              }`}
            >
              Net PnL ($)
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[#0D0B14] px-2 py-1 rounded-xl border border-[#8B5CF6]/25">
            <button onClick={handlePrevMonth} className="p-1 text-[#A78BFA] hover:text-white">
              <ChevronLeft size={14} />
            </button>
            <span className="text-white font-bold px-1 min-w-[110px] text-center">{monthYearLabel}</span>
            <button onClick={handleNextMonth} className="p-1 text-[#A78BFA] hover:text-white">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[10px] text-[#A78BFA] uppercase tracking-wider font-bold">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 font-mono">
        {/* Empty slots for starting offset */}
        {Array.from({ length: calendarDays.startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-16 rounded-xl bg-[#0D0B14]/30 border border-[#8B5CF6]/10 opacity-30" />
        ))}

        {/* Day Cells */}
        {calendarDays.dayCells.map((day) => {
          const hasTrades = day.tradesCount > 0;

          return (
            <div
              key={day.dateStr}
              onMouseEnter={() => setHoveredDay(day)}
              onClick={() => {
                if (hasTrades && onSelectDate) onSelectDate(day.dateStr);
              }}
              className={`h-16 rounded-xl p-1.5 border transition-all duration-150 flex flex-col justify-between relative cursor-pointer group ${day.bgColor} ${
                hasTrades ? 'hover:scale-103 hover:z-10' : 'hover:border-[#8B5CF6]/30'
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-slate-300">{day.dayNum}</span>
                {hasTrades && (
                  <span className={`px-1.5 py-0.2 rounded font-bold ${
                    day.riskGrade === 'S' || day.riskGrade === 'A' ? 'bg-[#10B981]/30 text-[#10B981]' :
                    day.riskGrade === 'B' ? 'bg-[#8B5CF6]/30 text-[#C084FC]' :
                    day.riskGrade === 'C' ? 'bg-[#F59E0B]/30 text-[#F59E0B]' : 'bg-[#EF4444]/30 text-[#EF4444]'
                  }`}>
                    {viewMode === 'risk' ? `Grade ${day.riskGrade}` : `${day.tradesCount}T`}
                  </span>
                )}
              </div>

              {hasTrades ? (
                <div className="text-right">
                  <span className={`text-[11px] font-extrabold block truncate ${
                    day.pnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}>
                    {day.pnl >= 0 ? '+' : ''}{formatCurrency(day.pnl)}
                  </span>
                </div>
              ) : (
                <span className="text-[9px] text-[#94A3B8]/40 block text-right">No Trades</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between text-[10px] font-mono pt-2 border-t border-[#8B5CF6]/15 text-[#A78BFA]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#10B981]" /> Grade S/A (Disciplined Win)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#8B5CF6]" /> Grade B (Even / Small Loss)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#F59E0B]" /> Grade C (Controlled Loss)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#EF4444]" /> Grade F (Limit Breached)
          </span>
        </div>
      </div>

      {/* Hover Inspection Card */}
      {hoveredDay && hoveredDay.tradesCount > 0 && (
        <div className="p-3 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/40 flex flex-wrap items-center justify-between gap-2 text-xs font-mono animate-in fade-in duration-150">
          <div>
            <span className="font-bold text-white block">{hoveredDay.dateStr} Session Inspection:</span>
            <span className="text-[11px] text-[#A78BFA]">
              {hoveredDay.tradesCount} Executions • Win Rate: {Math.round((hoveredDay.winCount / hoveredDay.tradesCount) * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] text-[#A78BFA] block">Realized PnL</span>
              <span className={`font-bold ${hoveredDay.pnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {hoveredDay.pnl >= 0 ? '+' : ''}{formatCurrency(hoveredDay.pnl)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#A78BFA] block">Rule Compliance</span>
              <span className="font-bold text-[#C084FC]">{hoveredDay.rulesFollowedPct}%</span>
            </div>
            <div>
              <span className="text-[10px] text-[#A78BFA] block">Risk Grade</span>
              <span className="font-bold text-white bg-[#8B5CF6]/30 px-2 py-0.5 rounded border border-[#8B5CF6]/50">
                Grade {hoveredDay.riskGrade}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
