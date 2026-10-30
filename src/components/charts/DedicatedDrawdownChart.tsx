import React, { useState, useMemo, useRef, useId } from 'react';
import { Trade } from '../../types/trade';
import { generateEquityCurve, formatCurrency, EquityPoint } from '../../utils/calculations';
import { TrendingDown, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface DedicatedDrawdownChartProps {
  trades: Trade[];
  startingBalance: number;
}

export function DedicatedDrawdownChart({ trades, startingBalance }: DedicatedDrawdownChartProps) {
  const [mode, setMode] = useState<'percent' | 'dollar'>('percent');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const rawId = useId();
  const gradId = `ddGrad-${rawId.replace(/:/g, '')}`;

  // Generate sequence of equity points
  const points = useMemo(() => {
    const raw = generateEquityCurve(trades, startingBalance);
    if (raw.length < 2) {
      return [
        { index: 0, date: 'Start', symbol: 'Initial', pnl: 0, balance: startingBalance, peak: startingBalance, drawdown: 0 },
        { index: 1, date: 'Current', symbol: 'Current', pnl: 0, balance: startingBalance, peak: startingBalance, drawdown: 0 },
      ];
    }
    return raw;
  }, [trades, startingBalance]);

  // Find max drawdown point
  const { maxDdDollar, maxDdPct, maxDdIndex, currentDdDollar, currentDdPct } = useMemo(() => {
    let maxDollar = 0;
    let maxPct = 0;
    let maxIdx = 0;

    points.forEach((p, idx) => {
      const dd = Math.max(0, p.peak - p.balance);
      const ddP = p.peak > 0 ? (dd / p.peak) * 100 : 0;
      if (dd > maxDollar) {
        maxDollar = dd;
        maxIdx = idx;
      }
      if (ddP > maxPct) {
        maxPct = ddP;
      }
    });

    const last = points[points.length - 1];
    const currDollar = last ? Math.max(0, last.peak - last.balance) : 0;
    const currPct = last && last.peak > 0 ? (currDollar / last.peak) * 100 : 0;

    return {
      maxDdDollar: maxDollar,
      maxDdPct: maxPct,
      maxDdIndex: maxIdx,
      currentDdDollar: currDollar,
      currentDdPct: currPct,
    };
  }, [points]);

  // Dimensions
  const width = 640;
  const height = 210;
  const margin = { top: 22, right: 28, bottom: 32, left: 58 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Max scale for y-axis
  const maxY = mode === 'percent' 
    ? Math.max(10, Math.ceil(maxDdPct * 1.25))
    : Math.max(50, Math.ceil(maxDdDollar * 1.2));

  const getX = (idx: number) => margin.left + (idx / Math.max(1, points.length - 1)) * innerWidth;
  // Underwater scale: 0 is at top (margin.top), maxY is at bottom (margin.top + innerHeight)
  const getY = (val: number) => margin.top + (val / maxY) * innerHeight;

  const getVal = (p: EquityPoint) => {
    const ddDollar = Math.max(0, p.peak - p.balance);
    return mode === 'percent'
      ? (p.peak > 0 ? (ddDollar / p.peak) * 100 : 0)
      : ddDollar;
  };

  // Build SVG Path
  const linePoints = points.map((p, i) => `${getX(i)},${getY(getVal(p))}`).join(' ');
  const areaPoints = `${getX(0)},${margin.top} ${linePoints} ${getX(points.length - 1)},${margin.top}`;

  const activeIdx = hoverIndex !== null && hoverIndex < points.length
    ? hoverIndex
    : points.length - 1;
  const activePt = points[activeIdx] || points[points.length - 1];
  const activeVal = activePt ? getVal(activePt) : 0;
  const activeDollar = activePt ? Math.max(0, activePt.peak - activePt.balance) : 0;
  const activePct = activePt && activePt.peak > 0 ? (activeDollar / activePt.peak) * 100 : 0;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * width;
    const clampedX = Math.max(margin.left, Math.min(width - margin.right, svgX));
    const normalized = (clampedX - margin.left) / innerWidth;
    const nearestIdx = Math.round(normalized * (points.length - 1));
    if (nearestIdx >= 0 && nearestIdx < points.length) {
      setHoverIndex(nearestIdx);
    }
  };

  return (
    <div className="trade-card rounded-2xl p-5 border border-[#8B5CF6]/20 bg-[#07060A]/80 backdrop-blur-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444]"></span>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Drawdown & Underwater Analysis
            </h4>
            <span className="text-[11px] text-[#A78BFA] font-mono">
              Peak-to-valley capital contraction monitoring
            </span>
          </div>
        </div>

        {/* Toggle Mode & Key Stats */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-xl bg-[#0D0B14] border border-[#8B5CF6]/25 text-[11px] font-mono">
            <button
              onClick={() => setMode('percent')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                mode === 'percent'
                  ? 'bg-[#8B5CF6] text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]'
                  : 'text-[#A78BFA] hover:text-white'
              }`}
            >
              Percentage (%)
            </button>
            <button
              onClick={() => setMode('dollar')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                mode === 'dollar'
                  ? 'bg-[#8B5CF6] text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]'
                  : 'text-[#A78BFA] hover:text-white'
              }`}
            >
              Monetary ($)
            </button>
          </div>
        </div>
      </div>

      {/* Metric Readout Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-mono text-xs">
        <div className="p-2.5 rounded-xl bg-[#0D0B14]/80 border border-[#8B5CF6]/15">
          <span className="text-[10px] text-[#A78BFA] block">Max Drawdown</span>
          <div className="font-extrabold text-[#EF4444] text-sm mt-0.5">
            -{maxDdPct.toFixed(1)}% ({formatCurrency(maxDdDollar)})
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0D0B14]/80 border border-[#8B5CF6]/15">
          <span className="text-[10px] text-[#A78BFA] block">Current Drawdown</span>
          <div className={`font-extrabold text-sm mt-0.5 ${currentDdDollar > 0 ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
            {currentDdDollar > 0 ? `-${currentDdPct.toFixed(1)}%` : '0.0% (At Peak)'}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0D0B14]/80 border border-[#8B5CF6]/15">
          <span className="text-[10px] text-[#A78BFA] block">Peak Balance</span>
          <div className="font-extrabold text-white text-sm mt-0.5">
            {formatCurrency(points[points.length - 1]?.peak || startingBalance)}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0D0B14]/80 border border-[#8B5CF6]/15">
          <span className="text-[10px] text-[#A78BFA] block">Drawdown Status</span>
          <div className="font-extrabold text-sm mt-0.5 text-[#10B981] flex items-center gap-1">
            <ShieldCheck size={13} />
            <span>{maxDdPct < 8 ? 'Controlled' : 'Elevated'}</span>
          </div>
        </div>
      </div>

      {/* SVG Drawdown Chart */}
      <div className="relative select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#EF4444" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const y = margin.top + pct * innerHeight;
            const val = pct * maxY;
            return (
              <g key={i}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="rgba(139, 92, 246, 0.12)"
                  strokeDasharray={pct === 0 ? undefined : "3 3"}
                />
                <text
                  x={margin.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#A78BFA"
                  fontSize="9.5"
                  fontFamily="monospace"
                >
                  {pct === 0 ? '0' : `-${mode === 'percent' ? `${val.toFixed(0)}%` : `$${Math.round(val)}`}`}
                </text>
              </g>
            );
          })}

          {/* Zero baseline */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={width - margin.right}
            y2={margin.top}
            stroke="rgba(16, 185, 129, 0.5)"
            strokeWidth="1.5"
          />

          {/* Drawdown Area */}
          <polygon
            points={areaPoints}
            fill={`url(#${gradId})`}
          />

          {/* Drawdown Boundary Line */}
          <polyline
            points={linePoints}
            fill="none"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Max Drawdown Valley Point Marker */}
          {maxDdDollar > 0 && (
            <g>
              <circle
                cx={getX(maxDdIndex)}
                cy={getY(getVal(points[maxDdIndex]))}
                r="4.5"
                fill="#EF4444"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="animate-pulse"
              />
              <text
                x={getX(maxDdIndex)}
                y={getY(getVal(points[maxDdIndex])) + 14}
                textAnchor="middle"
                fill="#EF4444"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                Max -{maxDdPct.toFixed(1)}%
              </text>
            </g>
          )}

          {/* Active Hover Crosshair Line */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(activeIdx)}
                y1={margin.top}
                x2={getX(activeIdx)}
                y2={margin.top + innerHeight}
                stroke="#C084FC"
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(activeIdx)}
                cy={getY(activeVal)}
                r="4"
                fill="#C084FC"
                stroke="#07060A"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip readout on Hover */}
        {hoverIndex !== null && activePt && (
          <div
            className="absolute top-1 right-2 pointer-events-none p-2 rounded-xl bg-[#0D0B14]/95 border border-[#8B5CF6]/35 shadow-xl text-xs font-mono z-10"
          >
            <div className="flex items-center gap-2 text-white font-bold">
              <span>{activePt.date}</span>
              <span className="text-[#EF4444]">
                -{activePct.toFixed(1)}% (-{formatCurrency(activeDollar)})
              </span>
            </div>
            <div className="text-[10px] text-[#A78BFA] mt-0.5">
              Balance: {formatCurrency(activePt.balance)} • Peak: {formatCurrency(activePt.peak)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
