import React, { useState } from 'react';
import { StrategyItem, Trade } from '../../types/trade';
import { Layers, Plus, X } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

interface StrategyLabViewProps {
  strategies: StrategyItem[];
  trades: Trade[];
  onAddStrategy: (item: StrategyItem) => void;
}

export function StrategyLabView({ strategies, trades, onAddStrategy }: StrategyLabViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [entryCrit, setEntryCrit] = useState('');
  const [exitCrit, setExitCrit] = useState('');

  // Performance per strategy
  const stratPerformance: Record<string, { count: number; wins: number; pnl: number; rMultiples: number[] }> = {};
  trades.forEach(t => {
    const s = t.strategy || 'Unspecified';
    if (!stratPerformance[s]) {
      stratPerformance[s] = { count: 0, wins: 0, pnl: 0, rMultiples: [] };
    }
    stratPerformance[s].count++;
    stratPerformance[s].pnl += t.pnl;
    if (t.pnl > 0) stratPerformance[s].wins++;
    if (t.rMultiple !== undefined) stratPerformance[s].rMultiples.push(t.rMultiple);
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddStrategy({
      id: `strat-${Date.now()}`,
      name,
      description: desc,
      marketConditions: ['Strong Trend', 'Breakout'],
      entryCriteria: entryCrit || 'Candle rejection from support/resistance on Quotex OTC',
      exitCriteria: exitCrit || 'Expiry close (1M-5M timeframe settlement)',
      timeframes: ['1M', '5M'],
      recommendedR: '1.85R',
      tags: ['OTC Binary', 'Quant'],
    });
    setName('');
    setDesc('');
    setEntryCrit('');
    setExitCrit('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 font-mono text-xs text-[#E0E0E0]">
      {/* Top Header - Variation 3 Terminal Hero Style */}
      <div className="hero-block bg-[#151618] border border-[#222326] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[0.7rem] text-[#BB86FC] tracking-wider mb-1">
            <Layers size={13} className="text-[#BB86FC]" />
            <span>// STRATEGY_RESEARCH &amp; SETUP_LAB</span>
          </div>
          <h1 className="font-syne text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none mt-1">
            Strategy Playbook &amp; Edge Lab
          </h1>
          <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
            Evaluate, backtest, and document setup criteria with verified Quotex performance statistics.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#BB86FC] hover:bg-[#cda6ff] active:scale-95 text-[#0B0C0D] font-bold px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all duration-150 cursor-pointer shadow-[0_0_18px_rgba(187,134,252,0.35)] flex items-center gap-2 shrink-0"
        >
          <Plus size={14} className="stroke-[2.5]" />
          <span>New Strategy Setup</span>
        </button>
      </div>

      {/* Strategies List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {strategies.map((strat) => {
          const perf = stratPerformance[strat.name] || { count: 0, wins: 0, pnl: 0, rMultiples: [] };
          const winRate = perf.count > 0 ? Math.round((perf.wins / perf.count) * 100) : 0;
          const avgR = perf.rMultiples.length > 0 ? (perf.rMultiples.reduce((a, b) => a + b, 0) / perf.rMultiples.length).toFixed(2) : '1.85';
          const isPos = perf.pnl >= 0;

          return (
            <div 
              key={strat.id} 
              className="bg-[#151618] border border-[#222326] hover:border-[#333] p-5 space-y-4 flex flex-col justify-between font-mono transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-white font-syne">{strat.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {strat.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-[#0B0C0D] border border-[#222326] text-[#888888] font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 text-xs font-mono font-bold border ${
                    isPos 
                      ? 'bg-[#03DAC6]/10 text-[#03DAC6] border-[#03DAC6]/30' 
                      : 'bg-[#CF6679]/10 text-[#CF6679] border-[#CF6679]/30'
                  }`}>
                    {isPos ? '+' : ''}{formatCurrency(perf.pnl)}
                  </span>
                </div>

                <p className="text-xs text-[#888888] leading-relaxed mb-4">
                  {strat.description}
                </p>

                {/* Performance stat box */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-[#0B0C0D] border border-[#222326] text-center font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-[#666666] block uppercase tracking-wider">Win Rate</span>
                    <span className="font-bold text-[#03DAC6] font-syne text-base">{winRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] block uppercase tracking-wider">Trades Logged</span>
                    <span className="font-bold text-white font-syne text-base">{perf.count}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] block uppercase tracking-wider">Average R</span>
                    <span className="font-bold text-[#BB86FC] font-syne text-base">{avgR}R</span>
                  </div>
                </div>

                {/* Entry & Exit Criteria */}
                <div className="space-y-2 mt-4 text-xs">
                  <div>
                    <span className="text-[#666666] block text-[10px] uppercase font-bold tracking-wider font-mono">
                      // ENTRY_RULES
                    </span>
                    <span className="text-[#CCCCCC]">{strat.entryCriteria}</span>
                  </div>
                  <div>
                    <span className="text-[#666666] block text-[10px] uppercase font-bold tracking-wider font-mono">
                      // EXIT_TARGET
                    </span>
                    <span className="text-[#CCCCCC]">{strat.exitCriteria}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#222326] text-[11px] text-[#666666] font-mono flex items-center justify-between">
                <span>EXPECTED_RATIO: <strong className="text-[#E0E0E0]">{strat.recommendedR}</strong></span>
                <span className="text-[#03DAC6] font-bold">STATUS_ACTIVE</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <form 
            onSubmit={handleCreate} 
            className="w-full max-w-lg bg-[#151618] border border-[#BB86FC] p-6 space-y-4 shadow-[0_0_30px_rgba(187,134,252,0.25)] font-mono text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#222326]">
              <h3 className="text-sm font-bold text-white font-syne">
                // CREATE_NEW_STRATEGY_SETUP
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="text-xs text-[#666666] hover:text-[#CF6679] cursor-pointer flex items-center gap-1 font-mono"
              >
                <X size={13} /> CANCEL
              </button>
            </div>

            <div>
              <label className="text-[11px] text-[#666666] block mb-1.5 uppercase tracking-wider">
                Strategy Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Quotex 1M Support Pullback Reversal"
                required
                className="w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] p-2.5 text-xs text-white outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#666666] block mb-1.5 uppercase tracking-wider">
                Setup Description &amp; Market Logic
              </label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                rows={3}
                placeholder="What statistical edge does this setup exploit on Quotex binary instruments?"
                className="w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] p-3 text-xs text-white outline-none resize-none transition-colors leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[#666666] block mb-1.5 uppercase tracking-wider">
                  Entry Trigger Criteria
                </label>
                <input
                  type="text"
                  value={entryCrit}
                  onChange={e => setEntryCrit(e.target.value)}
                  placeholder="e.g. Pinbar rejection at 61.8% Fibonacci"
                  className="w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#03DAC6] p-2.5 text-xs text-white outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#666666] block mb-1.5 uppercase tracking-wider">
                  Exit / Settlement Target
                </label>
                <input
                  type="text"
                  value={exitCrit}
                  onChange={e => setExitCrit(e.target.value)}
                  placeholder="e.g. 1-Minute expiration settlement"
                  className="w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] p-2.5 text-xs text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-[#222326] text-[#888888] hover:text-white text-xs font-mono uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#03DAC6] hover:bg-[#00c4b2] text-[#0B0C0D] text-xs font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                Save Setup
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
