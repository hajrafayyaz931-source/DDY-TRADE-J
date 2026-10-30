import React, { useState } from 'react';
import { Trade } from '../../types/trade';
import { BookMarked, Search, AlertCircle, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

interface LessonsLibraryViewProps {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
}

export function LessonsLibraryView({ trades, onSelectTrade }: LessonsLibraryViewProps) {
  const [filterType, setFilterType] = useState<'all' | 'wins' | 'mistakes'>('all');
  const [search, setSearch] = useState('');

  const libraryItems = trades.filter(t => {
    if (filterType === 'wins' && t.pnl <= 0) return false;
    if (filterType === 'mistakes' && t.pnl >= 0 && t.rulesFollowed >= 5) return false;

    if (search) {
      const q = search.toLowerCase();
      return (
        t.symbol.toLowerCase().includes(q) ||
        t.strategy.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        (t.entryReason && t.entryReason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#101722] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8492A6]">
            <BookMarked size={14} className="text-[#3987FF]" />
            <span>KNOWLEDGE REPOSITORY & MISTAKE VAULT</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white mt-1 tracking-tight">
            Personal Trading Lessons Library
          </h1>
          <p className="text-xs text-[#8492A6] mt-0.5">
            Every trade is an asset: catalog of textbook setups, recurring errors, and trading insights
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 bg-[#080B12] p-1 rounded-xl border border-[#1E293B] text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterType === 'all' ? 'bg-[#3987FF] text-white' : 'text-[#8492A6] hover:text-white'
            }`}
          >
            All Lessons ({trades.length})
          </button>
          <button
            onClick={() => setFilterType('wins')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterType === 'wins' ? 'bg-[#00D6A0] text-[#080B12]' : 'text-[#8492A6] hover:text-white'
            }`}
          >
            Textbook Wins
          </button>
          <button
            onClick={() => setFilterType('mistakes')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterType === 'mistakes' ? 'bg-[#FF5268] text-white' : 'text-[#8492A6] hover:text-white'
            }`}
          >
            Mistakes to Avoid
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8492A6]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search library lessons, thesis notes, mistakes, setups..."
          className="w-full bg-[#080B12] border border-[#222E40] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#3987FF]"
        />
      </div>

      {/* Grid of Knowledge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {libraryItems.map(item => {
          const isWin = item.pnl > 0;
          return (
            <div
              key={item.id}
              onClick={() => onSelectTrade(item)}
              className="trade-card rounded-2xl p-5 border border-[#1E293B] cursor-pointer hover:border-[#3987FF]/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">{item.symbol}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#182333] text-slate-300 font-mono">
                      {item.strategy}
                    </span>
                  </div>
                  <span className={`text-xs font-mono font-bold ${isWin ? 'text-[#00D6A0]' : 'text-[#FF5268]'}`}>
                    {isWin ? '+' : ''}{formatCurrency(item.pnl)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#080B12] border border-[#1E293B] mb-3">
                  <span className="text-[10px] text-[#8492A6] uppercase font-bold tracking-wider block mb-1">
                    Lesson / Reflection
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    "{item.notes || item.entryReason || 'Followed trading plan.'}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1E293B] text-[10px] font-mono text-[#8492A6]">
                <span>{item.date}</span>
                <span className={item.rulesFollowed >= 5 ? 'text-[#00D6A0]' : 'text-[#FF5268]'}>
                  {item.rulesFollowed}/{item.totalRules || 5} Rules Followed
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
