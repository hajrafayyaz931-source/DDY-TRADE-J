export type ThemeId = 
  | 'quotex-cyber' 
  | 'variation-2-terminal'
  | 'variation-3-terminal'
  | 'gold-bullion'
  | 'sapphire-trader'
  | 'bloomberg-amber' 
  | 'tokyo-midnight' 
  | 'emerald-matrix' 
  | 'deep-onyx' 
  | 'institutional-light';

export type CandleStyle = 'neon' | 'solid' | 'hollow';

export type PnlColorway = 'classic' | 'neon-vivid' | 'cyan-amber' | 'monochrome';

export type LayoutDensity = 'comfortable' | 'compact';

export type GridIntensity = 'subtle' | 'crisp' | 'hidden';

export interface VisualSettings {
  theme: ThemeId;
  candleStyle: CandleStyle;
  pnlColorway: PnlColorway;
  density: LayoutDensity;
  ambientGlow: boolean;
  soundEffects: boolean;
  voiceAlerts: boolean;
  gridIntensity: GridIntensity;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  badge: string;
  bgPrimary: string;
  surfacePrimary: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  accentPrimary: string;
  accentSecondary: string;
  pnlPositive: string;
  pnlNegative: string;
  borderColor: string;
  glowColor: string;
}

export const THEME_DEFINITIONS: Record<ThemeId, ThemeDefinition> = {
  'quotex-cyber': {
    id: 'quotex-cyber',
    name: 'Institutional Dark Purple',
    tagline: 'Ultra-premium void black & royal purple terminal with glassmorphism',
    badge: 'DEFAULT PRO',
    bgPrimary: '#07060A',
    surfacePrimary: 'rgba(16, 12, 28, 0.75)',
    surfaceSecondary: 'rgba(23, 17, 40, 0.65)',
    surfaceTertiary: 'rgba(32, 23, 56, 0.6)',
    accentPrimary: '#8B5CF6',
    accentSecondary: '#A78BFA',
    pnlPositive: '#10B981',
    pnlNegative: '#F43F5E',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    glowColor: 'rgba(192, 132, 252, 0.35)',
  },
  'variation-2-terminal': {
    id: 'variation-2-terminal',
    name: 'Variation 2 Terminal Edition',
    tagline: 'High-contrast industrial terminal with electric blue (#3987FF) & crisp typography',
    badge: 'VARIATION 2',
    bgPrimary: '#0D0D0E',
    surfacePrimary: '#141416',
    surfaceSecondary: '#1A1A1E',
    surfaceTertiary: '#222228',
    accentPrimary: '#3987FF',
    accentSecondary: '#60A5FA',
    pnlPositive: '#10B981',
    pnlNegative: '#FF5268',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    glowColor: 'rgba(57, 135, 255, 0.35)',
  },
  'variation-3-terminal': {
    id: 'variation-3-terminal',
    name: 'Variation 3 Terminal',
    tagline: 'Syne & JetBrains Mono industrial quantitative terminal (#0B0C0D with #BB86FC)',
    badge: 'VARIATION 3',
    bgPrimary: '#0B0C0D',
    surfacePrimary: '#151618',
    surfaceSecondary: '#1C1D21',
    surfaceTertiary: '#25272C',
    accentPrimary: '#BB86FC',
    accentSecondary: '#03DAC6',
    pnlPositive: '#03DAC6',
    pnlNegative: '#CF6679',
    borderColor: '#222326',
    glowColor: 'rgba(187, 134, 252, 0.3)',
  },
  'gold-bullion': {
    id: 'gold-bullion',
    name: 'Gold Bullion Royal',
    tagline: 'Luxury gold & dark amber prop firm aesthetic',
    badge: 'LUXURY GOLD',
    bgPrimary: '#090805',
    surfacePrimary: '#120F08',
    surfaceSecondary: '#1B170D',
    surfaceTertiary: '#262013',
    accentPrimary: '#EAB308',
    accentSecondary: '#F59E0B',
    pnlPositive: '#10B981',
    pnlNegative: '#EF4444',
    borderColor: '#332A14',
    glowColor: 'rgba(234, 179, 8, 0.3)',
  },
  'sapphire-trader': {
    id: 'sapphire-trader',
    name: 'Sapphire Cyan Floor',
    tagline: 'High-frequency electric blue & cyan trading terminal',
    badge: 'SAPPHIRE',
    bgPrimary: '#030814',
    surfacePrimary: '#081226',
    surfaceSecondary: '#0F1C38',
    surfaceTertiary: '#16284C',
    accentPrimary: '#3B82F6',
    accentSecondary: '#06B6D4',
    pnlPositive: '#10B981',
    pnlNegative: '#F43F5E',
    borderColor: '#1D3560',
    glowColor: 'rgba(59, 130, 246, 0.35)',
  },
  'bloomberg-amber': {
    id: 'bloomberg-amber',
    name: 'Bloomberg Institutional',
    tagline: 'Classic terminal amber gold on obsidian black',
    badge: 'TERMINAL',
    bgPrimary: '#070A0F',
    surfacePrimary: '#0E131C',
    surfaceSecondary: '#151C2A',
    surfaceTertiary: '#1D273B',
    accentPrimary: '#F59E0B',
    accentSecondary: '#00E5FF',
    pnlPositive: '#10B981',
    pnlNegative: '#EF4444',
    borderColor: '#262D3D',
    glowColor: 'rgba(245, 158, 11, 0.22)',
  },
  'tokyo-midnight': {
    id: 'tokyo-midnight',
    name: 'Tokyo Neon Night',
    tagline: 'Cyber-synthwave aesthetic with vibrant magenta & cyan',
    badge: 'SYNTHWAVE',
    bgPrimary: '#0A0C16',
    surfacePrimary: '#111424',
    surfaceSecondary: '#181C32',
    surfaceTertiary: '#222845',
    accentPrimary: '#8B5CF6',
    accentSecondary: '#EC4899',
    pnlPositive: '#06B6D4',
    pnlNegative: '#F43F5E',
    borderColor: '#2D3352',
    glowColor: 'rgba(139, 92, 246, 0.25)',
  },
  'emerald-matrix': {
    id: 'emerald-matrix',
    name: 'Emerald Quant Matrix',
    tagline: 'Quantitative trading floor with phosphor matrix emerald',
    badge: 'QUANT',
    bgPrimary: '#050D09',
    surfacePrimary: '#0A1710',
    surfaceSecondary: '#102219',
    surfaceTertiary: '#163024',
    accentPrimary: '#10B981',
    accentSecondary: '#34D399',
    pnlPositive: '#00FF9D',
    pnlNegative: '#FF4D6A',
    borderColor: '#183827',
    glowColor: 'rgba(16, 185, 129, 0.25)',
  },
  'deep-onyx': {
    id: 'deep-onyx',
    name: 'Deep Monolith OLED',
    tagline: 'True black high-contrast OLED terminal with laser precision',
    badge: 'HIGH-CONTRAST',
    bgPrimary: '#000000',
    surfacePrimary: '#0C0C0C',
    surfaceSecondary: '#141414',
    surfaceTertiary: '#1F1F1F',
    accentPrimary: '#38BDF8',
    accentSecondary: '#A855F7',
    pnlPositive: '#22C55E',
    pnlNegative: '#EF4444',
    borderColor: '#27272A',
    glowColor: 'rgba(56, 189, 248, 0.2)',
  },
  'institutional-light': {
    id: 'institutional-light',
    name: 'Institutional Pure Light',
    tagline: 'Clean daylight trading desk with crisp high-contrast readability',
    badge: 'LIGHT MODE',
    bgPrimary: '#F8FAFC',
    surfacePrimary: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    surfaceTertiary: '#E2E8F0',
    accentPrimary: '#7C3AED',
    accentSecondary: '#8B5CF6',
    pnlPositive: '#059669',
    pnlNegative: '#DC2626',
    borderColor: '#CBD5E1',
    glowColor: 'rgba(124, 58, 237, 0.15)',
  },
};
