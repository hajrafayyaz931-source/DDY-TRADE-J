import React, { useMemo } from 'react';
import { Trade } from '../../types/trade';
import { formatCurrency } from '../../utils/calculations';
import { 
  ShieldCheck, 
  Flame, 
  Trophy, 
  AlertTriangle, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Zap,
  TrendingUp,
  Shield
} from 'lucide-react';

interface StreakProtectorProps {
  trades: Trade[];
  dailyLossLimit?: number;
}

interface Milestone {
  type: 'win' | 'discipline';
  count: number;
  title: string;
  badge: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}

const MILESTONES: Milestone[] = [
  { type: 'win', count: 3, title: '3 Consecutive Wins', badge: 'Bronze Shield', color: '#CD7F32', icon: Shield },
  { type: 'win', count: 5, title: '5 Win Streak', badge: 'Silver Vault', color: '#C0C0C0', icon: ShieldCheck },
  { type: 'win', count: 10, title: '10 Win Titan', badge: 'Diamond Titan', color: '#38BDF8', icon: Trophy },
  { type: 'discipline', count: 5, title: '5 Disciplined Trades', badge: 'Rule Defender', color: '#10B981', icon: Award },
  { type: 'discipline', count: 10, title: '10 Disciplined Executions', badge: 'Master Quant', color: '#8B5CF6', icon: Sparkles },
];

