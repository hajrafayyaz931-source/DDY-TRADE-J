import React, { useState, useRef, useEffect } from 'react';
import { Trade, ChallengeDay } from '../../types/trade';
import { 
  Bot, 
  Send, 
  User, 
  Trash2, 
  ShieldAlert, 
  HeartHandshake, 
  Trophy, 
  Zap,
  RotateCcw
} from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface GeminiChatbotViewProps {
  trades: Trade[];
  challengeDays: ChallengeDay[];
}

export function GeminiChatbotView({ trades, challengeDays }: GeminiChatbotViewProps) {
  const [model, setModel] = useState<'gemini-3.1-flash-lite' | 'gemini-3.8-flash' | 'gemini-4-argon'>('gemini-3.1-flash-lite');
  const [rolePreset, setRolePreset] = useState<'challenge' | 'general' | 'quotex' | 'psychology'>('challenge');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);

  // Active Challenge status context
  const activeDay = challengeDays.find(d => d.status === 'in_progress') || challengeDays[0];
  const achievedDays = challengeDays.filter(d => d.status === 'achieved');
  const totalPnl = trades.reduce((acc, t) => acc + t.pnl, 0);

  // Initial greeting message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `Welcome to **DDY TradePath AI Mentor** (Terminal Edition).

I have direct access to your **$100 to $5000 30-Day Challenge Target Journal** (currently on **Day ${activeDay.day}**, target: +$${activeDay.profitTarget}, lot size: ${activeDay.lotSize}) and your **${trades.length} recorded journal executions**.

