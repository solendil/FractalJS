/* eslint-disable
    no-mixed-operators, no-var, one-var, no-plusplus,
    one-var-declaration-per-line, no-constant-condition, no-param-reassign
*/

const escape = 4;

export default {
  id: 'tippetts',
  uiOrder: 1,
  numericalId: 3,
  name: 'Tippetts',
  preset: { x: -0.2, y: 0.0, w: 4, iter: 50 },
  fn: {
    normal: (cx, cy, iter) => {
      var zx = 0, zy = 0, sqx = 0, sqy = 0, i = 0;
      for (; i < iter && sqx + sqy <= escape; ++i) {
        zx = sqx - sqy + cx;
        zy = (zx + zx) * zy + cy;
        sqx = zx * zx;
        sqy = zy * zy;
      }
      return i;
    },
  },
};

