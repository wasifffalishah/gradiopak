import { GenreType, GradientConfig, GradientType, Spot, TextureType } from '../../types';
import { GENRES, SPOT_DEFAULTS, TEXTURES, TYPES, EXPORT_LONG } from '../../constants/catalog';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}

export function toRgb(hex: string): RgbColor {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) || 0,
    g: parseInt(h.slice(2, 4), 16) || 0,
    b: parseInt(h.slice(4, 6), 16) || 0
  };
}

export function toHex(rgb: RgbColor): string {
  return '#' + [rgb.r, rgb.g, rgb.b]
    .map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

export function mix(a: string, b: string, t: number): string {
  const x = toRgb(a);
  const y = toRgb(b);
  return toHex({
    r: x.r + (y.r - x.r) * t,
    g: x.g + (y.g - x.g) * t,
    b: x.b + (y.b - x.b) * t
  });
}

export function lighten(hex: string, t: number): string {
  return mix(hex, '#FFFFFF', t);
}

export function darken(hex: string, t: number): string {
  return mix(hex, '#000000', t);
}

export function luma(hex: string): number {
  const c = toRgb(hex);
  return (c.r * 0.299 + c.g * 0.587 + c.b * 0.114) / 255;
}

export function toHsl(hex: string): HslColor {
  const c = toRgb(hex);
  const r = c.r / 255;
  const g = c.g / 255;
  const b = c.b / 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  let s = 0;
  let hh = 0;
  const d = mx - mn;

  if (d > 0) {
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) hh = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) hh = (b - r) / d + 2;
    else hh = (r - g) / d + 4;
    hh *= 60;
  }
  return { h: hh, s, l };
}

export function hslHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  return toHex({
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255
  });
}

const HUE_NAMES: [string, number][] = [
  ["RED", 0], ["CORAL", 14], ["ORANGE", 28], ["AMBER", 40], ["GOLD", 50],
  ["LIME", 72], ["GREEN", 115], ["MINT", 150], ["TEAL", 170], ["CYAN", 186],
  ["SKY", 200], ["AZURE", 214], ["BLUE", 232], ["INDIGO", 254], ["VIOLET", 270],
  ["PURPLE", 286], ["MAGENTA", 306], ["PINK", 330], ["ROSE", 346], ["RED", 360]
];

export function colorName(hex: string): string {
  const c = toHsl(hex);
  if (c.s < 0.1 || c.l > 0.96 || c.l < 0.05) {
    return c.l > 0.92 ? 'WHITE' : c.l > 0.7 ? 'SILVER' : c.l > 0.45 ? 'GRAY' : c.l > 0.2 ? 'CHARCOAL' : 'BLACK';
  }
  let best = HUE_NAMES[0];
  let bd = 999;
  HUE_NAMES.forEach(n => {
    const d = Math.abs(n[1] - c.h);
    if (d < bd) {
      bd = d;
      best = n;
    }
  });
  const pre = c.l > 0.84 ? 'PALE ' : c.l > 0.68 ? 'LIGHT ' : c.l < 0.22 ? 'DARK ' : c.l < 0.38 ? 'DEEP ' : '';
  return pre + best[0];
}

export function usableFrom(list: string[]): string[] {
  const out = list
    .filter(v => /^#[0-9a-fA-F]{6}$/.test(String(v).trim()))
    .map(v => v.trim().toUpperCase());
  return out.length ? out : ['#888888', '#CCCCCC'];
}

export function stopsFrom(genre: GenreType, list: string[]): string[] {
  const c = usableFrom(list);
  const a = c[0];
  const b = c[1] || c[0];
  const d = c[2] || c[1] || c[0];

  switch (genre) {
    case 'Metallic':
      return [darken(a, 0.55), a, lighten(a, 0.55), a, darken(b, 0.35), lighten(b, 0.35), b];
    case 'Chrome':
      return [darken(a, 0.78), lighten(a, 0.88), darken(a, 0.18), '#FFFFFF', darken(b, 0.65), lighten(b, 0.82), darken(b, 0.22)];
    case 'Iridescent':
      return [a, lighten(b, 0.22), d, lighten(a, 0.28), b, a];
    case 'Holographic':
      return [lighten(a, 0.18), b, lighten(d, 0.12), a, lighten(b, 0.2), d];
    case 'Neon':
      return [darken(a, 0.16), a, lighten(a, 0.24), b, d, lighten(d, 0.22)];
    case 'Pastel':
      return c.map(x => lighten(x, 0.48));
    case 'Duotone':
      return [a, b];
    case 'Rainbow':
      return c.length >= 5 ? c : [a, b, d, '#FFF240', '#66E46E', '#4FA7FF'];
    default:
      return c;
  }
}

export function geoStops(cfg: { genre: GenreType; type: GradientType; colors: string[] }): string[] {
  const s = stopsFrom(cfg.genre, cfg.colors);
  return cfg.type === 'Reflected' ? s.slice().reverse().concat(s.slice(1)) : s;
}

export function validPairs(cfg: { colors: string[]; spots?: Spot[] }): [string, Spot][] {
  let out: [string, Spot][] = [];
  cfg.colors.forEach((c, i) => {
    c = String(c).trim();
    if (/^#[0-9a-fA-F]{6}$/.test(c)) {
      out.push([c.toUpperCase(), (cfg.spots && cfg.spots[i]) || SPOT_DEFAULTS[i % 8]]);
    }
  });
  if (!out.length) {
    out = [['#888888', SPOT_DEFAULTS[0]], ['#CCCCCC', SPOT_DEFAULTS[1]]];
  } else if (out.length === 1) {
    out.push([lighten(out[0][0], 0.5), SPOT_DEFAULTS[1]]);
  }
  return out.slice(0, 8);
}

export function defaultSpots(n: number): Spot[] {
  return SPOT_DEFAULTS.slice(0, n).map(p => [p[0], p[1]]);
}

export function typeIndex(t: GradientType): number {
  return TYPES.findIndex(x => x[0] === t);
}

export function genreIndex(g: GenreType): number {
  return GENRES.findIndex(x => x[0] === g);
}

export function textureIndex(t: TextureType): number {
  return TEXTURES.findIndex(x => x[0] === t);
}

export function outSize(ratio: string, custW?: number, custH?: number): { w: number; h: number } {
  if (ratio === 'custom' && custW && custH) {
    return { w: custW, h: custH };
  }
  const p = ratio.split('/').map(Number);
  if (!p[0] || !p[1]) return { w: 1600, h: 900 };
  return p[0] >= p[1]
    ? { w: EXPORT_LONG, h: Math.round((EXPORT_LONG * p[1]) / p[0]) }
    : { w: Math.round((EXPORT_LONG * p[0]) / p[1]), h: EXPORT_LONG };
}
