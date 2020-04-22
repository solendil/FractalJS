import Scheduler from "./scheduler/scheduler";
import Redrawer from "./redrawer";
import { getFunction } from "./fractals";
import Painter from "./painter";
import Main, { Context } from "./engine";
import {
  WorkerResponse,
  DrawParams,
  Model,
  DrawOrder,
} from "./scheduler/types";
import Vector from "./math/vector";
import { Tile } from "./tile";

export default class Renderer {
  private readonly ctx: Context;

  private painter: Painter;
  private scheduler: Scheduler;
  private redrawer: Redrawer;

  private width!: number;
  private height!: number;
  private imageData!: ImageData;
  private imageBuffer!: Uint32Array;

  private tiles!: Tile[];

  constructor(ctx: Context, painter: Painter, engine: Main) {
    this.ctx = ctx;
    this.resize();
    this.callback = this.callback.bind(this);
    this.scheduler = new Scheduler(ctx, this.callback);
    this.painter = painter;
    this.redrawer = new Redrawer(ctx);
  }

  resize() {
    const canvas = this.ctx.canvas;
    this.imageData = this.ctx.context.createImageData(
      canvas.width,
      canvas.height,
    );
    this.imageBuffer = new Uint32Array(this.imageData.data.buffer);
    this.width = canvas.width;
    this.height = canvas.height;
    this.tiles = Tile.getTiling(this.width, this.height);
  }

  getIterationsAt(cpx: Vector) {
    const func = getFunction(this.ctx.fractalId, this.ctx.smooth);
    return func(cpx.x, cpx.y, this.ctx.iter);
  }

  getHistogram(): number[] {
    const histogram = new Array(this.ctx.iter + 1).fill(0);
    for (const tile of this.tiles) {
      for (let i in tile.buffer) {
        const val = Math.round(tile.buffer[i]);
        if (val >= 0 && val <= this.ctx.iter) histogram[val] += 1;
      }
    }
    return histogram;
  }

  // redraws the current float buffer
  drawColor() {
    this.ctx.event.notify("draw.redraw", {});
    this.tiles.forEach(tile => {
      this.painter.paint(tile, this.imageBuffer, this.width);
    });
    this.ctx.context.putImageData(
      this.imageData,
      0,
      0,
      0,
      0,
      this.width,
      this.height,
    );
  }

  // performs a full draw: floatbuffer + colors
  draw(params: DrawParams) {
    this.ctx.event.notify("draw.start", {});
    const redraw = this.redrawer.redraw;
    let tileSort: ReturnType<typeof redraw>;
    if (this.redrawer)
      tileSort = this.redrawer.redraw(
        this.ctx.camera.matrix,
        this.ctx.fractalId,
        params.id || -1,
      );
    const workerModel: Model = Object.assign({}, this.ctx.camera.matrix, {
      type: this.ctx.fractalId,
      smooth: this.ctx.smooth,
      iter: this.ctx.iter,
    });
    const orders: DrawOrder[] = this.tiles.map(tile => ({
      action: "draw",
      tile,
      params,
      model: workerModel,
    }));
    // if redrawer was able to find a tile sorting, sort them
    if (tileSort) {
      orders.forEach(t => {
        t.dist = Math.sqrt(
          (t.tile.x - tileSort!.x) ** 2 + (t.tile.y - tileSort!.y) ** 2,
        );
      });
      orders.sort((a, b) =>
        // @ts-ignore
        tileSort!.reverse ? b.dist - a.dist : a.dist - b.dist,
      );
    }
    const schedulerPromise = this.scheduler.schedule(orders); // .catch(() => {});
    return schedulerPromise;
  }

  callback(data: WorkerResponse) {
    if (data.action !== "end-draw") throw new Error();
    const tile = data.tile;
    this.painter.paint(tile, this.imageBuffer, this.width);
    this.ctx.context.putImageData(
      this.imageData,
      0,
      0,
      tile.x1,
      tile.y1,
      tile.width,
      tile.height,
    );
  }
}
