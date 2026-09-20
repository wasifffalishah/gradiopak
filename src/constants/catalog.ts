import { GradientConfig, Spot } from '../types';

export const GENRES: [string, string][] = [
  ["Metallic", "metallic"],
  ["Chrome", "chrome"],
  ["Iridescent", "iridescent"],
  ["Holographic", "holographic"],
  ["Neon", "neon"],
  ["Pastel", "pastel"],
  ["Duotone", "duotone"],
  ["Rainbow", "rainbow"]
];

export const TYPES: [string, string][] = [
  ["Linear", "linear"],
  ["Radial", "radial"],
  ["Conic", "conic"],
  ["Reflected", "reflected"],
  ["Diamond", "diamond"],
  ["Mesh", "multi-point"],
  ["Freeform", "freeform"],
  ["Flow", "flow"],
  ["Blade", "blade"],
  ["Orb", "orb"],
  ["Horizon", "horizon"],
  ["Fiber", "fiber"],
  ["Aurora", "aurora"],
  ["Sky", "sky"],
  ["Silk", "silk"]
];

export const TYPE_ORDER = [
  "Flow", "Aurora", "Sky", "Silk", "Mesh", "Freeform",
  "Blade", "Orb", "Horizon", "Fiber", "Linear", "Radial",
  "Conic", "Reflected", "Diamond"
];

export const TYPE_NOTE: Record<string, string> = {
  Flow: "Noise-distorted fluid vortex. Drag rings to position color spots. Animates continuously.",
  Sky: "Atmospheric rolling cloudscape with wind currents, simplex warp, and color burn strata.",
  Silk: "3D draped satin fabric with raymarched self-shadows, curvature gleams, and weave micro-threads.",
  Mesh: "Multi-point gradient with soft blending.",
  Freeform: "Crisp color blobs freely placed.",
  Linear: "Basic directional gradient. Exports to CSS exactly.",
  Radial: "Expands from center.",
  Conic: "Rotates around center.",
  Reflected: "Symmetrical fold from middle.",
  Diamond: "Expands as diamond.",
  Blade: "Light blade cutting through darkness. Drag ring to move tip.",
  Orb: "Glowing ring floating in dark. Drag ring to move center.",
  Horizon: "Glowing sphere edge above, dotted wave below.",
  Fiber: "Radiating light filaments from curve."
};

export const LUMINOUS: Record<string, number> = { Blade: 1, Orb: 1, Horizon: 1, Fiber: 1 };
export const FULLFIELD: Record<string, number> = { Aurora: 1, Sky: 1, Silk: 1 };

export const TEXTURES: [string, string][] = [
  ["Smooth", "smooth"],
  ["Grain", "grain"],
  ["Frosted", "frosted"],
  ["Wave", "wave"],
  ["Wrinkle", "wrinkle"],
  ["Paper", "paper"],
  ["Film", "film"],
  ["Scanlines", "scanlines"],
  ["Weave", "weave"],
  ["Vignette", "vignette"]
];

export const RATIOS: [string, string][] = [
  ["16:9", "16/9"],
  ["1:1", "1/1"],
  ["4:5", "4/5"],
  ["3:2", "3/2"],
  ["9:16", "9/16"],
  ["21:9", "21/9"]
];

export const COMPASS: (number | null)[] = [315, 0, 45, 270, null, 90, 225, 180, 135];
export const ANGLED: Record<string, number> = {
  Linear: 1, Reflected: 1, Conic: 1, Flow: 1, Blade: 1, Orb: 1, Horizon: 1, Fiber: 1, Aurora: 1, Sky: 1, Silk: 1
};
export const ORGANIC: Record<string, number> = {
  Mesh: 1, Freeform: 1, Flow: 1, Blade: 1, Orb: 1, Horizon: 1, Fiber: 1, Aurora: 1, Sky: 1, Silk: 1
};

export const SPOT_DEFAULTS: Spot[] = [
  [0.2, 0.26],
  [0.8, 0.22],
  [0.72, 0.8],
  [0.24, 0.76],
  [0.5, 0.5],
  [0.5, 0.1],
  [0.92, 0.55],
  [0.08, 0.5]
];

export const EXPORT_LONG = 1600;

export const DEFAULT_CONFIG: GradientConfig = {
  type: "Flow",
  genre: "Neon",
  texture: "Smooth",
  colors: ["#FF5E62", "#FF9966", "#FFD194"],
  spots: [[0.2, 0.26], [0.8, 0.22], [0.72, 0.8]],
  ratio: "16/9",
  custW: 1600,
  custH: 900,
  direction: 135,
  scale: 50,
  distortion: 55,
  speed: 100,
  seed: 7.3,
  animate: true,
  credit: true,
  curve: {
    on: false,
    axis: 'x',
    smooth: true,
    xPts: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
    yPts: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
    blend: 'mult'
  },
  layers: [
    {
      id: 'default-layer-1',
      kind: 'text',
      name: 'Text 1',
      textValue: '',
      textColor: '#FFFFFF',
      textSize: 110,
      textWeight: '400',
      textFont: 'Instrument Serif',
      textAlign: 'center',
      textShadow: true,
      x: 50,
      y: 50,
      rot: 0,
      blend: 'source-over',
      depth: 0,
      depthColor: '#000000',
      imgLen: 360,
      opacity: 1,
      visible: false,
      lock: false,
      lineH: 1.18,
      sp: 0,
      flipH: false,
      flipV: false,
      animType: 'none',
      animDur: 1.5,
      animDelay: 0,
      animLoop: true,
      animCount: 0,
      animDir: 'left',
      animEase: 'linear',
      animOrigin: 'center'
    }
  ],
  act: 0
};
