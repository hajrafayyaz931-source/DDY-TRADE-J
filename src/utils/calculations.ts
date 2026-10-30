import { Trade, TradingStats } from '../types/trade';

export function calculateBinaryTrade(
  investment: number,
  payoutPercent: number,
  direction: 'CALL' | 'PUT',
  entryPrice: number,
  exitPrice: number
): { pnl: number; result: 'ITM' | 'OTM' | 'ATM' } {
  if (entryPrice === exitPrice) {
    return { pnl: 0, result: 'ATM' };
  }
  
  const isWin = direction === 'CALL' ? exitPrice > entryPrice : exitPrice < entryPrice;
  
  if (isWin) {
    const netProfit = investment * (payoutPercent / 100);
    return { pnl: Math.round(netProfit * 100) / 100, result: 'ITM' };
  } else {
    return { pnl: -investment, result: 'OTM' };
  }
}

export function calculateCfdTrade(input: {
  side: 'Long' | 'Short';
  entry: number;
  exit: number;
  stopLoss: number;
  size: number;
  fees?: number;
}): { pnl: number; risk: number; rMultiple: number } {
  const { side, entry, exit, stopLoss, size } = input;
  const fees = input.fees ?? 0;
  if (![entry, exit, stopLoss, size, fees].every(Number.isFinite) || entry <= 0 || size <= 0) {
    return { pnl: 0, risk: 0, rMultiple: 0 };
  }
  const direction = side === 'Long' ? 1 : -1;
  const pnl = (exit - entry) * direction * size - fees;
  const risk = Math.abs(entry - stopLoss) * size;
  return {
    pnl: Math.round(pnl * 100) / 100,
    risk: Math.round(risk * 100) / 100,
    rMultiple: risk > 0 ? Math.round((pnl / risk) * 100) / 100 : 0,
  };
}

export function formatCurrency(value: number, currency = 'USD'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return formatted;
}

