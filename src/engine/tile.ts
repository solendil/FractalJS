import { param } from "../params";

let id = 0;

export class Tile {
  public readonly id: number;
  public readonly x1: number;
  public readonly x2: number;
  public readonly y1: number;
  public readonly y2: number;
  public readonly x: number;
  public readonly y: number;
  public readonly width: number;
  public readonly height: number;
  public buffer: Float32Array;

  constructor(x1: number, x2: number, y1: number, y2: number) {
    this.id = id++;
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    this.x = (x1 + x2) / 2;
    this.y = (y1 + y2) / 2;
    this.width = x2 - x1 + 1;
    this.height = y2 - y1 + 1;
    this.buffer = new Float32Array(this.width * this.height);
  }

  static getTiling(width: number, height: number) {
    // compute tiling
    const nbTiles = param.nbTiles;
    const ratio = width / height;
    const nbY = Math.round(Math.sqrt(nbTiles / ratio));
    const nbX = Math.round(Math.sqrt(nbTiles / ratio) * ratio);
    console.log(
      `Tiling [${width} x ${height}] with ${nbTiles} tiles --> `,
      `[${nbX} * ${nbY}] = ${nbY * nbX} tiles of `,
      `~ [${Math.round(width / nbX)} x ${Math.round(height / nbY)}]`,
    );
    // instanciate tiles
    const res = [];
    for (let j = 0; j < nbY; j += 1) {
      for (let i = 0; i < nbX; i += 1) {
        const x1 = Math.round((i * width) / nbX);
        const x2 = Math.round(((i + 1) * width) / nbX) - 1;
        const y1 = Math.round((j * height) / nbY);
        const y2 = Math.round(((j + 1) * height) / nbY) - 1;
        res.push(new Tile(x1, x2, y1, y2));
      }
    }
    return res;
  }
}
