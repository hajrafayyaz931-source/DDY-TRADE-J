import React from 'react';
import { NavTab } from './Sidebar';
import { LayoutDashboard, LineChart, Plus, BarChart3, FileText } from 'lucide-react';

interface MobileNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenLogTrade: () => void;
}

export function MobileNav({ activeTab, onSelectTab, onOpenLogTrade }: MobileNavProps) {
  const items = [
    { id: 'dashboard' as NavTab, label: 'Home', icon: LayoutDashboard },
    { id: 'journal' as NavTab, label: 'Journal', icon: LineChart },
    { id: 'add', label: 'Log', icon: Plus, isAction: true },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'review' as NavTab, label: 'Review', icon: FileText },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080B12]/95 backdrop-blur-md border-t border-[#1E293B] px-3 py-2 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = !item.isAction && activeTab === item.id;

        if (item.isAction) {
          return (
            <button
              key={item.id}
              onClick={onOpenLogTrade}
              className="w-12 h-12 -mt-5 rounded-2xl bg-gradient-to-r from-[#3987FF] to-[#2563EB] flex items-center justify-center text-white shadow-[0_0_15px_rgba(57,135,255,0.5)] border-2 border-[#080B12]"
            >
              <Plus size={22} />
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id as NavTab)}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all ${
              isActive ? 'text-[#3987FF]' : 'text-[#8492A6]'
            }`}
          >
            <Icon size={18} className={isActive ? 'text-[#3987FF]' : 'text-[#8492A6]'} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