How can I assist your trading session today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // System instruction based on selected role
  const getSystemInstruction = () => {
    const baseContext = `You are TradePath Intelligence, powered by Gemini. You are analyzing a trader who has:
- ${trades.length} closed trades in their journal (Net PnL: $${totalPnl.toFixed(2)}).
- An active "$100 to $5000 30-Day Trading Challenge Target Journal". Currently on Day ${activeDay.day} with balance $${activeDay.startingBalance}, daily target +$${activeDay.profitTarget}, and recommended lot size ${activeDay.lotSize} (Quotex bet: $${activeDay.quotexInvestment}).
- ${achievedDays.length} days successfully achieved so far.`;

    switch (rolePreset) {
      case 'challenge':
        return `${baseContext}
Your role: 30-Day Compounding Challenge Coach.
Focus strictly on lot sizing, daily targets, and protecting the accumulated capital. Warn vigorously if the trader wants to jump ahead, trade excess size, or gamble beyond the daily profit target.`;
      case 'quotex':
        return `${baseContext}
Your role: Quotex Binary Options & OTC Strategist.
Advise on 1M and 5M expiration dynamics, support/resistance bounces, candlestick wicks, 85%+ payout selection, and why Martingale doubling is dangerous.`;
      case 'psychology':
        return `${baseContext}
Your role: Trading Psychology & Emotional Cooldown Guardian.
Detect signs of frustration, revenge trading, and FOMO. Provide cognitive reframing, calming advice, and enforce cooldown breaks after losses.`;
      default:
        return `${baseContext}
Your role: Senior Institutional Portfolio Mentor & Quantitative Analyst.
Provide balanced technical analysis, risk-to-reward optimization, and process discipline advice.`;
    }
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setLoading(true);
    setErrorMsg(null);
    setLastFailedText(null);

    try {
      const payloadMessages = newHistory.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          systemInstruction: getSystemInstruction(),
          model,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        let extracted = errorData.error || `HTTP ${res.status}: Failed to communicate with Gemini`;
        if (typeof extracted === 'string' && extracted.startsWith('{')) {
          try {
            const parsed = JSON.parse(extracted);
            extracted = parsed.error?.message || parsed.message || extracted;
          } catch {}
        }
        throw new Error(extracted);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chatbot error:', err);
      let cleanMsg = err.message || 'Error contacting Gemini API. Please retry.';
      if (typeof cleanMsg === 'string' && cleanMsg.startsWith('{')) {
        try {
          const parsed = JSON.parse(cleanMsg);
          cleanMsg = parsed.error?.message || parsed.message || cleanMsg;
        } catch {}
      }
      setErrorMsg(cleanMsg);
      setLastFailedText(userText);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedText) {
      if (model === 'gemini-3.8-flash') {
        setModel('gemini-3.1-flash-lite');
      }
      setMessages(prev => prev.slice(0, -1));
      handleSendMessage(lastFailedText);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg-reset',
        role: 'assistant',
        content: 'Conversation history cleared. How can I assist your trading session today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setErrorMsg(null);
    setLastFailedText(null);
  };

  const quickPrompts = [
    'How do I maintain discipline on Day 5 of the $100 to $5000 challenge?',
    'What should I do if I miss my daily target on Quotex?',
    'Explain why 2.2x Martingale is statistically dangerous for my challenge',
    'Review my journal trades and identify my highest probability setup',
  ];

  return (
    <div className="space-y-6 font-mono text-xs text-[#E0E0E0]">
      {/* Top Header Card - Variation 3 Terminal Hero Style */}
      <div className="hero-block bg-[#151618] border border-[#222326] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[0.7rem] text-[#BB86FC] tracking-wider mb-1">
            <Bot size={13} className="text-[#BB86FC]" />
            <span>// COGNITIVE_INTELLIGENCE &amp; AI_ADVISORY</span>
            <span className="text-[#666666]">•</span>
            <span className="text-[#03DAC6] font-bold">ONLINE &amp; GROUNDED</span>
          </div>
          <h1 className="font-syne text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none mt-1">
            DDY TradePath AI Mentor
          </h1>
          <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
            Real-time conversational coaching for the $100 to $5000 challenge, Quotex binary setups, and risk discipline.
          </p>
        </div>

        {/* Configuration Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role selector */}
          <div className="flex items-center bg-[#0B0C0D] p-1 border border-[#222326] text-xs">
            <button
              onClick={() => setRolePreset('challenge')}
              className={`px-3 py-1 font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                rolePreset === 'challenge' ? 'bg-[#222326] text-[#03DAC6]' : 'text-[#666666] hover:text-white'
              }`}
            >
              <Trophy size={12} /> $100-$5000 Coach
            </button>
            <button
              onClick={() => setRolePreset('quotex')}
              className={`px-3 py-1 font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                rolePreset === 'quotex' ? 'bg-[#222326] text-[#BB86FC]' : 'text-[#666666] hover:text-white'
              }`}
            >
              <Zap size={12} /> Quotex OTC
            </button>
            <button
              onClick={() => setRolePreset('psychology')}
              className={`px-3 py-1 font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                rolePreset === 'psychology' ? 'bg-[#222326] text-[#03DAC6]' : 'text-[#666666] hover:text-white'
              }`}
            >
              <HeartHandshake size={12} /> Anti-FOMO
            </button>
          </div>

          {/* Model selector */}
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as any)}
            className="bg-[#0B0C0D] border border-[#222326] px-3 py-1.5 text-xs font-mono text-[#03DAC6] font-bold outline-none cursor-pointer"
          >
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
            <option value="gemini-3.8-flash">gemini-3.8-flash (Standard)</option>
            <option value="gemini-4-argon">gemini-4-argon (Advanced)</option>
          </select>

          <button
            onClick={handleClearHistory}
            className="p-1.5 bg-[#0B0C0D] hover:bg-[#222326] text-[#666666] hover:text-[#CF6679] border border-[#222326] transition-colors cursor-pointer"
            title="Reset Chat History"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-[#151618] border border-[#222326] flex flex-col h-[650px] overflow-hidden font-mono">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0B0C0D]">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 flex items-center justify-center shrink-0 border ${
                  isUser
                    ? 'bg-[#BB86FC] text-[#0B0C0D] border-[#BB86FC]'
                    : 'bg-[#151618] text-[#03DAC6] border-[#222326]'
                }`}>
                  {isUser ? <User size={13} /> : <Bot size={14} />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[85%] sm:max-w-[75%] p-4 text-xs leading-relaxed border ${
                  isUser
                    ? 'bg-[#1C1D21] border-[#BB86FC]/50 text-white'
                    : 'bg-[#151618] text-[#E0E0E0] border-[#222326] space-y-2'
                }`}>
                  <div className="whitespace-pre-wrap font-mono">
                    {msg.content}
                  </div>
                  <div className={`text-[10px] font-mono mt-1 ${isUser ? 'text-[#BB86FC] text-right' : 'text-[#666666]'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-[#151618] text-[#03DAC6] border border-[#222326] flex items-center justify-center shrink-0 animate-pulse">
                <Bot size={14} />
              </div>
              <div className="bg-[#151618] border border-[#222326] p-3 text-xs text-[#03DAC6] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#03DAC6] animate-ping"></span>
                <span className="font-mono">TradePath Intelligence reasoning with Gemini...</span>
              </div>
            </div>
          )}

          {/* Error Banner with Retry button */}
          {errorMsg && (
            <div className="p-3 bg-[#CF6679]/10 border border-[#CF6679]/30 text-[#CF6679] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <ShieldAlert size={15} className="shrink-0" />
                <span className="font-mono">{errorMsg}</span>
              </div>
              {lastFailedText && (
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 bg-[#CF6679]/20 hover:bg-[#CF6679]/30 border border-[#CF6679]/40 text-[#CF6679] font-bold flex items-center gap-1.5 shrink-0 text-xs font-mono uppercase cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-[#222326] bg-[#151618] overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] text-[#666666] uppercase tracking-wider font-mono shrink-0">
            SUGGESTED:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp)}
              disabled={loading}
              className="px-2.5 py-1 bg-[#0B0C0D] hover:bg-[#1C1D21] border border-[#222326] text-[11px] text-[#888888] hover:text-white whitespace-nowrap transition-colors cursor-pointer"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-[#222326] bg-[#151618]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask TradePath AI about your $100–$5000 challenge, Quotex setups, psychology, or position sizing..."
              disabled={loading}
              className="flex-1 bg-[#0B0C0D] border border-[#222326] focus:border-[#BB86FC] px-4 py-2 text-xs text-white placeholder-[#555555] outline-none transition-colors font-mono"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                loading || !inputMessage.trim()
                  ? 'bg-[#222326] text-[#555555] cursor-not-allowed'
                  : 'bg-[#BB86FC] hover:bg-[#cda6ff] active:scale-95 text-[#0B0C0D] cursor-pointer shadow-[0_0_15px_rgba(187,134,252,0.3)]'
              }`}
            >
              <Send size={13} />
              <span className="hidden sm:inline">SEND</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
