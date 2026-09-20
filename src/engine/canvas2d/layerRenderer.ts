import { Layer } from '../../types';
import { clamp } from '../colors/colorMath';
import { FONTS } from '../../constants/fonts';

const FB_SERIF = '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",Georgia,serif';
const FB_SANS = '"Hiragino Sans","Yu Gothic UI","Noto Sans JP",system-ui,sans-serif';
const FB_MONO = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';

const loadedFonts: Record<string, boolean> = {
  Inter: true,
  'Instrument Serif': true,
  'Plus Jakarta Sans': true
};

export function loadFont(fam: string) {
  if (!fam || loadedFonts[fam]) return;
  const f = FONTS.find(x => x.name === fam);
  if (!f) return;
  loadedFonts[fam] = true;
  const q = encodeURIComponent(fam).replace(/%20/g, '+');
  let css = `https://fonts.googleapis.com/css2?family=${q}&display=swap`;
  if (f.weights.length > 1) {
    css = `https://fonts.googleapis.com/css2?family=${q}:wght@${f.weights.join(';')}&display=swap`;
  }
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = css;
  document.head.appendChild(l);
}

export function fallbackFor(cat?: string): string {
  if (cat === 'jp-mincho' || cat === 'la-serif') return FB_SERIF;
  if (cat === 'la-mono') return FB_MONO;
  return FB_SANS;
}

export function fontStackOf(fam: string): string {
  const f = FONTS.find(x => x.name === fam);
  return `"${(fam || 'Inter').replace(/["\\]/g, '')}", ${fallbackFor(f ? f.cat : '')}`;
}

export interface AnimResult {
  a: number;
  rot: number;
  scale: number;
  dx: number;
  dy: number;
}

export function easeVal(p: number, e: string): number {
  if (e === 'easein') return p * p;
  if (e === 'easeout') return 1 - (1 - p) * (1 - p);
  if (e === 'easeio') return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  return p;
}

export function layerGeom(L: Layer, W: number, H: number, k: number): { w: number; h: number } {
  if (L.kind === 'text') {
    const tval = String(L.textValue || '');
    if (!tval.trim()) return { w: 100 * k, h: 100 * k };
    const size = (L.textSize || 100) * k;
    const lines = tval.split('\n');
    const lh = size * (L.lineH && L.lineH > 0 ? L.lineH : 1.18);
    return { w: Math.max(100 * k, size * 5), h: lines.length * lh };
  } else if (isShapeLayer(L) || L.kind === 'image' || (L as any).kind === 'img') {
    if (!L.img && L.imgSrc) {
      const im = new Image();
      im.src = L.imgSrc;
      L.img = im;
    }
    if (L.img && L.img.naturalWidth) {
      const nw = L.img.naturalWidth;
      const nh = L.img.naturalHeight;
      const long = (L.imgLen || 360) * k;
      const w = nw >= nh ? long : (long * nw) / nh;
      const h = nw >= nh ? (long * nh) / nw : long;
      return { w, h };
    }
  }
  return { w: 100 * k, h: 100 * k };
}

