export type GradientType =
  | 'Linear'
  | 'Radial'
  | 'Conic'
  | 'Reflected'
  | 'Diamond'
  | 'Mesh'
  | 'Freeform'
  | 'Flow'
  | 'Blade'
  | 'Orb'
  | 'Horizon'
  | 'Fiber'
  | 'Aurora'
  | 'Sky'
  | 'Silk';

export type GenreType =
  | 'Metallic'
  | 'Chrome'
  | 'Iridescent'
  | 'Holographic'
  | 'Neon'
  | 'Pastel'
  | 'Duotone'
  | 'Rainbow';

export type TextureType =
  | 'Smooth'
  | 'Grain'
  | 'Frosted'
  | 'Wave'
  | 'Wrinkle'
  | 'Paper'
  | 'Film'
  | 'Scanlines'
  | 'Weave'
  | 'Vignette';

export type Spot = [number, number];

export interface CurvePoint {
  x: number;
  y: number;
}

export interface CurveState {
  on: boolean;
  axis: 'x' | 'y';
  smooth: boolean;
  xPts: CurvePoint[];
  yPts: CurvePoint[];
  blend: 'x' | 'y' | 'mult' | 'avg' | 'add' | 'diff';
}

export type LayerKind = 'text' | 'shape' | 'image';

export interface Layer {
  id: string;
  kind: LayerKind;
  name: string;
  textValue: string;
  textColor: string;
  textSize: number;
  textWeight: string;
  textFont: string;
  textAlign: 'left' | 'center' | 'right';
  textShadow: boolean;
  x: number; // 0..100 percentage
  y: number; // 0..100 percentage
  rot: number; // -180..180
  blend: GlobalCompositeOperation;
  depth: number;
  depthColor: string;
  img?: HTMLImageElement | null;
  imgSrc?: string;
  imgLen: number;
  opacity: number;
  visible: boolean;
  lock: boolean;
  lineH: number;
  sp: number;
  flipH: boolean;
  flipV: boolean;
  shapeIdx?: number;
  shapeFill?: string;
  fill?: string;
  animType: 'none' | 'fadein' | 'fadeout' | 'fadeio' | 'spin' | 'flicker' | 'pulse' | 'slide';
  animDur: number;
  animDelay: number;
  animLoop: boolean;
  animCount: number;
  animDir: 'left' | 'right' | 'top' | 'bottom';
  animEase: 'linear' | 'easein' | 'easeout' | 'easeio';
  animOrigin: 'center' | 'left' | 'right';
  _astart?: number;
}

export interface GradientConfig {
  type: GradientType;
  genre: GenreType;
  texture: TextureType;
  colors: string[];
  spots: Spot[];
  ratio: string;
  custW?: number;
  custH?: number;
  direction: number;
  scale: number;
  distortion: number;
  speed: number;
  seed: number;
  animate: boolean;
  credit: boolean;
  curve: CurveState;
  layers: Layer[];
  act: number;
}

export interface Preset {
  name: string;
  jp: string;
  genre: GenreType;
  type: GradientType;
  texture: TextureType;
  direction: number;
  colors: string[];
  spots?: Spot[];
}

export interface UiGradientItem {
  name: string;
  colors: string[];
}
