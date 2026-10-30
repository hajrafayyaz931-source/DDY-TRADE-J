import React from 'react';
import { GoalItem, TradingStats } from '../../types/trade';
import { Target, Flame, ShieldCheck, Award, TrendingUp, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

interface GoalsViewProps {
  goals: GoalItem[];
  stats: TradingStats;
}

export function GoalsView({ goals, stats }: GoalsViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#101722] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8492A6]">
            <Target size={14} className="text-[#3987FF]" />
            <span>TRADER GROWTH & DEVELOPMENT</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white mt-1 tracking-tight">
            Goals, Milestones & Consistency Streaks
          </h1>
          <p className="text-xs text-[#8492A6] mt-0.5">
            Process-oriented milestones, discipline adherence rings, and winning streak targets
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 font-mono text-xs font-bold self-start sm:self-auto">
          <Flame size={15} className="fill-current" />
          <span>{stats.bestWinStreak} Trades Max Streak</span>
        </div>
      </div>

      {/* Circular Progress Rings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
          const circ = 251.3;
          const strokeOffset = circ - (pct / 100) * circ;

          return (
            <div
              key={goal.id}
              className="trade-card rounded-2xl p-6 border border-[#1E293B] flex flex-col items-center text-center space-y-4"
            >
              <div className="flex items-center justify-between w-full text-xs">
                <span className="px-2 py-0.5 rounded bg-[#182333] text-[#8492A6] font-mono">
                  {goal.period}
                </span>
                <span className="text-slate-400 font-mono">{goal.deadline}</span>
              </div>

              {/* Circular Ring SVG */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#16202E"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={pct >= 100 ? '#00D6A0' : '#3987FF'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circ}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                  <span className="text-2xl font-black text-white">{pct}%</span>
                  <span className="text-[10px] text-[#8492A6]">Achieved</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white">{goal.title}</h3>
                <div className="text-xs font-mono text-[#8492A6] mt-1">
                  Current: <strong className="text-white">{goal.unit === '$' ? `$${goal.currentValue}` : `${goal.currentValue}${goal.unit}`}</strong> / Target: {goal.unit === '$' ? `$${goal.targetValue}` : `${goal.targetValue}${goal.unit}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
