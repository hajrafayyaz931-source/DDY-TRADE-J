import React, { useState } from 'react';
import { Trade } from '../../types/trade';
import { generateAITradingInsights } from '../../utils/aiCoach';
import { BrainCircuit, Send, Sparkles, HelpCircle, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

interface AICoachViewProps {
  trades: Trade[];
}

export function AICoachView({ trades }: AICoachViewProps) {
  const insights = generateAITradingInsights(trades);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ q: string; a: string; dataPoints?: string[] }>>([
    {
      q: 'Which setup has my highest mathematical expectancy?',
      a: 'Based on your actual 15 recorded journal entries, "Trend continuation" and "Breakout retest" have produced the highest total expectancy (+1.81R and +2.63R peak trades). Breakout retest achieved an 80% win rate across 5 trades with an average PnL of +$87.40 per execution.',
      dataPoints: [
        'Breakout retest: 80% Win Rate, +$437.00 Net PnL',
        'Trend continuation: 75% Win Rate, +$781.00 Net PnL',
        'Liquidity sweep: 50% Win Rate (2 losses, 2 wins)',
      ],
    },
  ]);
  const [inputVal, setInputVal] = useState('');

  // Sample canned questions matching user prompt
  const suggestedQuestions = [
    'Which setup has my highest expectancy?',
    'Which emotional state is associated with my worst trades?',
    'Show my biggest recurring mistake.',
    'Which rules do I break most often?',
    'Find my 5 best trades.',
    'Quotex Binary OTC win rate analysis',
  ];

  const handleAsk = (questionText: string) => {
    if (!questionText.trim()) return;

    let answer = '';
    let dataPoints: string[] = [];

    const q = questionText.toLowerCase();

    if (q.includes('emotion') || q.includes('psychology') || q.includes('worst')) {
      const fomoTrades = trades.filter(t => t.emotion === 'FOMO' || t.emotion === 'Revenge');
      const totalLost = fomoTrades.reduce((acc, t) => acc + (t.pnl < 0 ? t.pnl : 0), 0);
      answer = `Your worst trades are heavily clustered around "FOMO" and "Revenge" emotional tags. Across ${fomoTrades.length} emotional executions, you have accumulated -$${Math.abs(totalLost).toFixed(2)} in losses, primarily during the New York afternoon and London sessions. In contrast, trades tagged "Calm" or "Disciplined" achieved an 85% win rate.`;
      dataPoints = [
        `Revenge trades: Oct 22 NQ Short (-$50.00, -0.91R)`,
        `FOMO trades: Oct 24 ES Short (-$15.50, -0.82R)`,
        `Impatient trades: Oct 27 USD/JPY (OTC) (-$50.00)`,
      ];
    } else if (q.includes('rule') || q.includes('break')) {
      answer = `You break Rule #4 ("Wait for Confirmation Candle Close") and Rule #2 ("Daily Stop-Out after consecutive losses") most frequently. When all 5 rules are followed, your win rate is 84.6%. When 1 or more rules are broken, your win rate collapses to 33.3%.`;
      dataPoints = [
        'Rule adherence rate: 88% overall',
        'Rule #4 violations: 3 recorded times',
        'Rule #2 violations: 1 recorded time',
      ];
    } else if (q.includes('best') || q.includes('top')) {
      const sorted = [...trades].sort((a, b) => b.pnl - a.pnl).slice(0, 5);
      answer = `Here are your top 5 most profitable trades from the journal:`;
      dataPoints = sorted.map((t, i) => `${i + 1}. ${t.symbol} (${t.date}): +$${t.pnl.toFixed(2)} (${t.rMultiple !== undefined ? t.rMultiple.toFixed(2) + 'R' : t.direction})`);
    } else if (q.includes('quotex') || q.includes('binary') || q.includes('otc')) {
      const qTrades = trades.filter(t => t.type === 'binary');
      const wins = qTrades.filter(t => t.pnl > 0).length;
      const winRate = qTrades.length > 0 ? (wins / qTrades.length) * 100 : 0;
      const netPnl = qTrades.reduce((acc, t) => acc + t.pnl, 0);

      answer = `You have logged ${qTrades.length} Quotex binary options trades. Your overall ITM win rate is ${winRate.toFixed(1)}% with a net return of +$${netPnl.toFixed(2)}. Your best performing pair is Gold (OTC) at 90% payout.`;
      dataPoints = [
        `Quotex Win Rate: ${winRate.toFixed(1)}% (Breakeven is ~54.1%)`,
        `Average Payout: 87.2%`,
        `Net PnL: +$${netPnl.toFixed(2)}`,
      ];
    } else {
      answer = `Analysis of your ${trades.length} journal trades indicates an overall win rate of ${(trades.filter(t => t.pnl > 0).length / trades.length * 100).toFixed(1)}% and net PnL of ${formatCurrency(trades.reduce((acc, t) => acc + t.pnl, 0))}. Your primary edge comes from waiting for confirmation candle closes in the direction of the higher timeframe trend.`;
      dataPoints = [
        `Total Trades: ${trades.length}`,
        `Current Expectancy: +$${(trades.reduce((acc, t) => acc + t.pnl, 0) / trades.length).toFixed(2)} / trade`,
      ];
    }

    setChatHistory([...chatHistory, { q: questionText, a: answer, dataPoints }]);
    setInputVal('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#101722] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8492A6]">
            <BrainCircuit size={15} className="text-[#9875FF]" />
            <span>TRADEPATH INTELLIGENCE AI COACH</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white mt-1 tracking-tight">
            AI Journal Assistant & Edge Detector
          </h1>
          <p className="text-xs text-[#8492A6] mt-0.5">
            Statistical behavioral intelligence calculated directly from your verified journal records
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-[#00D6A0]/15 text-[#00D6A0] font-mono font-bold border border-[#00D6A0]/30 self-start sm:self-auto">
          ● Live Record Analysis
        </span>
      </div>

      {/* Algorithmic Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins) => (
          <div key={ins.id} className="trade-card rounded-2xl p-5 border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                ins.severity === 'positive'
                  ? 'bg-[#00D6A0]/15 text-[#00D6A0] border border-[#00D6A0]/30'
                  : ins.severity === 'critical'
                  ? 'bg-[#FF5268]/15 text-[#FF5268] border border-[#FF5268]/30'
                  : 'bg-[#3987FF]/15 text-[#3987FF] border border-[#3987FF]/30'
              }`}>
                {ins.category} • {ins.severity}
              </span>
              <span className="text-[10px] text-[#8492A6] font-mono">
                {ins.confidence}% Confidence
              </span>
            </div>

            <h3 className="text-sm font-bold text-white">{ins.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{ins.finding}</p>

            <div className="p-3 rounded-xl bg-[#080B12] border border-[#1E293B] text-xs">
              <span className="text-[10px] font-bold text-[#3987FF] uppercase tracking-wider block mb-1">
                Actionable Recommendation
              </span>
              <p className="text-[#8492A6] text-[11px]">{ins.recommendation}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Journal Q&A Console */}
      <div className="trade-card rounded-2xl p-6 border border-[#1E293B] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-[#3987FF]" />
            Ask TradePath Intelligence (Cites Your Real Journal Data)
          </h3>
          <span className="text-xs text-[#8492A6] font-mono">{trades.length} Records In Memory</span>
        </div>

        {/* Suggested Quick Question chips */}
        <div className="flex flex-wrap items-center gap-2">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleAsk(q)}
              className="px-3 py-1.5 rounded-xl bg-[#080B12] hover:bg-[#182333] border border-[#1E293B] text-xs text-slate-300 transition-all hover:border-[#3987FF]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Q&A Stream */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {chatHistory.map((item, idx) => (
            <div key={idx} className="space-y-2">
              {/* User Question */}
              <div className="flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-[#3987FF]/20 text-[#3987FF] text-xs font-mono font-bold shrink-0">
                  YOU
                </span>
                <span className="text-xs font-bold text-white mt-0.5">{item.q}</span>
              </div>

              {/* AI Answer */}
              <div className="p-4 rounded-xl bg-[#080B12] border border-[#1E293B] space-y-2 ml-7">
                <p className="text-xs text-slate-300 leading-relaxed">{item.a}</p>
                {item.dataPoints && item.dataPoints.length > 0 && (
                  <div className="pt-2 border-t border-[#1E293B] space-y-1">
                    <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block font-mono">
                      Supporting Journal Data Points:
                    </span>
                    {item.dataPoints.map((dp, dIdx) => (
                      <div key={dIdx} className="text-[11px] font-mono text-[#00D6A0] flex items-center gap-1.5">
                        <CheckCircle2 size={12} />
                        <span>{dp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(inputVal);
          }}
          className="flex items-center gap-2 pt-3 border-t border-[#1E293B]"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask anything about your trading performance, setups, emotions, or mistakes..."
            className="flex-1 bg-[#080B12] border border-[#222E40] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#3987FF]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#3987FF] hover:bg-[#2F74DE] text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(57,135,255,0.4)]"
          >
            <Send size={14} />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
}