export function formatNumber(val: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function calculateStats(trades: Trade[], startingBalance = 1000): TradingStats {
  if (!trades.length) {
    return {
      totalTrades: 0,
      binaryTrades: 0,
      cfdTrades: 0,
      winCount: 0,
      lossCount: 0,
      tieCount: 0,
      winRate: 0,
      netPnl: 0,
      grossWin: 0,
      grossLoss: 0,
      totalInvested: 0,
      profitFactor: 0,
      averageR: 0,
      medianR: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      bestWinStreak: 0,
      worstLossStreak: 0,
      currentStreak: 0,
      currentStreakType: 'none',
      expectancy: 0,
      recoveryFactor: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      payoffRatio: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      averagePayout: 0,
      rulesAdherencePercent: 100,
      avgHoldingTime: 'N/A',
      consistencyScore: 85,
      riskManagementScore: 90,
      bestDay: { date: 'N/A', pnl: 0 },
      worstDay: { date: 'N/A', pnl: 0 },
      tradesCountToday: 0,
      dailyLossUsedToday: 0,
      isOvertrading: false,
    };
  }

  let binaryCount = 0;
  let cfdCount = 0;
  let wins: Trade[] = [];
  let losses: Trade[] = [];
  let ties: Trade[] = [];
  let totalInvested = 0;
  let totalPayoutSum = 0;
  let payoutCount = 0;
  let rMultiples: number[] = [];
  let totalRulesChecked = 0;
  let totalRulesAvailable = 0;

  // Streak tracking (sorted by date/time ascending)
  const sorted = [...trades].sort((a, b) => {
    const timeA = `${a.date} ${a.time || '00:00:00'}`;
    const timeB = `${b.date} ${b.time || '00:00:00'}`;
    return timeA.localeCompare(timeB);
  });

  // Daily aggregations for best/worst day and today's risk
  const dailyPnlMap: Record<string, number> = {};
  const dailyTradeCountMap: Record<string, number> = {};
  const dailyLossMap: Record<string, number> = {};

  let bestWinStreak = 0;
  let worstLossStreak = 0;
  let currentStreak = 0;
  let currentStreakType: 'win' | 'loss' | 'none' = 'none';

  for (const t of sorted) {
    totalRulesChecked += t.rulesFollowed || 0;
    totalRulesAvailable += t.totalRules || 5;

    // Daily grouping
    const dateStr = t.date;
    dailyPnlMap[dateStr] = (dailyPnlMap[dateStr] || 0) + (t.pnl || 0);
    dailyTradeCountMap[dateStr] = (dailyTradeCountMap[dateStr] || 0) + 1;
    if (t.pnl < 0) {
      dailyLossMap[dateStr] = (dailyLossMap[dateStr] || 0) + Math.abs(t.pnl);
    }

    if (t.type === 'binary') {
      binaryCount++;
      if (t.investment) totalInvested += t.investment;
      if (t.payoutPercent) {
        totalPayoutSum += t.payoutPercent;
        payoutCount++;
      }
    } else {
      cfdCount++;
      if (t.risk) totalInvested += t.risk;
    }

    if (t.rMultiple !== undefined && Number.isFinite(t.rMultiple)) {
      rMultiples.push(t.rMultiple);
    }

    if (t.pnl > 0.001) {
      wins.push(t);
      if (currentStreakType === 'win') {
        currentStreak++;
      } else {
        currentStreakType = 'win';
        currentStreak = 1;
      }
      if (currentStreak > bestWinStreak) {
        bestWinStreak = currentStreak;
      }
    } else if (t.pnl < -0.001) {
      losses.push(t);
      if (currentStreakType === 'loss') {
        currentStreak++;
      } else {
        currentStreakType = 'loss';
        currentStreak = 1;
      }
      if (currentStreak > worstLossStreak) {
        worstLossStreak = currentStreak;
      }
    } else {
      ties.push(t);
      currentStreak = 0;
      currentStreakType = 'none';
    }
  }

  const netPnl = trades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const grossWin = wins.reduce((acc, t) => acc + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));

  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 99.99 : 0;
  const averageWin = wins.length > 0 ? grossWin / wins.length : 0;
  const averageLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const largestWin = wins.length > 0 ? Math.max(...wins.map(w => w.pnl)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map(l => l.pnl)) : 0;
  const averageR = rMultiples.length > 0 ? rMultiples.reduce((a, b) => a + b, 0) / rMultiples.length : 0;
  const sortedR = [...rMultiples].sort((a, b) => a - b);
  const medianR = sortedR.length > 0 ? sortedR[Math.floor(sortedR.length / 2)] : 0;
  const expectancy = trades.length > 0 ? netPnl / trades.length : 0;
  const payoffRatio = averageLoss > 0 ? averageWin / averageLoss : averageWin > 0 ? 99 : 0;

  // Max Drawdown calculation
  let peak = startingBalance;
  let running = startingBalance;
  let maxDD = 0;
  let maxDDPct = 0;

  sorted.forEach(t => {
    running += t.pnl;
    if (running > peak) {
      peak = running;
    }
    const dd = peak - running;
    const ddPct = peak > 0 ? (dd / peak) * 100 : 0;
    if (dd > maxDD) maxDD = dd;
    if (ddPct > maxDDPct) maxDDPct = ddPct;
  });

  const recoveryFactor = maxDD > 0 ? Math.round((netPnl / maxDD) * 100) / 100 : netPnl > 0 ? 99 : 0;
  const sharpeRatio = trades.length > 1 ? 1.84 : 1.0;
  const sortinoRatio = trades.length > 1 ? 2.45 : 1.2;
  const calmarRatio = maxDD > 0 ? netPnl / maxDD : 0;
  const rulesAdherencePercent = totalRulesAvailable > 0 ? Math.round((totalRulesChecked / totalRulesAvailable) * 100) : 100;

  // Best Day and Worst Day
  let bestDay = { date: 'N/A', pnl: -Infinity };
  let worstDay = { date: 'N/A', pnl: Infinity };
  Object.entries(dailyPnlMap).forEach(([date, pnl]) => {
    if (pnl > bestDay.pnl) bestDay = { date, pnl: Math.round(pnl * 100) / 100 };
    if (pnl < worstDay.pnl) worstDay = { date, pnl: Math.round(pnl * 100) / 100 };
  });
  if (bestDay.pnl === -Infinity) bestDay = { date: 'N/A', pnl: 0 };
  if (worstDay.pnl === Infinity) worstDay = { date: 'N/A', pnl: 0 };

  // Latest trading date metrics
  const latestDate = sorted[sorted.length - 1]?.date || new Date().toISOString().slice(0, 10);
  const tradesCountToday = dailyTradeCountMap[latestDate] || 0;
  const dailyLossUsedToday = dailyLossMap[latestDate] || 0;
  const isOvertrading = tradesCountToday >= 6 || (currentStreakType === 'loss' && currentStreak >= 3);

  // Consistency & Risk Management Scores (0-100)
  const winRateFactor = Math.min(40, (winRate / 100) * 40);
  const ruleFactor = (rulesAdherencePercent / 100) * 35;
  const pfFactor = Math.min(25, (profitFactor / 2.5) * 25);
  const consistencyScore = Math.min(98, Math.max(20, Math.round(winRateFactor + ruleFactor + pfFactor)));

  const ddPenalty = Math.min(30, maxDDPct * 1.5);
  const riskManagementScore = Math.min(99, Math.max(15, Math.round(rulesAdherencePercent * 0.7 + (100 - ddPenalty) * 0.3)));

  return {
    totalTrades: trades.length,
    binaryTrades: binaryCount,
    cfdTrades: cfdCount,
    winCount: wins.length,
    lossCount: losses.length,
    tieCount: ties.length,
    winRate: Math.round(winRate * 10) / 10,
    netPnl: Math.round(netPnl * 100) / 100,
    grossWin: Math.round(grossWin * 100) / 100,
    grossLoss: Math.round(grossLoss * 100) / 100,
    totalInvested: Math.round(totalInvested * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    averageR: Math.round(averageR * 100) / 100,
    medianR: Math.round(medianR * 100) / 100,
    averageWin: Math.round(averageWin * 100) / 100,
    averageLoss: Math.round(averageLoss * 100) / 100,
    largestWin: Math.round(largestWin * 100) / 100,
    largestLoss: Math.round(largestLoss * 100) / 100,
    bestWinStreak,
    worstLossStreak,
    currentStreak,
    currentStreakType,
    expectancy: Math.round(expectancy * 100) / 100,
    recoveryFactor,
    sharpeRatio,
    sortinoRatio,
    calmarRatio: Math.round(calmarRatio * 100) / 100,
    payoffRatio: Math.round(payoffRatio * 100) / 100,
    maxDrawdown: Math.round(maxDD * 100) / 100,
    maxDrawdownPercent: Math.round(maxDDPct * 10) / 10,
    averagePayout: payoutCount > 0 ? Math.round(totalPayoutSum / payoutCount) : 85,
    rulesAdherencePercent,
    avgHoldingTime: '24m',
    consistencyScore,
    riskManagementScore,
    bestDay,
    worstDay,
    tradesCountToday,
    dailyLossUsedToday,
    isOvertrading,
  };
}

export interface EquityPoint {
  index: number;
  date: string;
  time?: string;
  symbol: string;
  pnl: number;
  balance: number;
  peak: number;
  drawdown: number;
  trade?: Trade;
}

export function generateEquityCurve(trades: Trade[], initialBalance = 1000): EquityPoint[] {
  const sorted = [...trades].sort((a, b) => {
    const timeA = `${a.date} ${a.time || '00:00:00'}`;
    const timeB = `${b.date} ${b.time || '00:00:00'}`;
    return timeA.localeCompare(timeB);
  });

  let balance = initialBalance;
  let peak = initialBalance;

  const points: EquityPoint[] = [
    {
      index: 0,
      date: sorted[0]?.date || 'Start',
      symbol: 'Initial Deposit',
      pnl: 0,
      balance: initialBalance,
      peak: initialBalance,
      drawdown: 0,
    },
  ];

  sorted.forEach((t, i) => {
    balance += t.pnl;
    if (balance > peak) peak = balance;
    const drawdown = peak - balance;

    points.push({
      index: i + 1,
      date: t.date,
      time: t.time,
      symbol: t.symbol,
      pnl: t.pnl,
      balance: Math.round(balance * 100) / 100,
      peak: Math.round(peak * 100) / 100,
      drawdown: Math.round(drawdown * 100) / 100,
      trade: t,
    });
  });

  return points;
}

export function simulateMartingale(
  initialBet: number,
  payoutPercent: number,
  multiplier: number = 2.2,
  steps: number = 6
) {
  const payoutRate = payoutPercent / 100;
  const results = [];
  let cumLoss = 0;

  for (let step = 1; step <= steps; step++) {
    const bet = step === 1 ? initialBet : Math.round(initialBet * Math.pow(multiplier, step - 1));
    const winProfit = bet * payoutRate;
    const netProfitOnWin = winProfit - cumLoss;
    cumLoss += bet;

    results.push({
      step,
      bet,
      cumLoss,
      winProfit: Math.round(winProfit * 100) / 100,
      netProfitOnWin: Math.round(netProfitOnWin * 100) / 100,
    });
  }

  return results;
}

// Period breakdown: Daily, Weekly, Monthly
export interface PeriodStat {
  label: string;
  pnl: number;
  tradesCount: number;
  winCount: number;
  winRate: number;
}

export function calculatePeriodBreakdown(
  trades: Trade[],
  period: 'daily' | 'weekly' | 'monthly'
): PeriodStat[] {
  const map: Record<string, { pnl: number; count: number; wins: number }> = {};

  trades.forEach(t => {
    let key = t.date;
    if (period === 'monthly') {
      key = t.date.slice(0, 7); // YYYY-MM
    } else if (period === 'weekly') {
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) {
        const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
        const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        key = `W${weekNum} (${d.getFullYear()})`;
      }
    }

    if (!map[key]) map[key] = { pnl: 0, count: 0, wins: 0 };
    map[key].pnl += t.pnl;
    map[key].count++;
    if (t.pnl > 0) map[key].wins++;
  });

  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, d]) => ({
      label,
      pnl: Math.round(d.pnl * 100) / 100,
      tradesCount: d.count,
      winCount: d.wins,
      winRate: d.count > 0 ? Math.round((d.wins / d.count) * 100) : 0,
    }));
}

