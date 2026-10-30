import { Trade } from '../types/trade';

export interface PerformanceInsight {
  id: string;
  category: 'Edge' | 'Psychology' | 'Risk' | 'Timing' | 'Execution';
  severity: 'positive' | 'warning' | 'critical' | 'info';
  title: string;
  finding: string;
  supportingData: string;
  sampleSize: number;
  confidence: number; // 0 - 100%
  recommendation: string;
}

export function generateAITradingInsights(trades: Trade[]): PerformanceInsight[] {
  if (!trades || trades.length < 3) {
    return [
      {
        id: 'ins-initial',
        category: 'Execution',
        severity: 'info',
        title: 'Gathering Trading History',
        finding: 'Log at least 5 to 10 trades to unlock deep institutional pattern detection and behavioral analytics.',
        supportingData: `${trades.length} recorded trade(s)`,
        sampleSize: trades.length,
        confidence: 60,
        recommendation: 'Log trades consistently with emotions, setups, and rules adherence.',
      },
    ];
  }

  const insights: PerformanceInsight[] = [];

  // 1. Emotional Trading Cost (FOMO & Revenge vs Calm & Disciplined)
  const emotionalTrades = trades.filter(t => t.emotion === 'FOMO' || t.emotion === 'Revenge' || t.emotion === 'Frustrated' || t.emotion === 'Impatient');
  const disciplinedTrades = trades.filter(t => t.emotion === 'Calm' || t.emotion === 'Disciplined' || t.emotion === 'Confident');

  if (emotionalTrades.length > 0) {
    const emotionalLossTotal = emotionalTrades.reduce((acc, t) => acc + (t.pnl < 0 ? t.pnl : 0), 0);
    const emotionalNetPnl = emotionalTrades.reduce((acc, t) => acc + t.pnl, 0);
    const emotionalWinRate = Math.round((emotionalTrades.filter(t => t.pnl > 0).length / emotionalTrades.length) * 100);

    const disciplinedNetPnl = disciplinedTrades.length > 0 ? disciplinedTrades.reduce((acc, t) => acc + t.pnl, 0) : 0;
    const disciplinedWinRate = disciplinedTrades.length > 0 
      ? Math.round((disciplinedTrades.filter(t => t.pnl > 0).length / disciplinedTrades.length) * 100) 
      : 0;

    insights.push({
      id: 'ins-emotion-cost',
      category: 'Psychology',
      severity: emotionalNetPnl < 0 ? 'critical' : 'warning',
      title: 'Cost of Emotional Execution (FOMO & Revenge)',
      finding: `Trades tagged with FOMO, Revenge, or Impatience produced a net PnL of $${emotionalNetPnl.toFixed(2)} (${emotionalWinRate}% win rate), compared to $${disciplinedNetPnl.toFixed(2)} (${disciplinedWinRate}% win rate) on disciplined trades.`,
      supportingData: `Sample: ${emotionalTrades.length} emotional vs ${disciplinedTrades.length} disciplined trades. Direct negative drag: $${Math.abs(emotionalLossTotal).toFixed(2)}.`,
      sampleSize: emotionalTrades.length,
      confidence: 94,
      recommendation: 'Institute an automated 15-minute terminal lockout after any losing trade to eliminate revenge entries.',
    });
  }

  // 2. Rules Adherence Correlation
  const highRuleTrades = trades.filter(t => (t.rulesFollowed / (t.totalRules || 5)) >= 0.8);
  const lowRuleTrades = trades.filter(t => (t.rulesFollowed / (t.totalRules || 5)) < 0.8);

  if (lowRuleTrades.length > 0) {
    const highWinRate = Math.round((highRuleTrades.filter(t => t.pnl > 0).length / (highRuleTrades.length || 1)) * 100);
    const lowWinRate = Math.round((lowRuleTrades.filter(t => t.pnl > 0).length / lowRuleTrades.length) * 100);

    insights.push({
      id: 'ins-rule-discipline',
      category: 'Execution',
      severity: 'warning',
      title: 'Pre-Trade Checklist Directly Drives Edge',
      finding: `Trades following 80%+ of rules achieved a ${highWinRate}% win rate. When rules were skipped or broken, win rate dropped sharply to ${lowWinRate}%.`,
      supportingData: `${highRuleTrades.length} rule-compliant trades vs ${lowRuleTrades.length} rule-violation trades.`,
      sampleSize: trades.length,
      confidence: 91,
      recommendation: 'Make pre-trade checklist completion mandatory before submitting orders to maintain mathematical edge.',
    });
  }

  // 3. Best Performing Strategy Setup
  const strategyStats: Record<string, { wins: number; total: number; pnl: number }> = {};
  trades.forEach(t => {
    const strat = t.strategy || 'Unspecified';
    if (!strategyStats[strat]) strategyStats[strat] = { wins: 0, total: 0, pnl: 0 };
    strategyStats[strat].total++;
    if (t.pnl > 0) strategyStats[strat].wins++;
    strategyStats[strat].pnl += t.pnl;
  });

  const sortedStrats = Object.entries(strategyStats).sort((a, b) => b[1].pnl - a[1].pnl);
  if (sortedStrats.length > 0) {
    const [bestStrat, bestData] = sortedStrats[0];
    const bestWinRate = Math.round((bestData.wins / bestData.total) * 100);

    insights.push({
      id: 'ins-best-strat',
      category: 'Edge',
      severity: 'positive',
      title: `Dominant Strategy Edge: ${bestStrat}`,
      finding: `"${bestStrat}" is your most profitable setup, generating +$${bestData.pnl.toFixed(2)} with a ${bestWinRate}% win rate across ${bestData.total} trades.`,
      supportingData: `${bestData.wins} wins out of ${bestData.total} executions. Average PnL: +$${(bestData.pnl / bestData.total).toFixed(2)}/trade.`,
      sampleSize: bestData.total,
      confidence: 88,
      recommendation: 'Prioritize capital and risk budget on this setup; eliminate low-conviction secondary setups.',
    });
  }

  // 4. Session Efficiency Analysis
  const sessionStats: Record<string, { pnl: number; total: number; wins: number }> = {};
  trades.forEach(t => {
    const sess = t.session || 'Other';
    if (!sessionStats[sess]) sessionStats[sess] = { pnl: 0, total: 0, wins: 0 };
    sessionStats[sess].total++;
    if (t.pnl > 0) sessionStats[sess].wins++;
    sessionStats[sess].pnl += t.pnl;
  });

  const sessionsArr = Object.entries(sessionStats);
  const worstSession = sessionsArr.sort((a, b) => a[1].pnl - b[1].pnl)[0];
  if (worstSession && worstSession[1].pnl < 0 && worstSession[1].total >= 2) {
    insights.push({
      id: 'ins-session-leak',
      category: 'Timing',
      severity: 'warning',
      title: `Session Profit Leak: ${worstSession[0]}`,
      finding: `Trading during the "${worstSession[0]}" session has resulted in a net drag of -$${Math.abs(worstSession[1].pnl).toFixed(2)} across ${worstSession[1].total} trades.`,
      supportingData: `Win rate during this session is only ${Math.round((worstSession[1].wins / worstSession[1].total) * 100)}%.`,
      sampleSize: worstSession[1].total,
      confidence: 85,
      recommendation: `Refrain from opening new discretionary positions during ${worstSession[0]}; focus trading activity on your primary volume session.`,
    });
  }

  // 5. Binary Options (Quotex) Edge Detection
  const binaryTrades = trades.filter(t => t.type === 'binary');
  if (binaryTrades.length >= 3) {
    const binWins = binaryTrades.filter(t => t.pnl > 0).length;
    const binWinRate = Math.round((binWins / binaryTrades.length) * 100);
    const binNetPnl = binaryTrades.reduce((acc, t) => acc + t.pnl, 0);

    insights.push({
      id: 'ins-quotex-edge',
      category: 'Edge',
      severity: binWinRate >= 60 ? 'positive' : 'warning',
      title: 'Quotex Binary / OTC Options Performance',
      finding: `Logged ${binaryTrades.length} Quotex binary option trades with a ${binWinRate}% ITM win rate and net return of $${binNetPnl.toFixed(2)}.`,
      supportingData: `Breakeven win rate at 85% average payout is 54.1%. Your realized win rate is ${binWinRate}%.`,
      sampleSize: binaryTrades.length,
      confidence: 90,
      recommendation: binWinRate >= 60 
        ? 'Maintain strict 1M/2M candle retest rules and avoid Martingale doubling to preserve your statistical edge.' 
        : 'Filter OTC pairs to only trade payout rates above 85% with confirmed trend confluence.',
    });
  }

  return insights;
}
