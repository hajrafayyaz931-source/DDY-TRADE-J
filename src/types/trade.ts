export type TradeType = 'binary' | 'cfd';

export type BinaryDirection = 'CALL' | 'PUT'; // Quotex UP / DOWN
export type CfdDirection = 'Long' | 'Short';

export type AssetClass = 'Quotex OTC Pairs' | 'Quotex Live Forex Pairs';

export type TradingSession = 'London' | 'New York Open' | 'OTC Weekend' | 'Asian / Tokyo' | '24/7 OTC';

export type MarketCondition = 'Strong Trend' | 'Range Bound' | 'Breakout' | 'High Volatility' | 'Low Volatility' | 'Reversal';

export type TradeEmotion = 
  | 'Calm' 
  | 'Confident' 
  | 'Fear' 
  | 'FOMO' 
  | 'Revenge' 
  | 'Greed' 
  | 'Boredom' 
  | 'Anxious'
  | 'Disciplined'
  | 'Impatient'
  | 'Frustrated';

export type TradeResult = 'ITM' | 'OTM' | 'ATM' | 'WIN' | 'LOSS' | 'BE';

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Trade {
  id: string;
  ticket?: string;
  accountId: string; // e.g. "acc-apex-50k"
  type: TradeType; // 'binary' (Quotex) or 'cfd' (Forex/Futures/Crypto)
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm:ss
  exitDate?: string;
  exitTime?: string;
  symbol: string; // e.g. "BTCUSDT", "ES", "EUR/USD (OTC)", "Gold (OTC)"
  assetClass: AssetClass;
  direction: BinaryDirection | CfdDirection;
  
  // Quotex specific
  investment?: number; // amount risked
  payoutPercent?: number; // e.g. 87 for 87%
  duration?: string; // e.g. "1M", "5M", "30S", "15M"
  
  // Pricing & Execution
  entry: number; // strike / entry price
  exit: number; // close / settlement price
  stopLoss?: number;
  takeProfit?: number;
  size?: number; // units, contracts or lots
  contractMultiplier?: number;
  fees?: number;
  
  // Outcome & Risk
  pnl: number; // Net USD profit or loss
  grossPnl?: number;
  risk?: number; // Monetary risk
  rMultiple?: number;
  result?: TradeResult;
  holdingDuration?: string; // e.g. "1m 30s", "4h 15m"
  mae?: number; // Maximum Adverse Excursion ($ or points)
  mfe?: number; // Maximum Favorable Excursion ($ or points)
  
  // Qualitative & Psychology
  strategy: string;
  setup?: string;
  timeframe: string; // "1m", "5m", "15m", "1h", "4h", "1d"
  session: TradingSession;
  marketCondition?: MarketCondition;
  emotion: TradeEmotion;
  rulesFollowed: number;
  totalRules: number;
  tags?: string[]; // e.g. ["Breakout", "Reversal", "News", "Trend Following", "Scalp", "Liquidity Sweep"]
  entryReason?: string;
  exitReason?: string;
  notes?: string;
  beforeScreenshot?: string;
  afterScreenshot?: string;
  screenshotUrl?: string;
  chartData?: CandleData[];
}

export interface TradingAccount {
  id: string;
  name: string;
  broker: string; // "Quotex", "Apex Trader Funding", "TopStep", "Binance", "Interactive Brokers"
  type: 'Prop Firm' | 'Live Broker' | 'Binary Options' | 'Crypto Exchange' | 'Demo';
  startingBalance: number;
  currentBalance: number;
  currency: string;
  dailyLossLimit: number;
  maxDrawdownLimit: number;
  color: string;
}

export interface RuleItem {
  id: number;
  title: string;
  description: string;
  category: 'Risk Management' | 'Entry Criteria' | 'Exit Management' | 'Psychology' | 'Execution';
  active: boolean;
  importance: 'Critical' | 'High' | 'Medium';
  violationCount: number;
}

export interface DailyPlaybookPlan {
  date: string;
  marketBias: 'Bullish' | 'Bearish' | 'Neutral' | 'Mixed';
  higherTfAnalysis: string;
  supportLevels: string;
  resistanceLevels: string;
  prevDayHighLow: string;
  vwapLevels: string;
  openingRangeNotes: string;
  watchlist: Array<{ symbol: string; bias: 'Long' | 'Short' | 'Watch'; keyLevel: string; notes: string }>;
  plannedSetups: string[];
  maxDailyLoss: number;
  maxDailyTrades: number;
  riskPerTradePercent: number;
  confidenceScore: number; // 1-10
  dailyIntention: string;
  mentalReadiness: number; // 1-10
}

export interface StrategyItem {
  id: string;
  name: string;
  description: string;
  marketConditions: MarketCondition[];
  entryCriteria: string;
  exitCriteria: string;
  timeframes: string[];
  recommendedR: string;
  tags: string[];
}

export interface ChallengeDay {
  day: number;
  startingBalance: number;
  profitTarget: number;
  expectedBalance: number;
  lotSize: string; // e.g. "0.02" or "$2.00"
  quotexInvestment: number; // recommended bet size
  status: 'achieved' | 'missed' | 'in_progress' | 'pending';
  actualProfit?: number;
  notes?: string;
  completedAt?: string;
}

export interface GoalItem {
  id: string;
  title: string;
  category: 'Financial' | 'Discipline' | 'Process' | 'Risk';
  targetValue: number;
  currentValue: number;
  unit: string; // "$", "%", "days", "trades"
  deadline: string;
  period: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
}

export interface WeeklyReviewRecord {
  weekId: string;
  startDate: string;
  endDate: string;
  whatWentWell: string;
  whatWentWrong: string;
  biggestMistake: string;
  biggestLesson: string;
  whatToImprove: string;
  nextWeekGoals: string;
  mentorNotes?: string;
}

export interface TradingStats {
  totalTrades: number;
  binaryTrades: number;
  cfdTrades: number;
  winCount: number;
  lossCount: number;
  tieCount: number;
  winRate: number; // %
  netPnl: number;
  grossWin: number;
  grossLoss: number;
  totalInvested: number;
  profitFactor: number;
  averageR: number;
  medianR: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  bestWinStreak: number;
  worstLossStreak: number;
  currentStreak: number;
  currentStreakType: 'win' | 'loss' | 'none';
  expectancy: number;
  recoveryFactor: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  payoffRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  averagePayout: number;
  rulesAdherencePercent: number;
  avgHoldingTime: string;
  consistencyScore: number;
  riskManagementScore: number;
  bestDay: { date: string; pnl: number };
  worstDay: { date: string; pnl: number };
  tradesCountToday: number;
  dailyLossUsedToday: number;
  isOvertrading: boolean;
}
