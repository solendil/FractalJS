import Matrix from "../engine/math/matrix";
import { Dispatch } from "@reduxjs/toolkit";
import { setOffset, setDensity } from "./colors";
import { setSet } from "./set";
import omit from "lodash/omit";
import { getPreset } from "../engine/fractals";
import { getBufferFromId } from "../util/palette";
import Engine from "../engine/engine";

export const update = (engine: Engine) => {
  const camera = engine.ctx.camera;
  const color = engine.ctx.colors;
  try {
    const args = [];
    args.push(["t", engine.ctx.fractalId]);
    args.push(["x", camera.pos.x]);
    args.push(["y", camera.pos.y]);
    args.push(["w", camera.w]);
    args.push(["i", engine.ctx.iter]);
    args.push(["fs", engine.ctx.smooth ? 1 : 0]);
    if (color) {
      if (color.id === undefined) throw new Error();
      args.push(["ct", color.id]);
      args.push(["co", Math.round(color.offset * 100)]);
      args.push(["cd", +color.density.toFixed(2)]);
    }
    if (!camera.affineMatrix.isIdentity()) {
      args.push(["va", camera.affineMatrix.a.toFixed(4)]);
      args.push(["vb", camera.affineMatrix.b.toFixed(4)]);
      args.push(["vc", camera.affineMatrix.c.toFixed(4)]);
      args.push(["vd", camera.affineMatrix.d.toFixed(4)]);
    }
    const str = args.reduce((acc, arg) => `${acc}&${arg[0]}_${arg[1]}`, "");
    window.history.replaceState("", "", `#B${str.substr(1)}`);
  } catch (e) {
    console.error("Could not set URL", e);
  }
};

function readCurrentScheme(url: string) {
  const str = url.substr(2);
  const tuples = str.split("&");
  const map: any = tuples.reduce((acc, tuple) => {
    const parts = tuple.split("_");
    return Object.assign(acc, { [parts[0]]: parts[1] });
  }, {});
  const desc = {
    x: parseFloat(map.x),
    y: parseFloat(map.y),
    w: parseFloat(map.w),
    iter: parseInt(map.i, 10),
    fractalId: map.t,
    smooth: parseInt(map.fs, 10) === 1,
    viewport: Matrix.identity,
  };
  if ("va" in map) {
    desc.viewport = new Matrix(
      parseFloat(map.va),
      parseFloat(map.vb),
      parseFloat(map.vc),
      parseFloat(map.vd),
      0,
      0,
    );
  }
  const color = {
    offset: parseInt(map.co, 10) / 100.0,
    density: parseFloat(map.cd),
    id: parseInt(map.ct, 10),
  };
  return { desc, color };
}

export const read = () => {
  try {
    const url = document.location.hash;
    if (url.startsWith("#B")) {
      return readCurrentScheme(url);
    }
  } catch (e) {
    console.error("Could not read URL", e);
  }
  return null;
};

export const readInit = (dispatch: Dispatch<any>) => {
  const init = read();
  if (!init) {
    // coldstart
    let desc = { ...getPreset("mandelbrot"), smooth: true };
    let colors = {
      offset: 0,
      density: 20,
      buffer: getBufferFromId(0, 1000),
      id: 0,
    };
    dispatch(setSet(omit(desc, "viewport")));
    dispatch(setOffset(0));
    dispatch(setDensity(20));
    return { ...desc, colors };
  } else {
    const { desc, color } = init;
    dispatch(setSet(omit(init.desc, "viewport")));
    dispatch(setOffset(color.offset));
    dispatch(setDensity(color.density));
    return {
      ...desc,
      colors: { ...color, buffer: getBufferFromId(color.id, 1000) },
    };
  }
};
