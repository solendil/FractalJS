
// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
export function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

// http://stackoverflow.com/questions/34698905/clone-a-js-object-except-for-one-key
export function omit(obj, omitKey) {
  return Object.keys(obj).reduce((result, key) => {
    if(key !== omitKey) {
       result[key] = obj[key];
    }
    return result;
  }, {});
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    let context = this, args = arguments;
    let later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

/*
* Monotone cubic spline interpolation
*     let f = createInterpolant([0, 1, 2, 3, 4], [0, 1, 4, 9, 16]);
*     for (let x = 0; x <= 4; x += 0.1)
*        let xSquared = f(x);
* https://en.wikipedia.org/wiki/Monotone_cubic_interpolation
*/
export function createInterpolant(xs, ys) {
  let i,
    length = xs.length;

  // Deal with length issues
  if (length != ys.length) {
    throw 'Need an equal count of xs and ys.';
  }
  if (length === 0) {
    return function (x) {
      return 0;
    };
  }
  if (length === 1) {
    // Impl: Precomputing the result prevents problems if ys is mutated later and allows garbage collection of ys
    // Impl: Unary plus properly converts values to numbers
    const result = +ys[0];
    return function (x) {
      return result;
    };
  }

  // Rearrange xs and ys so that xs is sorted
  const indexes = [];
  for (i = 0; i < length; i++) {
    indexes.push(i);
  }
  indexes.sort((a, b) => xs[a] < xs[b] ? -1 : 1);
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
      c1s.push(3 * common / ((common + dxNext) / m + (common + dx) / mNext));
    }
  }
  c1s.push(ms[ms.length - 1]);

  // Get degree-2 and degree-3 coefficients
  let cpx2scr = [],
    c3s = [];
  for (i = 0; i < c1s.length - 1; i++) {
    let c1 = c1s[i],
      m = ms[i],
      invDx = 1 / dxs[i],
      common = c1 + c1s[i + 1] - m - m;
    cpx2scr.push((m - c1 - common) * invDx);
    c3s.push(common * invDx * invDx);
  }

  // Return interpolant function
  return function (x) {
    // The rightmost point in the dataset should give an exact result
    let i = xs.length - 1;
    if (x == xs[i]) {
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
