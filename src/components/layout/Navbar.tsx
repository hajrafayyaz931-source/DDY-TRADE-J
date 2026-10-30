import React, { useState, useEffect, useRef } from 'react';
import { TradingAccount } from '../../types/trade';
import { NavTab } from './Sidebar';
import { 
  Search, 
  Bell, 
  Plus, 
  Download, 
  HelpCircle, 
  ChevronDown, 
  Flame,
  CheckCircle2, 
  Check,
  Clock, 
  Sparkles, 
  Target, 
  Palette,
  Sun,
  Moon,
  LayoutDashboard,
  BookOpen,
  BarChart3,
  MoreHorizontal,
  FileSpreadsheet,
  Command,
  SlidersHorizontal
} from 'lucide-react';
import { ThemeId, THEME_DEFINITIONS } from '../../types/visuals';
import { formatCurrency } from '../../utils/calculations';
import { downloadProjectZip } from '../../utils/downloadZip';
import { SmartThemeLogo } from '../ui/SmartThemeLogo';

interface NavbarProps {
  accounts: TradingAccount[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onOpenLogTrade: () => void;
  onOpenAutoImport: () => void;
  onOpenUrduGuide: () => void;
  onOpenCommandPalette: () => void;
  onOpenChallenge?: () => void;
  onOpenGemini?: () => void;
  onOpenVisuals?: () => void;
  activeTheme?: ThemeId;
  onSelectTheme?: (theme: ThemeId) => void;
  activeThemeName?: string;
  activeStreak: number;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  activeTab?: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  onOpenEditAccount?: () => void;
}

export function Navbar({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onOpenLogTrade,
  onOpenAutoImport,
  onOpenUrduGuide,
  onOpenCommandPalette,
  onOpenChallenge,
  onOpenGemini,
  onOpenVisuals,
  activeTheme = 'quotex-cyber',
  onSelectTheme,
  activeThemeName,
  activeStreak,
  isDarkMode = true,
  onToggleDarkMode,
  activeTab = 'dashboard',
  onSelectTab,
  onOpenEditAccount,
}: NavbarProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeDropdownOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  // Primary top tab definitions for fast switching without crowding
  const TOP_TABS: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'challenge', label: '$100 to $5K', icon: Target },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'gemini-chat', label: 'Gemini AI', icon: Sparkles },
  ];

  const handleTabClick = (tabId: NavTab) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    } else if (tabId === 'challenge' && onOpenChallenge) {
      onOpenChallenge();
    } else if (tabId === 'gemini-chat' && onOpenGemini) {
      onOpenGemini();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface-primary)]/95 backdrop-blur-2xl border-b border-[var(--border-subtle)] px-3 sm:px-4 lg:px-6 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between gap-2 md:gap-3 lg:gap-4 max-w-full">
        {/* LEFT: Brand Logo + Account Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Brand Logo - Dynamically adapting to active theme */}
          <div 
            onClick={() => handleTabClick('dashboard')}
            className="cursor-pointer group"
          >
            <SmartThemeLogo activeTheme={activeTheme} />
          </div>

          {/* Account Switcher Dropdown */}
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-xl bg-[var(--surface-secondary)]/80 hover:bg-[var(--surface-tertiary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-all duration-200 active:scale-98 shadow-sm group"
              title="Switch Trading Portfolio Account"
            >
              <span
                className="w-2 h-2 rounded-full shadow-[0_0_8px_var(--glow-color)] shrink-0"
                style={{ backgroundColor: activeAccount.color || 'var(--accent-primary)' }}
              />
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-white block max-w-[110px] md:max-w-[140px] lg:max-w-[170px] truncate group-hover:text-[#FAF5FF] leading-tight">
                  {activeAccount.name}
                </span>
                <span className="text-[10px] font-mono text-[#10B981] font-bold leading-none block">
                  {formatCurrency(activeAccount.currentBalance)}
                </span>
              </div>
              <span className="sm:hidden text-xs font-mono font-bold text-[#10B981]">
                {formatCurrency(activeAccount.currentBalance)}
              </span>
              <ChevronDown size={13} className="text-[#94A3B8] group-hover:text-white transition-colors shrink-0" />
            </button>

            {accountDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[var(--surface-primary)] backdrop-blur-2xl border border-[var(--border-hover)] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--accent-secondary)] uppercase tracking-wider font-mono border-b border-[var(--border-subtle)] flex items-center justify-between">
                  <span>Trading Accounts</span>
                  <span className="text-[#10B981]">{accounts.length} Available</span>
                </div>
                <div className="space-y-1 mt-1 max-h-64 overflow-y-auto">
                  {accounts.map(acc => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        onSelectAccount(acc.id);
                        setAccountDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all active:scale-98 ${
                        acc.id === selectedAccountId
                          ? 'bg-[var(--surface-secondary)] border border-[var(--border-hover)] text-white shadow-[0_0_12px_var(--glow-color)]'
                          : 'hover:bg-[var(--surface-secondary)]/50 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: acc.color }} />
                        <div className="truncate max-w-[130px]">
                          <div className="font-semibold text-white truncate">{acc.name}</div>
                          <div className="text-[10px] text-[#94A3B8]">{acc.broker}</div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white text-xs">
                        {formatCurrency(acc.currentBalance)}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="p-1 border-t border-[var(--border-subtle)] bg-[var(--surface-secondary)]/50">
                  <button
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      onOpenEditAccount?.();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-[var(--accent-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-white transition-all text-left"
                  >
                    <SlidersHorizontal size={13} className="text-[var(--accent-primary)]" />
                    <span>Set Account Equity & Limits</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Compact Market UTC Clock (wide screen only) */}
          <div className="hidden 2xl:flex items-center gap-2 pl-3 border-l border-[var(--border-subtle)] text-xs font-mono text-slate-300">
            <Clock size={12} className="text-[var(--accent-primary)]" />
            <span className="font-semibold text-slate-200">{currentTime || '14:20:00'} UTC</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_6px_#10B981]"></span>
          </div>
        </div>

        {/* CENTER: Institutional Top Navigation Tabs ("Top Tabs") - Never Overlaps */}
        <nav className="hidden lg:flex items-center bg-[var(--surface-secondary)]/80 p-1 rounded-2xl border border-[var(--border-subtle)] shadow-inner">
          {TOP_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--accent-primary)]/35 to-[var(--accent-secondary)]/30 text-white border border-[var(--accent-primary)]/60 shadow-[0_0_12px_var(--glow-color)] scale-102'
                    : 'text-[#CBD5E1] hover:text-white hover:bg-[var(--accent-primary)]/15'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-[var(--accent-secondary)]'} />
                <span className="hidden xl:inline">{tab.label}</span>
                <span className="xl:hidden">{tab.id === 'challenge' ? '$5K' : tab.id === 'gemini-chat' ? 'AI' : tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* RIGHT: Actions, Tools Menu, and Primary Call to Action (+ Log Trade) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Win Streak Pill */}
          {activeStreak > 0 && (
            <div 
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/35 text-[#FCD34D] text-xs font-mono font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]"
              title={`${activeStreak} Consecutive Winning Executions`}
            >
              <Flame size={13} className="text-[#F59E0B] fill-[#F59E0B]" />
              <span className="hidden xl:inline">{activeStreak} Streak</span>
              <span className="xl:hidden">{activeStreak}W</span>
            </div>
          )}

          {/* Search Trigger (⌘K) */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--surface-secondary)]/70 hover:bg-[var(--surface-tertiary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] text-xs text-[#94A3B8] hover:text-white transition-all active:scale-95"
            title="Search trades & commands (⌘K)"
          >
            <Search size={14} className="text-[var(--accent-primary)]" />
            <span className="hidden xl:inline">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-[var(--surface-primary)] text-[10px] text-[var(--accent-secondary)] font-mono border border-[var(--border-subtle)]">
              ⌘K
            </kbd>
          </button>

          {/* Quick Theme Selector Dropdown */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-[var(--accent-primary)]/15 hover:bg-[var(--accent-primary)]/25 border border-[var(--accent-primary)]/35 text-[var(--accent-secondary)] text-xs font-bold transition-all hover:scale-103 active:scale-97 flex items-center gap-1.5 shadow-[0_0_12px_var(--glow-color)]"
              title="Quick Switch Color Theme"
            >
              <Palette size={14} className="text-[var(--accent-primary)]" />
              <span className="hidden xl:inline font-mono">
                {THEME_DEFINITIONS[activeTheme]?.name ? THEME_DEFINITIONS[activeTheme].name.split(' ')[0] : 'Theme'}
              </span>
              <ChevronDown size={11} className="opacity-70 hidden sm:inline" />
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[var(--surface-primary)] backdrop-blur-2xl border border-[var(--border-hover)] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--accent-secondary)] uppercase tracking-wider font-mono border-b border-[var(--border-subtle)] flex items-center justify-between">
                  <span>Switch Theme</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-bold">
                    {Object.keys(THEME_DEFINITIONS).length} Themes
                  </span>
                </div>

                <div className="space-y-1 mt-1 max-h-72 overflow-y-auto">
                  {(Object.keys(THEME_DEFINITIONS) as ThemeId[]).map((tId) => {
                    const def = THEME_DEFINITIONS[tId];
                    const isSelected = activeTheme === tId;

                    return (
                      <button
                        key={tId}
                        onClick={() => {
                          onSelectTheme?.(tId);
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-[var(--surface-secondary)] border border-[var(--accent-primary)] text-white shadow-sm'
                            : 'hover:bg-[var(--surface-secondary)]/70 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full border border-black/30 shrink-0" style={{ backgroundColor: def.accentPrimary }} />
                          <div className="truncate">
                            <div className="font-semibold text-white leading-tight truncate">{def.name}</div>
                            <div className="text-[9px] text-slate-400 font-mono truncate">{def.badge}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <Check size={14} className="text-[var(--accent-primary)] shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {onOpenVisuals && (
                  <div className="p-1 border-t border-[var(--border-subtle)] mt-1">
                    <button
                      onClick={() => {
                        setThemeDropdownOpen(false);
                        onOpenVisuals();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold text-[var(--accent-primary)] hover:bg-[var(--surface-secondary)] transition-all"
                    >
                      <Sparkles size={13} />
                      <span>Advanced Visuals & Sound Studio...</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] border border-[var(--border-subtle)] text-[var(--accent-primary)] text-xs font-bold transition-all hover:scale-105 active:scale-95"
              title={isDarkMode ? 'Switch to Light Desk Mode' : 'Switch to Ultra-Dark Terminal'}
            >
              {isDarkMode ? <Sun size={14} className="text-[#F59E0B]" /> : <Moon size={14} className="text-[var(--accent-primary)]" />}
            </button>
          )}

          {/* Direct Download Project ZIP Button */}
          <button
            onClick={() => downloadProjectZip()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#10B981]/15 hover:bg-[#10B981]/25 border border-[#10B981]/40 text-[#10B981] text-xs font-bold transition-all hover:scale-103 active:scale-97 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            title="Download complete DDY Trade Journal source code as .ZIP"
          >
            <Download size={14} className="text-[#10B981]" />
            <span className="hidden sm:inline">.ZIP</span>
          </button>

          {/* Sleek "More Tools" Dropdown */}
          <div className="relative" ref={toolsRef}>
            <button
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-[var(--surface-secondary)]/80 hover:bg-[var(--surface-tertiary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] text-slate-300 text-xs font-semibold transition-all hover:text-white"
              title="Platform Tools, Auto-Import & Downloads"
            >
              <MoreHorizontal size={14} className="text-[var(--accent-primary)]" />
              <span className="hidden sm:inline">Tools</span>
            </button>

            {toolsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--surface-primary)] backdrop-blur-2xl border border-[var(--border-hover)] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--accent-secondary)] uppercase tracking-wider font-mono border-b border-[var(--border-subtle)]">
                  Platform Utilities
                </div>

                {/* Auto Import */}
                <button
                  onClick={() => {
                    onOpenAutoImport();
                    setToolsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs text-slate-200 hover:bg-[var(--surface-secondary)] hover:text-white transition-all"
                >
                  <div className="w-6 h-6 rounded-lg bg-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)]">
                    <Download size={13} />
                  </div>
                  <div>
                    <div className="font-semibold">Quotex / CSV Import</div>
                    <div className="text-[10px] text-[#94A3B8]">Auto-import executed trades</div>
                  </div>
                </button>

                {/* Download Project ZIP */}
                <button
                  onClick={() => {
                    setToolsDropdownOpen(false);
                    downloadProjectZip();
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs text-emerald-400 hover:bg-[#10B981]/15 transition-all"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                    <Download size={13} />
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-300">Download Project .ZIP</div>
                    <div className="text-[10px] text-emerald-400/80">Full terminal source code</div>
                  </div>
                </button>

                {/* Urdu / Quotex Guide */}
                <button
                  onClick={() => {
                    onOpenUrduGuide();
                    setToolsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs text-slate-200 hover:bg-[var(--surface-secondary)] hover:text-white transition-all"
                >
                  <div className="w-6 h-6 rounded-lg bg-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-secondary)]">
                    <HelpCircle size={13} />
                  </div>
                  <div>
                    <div className="font-semibold">Urdu & Quotex Guide</div>
                    <div className="text-[10px] text-[#94A3B8]">Video guides & help</div>
                  </div>
                </button>

                {/* Keyboard Shortcuts Palette */}
                <button
                  onClick={() => {
                    onOpenCommandPalette();
                    setToolsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs text-slate-200 hover:bg-[var(--surface-secondary)] hover:text-white transition-all border-t border-[var(--border-subtle)] mt-1 pt-1.5"
                >
                  <div className="w-6 h-6 rounded-lg bg-[var(--accent-primary)]/15 flex items-center justify-center text-[var(--accent-secondary)]">
                    <Command size={13} />
                  </div>
                  <div className="flex items-center justify-between w-full pr-1">
                    <span className="font-semibold">Shortcuts</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-secondary)] text-[9px] font-mono text-[var(--accent-secondary)] border border-[var(--border-subtle)]">⌘K</kbd>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Primary Action Button: "+ Log Trade" - Never Clipped, Always Prominent */}
          <button
            onClick={onOpenLogTrade}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl btn-premium-purple text-xs font-bold shrink-0 shadow-[0_0_16px_var(--glow-color)]"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Log Trade</span>
            <span className="sm:hidden">Log</span>
          </button>

          {/* Notifications Bell Dropdown */}
          <div className="relative shrink-0" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-1.5 rounded-xl bg-[var(--surface-secondary)]/80 hover:bg-[var(--surface-tertiary)] border border-[var(--border-subtle)] text-slate-300 relative transition-all hover:scale-105 active:scale-95"
              title="System Alerts"
            >
              <Bell size={15} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--glow-color)]"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[var(--surface-primary)] backdrop-blur-2xl border border-[var(--border-hover)] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                  <span className="text-xs font-bold text-white">System & Risk Alerts</span>
                  <span className="text-[10px] text-[#10B981] font-mono font-semibold">Active Monitoring</span>
                </div>
                <div className="divide-y divide-[var(--border-subtle)] mt-1 space-y-1">
                  <div className="py-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[#10B981] font-semibold">
                      <CheckCircle2 size={13} />
                      <span>Rule Compliance at 88%</span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      You are exceeding your weekly 85% discipline target.
                    </p>
                  </div>
                  <div className="py-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--accent-secondary)] font-semibold">
                      <Sparkles size={13} />
                      <span>Quotex Session Parsed</span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      5 binary OTC trades auto-synchronized into journal.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
