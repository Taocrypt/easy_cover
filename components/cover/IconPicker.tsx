'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Loader2, Globe, Apple } from 'lucide-react';

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
  artworkUrl512?: string;
  artworkUrl100?: string;
  artworkUrl60?: string;
};

export function IconPicker({ value, onChange, onPickImageUrl }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<Source>('iconify');
  const [query, setQuery] = useState('');
  const [icons, setIcons] = useState<string[]>([]);
  const [apps, setApps] = useState<AppStoreItem[]>([]);
  const [loading, setLoading] = useState(false);
  
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
          )}&country=cn&entity=software&limit=50`;
          const res = await fetch(url);
          const data = await res.json();
          const results = (data?.results || []) as AppStoreItem[];
          setApps(
            results.map((r) => ({
              trackId: r.trackId,
              trackName: r.trackName,
              artworkUrl512: r.artworkUrl512 || (r.artworkUrl100 ? r.artworkUrl100.replace('100x100', '512x512') : undefined),
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
              <Globe className="w-4 h-4" />
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
                    onClick={() => {
                      onPickImageUrl?.(url);
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
          {source === 'iconify' ? 'Powered by Iconify' : 'Powered by iTunes Search API'}
        </div>
      </PopoverContent>
    </Popover>
  );
}
