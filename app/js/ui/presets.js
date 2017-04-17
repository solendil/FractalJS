
export const config = {
  tippetts: {
    type: 'tippetts', x: -0.2, y: 0.0, w: 4, iter: 50
  },
  mandelbrot: {
    type: 'mandelbrot', x: -0.7, y: 0.0, w: 2.5, iter: 50
  },
  mandelbrot3: {
    type: 'mandelbrot3', x: 0.0, y: 0.0, w: 3.0, iter: 50
  },
  mandelbrot4: {
    type: 'mandelbrot4', x: 0.0, y: 0.0, w: 3.0, iter: 50
  },
  burningship: {
    type: 'burningship', x: -0.25, y: 0.55, w: 3, iter: 50
  }
};

export const fractalNames = [
  { type: 'mandelbrot', name: 'Mandelbrot' },
  { type: 'tippetts', name: 'Tippetts' },
  { type: 'burningship', name: 'Burning Ship' },
  { type: 'mandelbrot3', name: 'Multibrot <sup>3</sup>' },
  { type: 'mandelbrot4', name: 'Multibrot <sup>4</sup>' },
];

