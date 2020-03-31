// @ts-ignore
import WorkerInterface from "./worker/interface.worker.js";
import { DrawOrder, Order, WorkerResponse } from "./types";

interface TWorker {
  postMessage: (x: Order, y?: any[]) => void;
  onmessage: (x: any) => void;
}
type LocalCallback = (worker: Worker, data: WorkerResponse) => void;

/*
  A typed, object, and generally simplified proxy in front of the worker.
  Handles neutered arrays.
*/
export default class Worker {
  public id: number;
  public available: boolean = true;

  private worker: TWorker;
  private callback: LocalCallback;

  constructor(id: number, callback: LocalCallback) {
    this.id = id;
    this.worker = new WorkerInterface();
    this.worker.postMessage({ action: "init", id });
    this.worker.onmessage = this.onmessage.bind(this);
    this.callback = callback;
  }

  draw(order: DrawOrder) {
    const tile = order.tile;
    if (tile.buffer.length === 0) {
      // recreate if neutered
      tile.buffer = new Float32Array(tile.width * tile.height);
    }
    this.available = false;
    this.worker.postMessage(order, [tile.buffer.buffer]);
  }

  onmessage(event: any) {
    const data: WorkerResponse = event.data;
    this.available = true;
    this.callback(this, data);
  }
}
