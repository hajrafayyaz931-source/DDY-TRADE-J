import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveGridLayout, useContainerWidth, Layout, ResponsiveLayouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { Trade, TradingAccount, TradingStats } from '../../types/trade';
import { EquityCurveChart } from '../charts/EquityCurveChart';
import { DailyPnlBarChart, WinLossDonutChart } from '../charts/AnalyticsCharts';
import { CalendarHeatmap } from '../charts/CalendarHeatmap';
import { StreakProtectorWidget } from '../ui/StreakProtectorWidget';
import { ProfitLockWidget } from '../ui/ProfitLockWidget';
import { DailyTargetTrackerWidget } from '../ui/DailyTargetTrackerWidget';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  ShieldCheck, 
  Percent, 
  Flame, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Download, 
  BrainCircuit, 
  Sparkles,
  AlertCircle,
  GripVertical,
  LayoutGrid,
  RotateCcw,
  Check,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Layers,
  LineChart,
  BarChart3,
  Calendar as CalendarIcon,
  Activity,
  Maximize2,
  Info
} from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';
import { generateAITradingInsights } from '../../utils/aiCoach';
import { playClickSound, playWinSound, playThemeSound } from '../../utils/soundEffects';

interface DashboardViewProps {
  trades: Trade[];
  stats: TradingStats;
  account: TradingAccount;
  onOpenLogTrade: () => void;
  onOpenAutoImport: () => void;
  onSelectTrade: (trade: Trade) => void;
  onSelectDate: (dateStr: string) => void;
  selectedDate: string | null;
  onOpenChallenge?: () => void;
}

export type WidgetId =
  | 'kpis'
  | 'equity_curve'
  | 'daily_pnl'
  | 'win_loss'
  | 'calendar'
  | 'recent_trades'
  | 'ai_coach';

interface WidgetMeta {
  id: WidgetId;
  title: string;
  badge: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
}

const WIDGET_METAS: Record<WidgetId, WidgetMeta> = {
  kpis: {
    id: 'kpis',
    title: 'Performance KPI Telemetry',
    badge: '7 Realized Metrics',
    icon: Activity,
    accentColor: '#10B981',
  },
  equity_curve: {
    id: 'equity_curve',
    title: 'Institutional Equity Curve',
    badge: 'Real-Time Trajectory',
    icon: LineChart,
    accentColor: '#8B5CF6',
  },
  daily_pnl: {
    id: 'daily_pnl',
    title: 'Daily Realized PnL ($)',
    badge: '14-Session Distribution',
    icon: BarChart3,
    accentColor: '#10B981',
  },
  win_loss: {
    id: 'win_loss',
    title: 'Win / Loss Ratio & Edge',
    badge: 'Win / Loss / Tie',
    icon: Percent,
    accentColor: '#C084FC',
  },
  calendar: {
    id: 'calendar',
    title: 'Trading Calendar Heatmap',
    badge: 'Monthly Execution Frequency',
    icon: CalendarIcon,
    accentColor: '#10B981',
  },
  recent_trades: {
    id: 'recent_trades',
    title: 'Recent Executions Blotter',
    badge: 'Live Execution Feed',
    icon: Layers,
    accentColor: '#8B5CF6',
  },
  ai_coach: {
    id: 'ai_coach',
    title: 'TradePath AI Intelligence',
    badge: 'Edge & Leak Detection',
    icon: BrainCircuit,
    accentColor: '#C084FC',
  },
};

const STORAGE_KEY = 'tradepath_dashboard_layouts_v2';
const VISIBILITY_KEY = 'tradepath_dashboard_visibility_v2';

