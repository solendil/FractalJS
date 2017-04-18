import nouislider from 'nouislider';
//import GraphicLayer from 'ui/layer/layer';
import Palette from '../util/palette';
import Logger from '../util/logger';
import Url from './url';
import Saver from '../scheduler/saver';
import Engine from '../engine/main';
import Improver from '../engine/improver';
import Controller from '../engine/controller';
import fractals from '../engine/fractals';
import * as util from '../util/util';

const log = Logger.get('ui-help').level(Logger.DEBUG);

const getWindowSize = () => {
  // webkit fix for iframe (while using webpack) sometimes incorrect behaviour
  if (window.innerWidth === 0) {
    return [window.top.innerWidth, window.top.innerHeight];
  }
  return [window.innerWidth, window.innerHeight];
};

export function initParams() {
  // build an engine initialization object
  // canvas will be provided once the component has mounted
  const init = Url.read();
  let res;
  if (!init) {
    // cold start
    res = Object.assign({
      smooth: true,
      colors: {
        offset: 0,
        density: 20,
        buffer: Palette.getBufferFromId(0, 1000),
        id: 0,
      }
    },
    fractals.getPreset('mandelbrot'));
  } else {
    // start from URL
    let colors;
    [res, colors] = Url.read();
    res.colors = colors;
    colors.buffer = Palette.getBufferFromId(colors.id, 1000);
  }
  // res.nbThreads = 2;
  return res;
}

export function initEngine(init) {
  // 'this' is Vue
  // resize canvas
  const canvas = document.getElementById('main');
  [canvas.width, canvas.height] = getWindowSize();
  const graphicCanvas = document.getElementById('graphic');
  [graphicCanvas.width, graphicCanvas.height] = getWindowSize();
  log.debug('size', canvas.width, canvas.height);

  const engine = new Engine(Object.assign(init, { canvas }));
  const engineDraw4fps = util.debounce(this.onEngineDraw.bind(this), 250);
  engine.on('draw.start', () => engineDraw4fps());
  engine.on('draw.redraw', () => engineDraw4fps());
  engine.on('zoom.limit', () => { this.onZoomLimit(); });
  engine.on('zoom.limit', util.debounce(() => { this.snack.visible = false; }, 5000));

  /* eslint-disable no-new */
  new Controller(engine); // add controller capabilities
  new Saver(engine); // add saver
  Improver(engine); // add improvement capabilities

  // new GraphicLayer(engine); // add graphic layer

  window.onresize = () => {
    [canvas.width, canvas.height] = getWindowSize();
    [graphicCanvas.width, graphicCanvas.height] = getWindowSize();
    engine.resize(canvas.width, canvas.height);
    engine.draw();
  };

  return engine;
}

export function initSliders() {
  // 'this' is Vue
  const DENSITY = (20 * 20) ** (1 / 100);
  nouislider.create(document.getElementById('slider_offset'), {
    start: [this.param.color.offset],
    range: { min: 0, max: 1 },
  });
  window.slider_offset.noUiSlider.on('slide', (val) => {
    this.setColorOffset(Number(val[0]));
  });
  const start = Math.log(20 * this.param.color.density) / Math.log(DENSITY);
  log.debug('set density slider', this.param.color.density, start);
  nouislider.create(document.getElementById('slider_density'), {
    start: [start],
    range: { min: 0, max: 100 },
  });
  window.slider_density.noUiSlider.on('slide', (val) => {
    this.setColorDensity(Number(val[0]));
  });
}

export function setDensitySlider(val) {
  window.slider_density.noUiSlider.set([val]);
}

export function createGradients() {
  console.time('gradients');

  const res = [];
  const WIDTH = 85;
  const HEIGHT = 50;
  const RES = WIDTH;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const imageData = context.createImageData(canvas.width, canvas.height);
  const imageBuffer = new Uint32Array(imageData.data.buffer);
  [0, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].forEach((id) => {
    const colorBuffer = Palette.getBufferFromId(id, RES);
    for (let i = 0; i < WIDTH; i += 1) {
      for (let j = 0; j < HEIGHT; j += 1) {
        imageBuffer[(j * WIDTH) + i] = colorBuffer[(i + j) % RES];
      }
    }
    context.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    res.push({ id, dataURL });
  });
  return res;
}

