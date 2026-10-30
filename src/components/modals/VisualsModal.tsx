import React from 'react';
import { 
  X, 
  Palette, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  LayoutGrid, 
  Sun, 
  Sliders, 
  RotateCcw, 
  Check, 
  Zap, 
  BarChart3,
  Flame
} from 'lucide-react';
import { 
  VisualSettings, 
  ThemeId, 
  CandleStyle, 
  PnlColorway, 
  LayoutDensity, 
  GridIntensity,
  THEME_DEFINITIONS 
} from '../../types/visuals';
import { playClickSound, playWinSound, playThemeSound, speakVoiceAlert } from '../../utils/soundEffects';

interface VisualsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VisualSettings;
  onUpdateSettings: (newSettings: Partial<VisualSettings>) => void;
  onResetSettings: () => void;
}

export function VisualsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}: VisualsModalProps) {
  if (!isOpen) return null;

  const handleSelectTheme = (themeId: ThemeId) => {
    onUpdateSettings({ theme: themeId });
    playThemeSound(settings.soundEffects);
  };

  const handleSelectCandleStyle = (style: CandleStyle) => {
    onUpdateSettings({ candleStyle: style });
    playClickSound(settings.soundEffects);
  };

  const handleSelectColorway = (colorway: PnlColorway) => {
    onUpdateSettings({ pnlColorway: colorway });
    playClickSound(settings.soundEffects);
  };

  const handleToggleSound = () => {
    const next = !settings.soundEffects;
    onUpdateSettings({ soundEffects: next });
    if (next) {
      playWinSound(true);
    }
  };

  const handleTestChime = () => {
    playWinSound(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--glow-color)] border border-[var(--accent-primary)]/40 flex items-center justify-center text-[var(--accent-primary)] shadow-lg">
              <Sliders size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-tight">Visual & Theme Studio</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 font-bold">
                  PRO VISUALS
                </span>
              </div>
              <p className="text-xs text-[#8492A6]">
                Configure trading terminal colors, candlestick rendering, atmospheric glow, and audio feedback
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] text-[#8492A6] hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section 1: Institutional Theme Presets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono tracking-wider text-[#8492A6] uppercase flex items-center gap-1.5">
              <Palette size={14} className="text-[var(--accent-primary)]" />
              Terminal Color Themes
            </span>
            <span className="text-[11px] text-[#8492A6] font-mono">
              Active: {THEME_DEFINITIONS[settings.theme].name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.keys(THEME_DEFINITIONS) as ThemeId[]).map((id) => {
              const def = THEME_DEFINITIONS[id];
              const isSelected = settings.theme === id;

              return (
                <button
                  key={id}
                  onClick={() => handleSelectTheme(id)}
                  className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/30 shadow-lg'
                      : 'border-[var(--border-subtle)] hover:border-[#4B5563] bg-[#0A0E17]'
                  }`}
                  style={{
                    backgroundColor: def.surfacePrimary,
                  }}
                >
                  {/* Top indicator */}
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${def.accentPrimary}25`,
                        color: def.accentPrimary,
                        border: `1px solid ${def.accentPrimary}40`,
                      }}
                    >
                      {def.badge}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[var(--accent-primary)] text-black flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-sm text-white mb-1 group-hover:text-[var(--accent-primary)] transition-colors">
                    {def.name}
                  </div>
                  <div className="text-[10px] text-[#8492A6] line-clamp-1 mb-3">
                    {def.tagline}
                  </div>

                  {/* Swatch palette preview */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                    <span className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: def.bgPrimary }} title="Background" />
                    <span className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: def.surfacePrimary }} title="Surface" />
                    <span className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: def.accentPrimary }} title="Accent" />
                    <span className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: def.pnlPositive }} title="Win PnL" />
                    <span className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: def.pnlNegative }} title="Loss PnL" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Candlestick & Chart Engine */}
        <div className="space-y-3">
          <span className="text-xs font-bold font-mono tracking-wider text-[#8492A6] uppercase flex items-center gap-1.5">
            <BarChart3 size={14} className="text-[var(--accent-primary)]" />
            Candlestick Visualization Mode
          </span>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'neon', title: 'Neon Cyber Glow', desc: 'Luminous wicks with high-contrast edge glow' },
              { id: 'solid', title: 'Solid Japanese', desc: 'Standard filled institutional candlestick bars' },
              { id: 'hollow', title: 'Hollow Precision', desc: 'TradingView style hollow bull / filled bear' },
            ].map((style) => {
              const isSelected = settings.candleStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => handleSelectCandleStyle(style.id as CandleStyle)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[var(--surface-secondary)] border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/40 text-white'
                      : 'bg-[var(--surface-secondary)]/50 border-[var(--border-subtle)] hover:border-[#4B5563] text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs mb-1">
                    <span>{style.title}</span>
                    {isSelected && <Check size={13} className="text-[var(--accent-primary)]" />}
                  </div>
                  <p className="text-[10px] text-[#8492A6] leading-tight">
                    {style.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: PnL Colorway */}
        <div className="space-y-3">
          <span className="text-xs font-bold font-mono tracking-wider text-[#8492A6] uppercase flex items-center gap-1.5">
            <Zap size={14} className="text-[var(--accent-primary)]" />
            Profit / Loss Colorway
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'classic', label: 'Classic Emerald', win: '#00D69A', loss: '#FF5268' },
              { id: 'neon-vivid', label: 'Quotex Hyper Neon', win: '#00F29D', loss: '#FF3856' },
              { id: 'cyan-amber', label: 'Cyan / Amber', win: '#00E5FF', loss: '#F59E0B' },
              { id: 'monochrome', label: 'Laser OLED', win: '#22C55E', loss: '#EF4444' },
            ].map((col) => {
              const isSelected = settings.pnlColorway === col.id;
              return (
                <button
                  key={col.id}
                  onClick={() => handleSelectColorway(col.id as PnlColorway)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[var(--surface-secondary)] border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/40'
                      : 'bg-[var(--surface-secondary)]/40 border-[var(--border-subtle)] hover:border-[#4B5563]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-white mb-2">
                    <span className="truncate">{col.label}</span>
                    {isSelected && <Check size={12} className="text-[var(--accent-primary)]" />}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 flex-1 rounded-full" style={{ backgroundColor: col.win }} />
                    <span className="h-2 flex-1 rounded-full" style={{ backgroundColor: col.loss }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Atmosphere, Grid & Layout Density */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-subtle)]">
          {/* Atmosphere Toggles */}
          <div className="space-y-3">
            <span className="text-xs font-bold font-mono tracking-wider text-[#8492A6] uppercase flex items-center gap-1.5">
              <Sparkles size={14} className="text-[var(--accent-primary)]" />
              Atmosphere & Effects
            </span>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--border-hover)]">
                <div>
                  <div className="text-xs font-bold text-white">Ambient Radial Glow</div>
                  <div className="text-[10px] text-[#8492A6]">Soft top atmospheric glow based on theme</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.ambientGlow}
                  onChange={(e) => onUpdateSettings({ ambientGlow: e.target.checked })}
                  className="w-4 h-4 rounded text-[var(--accent-primary)] focus:ring-0"
                />
              </label>

              <div className="p-3 rounded-xl bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Chart Gridlines</div>
                  <div className="text-[10px] text-[#8492A6]">Intensity of coordinate background lines</div>
                </div>
                <div className="flex items-center gap-1 bg-[var(--bg-primary)] p-1 rounded-lg border border-[var(--border-subtle)]">
                  {(['subtle', 'crisp', 'hidden'] as GridIntensity[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => onUpdateSettings({ gridIntensity: g })}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold capitalize transition-all ${
                        settings.gridIntensity === g
                          ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                          : 'text-[#8492A6] hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sound FX & Density */}
          <div className="space-y-3">
            <span className="text-xs font-bold font-mono tracking-wider text-[#8492A6] uppercase flex items-center gap-1.5">
              <Volume2 size={14} className="text-[var(--accent-primary)]" />
              Audio Feedback & Density
            </span>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {settings.soundEffects ? <Volume2 size={14} className="text-[var(--pnl-positive)]" /> : <VolumeX size={14} className="text-[#8492A6]" />}
                    Terminal Audio Cues
                  </div>
                  <div className="text-[10px] text-[#8492A6]">Synthetic click, win & trade execution ticks</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestChime}
                    className="px-2 py-1 rounded bg-[var(--surface-tertiary)] hover:bg-[#253245] text-[10px] font-bold text-slate-200 border border-[var(--border-subtle)]"
                    title="Test synthesized win chime"
                  >
                    Test Chime
                  </button>
                  <button
                    onClick={handleToggleSound}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                      settings.soundEffects ? 'bg-[var(--accent-primary)]' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.soundEffects ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Voice Alerts Toggle */}
              <div className="p-3 rounded-xl bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Volume2 size={14} className="text-[#10B981]" />
                    AI Voice Alerts (Speech API)
                  </div>
                  <div className="text-[10px] text-[#8492A6]">Live spoken announcements for ITM win, OTM loss & target breach</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      speakVoiceAlert("Trade in the money! Plus $13.50 profit on EUR USD OTC.", true);
                    }}
                    className="px-2 py-1 rounded bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[10px] font-bold text-[#10B981] border border-[#10B981]/40"
                    title="Test Speech Voice Alert"
                  >
                    🔊 Test Voice
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ voiceAlerts: !settings.voiceAlerts })}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                      settings.voiceAlerts ? 'bg-[#10B981]' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.voiceAlerts ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <LayoutGrid size={14} className="text-[var(--accent-primary)]" />
                    Layout Density
                  </div>
                  <div className="text-[10px] text-[#8492A6]">Workstation spacing mode</div>
                </div>
                <div className="flex items-center gap-1 bg-[var(--bg-primary)] p-1 rounded-lg border border-[var(--border-subtle)]">
                  {(['comfortable', 'compact'] as LayoutDensity[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => onUpdateSettings({ density: d })}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold capitalize transition-all ${
                        settings.density === d
                          ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                          : 'text-[#8492A6] hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
          <button
            onClick={() => {
              onResetSettings();
              playClickSound(true);
            }}
            className="flex items-center gap-1.5 text-xs text-[#8492A6] hover:text-white transition-colors"
          >
            <RotateCcw size={14} />
            <span>Reset Visuals to Default</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 text-white text-xs font-bold shadow-lg transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
