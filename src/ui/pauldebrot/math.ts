import { createInterpolant } from "../../util/palette";
import { hslp2rgb, rgb2hsl, hsl2hslp, html2rgb } from "./convert";

export type ColorFetcher = (x: number) => Triple;
export type Triple = [number, number, number];

/* Takes a palette description and returns xSteps and steps as rgb Triple */
const parseGradient = (gradientDesc: string): [number[], Triple[]] => {
  const [type, ...strSteps] = gradientDesc.split(";");

  // extract xsteps
  const positionedSteps = strSteps.filter(it => it.includes(":"));
  if (positionedSteps.length > 0 && positionedSteps.length !== strSteps.length)
    throw new Error("Not all steps are positioned");
  let xSteps: number[] = [];
  if (positionedSteps.length === 0) {
    const interval = 1 / strSteps.length;
    xSteps = strSteps.map((_, i) => i * interval);
  } else {
    xSteps = strSteps.map(s => +s.split(":")[0]);
  }

  // extract steps
  const steps = strSteps.map(strStep => {
    let strColor = strStep.includes(":") ? strStep.split(":")[1] : strStep;
    let rgb: Triple = [0, 0, 0];
    if (type === "hex") rgb = html2rgb(strColor);
    else {
      let components = strColor.split(" ").map(i => +i) as Triple;
      if (type === "rgb") rgb = components;
      if (type === "hslp") rgb = hslp2rgb(components as Triple);
    }
    return rgb;
  });

  return [xSteps, steps];
};

/* Takes a palette description and returns a function that takes an x in [0,1]
   and outputs a Triple hsvp color.
*/
export const gradientFetcher = (
  gradientDesc: string,
  resolution: number = 1000,
): ColorFetcher => {
  // parse palette
  const [xsteps, steps] = parseGradient(gradientDesc);

  // repeat everything in range [0,1] to [-1,2] to ensure smooth interpolation
  const rx = xsteps
    .map(x => x - 1)
    .concat(xsteps)
    .concat(xsteps.map(x => x + 1));
  const rs = steps.concat(steps).concat(steps);

  // create interpolants on r, g, b
  const inter_r = createInterpolant(
    rx,
    rs.map(i => i[0]),
  );
  const inter_g = createInterpolant(
    rx,
    rs.map(i => i[1]),
  );
  const inter_b = createInterpolant(
    rx,
    rs.map(i => i[2]),
  );

  // create the three precomputed arrays with given resolutions
  const h = new Array(resolution).fill(0);
  const s = new Array(resolution).fill(0);
  const v = new Array(resolution).fill(0);
  for (let i = 0; i < resolution; i++) {
    const r = inter_r(i / resolution);
    const g = inter_g(i / resolution);
    const b = inter_b(i / resolution);
    const hsl = rgb2hsl([r, g, b]);
    const hslp = hsl2hslp(hsl);
    h[i] = hslp[0];
    s[i] = hslp[1];
    v[i] = hslp[2];
  }

  // export a function that takes a double in [0;1] and outputs an interpolated hsl
  const res = (x: number): Triple => {
    const index = Math.round(x * resolution);
    return [h[index], s[index], v[index]];
  };
  return res;
};

