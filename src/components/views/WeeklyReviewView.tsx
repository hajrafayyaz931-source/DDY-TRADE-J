import React, { useState } from 'react';
import { Trade, WeeklyReviewRecord } from '../../types/trade';
import { FileText, Printer, Check, Target, TrendingUp, TrendingDown, Sparkles, Award } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

import { AIWeeklyCoachModule } from '../ui/AIWeeklyCoachModule';

interface WeeklyReviewViewProps {
  review: WeeklyReviewRecord;
  trades: Trade[];
  onSaveReview: (updatedReview: WeeklyReviewRecord) => void;
}

export function WeeklyReviewView({ review, trades, onSaveReview }: WeeklyReviewViewProps) {
  const [formData, setFormData] = useState<WeeklyReviewRecord>(review);
  const [savedToast, setSavedToast] = useState(false);

  // Filter trades for this week
  const weekTrades = trades.filter(t => t.date >= review.startDate && t.date <= review.endDate);
  const weekPnl = weekTrades.reduce((acc, t) => acc + t.pnl, 0);
  const weekWins = weekTrades.filter(t => t.pnl > 0).length;
  const weekWinRate = weekTrades.length > 0 ? (weekWins / weekTrades.length) * 100 : 0;
  
  // Best and worst trade
  const sorted = [...weekTrades].sort((a, b) => b.pnl - a.pnl);
  const bestTrade = sorted[0];
  const worstTrade = sorted[sorted.length - 1];

  const handleSave = () => {
    onSaveReview(formData);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#101722] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8492A6]">
            <FileText size={14} className="text-[#3987FF]" />
            <span>WEEKLY JOURNAL REPORT & REFLECTION</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white mt-1 tracking-tight">
            Weekly Performance Review ({review.weekId})
          </h1>
          <p className="text-xs text-[#8492A6] mt-0.5">
            Automatic performance synthesis, mistake debrief, and structured continuous improvement
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedToast && (
            <span className="text-xs font-bold text-[#00D6A0] flex items-center gap-1 animate-pulse">
              <Check size={14} /> Review Saved!
            </span>
          )}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-[#182333] hover:bg-[#202C3E] border border-[#243346] text-slate-200 text-xs font-bold flex items-center gap-2"
          >
            <Printer size={14} className="text-[#3987FF]" />
            <span>Print / PDF Export</span>
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#3987FF] hover:bg-[#2F74DE] text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(57,135,255,0.4)]"
          >
            <Check size={15} />
            <span>Save Review</span>
          </button>
        </div>
      </div>

      {/* AI Weekly Coach Module Integration */}
      <AIWeeklyCoachModule trades={trades} />

      {/* Automated Weekly Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="trade-card rounded-2xl p-5 border border-[#1E293B]">
          <span className="text-[10px] text-[#8492A6] uppercase tracking-wider block">Weekly Net Realized</span>
          <div className={`text-2xl font-black mt-1 ${weekPnl >= 0 ? 'text-[#00D6A0]' : 'text-[#FF5268]'}`}>
            {weekPnl >= 0 ? '+' : ''}{formatCurrency(weekPnl)}
          </div>
          <span className="text-xs text-[#8492A6] mt-0.5 block">{weekTrades.length} Closed Executions</span>
        </div>

        <div className="trade-card rounded-2xl p-5 border border-[#1E293B]">
          <span className="text-[10px] text-[#8492A6] uppercase tracking-wider block">Weekly Win Rate</span>
          <div className="text-2xl font-black text-white mt-1">
            {weekWinRate.toFixed(1)}%
          </div>
          <span className="text-xs text-[#00D6A0] mt-0.5 block">{weekWins} Wins • {weekTrades.length - weekWins} Losses</span>
        </div>

        <div className="trade-card rounded-2xl p-5 border border-[#1E293B]">
          <span className="text-[10px] text-[#8492A6] uppercase tracking-wider block">Best Trade</span>
          <div className="text-lg font-black text-[#00D6A0] mt-1 truncate">
            {bestTrade ? `+${formatCurrency(bestTrade.pnl)}` : 'N/A'}
          </div>
          <span className="text-xs text-[#8492A6] mt-0.5 block truncate">
            {bestTrade ? `${bestTrade.symbol} (${bestTrade.strategy})` : 'None'}
          </span>
        </div>

        <div className="trade-card rounded-2xl p-5 border border-[#1E293B]">
          <span className="text-[10px] text-[#8492A6] uppercase tracking-wider block">Worst Trade</span>
          <div className="text-lg font-black text-[#FF5268] mt-1 truncate">
            {worstTrade && worstTrade.pnl < 0 ? formatCurrency(worstTrade.pnl) : '$0.00'}
          </div>
          <span className="text-xs text-[#8492A6] mt-0.5 block truncate">
            {worstTrade && worstTrade.pnl < 0 ? `${worstTrade.symbol} (${worstTrade.emotion})` : 'Zero losses'}
          </span>
        </div>
      </div>

      {/* Reflection Fields */}
      <div className="trade-card rounded-2xl p-6 border border-[#1E293B] space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-[#1E293B]">
          <Award size={16} className="text-[#3987FF]" />
          Weekly Qualitative Debrief
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs text-[#00D6A0] font-bold block mb-1">
              What Went Well? (Strengths to Repeat)
            </label>
            <textarea
              value={formData.whatWentWell}
              onChange={(e) => setFormData({ ...formData, whatWentWell: e.target.value })}
              rows={3}
              className="w-full bg-[#080B12] border border-[#222E40] rounded-xl p-3 text-xs text-white outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-[#FF5268] font-bold block mb-1">
              What Went Wrong? (Mistakes & Leaks)
            </label>
            <textarea
              value={formData.whatWentWrong}
              onChange={(e) => setFormData({ ...formData, whatWentWrong: e.target.value })}
              rows={3}
              className="w-full bg-[#080B12] border border-[#222E40] rounded-xl p-3 text-xs text-white outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-amber-400 font-bold block mb-1">
              Single Biggest Mistake & What Triggered It
            </label>
            <textarea
              value={formData.biggestMistake}
              onChange={(e) => setFormData({ ...formData, biggestMistake: e.target.value })}
              rows={3}
              className="w-full bg-[#080B12] border border-[#222E40] rounded-xl p-3 text-xs text-white outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-[#3987FF] font-bold block mb-1">
              Core Lesson Learned & Next Week's Objective
            </label>
            <textarea
              value={formData.biggestLesson}
              onChange={(e) => setFormData({ ...formData, biggestLesson: e.target.value })}
              rows={3}
              className="w-full bg-[#080B12] border border-[#222E40] rounded-xl p-3 text-xs text-white outline-none resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
