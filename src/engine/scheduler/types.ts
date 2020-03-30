export interface Tile {
  i: number;
  j: number;
  id: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  x: number;
  y: number;
  width: number;
  height: number;
  buffer: Float32Array;
  indexScreen: number;
}

export interface Params {
  details: "supersampling" | "normal" | "subsampling";
  size: number;
  id: number;
}

export interface Model {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  type: string;
  smooth: boolean;
  iter: number;
}

export interface DrawOrder {
  action: "draw";
  tile: Tile;
  params: Params;
  model: Model;
  batchId?: number;
  dist?: number; // used when computing draw order
}
interface InitOrder {
  action: "init";
  id: number;
}

export type Order = DrawOrder | InitOrder;

export type WorkerResponse = {
  action: "end-draw";
  tile: Tile;
  workerId: string;
  batchId: number;
};