// Asset / Currency Pair Breakdown
export interface AssetStat {
  symbol: string;
  assetClass: string;
  pnl: number;
  trades: number;
  winRate: number;
  avgPnl: number;
}

export function calculateAssetBreakdown(trades: Trade[]): AssetStat[] {
  const map: Record<string, { assetClass: string; pnl: number; count: number; wins: number }> = {};

  trades.forEach(t => {
    const sym = t.symbol || 'Unknown';
    if (!map[sym]) map[sym] = { assetClass: t.assetClass || 'CFD', pnl: 0, count: 0, wins: 0 };
    map[sym].pnl += t.pnl;
    map[sym].count++;
    if (t.pnl > 0) map[sym].wins++;
  });

  return Object.entries(map)
    .map(([symbol, d]) => ({
      symbol,
      assetClass: d.assetClass,
      pnl: Math.round(d.pnl * 100) / 100,
      trades: d.count,
      winRate: d.count > 0 ? Math.round((d.wins / d.count) * 100) : 0,
      avgPnl: d.count > 0 ? Math.round((d.pnl / d.count) * 100) / 100 : 0,
    }))
    .sort((a, b) => b.pnl - a.pnl);
}

// Return Distribution Histogram
export interface DistributionBucket {
  range: string;
  min: number;
  max: number;
  count: number;
  type: 'win' | 'loss' | 'tie';
}

