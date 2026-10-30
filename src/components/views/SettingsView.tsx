import React, { useState } from 'react';
import { 
  Trade, 
  TradingAccount, 
  RuleItem, 
  DailyPlaybookPlan, 
  StrategyItem, 
  GoalItem, 
  WeeklyReviewRecord,
  ChallengeDay 
} from '../../types/trade';
import { Settings, Download, Upload, RotateCcw, ShieldCheck, Database, Check, Palette, Wallet, SlidersHorizontal, FileJson, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

interface SettingsViewProps {
  trades: Trade[];
  accounts: TradingAccount[];
  rules?: RuleItem[];
  playbook?: DailyPlaybookPlan;
  strategies?: StrategyItem[];
  goals?: GoalItem[];
  weeklyReview?: WeeklyReviewRecord;
  challengeDays?: ChallengeDay[];
  onImportBackup: (importedData: any) => void;
  onResetData: () => void;
  onOpenVisuals?: () => void;
  onOpenEditAccount?: () => void;
}

export function SettingsView({ 
  trades, 
  accounts, 
  rules = [],
  playbook,
  strategies = [],
  goals = [],
  weeklyReview,
  challengeDays = [],
  onImportBackup, 
  onResetData, 
  onOpenVisuals, 
  onOpenEditAccount 
}: SettingsViewProps) {
  const [resetConfirm, setResetConfirm] = useState(false);
  const [toast, setToast] = useState('');

  const handleExportJson = () => {
    const fullBackup = {
      app: 'DDY TradePath',
      version: '4.2',
      exportedAt: new Date().toISOString(),
      trades,
      accounts,
      rules,
      playbook,
      strategies,
      goals,
      weeklyReview,
      challengeDays,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `ddy-tradepath-data-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    document.body.removeChild(dlAnchorElem);

    setToast('Full JSON Data Backup exported successfully!');
    setTimeout(() => setToast(''), 3500);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object') {
            onImportBackup(parsed);
            const count = Array.isArray(parsed) ? parsed.length : (parsed.trades ? parsed.trades.length : 0);
            setToast(`Imported backup data (${count} trades, rules & accounts restored)!`);
            setTimeout(() => setToast(''), 3500);
          }
        } catch (err) {
          alert('Invalid backup JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#07060A]/90 border border-[#8B5CF6]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl backdrop-blur-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#A78BFA]">
            <Settings size={14} className="text-[#8B5CF6]" />
            <span>TERMINAL CONFIGURATION & LOCAL DATA BACKUP</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-white mt-1 tracking-tight">
            Settings & Data Backup
          </h1>
          <p className="text-xs text-[#A78BFA]/80 mt-0.5">
            Export complete journal backups, download JSON data files, and manage account equity settings
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenVisuals && (
            <button
              onClick={onOpenVisuals}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6]/20 to-[#C084FC]/20 hover:from-[#8B5CF6]/30 hover:to-[#C084FC]/30 border border-[#8B5CF6]/40 text-[#C084FC] text-xs font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all"
            >
              <Palette size={15} />
              <span>Visuals & Themes</span>
            </button>
          )}

          {toast && (
            <span className="text-xs font-bold text-[#10B981] flex items-center gap-1 animate-pulse">
              <Check size={14} /> {toast}
            </span>
          )}
        </div>
      </div>

      {/* Account Equity & Limits Card */}
      {onOpenEditAccount && (
        <div className="trade-card rounded-2xl p-6 border border-[#8B5CF6]/30 bg-[#07060A]/90 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#8B5CF6]/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#C084FC]">
                <Wallet size={16} />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Account Equity & Starting Capital</h3>
                <p className="text-xs text-[#A78BFA]">Set live Quotex account equity, starting balance, and daily stop loss limits</p>
              </div>
            </div>

            <button
              onClick={onOpenEditAccount}
              className="btn-premium-purple px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(139,92,246,0.4)]"
            >
              <SlidersHorizontal size={14} />
              <span>Set Total Account Amount</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            {accounts.filter(a => a.id !== 'acc-all').map((acc) => (
              <div key={acc.id} className="p-3 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/20 space-y-1">
                <span className="text-[10px] text-[#A78BFA] block font-bold">{acc.name}</span>
                <span className="text-base font-black text-white">{formatCurrency(acc.currentBalance)}</span>
                <span className="text-[9px] text-[#10B981] block">Starting: {formatCurrency(acc.startingBalance)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Data & Import Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Download Data / Export JSON */}
        <div className="trade-card rounded-2xl p-6 border border-[#8B5CF6]/30 bg-[#07060A]/90 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#8B5CF6]/20">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <FileJson size={18} className="text-[#10B981]" />
              <span>Download Local JSON Data Backup</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 font-mono font-bold">
              OFFLINE BACKUP
            </span>
          </div>

          <p className="text-xs text-[#A78BFA] leading-relaxed">
            Download a full offline JSON backup file containing all your recorded trades, rules, portfolios, daily playbook plans, strategies, and challenge progress.
          </p>

          {/* Backup Summary Stats */}
          <div className="grid grid-cols-3 gap-2 py-1 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/20 text-center">
              <span className="text-[10px] text-[#A78BFA] block">Trades</span>
              <span className="font-bold text-white text-sm">{trades.length}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/20 text-center">
              <span className="text-[10px] text-[#A78BFA] block">Rules</span>
              <span className="font-bold text-[#10B981] text-sm">{rules.length || 6}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/20 text-center">
              <span className="text-[10px] text-[#A78BFA] block">Accounts</span>
              <span className="font-bold text-[#C084FC] text-sm">{accounts.length}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={handleExportJson}
              className="btn-premium-purple px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-[0_0_16px_rgba(139,92,246,0.4)]"
            >
              <Download size={16} />
              <span>Download Data (.JSON)</span>
            </button>

            <label className="px-4 py-2.5 rounded-xl bg-[#0D0B14] hover:bg-[#1C1536] border border-[#8B5CF6]/30 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all">
              <Upload size={15} className="text-[#10B981]" />
              <span>Restore from JSON</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>

        {/* Reset & Factory Presets */}
        <div className="trade-card rounded-2xl p-6 border border-[#8B5CF6]/30 bg-[#07060A]/90 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-[#8B5CF6]/20 text-sm font-bold text-white">
            <RotateCcw size={18} className="text-[#F59E0B]" />
            <span>Reset Demo & Sample Records</span>
          </div>

          <p className="text-xs text-[#A78BFA] leading-relaxed">
            Restore the initial demonstration dataset containing sample Quotex binary options OTC sessions and default trading rules.
          </p>

          <div className="pt-4">
            {!resetConfirm ? (
              <button
                onClick={() => setResetConfirm(true)}
                className="px-4 py-2 rounded-xl bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 border border-[#F59E0B]/35 text-[#FCD34D] text-xs font-bold flex items-center gap-2 transition-all"
              >
                <RotateCcw size={14} />
                <span>Reset to Default Sample Dataset</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-[#EF4444]/15 p-3 rounded-xl border border-[#EF4444]/40">
                <span className="text-xs text-rose-200 font-bold">Are you sure?</span>
                <button
                  onClick={() => {
                    onResetData();
                    setResetConfirm(false);
                    setToast('Dataset reset to default!');
                    setTimeout(() => setToast(''), 3000);
                  }}
                  className="px-3 py-1 rounded-lg bg-[#EF4444] text-white text-xs font-bold hover:bg-rose-600"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="px-3 py-1 rounded-lg bg-[#07060A] text-[#A78BFA] border border-[#8B5CF6]/25 text-xs font-bold hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
