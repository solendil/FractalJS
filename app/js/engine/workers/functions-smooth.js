/* eslint-disable
    quote-props, no-mixed-operators, no-var, one-var, no-plusplus,
    one-var-declaration-per-line, no-constant-condition, no-param-reassign
*/

// HIGH PERFORMANCE MODULE
// Use var instead of let (10* faster)

var escape = 4;
var iLog2 = 1.0 / Math.log(2.0);
var iLog4 = 1.0 / Math.log(4.0);

export default {
  'mandelbrot': (cx, cy, iter) => {
    var znx = 0, zny = 0, sqx = 0, sqy = 0, i = 0, j = 0;
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
  'mandelbrot3': (cx, cy, iter) => {
    var zx = 0, zy = 0, sqx = 0, sqy = 0, i = 0, j, znx, zny;
    while (true) {
      znx = sqx * zx - 3 * zx * sqy + cx;
      zny = 3 * sqx * zy - sqy * zy + cy;
      zx = znx;
      zy = zny;
      if (++i >= iter) break;
      sqx = zx * zx;
      sqy = zy * zy;
      if (sqx + sqy > escape) break;
    }
    if (i === iter) return i;
    for (j = 0; j < 4; ++j) {
      znx = sqx * zx - 3 * zx * sqy + cx;
      zny = 3 * sqx * zy - sqy * zy + cy;
      zx = znx;
      zy = zny;
      sqx = zx * zx;
      sqy = zy * zy;
    }
    return 5 + i - Math.log(Math.log(sqx + sqy)) * iLog4;
  },
  'mandelbrot4': (cx, cy, iter) => {
    var zx = 0, zy = 0, sqx = 0, sqy = 0, i = 0, znx, zny;
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
  'burningship': (cx, cy, iter) => {
    var zx = 0, zy = 0, sqx = 0, sqy = 0, i = 0, j, znx, zny;
    cy = -cy; // this fractal is usually represented upside down
    while (true) {
      zny = (zx + zx) * zy + cy;
      znx = sqx - sqy + cx;
      zx = Math.abs(znx);
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
      zx = Math.abs(znx);
      zy = Math.abs(zny);
      sqx = zx * zx;
      sqy = zy * zy;
    }
    return 5 + i - Math.log(Math.log(sqx + sqy)) * iLog2;
  },
};
