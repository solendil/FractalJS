/*
 * The camera projects screen space on complex space and vice-versa
 */
FractalJS.Camera = function () {
  "use strict";

  var util = FractalJS.util;

  var matrix = null;
  var matrix_inv = null;
  var cam = this; //javascript and "this"... sigh...

  this.width = 100;
  this.height = 100;
  this.x = 0;
  this.y = 0;
  this.w = 0;
  this.pixelOnP = 0;
  this.viewportMatrix = util.Matrix.Identity();

  var getScreenToSquareMatrix = function (width, height) {
    var p = cam.viewportMatrix.applyTo(1, -1);
    var q = cam.viewportMatrix.applyTo(-1, 1);
    var r = cam.viewportMatrix.applyTo(-1, -1);

    if (width >= height) {
      var x1 = (width - height) / 2,
        x2 = x1 + height;
      return util.Matrix.GetTriangleToTriangle(x2, height, x1, 0, x1, height, p.x, p.y, q.x, q.y, r.x, r.y);
    } else {
      var y1 = (height - width) / 2,
        y2 = y1 + width;
      return util.Matrix.GetTriangleToTriangle(width, y2, 0, y1, 0, y2, p.x, p.y, q.x, q.y, r.x, r.y);
    }
  };

  var getSquareToComplexMatrix = function (x, y, w) {
    return util.Matrix.GetTriangleToTriangle(1, 0, 0, 1, 0, 0, x + w / 2, y, x, y + w / 2, x, y);
  };

  // project is called whenever the camera changes; it computes new projection parameters
  this.project = function () {
    // precision limit is ten times the nb of pixels times double precision
    var extent = Math.min(this.width, this.height);
    var limit = extent * 1.11e-15;
    if (this.w < limit) {
      this.w = limit;
    }
    this.pixelOnP = this.w / extent;

    // matrix stuff
    var S2Q = getScreenToSquareMatrix(this.width, this.height);
    var Q2C = getSquareToComplexMatrix(this.x, this.y, this.w);
    matrix = Q2C.multiply(S2Q);
    matrix_inv = matrix.inverse();
  };

  this.setSize = function (width, height) {
    this.width = width;
    this.height = height;
    this.project();
  };

  this.transformViewport = function (type, value) {
    var m;
    switch (type) {
    case "rotate":
      m = util.Matrix.GetRotationMatrix(value);
      break;
    case "scaleX":
      m = util.Matrix.GetScaleMatrix(value, 1);
      break;
    case "scaleY":
      m = util.Matrix.GetScaleMatrix(1, value);
      break;
    case "shearX":
      m = util.Matrix.GetShearMatrix(value, 0);
      break;
    case "shearY":
      m = util.Matrix.GetShearMatrix(0, value);
      break;
    default:
      throw "what? " + type;
    }
    this.viewportMatrix = this.viewportMatrix.multiply(m);
    this.project();
    if (type === "scaleX" || type === "scaleY") {
      return m.inverse();
    } else {
      return m;
    }
  };

  this.resetViewport = function (type, value) {
    this.viewportMatrix = util.Matrix.Identity();
    this.project();
  };

  this.setXYW = function (x, y, w) {
    this.x = x;
    this.y = y;
    if (w) {
      this.w = w;
    }
    this.project();
  };

  // screen to complex
  this.S2C = function (x, y) {
    return matrix.applyTo(x, y);
  };

  // complex to screen
  this.C2S = function (x, y) {
    return matrix_inv.applyTo(x, y);
  };

  // returns a serialisable object
  this.getWorkerModel = function () {
    return {
      pixelOnP: this.pixelOnP,
      a: matrix.a,
      b: matrix.b,
      c: matrix.c,
      d: matrix.d,
      e: matrix.e,
      f: matrix.f
    };
  };

  this.clone = function () {
    var res = new FractalJS.Camera();
    res.width = this.width;
    res.height = this.height;
    res.x = this.x;
    res.y = this.y;
    res.w = this.w;
    res.angle = this.angle;
    res.scaleX = this.scaleX;
    res.viewportMatrix = this.viewportMatrix.clone();
    res.project();
    return res;
  };

};
