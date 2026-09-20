import { GradientConfig } from '../../types';
import { LUMINOUS, ORGANIC } from '../../constants/catalog';
import { geoStops, validPairs, toRgb, typeIndex, genreIndex, textureIndex } from '../colors/colorMath';
import { crvStateOf, curveLut } from '../curves/curveMath';
import { VS, FS } from './shaders';
import { render2D } from '../canvas2d/fallbackRenderer';

export interface WebGLStudioRenderer {
  render: (cfg: GradientConfig, w: number, h: number, time?: number) => void;
  gl: WebGLRenderingContext;
}

export function createWebGLRenderer(canvas: HTMLCanvasElement): WebGLStudioRenderer | null {
  const gl = (
    canvas.getContext('webgl', {
      preserveDrawingBuffer: true,
      antialias: false,
      alpha: false,
      premultipliedAlpha: false
    }) ||
    canvas.getContext('experimental-webgl')
  ) as WebGLRenderingContext | null;

  if (!gl) return null;

  function compileShader(type: number, src: string): WebGLShader | null {
    const s = gl!.createShader(type);
    if (!s) return null;
    gl!.shaderSource(s, src);
    gl!.compileShader(s);
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
      console.warn('Gradiopak WebGL Shader Compile Error:', gl!.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = compileShader(gl.VERTEX_SHADER, VS);
  const fs = compileShader(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  if (!prog) return null;

  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('Gradiopak WebGL Program Link Error:', gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  const a = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(a);
  gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

  const uniformNames = [
    'u_res', 'u_time', 'u_type', 'u_genre', 'u_texture', 'u_angle',
    'u_stops', 'u_nstops', 'u_spotCol', 'u_spotPos', 'u_nspots',
    'u_freq', 'u_warp', 'u_seed', 'u_curveOn', 'u_anim', 'u_cx', 'u_cy'
  ];
  const U: Record<string, WebGLUniformLocation | null> = {};
  uniformNames.forEach(n => {
    U[n] = gl.getUniformLocation(prog, n);
  });

  const stopsBuf = new Float32Array(48);
  const colBuf = new Float32Array(24);
  const posBuf = new Float32Array(16);

  function render(cfg: GradientConfig, w: number, h: number, time?: number) {
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    gl!.viewport(0, 0, w, h);

    const stops = geoStops(cfg).slice(0, 16);
    stopsBuf.fill(0);
    stops.forEach((s, i) => {
      const c = toRgb(s);
      stopsBuf[i * 3] = c.r / 255;
      stopsBuf[i * 3 + 1] = c.g / 255;
      stopsBuf[i * 3 + 2] = c.b / 255;
    });

    const pairs = validPairs(cfg);
    colBuf.fill(0);
    posBuf.fill(0);
    pairs.forEach((p, i) => {
      const c = toRgb(p[0]);
      colBuf[i * 3] = c.r / 255;
      colBuf[i * 3 + 1] = c.g / 255;
      colBuf[i * 3 + 2] = c.b / 255;
      posBuf[i * 2] = p[1][0];
      posBuf[i * 2 + 1] = p[1][1];
    });

    const sc = (cfg.scale ?? 50) / 100;
    const ds = (cfg.distortion ?? 55) / 100;
    const warp =
      ds *
      (cfg.type === 'Flow'
        ? 1.1
        : cfg.type === 'Mesh'
        ? 0.35
        : cfg.type === 'Aurora'
        ? 1.0
        : cfg.type === 'Sky'
        ? 1.2
        : cfg.type === 'Silk'
        ? 1.0
        : LUMINOUS[cfg.type]
        ? 0.85
        : 0.6);

    gl!.uniform2f(U.u_res, w, h);
    gl!.uniform1f(U.u_time, time || 0);
    gl!.uniform1i(U.u_type, typeIndex(cfg.type));
    gl!.uniform1i(U.u_genre, genreIndex(cfg.genre));
    gl!.uniform1i(U.u_texture, textureIndex(cfg.texture));
    gl!.uniform1f(U.u_angle, ((cfg.direction || 0) * Math.PI) / 180);

    gl!.uniform3fv(U.u_stops, stopsBuf);
    gl!.uniform1i(U.u_nstops, stops.length);
    gl!.uniform3fv(U.u_spotCol, colBuf);
    gl!.uniform2fv(U.u_spotPos, posBuf);
    gl!.uniform1i(U.u_nspots, pairs.length);
    gl!.uniform1f(U.u_freq, 3.2 + (0.7 - 3.2) * sc);
    gl!.uniform1f(U.u_warp, warp);
    gl!.uniform1f(U.u_seed, cfg.seed ?? 7.3);

    const crv = crvStateOf(cfg);
    gl!.uniform1i(U.u_curveOn, crv.on ? 1 : 0);
    gl!.uniform1i(U.u_anim, cfg.animate && ORGANIC[cfg.type] ? 1 : 0);
    gl!.uniform1fv(U.u_cx, curveLut(crv.x, crv.smooth));
    gl!.uniform1fv(U.u_cy, curveLut(crv.y, crv.smooth));

    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
  }

  return { render, gl };
}

// Global offscreen singleton for thumbnail generation, share cards, and PNG/video exports
let offCanvas: HTMLCanvasElement | null = null;
let offRenderer: WebGLStudioRenderer | null = null;

export function renderOffscreen(cfg: GradientConfig, w: number, h: number, t?: number): HTMLCanvasElement {
  if (!offCanvas) {
    offCanvas = document.createElement('canvas');
    offRenderer = createWebGLRenderer(offCanvas);
  }
  if (offRenderer) {
    offRenderer.render(cfg, w, h, t || 0);
  } else {
    render2D(offCanvas, cfg, w, h);
  }
  return offCanvas;
}

export function blitTo(
  ctx: CanvasRenderingContext2D,
  cfg: GradientConfig,
  w: number,
  h: number,
  t?: number
) {
  const off = renderOffscreen(cfg, w, h, t);
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(off, 0, 0, w, h);
}
