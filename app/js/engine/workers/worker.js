// HIGH PERFORMANCE MODULE
/* eslint-disable no-var, one-var, one-var-declaration-per-line, no-mixed-operators,
no-plusplus, no-continue */

import Logger from '../../util/logger';
import fractals from '../fractals';

let log = Logger.get('worker').level(Logger.WARN);

const draw = (model, func, tile) => {
  var buffer = tile.buffer;
  var dx = 0;
  var sx, sy, px, py, piter;
  for (sy = tile.y1; sy <= tile.y2; sy++) {
    px = (tile.x1 + 0.5) * model.a + (sy + 0.5) * model.c + model.e;
    py = (tile.x1 + 0.5) * model.b + (sy + 0.5) * model.d + model.f;
    for (sx = tile.x1; sx <= tile.x2; sx++) {
      piter = func(px, py, model.iter);
      if (piter === model.iter) {
        buffer[dx++] = 0;
      } else {
        buffer[dx++] = piter;
      }
      px += model.a;
      py += model.b;
    }
  }
};

const drawSubsampled = (model, func, tile, res) => {
  var buffer = tile.buffer;
  var dx = 0, sx, sy, px, py, piter;
  // first compute sparse grid
  for (sy = tile.y1; sy <= tile.y2; sy += res) {
    dx = (sy - tile.y1) * tile.width;
    for (sx = tile.x1; sx <= tile.x2; sx += res) {
      px = (sx + res / 2) * model.a + (sy + res / 2) * model.c + model.e;
      py = (sx + res / 2) * model.b + (sy + res / 2) * model.d + model.f;
      piter = func(px, py, model.iter);
      if (piter === model.iter) {
        buffer[dx] = 0;
      } else {
        buffer[dx] = piter;
      }
      dx += res;
    }
  }
  // then fill the holes
  dx = 0;
  for (sy = 0; sy < tile.height; sy++) {
    for (sx = 0; sx < tile.width; sx++) {
      if (!(sy % res === 0 && sx % res === 0)) {
        buffer[dx] = buffer[(sy - sy % res) * tile.width + sx - sx % res];
      }
      dx++;
    }
  }
};

const drawSupersampled = (model, func, tile, res) => {
  var buffer = tile.buffer;
  var pixelOnP = Math.sqrt(model.a * model.a + model.b * model.b);
  var resq = res * res;
  var sss = pixelOnP / res;
  var dx = 0, sx, sy, px, py, itersum, pxs, pys, piter, ss;
  // console.log('***', res, resq, pixelOnP, model, sss);
  for (sy = tile.y1; sy <= tile.y2; sy++) {
    for (sx = tile.x1; sx <= tile.x2; sx++) {
      // must only be activated if we're sure tile contains data from previously computed normal
      if (buffer[dx] === 0) {
        // if we're not on borders of tile, check if this point is inside set and skip SS
        if (!(sy === tile.y1 || sy === tile.y2 - 1 ||
            sx === tile.x1 || sx === tile.y1 - 1)) {
          if (buffer[dx + 1] === 0 &&
            buffer[dx - 1] === 0 &&
            buffer[dx + tile.width] === 0 &&
            buffer[dx - tile.width] === 0) {
            dx++;
            continue;
          }
        }
      }
      px = sx * model.a + sy * model.c + model.e + sss / 2;
      py = sx * model.b + sy * model.d + model.f - sss / 2;
      // console.log('---', sx, sy, px, py)
      itersum = 0;
      for (ss = 0; ss < resq; ss++) {
        pxs = px + Math.trunc(ss / res) * sss;
        pys = py - (ss % res) * sss;
        itersum += func(pxs, pys, model.iter);
        // console.log(pxs, pys)
      }
      piter = itersum / resq;
      buffer[dx++] = piter === model.iter ? 0 : piter;
    }
  }
};

export default class Worker {

  constructor(postMessage) {
    this.postMessage = postMessage;
    this.workerId = 'worker-?';
    log.debug('definition');
  }

  onmessage(event) {
    const data = event.data;
    log.debug('received', data.action, data);
    switch (data.action) {
      case 'init':
        this.workerId = `worker-${data.id}`;
        log = Logger.get(`worker-${data.id}`).level(log.currentLevel);
        log.debug('changed ID');
        break;
      case 'draw': {
        const func = fractals.getFunction(data.model.type, data.model.smooth);
        if (data.params.details === 'normal') {
          draw(data.model, func, data.tile);
        } else if (data.params.details === 'subsampling') {
          drawSubsampled(data.model, func, data.tile, data.params.size);
        } else if (data.params.details === 'supersampling') {
          drawSupersampled(data.model, func, data.tile, data.params.size);
        } else {
          throw new Error('Unknown detail');
        }
        const answer = {
          action: 'end-draw',
          tile: data.tile,
          workerId: this.workerId,
          batchId: data.batchId,
        };
        this.postMessage(answer, [answer.tile.buffer.buffer]);
        break;
      }
      default:
        throw new Error('Illegal action', data);
    }
  }

}
