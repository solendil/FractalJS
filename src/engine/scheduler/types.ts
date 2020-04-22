import { Tile } from "../tile";

export interface DrawParams {
  details: "supersampling" | "normal" | "subsampling" | "iter-increase";
  size?: number;
  id?: number;
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
  params: DrawParams;
  model: Model;
  scheduleId?: number;
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
  scheduleId: number;
};
