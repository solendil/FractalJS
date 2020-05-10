import Matrix, { RawMatrix } from "../engine/math/matrix";
import { getPreset } from "../engine/fractals";
import { PainterArgs } from "../engine/painter";
import state from "./state";

interface UrlOutputObject {
  painter: PainterArgs;
  guide: {
    active: boolean;
    x: number;
    y: number;
  };
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

export const update = () => {
  try {
    const args: any = {};
    // engine
    args.t = state.set.fractalId;
    args.x = state.set.x;
    args.y = state.set.y;
    args.w = state.set.w;
    args.i = String(state.set.iter);
    args.fs = state.set.smooth ? "1" : "0";
    // painter
    args.ct = String(state.painter.id);
    args.co = String(Math.round(state.painter.offset * 100));
    args.cd = String(+state.painter.density.toFixed(2));
    args.cf = state.painter.fn;
    // viewport matrix
    args.va = state.set.viewport.a.toFixed(4);
    args.vb = state.set.viewport.b.toFixed(4);
    args.vc = state.set.viewport.c.toFixed(4);
    args.vd = state.set.viewport.d.toFixed(4);
    // guide
    if (state.guide.active) {
      args.gx = state.guide.x;
      args.gy = state.guide.y;
    }
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
  let guide = { active: false, x: 0, y: 0 };
  if ("gx" in args)
    guide = { active: true, x: parseFloat(args.gx), y: parseFloat(args.gy) };
  return { desc, painter, guide };
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

export const readInit = (forceCold = false): void => {
  const urlData = read();
  if (!urlData || forceCold) {
    // coldstart
    let desc = {
      ...getPreset("mandelbrot"),
      smooth: true,
      viewport: { ...Matrix.identity },
    };
    state.set = desc;
    state.painter.id = 0;
    state.painter.offset = 0;
    state.painter.density = 20;
    state.painter.fn = "s";
  } else {
    const { desc, painter, guide } = urlData;
    state.set = desc;
    state.guide = guide;
    state.painter = painter;
  }
};
