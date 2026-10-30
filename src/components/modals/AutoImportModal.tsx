import React, { useState } from 'react';
import { Trade } from '../../types/trade';
import { parseTradeText, ParseResult } from '../../utils/quotexParser';
import { X, Download, FileSpreadsheet, ClipboardCopy, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';
import confetti from 'canvas-confetti';

interface AutoImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTrades: (trades: Trade[]) => void;
}

export function AutoImportModal({ isOpen, onClose, onImportTrades }: AutoImportModalProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'file' | 'demo'>('paste');
  const [pasteContent, setPasteContent] = useState('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  if (!isOpen) return null;

  const handleParse = (textToParse: string) => {
    const res = parseTradeText(textToParse);
    setParseResult(res);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setPasteContent(text);
        handleParse(text);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadQuotexDemo = () => {
    const sampleQuotexText = `Ticket\tDate\tAsset\tDirection\tInvestment\tOpen\tClose\tProfit\tPayout
#8941028\t2026-10-28 14:32:00\tEUR/USD (OTC)\tUP\t$50.00\t1.08450\t1.08482\t+$43.50\t87%
#8941029\t2026-10-28 14:45:00\tGold (OTC)\tUP\t$100.00\t2734.20\t2738.60\t+$90.00\t90%
#8941030\t2026-10-28 15:10:00\tUSD/JPY (OTC)\tDOWN\t$50.00\t152.400\t152.440\t-$50.00\t85%
#8941031\t2026-10-28 15:25:00\tGBP/USD (OTC)\tUP\t$75.00\t1.29800\t1.29835\t+$64.50\t86%
#8941032\t2026-10-28 15:40:00\tEUR/USD (OTC)\tDOWN\t$60.00\t1.08620\t1.08585\t+$52.20\t87%`;
    setPasteContent(sampleQuotexText);
    handleParse(sampleQuotexText);
  };

  const handleLoadTradePathCsvDemo = () => {
    const sampleTradePathCsv = `"Date","Symbol","Side","Entry","Exit","Stop","Size","PnL","Risk","R Multiple","Strategy","Emotion","Rules followed"
"2026-10-25","BTCUSDT","Long","67120","68240","66500","0.08","89.6","49.6","1.81","Breakout retest","Calm","5/5"
"2026-10-24","ES","Short","6842.5","6850.25","6852","2","-15.5","19","-0.82","Liquidity sweep","FOMO","3/5"
"2026-10-23","ETHUSDT","Long","2480","2532","2450","0.5","26","15","1.73","Trend continuation","Confident","4/5"
"2026-10-22","NQ","Short","25180","25230","25235","1","-50","55","-0.91","Liquidity sweep","Revenge","2/5"
"2026-10-21","BTCUSDT","Long","65800","67150","65000","0.04","54","32","1.69","Breakout retest","Calm","5/5"`;
    setPasteContent(sampleTradePathCsv);
    handleParse(sampleTradePathCsv);
  };

  const handleConfirmImport = () => {
    if (parseResult && parseResult.trades.length > 0) {
      onImportTrades(parseResult.trades);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3987FF', '#00D6A0', '#9875FF'],
        });
      } catch (e) {}
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0D131D] border border-[#243346] rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-[#1E293B] bg-[#101722] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3987FF]/20 border border-[#3987FF]/40 flex items-center justify-center text-[#3987FF]">
              <Download size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Quotex & CSV Auto-Importer</h2>
              <p className="text-xs text-[#8492A6]">
                Paste Quotex trade history clipboard rows or upload standard TradePath CSV
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8492A6] hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-2 p-3 bg-[#0A0E17] border-b border-[#1E293B] text-xs">
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'paste'
                ? 'bg-[#3987FF] text-white shadow-[0_0_12px_rgba(57,135,255,0.4)]'
                : 'text-[#8492A6] hover:text-white'
            }`}
          >
            <ClipboardCopy size={14} /> Quick Paste (Quotex / Raw Text)
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'file'
                ? 'bg-[#3987FF] text-white shadow-[0_0_12px_rgba(57,135,255,0.4)]'
                : 'text-[#8492A6] hover:text-white'
            }`}
          >
            <FileSpreadsheet size={14} /> Upload CSV File
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'demo'
                ? 'bg-[#9875FF] text-white'
                : 'text-[#9875FF] hover:bg-[#9875FF]/15'
            }`}
          >
            <Sparkles size={14} /> 1-Click Samples
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'paste' && (
            <div>
              <label className="text-xs text-[#8492A6] block mb-1 font-medium">
                Paste copied rows from Quotex or CSV text:
              </label>
              <textarea
                value={pasteContent}
                onChange={(e) => {
                  setPasteContent(e.target.value);
                  handleParse(e.target.value);
                }}
                placeholder="Example Quotex copy:&#10;2026-10-28 14:32:00 EUR/USD (OTC) UP $50.00 1.08450 1.08482 +$43.50 87%&#10;&#10;Or paste CSV table rows here..."
                rows={6}
                className="w-full bg-[#080B12] border border-[#222E40] rounded-xl p-3 text-xs font-mono text-white outline-none resize-none"
              />
            </div>
          )}

          {activeTab === 'file' && (
            <div className="p-8 border-2 border-dashed border-[#243346] rounded-2xl flex flex-col items-center justify-center text-center bg-[#080B12]">
              <FileSpreadsheet size={36} className="text-[#3987FF] mb-2" />
              <span className="text-xs font-bold text-white">Select a CSV File</span>
              <p className="text-[11px] text-[#8492A6] mt-1 max-w-sm">
                Compatible with <code className="text-slate-300">tradepath-journal.csv</code>, Quotex broker exports, MT4/MT5, or generic trade spreadsheets.
              </p>
              <label className="mt-4 px-4 py-2 rounded-xl bg-[#3987FF] hover:bg-[#2F74DE] text-white text-xs font-bold cursor-pointer transition-all">
                Choose CSV File
                <input type="file" accept=".csv,text/csv" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleLoadQuotexDemo}
                className="p-4 rounded-xl bg-[#101722] hover:bg-[#151D2A] border border-[#9875FF]/40 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#9875FF] mb-1">
                  <Sparkles size={14} /> Quotex OTC Binary Session
                </div>
                <p className="text-[11px] text-[#8492A6]">
                  5 realistic 1M binary option trades on EUR/USD OTC, Gold OTC with 87-90% payout.
                </p>
              </button>

              <button
                onClick={handleLoadTradePathCsvDemo}
                className="p-4 rounded-xl bg-[#101722] hover:bg-[#151D2A] border border-[#3987FF]/40 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#3987FF] mb-1">
                  <FileSpreadsheet size={14} /> User Attachment CSV
                </div>
                <p className="text-[11px] text-[#8492A6]">
                  Load original trades from <code className="text-slate-300">tradepath-journal__1.csv</code> (BTC, ES, NQ, ETH).
                </p>
              </button>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parseResult && parseResult.trades.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#1E293B]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#00D6A0] flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Detected {parseResult.trades.length} Valid Trade(s)
                </span>
                <span className="text-[#8492A6] font-mono">
                  Source: {parseResult.sourceType}
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-[#1E293B] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B1017] text-[#8492A6] text-[10px] font-mono uppercase">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Symbol</th>
                      <th className="p-2">Direction</th>
                      <th className="p-2">Entry → Exit</th>
                      <th className="p-2 text-right">PnL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {parseResult.trades.map((t, i) => (
                      <tr key={i} className="hover:bg-[#182333]">
                        <td className="p-2 font-mono text-[#8492A6]">{t.date}</td>
                        <td className="p-2 font-bold text-white">{t.symbol}</td>
                        <td className="p-2 font-mono">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.direction === 'CALL' || t.direction === 'Long'
                              ? 'bg-[#00D6A0]/15 text-[#00D6A0]'
                              : 'bg-[#FF5268]/15 text-[#FF5268]'
                          }`}>
                            {t.direction}
                          </span>
                        </td>
                        <td className="p-2 font-mono text-[#8492A6]">
                          {t.entry} → {t.exit}
                        </td>
                        <td className={`p-2 text-right font-mono font-bold ${t.pnl >= 0 ? 'text-[#00D6A0]' : 'text-[#FF5268]'}`}>
                          {t.pnl >= 0 ? '+' : ''}{formatCurrency(t.pnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {parseResult && parseResult.trades.length === 0 && pasteContent && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>No trade rows could be detected. Check input format or try the 1-Click Samples.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#1E293B] bg-[#101722]">
          <span className="text-xs text-[#8492A6]">
            Trades are added to your active journal automatically
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8492A6] hover:text-white"
            >
              Cancel
            </button>
            <button
              disabled={!parseResult || parseResult.trades.length === 0}
              onClick={handleConfirmImport}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                parseResult && parseResult.trades.length > 0
                  ? 'bg-[#00D6A0] hover:bg-[#00BD8C] text-[#080B12] shadow-[0_0_15px_rgba(0,214,160,0.4)]'
                  : 'bg-[#182333] text-[#64748B] cursor-not-allowed'
              }`}
            >
              <Download size={14} />
              <span>Import {parseResult?.trades.length || 0} Trades</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
