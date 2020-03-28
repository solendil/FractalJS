import { Dispatch } from "@reduxjs/toolkit";
import { Root } from "./reducer";
import Engine from "../to_review/engine/main";
import fractals from "../to_review/engine/fractals";
import Palette from "../to_review/util/palette";
import { setSet, updateSet } from "./set";
import Controller from "./controller";
import Improver from "./improver";
import Url from "../to_review/util/url";
import _ from "lodash";
import Vector from "../to_review/engine/math/vector";
import {
  setMouseOnCanvas,
  setMouseInfo,
  setInfobox,
  setDrawer,
  setSnack,
} from "./ui";
import binder from "../to_review/util/keybinder";

let engine: any = null;

export const initEngine = (canvas: HTMLCanvasElement): any => async (
  dispatch: Dispatch<any>,
  getState: () => Root,
) => {
  // ---- init global keyboard shortcuts
  binder.bind("I", () => dispatch(setInfobox(!getState().ui.infobox)));
  binder.bind("esc", () => dispatch(setDrawer(!getState().ui.drawer)));

  // ---- init window size & capture resize events
  const getWindowSize = () => [window.innerWidth, window.innerHeight];
  [canvas.width, canvas.height] = getWindowSize();
  window.addEventListener("resize", () => {
    [canvas.width, canvas.height] = getWindowSize();
    engine.resize(canvas.width, canvas.height);
    engine.draw();
  });

  // ---- capture canvas enter & leave events for infobox
  canvas.addEventListener("mouseenter", () => {
    dispatch(setMouseOnCanvas(true));
  });
  canvas.addEventListener("mouseleave", () => {
    dispatch(setMouseOnCanvas(false));
  });
  canvas.addEventListener(
    "mousemove",
    _.throttle(evt => {
      const cpx = engine.camera.scr2cpx(new Vector(evt.offsetX, evt.offsetY));
      const iter = engine.renderer.getIterationsAt(cpx);
      dispatch(setMouseInfo({ x: cpx.x, y: cpx.y, iter }));
    }, 50), // 20 fps max
  );

  // ---- read URL and infer start params
  const init = Url.read();
  let res: any;
  if (!init) {
    // cold start
    res = Object.assign(
      {
        smooth: true,
        colors: {
          offset: 0,
          density: 20,
          buffer: Palette.getBufferFromId(0, 1000),
          id: 0,
        },
      },
      fractals.getPreset("mandelbrot"),
    );
  } else {
    // start from URL
    let colors: any;
    [res, colors] = init;
    res.colors = colors;
    colors.buffer = Palette.getBufferFromId(colors.id, 1000);
  }

  dispatch(setSet(_.omit(res, "colors")));
  engine = new Engine({ ...res, canvas });

  engine.on(
    "draw.start",
    _.debounce(() => {
      Url.update(engine, engine.painter);
    }, 250),
  );
  engine.on("zoom.limit", () => {
    dispatch(setSnack("Sorry, FractalJS cannot zoom further..."));
  });
  engine.on(
    "zoom.limit",
    _.debounce(() => {
      dispatch(setSnack(undefined));
    }, 5000),
  );

  new Controller(engine, dispatch);
  Improver(engine, dispatch); // add improvement capabilities
  engine.draw();
};

export const changeFractalType = (type: string): any => async (
  dispatch: Dispatch<any>,
  getState: () => Root,
) => {
  const setValues = fractals.getPreset(type);
  dispatch(updateSet(setValues));
  engine.camera.affineReset();
  engine.set({ colors: { density: 20 } });
  engine.set(setValues);
  engine.draw();
};

export const changeSmooth = (smooth: boolean): any => async (
  dispatch: Dispatch<any>,
  getState: () => Root,
) => {
  dispatch(updateSet({ smooth }));
  engine.smooth = smooth;
  engine.draw();
};

export const changeXY = (pt: Vector, w?: number): any => async (
  dispatch: Dispatch<any>,
) => {
  if (w === undefined) {
    dispatch(updateSet({ x: pt.x, y: pt.y }));
    engine.camera.setPos(pt);
  } else {
    dispatch(updateSet({ x: pt.x, y: pt.y, w }));
    engine.camera.setPos(pt, w);
  }
  engine.draw();
};
