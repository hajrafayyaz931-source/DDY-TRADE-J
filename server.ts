import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API Route: Multi-turn Gemini Chatbot with conversation history and role instructions
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages, systemInstruction, model } = req.body;
      const modelName = model || 'gemini-3.8-flash';

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      // Convert messages to Gemini SDK contents format
      const contents = messages.map((m: any) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content || m.text || '' }],
      }));

      const defaultSystem = `You are DDY TRADE JOURNAL AI, a premier trading mentor, quantitative psychologist, and performance coach.
Your mission is to guide traders to consistent profitability in forex, crypto, indices, and Quotex binary options.
Key focus areas:
1. $100 to $5000 30-Day Trading Challenge: Provide disciplined day-by-day compounding advice, realistic target expectations, and warnings against over-leveraging.
2. Risk Management: Emphasize 1-2% risk rules, pre-set stop losses, and explain why 2.2x Martingale doubling leads to catastrophic account ruin.
3. Trading Psychology: Help traders reframe losses, overcome FOMO and revenge trading, and remain calm.
4. Quotex Binary Options: Advise on OTC trends, 1M/5M expiration timing, support & resistance retests, and high payout pair selection.
Keep your guidance sharp, structured with bullet points where appropriate, encouraging, and mathematically sound.`;

      // Build cascade of valid fallback models
      const requestedModel = model || 'gemini-3.1-flash-lite';
      const candidateModels = [
        requestedModel,
        'gemini-3.1-flash-lite',
        'gemini-flash-latest',
        'gemini-3.8-flash'
      ].filter((m, idx, arr) => arr.indexOf(m) === idx);

      let lastError: any = null;
      let replyText = '';
      let usedModel = requestedModel;

      for (const candidate of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: candidate,
            contents,
            config: {
              systemInstruction: systemInstruction || defaultSystem,
            },
          });

          if (response && response.text) {
            replyText = response.text;
            usedModel = candidate;
            break;
          }
        } catch (err: any) {
          console.warn(`Gemini generation attempt with ${candidate} failed:`, err?.message || err);
          lastError = err;
          // Brief pause before trying fallback model if 503 high demand or 429
          await new Promise((r) => setTimeout(r, 350));
        }
      }

      if (replyText) {
        return res.json({ reply: replyText, modelUsed: usedModel });
      }

      // If all candidate models failed, parse the message cleanly
      let parsedMessage = 'The AI service is experiencing temporary peak demand. Please retry in a moment.';
      if (lastError?.message) {
        try {
          const parsed = JSON.parse(lastError.message);
          parsedMessage = parsed.error?.message || parsed.message || lastError.message;
        } catch {
          parsedMessage = lastError.message;
        }
      }

      console.error('All Gemini model candidates exhausted:', parsedMessage);
      res.status(503).json({ 
        error: parsedMessage,
        details: lastError?.status || 'UNAVAILABLE'
      });
    } catch (outerErr: any) {
      console.error('Unexpected Gemini endpoint error:', outerErr);
      res.status(500).json({ error: outerErr?.message || 'Internal server error' });
    }
  });

  // Explicit routes for project zip download
  app.get('/ddy-trade-journal-complete.zip', (_req, res) => {
    const zipPath = path.resolve(__dirname, 'public', 'ddy-trade-journal-complete.zip');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="ddy-trade-journal-complete.zip"');
    res.sendFile(zipPath);
  });

  app.get('/tradepath-pro-complete.zip', (_req, res) => {
    const zipPath = path.resolve(__dirname, 'public', 'ddy-trade-journal-complete.zip');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="ddy-trade-journal-complete.zip"');
    res.sendFile(zipPath);
  });

  // Serve static files from public directory
  app.use(express.static(path.resolve(__dirname, 'public')));

  // Dev server or static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
