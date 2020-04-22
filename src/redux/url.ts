import Matrix, { RawMatrix } from "../engine/math/matrix";
import { Dispatch } from "@reduxjs/toolkit";
import { setOffset, setDensity, setColorId } from "./colors";
import { setSet } from "./set";
import { getPreset } from "../engine/fractals";
import Engine from "../engine/engine";
import { PainterArgs } from "../engine/painter";
import { Root } from "./reducer";

interface UrlOutputObject {
  painter: PainterArgs;
  desc: {
    x: number;
    y: number;
    w: number;
    iter: number;
    fractalId: string;
    smooth: boolean;
    viewport: RawMatrix;
  };
}

const defaults: any = {
  t: "mandelbrot",
  i: "50",
  fs: "1",
  ct: "0",
  co: "0",
  cd: "20",
  cf: "n",
  va: "1.0000",
  vb: "0.0000",
  vc: "0.0000",
  vd: "1.0000",
};

export const update = (root: Root) => {
  try {
    const args: any = {};
    // engine
    args.t = root.set.fractalId;
    args.x = root.set.x;
    args.y = root.set.y;
    args.w = root.set.w;
    args.i = String(root.set.iter);
    args.fs = root.set.smooth ? "1" : "0";
    // painter
    args.ct = String(root.colors.id);
    args.co = String(Math.round(root.colors.offset * 100));
    args.cd = String(+root.colors.density.toFixed(2));
    args.cf = root.colors.fn;
    // viewport matrix
    args.va = root.set.viewport.a.toFixed(4);
    args.vb = root.set.viewport.b.toFixed(4);
    args.vc = root.set.viewport.c.toFixed(4);
    args.vd = root.set.viewport.d.toFixed(4);
    // remove args with default values
    for (let key in args) if (args[key] === defaults[key]) delete args[key];
    // build url
    const str = Object.entries(args)
      .map(([k, v]) => `${k}_${v}`)
      .join("&");
    window.history.replaceState("", "", `#B${str}`);
  } catch (e) {
    console.error("Could not set URL", e);
  }
};

function readCurrentScheme(url: string): UrlOutputObject {
  // parse url
  const str = url.substr(2);
  const rawArgs: any = str.split("&").reduce((acc, tuple) => {
    const parts = tuple.split("_");
    return Object.assign(acc, { [parts[0]]: parts[1] });
  }, {});
  // add default arguments
  const args = { ...defaults, ...rawArgs };
  // build objet
  const desc = {
    x: parseFloat(args.x),
    y: parseFloat(args.y),
    w: parseFloat(args.w),
    iter: parseInt(args.i),
    fractalId: args.t,
    smooth: parseInt(args.fs) === 1,
    viewport: { ...Matrix.identity },
  };
  desc.viewport = {
    a: parseFloat(args.va),
    b: parseFloat(args.vb),
    c: parseFloat(args.vc),
    d: parseFloat(args.vd),
    e: 0,
    f: 0,
  };
  const painter = {
    offset: parseInt(args.co) / 100.0,
    density: parseFloat(args.cd),
    id: parseInt(args.ct, 10),
    fn: args.cf,
  };
  return { desc, painter };
}

export const read = (): UrlOutputObject | null => {
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

export const readInit = (
  dispatch: Dispatch<any>,
  forceCold = false,
): UrlOutputObject => {
  const urlData = read();
  if (!urlData || forceCold) {
    // coldstart
    let desc = {
      ...getPreset("mandelbrot"),
      smooth: true,
      viewport: { ...Matrix.identity },
    };
    let painter: PainterArgs = {
      offset: 0,
      density: 20,
      id: 0,
      fn: "s",
    };
    dispatch(setSet(desc));
    dispatch(setColorId(painter.id));
    dispatch(setOffset(0));
    dispatch(setDensity(20));
    return { desc, painter };
  } else {
    const { desc, painter } = urlData;
    dispatch(setSet(urlData.desc));
    dispatch(setColorId(painter.id));
    dispatch(setOffset(painter.offset));
    dispatch(setDensity(painter.density));
    return {
      desc,
      painter,
    };
  }
};
