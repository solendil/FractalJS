/* global performance */
import Logger from '../util/logger';

const log = Logger.get('painter').level(Logger.WARN);

export default class Painter {

  constructor(p) {
    this.set(p);
  }

  set(p) {
    log.info('set', p);
    if ('offset' in p) this.offset = p.offset;
    if ('density' in p) this.density = p.density;
    if ('id' in p) this.id = p.id;
    if ('buffer' in p) {
      this.buffer = p.buffer;
      this.resolution = this.buffer.length;
    }
  }

  // this function is not pure : it modifies buffer
  // this function need maximum speed : it uses only vars
  /* eslint-disable no-var, one-var, one-var-declaration-per-line */
  paint(tile, buffer, width) {
    var timeStart = performance.now(), time;
    var offset = this.offset * this.resolution;
    var density = this.density, resolution = this.resolution;
    var cbuffer = this.buffer;
    var tileIndex = 0;
    var bufferIndex = 0;
    var tx, ty, iter, color;
    for (ty = 0; ty < tile.height; ty += 1) {
      bufferIndex = ((ty + tile.y1) * width) + tile.x1;
      for (tx = 0; tx < tile.width; tx += 1) {
        iter = tile.buffer[tileIndex];
        if (iter === 0) {
          color = 0xFF000000;
        } else {
          color = cbuffer[~~((iter * density + offset) % resolution)];
        }
        buffer[bufferIndex] = color;
        tileIndex += 1;
        bufferIndex += 1;
      }
    }
    time = performance.now() - timeStart;
    log.debug(`tile painted ! ${tile.width * tile.height} pixels in ${time.toFixed(2)}ms`);
  }

}