/* Takes a multiwave description and returns a function that takes an iteration
   and outputs a Triple rgb color.
*/
export const multiwaveFetcher = (
  waves: { def: string; lg: number; noDampen?: boolean }[],
): ColorFetcher => {
  const wavesI = waves.map((wave, i) => {
    const fetcher = gradientFetcher(wave.def);
    const lg = wave.lg;
    const factor = (iter: number) => {
      if (wave.noDampen) return 1;
      if (i === 0 && iter < lg) return 1;
      const dist = Math.abs(Math.log10(iter) - Math.log10(lg));
      if (dist > 1) return 0;
      if (dist > 0.5 && dist <= 1) return -2 * dist + 2;
      return 1;
    };
    return { ...wave, fetcher, factor };
  });
  const res = (iter: number): Triple => {
    iter = Math.sqrt(iter);
    const hslps = wavesI.map(wave => {
      const { fetcher, lg } = wave;
      const factor = wave.factor(iter);
      return timeshslp(fetcher((iter % lg) / lg), factor);
    });
    const hslp = sumHslp(hslps);
    const rgb = hslp2rgb(hslp);
    return rgb;
  };
  return res;

  // const fetchers = waves.map(w => gradientFetcher(w.def));
  // const res = (iter: number): Triple => {
  //   const hslps: Triple[] = [];
  //   for (let waveNb = 0; waveNb < waves.length; waveNb++) {
  //     let factor = 1;
  //     const lg = waves[waveNb].lg;
  //     if (iter > waves[0].lg) {
  //       const dist = Math.abs(Math.log10(iter) - Math.log10(lg));
  //       if (dist > 1) continue; // rejection
  //       if (dist > 0.5 && dist <= 1) factor = -2 * dist + 2;
  //     }
  //     console.log(iter, waveNb, lg, factor);
  //     const fetcher = fetchers[waveNb];
  //     hslps.push(timeshslp(fetcher((iter % lg) / lg), factor));
  //     // hslps.push(fetcher((iter % lg) / lg));
  //   }
  //   console.log(hslps);
  //   const hslp = sumHslp(hslps);
  //   const rgb = hslp2rgb(hslp);
  //   return rgb;
  // };
  // return res;
};

const timeshslp = (t: Triple, f: number): Triple => [
  t[0] * f,
  t[1] * f,
  t[2] * f,
];

export const tricubic_via_rgb = (steps: Triple[], resolution: number) => {
  // X stops [0;1] are repeated through range [-1;2] to ensure smooth transitions
  const interval = 1 / steps.length;
  const c_x_01 = steps.map((s, i) => i * interval);
  const c_x = c_x_01
    .map(x => x - 1)
    .concat(c_x_01)
    .concat(c_x_01.map(x => x + 1));

  const stepsRgb = steps.map(hslp2rgb);

  // rgbs are also repeated on range [-1;2]
  const c_r_01 = stepsRgb.map((s, i) => s[0]);
  const c_r = c_r_01.concat(c_r_01).concat(c_r_01);
  const inter_r = createInterpolant(c_x, c_r);

  const c_g_01 = stepsRgb.map((s, i) => s[1]);
  const c_g = c_g_01.concat(c_g_01).concat(c_g_01);
  const inter_g = createInterpolant(c_x, c_g);

  const c_b_01 = stepsRgb.map((s, i) => s[2]);
  const c_b = c_b_01.concat(c_b_01).concat(c_b_01);
  const inter_b = createInterpolant(c_x, c_b);

  // create the three precomputed arrays with given resolutions
  const h = new Array(resolution).fill(0);
  const s = new Array(resolution).fill(0);
  const v = new Array(resolution).fill(0);
  for (let i = 0; i < resolution; i++) {
    const r = inter_r(i / resolution);
    const g = inter_g(i / resolution);
    const b = inter_b(i / resolution);
    const hsl = rgb2hsl([r, g, b]);
    const hslp = hsl2hslp(hsl);
    // console.log(r, g, b, hsl, hslp);
    h[i] = hslp[0];
    s[i] = hslp[1];
    v[i] = hslp[2];
  }

  // export a function that takes a double in [0;1] and outputs an interpolated hsl
  const res = (x: number): [number, number, number] => {
    const index = Math.round(x * resolution);
    return [h[index], s[index], v[index]];
  };
  return res;
};

export const sumHslp = (a: Triple[]): Triple => {
  let h = 0;
  let s = 0;
  let l = 0;
  for (let hsv of a) {
    h += hsv[0];
    s += hsv[1];
    l += hsv[2];
  }
  return [h % 8, s, l];
};
