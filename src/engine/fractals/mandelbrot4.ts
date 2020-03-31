import { FractalDef } from "./example";

const escape = 4;
var iLog4 = 1.0 / Math.log(4.0);

export default {
  fractalId: "mandelbrot4",
  uiOrder: 4,
  name: "Multibrot *4",
  preset: { x: 0.0, y: 0.0, w: 3.0, iter: 50 },
  fn: {
    normal: (cx, cy, iter) => {
      var zx = 0,
        zy = 0,
        sqx = 0,
        sqy = 0,
        i = 0,
        znx,
        zny;
      while (true) {
        znx = sqx * sqx - 6 * sqx * sqy + sqy * sqy + cx;
        zny = 4 * sqx * zx * zy - 4 * zx * sqy * zy + cy;
        zx = znx;
        zy = zny;
        if (++i >= iter) break;
        sqx = zx * zx;
        sqy = zy * zy;
        if (sqx + sqy > escape) break;
      }
      return i;
    },
    smooth: (cx, cy, iter) => {
      var zx = 0,
        zy = 0,
        sqx = 0,
        sqy = 0,
        i = 0,
        znx,
        zny;
      while (true) {
        znx = sqx * sqx - 6 * sqx * sqy + sqy * sqy + cx;
        zny = 4 * sqx * zx * zy - 4 * zx * sqy * zy + cy;
        zx = znx;
        zy = zny;
        if (++i >= iter) break;
        sqx = zx * zx;
        sqy = zy * zy;
        if (sqx + sqy > escape) break;
      }
      if (i === iter) return i;
      return 5 + i - Math.log(Math.log(sqx + sqy)) * iLog4;
    },
  },
} as FractalDef;
