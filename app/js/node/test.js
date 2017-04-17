import Engine from '../engine/main';
import Palette from '../util/palette';
import Canvas from './canvas';
import Url from '../ui/url';

const fs = require('fs');
const PNG = require('node-png').PNG;

// simulate browser environment
global.navigator = { hardwareConcurrency: 1 };
global.performance = { now() { return Date.now(); } };
const [desc, color] = Url.readCurrentScheme('#Bt_mandelbrot&x_-0.7&y_0&w_2.5&i_50&fs_1&ct_0&co_100&cd_20');

const WIDTH = 2048;
const HEIGHT = 1024;
const canvas = new Canvas(WIDTH, HEIGHT);
const params = {
  canvas,
  ...desc,

  colors: {
    ...color,
    buffer: Palette.getBufferFromId(color.id, 1000),
  }
};
const engine = new Engine(params);
engine.draw({ details: 'normal' })
.then(() => engine.draw({ details: 'supersampling', size: 4 }))
.then(() => {
  console.log('finished');
  const png = new PNG({
    width: WIDTH,
    height: HEIGHT,
    filterType: -1
  });

  const buffer = canvas.buffer;
  const arr = new Uint8Array(buffer);
  for (let i = 0; i < WIDTH * HEIGHT * 4; i += 1) {
    png.data[i] = arr[i];
  }

  let out = fs.createWriteStream('bg.png');
  png.pack().pipe(out);
  setTimeout(function () {
    console.log("PNG OK");
    process.exit();
  }, 5000); // for lack of a better mechanism...
  console.log('exported');
});

