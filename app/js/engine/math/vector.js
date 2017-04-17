
export default class Vector {
  constructor(...args) {
    if (args.length === 2) {
      this.x = args[0];
      this.y = args[1];
    } else {
      this.x = args[0].x;
      this.y = args[0].y;
    }
  }

  midPoint(v2) {
    return new Vector((v2.x + this.x) / 2, (v2.y + this.y) / 2);
  }

  minus(v) {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  plus(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  times(v) {
    return (v instanceof Vector)
      ? new Vector(this.x * v.x, this.y * v.y)
      : new Vector(this.x * v, this.y * v);
  }
}
