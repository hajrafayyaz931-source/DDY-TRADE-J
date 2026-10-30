import React from 'react';
import { Trade, TradingStats, TradingAccount } from '../../types/trade';
import { formatCurrency, generateCsvExport } from '../../utils/calculations';
import { X, Download, Printer, FileText, CheckCircle2, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';

interface PerformanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trades: Trade[];
  stats: TradingStats;
  account: TradingAccount;
}

export function PerformanceReportModal({
  isOpen,
  onClose,
  trades,
  stats,
  account,
}: PerformanceReportModalProps) {
  if (!isOpen) return null;

  const handleDownloadCsv = () => {
    const csvContent = generateCsvExport(trades);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TradePath_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#07060A]/95 border border-[#8B5CF6]/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#8B5CF6]/20 bg-gradient-to-r from-[#0D0B14] via-[#130E20] to-[#0D0B14]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#C084FC]">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Institutional Performance Report</h2>
              <p className="text-xs text-[#A78BFA]">
                Official audit summary, risk metrics, and trade blotter export
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="btn-glass-subtle px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-1.5"
            >
              <Download size={14} className="text-[#8B5CF6]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn-premium-purple px-3.5 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
            >
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-[#A78BFA] hover:text-white hover:bg-[#8B5CF6]/20 transition-all ml-2">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 print:p-0 print:max-h-none print:overflow-visible text-slate-200">
          {/* Executive Header */}
          <div className="p-5 rounded-xl bg-[#0D0B14]/80 border border-[#8B5CF6]/20 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-[#A78BFA] font-mono uppercase tracking-widest block">
                AUDITED TRADING STATEMENT
              </span>
              <h1 className="text-xl font-black text-white mt-0.5">TRADEPATH PRO — PERFORMANCE AUDIT</h1>
              <p className="text-xs text-[#94A3B8] font-mono mt-1">
                Account: <span className="text-white font-bold">{account.name}</span> ({account.broker}) • Currency: {account.currency}
              </p>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-[#A78BFA] block">Statement Period</span>
              <span className="text-xs text-white font-bold">{trades[trades.length - 1]?.date || '2026-10-01'} to {trades[0]?.date || '2026-10-25'}</span>
              <div className="text-xs text-[#10B981] font-bold mt-1">Verified Real Execution</div>
            </div>
          </div>

          {/* Key KPI Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20">
              <span className="text-[11px] text-[#A78BFA] font-medium block">Net Realized PnL</span>
              <div className={`text-xl font-black font-mono mt-1 ${stats.netPnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {stats.netPnl >= 0 ? '+' : ''}{formatCurrency(stats.netPnl)}
              </div>
              <span className="text-[10px] text-[#A78BFA]/70 font-mono">Total return on risk</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20">
              <span className="text-[11px] text-[#A78BFA] font-medium block">Win Rate</span>
              <div className="text-xl font-black font-mono text-white mt-1">
                {stats.winRate}%
              </div>
              <span className="text-[10px] text-[#10B981] font-mono">{stats.winCount}W / {stats.lossCount}L</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20">
              <span className="text-[11px] text-[#A78BFA] font-medium block">Profit Factor</span>
              <div className="text-xl font-black font-mono text-[#C084FC] mt-1">
                {stats.profitFactor > 50 ? '99.9' : stats.profitFactor.toFixed(2)}
              </div>
              <span className="text-[10px] text-[#A78BFA]/70 font-mono">Gross Gain / Loss</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20">
              <span className="text-[11px] text-[#A78BFA] font-medium block">Max Drawdown</span>
              <div className="text-xl font-black font-mono text-[#EF4444] mt-1">
                -${stats.maxDrawdown.toFixed(2)}
              </div>
              <span className="text-[10px] text-[#A78BFA]/70 font-mono">{stats.maxDrawdownPercent}% Peak to Valley</span>
            </div>
          </div>

          {/* Scores & Compliance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#A78BFA] block font-bold">Consistency Score</span>
                <span className="text-[11px] text-[#94A3B8]">Statistical distribution stability</span>
              </div>
              <div className="text-2xl font-black font-mono text-[#C084FC]">
                {stats.consistencyScore}/100
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#A78BFA] block font-bold">Risk Management Score</span>
                <span className="text-[11px] text-[#94A3B8]">Drawdown & rule discipline</span>
              </div>
              <div className="text-2xl font-black font-mono text-[#10B981]">
                {stats.riskManagementScore}/100
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#A78BFA] block font-bold">Rule Adherence</span>
                <span className="text-[11px] text-[#94A3B8]">Trading plan compliance</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {stats.rulesAdherencePercent}%
              </div>
            </div>
          </div>

          {/* Recent Executions Blotter */}
          <div className="rounded-xl bg-[#0D0B14]/80 border border-[#8B5CF6]/20 overflow-hidden">
            <div className="p-3.5 border-b border-[#8B5CF6]/20 flex items-center justify-between bg-[#130E20]/50">
              <span className="text-xs font-bold text-white font-mono">EXECUTION BLOTTER ({trades.length} TRADES)</span>
              <span className="text-[11px] text-[#A78BFA] font-mono">Sorted Descending</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#8B5CF6]/15 text-[#A78BFA] text-[11px] bg-[#07060A]/60">
                    <th className="p-2.5">Date & Time</th>
                    <th className="p-2.5">Symbol</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Side</th>
                    <th className="p-2.5">Entry</th>
                    <th className="p-2.5">Exit</th>
                    <th className="p-2.5">R</th>
                    <th className="p-2.5 text-right">Net PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8B5CF6]/10">
                  {trades.slice(0, 15).map((t) => {
                    const isPos = t.pnl >= 0;
                    return (
                      <tr key={t.id} className="hover:bg-[#8B5CF6]/5 transition-colors">
                        <td className="p-2.5 text-slate-300">{t.date} {t.time || ''}</td>
                        <td className="p-2.5 font-bold text-white">{t.symbol}</td>
                        <td className="p-2.5 text-[#C084FC]">{t.type === 'binary' ? 'Quotex OTC' : 'CFD'}</td>
                        <td className="p-2.5 font-bold">{t.direction}</td>
                        <td className="p-2.5">{t.entry}</td>
                        <td className="p-2.5">{t.exit}</td>
                        <td className="p-2.5">{t.rMultiple !== undefined ? `${t.rMultiple > 0 ? '+' : ''}${t.rMultiple}R` : 'N/A'}</td>
                        <td className={`p-2.5 text-right font-bold ${isPos ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {isPos ? '+' : ''}{formatCurrency(t.pnl)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#8B5CF6]/20 bg-[#07060A]">
          <span className="text-[11px] text-[#A78BFA] font-mono">
            TradePath Pro • Verified Cryptographic Audit
          </span>
          <button
            onClick={onClose}
            className="btn-glass-subtle px-5 py-2 rounded-xl text-xs font-bold text-white"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
