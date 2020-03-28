export default class Vector {
  public readonly x: number;
  public readonly y: number;

  constructor(x: Vector | number, y?: number) {
    if (x instanceof Vector) {
      this.x = x.x;
      this.y = x.y;
    } else {
      this.x = x;
      this.y = y as number;
    }
  }

  midPoint(v2: Vector) {
    return new Vector((v2.x + this.x) / 2, (v2.y + this.y) / 2);
  }

  minus(v: Vector) {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  plus(v: Vector) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  times(v: Vector | number) {
    return v instanceof Vector
      ? new Vector(this.x * v.x, this.y * v.y)
      : new Vector(this.x * v, this.y * v);
  }
}
