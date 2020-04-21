import { FractalDef } from "./example";

const escape = 4;
const iLog2 = 1.0 / Math.log(2.0);

const refx = 0.285;
const refy = 0.01;

export default {
  fractalId: "juliaex1",
  uiOrder: 5,
  name: "Julia",
  preset: {
    x: 0.0,
    y: 0.0,
    w: 2.2,
    iter: 50,
  },
  fn: {
    normal: function (cx, cy, iter) {
      var znx = cx,
        zny = cy,
        sqx = cx * cx,
        sqy = cy * cy,
        i = 0;
      for (; i < iter && sqx + sqy <= escape; ++i) {
        zny = (znx + znx) * zny + refy;
        znx = sqx - sqy + refx;
        sqx = znx * znx;
        sqy = zny * zny;
      }
      return i;
    },
    smooth: function (cx, cy, iter) {
      var znx = cx,
        zny = cy,
        sqx = cx * cx,
        sqy = cy * cy,
        i = 0,
        j = 0;
      for (; i < iter && sqx + sqy <= escape; ++i) {
        zny = (znx + znx) * zny + refy;
        znx = sqx - sqy + refx;
        sqx = znx * znx;
        sqy = zny * zny;
      }
      if (i === iter) {
        return i;
      }
      for (j = 0; j < 4; ++j) {
        zny = (znx + znx) * zny + refy;
        znx = sqx - sqy + refx;
        sqx = znx * znx;
        sqy = zny * zny;
      }
      var res = 5 + i - Math.log(Math.log(sqx + sqy)) * iLog2;
      return res;
    },
  },
} as FractalDef;
