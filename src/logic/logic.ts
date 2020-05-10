import Engine from "../engine/engine";
import Controller from "./controller";
import Improver from "./improver";
import * as url from "./url";
import throttle from "lodash/throttle";
import debounce from "lodash/debounce";
import Vector from "../engine/math/vector";
import { getPreset } from "../engine/fractals";
import { bindKeys } from "../util/keybinder";
import Guide from "../engine/guide";
import Matrix from "../engine/math/matrix";
import { AffineTransform } from "../engine/math/camera";
import state from "./state";

let engine: Engine;
let guide: Guide;
let urlUpdate: () => void;

export const getEngine = () => engine;

export const displayPoi = () => {
  const obj = {
    name: "",
    fractalId: state.set.fractalId,
    x: state.set.x,
    y: state.set.y,
    w: state.set.w,
  };
  console.log("---- POI");
  console.log(JSON.stringify(obj, null, 2));
};

export const initEngine = (
  canvas: HTMLCanvasElement,
  canvasGuide: HTMLCanvasElement,
) => {
  const { ui, mouse } = state;

  // ---- init global keyboard shortcuts
  bindKeys("I", () => (ui.isInfobox = !ui.isInfobox));
  bindKeys("esc", () => (ui.isDrawer = !ui.isDrawer));
  bindKeys("D", () => {
    ui.isDrawer = true;
    ui.tab = "debug";
  });
  bindKeys("Q", () => (ui.showSquare = !ui.showSquare));
  bindKeys("P", () => displayPoi());
  bindKeys("M", () => (ui.showPois = !ui.showPois));

  // ---- init window size & capture resize events
  const getWindowSize = () => [window.innerWidth, window.innerHeight];
  const onResize = () => {
    const [width, height] = getWindowSize();
    [canvas.width, canvas.height] = getWindowSize();
    [canvasGuide.width, canvasGuide.height] = getWindowSize();
    ui.screen = { width, height };
  };
  onResize();
  window.addEventListener("resize", () => {
    onResize();
    engine.resize(canvas.width, canvas.height);
    engine.draw();
  });

  // ---- update ui.smallDevice boolean when device (or orientation) changes
  const onMediaChange = (media: any) => (ui.isNarrowDevice = media.matches);
  const matchMedia = window.matchMedia("(max-width: 450px)");
  onMediaChange(matchMedia);
  matchMedia.addListener(onMediaChange);

  window.addEventListener(
    "error",
    debounce(() => {
      console.error("error caught, resetting engine");
      url.readInit(true);
      engine.draw();
    }, 200),
  );

  // ---- capture canvas enter & leave events for infobox
  canvas.addEventListener("mouseenter", () => {
    mouse.isOnCanvas = true;
  });
  canvas.addEventListener("mouseleave", () => {
    mouse.isOnCanvas = false;
  });
  canvas.addEventListener(
    "mousemove",
    throttle(evt => {
      const cpx = engine.ctx.camera.scr2cpx(
        new Vector(evt.offsetX, evt.offsetY),
      );
      const iter = engine.getIterationsAt(cpx);
      mouse.x = cpx.x;
      mouse.y = cpx.y;
      mouse.iter = iter;
    }, 50), // 20 fps max
  );

  // ---- read URL and infer start params
  url.readInit();

  const paramsFetcher = () => ({ ...state.set, painter: state.painter });
  engine = new Engine(canvas, paramsFetcher);

  // @ts-ignore : store as global variable for debug
  window.engine = engine;

  urlUpdate = debounce(() => url.update(), 250);
  const hideSnack = debounce(() => (ui.snackText = null), 5000);
  engine.ctx.event.on("draw.start", urlUpdate);
  engine.ctx.event.on("draw.redraw", urlUpdate);
  engine.ctx.event.on("zoom.limit", () => {
    ui.snackText = "Sorry, FractalJS cannot zoom further...";
    hideSnack();
  });

  guide = new Guide(canvasGuide, engine);
  engine.ctx.event.on("draw.start", () => {
    guide.draw();
  });

  new Controller(engine);
  Improver(engine); // add improvement capabilities
  engine.draw();
};

export const changeFractalType = (type: string) => {
  const setValues = getPreset(type);
  state.set = { ...state.set, ...setValues };
  state.set.viewport = { ...Matrix.identity };
  state.painter.density = 20;
  state.guide.active = false;
  engine.draw();
};

export const changeSmooth = (smooth: boolean) => {
  state.set.smooth = smooth;
  engine.draw();
};

export const changeXY = (pt: Vector, w?: number) => {
  if (w === undefined) {
    state.set.x = pt.x;
    state.set.y = pt.y;
  } else {
    state.set.x = pt.x;
    state.set.y = pt.y;
    state.set.w = w;
  }
  engine.draw();
};

export const setColorOffset = (val: number) => {
  state.painter.offset = val;
  engine.drawColor();
};

export const setColorDensity = (val: number) => {
  state.painter.density = val;
  engine.drawColor();
};

export const setColorId = (id: number) => {
  state.painter.id = id;
  state.painter.fn = "s";
  engine.drawColor();
};

export const toggleGuide = () => {
  if (state.mouse.isOnCanvas) {
    state.guide = { active: true, ...state.mouse };
    guide.draw();
    urlUpdate();
  }
};

export const viewportReset = () => {
  state.set.viewport = { ...Matrix.identity };
  engine.draw();
};

export const viewportTransform = (
  type: AffineTransform,
  valuex: number,
  valuey?: number,
) => {
  let transform = Matrix.identity;
  switch (type) {
    case "rotation":
      transform = Matrix.GetRotationMatrix(valuex);
      break;
    case "shear":
      transform = Matrix.GetShearMatrix(valuex, valuey!);
      break;
    case "scale":
      transform = Matrix.GetScaleMatrix(valuex, valuey!);
      break;
  }
  let matrix = Matrix.fromRaw(state.set.viewport);
  matrix = matrix.multiply(transform);
  state.set.viewport = { ...matrix };
  engine.draw();
};
