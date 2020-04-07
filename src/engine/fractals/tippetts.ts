import { FractalDef } from "./example";

const escape = 4;

export default {
  fractalId: "tippetts",
  uiOrder: 1,
  name: "Tippetts",
  preset: { x: -0.5, y: 0.0, w: 4, iter: 50 },
  fn: {
    normal: (cx, cy, iter) => {
      var zx = 0,
        zy = 0,
        sqx = 0,
        sqy = 0,
        i = 0;
      for (; i < iter && sqx + sqy <= escape; ++i) {
        zx = sqx - sqy + cx;
        zy = (zx + zx) * zy + cy;
        sqx = zx * zx;
        sqy = zy * zy;
      }
      return i;
    },
  },
} as FractalDef;
