import React, { useState } from 'react';
import { Calculator, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { formatCurrency, simulateMartingale } from '../../utils/calculations';
import { LossRecoveryPlanner } from '../ui/LossRecoveryPlanner';

export function RiskCalculatorView() {
  const [activeCalculator, setActiveCalculator] = useState<'binary' | 'recovery' | 'cfd'>('binary');

  // Forex Calculator State
  const [balance, setBalance] = useState<number>(1000);
  const [riskPercent, setRiskPercent] = useState<number>(2.0);
  const [entryPrice, setEntryPrice] = useState<number>(1.0850);
  const [stopPrice, setStopPrice] = useState<number>(1.0825);
  const [targetPrice, setTargetPrice] = useState<number>(1.0910);
  const [pointValue, setPointValue] = useState<number>(100000); // EURUSD
  const [assetPreset, setAssetPreset] = useState<'EURUSD' | 'GBPUSD' | 'USDJPY' | 'AUDUSD' | 'CUSTOM'>('EURUSD');

  // Binary Options / Quotex Martingale State
  const [initialBet, setInitialBet] = useState<number>(15);
  const [payoutRate, setPayoutRate] = useState<number>(90);
  const [multiplier, setMultiplier] = useState<number>(2.2);
  const [martingaleSteps, setMartingaleSteps] = useState<number>(5);

  // Asset preset helper
  const handlePresetChange = (preset: 'EURUSD' | 'GBPUSD' | 'USDJPY' | 'AUDUSD' | 'CUSTOM') => {
    setAssetPreset(preset as any);
    if (preset === 'EURUSD') {
      setEntryPrice(1.0850);
      setStopPrice(1.0825);
      setTargetPrice(1.0910);
      setPointValue(100000);
    } else if (preset === 'GBPUSD') {
      setEntryPrice(1.2980);
      setStopPrice(1.2950);
      setTargetPrice(1.3040);
      setPointValue(100000);
    } else if (preset === 'USDJPY') {
      setEntryPrice(152.40);
      setStopPrice(152.10);
      setTargetPrice(153.00);
      setPointValue(1000);
    } else if (preset === 'AUDUSD') {
      setEntryPrice(0.7015);
      setStopPrice(0.6990);
      setTargetPrice(0.7060);
      setPointValue(100000);
    }
  };

  // CFD Calculations
  const riskAmount = (balance * riskPercent) / 100;
  const stopDistance = Math.abs(entryPrice - stopPrice);
  const targetDistance = Math.abs(targetPrice - entryPrice);
  const riskPerUnit = stopDistance * pointValue;
  const positionSize = riskPerUnit > 0 ? riskAmount / riskPerUnit : 0;
  const potentialLoss = positionSize * riskPerUnit;
  const potentialProfit = positionSize * targetDistance * pointValue;
  const rrRatio = stopDistance > 0 ? targetDistance / stopDistance : 0;

  // Martingale steps
  const martingaleTable = simulateMartingale(initialBet, payoutRate, multiplier, martingaleSteps);

  return (
    <div className="space-y-6 font-mono text-xs text-[#E0E0E0]">
      {/* Header - Variation 3 Terminal Hero Style */}
      <div className="hero-block bg-[#151618] border border-[#222326] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[0.7rem] text-[#BB86FC] tracking-wider mb-1">
            <Calculator size={13} className="text-[#BB86FC]" />
            <span>// QUOTEX_MONEY_MANAGEMENT &amp; RISK_ENGINE</span>
          </div>
          <h1 className="font-syne text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none mt-1">
            Quotex Position Sizing &amp; Money Management
          </h1>
          <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
            Fixed-time expiration payout calculations, Martingale risk simulation, and step recovery planner.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-[#0B0C0D] p-1 border border-[#222326] text-xs font-mono shrink-0">
          <button
            onClick={() => setActiveCalculator('binary')}
            className={`px-3 py-1 font-bold transition-all cursor-pointer ${
              activeCalculator === 'binary'
                ? 'bg-[#222326] text-[#03DAC6]'
                : 'text-[#666666] hover:text-[#E0E0E0]'
            }`}
          >
            Quotex Binary &amp; Martingale
          </button>
          <button
            onClick={() => setActiveCalculator('recovery')}
            className={`px-3 py-1 font-bold transition-all cursor-pointer ${
              activeCalculator === 'recovery'
                ? 'bg-[#222326] text-[#BB86FC]'
                : 'text-[#666666] hover:text-[#E0E0E0]'
            }`}
          >
            Loss Recovery Planner
          </button>
        </div>
      </div>

      {activeCalculator === 'recovery' ? (
        <LossRecoveryPlanner currentDrawdown={150} currentBalance={balance} />
      ) : activeCalculator === 'cfd' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-2 bg-[#151618] border border-[#222326] p-5 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-[#222326]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-syne">
                <ShieldCheck size={15} className="text-[#BB86FC]" />
                Position Parameters &amp; Instrument Specs
              </h3>
              {/* Preset buttons */}
              <div className="flex items-center gap-1 text-[11px] font-mono">
                {(['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'CUSTOM'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePresetChange(p)}
                    className={`px-2 py-0.5 border cursor-pointer font-bold ${
                      assetPreset === p
                        ? 'bg-[#222326] text-[#03DAC6] border-[#03DAC6]/40'
                        : 'bg-[#0B0C0D] text-[#666666] border-[#222326] hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-[#666666] block mb-1 uppercase tracking-wider">Account Balance ($)</label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(Number(e.target.value))}
                  className="w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] p-2.5 text-xs font-mono font-bold text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#666666] block mb-1 uppercase tracking-wider">Risk Percentage (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(Number(e.target.value))}
                    className="w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] p-2.5 text-xs font-mono font-bold text-white outline-none"
                  />
                  <div className="flex gap-1">
                    {[0.5, 1.0, 1.5, 2.0].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setRiskPercent(pct)}
                        className={`px-2 py-1 text-[10px] font-mono font-bold border cursor-pointer ${
                          riskPercent === pct 
                            ? 'bg-[#222326] text-[#03DAC6] border-[#03DAC6]/40' 
                            : 'bg-[#0B0C0D] text-[#666666] border-[#222326]'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              <div>
                <label className="text-[11px] text-[#666666] block mb-1 uppercase tracking-wider">Planned Entry</label>
                <input
                  type="number"
                  step="any"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(Number(e.target.value))}
                  className="w-full bg-[#0B0C0D] border border-[#222326] p-2.5 text-xs text-white outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#666666] block mb-1 uppercase tracking-wider">Stop Loss</label>
                <input
                  type="number"
                  step="any"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(Number(e.target.value))}
                  className="w-full bg-[#0B0C0D] border border-[#222326] p-2.5 text-xs text-[#CF6679] outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#666666] block mb-1 uppercase tracking-wider">Take Profit</label>
                <input
                  type="number"
                  step="any"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  className="w-full bg-[#0B0C0D] border border-[#222326] p-2.5 text-xs text-[#03DAC6] outline-none font-bold"
                />
              </div>
            </div>

            <div className="p-3 bg-[#0B0C0D] border border-[#222326] flex items-center justify-between text-xs font-mono">
              <span className="text-[#666666]">Point Value / Multiplier:</span>
              <span className="text-white font-bold">
                ${pointValue} per unit/point
              </span>
            </div>
          </div>

          {/* Outputs Column */}
          <div className="bg-[#151618] border border-[#222326] p-5 flex flex-col justify-between space-y-4 font-mono">
            <div>
              <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block mb-3 pb-2 border-b border-[#222326]">
                Position Sizing Outputs
              </span>

              <div className="space-y-3 font-mono">
                <div className="p-4 bg-[#0B0C0D] border border-[#222326]">
                  <span className="text-[10px] text-[#666666] block uppercase tracking-wider">Recommended Size:</span>
                  <div className="text-3xl font-extrabold text-[#03DAC6] mt-1 font-syne">
                    {positionSize.toFixed(2)} <span className="text-xs font-normal text-[#888888]">Lots</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-[#0B0C0D] border border-[#222326]">
                    <span className="text-[#666666]">Max Risk Amount:</span>
                    <span className="font-bold text-[#CF6679]">-${formatCurrency(riskAmount)}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#0B0C0D] border border-[#222326]">
                    <span className="text-[#666666]">Potential Profit:</span>
                    <span className="font-bold text-[#03DAC6]">+{formatCurrency(potentialProfit)}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#0B0C0D] border border-[#222326]">
                    <span className="text-[#666666]">Reward-to-Risk (R:R):</span>
                    <span className="font-bold text-white">{rrRatio.toFixed(2)} : 1 ({rrRatio.toFixed(2)}R)</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#0B0C0D] border border-[#222326]">
                    <span className="text-[#666666]">Stop Distance:</span>
                    <span className="font-bold text-[#888888]">{stopDistance.toFixed(2)} points</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#03DAC6] font-mono flex items-center gap-1.5 p-2 bg-[#03DAC6]/10 border border-[#03DAC6]/20">
              <ShieldCheck size={14} />
              <span>Never adjust stop loss mid-trade</span>
            </div>
          </div>
        </div>
      ) : (
        /* CALCULATOR 2: QUOTEX BINARY OPTIONS & MARTINGALE SIMULATOR */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
          <div className="bg-[#151618] border border-[#222326] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-[#222326] font-syne">
              <Zap size={15} className="text-[#BB86FC]" />
              Quotex Binary Money Management
            </h3>

            <div>
              <label className="text-[11px] text-[#666666] block mb-1 uppercase tracking-wider">Base Investment ($)</label>
              <input
                type="number"
                value={initialBet}
                onChange={(e) => setInitialBet(Number(e.target.value))}
                className="w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] p-2.5 text-xs font-mono font-bold text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#666666] block mb-1 uppercase tracking-wider">Average Payout Rate (%)</label>
              <div className="flex items-center gap-1">
                {[80, 85, 87, 90, 95].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPayoutRate(pct)}
                    className={`flex-1 py-1.5 text-xs font-mono font-bold border cursor-pointer ${
                      payoutRate === pct 
                        ? 'bg-[#222326] text-[#03DAC6] border-[#03DAC6]/40' 
                        : 'bg-[#0B0C0D] text-[#666666] border-[#222326]'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#666666] block mb-1 uppercase tracking-wider">Martingale Multiplier (Standard 2.2x)</label>
              <input
                type="number"
                step="0.1"
                value={multiplier}
                onChange={(e) => setMultiplier(Number(e.target.value))}
                className="w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] p-2.5 text-xs font-mono text-white outline-none font-bold"
              />
            </div>

            {/* Risk Warning Box */}
            <div className="p-3 bg-[#CF6679]/10 border border-[#CF6679]/30 text-[#CF6679] text-xs leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle size={14} />
                <span>Martingale Risk Warning</span>
              </div>
              <p className="text-[11px] text-[#E0A0A0]">
                Martingale increases consecutive bet sizes exponentially. A 4-trade losing streak risks <strong>${martingaleTable[3]?.cumLoss || 0}</strong> to recover a small base win.
              </p>
            </div>
          </div>

          {/* Simulator Table */}
          <div className="lg:col-span-2 bg-[#151618] border border-[#222326] p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#222326]">
              <h3 className="text-sm font-bold text-white font-syne">
                Step-by-Step Recovery Matrix ({payoutRate}% Payout)
              </h3>
              <span className="text-xs text-[#03DAC6] font-mono">
                Break-even win rate: ~54%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0B0C0D] text-[#666666] uppercase text-[10px] border-b border-[#222326]">
                  <tr>
                    <th className="p-3">Martingale Step</th>
                    <th className="p-3">Bet Amount ($)</th>
                    <th className="p-3 text-right">Cumulative Lost</th>
                    <th className="p-3 text-right">Win Return</th>
                    <th className="p-3 text-right">Net Profit on Win</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222326]">
                  {martingaleTable.map((row) => (
                    <tr key={row.step} className="hover:bg-[#0B0C0D] transition-colors">
                      <td className="p-3 font-bold text-white">
                        Step {row.step} {row.step === 1 ? '(Base)' : ''}
                      </td>
                      <td className="p-3 font-bold text-[#BB86FC]">
                        ${row.bet}
                      </td>
                      <td className="p-3 text-right text-[#CF6679]">
                        -${row.cumLoss}
                      </td>
                      <td className="p-3 text-right text-[#888888]">
                        +${row.winProfit}
                      </td>
                      <td className="p-3 text-right font-black text-[#03DAC6]">
                        +${row.netProfitOnWin}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
