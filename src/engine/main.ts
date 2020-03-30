/* global navigator */
import Event, { Callback } from "../util/event";
import Renderer from "./renderer";
import Painter, { Colors } from "./painter";
import Camera from "./math/camera";
import Vector from "./math/vector";
import { Params } from "./scheduler/types";
import Matrix from "./math/matrix";

interface TROU {
  canvas: HTMLCanvasElement;
  nbThreads?: number;
  x: number;
  y: number;
  w: number;
  viewport?: Matrix;
  colors: Colors;
  type: string;
  smooth: boolean;
  iter: number;
}

export default class FractalJS {
  private renderer: Renderer;
  private canvas: HTMLCanvasElement;
  private nbThreads: number;
  private event: Event;
  private painter: Painter;

  public camera: Camera;
  public type!: string;
  public smooth!: boolean;
  public iter!: number;

  constructor(p: TROU) {
    if (!p.canvas) throw new Error();
    this.canvas = p.canvas;
    this.nbThreads = p.nbThreads || navigator.hardwareConcurrency || 4;

    this.event = new Event();
    this.camera = new Camera(
      new Vector(p.canvas.width, p.canvas.height),
      new Vector(p.x, p.y),
      p.w,
      p.viewport,
    );
    this.painter = new Painter(p.colors);
    this.renderer = new Renderer(
      this.canvas,
      this.nbThreads,
      this.painter,
      this,
    );

    this.set(p);
  }

  on(evt: string, callback: Callback) {
    this.event.on(evt, callback);
  }
  notify(evt: string, obj: any) {
    this.event.notify(evt, obj);
  }

  // realtime modification of engine parameters
  set(p: TROU) {
    if ("type" in p) this.type = p.type;
    if ("smooth" in p) this.smooth = p.smooth;
    if ("iter" in p) this.iter = p.iter;
    if ("x" in p) this.camera.setPos(new Vector(p.x, p.y), p.w);
    if ("colors" in p) this.painter.set(p.colors);
  }

  draw(params: Params) {
    return this.renderer.draw(params);
  }

  drawColor() {
    this.renderer.drawColor();
  }

  resize(width: number, height: number) {
    this.camera.resize(width, height);
    this.renderer.resize();
  }
}
