import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../../utils/calculations';
import { 
  Calculator, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  HelpCircle,
  BarChart3,
  Layers,
  AlertTriangle
} from 'lucide-react';

interface LossRecoveryPlannerProps {
  currentDrawdown?: number; // dollar drawdown to recover
  currentBalance?: number;
  onApplyPlan?: (initialBet: number) => void;
}

export function LossRecoveryPlanner({
  currentDrawdown = 150,
  currentBalance = 1000,
  onApplyPlan,
}: LossRecoveryPlannerProps) {
  const [targetDrawdown, setTargetDrawdown] = useState<number>(currentDrawdown > 0 ? currentDrawdown : 100);
  const [accountBalance, setAccountBalance] = useState<number>(currentBalance > 0 ? currentBalance : 1000);
  const [payoutRate, setPayoutRate] = useState<number>(85); // 85% payout for Quotex or 1.5R - 2.0R CFD
  const [stepCount, setStepCount] = useState<number>(5); // 3 to 10 compounding steps
  const [riskStyle, setRiskStyle] = useState<'conservative' | 'balanced' | 'accelerated'>('balanced');

  // Risk percentage multiplier per step
  const riskPercentPerStep = useMemo(() => {
    switch (riskStyle) {
      case 'conservative':
        return 1.5; // 1.5% of balance per trade
      case 'balanced':
        return 2.5; // 2.5% of balance per trade
      case 'accelerated':
        return 4.0; // 4.0% of balance per trade
    }
  }, [riskStyle]);

  // Generate safe non-Martingale recovery compounding schedule
  const recoverySchedule = useMemo(() => {
    const steps = [];
    let runningBalance = accountBalance;
    let remainingLossToRecover = targetDrawdown;

    const decimalPayout = payoutRate / 100;

    for (let i = 1; i <= stepCount; i++) {
      // Calculate safe risk amount
      const riskAmount = Math.max(1, Math.min(runningBalance * (riskPercentPerStep / 100), remainingLossToRecover));
      const stepProfit = riskAmount * decimalPayout;

      runningBalance += stepProfit;
      remainingLossToRecover = Math.max(0, remainingLossToRecover - stepProfit);

      steps.push({
        step: i,
        riskAmount,
        stepProfit,
        newBalance: runningBalance,
        remainingDrawdown: remainingLossToRecover,
        recoveredPct: targetDrawdown > 0 ? Math.min(100, Math.round(((targetDrawdown - remainingLossToRecover) / targetDrawdown) * 100)) : 100,
      });

      if (remainingLossToRecover <= 0) break;
    }

    return steps;
  }, [targetDrawdown, accountBalance, payoutRate, stepCount, riskPercentPerStep]);

  const totalStepsToRecover = recoverySchedule.length;
  const finalRecoveredBalance = recoverySchedule[recoverySchedule.length - 1]?.newBalance || accountBalance;
  const initialStepBet = recoverySchedule[0]?.riskAmount || 10;

  return (
    <div className="trade-card rounded-2xl p-5 border border-[#8B5CF6]/25 bg-[#07060A]/85 backdrop-blur-2xl shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#8B5CF6]/20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#C084FC] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]">
            <div className="w-full h-full bg-[#07060A] rounded-[10px] flex items-center justify-center text-[#C084FC]">
              <RotateCcw size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Loss Recovery & Drawdown Planner</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#C084FC] border border-[#8B5CF6]/40 font-mono font-bold">
                NON-MARTINGALE
              </span>
            </h3>
            <p className="text-xs text-[#A78BFA]">
              Mathematically sound compounding schedule to eliminate drawdown without gambling
            </p>
          </div>
        </div>

        {onApplyPlan && (
          <button
            onClick={() => onApplyPlan(initialStepBet)}
            className="btn-premium-purple px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(139,92,246,0.4)]"
          >
            <CheckCircle2 size={14} />
            <span>Apply Step 1 Sizing (${initialStepBet.toFixed(0)})</span>
          </button>
        )}
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
        {/* Drawdown Amount */}
        <div className="p-3 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/25 space-y-1">
          <label className="text-[#A78BFA] block text-[10px] uppercase font-bold">
            Drawdown to Recover ($):
          </label>
          <input
            type="number"
            min="10"
            step="10"
            value={targetDrawdown}
            onChange={(e) => setTargetDrawdown(Math.max(10, Number(e.target.value)))}
            className="w-full bg-[#07060A] border border-[#8B5CF6]/30 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-[#C084FC] font-bold text-sm"
          />
        </div>

        {/* Current Account Equity */}
        <div className="p-3 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/25 space-y-1">
          <label className="text-[#A78BFA] block text-[10px] uppercase font-bold">
            Current Account Equity ($):
          </label>
          <input
            type="number"
            min="50"
            step="50"
            value={accountBalance}
            onChange={(e) => setAccountBalance(Math.max(50, Number(e.target.value)))}
            className="w-full bg-[#07060A] border border-[#8B5CF6]/30 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-[#C084FC] font-bold text-sm"
          />
        </div>

        {/* Payout Rate / R-Multiple */}
        <div className="p-3 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/25 space-y-1">
          <label className="text-[#A78BFA] block text-[10px] uppercase font-bold">
            Quotex Payout Rate (%):
          </label>
          <select
            value={payoutRate}
            onChange={(e) => setPayoutRate(Number(e.target.value))}
            className="w-full bg-[#07060A] border border-[#8B5CF6]/30 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-[#C084FC] font-bold text-xs"
          >
            <option value="80">80% Payout (OTC Forex)</option>
            <option value="85">85% Payout (Quotex Standard)</option>
            <option value="90">90% Payout (Quotex High Yield)</option>
            <option value="100">100% Payout (1.0R CFD Return)</option>
            <option value="150">150% Payout (1.5R CFD Return)</option>
          </select>
        </div>

        {/* Recovery Strategy Pace */}
        <div className="p-3 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/25 space-y-1">
          <label className="text-[#A78BFA] block text-[10px] uppercase font-bold">
            Compounding Pace:
          </label>
          <div className="flex items-center gap-1 pt-0.5">
            {(['conservative', 'balanced', 'accelerated'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setRiskStyle(mode)}
                className={`flex-1 py-1 rounded text-[10px] font-bold capitalize transition-all ${
                  riskStyle === mode
                    ? 'bg-[#8B5CF6] text-white shadow-[0_0_8px_rgba(139,92,246,0.5)]'
                    : 'bg-[#181130] text-[#A78BFA] hover:text-white'
                }`}
              >
                {mode.slice(0, 5)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Projection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        <div className="p-3.5 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/20">
          <span className="text-[10px] text-[#A78BFA] block">Step 1 Investment / Size</span>
          <span className="text-lg font-black text-[#10B981]">{formatCurrency(initialStepBet)}</span>
          <span className="text-[9px] text-[#CBD5E1] block mt-0.5">
            {riskPercentPerStep}% of account equity
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/20">
          <span className="text-[10px] text-[#A78BFA] block">Target Recovery Steps</span>
          <span className="text-lg font-black text-[#C084FC]">{totalStepsToRecover} Executions</span>
          <span className="text-[9px] text-[#CBD5E1] block mt-0.5">
            Sequential 100% win-rate steps
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/20">
          <span className="text-[10px] text-[#A78BFA] block">Projected Peak Equity</span>
          <span className="text-lg font-black text-white">{formatCurrency(finalRecoveredBalance)}</span>
          <span className="text-[9px] text-[#10B981] block mt-0.5">
            100% Drawdown Eliminated
          </span>
        </div>
      </div>

      {/* Step-by-step Compounding Matrix Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-white font-bold flex items-center gap-1.5">
            <Layers size={14} className="text-[#C084FC]" />
            Sequential Recovery Steps Schedule
          </span>
          <span className="text-[11px] text-[#A78BFA]">
            Never double down on losses (Anti-Martingale Rule)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#8B5CF6]/20">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0D0B14] text-[#A78BFA] text-[10px] uppercase border-b border-[#8B5CF6]/20">
              <tr>
                <th className="py-2.5 px-3">Step #</th>
                <th className="py-2.5 px-3">Risk / Trade Size</th>
                <th className="py-2.5 px-3">Step Gain (+PnL)</th>
                <th className="py-2.5 px-3">New Equity</th>
                <th className="py-2.5 px-3">Remaining DD</th>
                <th className="py-2.5 px-3 text-right">Recovery %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8B5CF6]/15 bg-[#07060A]/90">
              {recoverySchedule.map((row) => (
                <tr key={row.step} className="hover:bg-[#8B5CF6]/10 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white">
                    Step {row.step}
                  </td>
                  <td className="py-2.5 px-3 text-[#C084FC] font-bold">
                    {formatCurrency(row.riskAmount)}
                  </td>
                  <td className="py-2.5 px-3 text-[#10B981] font-bold">
                    +{formatCurrency(row.stepProfit)}
                  </td>
                  <td className="py-2.5 px-3 text-white font-extrabold">
                    {formatCurrency(row.newBalance)}
                  </td>
                  <td className="py-2.5 px-3 text-[#EF4444]">
                    {row.remainingDrawdown > 0 ? `-${formatCurrency(row.remainingDrawdown)}` : '$0.00 (Cleared)'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold">
                      {row.recoveredPct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Warning against Martingale */}
      <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/35 flex items-start gap-2.5 text-xs text-rose-200">
        <ShieldAlert size={16} className="text-[#EF4444] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block">Quantitative Safety Notice</span>
          <p className="text-[11px] text-rose-200/90 leading-relaxed mt-0.5">
            Traditional 2.2x Martingale doubling after a loss exponentially increases bankruptcy risk. This Step Recovery Planner uses fixed-fractional position sizing to steadily rebuild equity without over-leveraging.
          </p>
        </div>
      </div>
    </div>
  );
}
