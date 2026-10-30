import React, { useState, useId, useRef, useEffect, useMemo, useCallback } from 'react';
import { Trade } from '../../types/trade';
import { generateEquityCurve, formatCurrency, EquityPoint } from '../../utils/calculations';
import { ZoomIn, ZoomOut, RefreshCw, Crosshair, SlidersHorizontal, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface EquityCurveChartProps {
  trades: Trade[];
  startingBalance: number;
  embedded?: boolean;
  hoveredDate?: string | null;
  onHoverChange?: (info: { date: string | null; point: EquityPoint | null }) => void;
}

export function EquityCurveChart({
  trades,
  startingBalance,
  embedded = false,
  hoveredDate: externalHoveredDate,
  onHoverChange,
}: EquityCurveChartProps) {
  const [viewMode, setViewMode] = useState<'equity' | 'pnl' | 'return' | 'drawdown'>('equity');
  const [showBenchmark, setShowBenchmark] = useState(true);
  const [enableCrosshair, setEnableCrosshair] = useState(true);
  const [internalHoverIndex, setInternalHoverIndex] = useState<number | null>(null);

  // Time-range brushing state: indices in allPoints [startIdx, endIdx]
  const [brushRange, setBrushRange] = useState<[number, number]>([0, 0]);
  const [isBrushing, setIsBrushing] = useState(false);
  const brushTrackRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<'start' | 'end' | 'window' | null>(null);
  const dragStartPosRef = useRef<{ clientX: number; range: [number, number] }>({ clientX: 0, range: [0, 0] });

  // Generate full equity points sequence
  const allPoints = useMemo(() => {
    const raw = generateEquityCurve(trades, startingBalance);
    if (raw.length < 2) {
      return [
        { index: 0, date: 'Start', symbol: 'Deposit', pnl: 0, balance: startingBalance, peak: startingBalance, drawdown: 0 },
        { index: 1, date: 'Current', symbol: 'Initial', pnl: 0, balance: startingBalance, peak: startingBalance, drawdown: 0 },
      ];
    }
    return raw;
  }, [trades, startingBalance]);

  // Synchronize initial brush range to full extent
  useEffect(() => {
    setBrushRange([0, Math.max(1, allPoints.length - 1)]);
  }, [allPoints.length]);

  // Active slice of points constrained by time brush
  const points = useMemo(() => {
    const [start, end] = brushRange;
    const safeStart = Math.max(0, Math.min(start, allPoints.length - 2));
    const safeEnd = Math.max(safeStart + 1, Math.min(end, allPoints.length - 1));
    const sliced = allPoints.slice(safeStart, safeEnd + 1);
    return sliced.length >= 2 ? sliced : allPoints;
  }, [allPoints, brushRange]);

  // Synchronize external hovered date from other widgets (e.g. Daily PnL or Calendar)
  useEffect(() => {
    if (externalHoveredDate) {
      const matchIdx = points.findIndex(p => p.date === externalHoveredDate);
      if (matchIdx !== -1) {
        setInternalHoverIndex(matchIdx);
      }
    }
  }, [externalHoveredDate, points]);

  // Quick preset helper
  const handleApplyPreset = (preset: '1D' | '1W' | '1M' | 'YTD' | 'ALL') => {
    const maxIdx = allPoints.length - 1;
    if (preset === '1D') {
      setBrushRange([Math.max(0, maxIdx - 5), maxIdx]);
    } else if (preset === '1W') {
      setBrushRange([Math.max(0, maxIdx - 12), maxIdx]);
    } else if (preset === '1M') {
      setBrushRange([Math.max(0, maxIdx - 25), maxIdx]);
    } else if (preset === 'YTD') {
      setBrushRange([Math.max(0, maxIdx - 50), maxIdx]);
    } else {
      setBrushRange([0, maxIdx]);
    }
    setInternalHoverIndex(null);
    onHoverChange?.({ date: null, point: null });
  };

  // Values based on view mode
  const getVal = useCallback((pt: EquityPoint) => {
    switch (viewMode) {
      case 'equity':
        return pt.balance;
      case 'pnl':
        return pt.balance - startingBalance;
      case 'return':
        return startingBalance > 0 ? ((pt.balance - startingBalance) / startingBalance) * 100 : 0;
      case 'drawdown':
        return pt.peak > 0 ? -((pt.peak - pt.balance) / pt.peak) * 100 : 0;
    }
  }, [viewMode, startingBalance]);

  const values = points.map(getVal);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = maxVal - minVal || 100;
  const padding = valRange * 0.12;
  const yMin = minVal - padding;
  const yMax = maxVal + padding;

  // Chart dimensions
  const width = 840;
  const height = 300;
  const margin = { top: 24, right: 40, bottom: 36, left: 68 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const getX = (idx: number) => margin.left + (idx / Math.max(1, points.length - 1)) * innerWidth;
  const getY = (val: number) => margin.top + innerHeight - ((val - yMin) / (yMax - yMin)) * innerHeight;

  // Build SVG Path
  const linePoints = points.map((p, i) => `${getX(i)},${getY(getVal(p))}`).join(' ');
  const areaPoints = `${getX(0)},${margin.top + innerHeight} ${linePoints} ${getX(points.length - 1)},${margin.top + innerHeight}`;

  // Benchmark line
  const benchPoints = points.map((p, i) => {
    const benchVal = viewMode === 'equity' 
      ? startingBalance * (1 + (i / points.length) * 0.04)
      : viewMode === 'pnl' 
      ? startingBalance * ((i / points.length) * 0.04)
      : (i / points.length) * 4;
    return `${getX(i)},${getY(benchVal)}`;
  }).join(' ');

  // Zero reference line if applicable
  const zeroY = getY(viewMode === 'pnl' || viewMode === 'return' ? 0 : startingBalance);

  // Active hover point
  const hoverIdx = internalHoverIndex !== null && internalHoverIndex < points.length
    ? internalHoverIndex 
    : points.length - 1;
  const activePt = points[hoverIdx] || points[points.length - 1];
  const activeVal = activePt ? getVal(activePt) : 0;

  const currentEquity = points[points.length - 1]?.balance || startingBalance;
  const netReturn = currentEquity - startingBalance;
  const netReturnPct = startingBalance > 0 ? (netReturn / startingBalance) * 100 : 0;
  const peakEquity = Math.max(...points.map(p => p.balance));
  const currentDrawdown = peakEquity - currentEquity;

  const rawGradientId = useId();
  const gradientId = `eqGrad-${rawGradientId.replace(/:/g, '')}`;

  // Interactive mouse tracking over main chart area
  const svgRef = useRef<SVGSVGElement>(null);

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !enableCrosshair) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * width;

    // Constrain within inner width
    const clampedX = Math.max(margin.left, Math.min(width - margin.right, svgX));
    const normalized = (clampedX - margin.left) / innerWidth;
    const nearestIdx = Math.round(normalized * (points.length - 1));

    if (nearestIdx >= 0 && nearestIdx < points.length) {
      setInternalHoverIndex(nearestIdx);
      const pt = points[nearestIdx];
      onHoverChange?.({ date: pt.date, point: pt });
    }
  };

  const handleSvgMouseLeave = () => {
    setInternalHoverIndex(null);
    onHoverChange?.({ date: null, point: null });
  };

  // --- Time-Range Brushing Drag Handlers ---
  const handleBrushMouseDown = (handleType: 'start' | 'end' | 'window', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBrushing(true);
    dragHandleRef.current = handleType;
    dragStartPosRef.current = {
      clientX: e.clientX,
      range: [...brushRange] as [number, number],
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isBrushing || !dragHandleRef.current || !brushTrackRef.current) return;
      const trackRect = brushTrackRef.current.getBoundingClientRect();
      const trackWidth = trackRect.width;
      if (trackWidth <= 0) return;

      const deltaX = e.clientX - dragStartPosRef.current.clientX;
      const deltaRatio = deltaX / trackWidth;
      const totalPoints = allPoints.length;
      const deltaIndex = Math.round(deltaRatio * (totalPoints - 1));

      const [origStart, origEnd] = dragStartPosRef.current.range;
      const minDistance = Math.min(2, totalPoints - 1);

      if (dragHandleRef.current === 'start') {
        const newStart = Math.max(0, Math.min(origEnd - minDistance, origStart + deltaIndex));
        setBrushRange([newStart, origEnd]);
      } else if (dragHandleRef.current === 'end') {
        const newEnd = Math.min(totalPoints - 1, Math.max(origStart + minDistance, origEnd + deltaIndex));
        setBrushRange([origStart, newEnd]);
      } else if (dragHandleRef.current === 'window') {
        const windowSize = origEnd - origStart;
        let newStart = origStart + deltaIndex;
        let newEnd = origEnd + deltaIndex;

        if (newStart < 0) {
          newStart = 0;
          newEnd = windowSize;
        } else if (newEnd > totalPoints - 1) {
          newEnd = totalPoints - 1;
          newStart = newEnd - windowSize;
        }
        setBrushRange([newStart, newEnd]);
      }
    };

    const handleMouseUp = () => {
      if (isBrushing) {
        setIsBrushing(false);
        dragHandleRef.current = null;
      }
    };

    if (isBrushing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isBrushing, allPoints.length]);

  // Mini overview curve calculation for brush bar
  const miniValues = allPoints.map(getVal);
  const miniMin = Math.min(...miniValues);
  const miniMax = Math.max(...miniValues);
  const miniRange = miniMax - miniMin || 1;
  const miniPoints = allPoints.map((p, i) => {
    const x = (i / Math.max(1, allPoints.length - 1)) * 100;
    const y = 28 - ((getVal(p) - miniMin) / miniRange) * 24;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const brushStartPct = (brushRange[0] / Math.max(1, allPoints.length - 1)) * 100;
  const brushEndPct = (brushRange[1] / Math.max(1, allPoints.length - 1)) * 100;
  const isZoomed = brushRange[0] > 0 || brushRange[1] < allPoints.length - 1;

  return (
    <div className={embedded ? 'relative overflow-hidden w-full h-full flex flex-col justify-between' : 'trade-card rounded-2xl p-6 relative overflow-hidden'}>
      {/* Header controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-3 border-b border-[#8B5CF6]/15">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base lg:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shadow-[0_0_12px_#8B5CF6] animate-pulse-subtle"></span>
              Institutional Equity Curve
            </h3>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#161028] border border-[#8B5CF6]/30 text-[#A78BFA] font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]"></span>
              Crosshair Synced
            </span>
            {isZoomed && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/50 text-[#C084FC] font-mono font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                <ZoomIn size={10} />
                Brushed Window: {points.length} Trades
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3.5 mt-1.5">
            <span className="text-2xl lg:text-3xl font-extrabold font-mono text-white tracking-tight">
              {formatCurrency(currentEquity)}
            </span>
            <span className={`text-xs lg:text-sm font-bold font-mono flex items-center gap-0.5 ${netReturn >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
              {netReturn >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {netReturn >= 0 ? '+' : ''}{formatCurrency(netReturn)} ({netReturn >= 0 ? '+' : ''}{netReturnPct.toFixed(2)}%)
            </span>
            <span className="text-xs text-[#94A3B8] hidden sm:inline font-mono">
              ATH: <strong className="text-slate-300">{formatCurrency(peakEquity)}</strong>
              {currentDrawdown > 0 && ` | DD: -${formatCurrency(currentDrawdown)}`}
            </span>
          </div>
        </div>

        {/* View mode, Timeframe presets, & Crosshair toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode */}
          <div className="flex items-center bg-[#07060A]/80 p-1 rounded-2xl border border-[#8B5CF6]/25 text-xs font-sans">
            {(['equity', 'pnl', 'return', 'drawdown'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 rounded-xl capitalize font-semibold transition-all ${
                  viewMode === mode
                    ? 'bg-[#8B5CF6] text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {mode === 'equity' ? 'Equity ($)' : mode === 'pnl' ? 'PnL ($)' : mode === 'return' ? 'Return (%)' : 'Drawdown'}
              </button>
            ))}
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center bg-[#07060A]/80 p-1 rounded-2xl border border-[#8B5CF6]/25 text-xs font-mono">
            {(['1D', '1W', '1M', 'YTD', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => handleApplyPreset(tf)}
                className="px-2.5 py-1 rounded-xl font-semibold transition-all hover:bg-[#1C1536] text-[#94A3B8] hover:text-white"
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Benchmark toggle */}
          <button
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`px-3 py-1.5 rounded-2xl border text-xs font-semibold transition-all ${
              showBenchmark
                ? 'bg-[#C084FC]/20 border-[#C084FC]/50 text-[#C084FC] shadow-[0_0_12px_rgba(192,132,252,0.3)]'
                : 'bg-[#07060A]/80 border-[#8B5CF6]/25 text-[#94A3B8]'
            }`}
            title="Toggle benchmark reference line"
          >
            Benchmark
          </button>

          {/* Crosshair toggle */}
          <button
            onClick={() => setEnableCrosshair(!enableCrosshair)}
            className={`px-2.5 py-1.5 rounded-2xl border text-xs font-semibold transition-all flex items-center gap-1 ${
              enableCrosshair
                ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#C084FC] shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                : 'bg-[#07060A]/80 border-[#8B5CF6]/25 text-[#94A3B8]'
            }`}
            title="Toggle crosshair cursor mode"
          >
            <Crosshair size={13} />
          </button>
        </div>
      </div>

      {/* Main SVG Interactive Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          onMouseMove={handleSvgMouseMove}
          onMouseLeave={handleSvgMouseLeave}
          className="w-full h-64 md:h-72 select-none overflow-visible cursor-crosshair"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.45" />
              <stop offset="65%" stopColor="var(--accent-primary)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow-crosshair" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = margin.top + innerHeight * pct;
            const val = yMax - pct * (yMax - yMin);
            return (
              <g key={idx}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeOpacity="0.45"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={margin.left - 10}
                  y={y + 4}
                  fill="#94A3B8"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {viewMode === 'return' || viewMode === 'drawdown'
                    ? `${val.toFixed(1)}%`
                    : `$${Math.round(val).toLocaleString()}`}
                </text>
              </g>
            );
          })}

          {/* Zero/Baseline Line */}
          {zeroY >= margin.top && zeroY <= margin.top + innerHeight && (
            <line
              x1={margin.left}
              y1={zeroY}
              x2={width - margin.right}
              y2={zeroY}
              stroke="#475569"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Benchmark line with desaturated gold/lavender tone */}
          {showBenchmark && (
            <polyline
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.6"
              points={benchPoints}
            />
          )}

          {/* Area Fill */}
          <polygon
            fill={`url(#${gradientId})`}
            points={areaPoints}
          />

          {/* Main Curve */}
          <polyline
            fill="none"
            stroke="var(--accent-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={linePoints}
          />

          {/* Trade Markers Nodes */}
          {points.map((p, i) => {
            const cx = getX(i);
            const cy = getY(getVal(p));
            const isHovered = hoverIdx === i;
            const isWin = p.pnl > 0;
            const isLoss = p.pnl < 0;

            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : i === 0 ? 2.5 : 3.5}
                  fill={isWin ? '#10B981' : isLoss ? '#F43F5E' : 'var(--accent-primary)'}
                  stroke="var(--bg-primary)"
                  strokeWidth="2"
                  className="transition-all"
                />
              </g>
            );
          })}

          {/* SYNCHRONIZED DUAL CROSSHAIR HUD GUIDES */}
          {enableCrosshair && hoverIdx !== null && activePt && (
            <g className="transition-all pointer-events-none">
              {/* Vertical Guide Line */}
              <line
                x1={getX(hoverIdx)}
                y1={margin.top}
                x2={getX(hoverIdx)}
                y2={margin.top + innerHeight}
                stroke="#C084FC"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.9"
              />

              {/* Horizontal Guide Line to Y-Axis */}
              <line
                x1={margin.left}
                y1={getY(activeVal)}
                x2={width - margin.right}
                y2={getY(activeVal)}
                stroke="#8B5CF6"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.5"
              />

              {/* Pulsing Crosshair Target Center */}
              <circle
                cx={getX(hoverIdx)}
                cy={getY(activeVal)}
                r="11"
                fill="none"
                stroke="#C084FC"
                strokeWidth="1.5"
                opacity="0.5"
                className="animate-ping"
              />
              <circle
                cx={getX(hoverIdx)}
                cy={getY(activeVal)}
                r="6"
                fill="#C084FC"
                stroke="#FFFFFF"
                strokeWidth="2"
              />

              {/* Y-Axis Value Badge Callout */}
              <g transform={`translate(${margin.left - 65}, ${Math.max(margin.top + 8, Math.min(margin.top + innerHeight - 8, getY(activeVal))) - 10})`}>
                <rect
                  x="0"
                  y="0"
                  width="60"
                  height="18"
                  rx="6"
                  fill="#161028"
                  stroke="#8B5CF6"
                  strokeWidth="1"
                />
                <text
                  x="30"
                  y="12"
                  fill="#C084FC"
                  fontSize="9.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {viewMode === 'return' || viewMode === 'drawdown'
                    ? `${activeVal.toFixed(1)}%`
                    : `$${Math.round(activeVal).toLocaleString()}`}
                </text>
              </g>

              {/* X-Axis Date Badge Callout */}
              <g transform={`translate(${Math.max(margin.left, Math.min(width - margin.right - 70, getX(hoverIdx) - 35))}, ${height - margin.bottom + 8})`}>
                <rect
                  x="0"
                  y="0"
                  width="70"
                  height="18"
                  rx="6"
                  fill="#161028"
                  stroke="#8B5CF6"
                  strokeWidth="1"
                />
                <text
                  x="35"
                  y="12"
                  fill="#F3F0FC"
                  fontSize="9.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {activePt.date.slice(5)} {activePt.time ? activePt.time.slice(0, 5) : ''}
                </text>
              </g>
            </g>
          )}

          {/* Standard X Axis Date Ticks */}
          {points.map((p, i) => {
            const step = Math.max(1, Math.floor(points.length / 6));
            if (i % step !== 0 && i !== points.length - 1) return null;
            return (
              <text
                key={i}
                x={getX(i)}
                y={height - margin.bottom + 22}
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
              >
                {p.date.slice(5)}
              </text>
            );
          })}
        </svg>

        {/* INSTITUTIONAL CROSSHAIR HUD TELEMETRY BANNER */}
        {activePt && (
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3 bg-[#0E0A1A]/95 backdrop-blur-2xl px-4 py-2.5 rounded-2xl border border-[#8B5CF6]/30 shadow-2xl text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C084FC] shadow-[0_0_8px_#C084FC]"></span>
                <span className="font-mono font-bold text-slate-200">
                  {activePt.date} {activePt.time ? `• ${activePt.time}` : ''}
                </span>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-[#181130] border border-[#8B5CF6]/30 text-[#A78BFA] font-mono font-bold text-[11px]">
                {activePt.symbol}
              </span>

              {activePt.trade && (
                <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                  activePt.trade.direction === 'CALL' || activePt.trade.direction === 'Long'
                    ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                    : 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/40'
                }`}>
                  {activePt.trade.direction}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-xs">
              <div>
                <span className="text-[#94A3B8] mr-1 text-[11px]">Trade PnL:</span>
                <span className={`font-bold ${activePt.pnl >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                  {activePt.pnl >= 0 ? '+' : ''}{formatCurrency(activePt.pnl)}
                </span>
              </div>

              <div>
                <span className="text-[#94A3B8] mr-1 text-[11px]">Balance:</span>
                <span className="font-bold text-white">
                  {formatCurrency(activePt.balance)}
                </span>
              </div>

              <div>
                <span className="text-[#94A3B8] mr-1 text-[11px]">ATH Drawdown:</span>
                <span className={`font-bold ${activePt.drawdown > 0 ? 'text-[#F43F5E]' : 'text-[#94A3B8]'}`}>
                  {activePt.drawdown > 0 ? `-${formatCurrency(activePt.drawdown)}` : '$0.00'}
                </span>
              </div>

              {activePt.trade?.rMultiple !== undefined && (
                <div>
                  <span className="text-[#94A3B8] mr-1 text-[11px]">R-Multiple:</span>
                  <span className={`font-bold ${activePt.trade.rMultiple >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                    {activePt.trade.rMultiple >= 0 ? '+' : ''}{activePt.trade.rMultiple.toFixed(2)}R
                  </span>
                </div>
              )}

              {activePt.trade?.duration && (
                <div className="hidden md:inline">
                  <span className="text-[#94A3B8] mr-1 text-[11px]">Duration:</span>
                  <span className="text-slate-300 font-semibold">{activePt.trade.duration}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* INTERACTIVE TIME-RANGE BRUSH OVERVIEW SLIDER */}
      <div className="mt-3 pt-3 border-t border-[#8B5CF6]/15 select-none">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] mb-1.5 px-0.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={12} className="text-[#C084FC]" />
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
              Time-Range Brush Overview
            </span>
            <span className="text-[#A78BFA]/70">
              ({allPoints[brushRange[0]]?.date || 'Start'} → {allPoints[brushRange[1]]?.date || 'End'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#94A3B8]">
              {brushRange[1] - brushRange[0] + 1} of {allPoints.length} Trades
            </span>
            {isZoomed && (
              <button
                onClick={() => handleApplyPreset('ALL')}
                className="text-[10px] text-[#C084FC] hover:text-white flex items-center gap-1 font-semibold transition-colors hover:underline"
                title="Reset zoom to full dataset"
              >
                <RefreshCw size={10} />
                Reset Zoom
              </button>
            )}
          </div>
        </div>

        {/* Brush Track Bar */}
        <div
          ref={brushTrackRef}
          className="relative h-10 w-full bg-[#07060A] border border-[#8B5CF6]/25 rounded-xl overflow-hidden cursor-pointer"
        >
          {/* Mini Sparkline Background */}
          <svg
            viewBox="0 0 100 28"
            preserveAspectRatio="none"
            className="w-full h-full opacity-40 pointer-events-none"
          >
            <polyline
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="1.2"
              points={miniPoints}
            />
          </svg>

          {/* Brushed Active Window Overlay */}
          <div
            style={{
              left: `${brushStartPct}%`,
              width: `${Math.max(4, brushEndPct - brushStartPct)}%`,
            }}
            className="absolute top-0 bottom-0 bg-[#8B5CF6]/25 border-t-2 border-b-2 border-[#8B5CF6] cursor-grab active:cursor-grabbing flex items-center justify-between"
            onMouseDown={(e) => handleBrushMouseDown('window', e)}
            title="Drag to slide viewing window across time"
          >
            {/* Left Handle */}
            <div
              className="w-3.5 h-full bg-[#181130] hover:bg-[#8B5CF6] border-r border-[#8B5CF6] cursor-ew-resize flex items-center justify-center transition-colors group"
              onMouseDown={(e) => handleBrushMouseDown('start', e)}
              title="Drag to resize start time"
            >
              <div className="w-1 h-3 flex flex-col justify-between">
                <div className="w-0.5 h-0.5 rounded-full bg-white"></div>
                <div className="w-0.5 h-0.5 rounded-full bg-white"></div>
                <div className="w-0.5 h-0.5 rounded-full bg-white"></div>
              </div>
            </div>

            {/* Middle Pan Indicator Lines */}
            <div className="flex items-center gap-1 opacity-50 pointer-events-none">
              <div className="w-0.5 h-3 bg-white/60 rounded"></div>
              <div className="w-0.5 h-3 bg-white/60 rounded"></div>
            </div>

            {/* Right Handle */}
            <div
              className="w-3.5 h-full bg-[#181130] hover:bg-[#8B5CF6] border-l border-[#8B5CF6] cursor-ew-resize flex items-center justify-center transition-colors group"
              onMouseDown={(e) => handleBrushMouseDown('end', e)}
              title="Drag to resize end time"
            >
              <div className="w-1 h-3 flex flex-col justify-between">
                <div className="w-0.5 h-0.5 rounded-full bg-white"></div>
                <div className="w-0.5 h-0.5 rounded-full bg-white"></div>
                <div className="w-0.5 h-0.5 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
