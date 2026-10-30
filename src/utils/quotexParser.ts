import { Trade, BinaryDirection, CfdDirection, TradeEmotion } from '../types/trade';
import { calculateBinaryTrade } from './calculations';

export interface ParseResult {
  trades: Trade[];
  sourceType: 'quotex-clipboard' | 'tradepath-csv' | 'generic-csv';
  successCount: number;
  warnings: string[];
}

export function parseTradeText(rawInput: string): ParseResult {
  const text = rawInput.trim();
  const warnings: string[] = [];

  if (!text) {
    return { trades: [], sourceType: 'quotex-clipboard', successCount: 0, warnings: ['Input is empty'] };
  }

  // Check if it's CSV
  if (text.includes(',') && (text.includes('Symbol') || text.includes('Side') || text.includes('Entry') || text.includes('PnL') || text.includes('"Date"'))) {
    return parseCsvContent(text);
  }

  // Otherwise try parsing as Quotex trade history rows
  return parseQuotexClipboard(text);
}

export function parseQuotexClipboard(text: string): ParseResult {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const trades: Trade[] = [];
  const warnings: string[] = [];

  lines.forEach((line, index) => {
    // Skip table header if present
    if (/ticket|asset|direction|investment|open price|payout|status/i.test(line) && line.length < 80) {
      return;
    }

    try {
      // Common Quotex copy formats:
      // Format A: tabs or multiple spaces
      // Example: "#8492018 2026-10-25 18:24:10 EUR/USD (OTC) UP 50.00 1.08450 1.08482 +43.50 87%"
      // Or: "EUR/USD OTC, CALL, $10, 1.0845, 1.0848, Win, +$8.50"
      
      const tokens = line.split(/[\t,|]+|\s{2,}/).map(s => s.trim()).filter(Boolean);
      
      // Look for asset name
      const assetMatch = line.match(/([A-Z]{3}\/[A-Z]{3}(\s*\(OTC\))?|[A-Z]{3,6}USDT?|[A-Z]{3,8}\s*OTC|Gold(\s*\(OTC\))?|Silver|Crude|Bitcoin|Ethereum|NQ|ES)/i);
      const symbol = assetMatch ? assetMatch[0].trim().toUpperCase() : 'EUR/USD (OTC)';

      // Look for direction
      let direction: BinaryDirection = 'CALL';
      if (/\b(PUT|DOWN|SELL|SHORT|LOWER)\b/i.test(line)) {
        direction = 'PUT';
      } else if (/\b(CALL|UP|BUY|LONG|HIGHER)\b/i.test(line)) {
        direction = 'CALL';
      }

      // Look for numbers like investment, entry, exit, payout, profit
      // Find currency or dollar amounts
      const amounts = Array.from(line.matchAll(/([+-]?\$?\s*\d+(\.\d+)?)/g)).map(m => m[1].replace(/[$\s]/g, ''));
      const numValues = amounts.map(Number).filter(n => !isNaN(n));

      // Date detection
      const dateMatch = line.match(/(\d{4}[-/.]\d{2}[-/.]\d{2}|\d{2}[-/.]\d{2}[-/.]\d{4})/);
      let date = new Date().toISOString().slice(0, 10);
      if (dateMatch) {
        const d = dateMatch[1].replace(/\./g, '-').replace(/\//g, '-');
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
          date = d;
        } else if (/^\d{2}-\d{2}-\d{4}$/.test(d)) {
          const [d1, m1, y1] = d.split('-');
          date = `${y1}-${m1}-${d1}`;
        }
      }

      // Time detection
      const timeMatch = line.match(/(\d{2}:\d{2}(:\d{2})?)/);
      const time = timeMatch ? timeMatch[1] : '14:00:00';

      // Payout percentage detection: e.g. 85% or 87%
      const payoutMatch = line.match(/(\d{2})%/);
      const payoutPercent = payoutMatch ? parseInt(payoutMatch[1], 10) : 85;

      // Extract investment & outcome
      let investment = 20;
      let pnl = 17.00;
      let entry = 1.08500;
      let exit = 1.08530;

      // Check for explicit positive or negative profit in line: e.g. +$43.50, -$50.00
      const pnlMatch = line.match(/([+-]\$?\d+(\.\d+)?)/);
      let hasExplicitPnl = false;
      if (pnlMatch) {
        pnl = parseFloat(pnlMatch[1].replace('$', ''));
        hasExplicitPnl = true;
      }

      // Attempt to identify prices: typically decimals like 1.08450 or crypto like 67120
      const priceCandidates = numValues.filter(n => n > 0.0001 && n !== payoutPercent);

      if (priceCandidates.length >= 2) {
        // If prices are close or reasonable
        entry = priceCandidates[0];
        exit = priceCandidates[1];
        if (priceCandidates.length >= 3 && !hasExplicitPnl) {
          investment = priceCandidates[2];
        }
      }

      // Investment extraction if not found
      const investMatch = line.match(/\$(\d+(\.\d+)?)/);
      if (investMatch) {
        investment = parseFloat(investMatch[1]);
      }

      if (!hasExplicitPnl) {
        const outcome = calculateBinaryTrade(investment, payoutPercent, direction, entry, exit);
        pnl = outcome.pnl;
      }

      const isWin = pnl > 0;
      const emotions: TradeEmotion[] = ['Calm', 'Confident', 'Disciplined', 'FOMO', 'Revenge'];
      const emotion: TradeEmotion = isWin ? 'Confident' : 'Calm';

      trades.push({
        id: `qtx-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
        ticket: `#${Math.floor(10000000 + Math.random() * 90000000)}`,
        accountId: 'acc-quotex-live',
        type: 'binary',
        date,
        time,
        symbol,
        assetClass: symbol.includes('(OTC)') ? 'Quotex OTC Pairs' : 'Quotex Live Forex Pairs',
        direction,
        investment,
        payoutPercent,
        duration: '1M',
        timeframe: '1m',
        session: 'OTC Weekend',
        entry,
        exit,
        pnl: Math.round(pnl * 100) / 100,
        result: pnl > 0 ? 'ITM' : pnl < 0 ? 'OTM' : 'ATM',
        strategy: 'Support & Resistance Bounce',
        emotion,
        rulesFollowed: 5,
        totalRules: 5,
        notes: `Imported from Quotex history. Expiry: 1M, Payout: ${payoutPercent}%.`,
      });
    } catch (err) {
      warnings.push(`Row ${index + 1}: Could not parse line "${line.slice(0, 40)}..."`);
    }
  });

  return {
    trades,
    sourceType: 'quotex-clipboard',
    successCount: trades.length,
    warnings,
  };
}

