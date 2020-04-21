// @ts-ignore
import WorkerInterface from "./worker/interface.worker.js";
import { DrawOrder, Order, WorkerResponse } from "./types";
import { Tile } from "../tile.js";

interface TWorker {
  postMessage: (x: Order, y?: any[]) => void;
  onmessage: (x: any) => void;
  terminate: () => void;
}
type LocalCallback = (worker: Worker, data: WorkerResponse) => void;

/*
  This is a webworker proxy. It handles:
  - passing of tile buffer by reference to and from the webworker
  - canceling webworkers, and recreating their tile buffer
  - handling "available" status as a safeguard
*/
export default class Worker {
  public id: number;
  public available: boolean = true;

  private tile!: Tile;
  private worker!: TWorker;
  private callback: LocalCallback;

  constructor(id: number, callback: LocalCallback) {
    this.id = id;
    this.createWebWorker();
    this.callback = callback;
  }

  private createWebWorker() {
    this.worker = (new WorkerInterface() as unknown) as TWorker;
    this.worker.postMessage({ action: "init", id: this.id });
    this.worker.onmessage = this.onmessage.bind(this);
  }

  cancel() {
    if (this.available) throw new Error("Canceling an available worker");
    // hard stuff: force terminate and recreate of a worker
    this.worker.terminate();
    this.createWebWorker();
    this.tile.buffer = new Float32Array(this.tile.width * this.tile.height);
    this.available = true;
  }

  draw(order: DrawOrder) {
    if (!this.available) throw new Error("Worker already busy");
    this.tile = order.tile;
    this.available = false;
    this.worker.postMessage(order, [order.tile.buffer.buffer]);
  }

  onmessage(event: any) {
    const data: WorkerResponse = event.data;
    this.tile.buffer = data.tile.buffer; // reassign the buffer to the original tile
    this.available = true;
    this.callback(this, data);
  }
}