export function StreakProtectorWidget({ trades, dailyLossLimit = 200 }: StreakProtectorProps) {
  // Calculate current win streak & discipline streak
  const { currentWinStreak, maxWinStreak, currentDisciplineStreak, todayTradesCount, todayPnl, recentLossesToday } = useMemo(() => {
    const sorted = [...trades].sort((a, b) => {
      const dateA = `${a.date} ${a.time || '00:00:00'}`;
      const dateB = `${b.date} ${b.time || '00:00:00'}`;
      return dateB.localeCompare(dateA); // Newest first
    });

    let winStreak = 0;
    for (const t of sorted) {
      if (t.pnl > 0) {
        winStreak++;
      } else if (t.pnl < 0) {
        break; // streak broken
      }
    }

    let maxWin = 0;
    let tempWin = 0;
    const chronological = [...sorted].reverse();
    for (const t of chronological) {
      if (t.pnl > 0) {
        tempWin++;
        if (tempWin > maxWin) maxWin = tempWin;
      } else if (t.pnl < 0) {
        tempWin = 0;
      }
    }

    let disciplineStreak = 0;
    for (const t of sorted) {
      const totalR = t.totalRules || 5;
      if (t.rulesFollowed >= totalR - 1) {
        disciplineStreak++;
      } else {
        break;
      }
    }

    // Today's stats
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayList = sorted.filter(t => t.date === todayStr);
    const todayCount = todayList.length;
    const todayNet = todayList.reduce((acc, t) => acc + t.pnl, 0);
    const lossesToday = todayList.filter(t => t.pnl < 0).length;

    return {
      currentWinStreak: winStreak,
      maxWinStreak: maxWin,
      currentDisciplineStreak: disciplineStreak,
      todayTradesCount: todayCount,
      todayPnl: todayNet,
      recentLossesToday: lossesToday,
    };
  }, [trades]);

  // Next win milestone
  const nextWinMilestone = MILESTONES.filter(m => m.type === 'win' && m.count > currentWinStreak)[0] || {
    type: 'win',
    count: currentWinStreak + 5,
    title: 'Legendary Streak',
    badge: 'Apex Dominator',
    color: '#C084FC',
    icon: Trophy,
  };

  const winProgressPct = Math.min(100, Math.round((currentWinStreak / nextWinMilestone.count) * 100));

  // Risk warning evaluation
  const isStreakAtRisk = currentWinStreak >= 2 && (recentLossesToday >= 1 || todayTradesCount >= 5 || todayPnl < 0);
  const isOvertradingWarning = todayTradesCount >= 6;

  return (
    <div className="trade-card rounded-2xl p-5 border border-[var(--border-subtle)] bg-[var(--surface-primary)] backdrop-blur-2xl shadow-xl space-y-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute w-48 h-48 rounded-full bg-[var(--glow-color)] opacity-40 blur-3xl pointer-events-none -top-10 -right-10" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 flex items-center justify-center text-[var(--accent-primary)] shadow-[0_0_12px_var(--glow-color)]">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Trade Streak Protector</span>
              {currentWinStreak >= 3 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 font-mono font-bold animate-pulse">
                  SHIELD ACTIVE
                </span>
              )}
            </h3>
            <p className="text-[11px] text-[var(--accent-secondary)]">
              Milestone tracking & active session risk guardian
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-xs font-mono">
          <Flame size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
          <span className="text-white font-bold">{currentWinStreak}</span>
          <span className="text-[var(--accent-secondary)] text-[10px]">Active Wins</span>
        </div>
      </div>

      {/* Streak Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Active Win Streak */}
        <div className="p-3 rounded-xl bg-[var(--surface-secondary)]/80 border border-[var(--border-subtle)] space-y-1">
          <span className="text-[10px] text-[var(--accent-secondary)] font-mono block">Current Win Streak</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black font-mono text-[#10B981]">
              {currentWinStreak} <span className="text-xs text-[#10B981]/80 font-normal">Wins</span>
            </span>
          </div>
          <span className="text-[9px] text-[#CBD5E1] block">
            Best Peak: <strong className="text-white">{maxWinStreak} Wins</strong>
          </span>
        </div>

        {/* Discipline Streak */}
        <div className="p-3 rounded-xl bg-[var(--surface-secondary)]/80 border border-[var(--border-subtle)] space-y-1">
          <span className="text-[10px] text-[var(--accent-secondary)] font-mono block">Discipline Streak</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black font-mono text-[var(--accent-secondary)]">
              {currentDisciplineStreak} <span className="text-xs text-[var(--accent-secondary)]/80 font-normal">Trades</span>
            </span>
          </div>
          <span className="text-[9px] text-[#CBD5E1] block">
            100% Rule Adherence
          </span>
        </div>

        {/* Next Target Milestone */}
        <div className="p-3 rounded-xl bg-[var(--surface-secondary)]/80 border border-[var(--border-subtle)] space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-[var(--accent-secondary)] font-mono block">Next Milestone</span>
          <div className="flex items-center gap-1.5">
            <Award size={16} style={{ color: nextWinMilestone.color }} />
            <span className="text-xs font-bold text-white truncate">{nextWinMilestone.badge}</span>
          </div>
          <span className="text-[9px] text-[#F59E0B] font-mono block font-bold">
            {nextWinMilestone.count - currentWinStreak} More Wins Needed
          </span>
        </div>
      </div>

      {/* Progress Bar toward Next Milestone */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-[var(--accent-secondary)] flex items-center gap-1">
            <Sparkles size={12} className="text-[#F59E0B]" />
            Progress to {nextWinMilestone.title} ({nextWinMilestone.count} Wins):
          </span>
          <span className="text-white font-bold">{winProgressPct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] overflow-hidden p-0.5">
          <div 
            style={{ width: `${winProgressPct}%`, backgroundColor: nextWinMilestone.color }}
            className="h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
          />
        </div>
      </div>

      {/* Streak Risk Warning Alert Banner */}
      {isStreakAtRisk && (
        <div className="p-3 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 flex items-start gap-2.5 text-xs text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-in fade-in duration-200">
          <AlertTriangle size={16} className="text-[#F59E0B] shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <span className="font-bold text-white block">Streak Protection Advisory</span>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              {isOvertradingWarning
                ? `You have executed ${todayTradesCount} trades today. High trade frequency risks emotional fatigue and resetting your ${currentWinStreak}-win streak.`
                : `Your active ${currentWinStreak}-win streak is vulnerable. Focus strictly on A+ setups and avoid forcing trades.`}
            </p>
          </div>
        </div>
      )}

      {/* Milestone Badges Strip */}
      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)] overflow-x-auto">
        <span className="text-[10px] font-mono text-[var(--accent-secondary)] shrink-0 uppercase tracking-wider">
          Badges:
        </span>
        {MILESTONES.map((m, idx) => {
          const isUnlocked = m.type === 'win' ? currentWinStreak >= m.count : currentDisciplineStreak >= m.count;
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shrink-0 border transition-all ${
                isUnlocked
                  ? 'bg-[var(--surface-secondary)] border-[var(--border-hover)] text-white shadow-[0_0_8px_var(--glow-color)]'
                  : 'bg-[var(--surface-primary)] border-[var(--border-subtle)] text-[#94A3B8]/60 opacity-60'
              }`}
              title={isUnlocked ? `Unlocked: ${m.title}` : `Locked: Requires ${m.count} ${m.type === 'win' ? 'wins' : 'disciplined trades'}`}
            >
              <Icon size={12} style={{ color: isUnlocked ? m.color : '#94A3B8' }} />
              <span>{m.badge}</span>
              {isUnlocked && <CheckCircle2 size={11} className="text-[#10B981]" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
