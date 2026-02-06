import { create } from 'zustand';

export type AspectRatio = '1:1' | '16:9' | '21:9' | '4:3' | '2:1';

export const RATIOS: { label: AspectRatio; width: number; height: number }[] = [
  { label: '1:1', width: 900, height: 900 },
  { label: '16:9', width: 1600, height: 900 },
  { label: '21:9', width: 2100, height: 900 },
  { label: '4:3', width: 1200, height: 900 },
  { label: '2:1', width: 1800, height: 900 },
];

interface TextSettings {
  content: string;
  fontSize: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  fontWeight: number;
  x: number;
  y: number;
  rotation: number;
  // Font settings
  font: string;
  // Split settings
  isSplit: boolean;
  /**
   * Split position for text separation.
   * -1 means auto (midpoint). Value is character index in JS string.
   */
  splitIndex: number;
  /**
   * Optional separator (e.g. "|") inside content. If present, it overrides splitIndex.
   */
  splitSeparator: string;
  leftOffsetX: number;
  leftOffsetY: number;
  rightOffsetX: number;
  rightOffsetY: number;
}

interface IconSettings {
  name: string; // identifier for the icon
  size: number;
  color: string; // useful if we allow tinting, even for colored icons
  shadow: boolean;
  x: number;
  y: number;
  rotation: number;
  // New settings for "Card/Box" style icon
  bgShape: 'none' | 'circle' | 'square' | 'rounded-square';
  bgColor: string;
  padding: number;
  radius: number; // For rounded-square custom radius
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetY: number;
  // Transparency and Blur for container
  bgOpacity: number; // 0-1
  bgBlur: number; // px
  // Custom image icon
  customIconUrl?: string;
  customIconRadius: number; // For custom image icon radius
}

interface BackgroundSettings {
  type: 'solid' | 'image';
  color: string;
  imageUrl: string;
  blur: number; // 0-100
  radius: number; // 0-100
  shadow: boolean;
  opacity: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetY: number;
  // Image transform settings
  scale: number;
  positionX: number;
  positionY: number;
  rotation: number;
}

export type CoverPreset = Pick<
  CoverStateBase,
  'selectedRatios' | 'showRuler' | 'text' | 'icon' | 'background'
>;

interface CoverStateBase {
  selectedRatios: AspectRatio[];
  showRuler: boolean;
  text: TextSettings;
  icon: IconSettings;
  background: BackgroundSettings;
}

interface CoverState extends CoverStateBase {
  // Actions
  toggleRatio: (ratio: AspectRatio) => void;
  setShowRuler: (show: boolean) => void;
  setSelectedRatios: (ratios: AspectRatio[]) => void;
  updateText: (settings: Partial<TextSettings>) => void;
  updateIcon: (settings: Partial<IconSettings>) => void;
  updateBackground: (settings: Partial<BackgroundSettings>) => void;
  applyPreset: (preset: CoverPreset) => void;
}

export const useCoverStore = create<CoverState>((set) => ({
  selectedRatios: ['16:9'],
  showRuler: true,
  text: {
    content: '封面标题',
    fontSize: 160,
    color: '#000000',
    strokeColor: '#ffffff',
    strokeWidth: 0,
    fontWeight: 700,
    x: 0,
    y: 0,
    rotation: 0,
    font: 'Inter, sans-serif',
    isSplit: false,
    splitIndex: -1,
    splitSeparator: '|',
    leftOffsetX: 0,
    leftOffsetY: 0,
    rightOffsetX: 0,
    rightOffsetY: 0,
  },
  icon: {
    name: 'logos:react',
    size: 120,
    color: '#000000',
    shadow: true,
    x: 0,
    y: 0,
    rotation: 0,
    bgShape: 'rounded-square', // Default to a nice card look
    bgColor: '#ffffff',
    padding: 40,
    radius: 40,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowBlur: 6,
    shadowOffsetY: 4,
    bgOpacity: 1,
    bgBlur: 0,
    customIconRadius: 0,
  },
  background: {
    type: 'solid',
    color: '#f3f4f6',
    imageUrl: '',
    blur: 0,
    radius: 0,
    shadow: false,
    opacity: 1,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowBlur: 30,
    shadowOffsetY: 10,
    scale: 1,
    positionX: 50,
    positionY: 50,
    rotation: 0,
  },

  toggleRatio: (ratio) =>
    set((state) => {
      const exists = state.selectedRatios.includes(ratio);
      if (exists && state.selectedRatios.length === 1) return state; // Prevent empty
      return {
        selectedRatios: exists
          ? state.selectedRatios.filter((r) => r !== ratio)
          : [...state.selectedRatios, ratio],
      };
    }),
  setShowRuler: (show) => set({ showRuler: show }),
  setSelectedRatios: (ratios) =>
    set(() => ({ selectedRatios: ratios.length ? ratios : ['16:9'] })),
  updateText: (settings) =>
    set((state) => ({ text: { ...state.text, ...settings } })),
  updateIcon: (settings) =>
    set((state) => ({ icon: { ...state.icon, ...settings } })),
  updateBackground: (settings) =>
    set((state) => ({ background: { ...state.background, ...settings } })),
  applyPreset: (preset) =>
    set(() => ({
      selectedRatios: preset.selectedRatios.length ? preset.selectedRatios : ['16:9'],
      showRuler: preset.showRuler,
      text: preset.text,
      icon: preset.icon,
      background: preset.background,
    })),
}));
