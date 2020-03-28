/* eslint-disable
    no-mixed-operators, no-var, one-var, no-plusplus,
    one-var-declaration-per-line, no-constant-condition, no-param-reassign
*/

export default {
  id: 'example',      // mandatory id of the fractal set, must be unique
  numericalId: -1,    // optional numerical ID, used for compatibility with previous FJS URLs
  hidden: true,       // optional flag to hide this fractal from UI
  uiOrder: -1,        // optional display order; if two fractals have same order, unspecified
  name: '<b>ex</b>',  // mandatory HTML display name
  preset: {           // mandatory parameters preset when displaying the fractal
    x: -0.7, y: 0.0, w: 2.5, iter: 50 },
  fn: {
    normal: (cx, cy, iter) => {   // mandatory normal function
      return 0;
    },
    smooth: (cx, cy, iter) => {   // optional 'smoothed' function
      return 0;
    },
  },
};

