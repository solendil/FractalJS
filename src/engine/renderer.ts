import Scheduler from "./scheduler/scheduler";
import Redrawer from "./redrawer";
import { getFunction } from "./fractals";
import Painter from "./painter";
import Main, { Context } from "./engine";
import {
  Tile,
  WorkerResponse,
  Params,
  Model,
  DrawOrder,
} from "./scheduler/types";
import Vector from "./math/vector";

export default class Renderer {
  private readonly nbTiles: number = 100;
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
    if (this.scheduler) this.scheduler.interrupt();

    const canvas = this.ctx.canvas;
    this.imageData = this.ctx.context.createImageData(
      canvas.width,
      canvas.height,
    );
    this.imageBuffer = new Uint32Array(this.imageData.data.buffer);
    this.width = canvas.width;
    this.height = canvas.height;

    // compute tiling
    const ratio = this.width / this.height;
    const tileNbHeight = Math.round(Math.sqrt(this.nbTiles / ratio));
    const tileNbWidth = Math.round(Math.sqrt(this.nbTiles / ratio) * ratio);
    console.debug(
      `Screen ${this.width}px * ${this.height}px (ratio ${ratio.toFixed(2)}),` +
        ` ${tileNbWidth} * ${tileNbHeight} = ${tileNbHeight *
          tileNbWidth} tiles (${this.nbTiles} asked)` +
        `, each ~ ${Math.round(canvas.width / tileNbWidth)}px * ${Math.round(
          this.ctx.canvas.height / tileNbHeight,
        )}px`,
    );

    // instanciate tiles
    this.tiles = [];
    for (let j = 0; j < tileNbHeight; j += 1) {
      for (let i = 0; i < tileNbWidth; i += 1) {
        const id = this.tiles.length;
        const x1 = Math.round((i * canvas.width) / tileNbWidth);
        const x2 = Math.round(((i + 1) * canvas.width) / tileNbWidth) - 1;
        const y1 = Math.round((j * canvas.height) / tileNbHeight);
        const y2 = Math.round(((j + 1) * canvas.height) / tileNbHeight) - 1;
        const x = (x1 + x2) / 2; // center of tile
        const y = (y1 + y2) / 2;
        const width = x2 - x1 + 1;
        const height = y2 - y1 + 1;
        const buffer = new Float32Array(width * height);
        const indexScreen = y1 * canvas.width + x1;
        // prettier-ignore
        this.tiles.push({id, i, j, x1, x2, y1, y2, x, y, width, height, buffer, indexScreen});
      }
    }
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
  draw(params: Params) {
    this.ctx.event.notify("draw.start", {});
    this.scheduler.interrupt();
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
    const schedulerPromise = this.scheduler.schedule(orders).catch(() => {});
    return schedulerPromise;
  }

  callback(data: WorkerResponse) {
    if (data.action !== "end-draw") throw new Error();
    const tile = data.tile;
    this.tiles[tile.id].buffer = tile.buffer;
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
