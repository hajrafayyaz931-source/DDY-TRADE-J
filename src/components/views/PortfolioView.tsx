import React from 'react';
import { TradingAccount, Trade } from '../../types/trade';
import { Flame, PieChart, ShieldCheck, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

interface PortfolioViewProps {
  accounts: TradingAccount[];
  trades: Trade[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onOpenEditAccount?: () => void;
}

export function PortfolioView({ accounts, trades, selectedAccountId, onSelectAccount, onOpenEditAccount }: PortfolioViewProps) {
  const combinedEquity = accounts.filter(a => a.id !== 'acc-all').reduce((acc, a) => acc + a.currentBalance, 0);
  const totalRealized = trades.reduce((acc, t) => acc + t.pnl, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#101722] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8492A6]">
            <Flame size={14} className="text-[#3987FF]" />
            <span>INSTITUTIONAL PORTFOLIO CONSOLIDATION</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white mt-1 tracking-tight">
            Multi-Account Portfolio Intelligence
          </h1>
          <p className="text-xs text-[#8492A6] mt-0.5">
            Cross-broker capital allocation, prop-firm safety buffers, and risk exposure across live accounts
          </p>
        </div>

        <div className="text-right font-mono self-start sm:self-auto">
          <span className="text-[10px] text-[#8492A6] uppercase tracking-wider block">Total Combined Equity</span>
          <span className="text-2xl font-black text-white">{formatCurrency(combinedEquity)}</span>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {accounts.filter(a => a.id !== 'acc-all').map((acc) => {
          const accTrades = trades.filter(t => t.accountId === acc.id);
          const accPnl = accTrades.reduce((s, t) => s + t.pnl, 0);
          const accWins = accTrades.filter(t => t.pnl > 0).length;
          const accWinRate = accTrades.length > 0 ? (accWins / accTrades.length) * 100 : 0;
          const isSelected = selectedAccountId === acc.id;

          return (
            <div
              key={acc.id}
              onClick={() => onSelectAccount(acc.id)}
              className={`trade-card rounded-2xl p-6 border cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#3987FF] shadow-[0_0_20px_rgba(57,135,255,0.3)] ring-1 ring-[#3987FF]'
                  : 'border-[#1E293B] hover:border-[#3987FF]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: acc.color }} />
                  <div>
                    <h3 className="font-extrabold text-white text-base">{acc.name}</h3>
                    <span className="text-xs text-[#8492A6] font-mono">{acc.broker}</span>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-0.5 rounded bg-[#182333] text-slate-300 font-mono">
                  {acc.type}
                </span>
              </div>

              {/* Balances */}
              <div className="p-4 rounded-xl bg-[#080B12] border border-[#1E293B] space-y-2 font-mono mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8492A6]">Current Balance:</span>
                  <span className="font-extrabold text-white text-sm">{formatCurrency(acc.currentBalance)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8492A6]">Starting Capital:</span>
                  <span className="text-slate-400">{formatCurrency(acc.startingBalance)}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1E293B]">
                  <span className="text-[#8492A6]">Net Realized:</span>
                  <span className={`font-bold ${accPnl >= 0 ? 'text-[#00D6A0]' : 'text-[#FF5268]'}`}>
                    {accPnl >= 0 ? '+' : ''}{formatCurrency(accPnl)}
                  </span>
                </div>
              </div>

              {/* Performance footer */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-center">
                <div className="p-2 rounded-lg bg-[#080B12]">
                  <span className="text-[10px] text-[#8492A6] block">Win Rate</span>
                  <span className="font-bold text-[#00D6A0]">{accWinRate.toFixed(1)}%</span>
                </div>
                <div className="p-2 rounded-lg bg-[#080B12]">
                  <span className="text-[10px] text-[#8492A6] block">Trades</span>
                  <span className="font-bold text-white">{accTrades.length}</span>
                </div>
              </div>

              {onOpenEditAccount && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAccount(acc.id);
                    onOpenEditAccount();
                  }}
                  className="w-full mt-3 py-2 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/35 text-[#C084FC] text-xs font-bold transition-all flex items-center justify-center gap-1.5 font-mono"
                >
                  <span>Edit Account Equity & Limits</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