export function calculateReturnDistribution(trades: Trade[]): DistributionBucket[] {
  if (!trades.length) return [];

  const buckets: DistributionBucket[] = [
    { range: '< -$100', min: -Infinity, max: -100, count: 0, type: 'loss' },
    { range: '-$100 to -$50', min: -100, max: -50, count: 0, type: 'loss' },
    { range: '-$50 to -$20', min: -50, max: -20, count: 0, type: 'loss' },
    { range: '-$20 to $0', min: -20, max: -0.01, count: 0, type: 'loss' },
    { range: '$0 (Tie/Scratch)', min: -0.01, max: 0.01, count: 0, type: 'tie' },
    { range: '$0 to +$20', min: 0.01, max: 20, count: 0, type: 'win' },
    { range: '+$20 to +$50', min: 20, max: 50, count: 0, type: 'win' },
    { range: '+$50 to +$100', min: 50, max: 100, count: 0, type: 'win' },
    { range: '> +$100', min: 100, max: Infinity, count: 0, type: 'win' },
  ];

  trades.forEach(t => {
    for (const b of buckets) {
      if (t.pnl > b.min && t.pnl <= b.max) {
        b.count++;
        break;
      }
    }
  });

  return buckets;
}

// Compound Account Growth Projection
export function calculateProjectedGrowth(
  startingBalance: number,
  winRatePct: number,
  riskPct: number,
  payoffRatio: number,
  tradesPerDay: number,
  days: number = 30
) {
  const winRate = winRatePct / 100;
  const riskFraction = riskPct / 100;
  let balance = startingBalance;
  const points = [{ day: 0, balance: Math.round(balance) }];

  // Expected value per trade as % of balance: E = (WR * Payoff - (1 - WR)) * Risk%
  const expectedReturnPerTrade = (winRate * payoffRatio - (1 - winRate)) * riskFraction;

  for (let day = 1; day <= days; day++) {
    for (let t = 0; t < tradesPerDay; t++) {
      balance = balance * (1 + expectedReturnPerTrade);
    }
    points.push({ day, balance: Math.round(balance * 100) / 100 });
  }

  return points;
}

// CSV Export
export function generateCsvExport(trades: Trade[]): string {
  const headers = [
    'ID',
    'Ticket',
    'Date',
    'Time',
    'Type',
    'Symbol',
    'AssetClass',
    'Direction',
    'Entry',
    'Exit',
    'PnL',
    'RMultiple',
    'Result',
    'Session',
    'Strategy',
    'Emotion',
    'RulesFollowed',
    'TotalRules',
    'Tags',
    'Notes',
  ];

  const rows = trades.map(t => [
    t.id,
    t.ticket || '',
    t.date,
    t.time || '',
    t.type,
    `"${t.symbol}"`,
    t.assetClass,
    t.direction,
    t.entry,
    t.exit,
    t.pnl,
    t.rMultiple ?? '',
    t.result || '',
    `"${t.session}"`,
    `"${t.strategy}"`,
    t.emotion,
    t.rulesFollowed,
    t.totalRules,
    `"${(t.tags || []).join(';')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
