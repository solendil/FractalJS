import Vector from "./vector";

export default class Matrix {
  public static readonly identity = new Matrix(1, 0, 0, 1, 0, 0);

  constructor(
    public readonly a: number,
    public readonly b: number,
    public readonly c: number,
    public readonly d: number,
    public readonly e: number,
    public readonly f: number,
  ) {}

  transform(v: Vector) {
    return new Vector(
      v.x * this.a + v.y * this.c + this.e,
      v.x * this.b + v.y * this.d + this.f,
    );
  }

  isIdentity() {
    return (
      this.a === 1 &&
      this.b === 0 &&
      this.c === 0 &&
      this.d === 1 &&
      this.e === 0 &&
      this.f === 0
    );
  }

  private isInvertible() {
    const deter = this.a * this.d - this.b * this.c;
    return Math.abs(deter) > 1e-15;
  }

  inverse() {
    if (!this.isInvertible()) {
      return this.inverseGaussJordan();
    }
    const dt = this.a * this.d - this.b * this.c;
    return new Matrix(
      this.d / dt,
      -this.b / dt,
      -this.c / dt,
      this.a / dt,
      (this.c * this.f - this.d * this.e) / dt,
      -(this.a * this.f - this.b * this.e) / dt,
    );
  }

  multiply(o: Matrix) {
    return new Matrix(
      this.a * o.a + this.c * o.b,
      this.b * o.a + this.d * o.b,
      this.a * o.c + this.c * o.d,
      this.b * o.c + this.d * o.d,
      this.a * o.e + this.c * o.f + this.e,
      this.b * o.e + this.d * o.f + this.f,
    );
  }

  private inverseGaussJordan() {
    function gje(M: any, c1i: any, c2i: any, f: any) {
      const c1 = M[c1i];
      const c2 = M[c2i];
      for (let i = 0; i < 6; i++) {
        c1[i] += c2[i] * f;
      }
    }

    function gjet(M: any, c1i: any, f: any) {
      const c1 = M[c1i];
      for (let i = 0; i < 6; i++) {
        c1[i] *= f;
      }
    }
    const M = [
      [this.a, this.c, this.e, 1, 0, 0],
      [this.b, this.d, this.f, 0, 1, 0],
      [0, 0, 1, 0, 0, 1],
    ];
    gje(M, 1, 2, -M[1][2]); // c2 = c2 + c3 * -f
    gje(M, 0, 2, -M[0][2]); // c1 = c1 + c3 * -e
    gje(M, 1, 0, -M[1][0] / M[0][0]);
    gje(M, 0, 1, -M[0][1] / M[1][1]);
    gjet(M, 0, 1 / M[0][0]);
    gjet(M, 1, 1 / M[1][1]);
    return new Matrix(M[0][3], M[1][3], M[0][4], M[1][4], M[0][5], M[1][5]);
  }

  toString() {
    return `${this.a} ${this.c} ${this.e}\n${this.b} ${this.d} ${this.f}\n0 0 1`;
  }

  // prettier-ignore
  static GetTriangleToTriangle(
    t1px: number, t1py: number, t1qx: number, t1qy: number, t1rx: number, t1ry: number,
    t2px: number, t2py: number, t2qx: number, t2qy: number, t2rx: number, t2ry: number
  ) {
    const STD2T1 = new Matrix(t1px - t1rx, t1py - t1ry, t1qx - t1rx, t1qy - t1ry, t1rx, t1ry);
    const STD2T2 = new Matrix(t2px - t2rx, t2py - t2ry, t2qx - t2rx, t2qy - t2ry, t2rx, t2ry);
    const T12STD = STD2T1.inverse();
    return STD2T2.multiply(T12STD);
  }

  static GetRotationMatrix(angle: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Matrix(cos, sin, -sin, cos, 0, 0);
  }

  static GetScaleMatrix(x: number, y: number) {
    return new Matrix(x, 0, 0, y, 0, 0);
  }

  static GetShearMatrix(x: number, y: number) {
    return new Matrix(1, y, x, 1, 0, 0);
  }
}
