import React, { useState, useEffect } from 'react';
import { Trade, TradeType, BinaryDirection, CfdDirection, TradeEmotion, TradingAccount, RuleItem, TradingSession, AssetClass } from '../../types/trade';
import { calculateBinaryTrade, calculateCfdTrade, formatCurrency } from '../../utils/calculations';
import { X, Check, ArrowUpRight, ArrowDownRight, Upload, Sparkles, AlertCircle, Clock, Zap, Target, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LogTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (trade: Trade) => void;
  accounts: TradingAccount[];
  rules: RuleItem[];
  defaultAccountId: string;
}

const QUOTEX_OTC_PAIRS = [
  'EUR/USD (OTC)',
  'GBP/USD (OTC)',
  'USD/JPY (OTC)',
  'AUD/USD (OTC)',
  'AUD/CAD (OTC)',
  'NZD/USD (OTC)',
  'USD/PKR (OTC)',
  'USD/BDT (OTC)',
  'USD/INR (OTC)',
  'Gold (OTC)',
];

const QUOTEX_LIVE_PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'AUD/USD',
  'USD/CAD',
  'USD/CHF',
  'EUR/GBP',
  'EUR/JPY',
];

const DURATION_PRESETS = ['5S', '10S', '30S', '1M', '2M', '3M', '5M', '15M'];
const INVESTMENT_PRESETS = [5, 10, 15, 20, 50, 100];
const PAYOUT_PRESETS = [90, 88, 87, 85, 82, 80];

