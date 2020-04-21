import { FractalDef } from "./example";

const escape = 4;
var iLog2 = 1.0 / Math.log(2.0);

const refx = 0.5667;
const refy = -0.5;

export default {
  fractalId: "phoenixex1",
  uiOrder: 6,
  name: "Phoenix",
  preset: { x: -0.7, y: -0.05, w: 1.6, iter: 250 },
  fn: {
    normal: function (cx, cy, iter) {
      var x = -cy,
        y = cx,
        xm1 = 0,
        ym1 = 0;
      var sx = 0,
        sy = 0,
        i = 0;
      var xp1;
      var yp1;
      for (; i < iter && sx + sy <= escape; ++i) {
        xp1 = x * x - y * y + refx + refy * xm1;
        yp1 = 2 * x * y + refy * ym1;
        sx = xp1 * xp1;
        sy = yp1 * yp1;
        xm1 = x;
        ym1 = y;
        x = xp1;
        y = yp1;
      }
      return i;
    },

    smooth: function (cx, cy, iter) {
      var x = -cy,
        y = cx,
        xm1 = 0,
        ym1 = 0;
      var sx = 0,
        sy = 0,
        i = 0;
      var xp1;
      var yp1;
      for (; i < iter && sx + sy <= escape; ++i) {
        xp1 = x * x - y * y + refx + refy * xm1;
        yp1 = 2 * x * y + refy * ym1;
        sx = xp1 * xp1;
        sy = yp1 * yp1;
        xm1 = x;
        ym1 = y;
        x = xp1;
        y = yp1;
      }
      if (i === iter) {
        return i;
      }
      for (var j = 0; j < 4; ++j) {
        xp1 = x * x - y * y + refx + refy * xm1;
        yp1 = 2 * x * y + refy * ym1;
        sx = xp1 * xp1;
        sy = yp1 * yp1;
        xm1 = x;
        ym1 = y;
        x = xp1;
        y = yp1;
      }
      var res = 5 + i - Math.log(Math.log(x * x + y * y)) * iLog2;
      return res;
    },
  },
} as FractalDef;
