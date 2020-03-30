export type RenderFn = (cx: number, cy: number, iter: number) => number;
export interface FractalDef {
  id: string;
  hidden?: boolean;
  uiOrder?: number;
  name: string;
  preset: {
    x: number;
    y: number;
    w: number;
    iter: number;
  };
  fn: {
    normal: RenderFn;
    smooth?: RenderFn;
  };
}

export default {
  id: "example",
  hidden: true,
  uiOrder: -1,
  name: "example",
  preset: {
    x: -0.7,
    y: 0.0,
    w: 2.5,
    iter: 50,
  },
  fn: {
    normal: (cx, cy, iter) => {
      return 0;
    },
    smooth: (cx, cy, iter) => {
      return 0;
    },
  },
} as FractalDef;
