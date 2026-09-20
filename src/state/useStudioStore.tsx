import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { GradientConfig, Layer, Spot } from '../types';
import { DEFAULT_CONFIG, SPOT_DEFAULTS } from '../constants/catalog';
import { PRESETS } from '../constants/presets';
import { decodeHashToState, encodeStateToHash } from './urlShortener';
import { lighten, toHex } from '../engine/colors/colorMath';

export type TabType = 'design' | 'presets' | 'text' | 'export';

interface StudioContextType {
  config: GradientConfig;
  configRef: React.MutableRefObject<GradientConfig>;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  statusMessage: string;
  setStatus: (msg: string) => void;
  pinnedA: GradientConfig | null;
  setPinnedA: (p: GradientConfig | null) => void;
  isReel: boolean;
  setIsReel: (r: boolean | ((prev: boolean) => boolean)) => void;
  isFullscreen: boolean;
  setIsFullscreen: (f: boolean) => void;
  activeSpotIndex: number | null;
  setActiveSpotIndex: (idx: number | null) => void;
  updateConfig: (partial: Partial<GradientConfig> | ((prev: GradientConfig) => GradientConfig)) => void;
  shufflePalette: () => void;
  resetStudio: () => void;
  addLayer: (layer: Layer) => void;
  updateLayer: (index: number, partial: Partial<Layer>) => void;
  removeLayer: (index: number) => void;
}

const StudioContext = createContext<StudioContextType | null>(null);

const STORAGE_KEY = 'gradiopak.v2';

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<GradientConfig>(() => {
    // 1. Check URL hash first
    const fromUrl = decodeHashToState();
    if (fromUrl && fromUrl.type) {
      return { ...DEFAULT_CONFIG, ...fromUrl } as GradientConfig;
    }
    // 2. Check localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.type) {
          const cfg = { ...DEFAULT_CONFIG, ...parsed };
          if (cfg.layers && cfg.layers.length === 1 && !cfg.layers[0].textValue && cfg.layers[0].id === 'default-layer-1') {
            cfg.layers[0] = { ...cfg.layers[0], visible: false };
          }
          return cfg;
        }
      }
    } catch (e) {}
    return DEFAULT_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<TabType>('design');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [pinnedA, setPinnedA] = useState<GradientConfig | null>(null);
  const [isReel, setIsReel] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeSpotIndex, setActiveSpotIndex] = useState<number | null>(null);

  // Mutable ref kept constantly in sync for the 60fps canvas loop
  const configRef = useRef<GradientConfig>(config);
  configRef.current = config;

  const statusTimerRef = useRef<any>(null);

  const setStatus = useCallback((msg: string) => {
    setStatusMessage(msg);
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    if (msg) {
      statusTimerRef.current = setTimeout(() => {
        setStatusMessage('');
      }, 4000);
    }
  }, []);

  const updateConfig = useCallback(
    (partial: Partial<GradientConfig> | ((prev: GradientConfig) => GradientConfig)) => {
      setConfigState(prev => {
        const next = typeof partial === 'function' ? partial(prev) : { ...prev, ...partial };
        configRef.current = next;
        return next;
      });
    },
    []
  );

  // Sync Ambient Background lighting CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const c = config.colors;
    const c1 = c[0] || '#4C5FD5';
    const c2 = c[1] || c[0] || '#FF8FA3';
    const c3 = c[2] || c[1] || c[0] || '#8B6BAE';
    root.style.setProperty('--amb1', c1);
    root.style.setProperty('--amb2', c2);
    root.style.setProperty('--amb3', c3);
    root.style.setProperty('--amb-opacity', '0.38');

    // Autosave debounced
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (e) {}
    }, 600);
    return () => clearTimeout(timer);
  }, [config.colors, config.type, config.genre]);

  // Shuffle Palette helper
  const shufflePalette = useCallback(() => {
    const rPreset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    updateConfig(prev => ({
      ...prev,
      colors: rPreset.colors.slice(),
      spots: (rPreset.spots || SPOT_DEFAULTS.slice(0, rPreset.colors.length)).map(p => [p[0], p[1]]),
      direction: rPreset.direction
    }));
    setStatus('Palette shuffled.');
  }, [updateConfig, setStatus]);

  // Reset to default
  const resetStudio = useCallback(() => {
    updateConfig(DEFAULT_CONFIG);
    setStatus('Back to the default composition.');
  }, [updateConfig, setStatus]);

  // Layer Management
  const addLayer = useCallback((layer: Layer) => {
    updateConfig(prev => ({
      ...prev,
      layers: [...prev.layers, layer],
      act: prev.layers.length
    }));
  }, [updateConfig]);

  const updateLayer = useCallback((index: number, partial: Partial<Layer>) => {
    updateConfig(prev => {
      const nextLayers = [...prev.layers];
      if (nextLayers[index]) {
        nextLayers[index] = { ...nextLayers[index], ...partial };
      }
      return { ...prev, layers: nextLayers };
    });
  }, [updateConfig]);

  const removeLayer = useCallback((index: number) => {
    updateConfig(prev => {
      const nextLayers = prev.layers.filter((_, i) => i !== index);
      const nextAct = Math.max(0, Math.min(prev.act, nextLayers.length - 1));
      return { ...prev, layers: nextLayers, act: nextAct };
    });
  }, [updateConfig]);

  // Preset Reel Auto-cycle
  useEffect(() => {
    if (!isReel) return;
    const interval = setInterval(() => {
      const r = PRESETS[Math.floor(Math.random() * PRESETS.length)];
      updateConfig(prev => ({
        ...prev,
        type: r.type,
        genre: r.genre,
        colors: r.colors.slice(),
        spots: (r.spots || SPOT_DEFAULTS.slice(0, r.colors.length)).map(p => [p[0], p[1]]),
        direction: r.direction
      }));
    }, 4500);
    return () => clearInterval(interval);
  }, [isReel, updateConfig]);

  return (
    <StudioContext.Provider
      value={{
        config,
        configRef,
        activeTab,
        setActiveTab,
        statusMessage,
        setStatus,
        pinnedA,
        setPinnedA,
        isReel,
        setIsReel,
        isFullscreen,
        setIsFullscreen,
        activeSpotIndex,
        setActiveSpotIndex,
        updateConfig,
        shufflePalette,
        resetStudio,
        addLayer,
        updateLayer,
        removeLayer
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
