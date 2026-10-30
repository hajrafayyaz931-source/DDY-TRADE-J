import React, { useState } from 'react';
import { Trade } from '../../types/trade';
import { CandleReplayChart } from '../charts/CandleReplayChart';
import { 
  X, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  HeartHandshake, 
  BrainCircuit, 
  Image as ImageIcon,
  Share2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

import { CandleStyle } from '../../types/visuals';

interface TradeDetailModalProps {
  trade: Trade | null;
  onClose: () => void;
  onDeleteTrade: (id: string) => void;
  candleStyle?: CandleStyle;
}

export function TradeDetailModal({ trade, onClose, onDeleteTrade, candleStyle }: TradeDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'replay' | 'execution' | 'psychology' | 'reflection'>('replay');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!trade) return null;

  const isUp = trade.direction === 'CALL' || trade.direction === 'Long';
  const isWin = trade.pnl > 0;
  const isLoss = trade.pnl < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#07060A]/95 border border-[#8B5CF6]/25 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden my-6">
        {/* Top Header Card */}
        <div className="p-5 border-b border-[#8B5CF6]/20 bg-gradient-to-r from-[#0D0B14] via-[#130E20] to-[#0D0B14] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`p-2.5 rounded-xl font-bold text-sm ${
              isUp ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]' : 'bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
            }`}>
              {isUp ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{trade.symbol}</h2>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-[#140F24] border border-[#8B5CF6]/30 text-purple-200">
                  {trade.direction}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#8B5CF6]/20 text-[#C084FC] font-mono border border-[#8B5CF6]/30">
                  {trade.type === 'binary' ? `Quotex ${trade.duration || '1M'}` : (trade.assetClass || 'CFD')}
                </span>
                <span className="text-[11px] text-[#A78BFA]/70 font-mono">{trade.ticket}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#A78BFA]/70 mt-1 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {trade.date}
                </span>
                {trade.time && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {trade.time}
                  </span>
                )}
                <span>• {trade.session}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-[#A78BFA] font-bold block">
                Net Result
              </span>
              <div className={`text-2xl font-black font-mono ${isWin ? 'text-[#10B981]' : isLoss ? 'text-[#F43F5E]' : 'text-slate-300'}`}>
                {isWin ? '+' : ''}{formatCurrency(trade.pnl)}
              </div>
              {trade.rMultiple !== undefined && (
                <div className={`text-xs font-mono font-bold ${trade.rMultiple >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                  {trade.rMultiple > 0 ? '+' : ''}{trade.rMultiple.toFixed(2)}R
                </div>
              )}
            </div>

            <button onClick={onClose} className="p-2 rounded-xl text-[#A78BFA] hover:text-white hover:bg-[#8B5CF6]/20 transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-[#8B5CF6]/20 bg-[#07060A] text-xs">
          {[
            { id: 'replay', label: 'Visual Chart Replay' },
            { id: 'execution', label: 'Execution & Planning' },
            { id: 'psychology', label: 'Mindset & Discipline' },
            { id: 'reflection', label: 'Post-Trade Review & Lessons' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 font-bold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#8B5CF6] text-white shadow-[0_2px_12px_rgba(139,92,246,0.5)]'
                  : 'border-transparent text-[#A78BFA]/70 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-5">
          {activeTab === 'replay' && (
            <div className="space-y-4">
              <CandleReplayChart trade={trade} interactive={true} candleStyle={candleStyle} />

              {/* Screenshot if available */}
              {trade.screenshotUrl && (
                <div className="p-4 rounded-xl bg-[#080B12] border border-[#1E293B]">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-300">
                    <ImageIcon size={14} className="text-[#3987FF]" />
                    <span>Attached Chart Screenshot</span>
                  </div>
                  <img
                    src={trade.screenshotUrl}
                    alt="Trade Screenshot"
                    className="w-full max-h-80 object-contain rounded-lg border border-[#243346]"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'execution' && (
            <div className="space-y-4">
              {/* Numeric specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                  <span className="text-[11px] text-[#A78BFA] block font-medium">Entry Price</span>
                  <span className="text-base font-bold font-mono text-white mt-1 block">
                    {trade.entry.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                  <span className="text-[11px] text-[#A78BFA] block font-medium">Exit Settlement</span>
                  <span className="text-base font-bold font-mono text-white mt-1 block">
                    {trade.exit.toLocaleString()}
                  </span>
                </div>
                {trade.type === 'binary' ? (
                  <>
                    <div className="p-3.5 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                      <span className="text-[11px] text-[#A78BFA] block font-medium">Investment Risk</span>
                      <span className="text-base font-bold font-mono text-white mt-1 block">
                        {formatCurrency(trade.investment || trade.risk || 50)}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                      <span className="text-[11px] text-[#A78BFA] block font-medium">Payout Rate</span>
                      <span className="text-base font-bold font-mono text-[#C084FC] mt-1 block">
                        {trade.payoutPercent || 85}%
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3.5 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                      <span className="text-[11px] text-[#A78BFA] block font-medium">Stop Loss</span>
                      <span className="text-base font-bold font-mono text-[#F43F5E] mt-1 block">
                        {trade.stopLoss ? trade.stopLoss.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                      <span className="text-[11px] text-[#A78BFA] block font-medium">Size / Lots</span>
                      <span className="text-base font-bold font-mono text-white mt-1 block">
                        {trade.size || 1}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Planning Thesis */}
              <div className="p-4 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20 space-y-3">
                <div>
                  <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider block mb-1">
                    Entry Thesis & Strategy Setup
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {trade.entryReason || `Executed ${trade.strategy} during ${trade.session} session.`}
                  </p>
                </div>

                {trade.exitReason && (
                  <div>
                    <span className="text-xs font-bold text-[#A78BFA]/70 uppercase tracking-wider block mb-1">
                      Exit Execution
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {trade.exitReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'psychology' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-300">
                    <HeartHandshake size={15} className="text-[#8B5CF6]" />
                    <span>Emotional State at Entry</span>
                  </div>
                  <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-bold font-mono ${
                    trade.emotion === 'Calm' || trade.emotion === 'Disciplined' || trade.emotion === 'Confident'
                      ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                      : 'bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30'
                  }`}>
                    {trade.emotion}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-300">
                    <ShieldCheck size={15} className="text-[#10B981]" />
                    <span>Discipline & Rules Score</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-white">
                      {trade.rulesFollowed}/{trade.totalRules || 5}
                    </span>
                    <span className="text-xs text-[#A78BFA]">
                      ({Math.round((trade.rulesFollowed / (trade.totalRules || 5)) * 100)}% Adherence)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reflection' && (
            <div className="p-4 rounded-xl bg-[#0D0B14]/90 border border-[#8B5CF6]/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <BrainCircuit size={15} className="text-[#8B5CF6]" />
                <span>Trader Reflection & Lessons Learned</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {trade.notes || 'No detailed reflections recorded for this trade.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-4 border-t border-[#8B5CF6]/20 bg-[#07060A]">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#F43F5E] font-bold">Permanently delete?</span>
              <button
                onClick={() => {
                  onDeleteTrade(trade.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#F43F5E] text-white text-xs font-bold hover:bg-red-600 transition-all shadow-[0_0_12px_rgba(244,63,94,0.4)]"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2.5 py-1.5 rounded-lg bg-[#140F24] border border-[#8B5CF6]/20 text-slate-300 text-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#F43F5E] hover:bg-rose-500/10 border border-[#F43F5E]/20 transition-all flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Delete Trade</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="btn-glass-subtle px-5 py-2 rounded-xl text-white text-xs font-bold"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
