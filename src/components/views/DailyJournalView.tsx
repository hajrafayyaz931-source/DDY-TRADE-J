import React, { useState } from 'react';
import { DailyPlaybookPlan, Trade } from '../../types/trade';
import { BookOpen, Check, Target, Compass, BrainCircuit, ShieldAlert, Save } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

interface DailyJournalViewProps {
  plan: DailyPlaybookPlan;
  onSavePlan: (updatedPlan: DailyPlaybookPlan) => void;
  trades: Trade[];
}

export function DailyJournalView({ plan, onSavePlan, trades }: DailyJournalViewProps) {
  const [formData, setFormData] = useState<DailyPlaybookPlan>(plan);
  const [saveToast, setSaveToast] = useState(false);

  // Today's trades
  const todayStr = formData.date;
  const todayTrades = trades.filter(t => t.date === todayStr);
  const todayPnl = todayTrades.reduce((acc, t) => acc + t.pnl, 0);

  const handleSave = () => {
    onSavePlan(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="space-y-6 font-mono text-xs text-[#E0E0E0]">
      {/* Top Header - Variation 3 Terminal Hero Style */}
      <div className="hero-block bg-[#151618] border border-[#222326] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[0.7rem] text-[#BB86FC] tracking-wider mb-1">
            <BookOpen size={13} className="text-[#BB86FC]" />
            <span>// DAILY_PLAYBOOK &amp; SESSION_INTENTION</span>
          </div>
          <h1 className="font-syne text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none mt-1">
            Daily Trading Journal
          </h1>
          <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
            Pre-market preparation, structural levels, active watchlist, and end-of-day execution review.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {saveToast && (
            <span className="text-xs font-bold text-[#03DAC6] flex items-center gap-1.5 animate-pulse font-mono">
              <Check size={14} /> PLAYBOOK_SAVED
            </span>
          )}
          {/* Terminal Solid Purple Button matching LOG NEW EXECUTION */}
          <button
            onClick={handleSave}
            className="bg-[#BB86FC] hover:bg-[#cda6ff] active:scale-95 text-[#0B0C0D] font-bold px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all duration-150 cursor-pointer shadow-[0_0_18px_rgba(187,134,252,0.35)] flex items-center gap-2"
          >
            <Save size={14} className="stroke-[2.5]" />
            <span>Save Daily Playbook</span>
          </button>
        </div>
      </div>

      {/* 3 Step Flow: Pre-Market -> Live Execution -> End of Day */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Pre-Market Bias & Key Levels (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#151618] border border-[#222326] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222326]">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Compass size={15} className="text-[#BB86FC]" />
                <span className="font-syne font-bold">1. Pre-Market Bias &amp; Structural Levels</span>
              </div>
              <span className="text-xs text-[#03DAC6] font-mono font-bold bg-[#03DAC6]/10 border border-[#03DAC6]/30 px-2 py-0.5">
                {formData.date}
              </span>
            </div>

            {/* Bias Selector */}
            <div>
              <label className="text-[11px] text-[#666666] block mb-2 font-mono uppercase tracking-wider">
                Market Macro Bias
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                {(['Bullish', 'Bearish', 'Neutral', 'Mixed'] as const).map((bias) => {
                  const isActive = formData.marketBias === bias;
                  return (
                    <button
                      key={bias}
                      type="button"
                      onClick={() => setFormData({ ...formData, marketBias: bias })}
                      className={`py-2 px-3 text-center transition-all cursor-pointer font-mono text-xs uppercase tracking-wider border ${
                        isActive
                          ? bias === 'Bullish'
                            ? 'bg-[#03DAC6]/15 text-[#03DAC6] font-extrabold border-[#03DAC6] shadow-[0_0_12px_rgba(3,218,198,0.25)]'
                            : bias === 'Bearish'
                            ? 'bg-[#CF6679]/15 text-[#CF6679] font-extrabold border-[#CF6679] shadow-[0_0_12px_rgba(207,102,121,0.25)]'
                            : 'bg-[#BB86FC]/15 text-[#BB86FC] font-extrabold border-[#BB86FC] shadow-[0_0_12px_rgba(187,134,252,0.25)]'
                          : 'bg-[#0B0C0D] text-[#666666] border-[#222326] hover:border-[#444] hover:text-[#E0E0E0]'
                      }`}
                    >
                      {bias}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Support and Resistance Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] text-[#666666] block mb-1.5 font-mono uppercase tracking-wider">
                  Key Support Levels
                </label>
                <input
                  type="text"
                  value={formData.supportLevels}
                  onChange={(e) => setFormData({ ...formData, supportLevels: e.target.value })}
                  placeholder="EUR/USD 1.11760, Gold 2720.50"
                  className="w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#03DAC6] p-2.5 text-xs font-mono text-[#E0E0E0] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#666666] block mb-1.5 font-mono uppercase tracking-wider">
                  Key Resistance Levels
                </label>
                <input
                  type="text"
                  value={formData.resistanceLevels}
                  onChange={(e) => setFormData({ ...formData, resistanceLevels: e.target.value })}
                  placeholder="GBP/USD 1.29850, OTC Reversal 1.0850"
                  className="w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] p-2.5 text-xs font-mono text-[#E0E0E0] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Higher Timeframe Context */}
            <div className="pt-1">
              <label className="text-[11px] text-[#666666] block mb-1.5 font-mono uppercase tracking-wider">
                Higher Timeframe (HTF) Market Analysis
              </label>
              <textarea
                value={formData.higherTfAnalysis}
                onChange={(e) => setFormData({ ...formData, higherTfAnalysis: e.target.value })}
                rows={3}
                placeholder="Assess 5M / 15M trends, liquidity sweeps, OTC candle momentum, oscillator divergence..."
                className="w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] p-3 text-xs font-mono text-[#E0E0E0] outline-none resize-none leading-relaxed transition-colors"
              />
            </div>
          </div>

          {/* Watchlist & Planned Setups */}
          <div className="bg-[#151618] border border-[#222326] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222326]">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Target size={15} className="text-[#03DAC6]" />
                <span className="font-syne font-bold">2. Active Session Watchlist &amp; Triggers</span>
              </div>
              <span className="text-[10px] text-[#666666] uppercase tracking-wider font-mono">
                {formData.watchlist.length} INSTRUMENTS
              </span>
            </div>

            <div className="space-y-2">
              {formData.watchlist.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-[#0B0C0D] border border-[#222326] hover:border-[#333] transition-colors flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-white font-mono">{item.symbol}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold font-mono uppercase border ${
                      item.bias === 'Long' 
                        ? 'bg-[#03DAC6]/10 text-[#03DAC6] border-[#03DAC6]/30' 
                        : 'bg-[#CF6679]/10 text-[#CF6679] border-[#CF6679]/30'
                    }`}>
                      [{item.bias}]
                    </span>
                    <span className="text-[#888888] font-mono text-[11px]">
                      Trigger: <strong className="text-[#E0E0E0]">{item.keyLevel}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-[#666666] font-mono hidden sm:inline">
                    {item.notes}
                  </span>
                </div>
              ))}
            </div>

            {/* Daily Intention Statement */}
            <div className="pt-2">
              <label className="text-[11px] text-[#BB86FC] block mb-1.5 font-mono uppercase tracking-wider">
                // Daily Mental Discipline &amp; Rules Commitment
              </label>
              <textarea
                value={formData.dailyIntention}
                onChange={(e) => setFormData({ ...formData, dailyIntention: e.target.value })}
                rows={2}
                placeholder="What is your singular mental commitment today? (e.g. Max 2 consecutive losses, walk away after 3 ITM trades)"
                className="w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] p-3 text-xs text-[#E0E0E0] outline-none resize-none font-mono leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Risk Limits & End-of-Day Telemetry */}
        <div className="space-y-6">
          {/* Risk Limits */}
          <div className="bg-[#151618] border border-[#222326] p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#222326] text-sm font-bold text-white">
              <ShieldAlert size={15} className="text-[#CF6679]" />
              <span className="font-syne font-bold">Session Risk Boundaries</span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-3 bg-[#0B0C0D] border border-[#222326]">
                <span className="text-[#666666]">Max Daily Loss:</span>
                <span className="font-bold text-[#CF6679]">${formData.maxDailyLoss}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0B0C0D] border border-[#222326]">
                <span className="text-[#666666]">Max Daily Trades:</span>
                <span className="font-bold text-white">{formData.maxDailyTrades} trades</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0B0C0D] border border-[#222326]">
                <span className="text-[#666666]">Risk Per Execution:</span>
                <span className="font-bold text-[#03DAC6]">{formData.riskPerTradePercent}% of capital</span>
              </div>
            </div>

            {/* Confidence Slider */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-[#666666]">Confidence Rating:</span>
                <span className="font-bold text-[#03DAC6] bg-[#03DAC6]/10 px-2 py-0.5 border border-[#03DAC6]/30">
                  {formData.confidenceScore} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.confidenceScore}
                onChange={(e) => setFormData({ ...formData, confidenceScore: Number(e.target.value) })}
                className="w-full accent-[#03DAC6] h-1.5 bg-[#0B0C0D] border border-[#222326] cursor-pointer"
              />
            </div>
          </div>

          {/* End-of-Day Journal Card */}
          <div className="bg-[#151618] border border-[#222326] p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#222326]">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <BrainCircuit size={15} className="text-[#BB86FC]" />
                <span className="font-syne font-bold">3. End-of-Day Review</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-white bg-[#222326] px-2 py-0.5">
                {todayTrades.length} Trades Taken
              </span>
            </div>

            <div className="p-3 bg-[#0B0C0D] border border-[#222326] flex items-center justify-between">
              <span className="text-xs text-[#666666]">Session Realized:</span>
              <span className={`text-base font-extrabold font-mono ${todayPnl >= 0 ? 'text-[#03DAC6]' : 'text-[#CF6679]'}`}>
                {todayPnl >= 0 ? '+' : ''}{formatCurrency(todayPnl)}
              </span>
            </div>

            <div className="text-xs text-[#666666] font-mono leading-relaxed pt-1">
              Every day's trading discipline is recorded into your journal analytics. Save your playbook each morning before market open.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
