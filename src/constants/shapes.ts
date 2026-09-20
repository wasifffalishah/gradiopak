export interface ShapeMeta {
  id: number;
  name: string;
  file: string;
  path: string;
}

export const SHAPES_COUNT = 72;

export const SHAPES: ShapeMeta[] = Array.from({ length: SHAPES_COUNT }, (_, i) => {
  const num = i + 1;
  return {
    id: num,
    name: `Shape ${num}`,
    file: `Shape ${num}.svg`,
    path: `/shapes/Shape ${num}.svg`
  };
});
