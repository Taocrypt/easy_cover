'use client';

import React from 'react';
import { useCoverStore, RATIOS, AspectRatio, type CoverPreset } from '@/store/useCoverStore';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconPicker } from '@/components/cover/IconPicker';
import { Separator } from '@/components/ui/separator';
import { Download, RotateCcw, Maximize, Github, ExternalLink, Settings2, Link as LinkIcon, Link2, Upload, Save, Trash2 } from 'lucide-react';
import { toPng } from 'html-to-image';

// Helper component for Reset Button
const ResetButton = ({ onClick, tooltip = "重置" }: { onClick: () => void, tooltip?: string }) => (
    <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 ml-2" 
        onClick={onClick}
        title={tooltip}
    >
        <RotateCcw className="h-3 w-3" />
    </Button>
);

const SPLIT_PRESETS = [
    { name: '默认', left: { x: 0, y: 0 }, right: { x: 0, y: 0 } },
    { name: '上下错位', left: { x: 0, y: -40 }, right: { x: 0, y: 40 } },
    { name: '左右分离', left: { x: -60, y: 0 }, right: { x: 60, y: 0 } },
    { name: '对角分离', left: { x: -40, y: -40 }, right: { x: 40, y: 40 } },
    { name: '聚拢', left: { x: 20, y: 0 }, right: { x: -20, y: 0 } },
];

const FONTS = [
    { name: 'Inter (默认)', value: 'Inter, sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
    { name: 'MiSans', value: 'MiSans, sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
    { name: 'HarmonyOS Sans', value: '"HarmonyOS Sans", sans-serif', weights: [100, 400, 700] },
    { name: '得意黑 (Smiley Sans)', value: 'SmileySans, sans-serif', weights: [400] },
    { name: 'OPPO Sans', value: 'OPPOSans, sans-serif', weights: [400] },
    { name: 'Geist Sans', value: 'var(--font-geist-sans), sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
    { name: 'Geist Mono', value: 'var(--font-geist-mono), monospace', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
    { name: 'Arial', value: 'Arial, sans-serif', weights: [400, 700] },
    { name: 'Times New Roman', value: '"Times New Roman", serif', weights: [400, 700] },
    { name: 'Courier New', value: '"Courier New", monospace', weights: [400, 700] },
    { name: '微软雅黑', value: '"Microsoft YaHei", sans-serif', weights: [300, 400, 700] },
    { name: '黑体', value: 'SimHei, sans-serif', weights: [400] },
    { name: '楷体', value: 'KaiTi, serif', weights: [400] },
];

const WEIGHTS = {
    100: 'Thin (100)',
    200: 'ExtraLight (200)',
    300: 'Light (300)',
    400: 'Regular (400)',
    500: 'Medium (500)',
    600: 'SemiBold (600)',
    700: 'Bold (700)',
    800: 'ExtraBold (800)',
    900: 'Black (900)',
};

const SliderWithInput = ({ 
    label, 
    value, 
    onChange, 
    min, 
    max, 
    step = 1 
}: { 
    label: string, 
    value: number, 
    onChange: (val: number) => void, 
    min: number, 
    max: number, 
    step?: number 
}) => {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <Label className="text-[10px] text-muted-foreground">{label}</Label>
                <Input
                    type="number"
                    value={value}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) onChange(val);
                    }}
                    className="h-5 w-12 text-[10px] px-1 text-right"
                />
            </div>
            <Slider 
                value={[value]} 
                min={min} 
                max={max} 
                step={step} 
                onValueChange={(v) => onChange(v[0])} 
            />
        </div>
    );
};

