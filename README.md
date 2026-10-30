# TradePath Pro — Institutional Visual Trading Journal

TradePath Pro is an institutional-grade trading journal, performance analytics terminal, and risk management operating system designed for Quotex binary options, forex, crypto, and futures traders.

## Key Features

1. **$100 to $5000: 30-Day Trading Challenge Target Journal**:
   - Day-by-day compounding schedule with daily profit targets, lot sizes, and Quotex investment rules.
   - Interactive status toggles: Achieved (YES), Missed (NO), In Progress, Pending.
   - Milestone progress bar ($100 -> $500 -> $1,640 -> $5,000).
   - CSV export & printable desk sheet.

2. **Quotex Binary Options Auto-Importer**:
   - One-click clipboard copy-paste from Quotex broker table.
   - Automatic extraction of Asset, CALL / PUT (UP / DOWN), Investment, Strike Price, Settlement Price, and Payout %.
   - Full drag-and-drop CSV parser.

3. **Interactive Candlestick & Tick Replay Engine**:
   - Replay trades candle-by-candle with speed slider and play/pause controls.
   - Strike level lines, entry markers, duration countdowns, and win/loss resolution glows.
   - Screenshot attachment storage.

4. **Gemini Multi-Turn AI Chatbot**:
   - Conversational trading performance coach with full multi-turn memory.
   - Specialized role presets: Challenge Coach, Quotex Specialist, Anti-FOMO Guardian, and Institutional Risk Analyst.
   - Powered by `@google/genai` on server routes.

5. **Institutional Analytics Laboratory**:
   - Large interactive Equity Curve (Equity $, Cumulative PnL $, % Return, Drawdown Waterfall).
   - Daily PnL bar chart, R-Multiple distribution histogram, Win/Loss breakdown.
   - Monthly calendar heatmap with day-by-day drill-down.
   - Session & Weekday edge performance analysis.

6. **Psychology & Rules Engine**:
   - Measured "Cost of Emotional Trading" ($ lost on FOMO/Revenge vs Calm/Disciplined).
   - Custom personal rulebook with pre-trade checklist compliance tracking.

7. **Risk Sizing & Martingale Simulator**:
   - Position sizer for Forex, Crypto, and Futures.
   - 2.2x Martingale risk-of-ruin simulator vs fixed 1-2% compounding model.

---

## Installation & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set your environment variables in `.env`:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open your browser at:
   ```
   http://localhost:3000
   ```
