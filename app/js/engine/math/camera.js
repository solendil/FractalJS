import Matrix from './matrix';
import Vector from './vector';

const getSquareToComplexMatrix = (x, y, w) =>
  Matrix.GetTriangleToTriangle(1, 0, 0, 1, 0, 0, x + (w / 2), y, x, y + (w / 2), x, y);

const getScreenToSquareMatrix = (affineTransform, width, height) => {
  const p = affineTransform.transformXY(1, -1);
  const q = affineTransform.transformXY(-1, 1);
  const r = affineTransform.transformXY(-1, -1);
  if (width >= height) {
    const x1 = (width - height) / 2;
    const x2 = x1 + height;
    return Matrix.GetTriangleToTriangle(x2, height, x1, 0, x1, height,
      p.x, p.y, q.x, q.y, r.x, r.y);
  } else {
    const y1 = (height - width) / 2;
    const y2 = y1 + width;
    return Matrix.GetTriangleToTriangle(width, y2, 0, y1, 0, y2, p.x, p.y, q.x, q.y, r.x, r.y);
  }
};

// The camera projects view space on complex space and vice-verse.
// The "square" or Q is the maximum centered square that can be inscribed in the view.
// X and Y are the complex coordinates @ the center of the view
// W is the complex size of the square
// A viewport affine transformation can be applied on the square to rotate/scale/shear the view
export default class Camera {

  constructor(width, height, x, y, w, affineMatrix = Matrix.Identity()) {
    this.affineMatrix = affineMatrix;
    this.screenSize = new Vector(width, height);
    const extent = Math.min(width, height); // extent of the min square
    this.resolutionLimit = extent * 1.11e-15;
    this.x = x;
    this.y = y;
    this.w = w;
    this.reproject();
  }

  reproject() {
    this.w = Math.max(this.w, this.resolutionLimit);
    const S2Q = getScreenToSquareMatrix(this.affineMatrix, this.screenSize.x, this.screenSize.y);
    const Q2C = getSquareToComplexMatrix(this.x, this.y, this.w);
    this.matrix = Q2C.multiply(S2Q);
    this.matrix_inv = this.matrix.inverse();
  }

  // type can be "Rotation" (valuey is ignored), "Scale", "Shear"
  affineTransform(type, valuex, valuey) {
    const func = `Get${type}Matrix`;
    const transformation = Matrix[func](valuex, valuey);
    this.affineMatrix = this.affineMatrix.multiply(transformation);
    this.reproject();
  }

  affineReset() {
    this.affineMatrix = Matrix.Identity();
    this.reproject();
  }

  clone() {
    return new Camera(this.screenSize.x, this.screenSize.y,
      this.x, this.y, this.w, this.affineMatrix);
  }

  scr2cpx(v) {
    return this.matrix.transform(v);
  }

  cpx2scr(v) {
    return this.matrix_inv.transform(v);
  }

  getPos() {
    return new Vector(this.x, this.y);
  }

  setPos(pos, w) {
    this.x = pos.x;
    this.y = pos.y;
    if (w) this.w = w;
    this.reproject();
  }

  resize(width, height) {
    this.screenSize = new Vector(width, height);
    const extent = Math.min(width, height); // extent of the min square
    this.resolutionLimit = extent * 1.11e-15;
    this.reproject();
  }

  isZoomLimit() {
    return this.w <= this.resolutionLimit;
  }

}
