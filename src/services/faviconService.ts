import { GradientConfig } from '../types';
import { blitTo } from '../engine/webgl/glRenderer';

let favUrl = '';
let lastUpdateTimer: any = null;

export function updateDynamicFavicon(cfg: GradientConfig) {
  if (typeof window === 'undefined') return;

  // Debounce favicon updates so typing/sliders don't overload
  if (lastUpdateTimer) clearTimeout(lastUpdateTimer);
  lastUpdateTimer = setTimeout(() => {
    try {
      const el = document.getElementById('favicon') as HTMLLinkElement | null;
      if (!el) return;

      const S = 64;
      const cv = document.createElement('canvas');
      cv.width = S;
      cv.height = S;
      const ctx = cv.getContext('2d');
      if (!ctx) return;

      // 1. Render gradient composition into 64x64
      blitTo(ctx, cfg, S, S, 0);

      // 2. Clip as circle badge
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
      ctx.fill();

      // 3. Draw outer white rim for contrast across both dark and light browser chrome
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(S / 2, S / 2, S / 2 - 1.5, 0, Math.PI * 2);
      ctx.stroke();

      cv.toBlob(b => {
        if (!b) return;
        const u = URL.createObjectURL(b);
        if (favUrl) URL.revokeObjectURL(favUrl);
        favUrl = u;
        el.href = u;
      }, 'image/png');
    } catch {
      // Ignore favicon rendering errors
    }
  }, 120);
}
