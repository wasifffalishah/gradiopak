import { GradientConfig } from '../types';
import { blitTo } from '../engine/webgl/glRenderer';
import { drawLayers } from '../engine/canvas2d/layerRenderer';
import { geoStops, outSize, usableFrom } from '../engine/colors/colorMath';
import { ORGANIC } from '../constants/catalog';

function downloadBlob(name: string, blob: Blob) {
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}

export function drawCredit(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  const fs = Math.max(10, Math.round(w * 0.0085));
  ctx.font = `500 ${fs}px Plus Jakarta Sans, Inter, system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  const txt = 'gradiopak.vercel.app · by Wasiff Ali Shah';
  const tw = ctx.measureText(txt).width;
  const pad = Math.max(14, Math.round(w * 0.011));
  ctx.fillText(txt, w - pad - tw, h - pad);
  ctx.restore();
}

export function exportPNG(cfg: GradientConfig, statusFn?: (s: string) => void) {
  const s = outSize(cfg.ratio, cfg.custW, cfg.custH);
  const cv = document.createElement('canvas');
  cv.width = s.w;
  cv.height = s.h;
  const ctx = cv.getContext('2d');
  if (!ctx) return;

  blitTo(ctx, cfg, s.w, s.h, 0);
  drawLayers(ctx, cfg.layers, s.w, s.h, 1, true);
  if (cfg.credit) drawCredit(ctx, s.w, s.h);

  cv.toBlob(blob => {
    if (!blob) return;
    downloadBlob(`gradiopak-${cfg.type.toLowerCase()}-${cfg.genre.toLowerCase()}.png`, blob);
    if (statusFn) statusFn(`Exported PNG (${s.w}×${s.h})`);
  }, 'image/png');
}

export function exportJPEG(cfg: GradientConfig, statusFn?: (s: string) => void) {
  const s = outSize(cfg.ratio, cfg.custW, cfg.custH);
  const cv = document.createElement('canvas');
  cv.width = s.w;
  cv.height = s.h;
  const ctx = cv.getContext('2d');
  if (!ctx) return;

  blitTo(ctx, cfg, s.w, s.h, 0);
  drawLayers(ctx, cfg.layers, s.w, s.h, 1, true);
  if (cfg.credit) drawCredit(ctx, s.w, s.h);

  cv.toBlob(
    blob => {
      if (!blob) return;
      downloadBlob(`gradiopak-${cfg.type.toLowerCase()}-${cfg.genre.toLowerCase()}.jpg`, blob);
      if (statusFn) statusFn(`Exported JPEG (${s.w}×${s.h})`);
    },
    'image/jpeg',
    0.92
  );
}

export function exportWebP(cfg: GradientConfig, statusFn?: (s: string) => void) {
  const s = outSize(cfg.ratio, cfg.custW, cfg.custH);
  const cv = document.createElement('canvas');
  cv.width = s.w;
  cv.height = s.h;
  const ctx = cv.getContext('2d');
  if (!ctx) return;

  blitTo(ctx, cfg, s.w, s.h, 0);
  drawLayers(ctx, cfg.layers, s.w, s.h, 1, true);
  if (cfg.credit) drawCredit(ctx, s.w, s.h);

  cv.toBlob(
    blob => {
      if (!blob) return;
      downloadBlob(`gradiopak-${cfg.type.toLowerCase()}-${cfg.genre.toLowerCase()}.webp`, blob);
      if (statusFn) statusFn(`Exported WebP (${s.w}×${s.h})`);
    },
    'image/webp',
    0.92
  );
}

export function exportSocialCard(cfg: GradientConfig, statusFn?: (s: string) => void) {
  const W = 1200;
  const H = 630;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');
  if (!ctx) return;

  blitTo(ctx, cfg, W, H, 0);

  const dim = ctx.createLinearGradient(0, 0, 0, H);
  dim.addColorStop(0, 'rgba(5,6,9,0)');
  dim.addColorStop(0.6, 'rgba(5,6,9,.42)');
  dim.addColorStop(1, 'rgba(5,6,9,.9)');
  ctx.fillStyle = dim;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#f4f5f7';
  ctx.font = '600 30px Plus Jakarta Sans, system-ui, sans-serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('GRADIOPAK', 64, 96);

  const cols = usableFrom(cfg.colors);
  const hexes = cols.join('   ');
  ctx.font = '600 30px ui-monospace, Menlo, Consolas, monospace';
  let hs = 30;
  while (ctx.measureText(hexes).width > W - 170 && hs > 16) {
    hs -= 2;
    ctx.font = `600 ${hs}px ui-monospace, Menlo, Consolas, monospace`;
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillText(hexes, 64, H - 165);

  ctx.fillStyle = '#b9bcc6';
  ctx.font = '500 24px Plus Jakarta Sans, system-ui, sans-serif';
  ctx.fillText(`Gradient studio · ${cfg.type} · ${cfg.genre}`, 66, H - 112);

  ctx.fillStyle = 'rgba(255,255,255,.5)';
  ctx.font = '400 20px Plus Jakarta Sans, system-ui, sans-serif';
  ctx.fillText('gradiopak.vercel.app', 68, H - 62);

  cv.toBlob(blob => {
    if (!blob) return;
    downloadBlob('gradiopak-share-1200x630.png', blob);
    if (statusFn) statusFn('Share card downloaded (1200×630)');
  }, 'image/png');
}
