import Engine from "./engine";
import Vector from "./math/vector";
import { Root } from "../redux/reducer";

const cross = (pos: Vector, context: CanvasRenderingContext2D) => {
  const size = 20;
  context.beginPath();
  context.moveTo(pos.x - size, pos.y);
  context.lineTo(pos.x + size, pos.y);
  context.moveTo(pos.x, pos.y - size);
  context.lineTo(pos.x, pos.y + size);
  context.stroke();
};

const pois = [
  {
    name: "Dendrites",
    x: -1.7103484405026763,
    y: 0.0026152527321111987,
    w: 0.0007340000460450587,
  },
  {
    name: "Elephant",
    x: 0.2825978775030779,
    y: -0.010978200650106018,
    w: 0.005987463867743684,
  },
];

export default class Pois {
  private context: CanvasRenderingContext2D;

  constructor(
    public canvas: HTMLCanvasElement,
    private engine: Engine,
    private getState: () => Root,
  ) {
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  draw() {
    return;
    const cam = this.engine.ctx.camera;
    this.canvas.hidden = false;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.lineWidth = 2;
    this.context.strokeStyle = "#00FF00";

    for (let poi of pois) {
      const { x, y, w } = poi;
      const p0 = cam.cpx2scr(new Vector(0, 0)).x;
      const pw = cam.cpx2scr(new Vector(poi.w, 0)).x;
      const scrWidth = pw - p0;
      const pc = cam.cpx2scr(new Vector(x, y));
      if (scrWidth < 30) {
        cross(pc, this.context);
      } else {
        const pa = cam.cpx2scr(new Vector(x - w / 2, y - w / 2));
        const pb = cam.cpx2scr(new Vector(x + w / 2, y + w / 2));
        this.context.beginPath();
        this.context.rect(pa.x, pa.y, pb.x - pa.x, pb.y - pa.y);
        this.context.stroke();
      }
    }
  }
}
