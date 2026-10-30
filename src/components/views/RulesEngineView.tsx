import React, { useState } from 'react';
import { RuleItem, Trade } from '../../types/trade';
import { ShieldCheck, Plus, CheckCircle2, AlertTriangle, Trash2, X } from 'lucide-react';

interface RulesEngineViewProps {
  rules: RuleItem[];
  trades: Trade[];
  onToggleRule: (id: number) => void;
  onAddRule: (rule: Omit<RuleItem, 'id' | 'violationCount'>) => void;
  onDeleteRule: (id: number) => void;
}

export function RulesEngineView({
  rules,
  trades,
  onToggleRule,
  onAddRule,
  onDeleteRule,
}: RulesEngineViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState<RuleItem['category']>('Risk Management');
  const [newImp, setNewImp] = useState<RuleItem['importance']>('Critical');

  // Adherence calculation
  const totalChecked = trades.reduce((acc, t) => acc + t.rulesFollowed, 0);
  const totalPossible = trades.reduce((acc, t) => acc + (t.totalRules || 5), 0);
  const overallAdherence = totalPossible > 0 ? Math.round((totalChecked / totalPossible) * 100) : 100;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddRule({
      title: newTitle,
      description: newDesc,
      category: newCat,
      active: true,
      importance: newImp,
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 font-mono text-xs text-[#E0E0E0]">
      {/* Top Header - Variation 3 Terminal Hero Style */}
      <div className="hero-block bg-[#151618] border border-[#222326] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[0.7rem] text-[#BB86FC] tracking-wider mb-1">
            <ShieldCheck size={13} className="text-[#BB86FC]" />
            <span>// DISCIPLINE &amp; PERSONAL_RULEBOOK</span>
          </div>
          <h1 className="font-syne text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none mt-1">
            Trading Rules &amp; Compliance Engine
          </h1>
          <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
            Systematic pre-trade checklists, adherence tracking, and rule violation telemetry.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#BB86FC] hover:bg-[#cda6ff] active:scale-95 text-[#0B0C0D] font-bold px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all duration-150 cursor-pointer shadow-[0_0_18px_rgba(187,134,252,0.35)] flex items-center gap-2 shrink-0"
        >
          <Plus size={14} className="stroke-[2.5]" />
          <span>Add Custom Rule</span>
        </button>
      </div>

      {/* Compliance Scorecard Banner - Terminal Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#151618] border border-[#222326] p-5">
          <span className="text-[10px] text-[#666666] uppercase tracking-wider font-mono block">
            OVERALL COMPLIANCE
          </span>
          <div className="font-syne text-4xl font-extrabold text-[#03DAC6] mt-1 tracking-tight">
            {overallAdherence}%
          </div>
          <span className="text-xs text-[#666666] mt-1 block font-mono">
            Across all {trades.length} recorded trades
          </span>
        </div>

        <div className="bg-[#151618] border border-[#222326] p-5">
          <span className="text-[10px] text-[#666666] uppercase tracking-wider font-mono block">
            ACTIVE PERSONAL RULES
          </span>
          <div className="font-syne text-4xl font-extrabold text-white mt-1 tracking-tight">
            {rules.filter(r => r.active).length} / {rules.length}
          </div>
          <span className="text-xs text-[#666666] mt-1 block font-mono">
            Enforced on every pre-trade checklist
          </span>
        </div>

        <div className="bg-[#151618] border border-[#222326] p-5">
          <span className="text-[10px] text-[#666666] uppercase tracking-wider font-mono block">
            WIN RATE ON 100% RULES
          </span>
          <div className="font-syne text-4xl font-extrabold text-[#BB86FC] mt-1 tracking-tight">
            84.6%
          </div>
          <span className="text-xs text-[#666666] mt-1 block font-mono">
            vs 33.3% when rules are violated
          </span>
        </div>
      </div>

      {/* Add Rule Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-[#151618] border border-[#BB86FC] p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#222326]">
            <h3 className="text-sm font-bold text-white font-syne">
              // CREATE_NEW_PERSONAL_RULE
            </h3>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="text-xs text-[#666666] hover:text-[#CF6679] cursor-pointer flex items-center gap-1 font-mono"
            >
              <X size={13} /> CANCEL
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-[#666666] block mb-1.5 font-mono uppercase tracking-wider">
                Rule Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Mandatory 1M candle close confirmation"
                required
                className="w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] px-3 py-2 text-xs font-mono text-[#E0E0E0] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#666666] block mb-1.5 font-mono uppercase tracking-wider">
                Category
              </label>
              <select
                value={newCat}
                onChange={e => setNewCat(e.target.value as any)}
                className="w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] px-3 py-2 text-xs font-mono text-[#E0E0E0] outline-none transition-colors"
              >
                <option>Risk Management</option>
                <option>Entry Criteria</option>
                <option>Exit Management</option>
                <option>Psychology</option>
                <option>Execution</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#666666] block mb-1.5 font-mono uppercase tracking-wider">
              Description &amp; Enforcement Rationale
            </label>
            <input
              type="text"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Why is this rule vital to maintaining statistical edge on Quotex?"
              className="w-full bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] px-3 py-2 text-xs font-mono text-[#E0E0E0] outline-none transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-[#03DAC6] hover:bg-[#00c4b2] text-[#0B0C0D] text-xs font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer"
            >
              Save Rule
            </button>
          </div>
        </form>
      )}

      {/* Rules List Grid - Terminal Rows */}
      <div className="space-y-2">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono ${
              rule.active
                ? 'bg-[#151618] border-[#222326] hover:border-[#333]'
                : 'bg-[#0B0C0D] border-[#1C1D21] opacity-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => onToggleRule(rule.id)}
                className={`mt-0.5 w-5 h-5 flex items-center justify-center border transition-all cursor-pointer ${
                  rule.active
                    ? 'bg-[#03DAC6] border-[#03DAC6] text-[#0B0C0D]'
                    : 'bg-[#0B0C0D] border-[#333] text-transparent'
                }`}
                title={rule.active ? "Rule Active (Click to disable)" : "Rule Disabled (Click to activate)"}
              >
                <CheckCircle2 size={13} className="fill-current" />
              </button>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-white font-mono">{rule.title}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#0B0C0D] border border-[#222326] text-[#888888] font-mono">
                    {rule.category}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 font-mono font-bold border ${
                    rule.importance === 'Critical' 
                      ? 'bg-[#CF6679]/15 border-[#CF6679]/30 text-[#CF6679]' 
                      : 'bg-[#BB86FC]/15 border-[#BB86FC]/30 text-[#BB86FC]'
                  }`}>
                    {rule.importance}
                  </span>
                </div>
                <p className="text-xs text-[#666666] mt-1 leading-relaxed">{rule.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-auto font-mono text-xs shrink-0">
              <div className="text-right">
                <span className="text-[#666666] text-[10px] block uppercase">Violations Flagged</span>
                <span className={`font-bold ${rule.violationCount > 0 ? 'text-[#CF6679]' : 'text-[#03DAC6]'}`}>
                  {rule.violationCount} recorded
                </span>
              </div>

              <button
                onClick={() => onDeleteRule(rule.id)}
                className="p-1.5 text-[#666666] hover:text-[#CF6679] hover:bg-[#222326] transition-colors cursor-pointer"
                title="Delete rule"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
