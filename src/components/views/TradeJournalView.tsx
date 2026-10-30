import React, { useState, useMemo } from 'react';
import { Trade, TradeEmotion, TradingSession } from '../../types/trade';
import { 
  Table, 
  LayoutGrid, 
  Clock, 
  Search, 
  Download, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2,
  Eye,
  Tag,
  MessageSquare,
  PlayCircle,
  X
} from 'lucide-react';
import { formatCurrency, generateCsvExport } from '../../utils/calculations';
import { EmptyState } from '../ui/SkeletonAndEmptyStates';

interface TradeJournalViewProps {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
  onOpenLogTrade: () => void;
  onOpenAutoImport: () => void;
  onDeleteTrade: (id: string) => void;
  selectedDateFilter: string | null;
  onClearDateFilter: () => void;
}

const COMMON_TAGS = [
  'All',
  'Breakout',
  'Reversal',
  'Trend Following',
  'News',
  'Scalp',
  'Liquidity Sweep',
  'Key Level',
];

export function TradeJournalView({
  trades,
  onSelectTrade,
  onOpenLogTrade,
  onOpenAutoImport,
  onDeleteTrade,
  selectedDateFilter,
  onClearDateFilter,
}: TradeJournalViewProps) {
  const [viewMode, setViewMode] = useState<'table' | 'gallery' | 'timeline'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'binary' | 'cfd'>('all');
  const [filterDirection, setFilterDirection] = useState<'all' | 'long' | 'short'>('all');
  const [filterOutcome, setFilterOutcome] = useState<'all' | 'win' | 'loss' | 'be'>('all');
  const [filterEmotion, setFilterEmotion] = useState<string>('all');
  const [filterSession, setFilterSession] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('all');

  // Quick notes popover state
  const [activeNotesTrade, setActiveNotesTrade] = useState<Trade | null>(null);

  // Available unique symbols
  const uniqueSymbols = useMemo(() => {
    return Array.from(new Set(trades.map(t => t.symbol))).sort();
  }, [trades]);

  // Filter trades
  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      if (selectedDateFilter && t.date !== selectedDateFilter) return false;
      if (filterType !== 'all' && t.type !== filterType) return false;
      
      if (filterDirection === 'long') {
        if (t.direction !== 'Long' && t.direction !== 'CALL') return false;
      } else if (filterDirection === 'short') {
        if (t.direction !== 'Short' && t.direction !== 'PUT') return false;
      }

      if (filterOutcome === 'win' && t.pnl <= 0) return false;
      if (filterOutcome === 'loss' && t.pnl >= 0) return false;
      if (filterOutcome === 'be' && t.pnl !== 0) return false;

      if (filterEmotion !== 'all' && t.emotion !== filterEmotion) return false;
      if (filterSession !== 'all' && t.session !== filterSession) return false;
      if (selectedSymbol !== 'all' && t.symbol !== selectedSymbol) return false;

      // Tag filter
      if (selectedTag !== 'All') {
        const tags = t.tags || [t.strategy];
        const hasTag = tags.some(tag => tag.toLowerCase().includes(selectedTag.toLowerCase()));
        if (!hasTag) return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = 
          t.symbol.toLowerCase().includes(q) ||
          t.strategy.toLowerCase().includes(q) ||
          (t.ticket && t.ticket.toLowerCase().includes(q)) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)));
        if (!match) return false;
      }

      return true;
    });
  }, [
    trades, 
    selectedDateFilter, 
    filterType, 
    filterDirection, 
    filterOutcome, 
    filterEmotion, 
    filterSession, 
    selectedSymbol, 
    selectedTag, 
    searchQuery
  ]);

  // Export to CSV
  const handleExportCsv = () => {
    const csvContent = generateCsvExport(filteredTrades);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DDY_Trade_Journal_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalFilteredPnl = filteredTrades.reduce((acc, t) => acc + t.pnl, 0);
  const winCount = filteredTrades.filter(t => t.pnl > 0).length;
  const filteredWinRate = filteredTrades.length > 0 ? (winCount / filteredTrades.length) * 100 : 0;

  return (
    <div className="space-y-6 font-mono text-xs text-[#E0E0E0]">
      {/* Top Header & View Mode Switcher - Variation 3 Terminal Hero Style */}
      <div className="hero-block bg-[#151618] border border-[#222326] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-[0.7rem] text-[#BB86FC] tracking-wider mb-1">
            // TRANSACTION_LEDGER &amp; JOURNAL_DATA
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-syne text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none mt-1">
              Trade Execution Journal
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 bg-[#BB86FC]/10 border border-[#BB86FC]/30 text-[#BB86FC] font-mono font-bold">
              {filteredTrades.length} Records
            </span>
          </div>
          <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
            Plan, document, review, and analyze every single execution with high-visual verification.
          </p>
        </div>

        {/* View Mode Buttons & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View mode toggle */}
          <div className="flex items-center bg-[#0B0C0D] p-1 border border-[#222326] text-xs font-mono">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-[#222326] text-[#03DAC6]' : 'text-[#666666] hover:text-[#E0E0E0]'
              }`}
            >
              <Table size={13} /> Table
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={`px-3 py-1 font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'gallery' ? 'bg-[#222326] text-[#03DAC6]' : 'text-[#666666] hover:text-[#E0E0E0]'
              }`}
            >
              <LayoutGrid size={13} /> Gallery
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'timeline' ? 'bg-[#222326] text-[#03DAC6]' : 'text-[#666666] hover:text-[#E0E0E0]'
              }`}
            >
              <Clock size={13} /> Timeline
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-1.5 bg-[#1C1D21] hover:bg-[#25272C] border border-[#222326] text-xs font-mono text-[#E0E0E0] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export filtered records to CSV"
          >
            <Download size={13} className="text-[#03DAC6]" />
            <span>EXPORT_CSV</span>
          </button>

          <button
            onClick={onOpenLogTrade}
            className="bg-[#BB86FC] hover:bg-[#cda6ff] active:scale-95 text-[#0B0C0D] font-bold px-4 py-1.5 text-xs font-mono tracking-wider uppercase transition-all duration-150 cursor-pointer shadow-[0_0_18px_rgba(187,134,252,0.35)] flex items-center gap-1.5"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>LOG TRADE</span>
          </button>
        </div>
      </div>

      {/* Smart Search & Filter Hub */}
      <div className="bg-[#151618] border border-[#222326] p-4 space-y-3 font-mono">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Smart Search Box */}
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Symbol (EUR/USD OTC), Setup, Ticket, Notes..."
              className="w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] pl-9 pr-3 py-2 text-xs text-[#E0E0E0] placeholder-[#555555] outline-none transition-colors"
            />
          </div>

          {/* Quick Select Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* Symbol Filter */}
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] px-2.5 py-2 text-[#E0E0E0] outline-none cursor-pointer"
            >
              <option value="all">All Pairs</option>
              {uniqueSymbols.map(sym => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>

            {/* Instrument Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] px-2.5 py-2 text-[#E0E0E0] outline-none cursor-pointer"
            >
              <option value="all">All Instruments</option>
              <option value="binary">Quotex Binary (OTC)</option>
              <option value="cfd">Forex / Live Pairs</option>
            </select>

            {/* Outcome */}
            <select
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value as any)}
              className="bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] px-2.5 py-2 text-[#E0E0E0] outline-none cursor-pointer"
            >
              <option value="all">All Outcomes</option>
              <option value="win">Wins (ITM / Profit)</option>
              <option value="loss">Losses (OTM / Loss)</option>
              <option value="be">Breakeven / Tie</option>
            </select>

            {/* Session */}
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              className="bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] px-2.5 py-2 text-[#E0E0E0] outline-none cursor-pointer"
            >
              <option value="all">All Sessions</option>
              <option value="OTC Weekend">OTC Weekend</option>
              <option value="London">London</option>
              <option value="New York Open">New York Open</option>
              <option value="Asian / Tokyo">Asian / Tokyo</option>
              <option value="24/7 OTC">24/7 OTC</option>
            </select>
          </div>
        </div>

        {/* Tag Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-[#666666] font-mono mr-1.5 flex items-center gap-1">
            <Tag size={12} className="text-[#BB86FC]" /> Tags:
          </span>
          {COMMON_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-0.5 text-[11px] font-mono font-bold transition-all border cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#222326] text-[#03DAC6] border-[#03DAC6]/50'
                  : 'bg-[#0B0C0D] text-[#666666] border-[#222326] hover:text-[#E0E0E0] hover:border-[#444]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Filter Summary Banner */}
        <div className="flex flex-wrap items-center justify-between text-xs text-[#666666] pt-2 border-t border-[#222326] font-mono">
          <div className="flex items-center gap-4">
            <span>Filtered PnL: <strong className={totalFilteredPnl >= 0 ? 'text-[#03DAC6]' : 'text-[#CF6679]'}>
              {totalFilteredPnl >= 0 ? '+' : ''}{formatCurrency(totalFilteredPnl)}
            </strong></span>
            <span>Win Rate: <strong className="text-white">{filteredWinRate.toFixed(1)}%</strong></span>
            {selectedDateFilter && (
              <span className="px-2 py-0.5 bg-[#222326] text-[#BB86FC] border border-[#BB86FC]/30 flex items-center gap-1">
                Date: {selectedDateFilter}
                <button onClick={onClearDateFilter} className="hover:text-white ml-1">×</button>
              </span>
            )}
          </div>

          {(searchQuery || filterType !== 'all' || filterDirection !== 'all' || filterOutcome !== 'all' || filterSession !== 'all' || selectedSymbol !== 'all' || selectedTag !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterDirection('all');
                setFilterOutcome('all');
                setFilterSession('all');
                setSelectedSymbol('all');
                setSelectedTag('All');
              }}
              className="text-[#BB86FC] hover:underline cursor-pointer"
            >
              RESET_FILTERS
            </button>
          )}
        </div>
      </div>

      {/* Quick Trade Replay Notes Drawer Modal if open */}
      {activeNotesTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[#151618] border border-[#BB86FC] p-5 space-y-4 font-mono shadow-[0_0_30px_rgba(187,134,252,0.25)]">
            <div className="flex items-center justify-between border-b border-[#222326] pb-3">
              <div className="flex items-center gap-2">
                <PlayCircle size={16} className="text-[#BB86FC]" />
                <h3 className="font-bold text-white text-sm font-syne">
                  Trade Replay &amp; Notes — {activeNotesTrade.symbol} ({activeNotesTrade.ticket})
                </h3>
              </div>
              <button
                onClick={() => setActiveNotesTrade(null)}
                className="text-[#666666] hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between p-3 bg-[#0B0C0D] border border-[#222326]">
                <span className="text-[#666666]">Execution Result:</span>
                <span className={`font-bold ${activeNotesTrade.pnl >= 0 ? 'text-[#03DAC6]' : 'text-[#CF6679]'}`}>
                  {activeNotesTrade.pnl >= 0 ? '+' : ''}{formatCurrency(activeNotesTrade.pnl)} ({activeNotesTrade.direction})
                </span>
              </div>

              <div>
                <span className="text-[#666666] block mb-1 uppercase">Entry Thesis / Setup:</span>
                <p className="p-3 bg-[#0B0C0D] border border-[#222326] text-[#E0E0E0] leading-relaxed">
                  {activeNotesTrade.entryReason || `Executed ${activeNotesTrade.strategy} in ${activeNotesTrade.session}.`}
                </p>
              </div>

              <div>
                <span className="text-[#666666] block mb-1 uppercase">Reflection &amp; Notes:</span>
                <p className="p-3 bg-[#0B0C0D] border border-[#222326] text-[#E0E0E0] leading-relaxed whitespace-pre-wrap">
                  {activeNotesTrade.notes || 'No reflections recorded.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#222326]">
              <button
                onClick={() => {
                  onSelectTrade(activeNotesTrade);
                  setActiveNotesTrade(null);
                }}
                className="px-4 py-2 bg-[#BB86FC] hover:bg-[#cda6ff] text-[#0B0C0D] font-bold text-xs uppercase cursor-pointer"
              >
                Open Full Inspector
              </button>
              <button
                onClick={() => setActiveNotesTrade(null)}
                className="px-4 py-2 border border-[#222326] text-[#888888] hover:text-white text-xs uppercase cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEWS OR EMPTY STATE */}
      {filteredTrades.length === 0 ? (
        <EmptyState
          icon={Search}
          title={trades.length === 0 ? "No Trades Recorded Yet" : "No Matching Trades Found"}
          description={
            trades.length === 0
              ? "Your trading journal is empty. Log your first Quotex OTC trade to activate your journal blotter, edge analytics, and equity curve."
              : "No trade records match your active search and filter criteria. Clear filters or adjust your criteria to view records."
          }
          actionText="Log New Trade"
          onAction={onOpenLogTrade}
          secondaryActionText={trades.length > 0 ? "Reset All Filters" : "Auto-Import Trades"}
          onSecondaryAction={() => {
            if (trades.length > 0) {
              setSearchQuery('');
              setFilterType('all');
              setFilterDirection('all');
              setFilterOutcome('all');
              setFilterEmotion('all');
              setFilterSession('all');
              setSelectedTag('All');
              setSelectedSymbol('all');
              onClearDateFilter();
            } else {
              onOpenAutoImport();
            }
          }}
        />
      ) : (
        <>
          {/* VIEW 1: DETAILED TERMINAL TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="border border-[#222326] bg-[#0B0C0D] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#151618] text-[#666666] text-[10px] uppercase border-b border-[#222326] select-none">
                    <tr>
                      <th className="py-3 px-4">Instrument / ID</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Direction</th>
                      <th className="py-3 px-4">Entry → Settlement</th>
                      <th className="py-3 px-3 text-right">Size / Risk</th>
                      <th className="py-3 px-3 text-right">R-Multiple</th>
                      <th className="py-3 px-4 text-right">Net PnL</th>
                      <th className="py-3 px-3">Setup / Tags</th>
                      <th className="py-3 px-3">Emotion</th>
                      <th className="py-3 px-3 text-center">Rules</th>
                      <th className="py-3 px-4 text-right">Date</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222326]">
                    {filteredTrades.map((t) => {
                      const isUp = t.direction === 'CALL' || t.direction === 'Long';
                      const isWin = t.pnl > 0;
                      const isLoss = t.pnl < 0;
                      const tradeTags = t.tags || [t.strategy];

                      return (
                        <tr
                          key={t.id}
                          onClick={() => onSelectTrade(t)}
                          className="hover:bg-[#151618] cursor-pointer transition-colors group"
                        >
                          <td className="py-3.5 px-4 font-bold text-white">
                            <div className="flex items-center gap-2">
                              <span>{t.symbol}</span>
                              {t.screenshotUrl && (
                                <span title="Screenshot attached" className="w-1.5 h-1.5 rounded-full bg-[#03DAC6]"></span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#666666] font-mono block mt-0.5">
                              {t.ticket}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-[#0B0C0D] border border-[#222326] text-[#888888]">
                              {t.type === 'binary' ? 'Quotex OTC' : 'Forex'}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className={`px-2 py-0.5 text-[10px] font-bold font-mono inline-flex items-center gap-1 border ${
                              isUp 
                                ? 'bg-[#03DAC6]/10 text-[#03DAC6] border-[#03DAC6]/30' 
                                : 'bg-[#CF6679]/10 text-[#CF6679] border-[#CF6679]/30'
                            }`}>
                              {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                              {t.direction}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[#888888]">
                            <span className="text-white font-bold">{t.entry.toLocaleString()}</span> → <span>{t.exit.toLocaleString()}</span>
                          </td>

                          <td className="py-3.5 px-3 text-right font-mono text-[#888888]">
                            {t.type === 'binary' ? formatCurrency(t.investment || 50) : `${t.size || 1} units`}
                          </td>

                          <td className={`py-3.5 px-3 text-right font-mono font-bold ${
                            t.rMultiple !== undefined && t.rMultiple >= 0 ? 'text-[#03DAC6]' : 'text-[#CF6679]'
                          }`}>
                            {t.rMultiple !== undefined ? `${t.rMultiple > 0 ? '+' : ''}${t.rMultiple.toFixed(2)}R` : 'N/A'}
                          </td>

                          <td className={`py-3.5 px-4 text-right font-mono font-bold text-sm ${
                            isWin ? 'text-[#03DAC6]' : isLoss ? 'text-[#CF6679]' : 'text-[#888888]'
                          }`}>
                            {isWin ? '+' : ''}{formatCurrency(t.pnl)}
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex flex-wrap items-center gap-1 max-w-[150px]">
                              {tradeTags.slice(0, 2).map((tg, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-[#0B0C0D] text-[#BB86FC] border border-[#222326] font-mono truncate">
                                  {tg}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#0B0C0D] border border-[#222326] text-[#888888]">
                              {t.emotion}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono">
                            <span className="text-[#888888]">
                              {t.rulesFollowed}/{t.totalRules || 5}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono text-[#666666] text-[11px]">
                            {t.date}
                          </td>

                          <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setActiveNotesTrade(t)}
                                className="p-1 text-[#666666] hover:text-[#BB86FC] transition-colors"
                                title="Quick replay notes"
                              >
                                <MessageSquare size={13} />
                              </button>
                              <button
                                onClick={() => onSelectTrade(t)}
                                className="p-1 text-[#666666] hover:text-white transition-colors"
                                title="Inspect details & replay"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={() => onDeleteTrade(t.id)}
                                className="p-1 text-[#666666] hover:text-[#CF6679] transition-colors"
                                title="Delete trade"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 2: VISUAL TRADE GALLERY */}
          {viewMode === 'gallery' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrades.map((t) => {
                const isUp = t.direction === 'CALL' || t.direction === 'Long';
                const isWin = t.pnl > 0;
                const isLoss = t.pnl < 0;
                const tradeTags = t.tags || [t.strategy];

                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTrade(t)}
                    className="bg-[#151618] border border-[#222326] hover:border-[#333] p-5 cursor-pointer transition-colors flex flex-col justify-between font-mono"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 text-xs font-bold border ${
                            isUp ? 'bg-[#03DAC6]/10 text-[#03DAC6] border-[#03DAC6]/30' : 'bg-[#CF6679]/10 text-[#CF6679] border-[#CF6679]/30'
                          }`}>
                            {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                          </span>
                          <div>
                            <h3 className="font-extrabold text-sm text-white font-syne">{t.symbol}</h3>
                            <span className="text-[10px] text-[#666666] font-mono">{t.date} • {t.session}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 text-xs font-bold font-mono border ${
                          isWin 
                            ? 'bg-[#03DAC6]/10 text-[#03DAC6] border-[#03DAC6]/30' 
                            : isLoss 
                            ? 'bg-[#CF6679]/10 text-[#CF6679] border-[#CF6679]/30' 
                            : 'bg-[#222326] text-[#888888] border-[#333]'
                        }`}>
                          {isWin ? '+' : ''}{formatCurrency(t.pnl)}
                        </span>
                      </div>

                      {/* Setup & Notes */}
                      <div className="p-3 bg-[#0B0C0D] border border-[#222326] space-y-1.5 mb-3 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#666666]">Strategy:</span>
                          <span className="font-semibold text-[#E0E0E0]">{t.strategy}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-[#666666]">Entry → Exit:</span>
                          <span className="text-[#888888]">{t.entry} → {t.exit}</span>
                        </div>
                        {t.rMultiple !== undefined && (
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-[#666666]">R-Multiple:</span>
                            <span className={t.rMultiple >= 0 ? 'text-[#03DAC6] font-bold' : 'text-[#CF6679] font-bold'}>
                              {t.rMultiple > 0 ? '+' : ''}{t.rMultiple.toFixed(2)}R
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1 mb-2">
                        {tradeTags.map((tg, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-[#0B0C0D] text-[#BB86FC] border border-[#222326] font-mono">
                            #{tg}
                          </span>
                        ))}
                      </div>

                      {/* Reflection quote */}
                      <p className="text-[11px] text-[#888888] line-clamp-2 italic">
                        "{t.notes || t.entryReason || 'No notes attached.'}"
                      </p>
                    </div>

                    {/* Footer tags */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#222326] text-[10px] font-mono">
                      <span className="text-[#666666]">Emotion: <strong className="text-white">{t.emotion}</strong></span>
                      <span className="text-[#03DAC6] font-bold">{t.rulesFollowed}/{t.totalRules || 5} Rules</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 3: CHRONOLOGICAL TRADE TIMELINE */}
          {viewMode === 'timeline' && (
            <div className="bg-[#151618] border border-[#222326] p-6">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#222326]">
                {filteredTrades.map((t) => {
                  const isUp = t.direction === 'CALL' || t.direction === 'Long';
                  const isWin = t.pnl > 0;

                  return (
                    <div key={t.id} className="relative group cursor-pointer" onClick={() => onSelectTrade(t)}>
                      {/* Timeline node */}
                      <div className={`absolute -left-[27px] top-1.5 w-3 h-3 border-2 border-[#0B0C0D] ${
                        isWin ? 'bg-[#03DAC6]' : 'bg-[#CF6679]'
                      }`} />

                      <div className="p-4 bg-[#0B0C0D] border border-[#222326] hover:border-[#333] transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-white font-syne">{t.symbol}</span>
                            <span className={`px-1.5 py-0.2 text-[10px] font-bold font-mono ${
                              isUp ? 'text-[#03DAC6]' : 'text-[#CF6679]'
                            }`}>
                              [{t.direction}]
                            </span>
                            <span className="text-[10px] text-[#666666] font-mono">{t.date} {t.time ? `• ${t.time}` : ''}</span>
                          </div>

                          <span className={`text-sm font-bold font-mono ${isWin ? 'text-[#03DAC6]' : 'text-[#CF6679]'}`}>
                            {isWin ? '+' : ''}{formatCurrency(t.pnl)}
                          </span>
                        </div>

                        <p className="text-xs text-[#888888]">
                          {t.entryReason || t.notes || `${t.strategy} trade execution during ${t.session} session.`}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-[10px] text-[#666666] font-mono">
                          <span>Setup: <strong className="text-[#CCCCCC]">{t.strategy}</strong></span>
                          <span>Rules: <strong className="text-[#03DAC6]">{t.rulesFollowed}/{t.totalRules || 5}</strong></span>
                          <span>Emotion: <strong className="text-[#CCCCCC]">{t.emotion}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