export default function Controls() {
  const store = useCoverStore();

  const PRESET_STORAGE_KEY = 'easycover:preset:v1';
  const [hasPreset, setHasPreset] = React.useState(false);
  const [configCode, setConfigCode] = React.useState('');

  const sanitizeUrl = (url: string) => {
    if (!url) return '';
    // local blob urls cannot be restored across refresh/devices
    if (url.startsWith('blob:')) return '';
    return url;
  };

  const buildPreset = (): CoverPreset => ({
    selectedRatios: store.selectedRatios,
    showRuler: store.showRuler,
    text: store.text,
    icon: { ...store.icon, customIconUrl: sanitizeUrl(store.icon.customIconUrl || '') },
    background: { ...store.background, imageUrl: sanitizeUrl(store.background.imageUrl || '') },
  });

  // Default preset used for diff-based encoding (shorter strings)
  const DEFAULT_PRESET: CoverPreset = {
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
      bgShape: 'rounded-square',
      bgColor: '#ffffff',
      padding: 40,
      radius: 40,
      shadowColor: 'rgba(0,0,0,0.3)',
      shadowBlur: 6,
      shadowOffsetY: 4,
      bgOpacity: 1,
      bgBlur: 0,
      customIconRadius: 0,
      customIconUrl: '',
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
  };

  const deepDiff = (base: any, next: any): any => {
    if (base === next) return undefined;
    if (typeof base !== 'object' || typeof next !== 'object' || !base || !next) return next;
    if (Array.isArray(base) && Array.isArray(next)) {
      if (base.length === next.length && base.every((v, i) => v === next[i])) return undefined;
      return next;
    }
    const out: any = {};
    const keys = new Set([...Object.keys(base), ...Object.keys(next)]);
    for (const k of keys) {
      const d = deepDiff(base[k], next[k]);
      if (d !== undefined) out[k] = d;
    }
    return Object.keys(out).length ? out : undefined;
  };

  const deepMerge = (base: any, patch: any): any => {
    if (patch === undefined) return base;
    if (typeof base !== 'object' || typeof patch !== 'object' || !base || !patch) return patch;
    if (Array.isArray(patch)) return patch;
    const out: any = { ...base };
    for (const k of Object.keys(patch)) out[k] = deepMerge(base[k], patch[k]);
    return out;
  };

  const b64urlEncode = (obj: any) => {
    const json = JSON.stringify(obj);
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  };

  const b64urlDecode = (code: string) => {
    const b64 = code.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const json = decodeURIComponent(escape(atob(b64 + pad)));
    return JSON.parse(json);
  };

  const encodePreset = (preset: CoverPreset) => {
    const normalized: CoverPreset = {
      ...preset,
      icon: { ...preset.icon, customIconUrl: sanitizeUrl(preset.icon.customIconUrl || '') } as any,
      background: { ...preset.background, imageUrl: sanitizeUrl(preset.background.imageUrl || '') } as any,
    };
    const diff = deepDiff(DEFAULT_PRESET, normalized) || {};
    return b64urlEncode({ v: 1, d: diff });
  };

  const decodePreset = (code: string): CoverPreset | null => {
    try {
      const obj = b64urlDecode(code);
      if (!obj || obj.v !== 1) return null;
      const merged = deepMerge(DEFAULT_PRESET, obj.d || {});
      // Defensive: strip blob urls even if present
      merged.icon = { ...merged.icon, customIconUrl: sanitizeUrl(merged.icon.customIconUrl || '') };
      merged.background = { ...merged.background, imageUrl: sanitizeUrl(merged.background.imageUrl || '') };
      return merged as CoverPreset;
    } catch {
      return null;
    }
  };

  // Load preset from localStorage on first mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(PRESET_STORAGE_KEY);
      if (!raw) {
        setHasPreset(false);
        setConfigCode(encodePreset(buildPreset()));
        return;
      }
      const preset = JSON.parse(raw) as CoverPreset;
      if (preset && preset.text && preset.icon && preset.background && preset.selectedRatios) {
        store.applyPreset(preset);
        setHasPreset(true);
      } else {
        setHasPreset(false);
      }
    } catch (e) {
      console.warn('Failed to load preset', e);
      setHasPreset(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep configCode in sync with current settings
  React.useEffect(() => {
    const t = setTimeout(() => {
      setConfigCode(encodePreset(buildPreset()));
    }, 120);
    return () => clearTimeout(t);
  }, [
    store.selectedRatios,
    store.showRuler,
    store.text,
    store.icon,
    store.background,
  ]);

  const handleSaveOrClearPreset = () => {
    try {
      if (hasPreset) {
        localStorage.removeItem(PRESET_STORAGE_KEY);
        setHasPreset(false);
        setConfigCode(encodePreset(buildPreset()));
        return;
      }

      const preset: CoverPreset = buildPreset();
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(preset));
      setHasPreset(true);
      setConfigCode(encodePreset(preset));
    } catch (e) {
      console.error('Failed to save preset', e);
      alert('预设保存失败：可能是浏览器存储空间不足');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      store.updateBackground({ type: 'image', imageUrl: url });
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      store.updateIcon({ customIconUrl: url });
    }
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        try {
            const fontName = `CustomFont_${Date.now()}`;
            const url = URL.createObjectURL(file);
            const font = new FontFace(fontName, `url(${url})`);
            await font.load();
            document.fonts.add(font);
            store.updateText({ font: fontName });
        } catch (err) {
            console.error('Failed to load font', err);
            alert('字体加载失败，请尝试其他字体文件');
        }
    }
  };

  const handleExport = async () => {
    // This requires accessing the DOM node. 
    // Ideally, we pass a ref or use an ID.
    // We'll target the container inside Canvas.
    // Since Controls is a sibling, we might need a way to signal.
    // For now, let's assume we can find the element by a known ID or class.
    // But `html-to-image` works best if we have the Ref.
    // I will dispatch a custom event or use a global ID.
    // Let's add an ID to the Canvas container in Canvas.tsx: id="canvas-export-target"
    
    const node = document.getElementById('canvas-export-target');
    if (!node) return;

    // We might need to handle scaling back to 1 before export, or html-to-image handles it.
    // Usually better to clone and export.
    // For now, simple attempt:
    try {
      const dataUrl = await toPng(node as HTMLElement, {
        quality: 0.95,
        pixelRatio: 1,
        filter: (node) => {
          // Exclude elements with the class 'export-exclude'
          if (node.classList && node.classList.contains('export-exclude')) {
            return false;
          }
          return true;
        },
      });

      const preset = buildPreset();
      const code = encodePreset(preset);
      setConfigCode(code);

      const safeCode = code.replace(/[^a-zA-Z0-9_-]/g, '');
      // Use code as filename to keep it short and easy to copy/paste
      const fileName = `${safeCode}.png`;

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const handleFit = (mode: 'contain' | 'cover') => {
      // Always reset position and rotation
      const updates: any = { positionX: 50, positionY: 50, rotation: 0 };
      
      // We will simply reset scale to 1 and let user manually adjust if they want 'contain'.
      // But for 'cover', we try to calculate a scale that fills the canvas.
      
      if (mode === 'contain') {
          updates.scale = 1;
      } else {
          // Calculate scale to cover
          // 1. Get current canvas dimensions
          const activeRatios = RATIOS.filter((r) => store.selectedRatios.includes(r.label));
          if (activeRatios.length > 0 && store.background.imageUrl) {
               const maxWidth = Math.max(...activeRatios.map((r) => r.width));
               const maxHeight = Math.max(...activeRatios.map((r) => r.height));
               const canvasRatio = maxWidth / maxHeight;

               // 2. Get image dimensions
               const img = new Image();
               img.src = store.background.imageUrl;
               img.onload = () => {
                   const imgRatio = img.naturalWidth / img.naturalHeight;
                   
                   let newScale = 1;
                   if (imgRatio > canvasRatio) {
                       // Image is wider than canvas: Scale based on Height
                       // Contain logic makes width match canvas (if img wider? No.)
                       // Let's revisit: 
                       // In 'contain' (object-fit), img is scaled so it fits inside.
                       // If imgRatio > canvasRatio (Image is flatter):
                       //   It hits the sides first. Width = CanvasWidth. Height = Width / imgRatio.
                       //   To cover, we need Height = CanvasHeight.
                       //   Scale = CanvasHeight / CurrentHeight = CanvasHeight / (CanvasWidth / imgRatio)
                       //         = (CanvasHeight / CanvasWidth) * imgRatio = imgRatio / canvasRatio.
                       newScale = imgRatio / canvasRatio;
                   } else {
                       // Image is taller than canvas:
                       //   It hits top/bottom first. Height = CanvasHeight. Width = Height * imgRatio.
                       //   To cover, we need Width = CanvasWidth.
                       //   Scale = CanvasWidth / CurrentWidth = CanvasWidth / (CanvasHeight * imgRatio)
                       //         = (CanvasWidth / CanvasHeight) / imgRatio = canvasRatio / imgRatio.
                       newScale = canvasRatio / imgRatio;
                   }
                   
                   // Apply with a slight buffer to avoid sub-pixel gaps
                   store.updateBackground({ ...updates, scale: newScale * 1.01 });
               };
               return; // Async update
          } else {
              // Fallback
              updates.scale = 1;
          }
      }
      store.updateBackground(updates);
  };

  const [activeTab, setActiveTab] = React.useState('picker');
  const [syncOffsets, setSyncOffsets] = React.useState(true);

  // Auto-collapse header on scroll (mobile friendly)
  const scrollAreaRootRef = React.useRef<HTMLDivElement | null>(null);
  const [headerCollapsed, setHeaderCollapsed] = React.useState(false);

  React.useEffect(() => {
    const root = scrollAreaRootRef.current;
    if (!root) return;

    const viewport = root.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLDivElement | null;
    if (!viewport) return;

    const onScroll = () => {
      const top = viewport.scrollTop;
      if (top <= 0) setHeaderCollapsed(false);
      else if (top > 20) setHeaderCollapsed(true);
    };

    viewport.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => viewport.removeEventListener('scroll', onScroll);
  }, []);

  // Sync effect for left offset changes
  const handleLeftOffsetChange = (axis: 'x' | 'y', val: number) => {
      const updates: any = { [axis === 'x' ? 'leftOffsetX' : 'leftOffsetY']: val };
      if (syncOffsets) {
          updates[axis === 'x' ? 'rightOffsetX' : 'rightOffsetY'] = -val;
      }
      store.updateText(updates);
  };

  // Sync effect for right offset changes
  const handleRightOffsetChange = (axis: 'x' | 'y', val: number) => {
      const updates: any = { [axis === 'x' ? 'rightOffsetX' : 'rightOffsetY']: val };
      if (syncOffsets) {
          updates[axis === 'x' ? 'leftOffsetX' : 'leftOffsetY'] = -val;
      }
      store.updateText(updates);
  };

  return (
    <div className="w-full md:w-80 h-1/2 md:h-full border-t md:border-t-0 md:border-r bg-background flex flex-col shadow-lg z-10">
      <div className={(headerCollapsed ? "p-2" : "p-4") + " border-b transition-all duration-200"}>
        <h1 className={(headerCollapsed ? "text-base" : "text-xl") + " font-bold flex items-center gap-2"}>
          EasyCover - Taocrypt
        </h1>
        {!headerCollapsed && (
          <p className="text-xs text-muted-foreground mt-1">
            简单、优雅的纯客户端封面图生成器。无需上传，保护隐私。
          </p>
        )}
      </div>
      
      <div className="flex-1 min-h-0 w-full">
        <ScrollArea ref={scrollAreaRootRef} className="h-full">
            <div className="p-4 space-y-6">
          
          {/* Layout Section */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">布局设置</h3>

            {/* Config code import/export */}
            <div className="space-y-2">
              <Label className="text-xs">配置串</Label>
              <div className="flex gap-2">
                <Input
                  className="h-8 text-xs"
                  value={configCode}
                  placeholder="粘贴导出文件名里的那串字符（base64url）"
                  onChange={(e) => setConfigCode(e.target.value.trim())}
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    const preset = decodePreset(configCode);
                    if (!preset) return alert('配置串解析失败');
                    store.applyPreset(preset);
                    setHasPreset(!!localStorage.getItem(PRESET_STORAGE_KEY));
                  }}
                >
                  应用
                </Button>
              </div>
              <div className="text-[10px] text-muted-foreground leading-snug">
                提示：如果你是从文件名复制，请只取字符串部分（不要包含 .png）。
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>图片比例</Label>
              <div className="grid grid-cols-2 gap-2">
                {RATIOS.map((r) => (
                  <div key={r.label} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`ratio-${r.label}`} 
                      checked={store.selectedRatios.includes(r.label)}
                      onCheckedChange={() => store.toggleRatio(r.label)}
                    />
                    <label htmlFor={`ratio-${r.label}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {r.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-ruler">显示标尺 / 网格</Label>
              <Switch 
                id="show-ruler" 
                checked={store.showRuler} 
                onCheckedChange={store.setShowRuler} 
              />
            </div>
          </section>

          <Separator />

          {/* Text Section */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">文字设置</h3>
            <div className="space-y-2">
              <Label>内容</Label>
              <Input 
                value={store.text.content} 
                onChange={(e) => store.updateText({ content: e.target.value })} 
              />
            </div>
            
            <div className="space-y-2">
               <Label>字体</Label>
               <div className="flex gap-2">
                   <Select value={store.text.font.startsWith('CustomFont') ? 'custom' : store.text.font} onValueChange={(v) => {
                       if (v !== 'custom') store.updateText({ font: v });
                   }}>
                       <SelectTrigger className="flex-1">
                           <SelectValue placeholder="选择字体" />
                       </SelectTrigger>
                       <SelectContent>
                           {FONTS.map((font) => (
                               <SelectItem key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                                   {font.name}
                               </SelectItem>
                           ))}
                           {store.text.font.startsWith('CustomFont') && (
                               <SelectItem value="custom">自定义字体</SelectItem>
                           )}
                       </SelectContent>
                   </Select>
                   
                   <div className="relative">
                       <Input 
                           type="file" 
                           accept=".ttf,.otf,.woff,.woff2" 
                           className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                           onChange={handleFontUpload}
                           title="上传字体"
                       />
                       <Button variant="outline" size="icon" className="w-10 px-0">
                           <Upload className="h-4 w-4" />
                       </Button>
                   </div>
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-center">
                   <Label>字重 ({store.text.fontWeight})</Label>
                   <ResetButton onClick={() => store.updateText({ fontWeight: 700 })} />
               </div>
               <Select value={String(store.text.fontWeight)} onValueChange={(v) => store.updateText({ fontWeight: parseInt(v) })}>
                   <SelectTrigger>
                       <SelectValue placeholder="选择字重" />
                   </SelectTrigger>
                   <SelectContent>
                       {(() => {
                           const currentFont = FONTS.find(f => f.value === store.text.font);
                           const availableWeights = currentFont?.weights || [100, 200, 300, 400, 500, 600, 700, 800, 900];
                           
                           return availableWeights.map(w => (
                               <SelectItem key={w} value={String(w)}>
                                   {WEIGHTS[w as keyof typeof WEIGHTS]}
                               </SelectItem>
                           ));
                       })()}
                   </SelectContent>
               </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <Label>大小 ({store.text.fontSize}px)</Label>
                 <ResetButton onClick={() => store.updateText({ fontSize: 160 })} />
              </div>
              <Slider 
                value={[store.text.fontSize]} 
                min={12} 
                max={2500} 
                step={1} 
                onValueChange={(v) => store.updateText({ fontSize: v[0] })} 
              />
            </div>

            <div className="flex items-center justify-between">
               <Label>颜色</Label>
               <ColorPicker color={store.text.color} onChange={(c) => store.updateText({ color: c })} />
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-center">
                   <Label>描边宽度</Label>
                   <ResetButton onClick={() => store.updateText({ strokeWidth: 0 })} />
               </div>
               <Slider 
                 value={[store.text.strokeWidth]} 
                 min={0} 
                 max={10} 
                 step={0.5} 
                 onValueChange={(v) => store.updateText({ strokeWidth: v[0] })} 
               />
            </div>

             <div className="flex items-center justify-between">
               <Label>描边颜色</Label>
               <ColorPicker color={store.text.strokeColor} onChange={(c) => store.updateText({ strokeColor: c })} />
            </div>

            <div className="flex items-center justify-between">
               <Label htmlFor="text-split">文字错位 / 分离</Label>
               <Switch 
                 id="text-split" 
                 checked={store.text.isSplit} 
                 onCheckedChange={(c) => store.updateText({ isSplit: c })} 
               />
            </div>

            {store.text.isSplit && (
                <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
                    <div className="grid grid-cols-3 gap-1 mb-2">
                        {SPLIT_PRESETS.map((preset) => (
                            <Button
                                key={preset.name}
                                variant="outline"
                                size="sm"
                                className="text-[10px] h-6 px-1"
                                onClick={() => store.updateText({
                                    leftOffsetX: preset.left.x,
                                    leftOffsetY: preset.left.y,
                                    rightOffsetX: preset.right.x,
                                    rightOffsetY: preset.right.y
                                })}
                            >
                                {preset.name}
                            </Button>
                        ))}
                    </div>

                    {/* Split position (custom word break) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold">分词位置</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min={-1}
                                max={Math.max(0, store.text.content.length - 1)}
                                className="h-7 text-xs"
                                value={store.text.splitIndex === -1 ? '' : String(store.text.splitIndex)}
                                placeholder="自动(留空)"
                                onChange={(e) => {
                                    const v = e.target.value;
                                    if (v === '') return store.updateText({ splitIndex: -1 });
                                    const n = parseInt(v, 10);
                                    store.updateText({ splitIndex: Number.isFinite(n) ? n : -1 });
                                }}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[10px] px-2"
                                onClick={() => store.updateText({ splitIndex: -1 })}
                            >
                                自动
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Label className="text-[10px] text-muted-foreground whitespace-nowrap">分隔符</Label>
                            <Input
                                className="h-7 w-16 text-xs"
                                value={store.text.splitSeparator}
                                onChange={(e) => store.updateText({ splitSeparator: e.target.value })}
                            />
                            <span className="text-[10px] text-muted-foreground">内容里出现分隔符时，会优先生效（例如：前半|后半）</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1 pb-2">
                            <Label htmlFor="sync-offsets" className="text-xs font-medium">同步调整 (中心对称)</Label>
                            <Switch 
                                id="sync-offsets" 
                                checked={syncOffsets} 
                                onCheckedChange={setSyncOffsets} 
                                className="scale-75 origin-right"
                            />
                        </div>

                        <Label className="text-xs font-semibold">左侧文字</Label>
                        <SliderWithInput 
                            label="水平偏移" 
                            value={store.text.leftOffsetX} 
                            min={-200} 
                            max={200} 
                            onChange={(v) => handleLeftOffsetChange('x', v)} 
                        />
                        <SliderWithInput 
                            label="垂直偏移" 
                            value={store.text.leftOffsetY} 
                            min={-200} 
                            max={200} 
                            onChange={(v) => handleLeftOffsetChange('y', v)} 
                        />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-dashed">
                        <Label className="text-xs font-semibold">右侧文字</Label>
                        <SliderWithInput 
                            label="水平偏移" 
                            value={store.text.rightOffsetX} 
                            min={-200} 
                            max={200} 
                            onChange={(v) => handleRightOffsetChange('x', v)} 
                        />
                        <SliderWithInput 
                            label="垂直偏移" 
                            value={store.text.rightOffsetY} 
                            min={-200} 
                            max={200} 
                            onChange={(v) => handleRightOffsetChange('y', v)} 
                        />
                    </div>
                </div>
            )}

            <div className="space-y-2">
               <div className="flex justify-between items-center">
                   <Label>旋转 ({store.text.rotation}°)</Label>
                   <ResetButton onClick={() => store.updateText({ rotation: 0 })} />
               </div>
               <Slider 
                 value={[store.text.rotation]} 
                 min={0} 
                 max={360} 
                 step={1} 
                 onValueChange={(v) => store.updateText({ rotation: v[0] })} 
               />
            </div>
          </section>

          <Separator />

          {/* Icon Section */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">图标设置</h3>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="picker">选择图标</TabsTrigger>
                    <TabsTrigger value="upload">上传图标</TabsTrigger>
                </TabsList>
                
                <TabsContent value="picker" className="space-y-2 mt-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>搜索图标</Label>
                        <a 
                            href="https://yesicon.app/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[10px] text-muted-foreground flex items-center hover:text-primary hover:underline"
                        >
                            查找图标名称 <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </div>
                      <IconPicker 
                        value={store.icon.name} 
                        onChange={(v) => {
                            store.updateIcon({ name: v, customIconUrl: undefined }); // Clear custom icon when picking new one
                        }} 
                      />
                      <div className="text-center pt-1">
                          <button 
                            className="text-[10px] text-muted-foreground hover:text-primary hover:underline cursor-pointer"
                            onClick={() => setActiveTab('upload')}
                          >
                            没有找到想要的？手动上传！
                          </button>
                      </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="upload" className="space-y-2 mt-2">
                    <div className="space-y-2">
                        <Label>上传图片</Label>
                        <Input type="file" accept="image/*" onChange={handleIconUpload} />
                        {store.icon.customIconUrl && (
                            <>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs">图片圆角 ({store.icon.customIconRadius}px)</Label>
                                        <ResetButton onClick={() => store.updateIcon({ customIconRadius: 0 })} />
                                    </div>
                                    <Slider 
                                        value={[store.icon.customIconRadius]} 
                                        min={0} 
                                        max={1000} 
                                        step={5} 
                                        onValueChange={(v) => store.updateIcon({ customIconRadius: v[0] })} 
                                    />
                                </div>

                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full text-xs"
                                    onClick={() => store.updateIcon({ customIconUrl: undefined })}
                                >
                                    清除自定义图标 (使用默认图标)
                                </Button>
                            </>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <div className="space-y-2">
               <div className="flex justify-between items-center">
                   <Label>大小 ({store.icon.size}px)</Label>
                   <ResetButton onClick={() => store.updateIcon({ size: 120 })} />
               </div>
               <Slider 
                 value={[store.icon.size]} 
                 min={20} 
                 max={2500} 
                 step={5} 
                 onValueChange={(v) => store.updateIcon({ size: v[0] })} 
               />
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-center">
                   <Label>旋转 ({store.icon.rotation}°)</Label>
                   <ResetButton onClick={() => store.updateIcon({ rotation: 0 })} />
               </div>
               <Slider 
                 value={[store.icon.rotation]} 
                 min={0} 
                 max={360} 
                 step={1} 
                 onValueChange={(v) => store.updateIcon({ rotation: v[0] })} 
               />
            </div>

            <div className="flex items-center justify-between">
               <Label>图标着色</Label>
               <ColorPicker color={store.icon.color} onChange={(c) => store.updateIcon({ color: c })} />
            </div>

             <div className="flex items-center justify-between">
              <Label htmlFor="icon-shadow">阴影</Label>
              <Switch 
                id="icon-shadow" 
                checked={store.icon.shadow} 
                onCheckedChange={(c) => store.updateIcon({ shadow: c })} 
              />
            </div>

            {store.icon.shadow && (
                <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center justify-between">
                       <Label className="text-xs">阴影颜色</Label>
                       <ColorPicker color={store.icon.shadowColor} onChange={(c) => store.updateIcon({ shadowColor: c })} />
                    </div>
                    
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs">模糊 ({store.icon.shadowBlur}px)</Label>
                            <ResetButton onClick={() => store.updateIcon({ shadowBlur: 6 })} />
                        </div>
                        <Slider 
                            value={[store.icon.shadowBlur]} 
                            min={0} 
                            max={100} 
                            step={1} 
                            onValueChange={(v) => store.updateIcon({ shadowBlur: v[0] })} 
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs">垂直偏移 ({store.icon.shadowOffsetY}px)</Label>
                            <ResetButton onClick={() => store.updateIcon({ shadowOffsetY: 4 })} />
                        </div>
                        <Slider 
                            value={[store.icon.shadowOffsetY]} 
                            min={-50} 
                            max={50} 
                            step={1} 
                            onValueChange={(v) => store.updateIcon({ shadowOffsetY: v[0] })} 
                        />
                    </div>
                </div>
            )}

            <Separator className="my-2"/>
            
            <div className="space-y-2">
                <Label>图标容器形状</Label>
                <Select value={store.icon.bgShape} onValueChange={(v) => store.updateIcon({ bgShape: v as any })}>
                    <SelectTrigger>
                        <SelectValue placeholder="容器形状" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">无</SelectItem>
                        <SelectItem value="circle">圆形</SelectItem>
                        <SelectItem value="square">方形</SelectItem>
                        <SelectItem value="rounded-square">圆角矩形</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {store.icon.bgShape !== 'none' && (
                <>
                    <div className="flex items-center justify-between">
                        <Label>容器颜色</Label>
                        <ColorPicker color={store.icon.bgColor} onChange={(c) => store.updateIcon({ bgColor: c })} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>内边距 ({store.icon.padding}px)</Label>
                            <ResetButton onClick={() => store.updateIcon({ padding: 40 })} />
                        </div>
                        <Slider 
                            value={[store.icon.padding]} 
                            min={0} 
                            max={100} 
                            step={5} 
                            onValueChange={(v) => store.updateIcon({ padding: v[0] })} 
                        />
                    </div>
                    {store.icon.bgShape === 'rounded-square' && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>容器圆角 ({store.icon.radius}px)</Label>
                                <ResetButton onClick={() => store.updateIcon({ radius: 40 })} />
                            </div>
                            <Slider 
                                value={[store.icon.radius]} 
                                min={0} 
                                max={200} 
                                step={5} 
                                onValueChange={(v) => store.updateIcon({ radius: v[0] })} 
                            />
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>容器透明度 ({(store.icon.bgOpacity * 100).toFixed(0)}%)</Label>
                            <ResetButton onClick={() => store.updateIcon({ bgOpacity: 1 })} />
                        </div>
                        <Slider 
                            value={[store.icon.bgOpacity]} 
                            min={0} 
                            max={1} 
                            step={0.01} 
                            onValueChange={(v) => store.updateIcon({ bgOpacity: v[0] })} 
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>容器模糊 ({(store.icon.bgBlur)}px)</Label>
                            <ResetButton onClick={() => store.updateIcon({ bgBlur: 0 })} />
                        </div>
                        <Slider 
                            value={[store.icon.bgBlur]} 
                            min={0} 
                            max={50} 
                            step={1} 
                            onValueChange={(v) => store.updateIcon({ bgBlur: v[0] })} 
                        />
                    </div>
                </>
            )}
          </section>

          <Separator />

          {/* Background Section */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">背景设置</h3>
            
            <Tabs defaultValue={store.background.type} onValueChange={(v) => store.updateBackground({ type: v as 'solid' | 'image' })}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="solid">纯色背景</TabsTrigger>
                    <TabsTrigger value="image">图片背景</TabsTrigger>
                </TabsList>
                
                <TabsContent value="solid" className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                        <Label>颜色</Label>
                        <ColorPicker color={store.background.color} onChange={(c) => store.updateBackground({ color: c })} />
                    </div>
                </TabsContent>
                
                <TabsContent value="image" className="space-y-2 mt-2">
                     <Input type="file" accept="image/*" onChange={handleImageUpload} />
                     
                     <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>高斯模糊 ({store.background.blur}px)</Label>
                            <ResetButton onClick={() => store.updateBackground({ blur: 0 })} />
                        </div>
                        <Slider 
                            value={[store.background.blur]} 
                            min={0} 
                            max={50} 
                            step={1} 
                            onValueChange={(v) => store.updateBackground({ blur: v[0] })} 
                        />
                    </div>
                    
                    <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                            <Label className="text-xs font-semibold text-muted-foreground w-full mb-1">图片变换</Label>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs flex-1"
                                onClick={() => handleFit('contain')}
                            >
                                <Maximize className="w-3 h-3 mr-1" />
                                适应
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs flex-1"
                                onClick={() => handleFit('cover')}
                            >
                                <Maximize className="w-3 h-3 mr-1 rotate-90" />
                                铺满
                            </Button>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <Label className="text-xs">缩放 ({store.background.scale.toFixed(1)}x)</Label>
                                <ResetButton onClick={() => store.updateBackground({ scale: 1 })} />
                            </div>
                            <Slider 
                                value={[store.background.scale]} 
                                min={0.1} 
                                max={10} 
                                step={0.1} 
                                onValueChange={(v) => store.updateBackground({ scale: v[0] })} 
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <Label className="text-xs">水平位置 ({store.background.positionX}%)</Label>
                                <ResetButton onClick={() => store.updateBackground({ positionX: 50 })} />
                            </div>
                            <Slider 
                                value={[store.background.positionX]} 
                                min={-500} 
                                max={500} 
                                step={1} 
                                onValueChange={(v) => store.updateBackground({ positionX: v[0] })} 
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <Label className="text-xs">垂直位置 ({store.background.positionY}%)</Label>
                                <ResetButton onClick={() => store.updateBackground({ positionY: 50 })} />
                            </div>
                            <Slider 
                                value={[store.background.positionY]} 
                                min={-500} 
                                max={500} 
                                step={1} 
                                onValueChange={(v) => store.updateBackground({ positionY: v[0] })} 
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <Label className="text-xs">旋转 ({store.background.rotation}°)</Label>
                                <ResetButton onClick={() => store.updateBackground({ rotation: 0 })} />
                            </div>
                            <Slider 
                                value={[store.background.rotation]} 
                                min={0} 
                                max={360} 
                                step={1} 
                                onValueChange={(v) => store.updateBackground({ rotation: v[0] })} 
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between mt-2">
              <Label htmlFor="bg-shadow">背景阴影</Label>
              <Switch 
                id="bg-shadow" 
                checked={store.background.shadow} 
                onCheckedChange={(c) => store.updateBackground({ shadow: c })} 
              />
            </div>

            {store.background.shadow && (
                <div className="space-y-2 p-3 bg-muted/30 rounded-lg border mt-2">
                    <div className="flex items-center justify-between">
                       <Label className="text-xs">阴影颜色</Label>
                       <ColorPicker color={store.background.shadowColor} onChange={(c) => store.updateBackground({ shadowColor: c })} />
                    </div>
                    
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs">模糊 ({store.background.shadowBlur}px)</Label>
                            <ResetButton onClick={() => store.updateBackground({ shadowBlur: 30 })} />
                        </div>
                        <Slider 
                            value={[store.background.shadowBlur]} 
                            min={0} 
                            max={200} 
                            step={1} 
                            onValueChange={(v) => store.updateBackground({ shadowBlur: v[0] })} 
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs">垂直偏移 ({store.background.shadowOffsetY}px)</Label>
                            <ResetButton onClick={() => store.updateBackground({ shadowOffsetY: 10 })} />
                        </div>
                        <Slider 
                            value={[store.background.shadowOffsetY]} 
                            min={-100} 
                            max={100} 
                            step={1} 
                            onValueChange={(v) => store.updateBackground({ shadowOffsetY: v[0] })} 
                        />
                    </div>
                </div>
            )}
          </section>

        </div>
      </ScrollArea>
      </div>

      <div className="p-2 md:p-4 border-t bg-gray-50 dark:bg-gray-950 space-y-2 md:space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                handleSaveOrClearPreset();
                // prevent "stuck active" on mobile
                (e.currentTarget as HTMLButtonElement).blur();
              }}
              onPointerUp={(e) => (e.currentTarget as HTMLButtonElement).blur()}
              onPointerCancel={(e) => (e.currentTarget as HTMLButtonElement).blur()}
              onTouchEnd={(e) => (e.currentTarget as HTMLButtonElement).blur()}
              className={
                "h-9 flex-1 text-xs font-medium shadow-xs active:opacity-90 focus-visible:ring-0 " +
                (hasPreset
                  ? "!bg-white !text-black !border-black/20 hover:!bg-white/90"
                  : "!bg-black !text-white !border-black hover:!bg-black/90")
              }
              style={{ WebkitTapHighlightColor: 'transparent' } as any}
              title={hasPreset ? '清除本地预设' : '保存当前为本地预设'}
            >
              {hasPreset ? <Trash2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{hasPreset ? '清除预设' : '保存预设'}</span>
            </Button>

            <Button
              type="button"
              className="h-9 flex-1 text-xs"
              onClick={(e) => {
                handleExport();
                (e.currentTarget as HTMLButtonElement).blur();
              }}
              onPointerUp={(e) => (e.currentTarget as HTMLButtonElement).blur()}
              onPointerCancel={(e) => (e.currentTarget as HTMLButtonElement).blur()}
              onTouchEnd={(e) => (e.currentTarget as HTMLButtonElement).blur()}
              style={{ WebkitTapHighlightColor: 'transparent' } as any}
            >
              <Download className="w-4 h-4 mr-2" />
              导出封面
            </Button>
          </div>

          <div className="text-center text-[11px] md:text-xs text-muted-foreground leading-none">
            <a href="https://github.com/Taocrypt/easy_cover" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center justify-center gap-1">
              <Github className="w-3.5 h-3.5" />
              GitHub 开源仓库
            </a>
          </div>
      </div>
    </div>
  );
}
