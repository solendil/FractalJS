import { Tile } from "./scheduler/types";

export interface Colors {
  offset: number;
  density: number;
  id: number;
  buffer: Int32Array;
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
          color = cbuffer[~~((iter * density + offset) % resolution)];
        }
        buffer[bufferIndex] = color;
        tileIndex += 1;
        bufferIndex += 1;
      }
    }
  }
}
