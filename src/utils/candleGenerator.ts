import { CandleData, Trade } from '../types/trade';

/**
 * Generates realistic candlestick data around a trade's entry and exit prices
 * so the user gets a rich visual chart with replay capabilities.
 */
export function generateCandlesForTrade(trade: Trade, candleCount = 20): CandleData[] {
  if (trade.chartData && trade.chartData.length > 5) {
    return trade.chartData;
  }

  const { entry, exit, direction, date, time } = trade;
  const isUp = direction === 'CALL' || direction === 'Long';
  const priceSpread = Math.abs(exit - entry) || (entry * 0.001);
  const baseVolatility = Math.max(priceSpread * 0.4, entry * 0.0005);
  
  // Decide where the entry occurs: ~candle index 10 (out of 20)
  const entryIndex = Math.floor(candleCount * 0.55);
  const exitIndex = candleCount - 3;
  
  const candles: CandleData[] = [];
  
  // Anchor the pre-entry drift
  let currentClose = entry - (isUp ? priceSpread * 0.6 : -priceSpread * 0.6);
  
  // Base time
  const [hours = 14, minutes = 30] = (time || '14:30:00').split(':').map(Number);
  
  for (let i = 0; i < candleCount; i++) {
    const candleMinute = (minutes - (candleCount - i) + 60) % 60;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(candleMinute).padStart(2, '0')}`;
    
    let open = currentClose;
    let target = open;
    
    if (i < entryIndex) {
      // Wandering towards entry
      const progress = i / entryIndex;
      target = open + (entry - open) * 0.35 + (Math.sin(i) * baseVolatility * 0.6);
    } else if (i === entryIndex) {
      // Entry candle
      open = entry;
      const step = (exit - entry) * 0.3;
      target = entry + step;
    } else if (i > entryIndex && i <= exitIndex) {
      // Trade duration movement towards exit
      const progress = (i - entryIndex) / (exitIndex - entryIndex);
      target = entry + (exit - entry) * progress + (Math.sin(i * 2) * baseVolatility * 0.3);
    } else {
      // Post-exit continuation
      target = exit + (Math.sin(i) * baseVolatility * 0.4);
    }

    const close = target;
    const high = Math.max(open, close) + Math.random() * baseVolatility;
    const low = Math.min(open, close) - Math.random() * baseVolatility;
    
    // Ensure entry and exit are respected at their milestone candles
    let finalOpen = Math.round(open * 100000) / 100000;
    let finalClose = Math.round(close * 100000) / 100000;
    let finalHigh = Math.round(high * 100000) / 100000;
    let finalLow = Math.round(low * 100000) / 100000;
    
    if (i === entryIndex) {
      finalOpen = entry;
    }
    if (i === exitIndex) {
      finalClose = exit;
    }

    candles.push({
      time: timeStr,
      open: finalOpen,
      high: Math.max(finalHigh, finalOpen, finalClose),
      low: Math.min(finalLow, finalOpen, finalClose),
      close: finalClose,
    });

    currentClose = finalClose;
  }

  return candles;
}
