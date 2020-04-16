import { Tile } from "./scheduler/types";

export interface Colors {
  offset: number;
  density: number;
  id: number;
  buffer: Int32Array;
}

// @ts-ignore
function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export default class Painter {
  public id: number = 0;
  private offset: number = 0;
  private density: number = 0;
  private resolution: number = 0;
  private buffer: Int32Array = new Int32Array();

  constructor(p: Colors) {
    this.set(p);
  }

  set(p: Colors) {
    if ("offset" in p) this.offset = p.offset;
    if ("density" in p) this.density = p.density;
    if ("id" in p) this.id = p.id;
    if ("buffer" in p) {
      this.buffer = p.buffer;
      this.resolution = this.buffer.length;
    }
  }

  // this function is not pure : it modifies buffer
  // this function need maximum speed : it uses only vars
  paint(tile: Tile, buffer: Uint32Array, width: number) {
    var offset = this.offset * this.resolution;
    var density = this.density,
      resolution = this.resolution;
    var cbuffer = this.buffer;
    var tileIndex = 0;
    var bufferIndex = 0;
    var tx, ty, iter, color;
    for (ty = 0; ty < tile.height; ty += 1) {
      bufferIndex = (ty + tile.y1) * width + tile.x1;
      for (tx = 0; tx < tile.width; tx += 1) {
        iter = tile.buffer[tileIndex];
        if (iter === 0) {
          color = 0xff000000;
        } else {
          // const i2 = Math.sqrt(iter);
          color = cbuffer[~~((iter * density + offset) % resolution)];
        }
        buffer[bufferIndex] = color;
        tileIndex += 1;
        bufferIndex += 1;
      }
    }
  }
}