export function layerAnim(L: Layer, nowMs: number, W: number, H: number, k: number): AnimResult {
  const type = L.animType || 'none';
  const NONE: AnimResult = { a: 1, rot: 0, scale: 1, dx: 0, dy: 0 };
  if (type === 'none') return NONE;

  W = W || 1600;
  H = H || 900;
  k = k || 1;
  if (L._astart == null) {
    L._astart = nowMs;
  }
  const t0 = L._astart;
  const dur = Math.max(0.05, L.animDur || 1.5);
  const delay = Math.max(0, L.animDelay || 0);
  const t = (nowMs - t0) / 1000 - delay;

  if (t < 0) {
    if (type === 'fadein' || type === 'fadeio' || type === 'slide') {
      return { a: 0, rot: 0, scale: 1, dx: 0, dy: 0 };
    }
    return NONE;
  }

  const inf = L.animLoop !== false && (!L.animCount || L.animCount === 0);
  const cyc = inf ? 1e9 : Math.max(1, Math.floor(L.animCount || 1));
  let seg = Math.floor(t / dur);

  const g = type === 'slide' ? layerGeom(L, W, H, k) : { w: 100, h: 100 };
  const cx = (W * (L.x || 50)) / 100;
  const cy = (H * (L.y || 50)) / 100;
  const pad = 50 * k;
  const dir = L.animDir || 'left';
  let exitDx = 0, exitDy = 0, enterDx = 0, enterDy = 0;

  if (dir === 'left') {
    enterDx = -(cx + g.w / 2 + pad);
    exitDx = W - cx + g.w / 2 + pad;
  } else if (dir === 'right') {
    enterDx = W - cx + g.w / 2 + pad;
    exitDx = -(cx + g.w / 2 + pad);
  } else if (dir === 'top') {
    enterDy = -(cy + g.h / 2 + pad);
    exitDy = H - cy + g.h / 2 + pad;
  } else if (dir === 'bottom') {
    enterDy = H - cy + g.h / 2 + pad;
    exitDy = -(cy + g.h / 2 + pad);
  }

  if (!inf && seg >= cyc) {
    if (type === 'fadeout') return { a: 0, rot: 0, scale: 1, dx: 0, dy: 0 };
    if (type === 'slide') return { a: 0, rot: 0, scale: 1, dx: exitDx, dy: exitDy };
    return { a: 1, rot: 0, scale: 1, dx: 0, dy: 0 };
  }
  if (inf && seg > 1e7) seg = 0;
  let tt = t - seg * dur;
  if (tt > dur) tt = dur;
  const p = Math.max(0, Math.min(1, tt / dur));
  const ease = L.animEase || 'linear';

  if (type === 'fadein') return { a: easeVal(p, ease), rot: 0, scale: 1, dx: 0, dy: 0 };
  if (type === 'fadeout') return { a: 1 - easeVal(p, ease), rot: 0, scale: 1, dx: 0, dy: 0 };
  if (type === 'fadeio') {
    const m = p <= 0.5 ? easeVal(p * 2, ease) : 1 - easeVal((p - 0.5) * 2, ease);
    return { a: clamp(m, 0, 1), rot: 0, scale: 1, dx: 0, dy: 0 };
  }
  if (type === 'spin') return { a: 1, rot: 360 * easeVal(p, ease), scale: 1, dx: 0, dy: 0 };
  if (type === 'flicker') {
    const m = Math.floor(p * 8) % 2 === 0 ? 1 : 0.3;
    return { a: m, rot: 0, scale: 1, dx: 0, dy: 0 };
  }
  if (type === 'pulse') {
    const ep = easeVal(p, ease);
    const sc = 1 + 0.22 * Math.sin(ep * Math.PI * 2);
    return { a: 1, rot: 0, scale: sc, dx: 0, dy: 0 };
  }
  if (type === 'slide') {
    let dx = 0, dy = 0;
    if (p < 0.32) {
      const localP = p / 0.32;
      const ep = easeVal(localP, ease === 'linear' ? 'linear' : 'easeout');
      dx = enterDx * (1 - ep);
      dy = enterDy * (1 - ep);
    } else if (p <= 0.68) {
      dx = 0;
      dy = 0;
    } else {
      const localP = (p - 0.68) / 0.32;
      const ep = easeVal(localP, ease === 'linear' ? 'linear' : 'easein');
      dx = exitDx * ep;
      dy = exitDy * ep;
    }
    return { a: 1, rot: 0, scale: 1, dx, dy };
  }
  return NONE;
}

export function isShapeLayer(L: Layer): boolean {
  if (!L) return false;
  return (
    L.kind === 'shape' ||
    (L as any).kind === 'img' ||
    L.shapeIdx != null ||
    !!L.shapeFill ||
    !!(L as any).fill ||
    (typeof L.imgSrc === 'string' && (L.imgSrc.includes('/shapes/') || L.imgSrc.endsWith('.svg') || L.imgSrc.startsWith('data:image/svg+xml')))
  );
}