const DEFAULT_LAYOUTS: ResponsiveLayouts<string> = {
  lg: [
    { i: 'kpis', x: 0, y: 0, w: 12, h: 4, minW: 6, minH: 3 },
    { i: 'equity_curve', x: 0, y: 4, w: 12, h: 11, minW: 6, minH: 7 },
    { i: 'daily_pnl', x: 0, y: 15, w: 8, h: 10, minW: 4, minH: 7 },
    { i: 'win_loss', x: 8, y: 15, w: 4, h: 10, minW: 3, minH: 6 },
    { i: 'calendar', x: 0, y: 25, w: 12, h: 9, minW: 6, minH: 6 },
    { i: 'recent_trades', x: 0, y: 34, w: 8, h: 11, minW: 4, minH: 7 },
    { i: 'ai_coach', x: 8, y: 34, w: 4, h: 11, minW: 3, minH: 7 },
  ],
  md: [
    { i: 'kpis', x: 0, y: 0, w: 10, h: 5, minW: 5, minH: 3 },
    { i: 'equity_curve', x: 0, y: 5, w: 10, h: 11, minW: 5, minH: 7 },
    { i: 'daily_pnl', x: 0, y: 16, w: 10, h: 10, minW: 4, minH: 7 },
    { i: 'win_loss', x: 0, y: 26, w: 10, h: 9, minW: 3, minH: 6 },
    { i: 'calendar', x: 0, y: 35, w: 10, h: 9, minW: 5, minH: 6 },
    { i: 'recent_trades', x: 0, y: 44, w: 10, h: 11, minW: 4, minH: 7 },
    { i: 'ai_coach', x: 0, y: 55, w: 10, h: 10, minW: 3, minH: 6 },
  ],
  sm: [
    { i: 'kpis', x: 0, y: 0, w: 6, h: 7, minW: 3, minH: 3 },
    { i: 'equity_curve', x: 0, y: 7, w: 6, h: 11, minW: 3, minH: 7 },
    { i: 'daily_pnl', x: 0, y: 18, w: 6, h: 10, minW: 3, minH: 6 },
    { i: 'win_loss', x: 0, y: 28, w: 6, h: 9, minW: 3, minH: 6 },
    { i: 'calendar', x: 0, y: 37, w: 6, h: 9, minW: 3, minH: 6 },
    { i: 'recent_trades', x: 0, y: 46, w: 6, h: 11, minW: 3, minH: 7 },
    { i: 'ai_coach', x: 0, y: 57, w: 6, h: 10, minW: 3, minH: 6 },
  ],
  xs: [
    { i: 'kpis', x: 0, y: 0, w: 4, h: 10 },
    { i: 'equity_curve', x: 0, y: 10, w: 4, h: 10 },
    { i: 'daily_pnl', x: 0, y: 20, w: 4, h: 9 },
    { i: 'win_loss', x: 0, y: 29, w: 4, h: 9 },
    { i: 'calendar', x: 0, y: 38, w: 4, h: 10 },
    { i: 'recent_trades', x: 0, y: 48, w: 4, h: 11 },
    { i: 'ai_coach', x: 0, y: 59, w: 4, h: 10 },
  ],
  xxs: [
    { i: 'kpis', x: 0, y: 0, w: 2, h: 14 },
    { i: 'equity_curve', x: 0, y: 14, w: 2, h: 10 },
    { i: 'daily_pnl', x: 0, y: 24, w: 2, h: 9 },
    { i: 'win_loss', x: 0, y: 33, w: 2, h: 9 },
    { i: 'calendar', x: 0, y: 42, w: 2, h: 10 },
    { i: 'recent_trades', x: 0, y: 52, w: 2, h: 11 },
    { i: 'ai_coach', x: 0, y: 63, w: 2, h: 10 },
  ],
};

// Preset: Chart Focused Workstation
const PRESET_CHARTS: ResponsiveLayouts<string> = {
  lg: [
    { i: 'equity_curve', x: 0, y: 0, w: 12, h: 11, minW: 6, minH: 7 },
    { i: 'daily_pnl', x: 0, y: 11, w: 7, h: 10, minW: 4, minH: 7 },
    { i: 'win_loss', x: 7, y: 11, w: 5, h: 10, minW: 3, minH: 6 },
    { i: 'kpis', x: 0, y: 21, w: 12, h: 4, minW: 6, minH: 3 },
    { i: 'calendar', x: 0, y: 25, w: 12, h: 9, minW: 6, minH: 6 },
    { i: 'recent_trades', x: 0, y: 34, w: 8, h: 11, minW: 4, minH: 7 },
    { i: 'ai_coach', x: 8, y: 34, w: 4, h: 11, minW: 3, minH: 7 },
  ],
};