export function LogTradeModal({
  isOpen,
  onClose,
  onSaveTrade,
  accounts,
  rules,
  defaultAccountId,
}: LogTradeModalProps) {
  const [tradeCategory, setTradeCategory] = useState<'otc' | 'live'>('otc');
  const [accountId, setAccountId] = useState<string>(defaultAccountId || accounts[0]?.id || 'acc-quotex-live');
  
  // Quotex Trade Form state
  const [symbol, setSymbol] = useState<string>('EUR/USD (OTC)');
  const [direction, setDirection] = useState<BinaryDirection>('CALL'); // CALL = UP, PUT = DOWN
  const [investment, setInvestment] = useState<string>('15');
  const [payoutPercent, setPayoutPercent] = useState<number>(90);
  const [duration, setDuration] = useState<string>('5M');
  const [entryPrice, setEntryPrice] = useState<string>('0.70177');
  const [exitPrice, setExitPrice] = useState<string>('0.70202');
  
  // Direct outcome override mode (ITM = Win, OTM = Loss, ATM = Tie)
  const [outcomeMode, setOutcomeMode] = useState<'auto' | 'ITM' | 'OTM' | 'ATM'>('auto');

  // Qualitative & Psychology state
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [session, setSession] = useState<TradingSession>('OTC Weekend');
  const [strategy, setStrategy] = useState('Support Bounce & Retest');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Reversal']);
  const [emotion, setEmotion] = useState<TradeEmotion>('Calm');
  const [notes, setNotes] = useState('');
  const [screenshot, setScreenshot] = useState<string>('');

  const AVAILABLE_TAGS = ['Support Bounce', 'Resistance Retest', 'Price Action', '1M Scalp', '5M Expiration', 'Breakout', 'Key Level'];

  const toggleTag = (t: string) => {
    setSelectedTags(prev => prev.includes(t) ? prev.filter(tag => tag !== t) : [...prev, t]);
  };

  // Sync symbol list when switching category
  useEffect(() => {
    if (tradeCategory === 'otc') {
      setSymbol('EUR/USD (OTC)');
      setSession('OTC Weekend');
    } else {
      setSymbol('EUR/USD');
      setSession('London');
    }
  }, [tradeCategory]);

  // Checklist state
  const activeRules = rules.filter(r => r.active);
  const [checkedRules, setCheckedRules] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    activeRules.forEach(r => { init[r.id] = true; });
    return init;
  });

  if (!isOpen) return null;

  // Real-time calculation
  const invNumber = parseFloat(investment) || 0;
  const entryNum = parseFloat(entryPrice) || 0;
  const exitNum = parseFloat(exitPrice) || 0;

  let calculatedPnl = 0;
  let finalOutcome: 'ITM' | 'OTM' | 'ATM' = 'ITM';

  if (outcomeMode === 'ITM') {
    calculatedPnl = invNumber * (payoutPercent / 100);
    finalOutcome = 'ITM';
  } else if (outcomeMode === 'OTM') {
    calculatedPnl = -invNumber;
    finalOutcome = 'OTM';
  } else if (outcomeMode === 'ATM') {
    calculatedPnl = 0;
    finalOutcome = 'ATM';
  } else {
    // Auto calculation from prices
    const calc = calculateBinaryTrade(invNumber, payoutPercent, direction, entryNum, exitNum);
    calculatedPnl = calc.pnl;
    finalOutcome = calc.result;
  }

  // Price difference points
  const priceDifference = Math.abs(Math.round((exitNum - entryNum) * 100000));

  const followedCount = Object.values(checkedRules).filter(Boolean).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const assetClass: AssetClass = tradeCategory === 'otc' ? 'Quotex OTC Pairs' : 'Quotex Live Forex Pairs';

    const newTrade: Trade = {
      id: `tr-qx-${Date.now()}`,
      ticket: `#qx-${Math.random().toString(36).substring(2, 9)}`,
      accountId,
      type: 'binary',
      date,
      time,
      symbol,
      assetClass,
      direction,
      investment: invNumber,
      payoutPercent,
      duration,
      entry: entryNum || 1.0,
      exit: exitNum || 1.0,
      pnl: calculatedPnl,
      risk: invNumber,
      rMultiple: invNumber > 0 ? calculatedPnl / invNumber : 0,
      result: finalOutcome,
      holdingDuration: duration,
      strategy,
      timeframe: duration,
      session,
      emotion,
      rulesFollowed: followedCount,
      totalRules: activeRules.length || 5,
      tags: selectedTags,
      entryReason: `Quotex Expiration: ${duration} on ${symbol}. Open: ${entryNum}, Close: ${exitNum}.`,
      notes,
      beforeScreenshot: screenshot,
    };

    if (calculatedPnl > 0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#6EE7B7', '#8B5CF6'],
      });
    }

    onSaveTrade(newTrade);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#07060A] border border-[#8B5CF6]/35 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#8B5CF6]/20 bg-[#0D0B14] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#C084FC] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]">
              <div className="w-full h-full bg-[#07060A] rounded-[14px] flex items-center justify-center text-[#C084FC] font-black text-xs">
                QX
              </div>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Log Quotex Trade Execution</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 font-mono font-bold">
                  FIXED TIME EXPIRATION
                </span>
              </h2>
              <p className="text-xs text-[#A78BFA]">
                Instant trade logger for Quotex OTC & Live Forex pairs
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#A78BFA] hover:text-white hover:bg-[#1C1536]">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs font-mono">
          {/* Pair Category Switcher: OTC vs Live Forex */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#0D0B14] border border-[#8B5CF6]/25">
            <button
              type="button"
              onClick={() => setTradeCategory('otc')}
              className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                tradeCategory === 'otc'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#C084FC] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                  : 'text-[#A78BFA] hover:text-white'
              }`}
            >
              <Zap size={14} />
              <span>Quotex OTC Pairs</span>
            </button>

            <button
              type="button"
              onClick={() => setTradeCategory('live')}
              className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                tradeCategory === 'live'
                  ? 'bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#07060A] shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'text-[#A78BFA] hover:text-white'
              }`}
            >
              <Clock size={14} />
              <span>Quotex Live Forex Pairs</span>
            </button>
          </div>

          {/* Account & Symbol Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#A78BFA] block text-[10px] uppercase font-bold mb-1">
                Trading Portfolio Account:
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-[#0D0B14] border border-[#8B5CF6]/30 rounded-xl px-3 py-2 text-white font-bold outline-none"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} className="bg-[#07060A]">
                    {acc.name} ({acc.broker})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[#A78BFA] block text-[10px] uppercase font-bold mb-1">
                Trade Asset Pair:
              </label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-[#0D0B14] border border-[#8B5CF6]/30 rounded-xl px-3 py-2 text-white font-bold outline-none"
              >
                {(tradeCategory === 'otc' ? QUOTEX_OTC_PAIRS : QUOTEX_LIVE_PAIRS).map(p => (
                  <option key={p} value={p} className="bg-[#07060A]">
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quotex Direction: UP (Buy / CALL) vs DOWN (Sell / PUT) */}
          <div className="space-y-1.5">
            <label className="text-[#A78BFA] block text-[10px] uppercase font-bold">
              Trade Direction:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDirection('CALL')}
                className={`py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border transition-all ${
                  direction === 'CALL'
                    ? 'bg-[#10B981] text-white border-[#34D399] shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-102'
                    : 'bg-[#0D0B14] text-[#10B981] border-[#10B981]/30 hover:border-[#10B981]'
                }`}
              >
                <ArrowUpRight size={18} />
                <span>UP / BUY (CALL 🟢)</span>
              </button>

              <button
                type="button"
                onClick={() => setDirection('PUT')}
                className={`py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border transition-all ${
                  direction === 'PUT'
                    ? 'bg-[#EF4444] text-white border-[#F87171] shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-102'
                    : 'bg-[#0D0B14] text-[#EF4444] border-[#EF4444]/30 hover:border-[#EF4444]'
                }`}
              >
                <ArrowDownRight size={18} />
                <span>DOWN / SELL (PUT 🔴)</span>
              </button>
            </div>
          </div>

          {/* Quotex Investment ($) & Quick Presets */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-[#0D0B14] border border-[#8B5CF6]/20">
            <div className="flex items-center justify-between">
              <label className="text-[#A78BFA] text-[10px] uppercase font-bold flex items-center gap-1">
                <DollarSign size={13} className="text-[#10B981]" />
                Investment Amount ($):
              </label>
              <span className="text-white font-bold">${invNumber.toFixed(2)} USD</span>
            </div>

            <input
              type="number"
              min="1"
              step="1"
              value={investment}
              onChange={(e) => setInvestment(e.target.value)}
              className="w-full bg-[#07060A] border border-[#8B5CF6]/30 rounded-xl px-3 py-2 text-white font-bold text-base outline-none focus:border-[#C084FC]"
            />

            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
              <span className="text-[10px] text-[#A78BFA]">Presets:</span>
              {INVESTMENT_PRESETS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setInvestment(String(amt))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    invNumber === amt
                      ? 'bg-[#8B5CF6] text-white shadow-[0_0_8px_rgba(139,92,246,0.5)]'
                      : 'bg-[#07060A] text-[#A78BFA] border border-[#8B5CF6]/20 hover:text-white'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Quotex Payout % & Expiration Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Payout % */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-[#0D0B14] border border-[#8B5CF6]/20">
              <label className="text-[#A78BFA] text-[10px] uppercase font-bold block">
                Quotex Payout (%):
              </label>
              <select
                value={payoutPercent}
                onChange={(e) => setPayoutPercent(Number(e.target.value))}
                className="w-full bg-[#07060A] border border-[#8B5CF6]/30 rounded-xl px-3 py-2 text-white font-bold outline-none"
              >
                {PAYOUT_PRESETS.map((p) => (
                  <option key={p} value={p} className="bg-[#07060A]">
                    {p}% Payout Rate
                  </option>
                ))}
              </select>
            </div>

            {/* Time Expiration */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-[#0D0B14] border border-[#8B5CF6]/20">
              <label className="text-[#A78BFA] text-[10px] uppercase font-bold block">
                Expiration Duration:
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-[#07060A] border border-[#8B5CF6]/30 rounded-xl px-3 py-2 text-white font-bold outline-none"
              >
                {DURATION_PRESETS.map((d) => (
                  <option key={d} value={d} className="bg-[#07060A]">
                    {d} Expiration
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 1-CLICK TRADE OUTCOME SELECTOR (ITM / OTM / ATM) */}
          <div className="p-4 rounded-2xl bg-[#0D0B14] border border-[#8B5CF6]/30 space-y-2">
            <label className="text-[#A78BFA] text-[10px] uppercase font-bold block flex items-center justify-between">
              <span>Trade Outcome / Result:</span>
              <span className="text-[#10B981] font-mono font-bold">1-Click Selection</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setOutcomeMode('ITM')}
                className={`py-2.5 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1 border transition-all ${
                  finalOutcome === 'ITM' && outcomeMode === 'ITM'
                    ? 'bg-[#10B981] text-white border-[#34D399] shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-102'
                    : 'bg-[#07060A] text-[#10B981] border-[#10B981]/30 hover:border-[#10B981]'
                }`}
              >
                <span>🟢 ITM (WIN)</span>
                <span className="text-[10px] font-mono">+{formatCurrency(invNumber * (payoutPercent / 100))}</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcomeMode('OTM')}
                className={`py-2.5 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1 border transition-all ${
                  finalOutcome === 'OTM' && outcomeMode === 'OTM'
                    ? 'bg-[#EF4444] text-white border-[#F87171] shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-102'
                    : 'bg-[#07060A] text-[#EF4444] border-[#EF4444]/30 hover:border-[#EF4444]'
                }`}
              >
                <span>🔴 OTM (LOSS)</span>
                <span className="text-[10px] font-mono">-{formatCurrency(invNumber)}</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcomeMode('ATM')}
                className={`py-2.5 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1 border transition-all ${
                  finalOutcome === 'ATM' && outcomeMode === 'ATM'
                    ? 'bg-slate-700 text-white border-slate-500 shadow-[0_0_15px_rgba(148,163,184,0.3)] scale-102'
                    : 'bg-[#07060A] text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                <span>⚪ ATM (TIE)</span>
                <span className="text-[10px] font-mono">$0.00 Refund</span>
              </button>
            </div>
          </div>

          {/* Open & Close Price (Optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#A78BFA] block text-[10px] uppercase font-bold mb-1">
                Open Price:
              </label>
              <input
                type="text"
                value={entryPrice}
                onChange={(e) => {
                  setEntryPrice(e.target.value);
                  setOutcomeMode('auto');
                }}
                className="w-full bg-[#0D0B14] border border-[#8B5CF6]/30 rounded-xl px-3 py-2 text-white font-bold outline-none"
              />
            </div>

            <div>
              <label className="text-[#A78BFA] block text-[10px] uppercase font-bold mb-1">
                Close Price:
              </label>
              <input
                type="text"
                value={exitPrice}
                onChange={(e) => {
                  setExitPrice(e.target.value);
                  setOutcomeMode('auto');
                }}
                className="w-full bg-[#0D0B14] border border-[#8B5CF6]/30 rounded-xl px-3 py-2 text-white font-bold outline-none"
              />
            </div>
          </div>

          {/* Strategy & Emotion */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#A78BFA] block text-[10px] uppercase font-bold mb-1">
                Strategy Used:
              </label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full bg-[#0D0B14] border border-[#8B5CF6]/30 rounded-xl px-3 py-2 text-white font-bold outline-none"
              >
                <option value="Support Bounce & Retest" className="bg-[#07060A]">Support Bounce & Retest</option>
                <option value="Resistance Retest Reversal" className="bg-[#07060A]">Resistance Retest Reversal</option>
                <option value="Quick Momentum Scalp" className="bg-[#07060A]">Quick Momentum Scalp</option>
                <option value="Price Action Reversal" className="bg-[#07060A]">Price Action Reversal</option>
                <option value="Trend Following" className="bg-[#07060A]">Trend Following</option>
              </select>
            </div>

            <div>
              <label className="text-[#A78BFA] block text-[10px] uppercase font-bold mb-1">
                Emotional Mindset:
              </label>
              <select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value as TradeEmotion)}
                className="w-full bg-[#0D0B14] border border-[#8B5CF6]/30 rounded-xl px-3 py-2 text-white font-bold outline-none"
              >
                <option value="Calm" className="bg-[#07060A]">Calm 😌</option>
                <option value="Confident" className="bg-[#07060A]">Confident 😎</option>
                <option value="Disciplined" className="bg-[#07060A]">Disciplined 🎯</option>
                <option value="FOMO" className="bg-[#07060A]">FOMO ⚡</option>
                <option value="Revenge" className="bg-[#07060A]">Revenge 😡</option>
                <option value="Impatient" className="bg-[#07060A]">Impatient ⏳</option>
              </select>
            </div>
          </div>

          {/* Trade Notes */}
          <div>
            <label className="text-[#A78BFA] block text-[10px] uppercase font-bold mb-1">
              Execution Notes:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Clean 1M rejection wick at key support level. Followed compounding plan step..."
              rows={2}
              className="w-full bg-[#0D0B14] border border-[#8B5CF6]/30 rounded-xl p-3 text-white text-xs outline-none focus:border-[#C084FC]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#8B5CF6]/20 bg-[#0D0B14] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#A78BFA] font-mono block">Calculated Result PnL:</span>
            <span className={`text-base font-black font-mono ${calculatedPnl > 0 ? 'text-[#10B981]' : calculatedPnl < 0 ? 'text-[#EF4444]' : 'text-slate-300'}`}>
              {calculatedPnl > 0 ? '+' : ''}{formatCurrency(calculatedPnl)} ({finalOutcome})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#07060A] text-[#A78BFA] border border-[#8B5CF6]/25 text-xs font-bold hover:text-white"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="btn-premium-purple px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-[0_0_16px_rgba(139,92,246,0.5)]"
            >
              <Check size={16} />
              <span>Log Trade into Journal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
