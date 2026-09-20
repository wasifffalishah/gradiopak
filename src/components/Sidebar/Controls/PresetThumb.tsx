import React, { useState, useEffect } from 'react';
import { Preset } from '../../../types';
import { getCachedThumb, thumbCache } from '../../../services/presetPrewarmer';
import { renderOffscreen } from '../../../engine/webgl/glRenderer';
import { SPOT_DEFAULTS } from '../../../constants/catalog';

interface PresetThumbProps {
  preset: Preset;
}

export const PresetThumb: React.FC<PresetThumbProps> = React.memo(({ preset }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(() => getCachedThumb(preset.name) || null);

  useEffect(() => {
    const cached = getCachedThumb(preset.name);
    if (cached) {
      if (dataUrl !== cached) setDataUrl(cached);
      return;
    }

    // If not pre-baked yet, schedule deferred render so main thread stays completely responsive
    const rafId = requestAnimationFrame(() => {
      const W = 160;
      const H = 100;
      const cfg: any = {
        type: preset.type,
        genre: preset.genre,
        texture: preset.texture || 'Smooth',
        direction: preset.direction || 135,
        colors: preset.colors,
        spots: preset.spots || SPOT_DEFAULTS.slice(0, preset.colors.length),
        scale: 50,
        distortion: 55,
        seed: 7.3,
        speed: 100,
        ratio: '16/10',
        animate: false,
        credit: false,
        layers: [],
        curve: { on: false, smooth: true, blend: 'mult', xPts: [], yPts: [] }
      };

      try {
        const off = renderOffscreen(cfg, W, H, 0);
        const cv = document.createElement('canvas');
        cv.width = W;
        cv.height = H;
        const ctx = cv.getContext('2d');
        if (ctx && off) {
          ctx.drawImage(off, 0, 0, W, H);
          const url = cv.toDataURL('image/jpeg', 0.82);
          thumbCache.set(preset.name, url);
          setDataUrl(url);
        }
      } catch {
        // Fallback gracefully to CSS gradient
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [preset, dataUrl]);

  if (dataUrl) {
    return (
      <img
        src={dataUrl}
        alt={preset.name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover rounded-lg shadow-inner group-hover:scale-[1.03] transition-transform duration-200"
      />
    );
  }

  // Instant silky smooth CSS gradient while thumbnail is baking
  return (
    <div
      className="w-full h-full rounded-lg shadow-inner group-hover:scale-[1.03] transition-transform duration-200"
      style={{
        background: `linear-gradient(${preset.direction || 135}deg, ${preset.colors.join(', ')})`
      }}
    />
  );
});
