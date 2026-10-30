// Web Audio API Micro-Sound Synthesizer & Web Speech API Voice Alerts
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
}

/**
  * Web Speech API Voice Synthesizer for Real-Time Audio Announcements
  */
export function speakVoiceAlert(phrase: string, enabled = true) {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop any pending voice
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.rate = 1.05; // Slightly brisk trading floor speed
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    // Pick crisp English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Voice alert failed:', e);
  }
}

/**
  * Speak trade execution results (ITM, OTM, ATM)
  */
export function speakTradeResult(result: 'ITM' | 'OTM' | 'ATM', pnl: number, symbol: string, voiceEnabled = true) {
  if (!voiceEnabled) return;

  const formattedPnl = Math.abs(pnl).toFixed(2);
  let phrase = '';

  if (result === 'ITM') {
    phrase = `Trade in the money! Plus ${formattedPnl} dollars profit on ${symbol}.`;
  } else if (result === 'OTM') {
    phrase = `Trade out of the money! Minus ${formattedPnl} dollars on ${symbol}.`;
  } else {
    phrase = `Trade at the money! Position refunded on ${symbol}.`;
  }

  speakVoiceAlert(phrase, voiceEnabled);
}

/**
  * Speak daily profit target achieved
  */
export function speakTargetAchieved(targetAmount: number, voiceEnabled = true) {
  if (!voiceEnabled) return;
  speakVoiceAlert(`Congratulations! Daily profit goal of ${targetAmount} dollars achieved. Lock gains and stop trading.`, voiceEnabled);
}

/**
  * Speak daily loss limit warning
  */
export function speakLossWarning(lossAmount: number, voiceEnabled = true) {
  if (!voiceEnabled) return;
  speakVoiceAlert(`Warning! Daily loss limit of ${lossAmount} dollars breached. Stop trading to protect capital.`, voiceEnabled);
}

/**
  * Gentle click sound for navigation / tab switches
  */
export function playClickSound(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(820, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
}

/**
  * Harmonious chime for profitable trades or goals achieved
  */
export function playWinSound(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.06, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.28);
    });
  } catch (e) {}
}

/**
  * Soft subtle low-frequency tone for loss trades or warnings
  */
export function playLossSound(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.16);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  } catch (e) {}
}

/**
  * Sleek frequency sweep when changing visual themes
  */
export function playThemeSound(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  } catch (e) {}
}
