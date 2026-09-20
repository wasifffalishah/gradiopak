import { clamp } from '../colors/colorMath';

export interface PointTV {
  t: number;
  v: number;
}

export interface StudioCurveState {
  on: boolean;
  smooth: boolean;
  blend: 'x' | 'y' | 'mult' | 'avg' | 'add' | 'diff';
  x: PointTV[];
  y: PointTV[];
}

export const CURVE_LUT = 32;
export const CURVE_MAX = 16;
export const CURVE_BLENDS = ['x', 'y', 'mult', 'avg', 'add', 'diff'] as const;
export const BLEND_IDX: Record<string, number> = {
  x: 0,
  y: 1,
  mult: 2,
  avg: 3,
  add: 4,
  diff: 5
};

export function identityCurves(): StudioCurveState {
  return {
    on: false,
    smooth: true,
    blend: 'mult',
    x: [{ t: 0, v: 0 }, { t: 1, v: 1 }],
    y: [{ t: 0, v: 0 }, { t: 1, v: 1 }]
  };
}

export function evalCurve(pts: PointTV[], smooth: boolean, t: number): number {
  const p = pts || [];
  if (p.length < 2) return clamp(t, 0, 1);
  t = clamp(t, 0, 1);
  let i = 0;
  while (i < p.length - 2 && t > p[i + 1].t) i++;

  const a = p[i];
  const b = p[i + 1];
  const span = b.t - a.t || 1e-6;
  const mu = clamp((t - a.t) / span, 0, 1);

  if (!smooth) return clamp(a.v + (b.v - a.v) * mu, 0, 1);

  const pm = i > 0 ? p[i - 1] : a;
  const p2 = i + 2 < p.length ? p[i + 2] : b;
  const mu2 = mu * mu;
  const mu3 = mu2 * mu;

  const v =
    0.5 *
    (2 * a.v +
      (-pm.v + b.v) * mu +
      (2 * pm.v - 5 * a.v + 4 * b.v - p2.v) * mu2 +
      (-pm.v + 3 * a.v - 3 * b.v + p2.v) * mu3);

  return clamp(v, 0, 1);
}

export function curveLut(pts: PointTV[], smooth: boolean): Float32Array {
  const out = new Float32Array(CURVE_LUT);
  for (let i = 0; i < CURVE_LUT; i++) {
    out[i] = evalCurve(pts, smooth, i / (CURVE_LUT - 1));
  }
  return out;
}

export function crvPoints(list: any, fb: PointTV[]): PointTV[] {
  if (!Array.isArray(list) || list.length < 2) {
    return fb.map(p => ({ t: p.t, v: p.v }));
  }
  let q = list
    .slice(0, CURVE_MAX)
    .map(p => ({
      t: clamp(Number(p.t !== undefined ? p.t : p.x) || 0, 0, 1),
      v: clamp(Number(p.v !== undefined ? p.v : p.y) || 0, 0, 1)
    }))
    .sort((a, b) => a.t - b.t);

  const out: PointTV[] = [];
  q.forEach(p => {
    if (!out.length || p.t - out[out.length - 1].t > 1e-4) {
      out.push(p);
    }
  });
  q = out;

  if (q[0].t > 0) q.unshift({ t: 0, v: q[0].v });
  if (q[q.length - 1].t < 1) q.push({ t: 1, v: q[q.length - 1].v });
  q[0].t = 0;
  q[q.length - 1].t = 1;
  return q;
}

export function crvStateOf(cfg: any): StudioCurveState {
  const c = cfg && cfg.curve;
  const id = identityCurves();
  return {
    on: !!(c && c.on),
    smooth: c ? c.smooth !== false : true,
    blend: CURVE_BLENDS.indexOf(c && c.blend) >= 0 ? c.blend : 'mult',
    x: crvPoints(c && (c.x || c.xPts), id.x),
    y: crvPoints(c && (c.y || c.yPts), id.y)
  };
}

export function curveT(blend: string, vx: number, vy: number): number {
  if (blend === 'x') return vx;
  if (blend === 'y') return vy;
  if (blend === 'avg') return (vx + vy) / 2;
  if (blend === 'add') return Math.min(1, vx + vy);
  if (blend === 'diff') return Math.abs(vx - vy);
  return vx * vy;
}
