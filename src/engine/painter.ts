import { getBufferFromId } from "../util/palette";
import { Tile } from "./tile";

export interface PainterArgs {
  offset: number;
  density: number;
  id: number;
  fn: "s" | "n";
}

export default class Painter {
  public id: number = NaN;
  public offset: number = 0;
  public fn: string = "s";
  public density: number = 0;
  private resolution: number = 0;
  private buffer: Int32Array = new Int32Array();

  constructor(p: PainterArgs) {
    this.set(p);
  }

  set(p: any) {
    if ("fn" in p) this.fn = p.fn;
    if ("offset" in p) this.offset = p.offset;
    if ("density" in p) this.density = p.density;
    if (this.id !== p.id) {
      this.id = p.id;
      this.buffer = getBufferFromId(p.id, 1000);
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

    if (this.fn === "s") {
      density = density * 7;
      offset = ((this.offset + 0.85) % 1) * this.resolution;
    }

    for (ty = 0; ty < tile.height; ty += 1) {
      bufferIndex = (ty + tile.y1) * width + tile.x1;
      for (tx = 0; tx < tile.width; tx += 1) {
        iter = tile.buffer[tileIndex];
        if (iter === 0) {
          color = 0xff000000;
        } else {
          if (this.fn === "s") {
            iter = Math.sqrt(iter);
          }
          color = cbuffer[~~((iter * density + offset) % resolution)];
        }
        buffer[bufferIndex] = color;
        tileIndex += 1;
        bufferIndex += 1;
      }
    }
  }
}
