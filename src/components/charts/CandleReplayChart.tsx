import React, { useState, useEffect } from 'react';
import { Trade } from '../../types/trade';
import { generateCandlesForTrade } from '../../utils/candleGenerator';
import { Play, Pause, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

import { CandleStyle } from '../../types/visuals';

interface CandleReplayChartProps {
  trade: Trade;
  interactive?: boolean;
  candleStyle?: CandleStyle;
}

export function CandleReplayChart({ trade, interactive = true, candleStyle = 'neon' }: CandleReplayChartProps) {
  const allCandles = generateCandlesForTrade(trade, 22);
  const [currentStep, setCurrentStep] = useState<number>(allCandles.length);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoverCandleIdx, setHoverCandleIdx] = useState<number | null>(null);

  const displayedCandles = allCandles.slice(0, currentStep);

  // Playback timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= allCandles.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, allCandles.length]);

  const handleRestart = () => {
    setCurrentStep(10); // Start right before entry
    setIsPlaying(true);
  };

  // Bounds
  const prices = allCandles.flatMap(c => [c.high, c.low]);
  if (trade.stopLoss) prices.push(trade.stopLoss);
  if (trade.takeProfit) prices.push(trade.takeProfit);
  prices.push(trade.entry, trade.exit);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const spread = maxPrice - minPrice || trade.entry * 0.01;
  const padding = spread * 0.15;
  const yMin = minPrice - padding;
  const yMax = maxPrice + padding;

  // Dimensions
  const width = 760;
  const height = 280;
  const margin = { top: 25, right: 75, bottom: 35, left: 20 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const getY = (price: number) => margin.top + innerHeight - ((price - yMin) / (yMax - yMin)) * innerHeight;
  const candleWidth = Math.max(8, Math.min(22, (innerWidth / allCandles.length) * 0.65));
  const getX = (i: number) => margin.left + (i / (allCandles.length - 1)) * innerWidth;

  const entryIndex = Math.floor(allCandles.length * 0.55);
  const isUp = trade.direction === 'CALL' || trade.direction === 'Long';
  const isWin = trade.pnl > 0;

  const hovered = hoverCandleIdx !== null ? displayedCandles[hoverCandleIdx] : displayedCandles[displayedCandles.length - 1];

  return (
    <div className="surface-panel rounded-2xl p-5 border border-[#1E293B] relative overflow-hidden">
      {/* Top Banner with Trade info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <span className={`p-2 rounded-xl flex items-center justify-center font-bold text-xs ${
            isUp ? 'bg-[#00D6A0]/15 text-[#00D6A0] border border-[#00D6A0]/30' : 'bg-[#FF5268]/15 text-[#FF5268] border border-[#FF5268]/30'
          }`}>
            {isUp ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
            {trade.direction}
          </span>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white">{trade.symbol}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#182333] border border-[#26354A] text-slate-300 font-mono">
                {trade.timeframe || '1M'}
              </span>
              {trade.type === 'binary' && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#9875FF]/20 border border-[#9875FF]/40 text-[#9875FF] font-mono">
                  Quotex {trade.duration || '1M'} • {trade.payoutPercent || 85}% Payout
                </span>
              )}
            </div>
            <div className="text-xs text-[#8492A6] mt-0.5 font-mono">
              Entry: {trade.entry.toLocaleString()} → Settlement: {trade.exit.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Outcome Badge */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-[#8492A6]">Net Realized</div>
            <div className={`text-base font-extrabold font-mono ${isWin ? 'text-[#00D6A0]' : 'text-[#FF5268]'}`}>
              {isWin ? '+' : ''}{formatCurrency(trade.pnl)}
              {trade.rMultiple !== undefined && ` (${trade.rMultiple > 0 ? '+' : ''}${trade.rMultiple.toFixed(2)}R)`}
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
            isWin ? 'bg-[#00D6A0]/20 text-[#00D6A0] border border-[#00D6A0]/40 shadow-[0_0_12px_rgba(0,214,160,0.3)]' 
                  : 'bg-[#FF5268]/20 text-[#FF5268] border border-[#FF5268]/40 shadow-[0_0_12px_rgba(255,82,104,0.3)]'
          }`}>
            {trade.result || (isWin ? 'WIN / ITM' : 'LOSS / OTM')}
          </span>
        </div>
      </div>

      {/* Candlestick Canvas SVG */}
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 select-none overflow-visible">
          {/* Horizontal Price grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const price = yMax - pct * (yMax - yMin);
            const y = margin.top + innerHeight * pct;
            return (
              <g key={i}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="#16202E"
                  strokeDasharray="3 3"
                />
                <text
                  x={width - margin.right + 8}
                  y={y + 3}
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                >
                  {price.toFixed(price > 500 ? 1 : 4)}
                </text>
              </g>
            );
          })}

          {/* Strike / Entry Level Line */}
          <line
            x1={margin.left}
            y1={getY(trade.entry)}
            x2={width - margin.right}
            y2={getY(trade.entry)}
            stroke="#3987FF"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <text
            x={width - margin.right + 8}
            y={getY(trade.entry) + 3}
            fill="#3987FF"
            fontSize="10"
            fontFamily="JetBrains Mono"
            fontWeight="bold"
          >
            Entry {trade.entry.toFixed(trade.entry > 500 ? 1 : 4)}
          </text>

          {/* Stop Loss Line (if CFD) */}
          {trade.stopLoss && (
            <g>
              <line
                x1={margin.left}
                y1={getY(trade.stopLoss)}
                x2={width - margin.right}
                y2={getY(trade.stopLoss)}
                stroke="#FF5268"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <text
                x={width - margin.right + 8}
                y={getY(trade.stopLoss) + 3}
                fill="#FF5268"
                fontSize="9"
                fontFamily="JetBrains Mono"
              >
                SL {trade.stopLoss.toFixed(1)}
              </text>
            </g>
          )}

          {/* Take Profit Line (if CFD) */}
          {trade.takeProfit && (
            <g>
              <line
                x1={margin.left}
                y1={getY(trade.takeProfit)}
                x2={width - margin.right}
                y2={getY(trade.takeProfit)}
                stroke="#00D6A0"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <text
                x={width - margin.right + 8}
                y={getY(trade.takeProfit) + 3}
                fill="#00D6A0"
                fontSize="9"
                fontFamily="JetBrains Mono"
              >
                TP {trade.takeProfit.toFixed(1)}
              </text>
            </g>
          )}

          {/* Candlesticks */}
          {displayedCandles.map((c, i) => {
            const x = getX(i);
            const isBull = c.close >= c.open;
            const topBody = getY(Math.max(c.open, c.close));
            const bottomBody = getY(Math.min(c.open, c.close));
            const bodyHeight = Math.max(2, bottomBody - topBody);
            const highY = getY(c.high);
            const lowY = getY(c.low);
            const isEntryCandle = i === entryIndex;
            const isHovered = hoverCandleIdx === i;

            const candleFill = candleStyle === 'hollow' && isBull 
              ? 'transparent' 
              : isBull 
                ? 'var(--pnl-positive, #00D6A0)' 
                : 'var(--pnl-negative, #FF5268)';
            const candleStroke = isHovered 
              ? '#FFFFFF' 
              : isBull 
                ? 'var(--pnl-positive, #00D6A0)' 
                : 'var(--pnl-negative, #FF5268)';
            const candleStrokeWidth = isHovered 
              ? 2 
              : (candleStyle === 'hollow' || candleStyle === 'neon') 
                ? 1.5 
                : 0;

            return (
              <g
                key={i}
                className={`cursor-pointer transition-opacity hover:opacity-100 ${
                  candleStyle === 'neon' ? 'filter drop-shadow-[0_0_4px_currentColor]' : ''
                }`}
                onMouseEnter={() => setHoverCandleIdx(i)}
                onMouseLeave={() => setHoverCandleIdx(null)}
              >
                {/* Wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={isBull ? 'var(--pnl-positive, #00D6A0)' : 'var(--pnl-negative, #FF5268)'}
                  strokeWidth="1.5"
                  opacity={isHovered ? 1 : 0.85}
                />

                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={topBody}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={candleFill}
                  rx="1"
                  stroke={candleStroke}
                  strokeWidth={candleStrokeWidth}
                />

                {/* Entry marker indicator */}
                {isEntryCandle && (
                  <g>
                    <circle
                      cx={x}
                      cy={getY(trade.entry)}
                      r="5"
                      fill={isUp ? '#00D6A0' : '#FF5268'}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <path
                      d={isUp ? `M ${x} ${getY(trade.entry) + 18} L ${x - 5} ${getY(trade.entry) + 26} L ${x + 5} ${getY(trade.entry) + 26} Z`
                              : `M ${x} ${getY(trade.entry) - 18} L ${x - 5} ${getY(trade.entry) - 26} L ${x + 5} ${getY(trade.entry) - 26} Z`}
                      fill={isUp ? '#00D6A0' : '#FF5268'}
                    />
                    <text
                      x={x}
                      y={isUp ? getY(trade.entry) + 38 : getY(trade.entry) - 30}
                      fill={isUp ? '#00D6A0' : '#FF5268'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="JetBrains Mono"
                    >
                      {trade.direction} ENTRY
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Interactive Playback bar */}
        {interactive && (
          <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-[#1E293B]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1.5 rounded-lg bg-[#3987FF] hover:bg-[#2F74DE] text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(57,135,255,0.3)]"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying ? 'Pause' : 'Replay Trade'}
              </button>

              <button
                onClick={handleRestart}
                className="p-1.5 rounded-lg bg-[#182333] hover:bg-[#202C3E] text-slate-300 border border-[#243346]"
                title="Rewind to entry"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Slider */}
            <div className="flex-1 max-w-xs flex items-center gap-3">
              <span className="text-[11px] text-[#8492A6] font-mono">
                {currentStep}/{allCandles.length}
              </span>
              <input
                type="range"
                min="1"
                max={allCandles.length}
                value={currentStep}
                onChange={(e) => {
                  setCurrentStep(Number(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full accent-[#3987FF] h-1.5 bg-[#182333] rounded-lg cursor-pointer"
              />
            </div>

            {/* OHLC Bar readout */}
            {hovered && (
              <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-[#8492A6]">
                <span>T: <strong className="text-white">{hovered.time}</strong></span>
                <span>O: <strong className="text-white">{hovered.open.toFixed(hovered.open > 500 ? 1 : 4)}</strong></span>
                <span>H: <strong className="text-[#00D6A0]">{hovered.high.toFixed(hovered.high > 500 ? 1 : 4)}</strong></span>
                <span>L: <strong className="text-[#FF5268]">{hovered.low.toFixed(hovered.low > 500 ? 1 : 4)}</strong></span>
                <span>C: <strong className="text-white">{hovered.close.toFixed(hovered.close > 500 ? 1 : 4)}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
