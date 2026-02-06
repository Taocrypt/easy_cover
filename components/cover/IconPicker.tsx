'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Loader2, LayoutGrid, Apple } from 'lucide-react';

// Simple debounce implementation inside the component for simplicity if we don't want a separate file
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  onPickImageUrl?: (url: string) => void;
}

type Source = 'iconify' | 'appstore';

type AppStoreItem = {
  trackId: number;
  trackName: string;
  kind?: string;
  artworkUrl512?: string;
  artworkUrl100?: string;
  artworkUrl60?: string;
};

type AppStoreOptions = {
  entity: 'software' | 'iPadSoftware' | 'desktopSoftware';
  country: string;
  resolution: '256' | '512' | '1024';
  cut: '0' | '1' | '2';
};

export function IconPicker({ value, onChange, onPickImageUrl }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<Source>('iconify');
  const [query, setQuery] = useState('');
  const [icons, setIcons] = useState<string[]>([]);
  const [apps, setApps] = useState<AppStoreItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [appStoreOptions, setAppStoreOptions] = useState<AppStoreOptions>({
    entity: 'software',
    country: 'cn',
    resolution: '512',
    cut: '2',
  });
  const appStoreOptionsRef = React.useRef<AppStoreOptions>(appStoreOptions);
  useEffect(() => {
    appStoreOptionsRef.current = appStoreOptions;
  }, [appStoreOptions]);

  const buildAppStoreIconDataUrl = async (app: AppStoreItem) => {
    const { resolution, cut } = appStoreOptionsRef.current;
    const artworkUrl512 = app.artworkUrl512 || app.artworkUrl100 || app.artworkUrl60;
    if (!artworkUrl512) return null;

    const canvas = document.createElement('canvas');
    canvas.width = parseInt(resolution, 10);
    canvas.height = parseInt(resolution, 10);
    const iOSDefaultUrl = '/512x512bb.jpg';
    const macDefaultUrl = '/512x512bb.png';
    const suffix = cut === '2' ? 'ia' : 'bb';
    const newUrl = `/${resolution}x${resolution}${suffix}-100.webp`;
    const newArtWorkUrl = artworkUrl512
      .replace(iOSDefaultUrl, newUrl)
      .replace(macDefaultUrl, newUrl);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = newArtWorkUrl;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('image load failed'));
    });

    ctx.drawImage(img, 0, 0);

    // Cut mode '1' applies the same official rounded mask path as HQ-ICON
    if (cut === '1') {
      ctx.globalCompositeOperation = 'destination-in';
      const drawOutline = (outlinePath: string) => {
        const outline = new Path2D(outlinePath);
        ctx.fill(outline);
      };

      if ((app.kind || '').startsWith('software')) {
        if (resolution === '256') {
          drawOutline('m256,175.92c0,3.06,0,6.12-.02,9.17-.01,2.58-.04,5.16-.11,7.73-.07,5.64-.57,11.26-1.48,16.82-.95,5.57-2.73,10.96-5.27,15.99-5.16,10.12-13.38,18.35-23.5,23.51-5.04,2.54-10.42,4.32-15.98,5.27-5.57.92-11.19,1.42-16.82,1.48-2.58.07-5.15.1-7.73.12-3.06.02-6.12.02-9.17.02h-95.85c-3.06,0-6.11,0-9.17-.01-2.58,0-5.15-.04-7.73-.11-5.64-.07-11.26-.57-16.82-1.49-5.56-.95-10.95-2.73-15.98-5.27-10.12-5.16-18.35-13.38-23.5-23.5-2.55-5.04-4.32-10.43-5.27-16-.92-5.56-1.41-11.18-1.48-16.81-.07-2.58-.1-5.16-.11-7.73-.02-3.06-.02-6.11-.02-9.17v-95.84c0-3.06,0-6.12.02-9.19.01-2.57.05-5.15.11-7.72.07-5.63.57-11.25,1.48-16.81.95-5.57,2.73-10.96,5.27-16,5.16-10.12,13.38-18.35,23.5-23.51,5.04-2.54,10.42-4.32,15.97-5.27,5.57-.92,11.19-1.41,16.82-1.48,2.58-.07,5.16-.1,7.73-.11,3.06-.02,6.12-.02,9.17-.02h95.85c3.06,0,6.12,0,9.18.02,2.58.01,5.15.05,7.73.11,5.63.07,11.26.57,16.82,1.48,5.57.95,10.95,2.73,15.99,5.27,10.12,5.16,18.35,13.38,23.51,23.51,2.54,5.04,4.32,10.43,5.27,15.99.92,5.56,1.41,11.18,1.48,16.82.07,2.58.1,5.16.11,7.73.02,3.06.02,6.12.02,9.17v95.85h0Z');
        } else if (resolution === '512') {
          drawOutline('m512,351.84c0,6.12,0,12.23-.04,18.34-.03,5.15-.09,10.31-.22,15.45-.14,11.27-1.13,22.51-2.96,33.63-1.9,11.13-5.45,21.91-10.54,31.98-10.31,20.24-26.76,36.7-47,47.01-10.07,5.08-20.84,8.63-31.96,10.53-11.13,1.84-22.37,2.83-33.64,2.96-5.15.13-10.3.21-15.45.23-6.12.03-12.23.03-18.34.03h-191.69c-6.11,0-12.22,0-18.34-.03-5.15-.02-10.3-.09-15.45-.22-11.27-.14-22.51-1.14-33.64-2.97-11.12-1.89-21.89-5.45-31.96-10.53-20.24-10.31-36.69-26.76-47-46.99-5.09-10.08-8.64-20.86-10.54-31.99-1.83-11.11-2.82-22.35-2.96-33.62-.13-5.15-.2-10.31-.22-15.46-.04-6.12-.04-12.22-.04-18.34v-191.67c0-6.12,0-12.24.04-18.37.02-5.14.09-10.3.22-15.44.14-11.26,1.13-22.5,2.96-33.62,1.9-11.13,5.45-21.91,10.54-31.99,10.31-20.24,26.76-36.7,47-47.01,10.07-5.08,20.83-8.63,31.94-10.53,11.13-1.83,22.37-2.82,33.64-2.96,5.15-.13,10.31-.2,15.45-.22,6.12-.03,12.24-.03,18.34-.03h191.69c6.12,0,12.24,0,18.35.03,5.15.02,10.3.09,15.45.22,11.26.14,22.51,1.14,33.63,2.96,11.13,1.9,21.89,5.45,31.97,10.53,20.24,10.31,36.7,26.76,47.01,47.01,5.08,10.08,8.63,20.86,10.53,31.98,1.83,11.12,2.82,22.36,2.96,33.63.13,5.15.2,10.31.22,15.45.04,6.12.04,12.23.04,18.34v191.69h0Z');
        } else if (resolution === '1024') {
          drawOutline('m1024,703.67c0,12.24,0,24.46-.08,36.68-.06,10.3-.18,20.62-.44,30.9-.28,22.54-2.26,45.02-5.92,67.26-3.8,22.26-10.9,43.82-21.08,63.96-20.62,40.48-53.52,73.4-94,94.02-20.14,10.16-41.68,17.26-63.92,21.06-22.26,3.68-44.74,5.66-67.28,5.92-10.3.26-20.6.42-30.9.46-12.24.06-24.46.06-36.68.06h-383.39c-12.22,0-24.44,0-36.68-.06-10.3-.04-20.6-.18-30.9-.44-22.54-.28-45.02-2.28-67.28-5.94-22.24-3.78-43.78-10.9-63.92-21.06-40.48-20.62-73.38-53.52-94-93.98-10.18-20.16-17.28-41.72-21.08-63.98-3.66-22.22-5.64-44.7-5.92-67.24-.26-10.3-.4-20.62-.44-30.92-.08-12.24-.08-24.44-.08-36.68v-383.35c0-12.24,0-24.48.08-36.74.04-10.28.18-20.6.44-30.88.28-22.52,2.26-45,5.92-67.24,3.8-22.26,10.9-43.82,21.08-63.98,20.62-40.48,53.52-73.4,94-94.02,20.14-10.16,41.66-17.26,63.88-21.06,22.26-3.66,44.74-5.64,67.28-5.92,10.3-.26,20.62-.4,30.9-.44,12.24-.06,24.48-.06,36.68-.06h383.39c12.24,0,24.48,0,36.7.06,10.3.04,20.6.18,30.9.44,22.52.28,45.02,2.28,67.26,5.92,22.26,3.8,43.78,10.9,63.94,21.06,40.48,20.62,73.4,53.52,94.02,94.02,10.16,20.16,17.26,41.72,21.06,63.96,3.66,22.24,5.64,44.72,5.92,67.26.26,10.3.4,20.62.44,30.9.08,12.24.08,24.46.08,36.68v383.39l.02-.02Z');
        }
      }
    }

    return canvas.toDataURL('image/png');
  };
  
  // Default featured icons if query is empty
  const featuredIcons = [
    'logos:react', 'logos:nextjs-icon', 'logos:typescript-icon', 'logos:tailwindcss-icon',
    'logos:github-icon', 'logos:twitter', 'logos:google-icon', 'logos:apple',
    'ph:star-fill', 'ph:heart-fill', 'ph:check-circle-fill', 'ph:warning-fill',
    'mdi:home', 'mdi:account', 'mdi:cog', 'mdi:bell',
    'fluent:emoji-smile-slight-24-filled', 'fluent:weather-sunny-24-filled',
    'simple-icons:shadcnui', 'simple-icons:vercel'
  ];

  const debouncedQuery = useDebounceValue(query, 500);

  useEffect(() => {
    if (!debouncedQuery) {
      if (source === 'iconify') setIcons(featuredIcons);
      if (source === 'appstore') setApps([]);
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
        if (source === 'iconify') {
          const res = await fetch(
            `https://api.iconify.design/search?query=${encodeURIComponent(debouncedQuery)}&limit=50`
          );
          const data = await res.json();
          if (data.icons) setIcons(data.icons);
        } else {
          // Reference: HQ-ICON project (iTunes Search API)
          const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
            debouncedQuery
          )}&country=${encodeURIComponent(appStoreOptions.country)}&entity=${encodeURIComponent(appStoreOptions.entity)}&limit=50`;
          const res = await fetch(url);
          const data = await res.json();
          const results = (data?.results || []) as AppStoreItem[];
          setApps(
            results.map((r) => ({
              trackId: r.trackId,
              trackName: r.trackName,
              kind: (r as any).kind,
              artworkUrl512:
                r.artworkUrl512 ||
                (r.artworkUrl100
                  ? r.artworkUrl100.replace('100x100', '512x512')
                  : undefined),
              artworkUrl100: r.artworkUrl100,
              artworkUrl60: r.artworkUrl60,
            }))
          );
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [debouncedQuery, source]);

  // Initial load
  useEffect(() => {
    if (!query && source === 'iconify') setIcons(featuredIcons);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal px-3">
          <div className="flex items-center gap-2 overflow-hidden">
             <Icon icon={value} className="w-5 h-5 flex-shrink-0" />
             <span className="truncate">{value || "选择图标..."}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-4 pb-0 space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={source === 'iconify' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setSource('iconify');
                setQuery('');
                setIcons(featuredIcons);
                setApps([]);
              }}
              title="Iconify"
            >
              <LayoutGrid className="w-4 h-4" />
              Iconify
            </Button>
            <Button
              type="button"
              variant={source === 'appstore' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setSource('appstore');
                setQuery('');
                setApps([]);
              }}
              title="App Store"
            >
              <Apple className="w-4 h-4" />
              App Store
            </Button>
          </div>

          {source === 'appstore' && (
            <div className="grid grid-cols-2 gap-2">
              <select
                className="h-8 rounded-md border bg-background px-2 text-xs"
                value={appStoreOptions.entity}
                onChange={(e) =>
                  setAppStoreOptions((s) => ({
                    ...s,
                    entity: e.target.value as any,
                    cut: e.target.value === 'desktopSoftware' ? '0' : s.cut,
                  }))
                }
              >
                <option value="software">iOS</option>
                <option value="iPadSoftware">iPadOS</option>
                <option value="desktopSoftware">macOS</option>
              </select>
              <select
                className="h-8 rounded-md border bg-background px-2 text-xs"
                value={appStoreOptions.country}
                onChange={(e) =>
                  setAppStoreOptions((s) => ({ ...s, country: e.target.value }))
                }
              >
                {['cn','us','jp','kr','tw','hk','sg','gb','fr','de','it','es','ru','in','th','id','ph','vn','tr','ca','au','br','mx','my'].map((c) => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
              </select>
              <select
                className="h-8 rounded-md border bg-background px-2 text-xs"
                value={appStoreOptions.resolution}
                onChange={(e) =>
                  setAppStoreOptions((s) => ({ ...s, resolution: e.target.value as any }))
                }
              >
                <option value="256">256px</option>
                <option value="512">512px</option>
                <option value="1024">1024px</option>
              </select>
              <select
                className="h-8 rounded-md border bg-background px-2 text-xs"
                value={appStoreOptions.cut}
                onChange={(e) =>
                  setAppStoreOptions((s) => ({ ...s, cut: e.target.value as any }))
                }
              >
                <option value="2">官方圆角</option>
                <option value="1">普通圆角</option>
                <option value="0">原始图像</option>
              </select>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={source === 'iconify' ? "搜索图标 (如: react, home)..." : "搜索 App Store 应用 (如: 微信, Notion)..."}
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="h-[300px] p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              加载中...
            </div>
          ) : source === 'iconify' ? (
            <div className="grid grid-cols-5 gap-2">
              {icons.map((iconName) => (
                <button
                  key={iconName}
                  className={`p-2 rounded-md hover:bg-accent flex items-center justify-center transition-colors aspect-square ${value === iconName ? 'bg-accent ring-2 ring-primary' : ''}`}
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                  }}
                  title={iconName}
                >
                  <Icon icon={iconName} className="w-6 h-6" />
                </button>
              ))}
              {icons.length === 0 && (
                <div className="col-span-5 text-center py-8 text-sm text-muted-foreground">未找到图标</div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {apps.map((app) => {
                const url = app.artworkUrl512 || app.artworkUrl100 || app.artworkUrl60;
                if (!url) return null;
                return (
                  <button
                    key={app.trackId}
                    className="p-2 rounded-md hover:bg-accent flex flex-col items-center justify-center transition-colors"
                    onClick={async () => {
                      try {
                        const dataUrl = await buildAppStoreIconDataUrl(app);
                        if (dataUrl) onPickImageUrl?.(dataUrl);
                      } catch (e) {
                        console.error(e);
                      }
                      setOpen(false);
                    }}
                    title={app.trackName}
                  >
                    <img src={url} alt={app.trackName} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="mt-1 text-[10px] text-muted-foreground line-clamp-2 text-center">{app.trackName}</div>
                  </button>
                );
              })}
              {apps.length === 0 && (
                <div className="col-span-4 text-center py-8 text-sm text-muted-foreground">未找到应用</div>
              )}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t text-xs text-center text-muted-foreground bg-muted/50">
          {source === 'iconify' ? 'Powered by Iconify' : 'Powered by HQ ICON'}
        </div>
      </PopoverContent>
    </Popover>
  );
}
