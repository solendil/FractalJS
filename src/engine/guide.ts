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

export default class Guide {
  private context: CanvasRenderingContext2D;

  constructor(
    public canvas: HTMLCanvasElement,
    private engine: Engine,
    private getState: () => Root,
  ) {
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  draw() {
    const guide = this.getState().guide;
    if (!guide.active) {
      this.canvas.hidden = true;
      return;
    }

    this.canvas.hidden = false;
    const cam = this.engine.ctx.camera;
    const scr = cam.cpx2scr(new Vector(guide.x, guide.y));
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.lineWidth = 3;
    this.context.strokeStyle = "#000000";
    cross(scr.plus(new Vector(3, 3)), this.context);
    this.context.strokeStyle = "#FFFFFF";
    cross(scr, this.context);
  }
}
