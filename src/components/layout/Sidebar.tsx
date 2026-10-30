import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  LineChart, 
  Calculator, 
  BarChart3, 
  BrainCircuit, 
  HeartHandshake, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  Target, 
  Layers, 
  Settings,
  Flame,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Palette
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'challenge'
  | 'playbook'
  | 'journal'
  | 'strategy'
  | 'calculator'
  | 'analytics'
  | 'ai-coach'
  | 'gemini-chat'
  | 'psychology'
  | 'calendar'
  | 'rules'
  | 'review'
  | 'goals'
  | 'portfolio'
  | 'settings';

export interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number;
  highlight?: boolean;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  tradeCount: number;
  adherenceRate: number;
  onOpenVisuals?: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  tradeCount,
  adherenceRate,
  onOpenVisuals,
}: SidebarProps) {
  const navSections: NavSection[] = [
    {
      group: 'EXECUTION & TRADES',
      items: [
        { id: 'dashboard' as NavTab, label: 'Command Center', icon: LayoutDashboard },
        { id: 'challenge' as NavTab, label: '$100 to $5K', icon: Target, badge: '30D' },
        { id: 'playbook' as NavTab, label: 'Daily Playbook', icon: BookOpen },
        { id: 'journal' as NavTab, label: 'Trade Journal', icon: LineChart, badge: tradeCount },
        { id: 'calendar' as NavTab, label: 'Trading Calendar', icon: Calendar },
      ],
    },
    {
      group: 'RISK & EDGE',
      items: [
        { id: 'calculator' as NavTab, label: 'Risk & Sizing Engine', icon: Calculator },
        { id: 'strategy' as NavTab, label: 'Strategy Lab', icon: Layers },
        { id: 'analytics' as NavTab, label: 'Performance Analytics', icon: BarChart3 },
        { id: 'gemini-chat' as NavTab, label: 'Gemini AI Chatbot', icon: BrainCircuit, highlight: true },
        { id: 'ai-coach' as NavTab, label: 'AI Intelligence Stats', icon: Sparkles },
      ],
    },
    {
      group: 'DISCIPLINE & GROWTH',
      items: [
        { id: 'rules' as NavTab, label: 'Rules & Discipline', icon: ShieldCheck, badge: `${adherenceRate}%` },
        { id: 'psychology' as NavTab, label: 'Trading Psychology', icon: HeartHandshake },
        { id: 'review' as NavTab, label: 'Weekly Performance', icon: FileText },
        { id: 'goals' as NavTab, label: 'Goals & Streaks', icon: Target },
        { id: 'portfolio' as NavTab, label: 'Portfolio Intelligence', icon: Flame },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'settings' as NavTab, label: 'Settings & Data Backup', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-[var(--surface-primary)] backdrop-blur-2xl border-r border-[var(--border-subtle)] transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Toggle */}
      <div className="flex items-center justify-end px-3 py-2 border-b border-[var(--border-subtle)]">
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] text-[#94A3B8] hover:text-[var(--accent-secondary)] border border-[var(--border-subtle)] transition-all active:scale-95"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] font-bold tracking-wider text-[var(--accent-secondary)]/80 uppercase font-mono">
                {sec.group}
              </div>
            )}

            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all relative duration-200 group active:scale-97 ${
                    isActive
                      ? 'bg-gradient-to-r from-[var(--accent-primary)]/25 via-[var(--accent-primary)]/10 to-transparent text-white border border-[var(--accent-primary)]/50 shadow-[0_0_18px_var(--glow-color)]'
                      : item.highlight
                      ? 'text-[var(--accent-secondary)] hover:bg-[var(--accent-primary)]/15 hover:text-white'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[var(--surface-secondary)] hover:scale-[1.02]'
                  }`}
                >
                  <Icon
                    size={17}
                    className={`shrink-0 transition-transform group-hover:scale-110 ${
                      isActive
                        ? 'text-[var(--accent-primary)] drop-shadow-[0_0_8px_var(--glow-color)]'
                        : item.highlight
                        ? 'text-[var(--accent-primary)]'
                        : 'text-[#94A3B8] group-hover:text-[var(--accent-secondary)]'
                    }`}
                  />

                  {!collapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {!collapsed && item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                        isActive
                          ? 'bg-[var(--accent-primary)] text-white shadow-[0_0_8px_var(--glow-color)]'
                          : 'bg-[var(--surface-secondary)] text-[var(--accent-secondary)] border border-[var(--border-subtle)]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {!collapsed && item.highlight && (
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse shadow-[0_0_8px_var(--glow-color)]"></span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Visuals Studio Button */}
      {onOpenVisuals && (
        <div className="p-2 border-t border-[var(--border-subtle)]">
          <button
            onClick={onOpenVisuals}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)]/15 to-[var(--accent-secondary)]/15 hover:from-[var(--accent-primary)]/25 hover:to-[var(--accent-secondary)]/25 border border-[var(--border-subtle)] text-[var(--accent-secondary)] text-xs font-bold transition-all hover:scale-103 active:scale-97 shadow-[0_0_12px_var(--glow-color)] group"
            title="Visuals & Theme Studio"
          >
            <Palette size={16} className="shrink-0 group-hover:rotate-12 transition-transform text-[var(--accent-primary)]" />
            {!collapsed && (
              <div className="flex items-center justify-between flex-1">
                <span>Theme & Visuals</span>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_6px_#10B981]" />
              </div>
            )}
          </button>
        </div>
      )}

      {/* Footer System Status */}
      {!collapsed && (
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--surface-secondary)]/40">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]"></span>
              IndexedDB Persistent
            </span>
            <span className="text-[var(--accent-secondary)] font-bold">100% Local</span>
          </div>
        </div>
      )}
    </aside>
  );
}
