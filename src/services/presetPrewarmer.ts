import { PRESETS } from '../constants/presets';
import { SPOT_DEFAULTS } from '../constants/catalog';
import { renderOffscreen } from '../engine/webgl/glRenderer';

// In-memory global cache for pre-baked preset thumbnail data URLs
export const thumbCache = new Map<string, string>();

let isPrewarming = false;
let isPrewarmed = false;

export function isPresetsPrewarmed(): boolean {
  return isPrewarmed;
}

export function getCachedThumb(name: string): string | undefined {
  return thumbCache.get(name);
}

/**
 * Pre-warms and bakes all 63 studio presets into thumbCache using time-sliced
 * requestAnimationFrame batches so the main thread and terminal loader animation
 * remain 100% smooth at 60 FPS without dropping frames.
 */
export function prewarmPresets(
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  if (isPrewarmed) {
    if (onProgress) onProgress(PRESETS.length, PRESETS.length);
    return Promise.resolve();
  }

  if (isPrewarming) {
    return Promise.resolve();
  }

  isPrewarming = true;

  return new Promise<void>(resolve => {
    const W = 160;
    const H = 100;
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: false });

    let index = 0;
    const total = PRESETS.length;
    const BATCH_SIZE = 6; // Process 6 thumbnails per frame (takes ~5-8ms)

    function processBatch() {
      const end = Math.min(index + BATCH_SIZE, total);

      for (; index < end; index++) {
        const preset = PRESETS[index];
        if (thumbCache.has(preset.name)) continue;

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
          if (ctx && off) {
            ctx.clearRect(0, 0, W, H);
            ctx.drawImage(off, 0, 0, W, H);
            const url = cv.toDataURL('image/jpeg', 0.82);
            thumbCache.set(preset.name, url);
          }
        } catch {
          // Fallback if WebGL context is temporarily occupied
        }
      }

      if (onProgress) {
        onProgress(index, total);
      }

      if (index < total) {
        // Next frame batch
        requestAnimationFrame(processBatch);
      } else {
        isPrewarming = false;
        isPrewarmed = true;
        resolve();
      }
    }

    // Start on next frame
    requestAnimationFrame(processBatch);
  });
}
