import React, { useState } from 'react';
import { Trade } from '../../types/trade';
import { formatCurrency } from '../../utils/calculations';

interface CalendarHeatmapProps {
  trades: Trade[];
  onSelectDate?: (dateStr: string) => void;
  selectedDate?: string | null;
  hoveredDate?: string | null;
  embedded?: boolean;
}

export function CalendarHeatmap({ trades, onSelectDate, selectedDate, hoveredDate, embedded = false }: CalendarHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState('2026-10'); // Default October 2026 to match dataset

  // Generate 31 days for October 2026
  const daysInMonth = 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Group trades by date
  const tradesByDay: Record<number, { trades: Trade[]; pnl: number; wins: number; losses: number }> = {};
  
  trades.forEach(t => {
    if (t.date.startsWith(currentMonth)) {
      const dayNum = parseInt(t.date.slice(8, 10), 10);
      if (!tradesByDay[dayNum]) {
        tradesByDay[dayNum] = { trades: [], pnl: 0, wins: 0, losses: 0 };
      }
      tradesByDay[dayNum].trades.push(t);
      tradesByDay[dayNum].pnl += t.pnl;
      if (t.pnl > 0) tradesByDay[dayNum].wins++;
      else if (t.pnl < 0) tradesByDay[dayNum].losses++;
    }
  });

  const monthTotalPnl = Object.values(tradesByDay).reduce((acc, d) => acc + d.pnl, 0);
  const tradingDaysCount = Object.keys(tradesByDay).length;
  const greenDaysCount = Object.values(tradesByDay).filter(d => d.pnl > 0).length;

  return (
    <div className={embedded ? 'w-full h-full flex flex-col justify-between' : 'trade-card rounded-2xl p-6 border border-[#8B5CF6]/20'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#8B5CF6]/15">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]"></span>
            Trading Calendar Heatmap
          </h3>
          <p className="text-xs text-[#94A3B8] mt-0.5 font-mono">
            October 2026 • {greenDaysCount}/{tradingDaysCount} Profitable Sessions ({tradingDaysCount > 0 ? Math.round((greenDaysCount / tradingDaysCount) * 100) : 0}% Win Days)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-[#94A3B8] block font-mono">Month Realized:</span>
            <span className={`text-base font-extrabold font-mono ${monthTotalPnl >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
              {monthTotalPnl >= 0 ? '+' : ''}{formatCurrency(monthTotalPnl)}
            </span>
          </div>
          {selectedDate && (
            <button
              onClick={() => onSelectDate && onSelectDate('')}
              className="text-xs px-2.5 py-1 rounded-xl btn-glass-subtle text-slate-200"
            >
              Clear Filter ({selectedDate})
            </button>
          )}
        </div>
      </div>

      {/* Weekday headers (Thursday start for Oct 1, 2026) */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-mono font-bold text-[#A78BFA]/70">
        <span>SUN</span>
        <span>MON</span>
        <span>TUE</span>
        <span>WED</span>
        <span>THU</span>
        <span>FRI</span>
        <span>SAT</span>
      </div>

      {/* 4 Empty slots for Oct 1, 2026 (Thu) */}
      <div className="grid grid-cols-7 gap-2">
        <div className="aspect-square rounded-xl bg-[#07060A]/40 border border-transparent"></div>
        <div className="aspect-square rounded-xl bg-[#07060A]/40 border border-transparent"></div>
        <div className="aspect-square rounded-xl bg-[#07060A]/40 border border-transparent"></div>
        <div className="aspect-square rounded-xl bg-[#07060A]/40 border border-transparent"></div>

        {/* Month Days */}
        {days.map(d => {
          const dateStr = `${currentMonth}-${String(d).padStart(2, '0')}`;
          const dayData = tradesByDay[d];
          const hasTrades = Boolean(dayData && dayData.trades.length > 0);
          const isProfitable = dayData && dayData.pnl > 0;
          const isLoss = dayData && dayData.pnl < 0;
          const isSelected = selectedDate === dateStr;
          const isHovered = hoveredDate === dateStr;

          return (
            <button
              key={d}
              onClick={() => onSelectDate && onSelectDate(isSelected ? '' : dateStr)}
              className={`aspect-square rounded-xl p-2 flex flex-col justify-between transition-all border text-left group relative active:scale-95 ${
                isSelected
                  ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/50 shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                  : isHovered
                  ? 'border-[#C084FC] ring-2 ring-[#C084FC] shadow-[0_0_18px_rgba(192,132,252,0.85)] brightness-125 scale-105'
                  : hasTrades
                  ? isProfitable
                    ? 'bg-[#10B981]/15 border-[#10B981]/40 hover:border-[#10B981] hover:shadow-[0_0_14px_rgba(16,185,129,0.35)]'
                    : 'bg-[#F43F5E]/15 border-[#F43F5E]/40 hover:border-[#F43F5E] hover:shadow-[0_0_14px_rgba(244,63,94,0.35)]'
                  : 'bg-[#0E0A1A]/70 border-[#8B5CF6]/15 hover:border-[#8B5CF6]/35 opacity-75'
              }`}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-mono font-bold ${hasTrades ? 'text-white' : 'text-[#64748B]'}`}>
                  {d}
                </span>
                {hasTrades && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/50 text-[#A78BFA] font-mono border border-[#8B5CF6]/20">
                    {dayData.trades.length}
                  </span>
                )}
              </div>

              {/* Day PnL value */}
              {hasTrades ? (
                <div>
                  <div className={`text-xs font-extrabold font-mono truncate ${isProfitable ? 'text-[#10B981]' : isLoss ? 'text-[#F43F5E]' : 'text-slate-300'}`}>
                    {dayData.pnl >= 0 ? '+' : ''}{Math.round(dayData.pnl)}
                  </div>
                  <div className="text-[9px] text-[#94A3B8] font-mono mt-0.5 hidden sm:block">
                    {dayData.wins}W • {dayData.losses}L
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-[#475569] font-mono">No trade</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
