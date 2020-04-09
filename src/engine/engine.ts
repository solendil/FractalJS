/* global navigator */
import EventBus from "../util/EventBus";
import Renderer from "./renderer";
import Painter, { Colors } from "./painter";
import Camera from "./math/camera";
import Vector from "./math/vector";
import { Params } from "./scheduler/types";
import Matrix from "./math/matrix";

export interface Context {
  readonly canvas: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;
  readonly event: EventBus;
  readonly nbThreads: number;
  readonly camera: Camera;
  smooth: boolean;
  iter: number;
  fractalId: string;
  colors: Colors;
}

interface EngineInit {
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
  w: number;
  viewport?: Matrix;
  colors: Colors;
  fractalId: string;
  smooth: boolean;
  iter: number;
}

export default class Engine {
  public readonly ctx: Context;

  private renderer: Renderer;
  private painter: Painter;

  constructor(p: EngineInit) {
    const nbThreads = navigator.hardwareConcurrency || 4;
    this.ctx = {
      // readonly
      canvas: p.canvas,
      context: p.canvas.getContext("2d") as CanvasRenderingContext2D,
      nbThreads,
      event: new EventBus(),
      camera: new Camera(
        new Vector(p.canvas.width, p.canvas.height),
        new Vector(p.x, p.y),
        p.w,
        p.viewport,
      ),
      // changeable
      smooth: p.smooth,
      iter: p.iter,
      fractalId: p.fractalId,
      colors: p.colors,
    };
    this.painter = new Painter(p.colors);
    this.renderer = new Renderer(this.ctx, this.painter, this);
  }

  get canvas() {
    return this.ctx.canvas;
  }

  // realtime modification of engine parameters
  set(p: any) {
    if ("fractalId" in p) this.ctx.fractalId = p.fractalId;
    if ("smooth" in p) this.ctx.smooth = p.smooth;
    if ("iter" in p) this.ctx.iter = p.iter;
    if ("x" in p) this.ctx.camera.setPos(new Vector(p.x, p.y), p.w);
    if ("colors" in p) {
      this.ctx.colors = { ...this.ctx.colors, ...p.colors };
      this.painter.set(p.colors);
    }
  }

  async draw(params?: Params) {
    if (!params) params = { details: "normal" };
    return this.renderer.draw(params);
  }

  drawColor() {
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