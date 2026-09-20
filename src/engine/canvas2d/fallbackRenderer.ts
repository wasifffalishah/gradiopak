import { GradientConfig } from '../../types';
import { FULLFIELD, LUMINOUS, ORGANIC } from '../../constants/catalog';
import { clamp, darken, geoStops, toRgb, validPairs } from '../colors/colorMath';
import { crvStateOf, evalCurve } from '../curves/curveMath';

export function paintShape2D(ctx: CanvasRenderingContext2D, cfg: GradientConfig, w: number, h: number) {
  const rad = ((cfg.direction || 0) * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const cx = w / 2;
  const cy = h / 2;

  if (!ORGANIC[cfg.type] || FULLFIELD[cfg.type]) {
    const stops = geoStops(cfg);
    let g: CanvasGradient;
    if (cfg.type === 'Radial' || cfg.type === 'Diamond') {
      g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(w, h) / 2);
    } else if (cfg.type === 'Conic' && (ctx as any).createConicGradient) {
      g = (ctx as any).createConicGradient(rad - Math.PI / 2, cx, cy);
    } else {
      const len = (Math.abs(dx) * w) / 2 + (Math.abs(dy) * h) / 2;
      g = ctx.createLinearGradient(cx - dx * len, cy - dy * len, cx + dx * len, cy + dy * len);
    }
    stops.forEach((s, i) => g.addColorStop(i / Math.max(stops.length - 1, 1), s));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    return;
  }

  const pairs = validPairs(cfg);
  if (LUMINOUS[cfg.type]) {
    ctx.fillStyle = pairs[3] ? pairs[3][0] : '#000';
    ctx.fillRect(0, 0, w, h);
    const sp = pairs[0][1];
    const px = w * sp[0];
    const py = h * sp[1];
    const rr = Math.max(w, h) * 0.42;

    [
      [pairs[2] ? pairs[2][0] : pairs[0][0], rr, 0.55],
      [pairs[1] ? pairs[1][0] : pairs[0][0], rr * 0.6, 0.75],
      [pairs[0][0], rr * 0.22, 1]
    ].forEach((o: any) => {
      const q = toRgb(o[0]);
      const gr = ctx.createRadialGradient(px, py, 0, px, py, o[1]);
      gr.addColorStop(0, `rgba(${q.r},${q.g},${q.b},${o[2]})`);
      gr.addColorStop(1, `rgba(${q.r},${q.g},${q.b},0)`);
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, w, h);
    });
    return;
  }

  ctx.fillStyle = darken(pairs[0][0], 0.25);
  ctx.fillRect(0, 0, w, h);
  pairs.forEach(p => {
    const rgb = toRgb(p[0]);
    const gr = ctx.createRadialGradient(
      w * p[1][0],
      h * p[1][1],
      0,
      w * p[1][0],
      h * p[1][1],
      Math.max(w, h) * 0.45
    );
    gr.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.95)`);
    gr.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
  });
}

export function renderCurve2D(ctx: CanvasRenderingContext2D, cfg: GradientConfig, w: number, h: number) {
  const crv = crvStateOf(cfg);
  const tmp = document.createElement('canvas');
  tmp.width = w;
  tmp.height = h;
  const tg = tmp.getContext('2d');
  if (!tg) return;

  paintShape2D(tg, cfg, w, h);
  const im = tg.getImageData(0, 0, w, h).data;
  const out = ctx.createImageData(w, h);
  const od = out.data;
  const sm = crv.smooth;
  const wx = Math.max(1, w - 1);
  const hx = Math.max(1, h - 1);

  for (let y = 0; y < h; y++) {
    const srcRow = Math.round(clamp(1 - evalCurve(crv.y, sm, 1 - y / hx), 0, 1) * hx);
    for (let x = 0; x < w; x++) {
      const srcCol = Math.round(evalCurve(crv.x, sm, x / wx) * wx);
      const si = (srcRow * w + srcCol) * 4;
      const oi = (y * w + x) * 4;
      od[oi] = im[si];
      od[oi + 1] = im[si + 1];
      od[oi + 2] = im[si + 2];
      od[oi + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
}

export function render2D(cv: HTMLCanvasElement, cfg: GradientConfig, w: number, h: number) {
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  if (crvStateOf(cfg).on) {
    renderCurve2D(ctx, cfg, w, h);
    return;
  }
  paintShape2D(ctx, cfg, w, h);
}