export function parseCsvContent(csvString: string): ParseResult {
  const lines = csvString.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const trades: Trade[] = [];
  const warnings: string[] = [];

  if (lines.length < 2) {
    return { trades: [], sourceType: 'tradepath-csv', successCount: 0, warnings: ['CSV has no data rows'] };
  }

  // Parse header
  const headerLine = lines[0];
  const headers = parseCsvRow(headerLine).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

  const findCol = (terms: string[]) => headers.findIndex(h => terms.some(t => h.includes(t)));

  const dateIdx = findCol(['date', 'time', 'day']);
  const symbolIdx = findCol(['symbol', 'pair', 'asset', 'instrument', 'ticker']);
  const sideIdx = findCol(['side', 'direction', 'type', 'action']);
  const entryIdx = findCol(['entry', 'open', 'strike', 'open price']);
  const exitIdx = findCol(['exit', 'close', 'settlement', 'close price']);
  const stopIdx = findCol(['stop', 'sl', 'stop loss']);
  const sizeIdx = findCol(['size', 'units', 'contracts', 'lot', 'volume']);
  const pnlIdx = findCol(['pnl', 'profit', 'net', 'net pnl', 'gain']);
  const riskIdx = findCol(['risk', 'risk amount']);
  const rIdx = findCol(['r multiple', 'rmultiple', 'r', 'rr']);
  const stratIdx = findCol(['strategy', 'setup', 'model']);
  const emotionIdx = findCol(['emotion', 'psychology', 'mindset']);
  const rulesIdx = findCol(['rules', 'rules followed', 'checklist']);

  for (let i = 1; i < lines.length; i++) {
    const rawCols = parseCsvRow(lines[i]);
    if (!rawCols.length) continue;

    try {
      const getVal = (idx: number, fallback = '') => (idx >= 0 && rawCols[idx] !== undefined ? rawCols[idx].trim() : fallback);

      const dateRaw = getVal(dateIdx, new Date().toISOString().slice(0, 10));
      const symbol = getVal(symbolIdx, 'BTCUSDT').toUpperCase();
      const sideRaw = getVal(sideIdx, 'Long');
      const entry = parseFloat(getVal(entryIdx, '100')) || 100;
      const exit = parseFloat(getVal(exitIdx, '105')) || 105;
      const stop = parseFloat(getVal(stopIdx, '95')) || (entry * 0.98);
      const size = parseFloat(getVal(sizeIdx, '1')) || 1;
      const pnlRaw = parseFloat(getVal(pnlIdx, '0'));
      const riskRaw = parseFloat(getVal(riskIdx, '0'));
      const rRaw = parseFloat(getVal(rIdx, '0'));
      const strategy = getVal(stratIdx, 'Technical Setup');
      const emotionRaw = getVal(emotionIdx, 'Calm') as TradeEmotion;
      const rulesRaw = getVal(rulesIdx, '5/5');

      // Determine trade type: Quotex binary or standard CFD/Forex
      const isBinary = /CALL|PUT|UP|DOWN|OTC|BINARY/i.test(sideRaw) || /OTC/i.test(symbol);
      
      let direction: BinaryDirection | CfdDirection = 'Long';
      if (isBinary) {
        direction = /PUT|DOWN|SELL/i.test(sideRaw) ? 'PUT' : 'CALL';
      } else {
        direction = /SHORT|SELL/i.test(sideRaw) ? 'Short' : 'Long';
      }

      // Rules parsed
      let rulesFollowed = 5;
      let totalRules = 5;
      if (rulesRaw.includes('/')) {
        const [rf, tr] = rulesRaw.split('/').map(n => parseInt(n, 10));
        if (!isNaN(rf)) rulesFollowed = rf;
        if (!isNaN(tr)) totalRules = tr;
      }

      // Clean date
      let date = dateRaw;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateRaw)) {
        date = dateRaw;
      } else {
        const dObj = new Date(dateRaw);
        if (!isNaN(dObj.getTime())) {
          date = dObj.toISOString().slice(0, 10);
        }
      }

      const pnl = !isNaN(pnlRaw) ? pnlRaw : (exit - entry) * (direction === 'Long' || direction === 'CALL' ? 1 : -1) * size;

      trades.push({
        id: `csv-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        ticket: `#${Math.floor(10000000 + Math.random() * 90000000)}`,
        accountId: isBinary ? 'acc-quotex-live' : 'acc-apex-50k',
        type: isBinary ? 'binary' : 'cfd',
        date,
        time: '12:00:00',
        symbol,
        assetClass: symbol.includes('(OTC)') ? 'Quotex OTC Pairs' : 'Quotex Live Forex Pairs',
        direction,
        entry,
        exit,
        stopLoss: !isBinary ? stop : undefined,
        size: !isBinary ? size : undefined,
        investment: isBinary ? (riskRaw || 25) : undefined,
        payoutPercent: isBinary ? 85 : undefined,
        duration: isBinary ? '1M' : undefined,
        timeframe: isBinary ? '1m' : '15m',
        session: isBinary ? 'OTC Weekend' : 'New York Open',
        pnl: Math.round(pnl * 100) / 100,
        risk: riskRaw || Math.abs(entry - stop) * size,
        rMultiple: !isNaN(rRaw) ? rRaw : (riskRaw > 0 ? Math.round((pnl / riskRaw) * 100) / 100 : undefined),
        result: pnl > 0 ? (isBinary ? 'ITM' : 'WIN') : pnl < 0 ? (isBinary ? 'OTM' : 'LOSS') : (isBinary ? 'ATM' : 'BE'),
        strategy,
        emotion: emotionRaw || 'Calm',
        rulesFollowed,
        totalRules,
        notes: `Imported via CSV (${isBinary ? 'Quotex Binary' : 'CFD/Forex'})`,
      });
    } catch (err) {
      warnings.push(`Row ${i + 1}: Parsing issue, skipping row.`);
    }
  }

  return {
    trades,
    sourceType: 'tradepath-csv',
    successCount: trades.length,
    warnings,
  };
}

function parseCsvRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
