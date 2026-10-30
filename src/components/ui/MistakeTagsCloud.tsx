import React, { useState, useMemo } from 'react';
import { Trade } from '../../types/trade';
import { formatCurrency } from '../../utils/calculations';
import { 
  AlertTriangle, 
  Tag, 
  Flame, 
  DollarSign, 
  TrendingDown, 
  Sparkles, 
  HelpCircle,
  X,
  ShieldAlert
} from 'lucide-react';

interface MistakeTagsCloudProps {
  trades: Trade[];
  onSelectTagFilter?: (tag: string) => void;
}

interface LeakTagInfo {
  name: string;
  count: number;
  totalLossPnl: number; // sum of negative PnL for trades with this tag/emotion
  avgLossPnl: number;
  severity: 'high' | 'medium' | 'low';
  remedy: string;
}

const LEAK_REMEDIES: Record<string, string> = {
  'FOMO': 'Set pre-market price alerts instead of market orders. If price moves 2 candles without you, skip.',
  'Revenge': 'Enforce a strict 60-minute cooling off period after any loss before placing the next order.',
  'ChasingCandle': 'Trade limit orders at support/resistance retests rather than market-buying extended candles.',
  'MovedStop': 'Pre-define stop loss before entering and place hand away from keyboard once in trade.',
  'Overleveraged': 'Lock max trade position size in your Risk Engine settings to 2% of account equity.',
  'MartingaleDouble': 'Doubling size after loss exponentially risks account liquidation. Stick to flat sizing.',
  'Boredom': 'Close the chart platform when no A+ setup is present. Go for a walk or work on trade review.',
  'LateEntry': 'Analyze higher timeframe S/R zones first. Late entries severely reduce risk-to-reward ratio.',
  'Frustrated': 'Take a mandatory 15-minute break and drink water. Do not trade under emotional distress.',
  'Anxious': 'Reduce position size by 50% until execution feels effortless and stress-free.',
};

