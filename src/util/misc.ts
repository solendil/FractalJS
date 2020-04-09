export const isMobileDevice = () =>
  typeof window.orientation !== "undefined" ||
  navigator.userAgent.indexOf("IEMobile") !== -1;

export const isTouchDevice = () =>
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0;

export const isMouseDevice = () =>
  matchMedia("(pointer:fine)").matches || matchMedia("(hover:hover)").matches;

type anyFn = (...args: any[]) => void;

export const mylodash = {
  sum: (array: number[]) => {
    let sum = 0;
    for (let a of array) if (a !== null && a !== undefined) sum += a;
    return sum;
  },
  // https://codeburst.io/throttling-and-debouncing-in-javascript-b01cad5c8edf
  debounce: (func: anyFn, delay: number) => {
    let inDebounce: NodeJS.Timeout;
    return function () {
      const args = Array.from(arguments);
      clearTimeout(inDebounce);
      inDebounce = setTimeout(() => func.apply(null, args), delay);
    };
  },
  throttle: (func: anyFn, limit: number) => {
    let lastFunc: NodeJS.Timeout;
    let lastRan: number;
    return function () {
      const args = Array.from(arguments);
      if (!lastRan) {
        func.apply(null, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function () {
          if (Date.now() - lastRan >= limit) {
            func.apply(null, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  },
};
