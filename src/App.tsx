import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trade, 
  TradingAccount, 
  RuleItem, 
  DailyPlaybookPlan, 
  StrategyItem, 
  GoalItem, 
  WeeklyReviewRecord,
  ChallengeDay
} from './types/trade';
import { 
  INITIAL_ACCOUNTS, 
  INITIAL_TRADES, 
  INITIAL_RULES, 
  INITIAL_DAILY_PLAYBOOK, 
  INITIAL_STRATEGIES, 
  INITIAL_GOALS, 
  INITIAL_WEEKLY_REVIEW 
} from './data/initialData';
import { INITIAL_CHALLENGE_DAYS } from './data/challengeData';
import { calculateStats, formatCurrency } from './utils/calculations';

// Layout components
import { NavTab } from './components/layout/Sidebar';
import { CommandPalette } from './components/layout/CommandPalette';
import { MobileNav } from './components/layout/MobileNav';

// View components
import { DashboardView } from './components/views/DashboardView';
import { ChallengeTargetView } from './components/views/ChallengeTargetView';
import { GeminiChatbotView } from './components/views/GeminiChatbotView';
import { TradeJournalView } from './components/views/TradeJournalView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { DailyJournalView } from './components/views/DailyJournalView';
import { RiskCalculatorView } from './components/views/RiskCalculatorView';
import { AICoachView } from './components/views/AICoachView';
import { RulesEngineView } from './components/views/RulesEngineView';
import { PsychologyView } from './components/views/PsychologyView';
import { WeeklyReviewView } from './components/views/WeeklyReviewView';
import { StrategyLabView } from './components/views/StrategyLabView';
import { LessonsLibraryView } from './components/views/LessonsLibraryView';
import { GoalsView } from './components/views/GoalsView';
import { PortfolioView } from './components/views/PortfolioView';
import { SettingsView } from './components/views/SettingsView';

// Modals
import { LogTradeModal } from './components/modals/LogTradeModal';
import { TradeDetailModal } from './components/modals/TradeDetailModal';
import { AutoImportModal } from './components/modals/AutoImportModal';
import { UrduGuideModal } from './components/modals/UrduGuideModal';
import { VisualsModal } from './components/modals/VisualsModal';
import { EditAccountModal } from './components/modals/EditAccountModal';
import { VisualSettings, THEME_DEFINITIONS } from './types/visuals';
import { playClickSound, playWinSound, playLossSound, speakTradeResult } from './utils/soundEffects';
import { Plus, Volume2, VolumeX, Sparkles, Terminal } from 'lucide-react';

