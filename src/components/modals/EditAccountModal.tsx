import React, { useState, useEffect } from 'react';
import { TradingAccount } from '../../types/trade';
import { formatCurrency } from '../../utils/calculations';
import { X, Check, DollarSign, ShieldAlert, Wallet, Sparkles, Building2 } from 'lucide-react';

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: TradingAccount[];
  selectedAccountId: string;
  onUpdateAccount: (updatedAccount: TradingAccount) => void;
  onAddAccount?: (newAccount: TradingAccount) => void;
}

export function EditAccountModal({
  isOpen,
  onClose,
  accounts,
  selectedAccountId,
  onUpdateAccount,
  onAddAccount,
}: EditAccountModalProps) {
  const [activeAccId, setActiveAccId] = useState<string>(selectedAccountId || accounts[0]?.id || 'acc-quotex-live');
  
  const currentAcc = accounts.find(a => a.id === activeAccId) || accounts[0];

  // Form State
  const [name, setName] = useState<string>('');
  const [broker, setBroker] = useState<string>('');
  const [startingBalance, setStartingBalance] = useState<string>('');
  const [currentBalance, setCurrentBalance] = useState<string>('');
  const [dailyLossLimit, setDailyLossLimit] = useState<string>('');
  const [maxDrawdownLimit, setMaxDrawdownLimit] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [savedToast, setSavedToast] = useState<boolean>(false);

  // Sync form when active account changes or modal opens
  useEffect(() => {
    if (currentAcc) {
      setName(currentAcc.name);
      setBroker(currentAcc.broker);
      setStartingBalance(String(currentAcc.startingBalance));
      setCurrentBalance(String(currentAcc.currentBalance));
      setDailyLossLimit(String(currentAcc.dailyLossLimit));
      setMaxDrawdownLimit(String(currentAcc.maxDrawdownLimit));
      setCurrency(currentAcc.currency || 'USD');
    }
  }, [activeAccId, currentAcc, isOpen]);

  if (!isOpen || !currentAcc) return null;

  const handleSave = () => {
    const updated: TradingAccount = {
      ...currentAcc,
      name,
      broker,
      startingBalance: Math.max(1, parseFloat(startingBalance) || 1000),
      currentBalance: Math.max(0, parseFloat(currentBalance) || 1000),
      dailyLossLimit: Math.max(10, parseFloat(dailyLossLimit) || 200),
      maxDrawdownLimit: Math.max(10, parseFloat(maxDrawdownLimit) || 500),
      currency,
    };

    onUpdateAccount(updated);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#07060A] border border-[#8B5CF6]/35 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-[#8B5CF6]/20 bg-[#0D0B14] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#C084FC] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]">
              <div className="w-full h-full bg-[#07060A] rounded-[14px] flex items-center justify-center text-[#C084FC]">
                <Wallet size={18} />
              </div>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Set Account Balance & Limits</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#C084FC] border border-[#8B5CF6]/40 font-mono font-bold">
                  EQUITY CONFIG
                </span>
              </h2>
              <p className="text-xs text-[#A78BFA]">
                Configure total starting balance, live equity, and risk limits
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#A78BFA] hover:text-white hover:bg-[#1C1536]">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs font-mono">
          {/* Account Selector Tabs */}
          <div className="space-y-1">
            <label className="text-[#A78BFA] block text-[10px] uppercase font-bold">
              Select Account to Edit:
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {accounts.filter(a => a.id !== 'acc-all').map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setActiveAccId(acc.id)}
                  className={`px-3 py-2 rounded-xl font-bold transition-all border shrink-0 ${
                    activeAccId === acc.id
                      ? 'bg-[#8B5CF6] text-white border-[#C084FC] shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                      : 'bg-[#0D0B14] text-[#A78BFA] border-[#8B5CF6]/20 hover:text-white'
                  }`}
                >
                  {acc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Account Name & Broker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#A78BFA] block text-[10px] uppercase font-bold mb-1">
                Account Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Quotex Live Account"
                className="w-full bg-[#0D0B14] border border-[#8B5CF6]/30 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-[#C084FC]"
              />
            </div>

            <div>
              <label className="text-[#A78BFA] block text-[10px] uppercase font-bold mb-1">
                Broker / Platform:
              </label>
              <input
                type="text"
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                placeholder="e.g. Quotex Financial"
                className="w-full bg-[#0D0B14] border border-[#8B5CF6]/30 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-[#C084FC]"
              />
            </div>
          </div>

          {/* Total Account Balances (Starting vs Live Equity) */}
          <div className="p-3.5 rounded-2xl bg-[#0D0B14] border border-[#8B5CF6]/25 space-y-3">
            <span className="text-white font-bold block text-xs flex items-center gap-1.5">
              <DollarSign size={14} className="text-[#10B981]" />
              Account Balance & Equity Settings
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#A78BFA] block text-[10px] mb-1">
                  Starting Balance ($):
                </label>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(e.target.value)}
                  className="w-full bg-[#07060A] border border-[#8B5CF6]/30 rounded-xl px-3 py-2 text-white font-black text-base outline-none focus:border-[#C084FC]"
                />
                <span className="text-[9px] text-[#A78BFA]/70 mt-0.5 block">Initial account deposit</span>
              </div>

              <div>
                <label className="text-[#A78BFA] block text-[10px] mb-1">
                  Current Live Equity ($):
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(e.target.value)}
                  className="w-full bg-[#07060A] border border-[#8B5CF6]/30 rounded-xl px-3 py-2 text-[#10B981] font-black text-base outline-none focus:border-[#10B981]"
                />
                <span className="text-[9px] text-[#10B981]/80 mt-0.5 block">Live balance on Quotex</span>
              </div>
            </div>
          </div>

          {/* Risk & Drawdown Guardrails */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#A78BFA] block text-[10px] uppercase font-bold mb-1">
                Max Daily Loss Limit ($):
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={dailyLossLimit}
                onChange={(e) => setDailyLossLimit(e.target.value)}
                className="w-full bg-[#0D0B14] border border-[#8B5CF6]/30 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-[#C084FC]"
              />
            </div>

            <div>
              <label className="text-[#A78BFA] block text-[10px] uppercase font-bold mb-1">
                Max Drawdown Limit ($):
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={maxDrawdownLimit}
                onChange={(e) => setMaxDrawdownLimit(e.target.value)}
                className="w-full bg-[#0D0B14] border border-[#8B5CF6]/30 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-[#C084FC]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#8B5CF6]/20 bg-[#0D0B14] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {savedToast && (
              <span className="text-xs font-bold text-[#10B981] flex items-center gap-1 animate-pulse">
                <Check size={15} /> Balance Updated!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#07060A] text-[#A78BFA] border border-[#8B5CF6]/25 text-xs font-bold hover:text-white"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="btn-premium-purple px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-[0_0_16px_rgba(139,92,246,0.5)]"
            >
              <Check size={16} />
              <span>Save Account Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
