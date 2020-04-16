const standardGradients: { [key: number]: string } = {
  0: "0#080560;0.2#2969CB;0.40#F1FEFE;0.60#FCA425;0.85#000000",
  1: "0.0775#78591e;0.55#d6e341", // gold
  2: "0#0000FF;0.33#FFFFFF;0.66#FF0000", // bleublancrouge
  3: "0.08#09353e;0.44#1fc3e6;0.77#08173e", // night
  4: "0#000085;0.25#fffff5;0.5#ffb500;0.75#9c0000", // defaultProps
  5: "0#000000;0.25#000000;0.5#7f7f7f;0.75#ffffff;0.975#ffffff", // emboss
  // flatUI palettes (http://designmodo.github.io/Flat-UI/)
  10: "0#000000;0.25#16A085;0.5#FFFFFF;0.75#16A085", // green sea
  11: "0#000000;0.25#27AE60;0.5#FFFFFF;0.75#27AE60", // nephritis
  12: "0#000000;0.25#2980B9;0.5#FFFFFF;0.75#2980B9", // nephritis
  13: "0#000000;0.25#8E44AD;0.5#FFFFFF;0.75#8E44AD", // wisteria
  14: "0#000000;0.25#2C3E50;0.5#FFFFFF;0.75#2C3E50", // midnight blue
  15: "0#000000;0.25#F39C12;0.5#FFFFFF;0.75#F39C12", // orange
  16: "0#000000;0.25#D35400;0.5#FFFFFF;0.75#D35400", // pumpkin
  17: "0#000000;0.25#C0392B;0.5#FFFFFF;0.75#C0392B", // pmoegranate
  18: "0#000000;0.25#BDC3C7;0.5#FFFFFF;0.75#BDC3C7", // silver
  19: "0#000000;0.25#7F8C8D;0.5#FFFFFF;0.75#7F8C8D", // asbestos
};

/*
 * Monotone cubic spline interpolation
 *     let f = createInterpolant([0, 1, 2, 3, 4], [0, 1, 4, 9, 16]);
 *     for (let x = 0; x <= 4; x += 0.1)
 *        let xSquared = f(x);
 * https://en.wikipedia.org/wiki/Monotone_cubic_interpolation
 */
export function createInterpolant(xs: number[], ys: number[]) {
  let i,
    length = xs.length;

  // Deal with length issues
  if (length !== ys.length) {
    throw new Error("Need an equal count of xs and ys.");
  }
  if (length === 0) {
    return function (x: any) {
      return 0;
    };
  }
  if (length === 1) {
    // Impl: Precomputing the result prevents problems if ys is mutated later and allows garbage collection of ys
    // Impl: Unary plus properly converts values to numbers
    const result = +ys[0];
    return function (x: any) {
      return result;
    };
  }

  // Rearrange xs and ys so that xs is sorted
  const indexes = [];
  for (i = 0; i < length; i++) {
    indexes.push(i);
  }
  indexes.sort((a, b) => (xs[a] < xs[b] ? -1 : 1));
  let oldXs = xs,
    oldYs = ys;
  // Impl: Creating new arrays also prevents problems if the input arrays are mutated later
  xs = [];
  ys = [];
  // Impl: Unary plus properly converts values to numbers
  for (i = 0; i < length; i++) {
    xs.push(+oldXs[indexes[i]]);
    ys.push(+oldYs[indexes[i]]);
  }

  // Get consecutive differences and slopes
  let dys = [],
    dxs = [],
    ms = [];
  for (i = 0; i < length - 1; i++) {
    let dx = xs[i + 1] - xs[i],
      dy = ys[i + 1] - ys[i];
    dxs.push(dx);
    dys.push(dy);
    ms.push(dy / dx);
  }

  // Get degree-1 coefficients
  const c1s = [ms[0]];
  for (i = 0; i < dxs.length - 1; i++) {
    let m = ms[i],
      mNext = ms[i + 1];
    if (m * mNext <= 0) {
      c1s.push(0);
    } else {
      let dx = dxs[i],
        dxNext = dxs[i + 1],
        common = dx + dxNext;
      c1s.push((3 * common) / ((common + dxNext) / m + (common + dx) / mNext));
    }
  }
  c1s.push(ms[ms.length - 1]);

  // Get degree-2 and degree-3 coefficients
  let cpx2scr: number[] = [],
    c3s: number[] = [];
  for (i = 0; i < c1s.length - 1; i++) {
    let c1 = c1s[i],
      m = ms[i],
      invDx = 1 / dxs[i],
      common = c1 + c1s[i + 1] - m - m;
    cpx2scr.push((m - c1 - common) * invDx);
    c3s.push(common * invDx * invDx);
  }

  // Return interpolant function
  return function (x: number) {
    // The rightmost point in the dataset should give an exact result
    let i = xs.length - 1;
    if (x === xs[i]) {
      return ys[i];
    }

    // Search for the interval x is in, returning the corresponding y if x is one of the original xs
    let low = 0,
      mid,
      high = c3s.length - 1;
    while (low <= high) {
      mid = Math.floor(0.5 * (low + high));
      const xHere = xs[mid];
      if (xHere < x) {
        low = mid + 1;
      } else if (xHere > x) {
        high = mid - 1;
      } else {
        return ys[mid];
      }
    }
    i = Math.max(0, high);

    // Interpolate
    let diff = x - xs[i],
      diffSq = diff * diff;
    return ys[i] + c1s[i] * diff + cpx2scr[i] * diffSq + c3s[i] * diff * diffSq;
  };
}

const buildBufferFromStringGradient = (
  resolution: number,
  gradient: string,
) => {
  const indices: number[] = [];
  const reds: number[] = [];
  const greens: number[] = [];
  const blues: number[] = [];

  const buildStops = (str: string) => {
    str.split(";").forEach((stop) => {
      const items = stop.split("#");
      indices.push(Number(items[0]));
      reds.push(parseInt(items[1].substring(0, 2), 16));
      greens.push(parseInt(items[1].substring(2, 4), 16));
      blues.push(parseInt(items[1].substring(4, 6), 16));
    });
  };

  const buffer = new Int32Array(resolution);
  const buildBuffer = () => {
    // loop first stop to end
    indices.push(indices[0] + 1);
    reds.push(reds[0]);
    greens.push(greens[0]);
    blues.push(blues[0]);

    const interR = createInterpolant(indices, reds);
    const interG = createInterpolant(indices, greens);
    const interB = createInterpolant(indices, blues);

    const byteBuffer = new Uint8Array(buffer.buffer); // create an 8-bit view on the buffer
    let bufferIndex = 0;
    for (let i = 0; i < resolution; i += 1) {
      let floatIndex = i / resolution;
      if (floatIndex < indices[0]) floatIndex += 1;
      byteBuffer[bufferIndex + 0] = interR(floatIndex);
      byteBuffer[bufferIndex + 1] = interG(floatIndex);
      byteBuffer[bufferIndex + 2] = interB(floatIndex);
      byteBuffer[bufferIndex + 3] = 255;
      bufferIndex += 4;
    }
  };

  buildStops(gradient);
  buildBuffer();
  return buffer;
};

export const getBufferFromId = (id: number, res = 400) => {
  return buildBufferFromStringGradient(res, standardGradients[id]);
};