export default function App() {
  // Persistence state
  const [trades, setTrades] = useState<Trade[]>(() => {
    try {
      const saved = localStorage.getItem('tradepath_trades_v4');
      if (saved) {
        const parsed: Trade[] = JSON.parse(saved);
        const quotexOnly = parsed.filter(t => 
          !t.symbol.includes('BTC') && 
          !t.symbol.includes('ES') && 
          !t.symbol.includes('NQ') &&
          t.accountId !== 'acc-binance-crypto' &&
          t.accountId !== 'acc-apex-50k'
        );
        if (quotexOnly.length > 0) return quotexOnly;
      }
    } catch (e) {}
    return INITIAL_TRADES;
  });

  const [accounts, setAccounts] = useState<TradingAccount[]>(() => {
    try {
      const saved = localStorage.getItem('tradepath_accounts_v4');
      if (saved) {
        const parsed: TradingAccount[] = JSON.parse(saved);
        const quotexOnly = parsed.filter(a => 
          a.broker.toLowerCase().includes('quotex') || 
          a.id.includes('quotex') || 
          a.name.toLowerCase().includes('quotex')
        );
        if (quotexOnly.length > 0) {
          return quotexOnly.map(a => a.id === 'acc-all' ? { ...a, name: 'All Quotex Portfolios (Consolidated)', broker: 'Quotex Financial Terminal' } : a);
        }
      }
    } catch (e) {}
    return INITIAL_ACCOUNTS;
  });

  const [rules, setRules] = useState<RuleItem[]>(() => {
    try {
      const saved = localStorage.getItem('tradepath_rules_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_RULES;
  });

  const [playbook, setPlaybook] = useState<DailyPlaybookPlan>(() => {
    try {
      const saved = localStorage.getItem('tradepath_playbook_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_DAILY_PLAYBOOK;
  });

  const [strategies, setStrategies] = useState<StrategyItem[]>(() => {
    try {
      const saved = localStorage.getItem('tradepath_strategies_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_STRATEGIES;
  });

  const [goals, setGoals] = useState<GoalItem[]>(() => {
    try {
      const saved = localStorage.getItem('tradepath_goals_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_GOALS;
  });

  const [weeklyReview, setWeeklyReview] = useState<WeeklyReviewRecord>(() => {
    try {
      const saved = localStorage.getItem('tradepath_weekly_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_WEEKLY_REVIEW;
  });

  const [challengeDays, setChallengeDays] = useState<ChallengeDay[]>(() => {
    try {
      const saved = localStorage.getItem('tradepath_challenge_days_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CHALLENGE_DAYS;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tradepath_challenge_days_v4', JSON.stringify(challengeDays));
    } catch (e) {}
  }, [challengeDays]);

  useEffect(() => {
    try {
      localStorage.setItem('tradepath_trades_v4', JSON.stringify(trades));
    } catch (e) {}
  }, [trades]);

  useEffect(() => {
    try {
      localStorage.setItem('tradepath_accounts_v4', JSON.stringify(accounts));
    } catch (e) {}
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem('tradepath_rules_v4', JSON.stringify(rules));
    } catch (e) {}
  }, [rules]);

  // Navigation & View state - Default to challenge view ($100_TO_$5K) matching screenshot
  const [activeTab, setActiveTab] = useState<NavTab>('challenge');
  const [selectedAccountId, setSelectedAccountId] = useState('acc-all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // Live UTC Clock
  const [utcTime, setUtcTime] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().substring(11, 19);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setUtcTime(d.toISOString().substring(11, 19));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Visual & Theme Settings - Default to Variation 3 Terminal
  const [visualSettings, setVisualSettings] = useState<VisualSettings>(() => {
    try {
      const saved = localStorage.getItem('tradepath_visual_settings_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      theme: 'variation-3-terminal',
      candleStyle: 'neon',
      pnlColorway: 'neon-vivid',
      density: 'comfortable',
      ambientGlow: true,
      soundEffects: true,
      voiceAlerts: true,
      gridIntensity: 'subtle',
    };
  });
  const [isVisualsOpen, setIsVisualsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('tradepath_visual_settings_v3', JSON.stringify(visualSettings));
      document.documentElement.setAttribute('data-theme', visualSettings.theme);
      document.body.setAttribute('data-theme', visualSettings.theme);
      
      const themeDef = THEME_DEFINITIONS[visualSettings.theme] || THEME_DEFINITIONS['variation-3-terminal'];
      if (themeDef) {
        const root = document.documentElement;
        root.style.setProperty('--bg-primary', themeDef.bgPrimary);
        root.style.setProperty('--surface-primary', themeDef.surfacePrimary);
        root.style.setProperty('--surface-secondary', themeDef.surfaceSecondary);
        root.style.setProperty('--surface-tertiary', themeDef.surfaceTertiary);
        root.style.setProperty('--accent-primary', themeDef.accentPrimary);
        root.style.setProperty('--accent-secondary', themeDef.accentSecondary);
        root.style.setProperty('--accent-glow', themeDef.accentSecondary);
        root.style.setProperty('--pnl-positive', themeDef.pnlPositive);
        root.style.setProperty('--pnl-negative', themeDef.pnlNegative);
        root.style.setProperty('--border-subtle', themeDef.borderColor);
        root.style.setProperty('--border-hover', themeDef.accentPrimary);
        root.style.setProperty('--glow-color', themeDef.glowColor);
        document.body.style.backgroundColor = themeDef.bgPrimary;
      }

      if (visualSettings.density === 'compact') {
        document.body.classList.add('density-compact');
      } else {
        document.body.classList.remove('density-compact');
      }
    } catch (e) {}
  }, [visualSettings]);

  // Modal dialog states
  const [isLogTradeOpen, setIsLogTradeOpen] = useState(false);
  const [isAutoImportOpen, setIsAutoImportOpen] = useState(false);
  const [isUrduGuideOpen, setIsUrduGuideOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [inspectTrade, setInspectTrade] = useState<Trade | null>(null);

  const handleUpdateAccount = (updatedAccount: TradingAccount) => {
    const accTrades = trades.filter((t) => t.accountId === updatedAccount.id);
    const pnlSum = accTrades.reduce((tSum, t) => tSum + t.pnl, 0);
    const netStarting = Math.max(0, updatedAccount.currentBalance - pnlSum);

    const cleanAcc: TradingAccount = {
      ...updatedAccount,
      startingBalance: netStarting,
    };

    setAccounts((prev) => prev.map((a) => (a.id === cleanAcc.id ? cleanAcc : a)));
  };

  // Dynamically computed accounts with live trade PnL recalculation
  const computedAccounts = useMemo(() => {
    return accounts.map((acc) => {
      if (acc.id === 'acc-all') {
        const individual = accounts.filter((a) => a.id !== 'acc-all');
        const totalStarting = individual.reduce((s, a) => s + a.startingBalance, 0);
        const totalCurrent = individual.reduce((s, a) => {
          const accTrades = trades.filter((t) => t.accountId === a.id);
          const pnlSum = accTrades.reduce((tSum, t) => tSum + t.pnl, 0);
          return s + a.startingBalance + pnlSum;
        }, 0);

        return {
          ...acc,
          startingBalance: totalStarting,
          currentBalance: totalCurrent,
        };
      }

      const accTrades = trades.filter((t) => t.accountId === acc.id);
      const pnlSum = accTrades.reduce((tSum, t) => tSum + t.pnl, 0);
      return {
        ...acc,
        currentBalance: acc.startingBalance + pnlSum,
      };
    });
  }, [accounts, trades]);

  // Filtered trades based on account
  const accountTrades = selectedAccountId === 'acc-all'
    ? trades
    : trades.filter((t) => t.accountId === selectedAccountId);

  // Active account stats
  const activeAccount = computedAccounts.find((a: TradingAccount) => a.id === selectedAccountId) || computedAccounts[0];
  const calculatedStats = calculateStats(accountTrades, activeAccount.startingBalance);

  // Metrics for Challenge & Intelligence pane
  const achievedDays = useMemo(() => challengeDays.filter(d => d.status === 'achieved'), [challengeDays]);
  const activeCycle = useMemo(() => challengeDays.find(d => d.status === 'in_progress') || challengeDays[0], [challengeDays]);
  
  const currentAccumulatedProfit = useMemo(() => {
    return challengeDays.reduce((acc, d) => {
      if (d.status === 'achieved') return acc + (d.actualProfit ?? d.profitTarget);
      if (d.status === 'in_progress') return acc + (d.actualProfit ?? 0);
      return acc;
    }, 0);
  }, [challengeDays]);

  const currentEquity = 100 + currentAccumulatedProfit;

  // Add trade handler
  const handleSaveTrade = (newTrade: Trade) => {
    setTrades((prev) => [newTrade, ...prev]);
    if (newTrade.pnl >= 0) {
      playWinSound(visualSettings.soundEffects);
    } else {
      playLossSound(visualSettings.soundEffects);
    }

    if (visualSettings.voiceAlerts) {
      speakTradeResult(
        newTrade.result === 'ITM' ? 'ITM' : newTrade.result === 'OTM' ? 'OTM' : 'ATM',
        newTrade.pnl,
        newTrade.symbol,
        true
      );
    }
  };

  // Import batch trades handler
  const handleImportTrades = (newTrades: Trade[]) => {
    setTrades((prev) => [...newTrades, ...prev]);
    playWinSound(visualSettings.soundEffects);
  };

  // Delete trade handler
  const handleDeleteTrade = (tradeId: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== tradeId));
    if (inspectTrade?.id === tradeId) setInspectTrade(null);
  };

  // Sound-enhanced tab select
  const handleSelectTab = (tab: NavTab) => {
    playClickSound(visualSettings.soundEffects);
    setActiveTab(tab);
  };

  // Rule toggler
  const handleToggleRule = (id: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  // Add rule
  const handleAddRule = (item: Omit<RuleItem, 'id' | 'violationCount'>) => {
    const nextId = Math.max(...rules.map((r) => r.id), 0) + 1;
    setRules((prev) => [...prev, { ...item, id: nextId, violationCount: 0 }]);
  };

  // Delete rule
  const handleDeleteRule = (id: number) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateChallengeDay = (dayNum: number, updates: Partial<ChallengeDay>) => {
    setChallengeDays((prev) =>
      prev.map((d) => (d.day === dayNum ? { ...d, ...updates } : d))
    );
    if (updates.status === 'achieved') {
      playWinSound(visualSettings.soundEffects);
    }
  };

  const handleImportBackup = (backupData: any) => {
    if (Array.isArray(backupData)) {
      setTrades(backupData);
    } else if (backupData && typeof backupData === 'object') {
      if (Array.isArray(backupData.trades)) setTrades(backupData.trades);
      if (Array.isArray(backupData.accounts)) setAccounts(backupData.accounts);
      if (Array.isArray(backupData.rules)) setRules(backupData.rules);
      if (backupData.playbook) setPlaybook(backupData.playbook);
      if (Array.isArray(backupData.strategies)) setStrategies(backupData.strategies);
      if (Array.isArray(backupData.goals)) setGoals(backupData.goals);
      if (backupData.weeklyReview) setWeeklyReview(backupData.weeklyReview);
      if (Array.isArray(backupData.challengeDays)) setChallengeDays(backupData.challengeDays);
    }
  };

  // Factory reset
  const handleResetData = () => {
    setTrades(INITIAL_TRADES);
    setAccounts(INITIAL_ACCOUNTS);
    setRules(INITIAL_RULES);
    setPlaybook(INITIAL_DAILY_PLAYBOOK);
    setStrategies(INITIAL_STRATEGIES);
    setGoals(INITIAL_GOALS);
    setWeeklyReview(INITIAL_WEEKLY_REVIEW);
    setChallengeDays(INITIAL_CHALLENGE_DAYS);
    try {
      localStorage.clear();
    } catch (e) {}
  };

  const activeThemeDef = THEME_DEFINITIONS[visualSettings.theme] || THEME_DEFINITIONS['variation-3-terminal'];

  return (
    <div 
      data-theme={visualSettings.theme} 
      style={{
        '--bg-primary': activeThemeDef.bgPrimary,
        '--surface-primary': activeThemeDef.surfacePrimary,
        '--surface-secondary': activeThemeDef.surfaceSecondary,
        '--surface-tertiary': activeThemeDef.surfaceTertiary,
        '--accent-primary': activeThemeDef.accentPrimary,
        '--accent-secondary': activeThemeDef.accentSecondary,
        '--accent-glow': activeThemeDef.accentSecondary,
        '--pnl-positive': activeThemeDef.pnlPositive,
        '--pnl-negative': activeThemeDef.pnlNegative,
        '--border-subtle': activeThemeDef.borderColor,
        '--border-hover': activeThemeDef.accentPrimary,
        '--glow-color': activeThemeDef.glowColor,
      } as React.CSSProperties}
      className="min-h-screen bg-[var(--bg-primary)] text-[#E0E0E0] font-mono flex flex-col antialiased relative selection:bg-[var(--accent-primary)] selection:text-black overflow-x-hidden"
    >
      {/* 1. TOP BAR - Exact match to user screenshot */}
      <header className="h-16 px-4 sm:px-6 bg-[#0B0C0D] border-b border-[#222326] flex items-center justify-between shrink-0 z-30 select-none">
        {/* Left: Boxed Logo */}
        <div className="flex items-center gap-4">
          <div className="logo-box flex items-center gap-2.5">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0">
              <defs>
                <linearGradient id="termLogoGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#BB86FC" />
                  <stop offset="100%" stopColor="#03DAC6" />
                </linearGradient>
              </defs>
              <rect x="15" y="21" width="4.5" height="12" rx="1.5" fill="url(#termLogoGrad)" opacity="0.85" />
              <rect x="21" y="15" width="4.5" height="18" rx="1.5" fill="url(#termLogoGrad)" />
              <rect x="27" y="9" width="4.5" height="24" rx="1.5" fill="url(#termLogoGrad)" />
              <path d="M 10 27 C 9 20, 12 14, 18 10 C 22 7.5, 26 6.5, 31 7" stroke="#BB86FC" strokeWidth="3" strokeLinecap="round" />
              <path d="M 27 4.5 L 33 7 L 29 12.5 Z" fill="#BB86FC" />
            </svg>
            <span className="font-syne font-extrabold tracking-tight text-white">
              DDY <span className="text-[#BB86FC]" style={{ fontSize: '12.4px', lineHeight: '0.6px' }}>TradePath</span>
            </span>
          </div>
        </div>

        {/* Center: System Status & UTC Clock */}
        <div className="hidden md:flex items-center gap-8 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#666666]">SYS_STATUS:</span>
            <span className="text-[#03DAC6] font-bold">PERSISTENT_LOCAL</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#666666]">CONS_PORTFOLIO:</span>
            <span className="text-[#BB86FC] font-bold font-mono">
              ${activeAccount.currentBalance.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#666666]">TIME_UTC:</span>
            <span className="text-[#03DAC6] font-bold font-mono">{utcTime}</span>
          </div>
        </div>

        {/* Right: Quick actions & Purple Execution Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsVisualsOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-[#222326] hover:border-[#BB86FC] text-[#888] hover:text-[#BB86FC] bg-[#151618] text-xs font-mono transition-colors cursor-pointer"
            title="Open Theme & Audio Settings"
          >
            <Sparkles size={12} className="text-[#BB86FC]" />
            <span>THEME</span>
          </button>

          <button
            onClick={() => setIsUrduGuideOpen(true)}
            className="hidden lg:flex items-center px-2.5 py-1.5 border border-[#222326] hover:border-[#03DAC6] text-[#888] hover:text-[#03DAC6] bg-[#151618] text-xs font-mono transition-colors cursor-pointer"
            title="Quotex Guide (Urdu / English)"
          >
            GUIDE
          </button>

          {/* Solid Rectangular Purple Button from Screenshot */}
          <button
            onClick={() => {
              playClickSound(visualSettings.soundEffects);
              setIsLogTradeOpen(true);
            }}
            className="bg-[#BB86FC] hover:bg-[#cda6ff] active:scale-95 text-[#0B0C0D] font-bold px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all duration-150 cursor-pointer shadow-[0_0_18px_rgba(187,134,252,0.35)]"
          >
            LOG NEW EXECUTION
          </button>
        </div>
      </header>

      {/* 2. 3-PANE TERMINAL VIEWPORT - Exact layout as user screenshot */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* PANE 1: LEFT NAVIGATION [DIR] (240px) */}
        <aside className="w-full md:w-[240px] shrink-0 border-r border-[#222326] flex flex-col bg-[#0B0C0D] select-none">
          <div className="pane-header">
            <span>NAVIGATION</span>
            <span className="text-[#666666]">[DIR]</span>
          </div>

          <div className="p-2.5 flex flex-col gap-1 overflow-y-auto flex-1">
            <button
              onClick={() => handleSelectTab('dashboard')}
              className={`nav-link w-full cursor-pointer flex items-center justify-between ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <span>CMD_CENTER</span>
            </button>

            <button
              onClick={() => handleSelectTab('challenge')}
              className={`nav-link w-full cursor-pointer flex items-center justify-between ${activeTab === 'challenge' ? 'active' : ''}`}
            >
              <span>$100_TO_$5K</span>
              <span className="text-[10px] text-[#03DAC6] font-bold">30D</span>
            </button>

            <button
              onClick={() => handleSelectTab('playbook')}
              className={`nav-link w-full cursor-pointer flex items-center justify-between ${activeTab === 'playbook' ? 'active' : ''}`}
            >
              <span>PLAYBOOK</span>
            </button>

            <button
              onClick={() => handleSelectTab('journal')}
              className={`nav-link w-full cursor-pointer flex items-center justify-between ${activeTab === 'journal' ? 'active' : ''}`}
            >
              <span>JOURNAL_DATA</span>
              <span className="text-[10px] text-[#666] font-mono">{accountTrades.length}</span>
            </button>

            <button
              onClick={() => handleSelectTab('analytics')}
              className={`nav-link w-full cursor-pointer flex items-center justify-between ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <span>PERF_ANALYTICS</span>
            </button>

            <button
              onClick={() => handleSelectTab('gemini-chat')}
              className={`nav-link w-full cursor-pointer flex items-center justify-between ${activeTab === 'gemini-chat' ? 'active' : ''}`}
            >
              <span>GEMINI_AI</span>
              <span className="text-[9px] text-[#BB86FC] font-bold px-1 bg-[#BB86FC]/10 border border-[#BB86FC]/30">PRO</span>
            </button>

            <button
              onClick={() => handleSelectTab('settings')}
              className={`nav-link w-full cursor-pointer flex items-center justify-between ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <span>SYS_SETTINGS</span>
            </button>

            {/* Extended Modules */}
            <div className="pt-3 mt-3 border-t border-[#222326] space-y-1">
              <div className="text-[9px] uppercase tracking-wider text-[#555] px-3 mb-1">
                // SYSTEM_SUBSYSTEMS
              </div>

              <button
                onClick={() => handleSelectTab('rules')}
                className={`nav-link w-full cursor-pointer flex items-center justify-between ${activeTab === 'rules' ? 'active' : ''}`}
              >
                <span>RULES_ENGINE</span>
              </button>

              <button
                onClick={() => handleSelectTab('psychology')}
                className={`nav-link w-full cursor-pointer flex items-center justify-between ${activeTab === 'psychology' ? 'active' : ''}`}
              >
                <span>PSYCHOLOGY</span>
              </button>

              <button
                onClick={() => handleSelectTab('calculator')}
                className={`nav-link w-full cursor-pointer flex items-center justify-between ${activeTab === 'calculator' ? 'active' : ''}`}
              >
                <span>RISK_CALCULATOR</span>
              </button>

              <button
                onClick={() => handleSelectTab('strategy')}
                className={`nav-link w-full cursor-pointer flex items-center justify-between ${activeTab === 'strategy' ? 'active' : ''}`}
              >
                <span>STRATEGY_LAB</span>
              </button>

              <button
                onClick={() => handleSelectTab('portfolio')}
                className={`nav-link w-full cursor-pointer flex items-center justify-between ${activeTab === 'portfolio' ? 'active' : ''}`}
              >
                <span>PORTFOLIO_ACCOUNTS</span>
              </button>
            </div>
          </div>

          {/* Account Subsystem Bar */}
          <div className="p-3 border-t border-[#222326] bg-[#151618] text-[11px] font-mono">
            <div className="flex items-center justify-between text-[#888] mb-1">
              <span>BROKER:</span>
              <span className="text-[#03DAC6] font-bold">QUOTEX OTC</span>
            </div>
            <div className="flex items-center justify-between text-[#888]">
              <span>ACTIVE_ACC:</span>
              <button 
                onClick={() => setIsEditAccountOpen(true)}
                className="text-[#BB86FC] hover:underline truncate max-w-[120px] text-right cursor-pointer"
                title="Edit account balance"
              >
                {activeAccount.name.replace('Quotex ', '')}
              </button>
            </div>
          </div>
        </aside>

        {/* PANE 2: CENTER EXECUTION GRID */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0B0C0D]">
          <div className="pane-header shrink-0">
            <span>
              {activeTab === 'challenge' ? 'CENTRAL EXECUTION GRID' : 
               activeTab === 'dashboard' ? 'EXECUTIVE COMMAND CENTER' :
               activeTab === 'journal' ? 'TRANSACTION LEDGER' :
               activeTab === 'playbook' ? 'DAILY DISCIPLINE PLAYBOOK' :
               activeTab === 'analytics' ? 'PERFORMANCE METRICS MATRIX' :
               activeTab === 'gemini-chat' ? 'GEMINI COGNITIVE TERMINAL' :
               activeTab === 'settings' ? 'SYSTEM PARAMETERS & EXPORT' :
               activeTab.toUpperCase()}
            </span>
            <span className="text-[#03DAC6] font-bold">
              TARGET: $5,000.00
            </span>
          </div>

          {/* Scrollable View Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-8">
            {activeTab === 'challenge' && (
              <ChallengeTargetView
                challengeDays={challengeDays}
                onUpdateDay={handleUpdateChallengeDay}
                todayTrades={accountTrades}
              />
            )}

            {activeTab === 'dashboard' && (
              <DashboardView
                trades={accountTrades}
                stats={calculatedStats}
                account={activeAccount}
                onOpenLogTrade={() => setIsLogTradeOpen(true)}
                onOpenAutoImport={() => setIsAutoImportOpen(true)}
                onSelectTrade={(t) => setInspectTrade(t)}
                onSelectDate={(dateStr) => {
                  setSelectedDateFilter(dateStr);
                  if (dateStr) setActiveTab('journal');
                }}
                selectedDate={selectedDateFilter}
                onOpenChallenge={() => setActiveTab('challenge')}
              />
            )}

            {activeTab === 'journal' && (
              <TradeJournalView
                trades={accountTrades}
                onSelectTrade={(t) => setInspectTrade(t)}
                onOpenLogTrade={() => setIsLogTradeOpen(true)}
                onOpenAutoImport={() => setIsAutoImportOpen(true)}
                onDeleteTrade={handleDeleteTrade}
                selectedDateFilter={selectedDateFilter}
                onClearDateFilter={() => setSelectedDateFilter(null)}
              />
            )}

            {activeTab === 'playbook' && (
              <DailyJournalView
                plan={playbook}
                onSavePlan={setPlaybook}
                trades={accountTrades}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                trades={accountTrades}
                stats={calculatedStats}
                account={activeAccount}
                onOpenLogTrade={() => setIsLogTradeOpen(true)}
              />
            )}

            {activeTab === 'gemini-chat' && (
              <GeminiChatbotView
                trades={accountTrades}
                challengeDays={challengeDays}
              />
            )}

            {activeTab === 'rules' && (
              <RulesEngineView
                rules={rules}
                trades={accountTrades}
                onToggleRule={handleToggleRule}
                onAddRule={handleAddRule}
                onDeleteRule={handleDeleteRule}
              />
            )}

            {activeTab === 'psychology' && (
              <PsychologyView
                trades={accountTrades}
              />
            )}

            {activeTab === 'calculator' && (
              <RiskCalculatorView />
            )}

            {activeTab === 'strategy' && (
              <StrategyLabView
                strategies={strategies}
                trades={accountTrades}
                onAddStrategy={(newS) => setStrategies((prev) => [...prev, newS])}
              />
            )}

            {activeTab === 'portfolio' && (
              <PortfolioView
                accounts={computedAccounts}
                trades={trades}
                selectedAccountId={selectedAccountId}
                onSelectAccount={setSelectedAccountId}
                onOpenEditAccount={() => setIsEditAccountOpen(true)}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                trades={trades}
                accounts={computedAccounts}
                rules={rules}
                playbook={playbook}
                strategies={strategies}
                goals={goals}
                weeklyReview={weeklyReview}
                challengeDays={challengeDays}
                onImportBackup={handleImportBackup}
                onResetData={handleResetData}
                onOpenVisuals={() => setIsVisualsOpen(true)}
                onOpenEditAccount={() => setIsEditAccountOpen(true)}
              />
            )}

            {activeTab === 'review' && (
              <WeeklyReviewView
                review={weeklyReview}
                trades={accountTrades}
                onSaveReview={setWeeklyReview}
              />
            )}

            {activeTab === 'goals' && (
              <GoalsView
                goals={goals}
                stats={calculatedStats}
              />
            )}
          </div>
        </main>

        {/* PANE 3: RIGHT INTELLIGENCE & DATA [METRICS] (340px) - Exact match to user screenshot */}
        <aside className="hidden xl:flex w-[340px] shrink-0 border-l border-[#222326] flex-col bg-[#0B0C0D] overflow-y-auto select-none">
          <div className="pane-header">
            <span>INTELLIGENCE &amp; DATA</span>
            <span className="text-[#666666]">[METRICS]</span>
          </div>

          <div className="p-6 space-y-8">
            {/* Metric 1: Total Achieved Days */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#666666] font-mono mb-1">
                TOTAL ACHIEVED DAYS
              </div>
              <div className="font-syne text-5xl font-extrabold text-[#BB86FC] tracking-tight">
                {achievedDays.length}
              </div>
            </div>

            {/* Metric 2: Current Balance */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#666666] font-mono mb-1">
                CURRENT BALANCE
              </div>
              <div className="font-syne text-5xl font-extrabold text-[#03DAC6] tracking-tight">
                {formatCurrency(currentEquity)}
              </div>
            </div>

            {/* Metric 3: Discipline Index */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#666666] font-mono mb-1">
                DISCIPLINE INDEX
              </div>
              <div className="font-syne text-5xl font-extrabold text-[#BB86FC] tracking-tight">
                {calculatedStats.rulesAdherencePercent}%
              </div>
            </div>

            {/* Gemini AI Coach Card - Exact border & color as screenshot */}
            <div className="border border-[#BB86FC] bg-[#151618] p-4 font-mono shadow-[0_0_20px_rgba(187,134,252,0.15)]">
              <div className="text-sm font-bold text-[#BB86FC] mb-2 flex items-center justify-between">
                <span>Gemini AI Coach</span>
                <span className="text-[9px] text-[#03DAC6] font-bold px-1.5 py-0.5 bg-[#03DAC6]/10 border border-[#03DAC6]/30">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#E0E0E0] leading-relaxed">
                Analysis: You are currently on Day {activeCycle.day}. Recommended exposure is ${activeCycle.lotSize} per trade. Maintain volume control.
              </p>
              <button
                onClick={() => handleSelectTab('gemini-chat')}
                className="mt-3 text-[10px] text-[#BB86FC] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <span>&gt; LAUNCH AI ADVISORY</span>
              </button>
            </div>

            {/* Audio / Voice Quick Toggles */}
            <div className="p-3 border border-[#222326] bg-[#151618] space-y-2">
              <div className="text-[10px] text-[#666] uppercase tracking-wider flex items-center justify-between">
                <span>TERMINAL_AUDIO</span>
                <span className="text-[#03DAC6]">STATUS_OK</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#888]">Voice Callouts:</span>
                <button
                  onClick={() => setVisualSettings(s => ({ ...s, voiceAlerts: !s.voiceAlerts }))}
                  className={`px-2 py-0.5 text-[10px] font-bold border ${visualSettings.voiceAlerts ? 'border-[#03DAC6] text-[#03DAC6] bg-[#03DAC6]/10' : 'border-[#444] text-[#666]'}`}
                >
                  {visualSettings.voiceAlerts ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#888]">Sound FX:</span>
                <button
                  onClick={() => setVisualSettings(s => ({ ...s, soundEffects: !s.soundEffects }))}
                  className={`px-2 py-0.5 text-[10px] font-bold border ${visualSettings.soundEffects ? 'border-[#BB86FC] text-[#BB86FC] bg-[#BB86FC]/10' : 'border-[#444] text-[#666]'}`}
                >
                  {visualSettings.soundEffects ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 3. TERMINAL BOTTOM FOOTER STATUS */}
      <footer className="h-8 px-4 bg-[#0B0C0D] border-t border-[#222326] hidden md:flex items-center justify-between text-[11px] text-[#666666] shrink-0 z-20 select-none">
        <div className="flex items-center gap-4">
          <span className="text-[#BB86FC] font-bold">DDY_TRADEPATH // QUOTEX</span>
          <span>OTC COMPOUND CHALLENGE</span>
        </div>
        <div className="flex items-center gap-6">
          <span>WIN_RATE: <strong className="text-[#03DAC6]">{calculatedStats.winRate}%</strong></span>
          <span>NET_PNL: <strong className={calculatedStats.netPnl >= 0 ? "text-[#03DAC6]" : "text-[#CF6679]"}>{formatCurrency(calculatedStats.netPnl)}</strong></span>
          <span>SESSION: <strong className="text-white">ACTIVE</strong></span>
        </div>
      </footer>

      {/* Mobile Floating Action Button (+) */}
      <button
        onClick={() => {
          playClickSound(visualSettings.soundEffects);
          setIsLogTradeOpen(true);
        }}
        className="md:hidden fixed bottom-6 right-6 z-40 w-12 h-12 bg-[#BB86FC] text-[#0B0C0D] flex items-center justify-center shadow-[0_0_20px_rgba(187,134,252,0.6)] cursor-pointer"
        title="Log Trade"
      >
        <Plus size={22} className="stroke-[3]" />
      </button>

      {/* Mobile Navigation bar */}
      <div className="md:hidden">
        <MobileNav
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenLogTrade={() => setIsLogTradeOpen(true)}
        />
      </div>

      {/* Global Modals */}
      <LogTradeModal
        isOpen={isLogTradeOpen}
        onClose={() => setIsLogTradeOpen(false)}
        onSaveTrade={handleSaveTrade}
        accounts={computedAccounts.filter((a: TradingAccount) => a.id !== 'acc-all')}
        rules={rules}
        defaultAccountId={selectedAccountId === 'acc-all' ? 'acc-quotex-live' : selectedAccountId}
      />

      <AutoImportModal
        isOpen={isAutoImportOpen}
        onClose={() => setIsAutoImportOpen(false)}
        onImportTrades={handleImportTrades}
      />

      <TradeDetailModal
        trade={inspectTrade}
        onClose={() => setInspectTrade(null)}
        onDeleteTrade={handleDeleteTrade}
        candleStyle={visualSettings.candleStyle}
      />

      <UrduGuideModal
        isOpen={isUrduGuideOpen}
        onClose={() => setIsUrduGuideOpen(false)}
      />

      <VisualsModal
        isOpen={isVisualsOpen}
        onClose={() => setIsVisualsOpen(false)}
        settings={visualSettings}
        onUpdateSettings={(newSettings) =>
          setVisualSettings((prev) => ({ ...prev, ...newSettings }))
        }
        onResetSettings={() =>
          setVisualSettings({
            theme: 'variation-3-terminal',
            candleStyle: 'neon',
            pnlColorway: 'neon-vivid',
            density: 'comfortable',
            ambientGlow: true,
            soundEffects: true,
            voiceAlerts: true,
            gridIntensity: 'subtle',
          })
        }
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={handleSelectTab}
        onOpenLogTrade={() => {
          setIsCommandPaletteOpen(false);
          setIsLogTradeOpen(true);
        }}
        onOpenAutoImport={() => {
          setIsCommandPaletteOpen(false);
          setIsAutoImportOpen(true);
        }}
        trades={accountTrades}
        onSelectTrade={(t) => {
          setInspectTrade(t);
        }}
        onOpenVisuals={() => setIsVisualsOpen(true)}
      />

      <EditAccountModal
        isOpen={isEditAccountOpen}
        onClose={() => setIsEditAccountOpen(false)}
        accounts={computedAccounts}
        selectedAccountId={selectedAccountId}
        onUpdateAccount={handleUpdateAccount}
      />
    </div>
  );
}
