import React, { useState, useMemo } from 'react';
import { Trade } from '../../types/trade';
import { formatCurrency, calculateStats } from '../../utils/calculations';
import { 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw,
  Target,
  Award,
  Zap,
  ShieldCheck,
  Bot
} from 'lucide-react';

interface AIWeeklyCoachModuleProps {
  trades: Trade[];
}

export function AIWeeklyCoachModule({ trades }: AIWeeklyCoachModuleProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [completedActions, setCompletedActions] = useState<Record<number, boolean>>({});

  // Compute current week's trades
  const { weekTrades, weekStats, topStrategy, topEmotion, ruleAdherencePct } = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startStr = sevenDaysAgo.toISOString().slice(0, 10);

    const filtered = trades.filter(t => t.date >= startStr);
    const stats = calculateStats(filtered, 1000);

    // Find top strategy
    const stratCounts: Record<string, number> = {};
    filtered.forEach(t => {
      stratCounts[t.strategy] = (stratCounts[t.strategy] || 0) + 1;
    });
    const topStrat = Object.entries(stratCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Price Action Bounce';

    // Find top emotion
    const emoCounts: Record<string, number> = {};
    filtered.forEach(t => {
      emoCounts[t.emotion] = (emoCounts[t.emotion] || 0) + 1;
    });
    const topEmo = Object.entries(emoCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Disciplined';

    // Rule adherence
    let totalR = 0;
    let followedR = 0;
    filtered.forEach(t => {
      totalR += t.totalRules || 5;
      followedR += t.rulesFollowed;
    });
    const rulePct = totalR > 0 ? Math.round((followedR / totalR) * 100) : 100;

    return {
      weekTrades: filtered,
      weekStats: stats,
      topStrategy: topStrat,
      topEmotion: topEmo,
      ruleAdherencePct: rulePct,
    };
  }, [trades]);

  const runWeeklyAiAudit = async () => {
    setLoading(true);
    setErrorMsg(null);

    const promptText = `Generate a concise, institutional 7-day Weekly Trade Audit for a trader with:
- ${weekTrades.length} trades executed in the last 7 days.
- Net PnL: $${weekStats.netPnl.toFixed(2)} USD.
- Win Rate: ${weekStats.winRate.toFixed(1)}%.
- Profit Factor: ${weekStats.profitFactor.toFixed(2)}.
- Rule Adherence Rate: ${ruleAdherencePct}%.
- Most Used Strategy: "${topStrategy}".
- Dominant Emotional State: "${topEmotion}".

Provide a structured response with 3 headings:
1. 🎯 WEEKLY EDGE DIAGNOSIS & RATING (Grade A/B/C/F)
2. ⚠️ TOP PSYCHOLOGICAL LEAK & RISK EXPOSURE
3. 🚀 3 ACTIONABLE COMMITMENTS FOR NEXT WEEK (as bullet points)`;

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: promptText }],
          systemInstruction: 'You are TradePath AI, a elite quantitative prop-firm performance coach.',
          model: 'gemini-3.1-flash-lite',
        }),
      });

      if (!res.ok) {
        throw new Error('AI Weekly Coach endpoint busy. Please retry.');
      }

      const data = await res.json();
      setAiReport(data.reply || 'Weekly audit completed.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error generating AI audit.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAction = (idx: number) => {
    setCompletedActions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="trade-card rounded-2xl p-5 border border-[#8B5CF6]/25 bg-[#07060A]/85 backdrop-blur-2xl shadow-xl space-y-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute w-48 h-48 rounded-full bg-[#C084FC]/10 blur-3xl pointer-events-none -top-10 -right-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#8B5CF6]/20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B5CF6] via-[#A78BFA] to-[#C084FC] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(192,132,252,0.4)]">
            <div className="w-full h-full bg-[#07060A] rounded-[10px] flex items-center justify-center text-[#C084FC]">
              <BrainCircuit size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>AI Weekly Performance Coach</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#C084FC] border border-[#8B5CF6]/40 font-mono font-bold">
                GEMINI POWERED
              </span>
            </h3>
            <p className="text-xs text-[#A78BFA]">
              Automated 7-day trade audit, edge diagnosis, and psychological leak detection
            </p>
          </div>
        </div>

        <button
          onClick={runWeeklyAiAudit}
          disabled={loading}
          className={`btn-premium-purple px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.4)] ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Sparkles size={14} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Analyzing 7-Day Data...' : 'Run AI Weekly Audit'}</span>
        </button>
      </div>

      {/* 7-Day Performance Metric Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/20">
          <span className="text-[10px] text-[#A78BFA] block">7-Day Net PnL</span>
          <span className={`text-base font-black ${weekStats.netPnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {weekStats.netPnl >= 0 ? '+' : ''}{formatCurrency(weekStats.netPnl)}
          </span>
          <span className="text-[9px] text-[#CBD5E1] block mt-0.5">{weekTrades.length} Executions</span>
        </div>

        <div className="p-3 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/20">
          <span className="text-[10px] text-[#A78BFA] block">7-Day Win Rate</span>
          <span className="text-base font-black text-white">{weekStats.winRate.toFixed(1)}%</span>
          <span className="text-[9px] text-[#10B981] block mt-0.5">PF: {weekStats.profitFactor.toFixed(2)}</span>
        </div>

        <div className="p-3 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/20">
          <span className="text-[10px] text-[#A78BFA] block">Rule Compliance</span>
          <span className="text-base font-black text-[#C084FC]">{ruleAdherencePct}%</span>
          <span className="text-[9px] text-[#CBD5E1] block mt-0.5">Disciplined Execution</span>
        </div>

        <div className="p-3 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/20">
          <span className="text-[10px] text-[#A78BFA] block">Dominant Emotion</span>
          <span className="text-base font-black text-white truncate block">{topEmotion}</span>
          <span className="text-[9px] text-[#F59E0B] block mt-0.5">Top: {topStrategy}</span>
        </div>
      </div>

      {/* AI Report Stream Output */}
      {aiReport && (
        <div className="p-4 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/35 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 pb-2 border-b border-[#8B5CF6]/20 text-xs font-mono text-[#C084FC] font-bold">
            <Bot size={15} />
            <span>Official Gemini 7-Day Performance Diagnosis</span>
          </div>

          <div className="text-xs text-slate-200 space-y-2 whitespace-pre-wrap font-sans leading-relaxed">
            {aiReport}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/35 text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle size={15} className="text-[#EF4444]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Actionable Commitments Checkbox List */}
      <div className="p-3.5 rounded-xl bg-[#0D0B14]/80 border border-[#8B5CF6]/20 space-y-2">
        <span className="text-xs font-mono font-bold text-white block flex items-center gap-1.5">
          <Target size={14} className="text-[#10B981]" />
          3 Actionable Commitments for Next Week
        </span>

        {[
          'Cap maximum daily executions at 5 trades to avoid emotional exhaustion',
          'Wait for candle close verification before entering Quotex OTC reversals',
          'Never risk more than 2% of equity per trade during drawdown recovery',
        ].map((action, idx) => (
          <label
            key={idx}
            onClick={() => toggleAction(idx)}
            className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-200 hover:text-white transition-colors"
          >
            <input
              type="checkbox"
              checked={!!completedActions[idx]}
              onChange={() => {}}
              className="mt-0.5 rounded border-[#8B5CF6]/40 text-[#8B5CF6] focus:ring-0 bg-[#07060A]"
            />
            <span className={completedActions[idx] ? 'line-through text-slate-400' : ''}>
              {action}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
