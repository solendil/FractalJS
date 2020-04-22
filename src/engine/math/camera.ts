import Matrix from "./matrix";
import Vector from "./vector";

// prettier-ignore
const getSquareToComplexMatrix = (x: number, y: number, w: number) =>
  Matrix.GetTriangleToTriangle(
    1, 0, 0, 1, 0, 0,
    x + w / 2, y, x, y + w / 2, x, y);

export type AffineTransform = "rotation" | "scale" | "shear";

const getScreenToSquareMatrix = (
  viewportTransform: Matrix,
  width: number,
  height: number,
) => {
  const p = viewportTransform.transform(new Vector(1, -1));
  const q = viewportTransform.transform(new Vector(-1, 1));
  const r = viewportTransform.transform(new Vector(-1, -1));
  if (width >= height) {
    const x1 = (width - height) / 2;
    const x2 = x1 + height;
    // prettier-ignore
    return Matrix.GetTriangleToTriangle(
      x2, height, x1, 0, x1, height,
      p.x, p.y, q.x, q.y, r.x, r.y);
  } else {
    const y1 = (height - width) / 2;
    const y2 = y1 + width;
    // prettier-ignore
    return Matrix.GetTriangleToTriangle(
      width, y2, 0, y1, 0, y2,
      p.x, p.y, q.x, q.y, r.x, r.y);
  }
};

// The camera projects view space on complex space and vice-verse.
// The "square" or Q is the maximum centered square that can be inscribed in the view.
// X and Y are the complex coordinates @ the center of the view
// W is the complex size of the square
// A viewport affine transformation can be applied on the square to rotate/scale/shear the view
export default class Camera {
  private matrix_inv: Matrix;
  public matrix: Matrix;
  public viewportMatrix: Matrix;
  public screen: Vector;
  public resolutionLimit: number;
  public pos: Vector;
  public w: number;

  constructor(
    screenSize: Vector,
    pos: Vector,
    w: number,
    viewportMatrix = Matrix.identity,
  ) {
    this.viewportMatrix = viewportMatrix;
    this.screen = screenSize;
    const extent = screenSize.minVal();
    this.resolutionLimit = extent * 1.11e-15;
    this.pos = pos;
    this.w = w;
    this.matrix = Matrix.identity;
    this.matrix_inv = Matrix.identity;
    this.reproject();
  }

  reproject() {
    this.w = Math.max(this.w, this.resolutionLimit);
    const S2Q = getScreenToSquareMatrix(
      this.viewportMatrix,
      this.screen.x,
      this.screen.y,
    );
    const Q2C = getSquareToComplexMatrix(this.pos.x, this.pos.y, this.w);
    this.matrix = Q2C.multiply(S2Q);
    this.matrix_inv = this.matrix.inverse();
  }

  clone() {
    return new Camera(this.screen, this.pos, this.w, this.viewportMatrix);
  }

  scr2cpx(v: Vector) {
    return this.matrix.transform(v);
  }

  cpx2scr(v: Vector) {
    return this.matrix_inv.transform(v);
  }

  getPos() {
    return this.pos;
  }

  setPos(pos: Vector, w?: number) {
    this.pos = pos;
    if (w) this.w = w;
  }

  resize(width: number, height: number) {
    this.screen = new Vector(width, height);
    const extent = Math.min(width, height); // extent of the min square
    this.resolutionLimit = extent * 1.11e-15;
    this.reproject();
  }

  isZoomLimit() {
    return this.w <= this.resolutionLimit;
  }
}