// Bounded cache for tinted shape canvases to guarantee 60-120 FPS render performance
const shapeTintCache = new Map<string, HTMLCanvasElement>();

export function getTintedShapeCanvas(
  img: CanvasImageSource,
  cacheKey: string,
  fillColor: string
): HTMLCanvasElement {
  const normColor = (fillColor && typeof fillColor === 'string' && fillColor.trim() ? fillColor.trim() : '#FFFFFF').toUpperCase();
  const key = `${cacheKey || 'shape'}_${normColor}`;
  const existing = shapeTintCache.get(key);
  if (existing) return existing;

  const nw = (img as any).naturalWidth || (img as any).width || 256;
  const nh = (img as any).naturalHeight || (img as any).height || 256;

  const cv = document.createElement('canvas');
  cv.width = nw;
  cv.height = nh;
  const g = cv.getContext('2d');
  if (g && nw > 0 && nh > 0) {
    g.drawImage(img, 0, 0, nw, nh);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = normColor;
    g.fillRect(0, 0, nw, nh);
  }

  if (shapeTintCache.size > 200) {
    const first = shapeTintCache.keys().next().value;
    if (first) shapeTintCache.delete(first);
  }
  shapeTintCache.set(key, cv);
  return cv;
}

export function drawElementContent(
  ctx: CanvasRenderingContext2D,
  L: Layer,
  W: number,
  H: number,
  k: number,
  mode: 'main' | 'depth',
  an?: AnimResult
) {
  an = an || { a: 1, rot: 0, scale: 1, dx: 0, dy: 0 };
  const cx = (W * (L.x || 50)) / 100 + (an.dx || 0);
  const cy = (H * (L.y || 50)) / 100 + (an.dy || 0);

  let gw = 100, gh = 100;
  let lines: string[] = [], widths: number[] = [], bw = 0, size = 100, lh = 118, sp = 0;

  const isShape = isShapeLayer(L);

  if (L.kind === 'text') {
    const tval = String(L.textValue || '');
    if (!tval.trim()) return;
    loadFont(L.textFont || 'Inter');
    size = (L.textSize || 100) * k;
    sp = (L.sp || 0) * k;
    ctx.save();
    ctx.font = `${L.textWeight || '400'} ${size}px ${fontStackOf(L.textFont || 'Inter')}`;
    lines = tval.split('\n');
    lh = size * (L.lineH && L.lineH > 0 ? L.lineH : 1.18);
    const measureW = (str: string) =>
      ctx.measureText(str).width + (sp > 0.05 ? Math.max(0, str.length - 1) * sp : 0);
    widths = lines.map(measureW);
    bw = Math.max(10, ...widths);
    gw = bw;
    gh = lines.length * lh;
    ctx.restore();
  } else if ((isShape || L.kind === 'image' || (L as any).kind === 'img') && L.img && L.img.naturalWidth) {
    const nw = L.img.naturalWidth;
    const nh = L.img.naturalHeight;
    const long = (L.imgLen || 360) * k;
    gw = nw >= nh ? long : (long * nw) / nh;
    gh = nw >= nh ? (long * nh) / nw : long;
  }

  const origin = L.animOrigin || 'center';
  let ox = 0;
  if (origin === 'left') ox = -gw / 2;
  else if (origin === 'right') ox = gw / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(((L.rot || 0) * Math.PI) / 180 + (((an.rot || 0) * Math.PI) / 180));
  if (ox) ctx.translate(ox, 0);
  if (an.scale && an.scale !== 1) ctx.scale(an.scale, an.scale);
  if (ox) ctx.translate(-ox, 0);

  if (L.kind === 'text') {
    ctx.font = `${L.textWeight || '400'} ${size}px ${fontStackOf(L.textFont || 'Inter')}`;
    ctx.textBaseline = 'middle';
    if (mode !== 'depth' && L.textShadow) {
      ctx.shadowColor = 'rgba(0,0,0,.3)';
      ctx.shadowBlur = Math.max(6 * k, size * 0.12);
      ctx.shadowOffsetY = Math.max(2 * k, size * 0.03);
    }
    ctx.fillStyle = mode === 'depth' ? L.depthColor || '#000000' : L.textColor || '#FFFFFF';
    const writeLine = (ln: string, x0: number, yy: number) => {
      if (!sp || sp < 0.05) {
        ctx.fillText(ln, x0, yy);
        return;
      }
      let x = x0;
      for (const ch of ln) {
        ctx.fillText(ch, x, yy);
        x += ctx.measureText(ch).width + sp;
      }
    };
    const align = L.textAlign || 'center';
    lines.forEach((ln, i) => {
      const yy = (i - (lines.length - 1) / 2) * lh;
      const lw = widths[i];
      let x0 = 0;
      if (align === 'left') x0 = -bw / 2;
      else if (align === 'right') x0 = bw / 2 - lw;
      else x0 = -lw / 2;
      writeLine(ln, x0, yy);
    });
  } else if ((isShape || L.kind === 'image' || (L as any).kind === 'img') && L.img && L.img.naturalWidth) {
    const w = gw;
    const h = gh;
    if (L.flipH) ctx.scale(-1, 1);
    if (L.flipV) ctx.scale(1, -1);

    if (isShape) {
      const fillColor = L.shapeFill || (L as any).fill || '#FFFFFF';
      const color = mode === 'depth' ? (L.depthColor || '#000000') : fillColor;
      const tinted = getTintedShapeCanvas(L.img, L.imgSrc || L.id, color);
      ctx.drawImage(tinted, -w / 2, -h / 2, w, h);
    } else {
      if (mode === 'depth') {
        const tinted = getTintedShapeCanvas(L.img, L.imgSrc || L.id, L.depthColor || '#000000');
        ctx.drawImage(tinted, -w / 2, -h / 2, w, h);
      } else {
        ctx.drawImage(L.img, -w / 2, -h / 2, w, h);
      }
    }
  }
  ctx.restore();
}

