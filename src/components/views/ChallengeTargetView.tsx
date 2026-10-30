import React, { useState } from 'react';
import { ChallengeDay, Trade } from '../../types/trade';
import { formatCurrency } from '../../utils/calculations';
import confetti from 'canvas-confetti';
import { Download, Printer, RefreshCw, Check, Edit2 } from 'lucide-react';

interface ChallengeTargetViewProps {
  challengeDays: ChallengeDay[];
  onUpdateDay: (dayNum: number, updates: Partial<ChallengeDay>) => void;
  todayTrades: Trade[];
}

export function ChallengeTargetView({
  challengeDays,
  onUpdateDay,
  todayTrades,
}: ChallengeTargetViewProps) {
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editActual, setEditActual] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // Calculate overall metrics
  const achievedDays = challengeDays.filter(d => d.status === 'achieved');
  const missedDays = challengeDays.filter(d => d.status === 'missed');
  const inProgressDay = challengeDays.find(d => d.status === 'in_progress') || challengeDays[0];

  const currentAccumulatedProfit = challengeDays.reduce((acc, d) => {
    if (d.status === 'achieved') return acc + (d.actualProfit ?? d.profitTarget);
    if (d.status === 'in_progress') return acc + (d.actualProfit ?? 0);
    return acc;
  }, 0);
  const currentEquity = 100 + currentAccumulatedProfit;
  const progressPercent = Math.min(100, Math.max(2, (currentEquity / 5000) * 100));

  const handleToggleStatus = (day: ChallengeDay) => {
    let nextStatus: ChallengeDay['status'] = 'achieved';
    if (day.status === 'achieved') nextStatus = 'missed';
    else if (day.status === 'missed') nextStatus = 'in_progress';
    else if (day.status === 'in_progress') nextStatus = 'pending';
    else nextStatus = 'achieved';

    if (nextStatus === 'achieved') {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#03dac6', '#bb86fc', '#e0e0e0'],
        });
      } catch (e) {}
    }

    onUpdateDay(day.day, {
      status: nextStatus,
      actualProfit: nextStatus === 'achieved' ? (day.actualProfit ?? day.profitTarget) : nextStatus === 'missed' ? 0 : day.actualProfit,
    });
  };

  const handleSaveEdit = (dayNum: number) => {
    onUpdateDay(dayNum, {
      actualProfit: parseFloat(editActual) || 0,
      notes: editNotes,
    });
    setEditingDay(null);
  };

  const handleExportCsv = () => {
    const headers = ['Cycle', 'Start', 'Target', 'Expected Balance', 'Lot', 'Status', 'Actual Profit', 'Notes'];
    const rows = challengeDays.map(d => [
      d.day,
      d.startingBalance,
      d.profitTarget,
      d.expectedBalance,
      `"${d.lotSize}"`,
      d.status.toUpperCase(),
      d.actualProfit ?? '',
      `"${d.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'DDY_TradePath_30days_challenge.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-mono text-xs text-[#e0e0e0]">
      {/* Variation 3 Terminal Hero Block - Exact match to user screenshot */}
      <div className="hero-block bg-[#151618] border border-[#222326] p-6 sm:p-8">
        <div className="text-[0.7rem] text-[#bb86fc] tracking-wider mb-2">
          // CHALLENGE_OVERVIEW
        </div>

        <h1 className="font-syne text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-none mb-3">
          $100 &gt; $5K
        </h1>

        <p className="text-xs text-[#666666] max-w-2xl leading-relaxed mb-6">
          Compound strategies applied to Quotex binary instruments. Daily targets are non-negotiable for 30 cycles.
        </p>

        {/* Current Standings Row */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#e0e0e0] font-bold">
              CURR_STAND: {formatCurrency(currentEquity)}
            </span>
            <span className="text-[#bb86fc] font-bold">
              PCT_TOTAL: {progressPercent.toFixed(1)}%
            </span>
          </div>

          {/* Terminal Progress Bar */}
          <div className="bar-outer relative h-6 bg-[#000000] border border-[#222326] p-0.5">
            <div 
              className="bar-inner h-full bg-[#bb86fc] transition-all duration-500" 
              style={{ width: `${progressPercent}%` }} 
            />
            <div className="bar-label absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider">
              {achievedDays.length} / 30 DAYS COMPLETED
            </div>
          </div>
        </div>

        {/* Action buttons toolbar */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#222326]">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1D21] hover:bg-[#25272C] border border-[#222326] text-xs text-[#e0e0e0] transition-colors cursor-pointer"
          >
            <Download size={13} className="text-[#03dac6]" />
            <span>EXPORT_CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1D21] hover:bg-[#25272C] border border-[#222326] text-xs text-[#e0e0e0] transition-colors cursor-pointer"
          >
            <Printer size={13} className="text-[#bb86fc]" />
            <span>PRINT_PLAN</span>
          </button>
          <div className="text-[10px] text-[#666] ml-auto">
            STATUS: CLICK BADGE TO TOGGLE IN_PROG / ACHIEVED / PENDING
          </div>
        </div>
      </div>

      {/* Variation 3 Central Execution Grid Table - Exact match to user screenshot */}
      <div className="grid-table border border-[#222326] bg-[#0b0c0d]">
        {/* Table Header */}
        <div className="grid grid-cols-[60px_90px_90px_100px_80px_110px_1fr] bg-[#151618] border-b border-[#222326] py-3 px-3 text-[11px] font-bold text-[#666666] uppercase tracking-wider select-none">
          <div>D_CYC</div>
          <div>START</div>
          <div>TGT</div>
          <div>EXP_BAL</div>
          <div>LOT</div>
          <div>STATUS</div>
          <div>NOTES</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-[#222326]">
          {challengeDays.map((d) => {
            const isAchieved = d.status === 'achieved';
            const isMissed = d.status === 'missed';
            const isInProgress = d.status === 'in_progress';

            return (
              <div
                key={d.day}
                className={`grid grid-cols-[60px_90px_90px_100px_80px_110px_1fr] items-center py-2.5 px-3 hover:bg-[#151618] transition-colors ${
                  isInProgress ? 'bg-[#151618]/90' : ''
                }`}
              >
                {/* D_CYC */}
                <div className="font-bold text-[#bb86fc]">
                  {d.day < 10 ? `0${d.day}` : d.day}
                </div>

                {/* START */}
                <div className="text-[#e0e0e0]">
                  ${d.startingBalance.toLocaleString()}
                </div>

                {/* TGT */}
                <div className="font-bold text-[#03dac6]">
                  +${d.profitTarget}
                </div>

                {/* EXP_BAL */}
                <div className="text-[#e0e0e0] font-semibold">
                  ${d.expectedBalance.toLocaleString()}
                </div>

                {/* LOT */}
                <div className="text-[#888888]">
                  {d.lotSize}
                </div>

                {/* STATUS BADGE - Interactive Toggle */}
                <div>
                  <button
                    onClick={() => handleToggleStatus(d)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isInProgress
                        ? 'bg-[#bb86fc]/15 border border-[#bb86fc] text-[#bb86fc]'
                        : isAchieved
                        ? 'bg-[#03dac6]/15 border border-[#03dac6] text-[#03dac6]'
                        : isMissed
                        ? 'bg-[#cf6679]/15 border border-[#cf6679] text-[#cf6679]'
                        : 'border border-[#333336] text-[#666666] hover:border-[#666]'
                    }`}
                  >
                    {isInProgress
                      ? 'IN_PROG'
                      : isAchieved
                      ? 'ACHIEVED'
                      : isMissed
                      ? 'MISSED'
                      : 'PENDING'}
                  </button>
                </div>

                {/* NOTES */}
                <div className="text-[#888888] truncate flex items-center justify-between gap-2 pr-2">
                  {editingDay === d.day ? (
                    <div className="flex items-center gap-1 w-full">
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Add notes..."
                        className="bg-[#000] border border-[#bb86fc] px-2 py-0.5 text-xs text-white rounded-none outline-none flex-1"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(d.day)}
                        className="p-1 bg-[#03dac6] text-black font-bold text-[10px]"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="truncate">
                        {d.notes || (d.day === 1 ? 'EUR/USD OTC, clean session.' : d.day === 2 ? 'Pullback strat, Gold/EUR.' : '...')}
                      </span>
                      <button
                        onClick={() => {
                          setEditingDay(d.day);
                          setEditNotes(d.notes || '');
                          setEditActual(String(d.actualProfit ?? d.profitTarget));
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-[#666] hover:text-[#bb86fc] transition-opacity p-0.5"
                        title="Edit Note"
                      >
                        <Edit2 size={11} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
