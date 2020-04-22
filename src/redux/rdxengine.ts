import { Dispatch } from "@reduxjs/toolkit";
import { Root } from "./reducer";
import Engine from "../engine/engine";
import { updateSet } from "./set";
import Controller from "./controller";
import Improver from "./improver";
import * as url from "./url";
import throttle from "lodash/throttle";
import debounce from "lodash/debounce";
import Vector from "../engine/math/vector";
import {
  setMouseOnCanvas,
  setMouseInfo,
  setInfobox,
  setDrawer,
  setSnack,
  setNarrowDevice,
  setTab,
} from "./ui";
import * as colorActions from "./colors";
import { getPreset } from "../engine/fractals";
import { bindKeys } from "../util/keybinder";
import Matrix from "../engine/math/matrix";
import { AffineTransform } from "../engine/math/camera";

type D = Dispatch<any>;

let engine: Engine;

export const getEngine = () => engine;

export const initEngine = (canvas: HTMLCanvasElement): any => (
  dispatch: D,
  getState: () => Root,
) => {
  // ---- init global keyboard shortcuts
  bindKeys("I", () => dispatch(setInfobox(!getState().ui.infobox)));
  bindKeys("esc", () => dispatch(setDrawer(!getState().ui.drawer)));
  bindKeys("D", () => {
    dispatch(setDrawer(true));
    dispatch(setTab("debug"));
  });

  // ---- init window size & capture resize events
  const getWindowSize = () => [window.innerWidth, window.innerHeight];
  [canvas.width, canvas.height] = getWindowSize();
  window.addEventListener("resize", () => {
    [canvas.width, canvas.height] = getWindowSize();
    engine.resize(canvas.width, canvas.height);
    engine.draw();
  });

  // ---- update ui.smallDevice boolean when device (or orientation) changes
  const onMediaChange = (media: any) =>
    dispatch(setNarrowDevice(media.matches));
  const matchMedia = window.matchMedia("(max-width: 450px)");
  onMediaChange(matchMedia);
  matchMedia.addListener(onMediaChange);

  window.addEventListener(
    "error",
    debounce(() => {
      console.error("error caught, resetting engine");
      url.readInit(dispatch, true);
      engine.draw();
    }, 200),
  );

  // ---- capture canvas enter & leave events for infobox
  canvas.addEventListener("mouseenter", () => {
    dispatch(setMouseOnCanvas(true));
  });
  canvas.addEventListener("mouseleave", () => {
    dispatch(setMouseOnCanvas(false));
  });
  canvas.addEventListener(
    "mousemove",
    throttle(evt => {
      const cpx = engine.ctx.camera.scr2cpx(
        new Vector(evt.offsetX, evt.offsetY),
      );
      const iter = engine.getIterationsAt(cpx);
      dispatch(setMouseInfo({ x: cpx.x, y: cpx.y, iter }));
    }, 50), // 20 fps max
  );

  // ---- read URL and infer start params
  const paramsFetcher = () => {
    // convert current redux state into engine state
    const rdx = getState();
    return {
      ...rdx.set,
      painter: rdx.colors,
    };
  };
  url.readInit(dispatch);
  engine = new Engine(canvas, paramsFetcher);
  // @ts-ignore
  window.engine = engine;

  const urlUpdate = debounce(() => {
    url.update(getState());
  }, 250);
  engine.ctx.event.on("draw.start", urlUpdate);
  engine.ctx.event.on("draw.redraw", urlUpdate);
  engine.ctx.event.on("zoom.limit", () => {
    dispatch(setSnack("Sorry, FractalJS cannot zoom further..."));
  });
  engine.ctx.event.on(
    "zoom.limit",
    debounce(() => {
      dispatch(setSnack(undefined));
    }, 5000),
  );

  new Controller(engine, dispatch);
  Improver(engine, dispatch, getState); // add improvement capabilities
  engine.draw();
};

export const changeFractalType = (type: string): any => (dispatch: D) => {
  const setValues = getPreset(type);
  dispatch(updateSet(setValues));
  dispatch(updateSet({ viewport: { ...Matrix.identity } }));
  dispatch(colorActions.setPaint({ density: 20 }));
  engine.draw();
};

export const changeSmooth = (smooth: boolean): any => (dispatch: D) => {
  dispatch(updateSet({ smooth }));
  engine.draw();
};

export const changeXY = (pt: Vector, w?: number): any => (dispatch: D) => {
  if (w === undefined) dispatch(updateSet({ x: pt.x, y: pt.y }));
  else dispatch(updateSet({ x: pt.x, y: pt.y, w }));
  engine.draw();
};

export const setColorOffset = (val: number): any => (dispatch: D) => {
  dispatch(colorActions.setOffset(val));
  engine.drawColor();
};

export const setColorDensity = (val: number): any => (dispatch: D) => {
  dispatch(colorActions.setDensity(val));
  engine.drawColor();
};

export const setColorId = (id: number): any => (dispatch: D) => {
  dispatch(colorActions.setPaint({ id, fn: "s" }));
  engine.drawColor();
};

export const viewportReset = (): any => (dispatch: D) => {
  dispatch(updateSet({ viewport: { ...Matrix.identity } }));
  engine.draw();
};

export const viewportTransform = (
  type: AffineTransform,
  valuex: number,
  valuey?: number,
): any => (dispatch: D, getState: () => Root) => {
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
  let matrix = Matrix.fromRaw(getState().set.viewport);
  matrix = matrix.multiply(transform);
  dispatch(updateSet({ viewport: { ...matrix } }));
  engine.draw();
};
