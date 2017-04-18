/* global performance */
import Logger from '../util/logger';
import Scheduler from './workers/scheduler';
import Redrawer from './redrawer';
import fractals from './fractals';

const log = Logger.get('renderer').level(Logger.INFO);

export default class Renderer {

  constructor(canvas, nbThreads, painter, engine) {
    this.canvas = canvas;
    this.nbTiles = engine.nbTiles || 100;
    this.resize();

    this.callback = this.callback.bind(this);
    this.scheduler = new Scheduler(nbThreads, this.callback);
    this.painter = painter;
    this.engine = engine;

    log.debug('built');
  }

  resize() {
    if (this.scheduler) this.scheduler.interrupt();

    const canvas = this.canvas;
    this.context = canvas.getContext('2d');
    this.imageData = this.context.createImageData(canvas.width, canvas.height);
    this.imageBuffer = new Uint32Array(this.imageData.data.buffer);
    this.width = canvas.width;
    this.height = canvas.height;
    if (process.env.BROWSER) this.redrawer = new Redrawer(canvas);

    // compute tiling
    const ratio = this.width / this.height;
    const tileNbHeight = Math.round(Math.sqrt(this.nbTiles / ratio));
    const tileNbWidth = Math.round(Math.sqrt(this.nbTiles / ratio) * ratio);
    log.debug(`Screen ${this.width}px * ${this.height}px (ratio ${ratio.toFixed(2)}),`
      + ` ${tileNbWidth} * ${tileNbHeight} = ${tileNbHeight * tileNbWidth} tiles (${this.nbTiles} asked)`
      + `, each ~ ${Math.round(canvas.width / tileNbWidth)}px * ${Math.round(this.canvas.height / tileNbHeight)}px`);

    // instanciate tiles
    this.tiles = [];
    for (let j = 0; j < tileNbHeight; j += 1) {
      for (let i = 0; i < tileNbWidth; i += 1) {
        const tile = {
          i, j, id: this.tiles.length,
        };
        tile.x1 = Math.round(i * canvas.width / tileNbWidth);
        tile.x2 = Math.round((i + 1) * canvas.width / tileNbWidth) - 1;
        tile.y1 = Math.round(j * canvas.height / tileNbHeight);
        tile.y2 = Math.round((j + 1) * canvas.height / tileNbHeight) - 1;
        tile.x = (tile.x1 + tile.x2) / 2; // center of tile
        tile.y = (tile.y1 + tile.y2) / 2;
        tile.width = tile.x2 - tile.x1 + 1;
        tile.height = tile.y2 - tile.y1 + 1;
        tile.buffer = new Float32Array(tile.width * tile.height);
        tile.indexScreen = tile.y1 * canvas.width + tile.x1;
        this.tiles.push(tile);
      }
    }
  }

  getIterationsAt(cpx) {
    const func = fractals.getFunction(this.engine.type, this.engine.smooth);
    return func(cpx.x, cpx.y, this.engine.iter);
  }

  getHistogram() {
    const histogram = new Array(this.engine.iter + 1).fill(0);
    for (const tile of this.tiles) {
      for (let i of tile.buffer) {
        i = Math.round(i);
        if (i >= 0 && i <= this.engine.iter) histogram[i] += 1;
      }
    }
    return histogram;
  }

  // redraws the current float buffer
  drawColor() {
    this.engine.notify('draw.redraw', {});
    this.tiles.forEach((tile) => {
      this.painter.paint(tile, this.imageBuffer, this.width);
    });
    this.context.putImageData(this.imageData, 0, 0, 0, 0, this.width, this.height);
  }

  // performs a full draw: floatbuffer + colors
  draw(params) {
    const engine = this.engine;
    engine.notify('draw.start', {});
    this.scheduler.interrupt();
    let tileSort;
    if (this.redrawer) tileSort = this.redrawer.redraw(engine.camera.matrix, engine, params.id);
    this.timeStart = performance.now();
    const workerModel = Object.assign({}, engine.camera.matrix, {
      type: engine.type,
      smooth: engine.smooth,
      iter: engine.iter,
    });
    const orders = this.tiles.map(tile => ({
      action: 'draw',
      tile,
      params,
      model: workerModel,
    }));
    // if redrawer was able to find a tile sorting, sort them
    if (tileSort) {
      log.debug('sorting tiles', tileSort);
      orders.forEach((t) => {
        t.dist = Math.sqrt((t.tile.x - tileSort.x) ** 2 + (t.tile.y - tileSort.y) ** 2);
      });
      orders.sort((a, b) => (tileSort.reverse ? b.dist - a.dist : a.dist - b.dist));
    }
    const schedulerPromise = this.scheduler.schedule(orders)
    .then(() => {
      const time = performance.now() - this.timeStart;
      log.info(`frame rendered in ${time}ms`);
    })
    .catch(() => {
      log.debug('scheduler interrupted');
    });
    return schedulerPromise;
  }

  callback(data) {
    log.debug('received callback', data);
    if (data.action !== 'end-draw') throw new Error();
    const tile = data.tile;
    this.tiles[tile.id].buffer = tile.buffer;
    this.painter.paint(tile, this.imageBuffer, this.width);
    this.context.putImageData(this.imageData, 0, 0, tile.x1, tile.y1, tile.width, tile.height);
  }

}
