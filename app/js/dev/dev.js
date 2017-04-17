import Engine from '../engine/main';
import Palette from '../util/palette';

const canvas = document.getElementById('main');
canvas.width = 2;
canvas.height = 2;

const e = new Engine({
  canvas,
  nbThreads: 1,
  nbTiles: 1,
  type: 'mandelbrot',
  iter: 50,
  x: -0.7,
  y: 0,
  w: 2.5,
  colors: {
    offset: 0,
    density: 20,
    buffer: Palette.getBufferFromId(0, 1000),
    id: 0,
  }
});
//e.draw({ details: 'normal' });
e.draw({ details: 'supersampling', size: 2 });
