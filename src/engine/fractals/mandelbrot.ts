import { FractalDef } from "./example";

const escape = 4;
var iLog2 = 1.0 / Math.log(2.0);

export default {
  id: "mandelbrot",
  uiOrder: 0,
  name: "Mandelbrot",
  preset: { x: -0.7, y: 0.0, w: 2.5, iter: 50 },
  fn: {
    normal: (cx, cy, iter) => {
      var znx = 0,
        zny = 0,
        sqx = 0,
        sqy = 0,
        i = 0;
      for (; i < iter && sqx + sqy <= escape; ++i) {
        zny = (znx + znx) * zny + cy;
        znx = sqx - sqy + cx;
        sqx = znx * znx;
        sqy = zny * zny;
      }
      return i;
    },
    smooth: (cx, cy, iter) => {
      var znx = 0,
        zny = 0,
        sqx = 0,
        sqy = 0,
        i = 0,
        j = 0;
      for (; i < iter && sqx + sqy <= escape; ++i) {
        zny = (znx + znx) * zny + cy;
        znx = sqx - sqy + cx;
        sqx = znx * znx;
        sqy = zny * zny;
      }
      if (i === iter) return i;
      for (j = 0; j < 4; ++j) {
        zny = (znx + znx) * zny + cy;
        znx = sqx - sqy + cx;
        sqx = znx * znx;
        sqy = zny * zny;
      }
      return 5 + i - Math.log(Math.log(sqx + sqy)) * iLog2;
    },
  },
} as FractalDef;
