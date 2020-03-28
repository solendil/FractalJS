/* eslint-disable
    no-mixed-operators, no-var, one-var, no-plusplus,
    one-var-declaration-per-line, no-constant-condition, no-param-reassign
*/

const escape = 4;
var iLog2 = 1.0 / Math.log(2.0);

export default {
  id: 'burningbird',
  uiOrder: 2.5,
  name: 'Burning Bird',
  preset: { x: -0.46, y: 0.07, w: 3.26, iter: 50 },
  fn: {
    normal: (cx, cy, iter) => {
      var zx = 0, zy = 0, sqx = 0, sqy = 0, i = 0, znx, zny;
      cy = -cy; // this fractal is usually represented upside down
      while (true) {
        zny = (zx + zx) * zy + cy;
        znx = sqx - sqy + cx;
        zx = znx;
        zy = Math.abs(zny);
        if (++i >= iter) break;
        sqx = zx * zx;
        sqy = zy * zy;
        if (sqx + sqy > escape) break;
      }
      return i;
    },
    smooth: (cx, cy, iter) => {
      var zx = 0, zy = 0, sqx = 0, sqy = 0, i = 0, j, znx, zny;
      cy = -cy; // this fractal is usually represented upside down
      while (true) {
        zny = (zx + zx) * zy + cy;
        znx = sqx - sqy + cx;
        zx = znx;
        zy = Math.abs(zny);
        if (++i >= iter) break;
        sqx = zx * zx;
        sqy = zy * zy;
        if (sqx + sqy > escape) break;
      }
      if (i === iter) return i;
      for (j = 0; j < 4; ++j) {
        zny = (zx + zx) * zy + cy;
        znx = sqx - sqy + cx;
        zx = znx;
        zy = Math.abs(zny);
        sqx = zx * zx;
        sqy = zy * zy;
      }
      return 5 + i - Math.log(Math.log(sqx + sqy)) * iLog2;
    },
  },
};

