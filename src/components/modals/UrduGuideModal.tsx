import React from 'react';
import { X, HelpCircle, CheckCircle2, AlertTriangle, Play, Sparkles, BookOpen } from 'lucide-react';

interface UrduGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UrduGuideModal({ isOpen, onClose }: UrduGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0D131D] border border-[#243346] rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-[#1E293B] bg-[#101722] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#9875FF]/20 border border-[#9875FF]/40 flex items-center justify-center text-[#9875FF]">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Quotex Visual Journal – Roman Urdu & English Guide</h2>
              <p className="text-xs text-[#8492A6]">
                Quotex traders ke liye automated visual trading journal ka mukammal tareeqa
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8492A6] hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto text-xs leading-relaxed text-slate-300">
          {/* Step 1: Quotex Auto-Import */}
          <div className="p-4 rounded-xl bg-[#080B12] border border-[#1E293B] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#3987FF] text-sm">
              <Sparkles size={16} />
              <span>1. Quotex se Trades Auto-Import Kaise Karein? (Copy / Paste)</span>
            </div>
            <p>
              TradePath Pro mein aap ko manually har trade likhne ki zaroorat nahi hai:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#8492A6]">
              <li>Quotex platform par ja kar apni <strong>Trade History</strong> table kholein.</li>
              <li>Rows ko mouse se select kar ke <code className="text-white">Ctrl + C</code> (Copy) karein.</li>
              <li>TradePath Pro ke top par <strong>"Auto Import"</strong> button dabayein aur text box mein paste kar dein.</li>
              <li>Hamara smart parser automatically <strong>Asset, CALL / PUT, Investment, Strike Price, Settlement Price, aur Payout%</strong> detect kar leta hai!</li>
            </ul>
          </div>

          {/* Step 2: High Visualization & Candlestick Replay */}
          <div className="p-4 rounded-xl bg-[#080B12] border border-[#1E293B] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#00D6A0] text-sm">
              <Play size={16} />
              <span>2. High Visuals & Candlestick Replay Kaise Dekhein?</span>
            </div>
            <p>
              Kisi bhi trade par click karne se us ka <strong>Interactive Candlestick Replay</strong> khul jata hai:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#8492A6]">
              <li><strong>Entry Point:</strong> Strike price par horizontal blue line aur Green UP / Red DOWN marker nazar aayega.</li>
              <li><strong>Trade Replay Slider:</strong> Aap <code className="text-white">Replay Trade</code> button daba kar candle ko tick-by-tick bante huye live dekh sakte hain!</li>
              <li><strong>Result Glow:</strong> Agar ITM (In The Money) hua to Green Glow aayegi, agar OTM hua to Red.</li>
            </ul>
          </div>

          {/* Step 3: Risk Management & Martingale Warning */}
          <div className="p-4 rounded-xl bg-[#080B12] border border-[#1E293B] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#FF5268] text-sm">
              <AlertTriangle size={16} />
              <span>3. Money Management & Martingale Calculator</span>
            </div>
            <p>
              Quotex binary options mein 95% log Martingale (har loss ke baad size double karna) ki wajah se account blow karte hain.
            </p>
            <p className="text-slate-300">
              TradePath ke <strong>"Risk & Sizing Engine"</strong> tab mein hum ne Martingale Simulator banaya hai jo aap ko dikhata hai ke 4 consecutive losses ke baad risk of ruin kitna barh jata hai. Recommended yehi hai ke aap <strong>Fixed 1% - 2% compounding</strong> model use karein.
            </p>
          </div>

          {/* Step 4: Rules & Discipline */}
          <div className="p-4 rounded-xl bg-[#080B12] border border-[#1E293B] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#9875FF] text-sm">
              <CheckCircle2 size={16} />
              <span>4. AI Performance Coach & Rules Checklist</span>
            </div>
            <p>
              TradePath Pro ka <strong>AI Intelligence Coach</strong> aap ke journal ko analyze karta hai aur batata hai ke:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#8492A6]">
              <li>Kaunsa OTC pair aap ko sab se zyada profit de raha hai (e.g. EUR/USD OTC ya Gold OTC).</li>
              <li>FOMO aur Revenge trading ki wajah se aap ka kitna dollar loss hua.</li>
              <li>Jab aap 5/5 trading rules follow karte hain to aap ka win rate kitna barh jata hai.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-[#1E293B] bg-[#101722]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#3987FF] hover:bg-[#2F74DE] text-white text-xs font-bold transition-all"
          >
            Samajh Gaya (Got it)
          </button>
        </div>
      </div>
    </div>
  );
}
