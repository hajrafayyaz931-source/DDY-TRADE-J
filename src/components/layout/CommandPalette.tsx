import React, { useState, useEffect } from 'react';
import { NavTab } from './Sidebar';
import { Trade } from '../../types/trade';
import { 
  Search, 
  X, 
  LayoutDashboard, 
  BookOpen, 
  LineChart, 
  Calculator, 
  BarChart3, 
  BrainCircuit, 
  ShieldCheck, 
  Download, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  Sparkles,
  Palette
} from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenLogTrade: () => void;
  onOpenAutoImport: () => void;
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
  onOpenVisuals?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  onOpenLogTrade,
  onOpenAutoImport,
  trades,
  onSelectTrade,
  onOpenVisuals,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle handled by parent
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { label: 'Visual & Theme Studio (Themes, Candles, Colors, Audio)', icon: Palette, action: () => { onClose(); onOpenVisuals?.(); } },
    { label: '$100 to $5000 Challenge Target Journal', icon: Sparkles, action: () => onSelectTab('challenge') },
    { label: 'Gemini AI Chatbot & Mentor', icon: BrainCircuit, action: () => onSelectTab('gemini-chat') },
    { label: 'Log New Trade', icon: Plus, action: onOpenLogTrade },
    { label: 'Auto-Import from Quotex / CSV', icon: Download, action: onOpenAutoImport },
    { label: 'Command Center', icon: LayoutDashboard, action: () => onSelectTab('dashboard') },
    { label: 'Trade Execution Journal', icon: LineChart, action: () => onSelectTab('journal') },
    { label: 'Position Sizing Calculator', icon: Calculator, action: () => onSelectTab('calculator') },
    { label: 'Performance Analytics', icon: BarChart3, action: () => onSelectTab('analytics') },
    { label: 'AI Intelligence Stats', icon: BrainCircuit, action: () => onSelectTab('ai-coach') },
    { label: 'Rules & Discipline Engine', icon: ShieldCheck, action: () => onSelectTab('rules') },
    { label: 'Daily Playbook', icon: BookOpen, action: () => onSelectTab('playbook') },
  ];

  const filteredActions = quickActions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));
  const filteredTrades = trades.filter(t => 
    t.symbol.toLowerCase().includes(query.toLowerCase()) || 
    t.strategy.toLowerCase().includes(query.toLowerCase()) ||
    t.ticket?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#0D131D] border border-[#243346] rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1E293B]">
          <Search size={18} className="text-[#3987FF] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trades, symbols, strategies, or jump to terminal tools..."
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-[#64748B] outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#64748B] hover:text-white">
              <X size={16} />
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded bg-[#182333] border border-[#26354A] text-[10px] text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Trades matching search */}
          {filteredTrades.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-mono">
                Matching Trades ({filteredTrades.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredTrades.map(t => {
                  const isUp = t.direction === 'CALL' || t.direction === 'Long';
                  const isWin = t.pnl > 0;

                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTrade(t);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#182333] text-left text-xs transition-all border border-transparent hover:border-[#26354A]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`p-1.5 rounded-lg text-xs font-bold ${
                          isUp ? 'bg-[#00D6A0]/15 text-[#00D6A0]' : 'bg-[#FF5268]/15 text-[#FF5268]'
                        }`}>
                          {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{t.symbol}</span>
                            <span className="text-[10px] text-[#8492A6] font-mono">{t.date}</span>
                          </div>
                          <div className="text-[11px] text-[#8492A6]">{t.strategy}</div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className={`font-bold ${isWin ? 'text-[#00D6A0]' : 'text-[#FF5268]'}`}>
                          {isWin ? '+' : ''}{formatCurrency(t.pnl)}
                        </div>
                        {t.rMultiple !== undefined && (
                          <div className="text-[10px] text-[#8492A6]">
                            {t.rMultiple.toFixed(2)}R
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <div className="px-3 py-1 text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-mono">
              Terminal Navigation & Actions
            </div>
            <div className="space-y-1 mt-1">
              {filteredActions.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#182333] text-left text-xs text-slate-200 transition-all border border-transparent hover:border-[#26354A]"
                  >
                    <Icon size={16} className="text-[#3987FF]" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#080B12] border-t border-[#1E293B] flex items-center justify-between text-[11px] text-[#64748B] font-mono">
          <span>Navigate with arrows</span>
          <span>Press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
}
