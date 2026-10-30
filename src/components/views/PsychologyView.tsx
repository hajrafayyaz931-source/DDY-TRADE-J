import React, { useState } from 'react';
import { Trade, TradeEmotion } from '../../types/trade';
import { 
  HeartHandshake, 
  AlertTriangle, 
  ShieldCheck, 
  BrainCircuit, 
  Sparkles,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';
import { MistakeTagsCloud } from '../ui/MistakeTagsCloud';
import { StreakProtectorWidget } from '../ui/StreakProtectorWidget';

interface PsychologyViewProps {
  trades: Trade[];
}

const EMOTIONAL_STATES: TradeEmotion[] = [
  'Calm',
  'Confident',
  'Disciplined',
  'Fear',
  'FOMO',
  'Revenge',
  'Greed',
  'Impatient',
  'Frustrated',
  'Anxious',
  'Boredom',
];

export function PsychologyView({ trades }: PsychologyViewProps) {
  const [currentMood, setCurrentMood] = useState<TradeEmotion>('Calm');
  const [moodNotes, setMoodNotes] = useState('');
  const [loggedToday, setLoggedToday] = useState(false);

  // Aggregate stats by emotion
  const emotionStats: Record<string, { count: number; pnl: number; wins: number; losses: number; rTotal: number }> = {};
  
  trades.forEach(t => {
    const em = t.emotion || 'Calm';
    if (!emotionStats[em]) {
      emotionStats[em] = { count: 0, pnl: 0, wins: 0, losses: 0, rTotal: 0 };
    }
    emotionStats[em].count++;
    emotionStats[em].pnl += t.pnl;
    if (t.pnl > 0) emotionStats[em].wins++;
    else if (t.pnl < 0) emotionStats[em].losses++;
    if (t.rMultiple !== undefined) emotionStats[em].rTotal += t.rMultiple;
  });

  const sortedEmotions = Object.entries(emotionStats).sort((a, b) => b[1].pnl - a[1].pnl);

  // Cost of emotional trades (FOMO + Revenge + Impatient + Greed)
  const emotionalTrades = trades.filter(t => 
    t.emotion === 'FOMO' || t.emotion === 'Revenge' || t.emotion === 'Impatient' || t.emotion === 'Greed' || t.emotion === 'Frustrated'
  );
  const emotionalLossTotal = emotionalTrades.reduce((acc, t) => acc + (t.pnl < 0 ? t.pnl : 0), 0);
  const disciplinedTrades = trades.filter(t => 
    t.emotion === 'Calm' || t.emotion === 'Disciplined' || t.emotion === 'Confident'
  );
  const disciplinedPnl = disciplinedTrades.reduce((acc, t) => acc + t.pnl, 0);
  const disciplinedWinRate = disciplinedTrades.length > 0 
    ? Math.round((disciplinedTrades.filter(t => t.pnl > 0).length / disciplinedTrades.length) * 100) 
    : 0;

  // Rule compliance analysis
  const perfectRulesTrades = trades.filter(t => (t.rulesFollowed || 0) >= (t.totalRules || 5));
  const brokenRulesTrades = trades.filter(t => (t.rulesFollowed || 0) < (t.totalRules || 5));
  const perfectRulesPnl = perfectRulesTrades.reduce((acc, t) => acc + t.pnl, 0);
  const brokenRulesPnl = brokenRulesTrades.reduce((acc, t) => acc + t.pnl, 0);

  const handleSaveMood = () => {
    setLoggedToday(true);
    setTimeout(() => setLoggedToday(false), 3000);
  };

  return (
    <div className="space-y-6 font-mono text-xs text-[#E0E0E0]">
      {/* Header - Variation 3 Terminal Hero Style */}
      <div className="hero-block bg-[#151618] border border-[#222326] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[0.7rem] text-[#BB86FC] tracking-wider mb-1">
            <HeartHandshake size={13} className="text-[#BB86FC]" />
            <span>// BEHAVIORAL_TRADING_INTELLIGENCE</span>
          </div>
          <h1 className="font-syne text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none mt-1">
            Trading Psychology &amp; Discipline Engine
          </h1>
          <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
            Identify emotional leaks, calculate the dollar cost of FOMO/Revenge, and track daily mindset.
          </p>
        </div>

        <span className="text-xs px-3 py-1 bg-[#0B0C0D] text-[#03DAC6] font-mono font-bold border border-[#222326] self-start sm:self-auto">
          STATE: {currentMood.toUpperCase()}
        </span>
      </div>

      {/* Streak Protector & Mistake Tags Cloud */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <StreakProtectorWidget trades={trades} />
        <MistakeTagsCloud trades={trades} />
      </div>

      {/* Daily Mindset & Emotional State Logger */}
      <div className="bg-[#151618] border border-[#222326] p-5 space-y-3 font-mono">
        <div className="flex items-center justify-between pb-2 border-b border-[#222326]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-syne">
            <Sparkles size={15} className="text-[#BB86FC]" />
            Live Pre-Session Mindset Logger
          </h3>
          <span className="text-xs text-[#666666] font-mono">Calibrate before entering orders</span>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {EMOTIONAL_STATES.map((em) => {
              const isSelected = currentMood === em;
              const isPositive = em === 'Calm' || em === 'Disciplined' || em === 'Confident';

              return (
                <button
                  key={em}
                  onClick={() => setCurrentMood(em)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? isPositive
                        ? 'bg-[#03DAC6]/15 text-[#03DAC6] border-[#03DAC6]'
                        : 'bg-[#CF6679]/15 text-[#CF6679] border-[#CF6679]'
                      : 'bg-[#0B0C0D] text-[#666666] border-[#222326] hover:text-[#E0E0E0] hover:border-[#444]'
                  }`}
                >
                  {em}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <input
              type="text"
              value={moodNotes}
              onChange={e => setMoodNotes(e.target.value)}
              placeholder="Session mindset notes (e.g. Well-rested, waiting for key level retest, no rush)..."
              className="flex-1 w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] p-2.5 text-xs text-white outline-none font-mono"
            />
            <button
              onClick={handleSaveMood}
              className="bg-[#BB86FC] hover:bg-[#cda6ff] active:scale-95 text-[#0B0C0D] font-bold px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-[0_0_18px_rgba(187,134,252,0.35)] flex items-center gap-1.5 shrink-0"
            >
              <CheckCircle2 size={14} className="stroke-[2.5]" />
              <span>{loggedToday ? 'MINDSET_SAVED' : 'LOG MENTAL STATE'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Exact Dollar Cost of Emotional Leaks */}
      <div className="bg-[#151618] border border-[#CF6679]/40 p-5 flex flex-col md:flex-row items-center justify-between gap-6 font-mono">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#CF6679] font-bold">
            <AlertTriangle size={15} />
            <span>MEASURED COST OF EMOTIONAL LEAKS</span>
          </div>
          <h2 className="text-3xl font-extrabold font-syne text-[#CF6679]">
            -${Math.abs(emotionalLossTotal).toFixed(2)}
          </h2>
          <p className="text-xs text-[#666666] max-w-md">
            Direct realized losses accumulated exclusively when taking entries under FOMO, Revenge, Greed, or Impatience.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center font-mono w-full md:w-auto">
          <div className="p-3 bg-[#0B0C0D] border border-[#222326]">
            <span className="text-[10px] text-[#666666] block uppercase tracking-wider">Disciplined PnL</span>
            <span className="text-base font-extrabold text-[#03DAC6] font-syne">
              +{formatCurrency(disciplinedPnl)}
            </span>
            <span className="text-[10px] text-[#888888] block mt-0.5">
              {disciplinedTrades.length} trades ({disciplinedWinRate}% WR)
            </span>
          </div>

          <div className="p-3 bg-[#0B0C0D] border border-[#222326]">
            <span className="text-[10px] text-[#666666] block uppercase tracking-wider">Emotional Win Rate</span>
            <span className="text-base font-extrabold text-[#CF6679] font-syne">
              {emotionalTrades.length > 0 ? Math.round((emotionalTrades.filter(t => t.pnl > 0).length / emotionalTrades.length) * 100) : 0}%
            </span>
            <span className="text-[10px] text-[#888888] block mt-0.5">
              {emotionalTrades.length} emotional executions
            </span>
          </div>
        </div>
      </div>

      {/* Rule Compliance Impact Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
        <div className="bg-[#151618] border border-[#222326] p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-2 font-syne">
              <ShieldCheck size={15} className="text-[#03DAC6]" />
              100% Rule Compliance Outcome
            </span>
            <span className="text-xs px-2 py-0.5 bg-[#03DAC6]/10 text-[#03DAC6] border border-[#03DAC6]/30 font-mono font-bold">
              {perfectRulesTrades.length} Trades
            </span>
          </div>
          <div className="text-2xl font-extrabold font-syne text-[#03DAC6]">
            +{formatCurrency(perfectRulesPnl)}
          </div>
          <p className="text-xs text-[#666666] mt-1 font-mono">
            Every trade where all setup, risk, and exit rules were strictly observed.
          </p>
        </div>

        <div className="bg-[#151618] border border-[#222326] p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-2 font-syne">
              <AlertOctagon size={15} className="text-[#CF6679]" />
              Broken Rules Penalty
            </span>
            <span className="text-xs px-2 py-0.5 bg-[#CF6679]/10 text-[#CF6679] border border-[#CF6679]/30 font-mono font-bold">
              {brokenRulesTrades.length} Trades
            </span>
          </div>
          <div className="text-2xl font-extrabold font-syne text-[#CF6679]">
            {formatCurrency(brokenRulesPnl)}
          </div>
          <p className="text-xs text-[#666666] mt-1 font-mono">
            Financial damage caused by bypassing checklist rules or jumping the gun.
          </p>
        </div>
      </div>

      {/* Emotion vs Performance Table */}
      <div className="bg-[#151618] border border-[#222326] p-5 font-mono">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#222326]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-syne">
            <BrainCircuit size={15} className="text-[#BB86FC]" />
            Performance Breakdown by Emotional State
          </h3>
          <span className="text-xs text-[#03DAC6] font-mono">
            Direct Behavioral Correlation
          </span>
        </div>

        <div className="space-y-2">
          {sortedEmotions.map(([emotionName, data]) => {
            const winRate = data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0;
            const isPos = data.pnl >= 0;
            const isDisciplined = emotionName === 'Calm' || emotionName === 'Disciplined' || emotionName === 'Confident';

            return (
              <div
                key={emotionName}
                className="p-3 bg-[#0B0C0D] border border-[#222326] hover:border-[#333] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 text-xs font-bold font-mono border ${
                    isDisciplined 
                      ? 'bg-[#03DAC6]/10 text-[#03DAC6] border-[#03DAC6]/30' 
                      : 'bg-[#CF6679]/10 text-[#CF6679] border-[#CF6679]/30'
                  }`}>
                    {emotionName}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-white">
                      {data.count} Trade{data.count > 1 ? 's' : ''} Executed
                    </span>
                    <span className="text-[11px] text-[#666666] block font-mono">
                      {data.wins} Wins • {data.losses} Losses ({winRate}% Win Rate)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-xs">
                  <div className="text-right">
                    <span className="text-[#666666] text-[10px] block uppercase">Net Realized PnL</span>
                    <span className={`text-sm font-extrabold ${isPos ? 'text-[#03DAC6]' : 'text-[#CF6679]'}`}>
                      {isPos ? '+' : ''}{formatCurrency(data.pnl)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
