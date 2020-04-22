/* global navigator */
import EventBus from "../util/EventBus";
import Renderer from "./renderer";
import Painter, { PainterArgs } from "./painter";
import Camera from "./math/camera";
import Vector from "./math/vector";
import { DrawParams } from "./scheduler/types";
import Matrix, { RawMatrix } from "./math/matrix";

export interface Context {
  readonly canvas: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;
  readonly event: EventBus;
  readonly nbThreads: number;
  readonly camera: Camera;
  smooth: boolean;
  iter: number;
  fractalId: string;
}

interface Params {
  fractalId: string;
  smooth: boolean;
  iter: number;
  x: number;
  y: number;
  w: number;
  painter: PainterArgs;
  viewport: RawMatrix;
}

export default class Engine {
  public readonly ctx: Context;
  public readonly painter: Painter;

  private renderer: Renderer;
  private paramsFetcher: () => Params;

  constructor(canvas: HTMLCanvasElement, paramsFetcher: () => Params) {
    this.paramsFetcher = paramsFetcher;
    const params = paramsFetcher();
    let nbThreads = navigator.hardwareConcurrency || 4;
    if (nbThreads >= 6) nbThreads--; // sacrifice a thread for responsiveness if we have enough
    this.ctx = {
      // readonly
      canvas: canvas,
      context: canvas.getContext("2d") as CanvasRenderingContext2D,
      nbThreads,
      event: new EventBus(),
      camera: new Camera(
        new Vector(canvas.width, canvas.height),
        new Vector(params.x, params.y),
        params.w,
        Matrix.fromRaw(params.viewport),
      ),
      // changeable
      smooth: params.smooth,
      iter: params.iter,
      fractalId: params.fractalId,
    };
    this.painter = new Painter(params.painter);
    this.renderer = new Renderer(this.ctx, this.painter, this);
  }

  get canvas() {
    return this.ctx.canvas;
  }

  private fetchParams() {
    const params = this.paramsFetcher();
    this.ctx.fractalId = params.fractalId;
    this.ctx.smooth = params.smooth;
    this.ctx.iter = params.iter;
    this.painter.set({
      offset: params.painter.offset,
      density: params.painter.density,
      id: params.painter.id,
      fn: params.painter.fn,
    });
    // update camera
    const cam = this.ctx.camera;
    cam.setPos(new Vector(params.x, params.y), params.w);
    cam.viewportMatrix = Matrix.fromRaw(params.viewport);
    cam.reproject();
  }

  async draw(drawParams?: DrawParams) {
    this.fetchParams();
    if (!drawParams) drawParams = { details: "normal" };
    const start = new Date().getTime();
    const res = await this.renderer.draw(drawParams);
    const end = new Date().getTime();
    const time = end - start;
    console.log(`Frame '${drawParams.details}' drawn in ${time}ms`);
    return res;
  }

  drawColor() {
    this.fetchParams();
    this.renderer.drawColor();
  }

  resize(width: number, height: number) {
    this.ctx.camera.resize(width, height);
    this.renderer.resize();
  }

  getHistogram() {
    return this.renderer.getHistogram();
  }

  getIterationsAt(cpx: Vector) {
    return this.renderer.getIterationsAt(cpx);
  }
}