// Preset: Execution Calendar & Journal Blotter
const PRESET_CALENDAR: ResponsiveLayouts<string> = {
  lg: [
    { i: 'kpis', x: 0, y: 0, w: 12, h: 4, minW: 6, minH: 3 },
    { i: 'calendar', x: 0, y: 4, w: 12, h: 9, minW: 6, minH: 6 },
    { i: 'recent_trades', x: 0, y: 13, w: 8, h: 11, minW: 4, minH: 7 },
    { i: 'ai_coach', x: 8, y: 13, w: 4, h: 11, minW: 3, minH: 7 },
    { i: 'equity_curve', x: 0, y: 24, w: 12, h: 10, minW: 6, minH: 7 },
    { i: 'daily_pnl', x: 0, y: 34, w: 7, h: 9, minW: 4, minH: 6 },
    { i: 'win_loss', x: 7, y: 34, w: 5, h: 9, minW: 3, minH: 6 },
  ],
};

// Preset: Quant Edge & Intelligence Focus
const PRESET_QUANT: ResponsiveLayouts<string> = {
  lg: [
    { i: 'kpis', x: 0, y: 0, w: 12, h: 4, minW: 6, minH: 3 },
    { i: 'ai_coach', x: 0, y: 4, w: 6, h: 11, minW: 3, minH: 7 },
    { i: 'win_loss', x: 6, y: 4, w: 6, h: 11, minW: 3, minH: 6 },
    { i: 'daily_pnl', x: 0, y: 15, w: 12, h: 10, minW: 4, minH: 7 },
    { i: 'equity_curve', x: 0, y: 25, w: 12, h: 11, minW: 6, minH: 7 },
    { i: 'calendar', x: 0, y: 36, w: 6, h: 9, minW: 4, minH: 6 },
    { i: 'recent_trades', x: 6, y: 36, w: 6, h: 9, minW: 4, minH: 6 },
  ],
};

