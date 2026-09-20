import { GradientConfig } from '../types';

export function toBase64Url(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    return encodeURIComponent(str);
  }
}

export function fromBase64Url(b64: string): string | null {
  try {
    let str = b64.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    return null;
  }
}

export function minifyState(s: any): any {
  if (!s || typeof s !== 'object') return s;
  const m: any = {
    t: s.type || 'Flow',
    c: Array.isArray(s.colors)
      ? s.colors.map((x: string) => String(x).replace(/^#/, '').toUpperCase())
      : ['FF6161', 'FFC533', '59D499']
  };

  if (s.genre && s.genre !== 'Neon') m.g = s.genre;
  if (s.texture && s.texture !== 'Smooth') m.x = s.texture;
  if (s.ratio && s.ratio !== '16/9') m.r = s.ratio;
  if (typeof s.direction === 'number' && s.direction !== 135) m.d = s.direction;
  if (typeof s.scale === 'number' && s.scale !== 50) m.s = s.scale;
  if (typeof s.distortion === 'number' && s.distortion !== 55) m.w = s.distortion;
  if (typeof s.speed === 'number' && s.speed !== 100) m.v = s.speed;
  if (typeof s.seed === 'number' && s.seed !== 7.3) m.e = s.seed;

  if (Array.isArray(s.spots) && s.spots.length) {
    m.p = s.spots.map((pt: number[]) => [
      Math.round(pt[0] * 100) / 100,
      Math.round(pt[1] * 100) / 100
    ]);
  }

  if (s.animate === false) m.a = 0;
  if (s.credit === false) m.cr = 0;

  if (s.curve && s.curve.on) {
    m.cv = {
      on: true,
      smooth: s.curve.smooth !== false,
      blend: s.curve.blend || 'mult',
      x: s.curve.x,
      y: s.curve.y
    };
  }

  if (Array.isArray(s.layers)) {
    const activeLayers = s.layers.filter(
      (l: any) => (l.kind === 'text' && String(l.textValue || '').trim()) || ((l.kind === 'shape' || l.kind === 'image') && l.imgSrc)
    );
    if (activeLayers.length > 0) {
      m.l = activeLayers;
      if (s.act != null) m.act = s.act;
    }
  }

  return m;
}

export function expandState(m: any): Partial<GradientConfig> | null {
  if (!m || typeof m !== 'object') return null;
  if (m.type && Array.isArray(m.colors)) return m;

  return {
    type: m.t || 'Flow',
    colors: (m.c || []).map((hex: string) => (hex.startsWith('#') ? hex : '#' + hex).toUpperCase()),
    genre: m.g || 'Neon',
    texture: m.x || 'Smooth',
    ratio: m.r || '16/9',
    direction: m.d != null ? m.d : 135,
    scale: m.s != null ? m.s : 50,
    distortion: m.w != null ? m.w : 55,
    speed: m.v != null ? m.v : 100,
    seed: m.e != null ? m.e : 7.3,
    spots: m.p || undefined,
    animate: m.a !== 0,
    credit: m.cr !== 0,
    curve: m.cv || undefined,
    layers: m.l || undefined,
    act: m.act || 0
  };
}

export function encodeStateToHash(state: GradientConfig): string {
  try {
    const min = minifyState(state);
    const json = JSON.stringify(min);
    return '#d=' + toBase64Url(json);
  } catch (err) {
    return '';
  }
}

export function decodeHashToState(hash?: string): Partial<GradientConfig> | null {
  try {
    const str = String(hash || (typeof location !== 'undefined' ? location.hash : '') || '');
    const match = str.match(/[#&]d=([^&]*)/);
    if (!match || !match[1]) return null;
    const raw = match[1];

    const decodedStr = fromBase64Url(raw);
    if (decodedStr && decodedStr.startsWith('{')) {
      return expandState(JSON.parse(decodedStr));
    }

    const uriDecoded = decodeURIComponent(raw);
    if (uriDecoded && uriDecoded.startsWith('{')) {
      return expandState(JSON.parse(uriDecoded));
    }
    return null;
  } catch (err) {
    return null;
  }
}