export function layerSil(L: Layer, W: number, H: number, k: number, an?: AnimResult): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(2, W);
  c.height = Math.max(2, H);
  const g = c.getContext('2d');
  if (g) drawElementContent(g, L, W, H, k, 'depth', an);
  return c;
}

export function drawLayers(
  ctx: CanvasRenderingContext2D,
  layers: Layer[],
  W: number,
  H: number,
  k: number,
  animSkip?: boolean,
  nowMs?: number
) {
  const now = nowMs != null ? nowMs : performance.now();
  layers.forEach(L => {
    if (L.visible === false) return;
    if (L.kind === 'text' && !String(L.textValue || '').trim()) return;
    const isShape = isShapeLayer(L);
    if ((isShape || L.kind === 'image' || (L as any).kind === 'img') && (!L.img || !L.img.naturalWidth)) {
      if (!L.img && L.imgSrc) {
        const im = new Image();
        im.src = L.imgSrc;
        L.img = im;
      }
      return;
    }

    const op = L.opacity == null ? 1 : L.opacity;
    const an = animSkip ? { a: 1, rot: 0, scale: 1, dx: 0, dy: 0 } : layerAnim(L, now, W, H, k);
    if ((an.a || 1) <= 0.001) return;

    if (L.depth > 0) {
      const off = Math.max(2 * k, k * 90 * (L.depth / 100));
      const sil = layerSil(L, W, H, k, an);
      const steps = 8;
      ctx.save();
      ctx.globalAlpha = Math.max(op * 0.5, 0.2) * (an.a || 1);
      for (let st = steps; st >= 1; st--) {
        ctx.save();
        ctx.globalAlpha = Math.max(op * 0.4, 0.14) * (st / steps) * 2.5 * (an.a || 1);
        ctx.drawImage(sil, off * (st / steps), off * (st / steps) * 0.55);
        ctx.restore();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = op * (an.a || 1);
    drawElementContent(ctx, L, W, H, k, 'main', an);
    ctx.restore();
  });
}