export function DashboardView({
  trades,
  stats,
  account,
  onOpenLogTrade,
  onOpenAutoImport,
  onSelectTrade,
  onSelectDate,
  selectedDate,
  onOpenChallenge,
}: DashboardViewProps) {
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1200 });
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);
  const [saveBanner, setSaveBanner] = useState(false);

  // Layouts state
  const [layouts, setLayouts] = useState<ResponsiveLayouts<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.lg) {
          return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_LAYOUTS;
  });

  // Widget visibility state
  const [visibleWidgets, setVisibleWidgets] = useState<Record<WidgetId, boolean>>(() => {
    try {
      const saved = localStorage.getItem(VISIBILITY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      kpis: true,
      equity_curve: true,
      daily_pnl: true,
      win_loss: true,
      calendar: true,
      recent_trades: true,
      ai_coach: true,
    };
  });

  // Synchronized Crosshair Telemetry state across Equity Curve, Daily PnL and Calendar
  const [crosshairDate, setCrosshairDate] = useState<string | null>(null);

  const insights = generateAITradingInsights(trades);
  const recentTrades = [...trades]
    .sort((a, b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`))
    .slice(0, 8);

  const kpis = [
    {
      title: 'Total Net Realized PnL',
      val: `${stats.netPnl >= 0 ? '+' : ''}${formatCurrency(stats.netPnl)}`,
      sub: `${stats.totalTrades} closed trades`,
      isPos: stats.netPnl >= 0,
      icon: stats.netPnl >= 0 ? TrendingUp : TrendingDown,
      color: stats.netPnl >= 0 ? '#10B981' : '#EF4444',
    },
    {
      title: 'Win Rate (Edge)',
      val: `${stats.winRate.toFixed(1)}%`,
      sub: `${stats.winCount}W • ${stats.lossCount}L • ${stats.tieCount}T`,
      isPos: stats.winRate >= 50,
      icon: Percent,
      color: stats.winRate >= 50 ? '#10B981' : '#EF4444',
    },
    {
      title: 'Profit Factor',
      val: stats.profitFactor > 50 ? '99.9' : stats.profitFactor.toFixed(2),
      sub: `Gross Win / Gross Loss`,
      isPos: stats.profitFactor >= 1.5,
      icon: Target,
      color: stats.profitFactor >= 1.5 ? '#8B5CF6' : '#EF4444',
    },
    {
      title: 'Average R-Multiple',
      val: `${stats.averageR > 0 ? '+' : ''}${stats.averageR.toFixed(2)}R`,
      sub: `Expectancy: +$${stats.expectancy.toFixed(2)}/trade`,
      isPos: stats.averageR > 0,
      icon: Sparkles,
      color: '#C084FC',
    },
    {
      title: 'Max Drawdown',
      val: `-${formatCurrency(stats.maxDrawdown)}`,
      sub: `Peak to trough (${stats.maxDrawdownPercent.toFixed(1)}%)`,
      isPos: stats.maxDrawdownPercent < 5,
      icon: AlertCircle,
      color: '#EF4444',
    },
    {
      title: 'Rules Adherence',
      val: `${stats.rulesAdherencePercent}%`,
      sub: `Pre-trade checklist compliance`,
      isPos: stats.rulesAdherencePercent >= 80,
      icon: ShieldCheck,
      color: '#10B981',
    },
    {
      title: 'Active Streak',
      val: `${stats.currentStreak} ${stats.currentStreakType === 'win' ? 'Wins' : stats.currentStreakType === 'loss' ? 'Losses' : 'Trades'}`,
      sub: `Best streak: ${stats.bestWinStreak} wins`,
      isPos: stats.currentStreakType === 'win',
      icon: Flame,
      color: stats.currentStreakType === 'win' ? '#F59E0B' : '#EF4444',
    },
  ];

  // Layout change handler
  const handleLayoutChange = (_currentLayout: Layout, allLayouts: ResponsiveLayouts<string>) => {
    setLayouts(allLayouts);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allLayouts));
    } catch (e) {}
  };

  // Toggle widget visibility
  const toggleWidget = (id: WidgetId) => {
    playClickSound();
    setVisibleWidgets(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(VISIBILITY_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Apply layout preset
  const applyPreset = (presetKey: 'default' | 'charts' | 'calendar' | 'quant') => {
    playThemeSound();
    let selected: ResponsiveLayouts<string> = DEFAULT_LAYOUTS;
    if (presetKey === 'charts') selected = { ...DEFAULT_LAYOUTS, ...PRESET_CHARTS };
    if (presetKey === 'calendar') selected = { ...DEFAULT_LAYOUTS, ...PRESET_CALENDAR };
    if (presetKey === 'quant') selected = { ...DEFAULT_LAYOUTS, ...PRESET_QUANT };

    setLayouts(selected);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    } catch (e) {}
  };

  // Reset to default
  const handleResetLayout = () => {
    playThemeSound();
    setLayouts(DEFAULT_LAYOUTS);
    const allVisible: Record<WidgetId, boolean> = {
      kpis: true,
      equity_curve: true,
      daily_pnl: true,
      win_loss: true,
      calendar: true,
      recent_trades: true,
      ai_coach: true,
    };
    setVisibleWidgets(allVisible);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LAYOUTS));
      localStorage.setItem(VISIBILITY_KEY, JSON.stringify(allVisible));
    } catch (e) {}
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2400);
  };

  // Save and lock
  const handleSaveAndLock = () => {
    playWinSound();
    setIsCustomizing(false);
    setShowWidgetMenu(false);
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2400);
  };

  // Render widget frame with institutional drag handle
  const renderWidgetContainer = (meta: WidgetMeta, children: React.ReactNode) => {
    const Icon = meta.icon;

    return (
      <div className={`h-full flex flex-col trade-card rounded-2xl border transition-all duration-200 overflow-hidden shadow-lg ${
        isCustomizing ? 'border-amber-500/50 hover:border-amber-400' : 'border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
      }`}>
        {/* Institutional Drag Grip Header */}
        <div className={`widget-drag-handle flex items-center justify-between px-3.5 py-2.5 select-none transition-colors shrink-0 ${
          isCustomizing 
            ? 'bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] border-b border-amber-500/30 cursor-grab active:cursor-grabbing' 
            : 'bg-[var(--surface-secondary)]/90 hover:bg-[var(--surface-tertiary)] border-b border-[var(--border-subtle)] cursor-grab active:cursor-grabbing backdrop-blur-md'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-0.5 rounded text-[#94A3B8] group-hover:text-[var(--accent-primary)] transition-colors">
              <GripVertical size={14} className={isCustomizing ? 'text-amber-400 animate-pulse' : 'text-[var(--accent-primary)]'} />
            </div>
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: `${meta.accentColor}25`, color: meta.accentColor }}
            >
              <Icon size={12} />
            </div>
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-200 truncate">
              {meta.title}
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[var(--surface-primary)] border border-[var(--border-subtle)] text-[var(--accent-secondary)] hidden sm:inline-block">
              {meta.badge}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isCustomizing && (
              <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                DRAG / RESIZE
              </span>
            )}
            {isCustomizing && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWidget(meta.id);
                }}
                className="p-1 hover:bg-[#201740] rounded text-[#94A3B8] hover:text-rose-400 transition-colors"
                title={`Hide ${meta.title}`}
              >
                <EyeOff size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Widget Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5">
          {children}
        </div>
      </div>
    );
  };

  const visibleCount = Object.values(visibleWidgets).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Personalized Institutional Top Greeting & Control Bar */}
      <div className="p-6 rounded-3xl trade-card border border-[var(--border-subtle)] shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[var(--accent-secondary)]">
            <span>COMMAND CENTER</span>
            <span>•</span>
            <span className="text-[var(--accent-primary)] font-bold">{account.name}</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1.5 tracking-tight font-sans">
            DDY TRADE JOURNAL Command Station
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl font-sans leading-relaxed">
            Real-time equity progression, Quotex binary execution tracking, and modular drag-and-drop trading workstation.
          </p>
        </div>

        {/* Quick Actions with Buttery Hover Micro-Interactions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Customization Mode Toggle */}
          <button
            onClick={() => {
              playClickSound();
              setIsCustomizing(!isCustomizing);
            }}
            className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
              isCustomizing
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse-subtle'
                : 'btn-glass-subtle text-slate-200'
            }`}
            title="Customize dashboard layout and reorder widgets"
          >
            <LayoutGrid size={15} className={isCustomizing ? 'text-amber-400' : 'text-[var(--accent-primary)]'} />
            <span>{isCustomizing ? 'Exit Customizer' : 'Customize Layout'}</span>
          </button>

          {onOpenChallenge && (
            <button
              onClick={onOpenChallenge}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)]/15 via-[var(--accent-secondary)]/15 to-[var(--accent-primary)]/15 hover:from-[var(--accent-primary)]/25 hover:to-[var(--accent-secondary)]/25 border border-[var(--accent-primary)]/35 text-[var(--accent-secondary)] text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_14px_var(--glow-color)] hover:scale-103 active:scale-97"
            >
              <Target size={15} className="text-[var(--accent-primary)]" />
              <span>$100 to $5K</span>
            </button>
          )}

          <button
            onClick={onOpenAutoImport}
            className="px-3.5 py-2 rounded-2xl btn-glass-subtle text-xs font-bold text-slate-200 flex items-center gap-2"
          >
            <Download size={15} className="text-[var(--accent-secondary)]" />
            <span>Quotex / CSV Import</span>
          </button>

          <button
            onClick={onOpenLogTrade}
            className="px-4 py-2 rounded-2xl btn-premium-purple text-xs font-bold flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Log Executed Trade</span>
          </button>
        </div>
      </div>

      {/* Real-time Daily Target Tracker */}
      <DailyTargetTrackerWidget 
        trades={trades} 
        defaultDailyTarget={account.dailyLossLimit ? Math.round(account.dailyLossLimit * 0.5) : 100} 
        defaultDailyLossLimit={account.dailyLossLimit || 200} 
      />

      {/* Trade Streak Protector & Profit Lock Shield Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <StreakProtectorWidget trades={trades} dailyLossLimit={account.dailyLossLimit} />
        <ProfitLockWidget trades={trades} startingBalance={account.startingBalance} onOpenLogTrade={onOpenLogTrade} />
      </div>

      {/* Save / Feedback Notification Banner */}
      {saveBanner && (
        <div className="p-3.5 rounded-xl bg-[#00D6A0]/15 border border-[#00D6A0]/40 flex items-center justify-between shadow-[0_0_20px_rgba(0,214,160,0.2)] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00D6A0] font-mono">
            <Check size={16} />
            <span>Layout successfully saved and locked to your device.</span>
          </div>
          <span className="text-[10px] text-slate-300 font-mono">Stored in Local Terminal State</span>
        </div>
      )}

      {/* Interactive Customization Studio Control Panel */}
      {isCustomizing && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#111A27] via-[#152234] to-[#111A27] border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)] flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <SlidersHorizontal size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Interactive Drag & Drop Layout Studio Active
                </h4>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Drag any widget by its top grip handle to reorder. Drag bottom-right corner to resize.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Layout Presets */}
            <div className="flex items-center bg-[var(--surface-primary)] p-1 rounded-2xl border border-[var(--border-subtle)] text-[11px] font-mono">
              <span className="px-2 text-[var(--accent-secondary)]">Presets:</span>
              <button
                onClick={() => applyPreset('default')}
                className="px-2.5 py-1 rounded-xl hover:bg-[var(--surface-secondary)] text-slate-200 transition-colors"
                title="Default balanced institutional dashboard"
              >
                Default
              </button>
              <button
                onClick={() => applyPreset('charts')}
                className="px-2.5 py-1 rounded-xl hover:bg-[var(--surface-secondary)] text-slate-200 transition-colors"
                title="Equity & PnL charts prioritized"
              >
                Charts
              </button>
              <button
                onClick={() => applyPreset('calendar')}
                className="px-2.5 py-1 rounded-xl hover:bg-[var(--surface-secondary)] text-slate-200 transition-colors"
                title="Calendar & Executions prioritized"
              >
                Calendar
              </button>
              <button
                onClick={() => applyPreset('quant')}
                className="px-2.5 py-1 rounded-xl hover:bg-[var(--surface-secondary)] text-slate-200 transition-colors"
                title="AI Edge & Win/Loss distribution prioritized"
              >
                Quant
              </button>
            </div>

            {/* Widgets Visibility Selector */}
            <div className="relative">
              <button
                onClick={() => setShowWidgetMenu(!showWidgetMenu)}
                className="px-3.5 py-1.5 rounded-2xl bg-[var(--surface-secondary)]/80 hover:bg-[var(--surface-tertiary)] border border-[var(--border-subtle)] text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all hover:scale-102 active:scale-98"
              >
                <Eye size={13} className="text-[var(--accent-primary)]" />
                <span>Widgets ({visibleCount}/7)</span>
              </button>

              {showWidgetMenu && (
                <div className="absolute right-0 top-10 w-64 bg-[var(--surface-primary)] backdrop-blur-2xl border border-[var(--border-hover)] rounded-2xl p-3 shadow-2xl z-50 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-secondary)] px-1 pb-1 border-b border-[var(--border-subtle)]">
                    Toggle Widget Visibility
                  </div>
                  {(Object.keys(WIDGET_METAS) as WidgetId[]).map((wid) => {
                    const isVis = visibleWidgets[wid];
                    const meta = WIDGET_METAS[wid];
                    return (
                      <button
                        key={wid}
                        onClick={() => toggleWidget(wid)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-mono transition-colors text-left ${
                          isVis ? 'bg-[var(--surface-secondary)] text-white hover:bg-[var(--surface-tertiary)]' : 'bg-transparent text-[#94A3B8] hover:text-slate-300'
                        }`}
                      >
                        <span className="truncate pr-2">{meta.title}</span>
                        {isVis ? <Eye size={12} className="text-[#10B981]" /> : <EyeOff size={12} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reset to Default */}
            <button
              onClick={handleResetLayout}
              className="px-3 py-1.5 rounded-2xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] border border-[var(--border-subtle)] text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all hover:scale-102 active:scale-98"
              title="Reset layout to default institutional configuration"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>

            {/* Save & Lock */}
            <button
              onClick={handleSaveAndLock}
              className="px-4 py-1.5 rounded-2xl btn-premium-purple text-xs font-bold flex items-center gap-1.5 font-mono"
            >
              <Check size={14} />
              <span>Save & Lock</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Draggable Responsive Grid Workstation */}
      <div ref={containerRef} className="w-full">
        {mounted && (
          <ResponsiveGridLayout
            width={width}
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={38}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            dragConfig={{
              enabled: true,
              handle: '.widget-drag-handle',
              threshold: 3,
              bounded: false,
            }}
            resizeConfig={{
              enabled: true,
              handles: ['se'],
            }}
            onLayoutChange={handleLayoutChange}
            className="layout"
          >
            {/* Widget 1: KPI Telemetry Cards */}
            {visibleWidgets.kpis && (
              <div key="kpis" className="h-full">
                {renderWidgetContainer(
                  WIDGET_METAS.kpis,
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 h-full">
                    {kpis.map((kpi, i) => {
                      const Icon = kpi.icon;
                      return (
                        <div
                          key={i}
                          className="trade-card rounded-2xl p-3.5 flex flex-col justify-between border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-all hover:scale-[1.02] duration-200 shadow-md group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] text-[var(--accent-secondary)] font-medium truncate block max-w-[90px] font-sans">
                                {kpi.title}
                              </span>
                              <div
                                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110"
                                style={{ backgroundColor: `${kpi.color}22`, color: kpi.color }}
                              >
                                <Icon size={12} />
                              </div>
                            </div>
                            <div className="text-base lg:text-lg font-extrabold font-mono text-white tracking-tight">
                              {kpi.val}
                            </div>
                          </div>

                          <div className="text-[9px] text-[#94A3B8] font-mono mt-1.5 truncate">
                            {kpi.sub}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Widget 2: Centerpiece Equity Progression Curve */}
            {visibleWidgets.equity_curve && (
              <div key="equity_curve" className="h-full">
                {renderWidgetContainer(
                  WIDGET_METAS.equity_curve,
                  <EquityCurveChart
                    trades={trades}
                    startingBalance={account.startingBalance}
                    embedded={true}
                    hoveredDate={crosshairDate}
                    onHoverChange={(info) => setCrosshairDate(info.date)}
                  />
                )}
              </div>
            )}

            {/* Widget 3: Daily PnL Distribution Bar Chart */}
            {visibleWidgets.daily_pnl && (
              <div key="daily_pnl" className="h-full">
                {renderWidgetContainer(
                  WIDGET_METAS.daily_pnl,
                  <DailyPnlBarChart
                    trades={trades}
                    embedded={true}
                    hoveredDate={crosshairDate}
                    onHoverDate={(d) => setCrosshairDate(d)}
                  />
                )}
              </div>
            )}

            {/* Widget 4: Win / Loss / Tie Ratio Donut Chart */}
            {visibleWidgets.win_loss && (
              <div key="win_loss" className="h-full">
                {renderWidgetContainer(
                  WIDGET_METAS.win_loss,
                  <WinLossDonutChart trades={trades} embedded={true} />
                )}
              </div>
            )}

            {/* Widget 5: Interactive Calendar Heatmap */}
            {visibleWidgets.calendar && (
              <div key="calendar" className="h-full">
                {renderWidgetContainer(
                  WIDGET_METAS.calendar,
                  <CalendarHeatmap
                    trades={trades}
                    onSelectDate={onSelectDate}
                    selectedDate={selectedDate}
                    hoveredDate={crosshairDate}
                    embedded={true}
                  />
                )}
              </div>
            )}

            {/* Widget 6: Recent Executions Blotter */}
            {visibleWidgets.recent_trades && (
              <div key="recent_trades" className="h-full">
                {renderWidgetContainer(
                  WIDGET_METAS.recent_trades,
                  <div className="w-full h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1E293B]">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#3987FF]"></span>
                          Execution Log
                        </h4>
                        <span className="text-[10px] text-[#8492A6] font-mono">
                          Click row for instant Candlestick Replay & inspection
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8492A6] font-mono">
                        Showing {recentTrades.length} of {trades.length}
                      </span>
                    </div>

                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-left text-xs">
                        <thead className="text-[10px] font-mono uppercase text-[#64748B] border-b border-[#1E293B]">
                          <tr>
                            <th className="pb-2">Instrument</th>
                            <th className="pb-2">Direction</th>
                            <th className="pb-2">Setup / Strategy</th>
                            <th className="pb-2">R-Multiple</th>
                            <th className="pb-2 text-right">Net PnL</th>
                            <th className="pb-2 text-center">Rules</th>
                            <th className="pb-2 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E293B]/70">
                          {recentTrades.map((t) => {
                            const isUp = t.direction === 'CALL' || t.direction === 'Long';
                            const isWin = t.pnl > 0;

                            return (
                              <tr
                                key={t.id}
                                onClick={() => onSelectTrade(t)}
                                className="hover:bg-[#182333]/80 cursor-pointer transition-all group"
                              >
                                <td className="py-2.5 font-bold text-white">
                                  <div className="flex items-center gap-1.5">
                                    <span>{t.symbol}</span>
                                    {t.type === 'binary' && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#9875FF]/20 text-[#9875FF] font-mono">
                                        Quotex
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[#8492A6] font-mono block mt-0.5">
                                    {t.entry.toLocaleString()} → {t.exit.toLocaleString()}
                                  </span>
                                </td>

                                <td className="py-2.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono inline-flex items-center gap-1 ${
                                    isUp ? 'bg-[#00D6A0]/15 text-[#00D6A0]' : 'bg-[#FF5268]/15 text-[#FF5268]'
                                  }`}>
                                    {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                                    {t.direction}
                                  </span>
                                </td>

                                <td className="py-2.5 text-slate-300">
                                  <span>{t.strategy}</span>
                                  <span className="text-[10px] text-[#8492A6] block mt-0.5 font-mono">
                                    {t.session}
                                  </span>
                                </td>

                                <td className={`py-2.5 font-mono font-bold ${t.rMultiple !== undefined && t.rMultiple >= 0 ? 'text-[#00D6A0]' : 'text-[#FF5268]'}`}>
                                  {t.rMultiple !== undefined ? `${t.rMultiple > 0 ? '+' : ''}${t.rMultiple.toFixed(2)}R` : 'N/A'}
                                </td>

                                <td className={`py-2.5 text-right font-mono font-bold text-sm ${isWin ? 'text-[#00D6A0]' : 'text-[#FF5268]'}`}>
                                  {isWin ? '+' : ''}{formatCurrency(t.pnl)}
                                </td>

                                <td className="py-2.5 text-center">
                                  <span className="text-[11px] font-mono text-slate-300">
                                    {t.rulesFollowed}/{t.totalRules || 5}
                                  </span>
                                </td>

                                <td className="py-2.5 text-right font-mono text-[#8492A6] text-[11px]">
                                  {t.date}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Widget 7: AI Intelligence Edge Detector */}
            {visibleWidgets.ai_coach && (
              <div key="ai_coach" className="h-full">
                {renderWidgetContainer(
                  WIDGET_METAS.ai_coach,
                  <div className="w-full h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1E293B]">
                        <div className="w-7 h-7 rounded-lg bg-[#9875FF]/20 border border-[#9875FF]/40 flex items-center justify-center text-[#9875FF]">
                          <BrainCircuit size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                            Edge Detector
                          </h4>
                          <span className="text-[10px] text-[#00D6A0] font-mono">Live Telemetry Analysis</span>
                        </div>
                      </div>

                      {insights[0] && (
                        <div className="space-y-3">
                          <div className="p-3 rounded-xl bg-[#080B12] border border-[#243346]">
                            <span className="text-xs font-bold text-slate-200 block mb-1">
                              {insights[0].title}
                            </span>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {insights[0].finding}
                            </p>
                            <div className="mt-2 text-[10px] font-mono text-[#8492A6] flex items-center justify-between">
                              <span>Confidence: {insights[0].confidence}%</span>
                              <span>Sample: {insights[0].sampleSize} trades</span>
                            </div>
                          </div>

                          {insights[1] && (
                            <div className="p-3 rounded-xl bg-[#080B12] border border-[#243346]">
                              <span className="text-xs font-bold text-slate-200 block mb-1">
                                {insights[1].title}
                              </span>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                {insights[1].finding}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#1E293B] text-[10px] text-[#8492A6] flex items-center justify-between font-mono mt-3">
                      <span>Algorithmic coaching</span>
                      <span className="text-[#3987FF] font-bold">100% Calculated</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ResponsiveGridLayout>
        )}
      </div>
    </div>
  );
}