export function MistakeTagsCloud({ trades, onSelectTagFilter }: MistakeTagsCloudProps) {
  const [selectedTag, setSelectedTag] = useState<LeakTagInfo | null>(null);

  // Parse all trades for leak tags and emotions
  const leakTags = useMemo(() => {
    const leakMap: Record<string, { count: number; totalLoss: number }> = {};

    trades.forEach(t => {
      // Gather tags & emotions
      const tagsList = [...(t.tags || [t.strategy])];
      if (t.emotion && ['FOMO', 'Revenge', 'Boredom', 'Anxious', 'Frustrated', 'Impatient', 'Greed', 'Fear'].includes(t.emotion)) {
        tagsList.push(t.emotion);
      }

      // Check notes or strategy for leak keywords
      if (t.notes) {
        if (t.notes.toLowerCase().includes('fomo')) tagsList.push('FOMO');
        if (t.notes.toLowerCase().includes('chase') || t.notes.toLowerCase().includes('chasing')) tagsList.push('ChasingCandle');
        if (t.notes.toLowerCase().includes('martingale') || t.notes.toLowerCase().includes('double')) tagsList.push('MartingaleDouble');
        if (t.notes.toLowerCase().includes('stop loss') || t.notes.toLowerCase().includes('moved stop')) tagsList.push('MovedStop');
      }

      const uniqueInTrade = Array.from(new Set(tagsList));

      uniqueInTrade.forEach(tg => {
        if (!leakMap[tg]) {
          leakMap[tg] = { count: 0, totalLoss: 0 };
        }
        leakMap[tg].count += 1;
        if (t.pnl < 0) {
          leakMap[tg].totalLoss += Math.abs(t.pnl);
        }
      });
    });

    const parsedList: LeakTagInfo[] = Object.entries(leakMap).map(([name, data]) => {
      const avgLoss = data.count > 0 ? data.totalLoss / data.count : 0;
      let severity: 'high' | 'medium' | 'low' = 'low';
      if (data.totalLoss >= 100 || data.count >= 5) severity = 'high';
      else if (data.totalLoss >= 40 || data.count >= 3) severity = 'medium';

      return {
        name,
        count: data.count,
        totalLossPnl: data.totalLoss,
        avgLossPnl: avgLoss,
        severity,
        remedy: LEAK_REMEDIES[name] || `Maintain strict adherence to your trading rules whenever executing ${name} setups.`,
      };
    });

    // Sort by highest monetary cost
    return parsedList.sort((a, b) => b.totalLossPnl - a.totalLossPnl);
  }, [trades]);

  const totalCostOfMistakes = useMemo(() => {
    return leakTags.reduce((acc, tag) => acc + tag.totalLossPnl, 0);
  }, [leakTags]);

  return (
    <div className="trade-card rounded-2xl p-5 border border-[#8B5CF6]/25 bg-[#07060A]/85 backdrop-blur-2xl shadow-xl space-y-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#8B5CF6]/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] shadow-[0_0_12px_rgba(239,68,68,0.3)]">
            <Tag size={16} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Interactive Mistake & Leak Cloud</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 font-mono font-bold">
                LEAK AUDIT
              </span>
            </h3>
            <p className="text-[11px] text-[#A78BFA]">
              Visual tag analyzer sizing leaks by dollar cost and occurrence frequency
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0D0B14] border border-[#EF4444]/30 text-xs font-mono">
          <DollarSign size={14} className="text-[#EF4444]" />
          <span className="text-rose-200">Total Leak Cost:</span>
          <span className="text-[#EF4444] font-black">-{formatCurrency(totalCostOfMistakes)}</span>
        </div>
      </div>

      {/* Tag Cloud Display */}
      <div className="flex flex-wrap items-center gap-2 py-2">
        {leakTags.length === 0 ? (
          <div className="text-xs text-[#A78BFA] font-mono py-4 text-center w-full">
            No psychological leak tags recorded yet. Keep trading disciplined!
          </div>
        ) : (
          leakTags.map((tag) => {
            const isSelected = selectedTag?.name === tag.name;
            const isHighCost = tag.severity === 'high';

            return (
              <button
                key={tag.name}
                onClick={() => {
                  setSelectedTag(tag);
                  onSelectTagFilter?.(tag.name);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 active:scale-95 border ${
                  isSelected
                    ? 'bg-[#8B5CF6] text-white border-[#C084FC] shadow-[0_0_15px_rgba(139,92,246,0.6)] scale-105'
                    : isHighCost
                    ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40 hover:bg-[#EF4444]/25 hover:border-[#EF4444]/60 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                    : 'bg-[#0D0B14] text-[#CBD5E1] border-[#8B5CF6]/20 hover:border-[#8B5CF6]/50 hover:text-white'
                }`}
                title={`Click to inspect ${tag.name} leak details`}
              >
                <span>#{tag.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#07060A]/60 font-mono">
                  {tag.count}x
                </span>
                {tag.totalLossPnl > 0 && (
                  <span className="text-[10px] text-rose-300 font-bold">
                    -${tag.totalLossPnl.toFixed(0)}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Selected Tag Detail Inspector */}
      {selectedTag && (
        <div className="p-4 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/35 space-y-2 animate-in fade-in duration-200 relative">
          <button
            onClick={() => setSelectedTag(null)}
            className="absolute top-3 right-3 text-[#A78BFA] hover:text-white"
          >
            <X size={14} />
          </button>

          <div className="flex items-center gap-2 text-xs font-mono">
            <ShieldAlert size={15} className="text-[#EF4444]" />
            <span className="font-bold text-white text-sm">Leak Analysis: #{selectedTag.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
              selectedTag.severity === 'high' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'
            }`}>
              {selectedTag.severity} Severity
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono py-1">
            <div className="p-2 rounded bg-[#07060A] border border-[#8B5CF6]/20">
              <span className="text-[10px] text-[#A78BFA] block">Frequency</span>
              <span className="font-bold text-white">{selectedTag.count} Executions</span>
            </div>
            <div className="p-2 rounded bg-[#07060A] border border-[#8B5CF6]/20">
              <span className="text-[10px] text-[#A78BFA] block">Total Dollar Cost</span>
              <span className="font-bold text-[#EF4444]">-{formatCurrency(selectedTag.totalLossPnl)}</span>
            </div>
            <div className="p-2 rounded bg-[#07060A] border border-[#8B5CF6]/20">
              <span className="text-[10px] text-[#A78BFA] block">Avg Loss per Occurrence</span>
              <span className="font-bold text-rose-300">-{formatCurrency(selectedTag.avgLossPnl)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#8B5CF6]/15 text-xs text-slate-200 leading-relaxed font-sans">
            <strong className="text-[#C084FC] block text-[11px] font-mono mb-0.5 uppercase">
              💡 Recommended AI Remediation:
            </strong>
            {selectedTag.remedy}
          </div>
        </div>
      )}
    </div>
  );
}
