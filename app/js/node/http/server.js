import express from 'express';
import { PNG } from 'node-png';
import Engine from '../../engine/main';
import Palette from '../../util/palette';
import Url from '../../ui/url';
import Canvas from '../canvas';
import { memStore, WMStrm } from './memoryStream';
import presets from './presets';

// simulate browser environment
global.navigator = { hardwareConcurrency: 1 };
global.performance = { now() { return Date.now(); } };

const app = express();
const port = 8080;

function renderOnCanvas(desc, color, width, height) {
  const canvas = new Canvas(width, height);
  const params = {
    canvas,
    ...desc,
    colors: {
      ...color,
      buffer: Palette.getBufferFromId(color.id, 1000),
    }
  };
  const engine = new Engine(params);
  return engine.draw({ details: 'normal' })
  .then(() => engine.draw({ details: 'supersampling', size: 4 }))
  .then(() => {
    const buffer = canvas.buffer;
    return new Uint8Array(buffer);
  });
}

function getPngBuffer(array, width, height) {
  return new Promise((resolve) => {
    const png = new PNG({
      width,
      height,
      filterType: -1
    });
    for (let i = 0; i < width * height * 4; i += 1) {
      png.data[i] = array[i];
    }
    const wstream = new WMStrm('foo');
    png.pack().pipe(wstream); // stupid PNG library... !
    wstream.on('finish', () => {
      resolve(memStore.foo);
    });
  });
}

app.get('/', async (req, res) => {
  const width = req.query.width ? Number(req.query.width) : 512;
  const height = req.query.height ? Number(req.query.height) : 512;
  // preset or default
  let desc = {};
  let color = {};
  if (req.query.preset) {
    [desc, color] = Url.readCurrentScheme(presets[Number(req.query.preset)].location);
  } else {
    desc = {
      x: -0.7,
      y: 0,
      w: 2.5,
      iter: 50,
      type: 'mandelbrot',
      smooth: true
    };
    color = {
      offset: 0,
      density: 20,
      id: 0
    };
  }
  // additional parameters
  if (req.query.offset) color.offset = Number(req.query.offset);
  if (req.query.density) color.density = Number(req.query.density);
  if (req.query.id) color.id = Number(req.query.id);

  if (req.query.x) desc.x = Number(req.query.x);
  if (req.query.y) desc.y = Number(req.query.y);
  if (req.query.w) desc.w = Number(req.query.w);
  if (req.query.iter) desc.iter = Number(req.query.iter);
  if (req.query.type) desc.type = req.query.type;
  if (req.query.smooth) desc.smooth = req.query.smooth === 'true';

  const uint = await renderOnCanvas(desc, color, width, height);
  const str = await getPngBuffer(uint, width, height);
  res.set('Content-Type', 'image/png');
  res.send(str);
});

app.listen(port, () => console.log(`Listening on port ${port}!`));

