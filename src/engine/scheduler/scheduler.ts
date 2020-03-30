import Batch from "./scheduler-batch";
// @ts-ignore
import Worker from "./worker.worker.js";
import { DrawOrder, Order, WorkerResponse } from "./types";

interface TWorker {
  postMessage: (x: Order, y?: any[]) => void;
  onmessage: (x: any) => void;
}

/*
Maintains the list of webworkers.
Receive list of orders from the renderer and dispatches them to the workers.
Can be interrupted in the middle of a rendering.
Deal with neutered arrays (arrays passed by reference between main thread and workers).
*/
export default class Scheduler {
  private nbThreads: number;
  private workers: TWorker[] = [];
  private batch: Batch | null;
  private callback: (data: WorkerResponse) => void;

  constructor(nbThreads: number, callback: (data: any) => void) {
    if (!nbThreads) throw new Error();
    this.batch = null;
    this.onmessage = this.onmessage.bind(this);
    this.callback = callback;
    this.nbThreads = nbThreads;
    for (let i = 0; i < this.nbThreads; i += 1) {
      const worker: TWorker = new Worker();
      worker.onmessage = this.onmessage;
      worker.postMessage({ action: "init", id: i });
      this.workers.push(worker);
    }
  }

  private dispatchOrder(worker: TWorker, order: DrawOrder) {
    if (order) {
      const tile = order.tile;
      if (tile.buffer.length === 0) {
        // recreate if neutered
        tile.buffer = new Float32Array(tile.width * tile.height);
      }
      worker.postMessage(order, [tile.buffer.buffer]);
    }
  }

  private endDraw(worker: TWorker, data: WorkerResponse) {
    if (!this.batch || this.batch.id !== data.batchId) {
      return;
    }
    this.callback(data);
    this.batch.done();
    if (this.batch.hasMore()) {
      const order = this.batch.nextOrder();
      this.dispatchOrder(worker, order);
    }
    if (this.batch.isFinished()) this.batch = null;
  }

  private onmessage(event: any) {
    const data: WorkerResponse = event.data;
    const worker = event.target;
    switch (data.action) {
      case "end-draw": {
        this.endDraw(worker, data);
        break;
      }
      default:
        throw new Error("Illegal action");
    }
  }

  interrupt() {
    if (this.batch) {
      this.batch.promiseHandlers.reject();
      this.batch = null;
    }
  }

  schedule(orders: DrawOrder[]) {
    if (this.batch) throw new Error(); // previous not finished or interrupted

    const batch = new Batch(orders);
    this.batch = batch;
    this.workers.forEach(worker => {
      const order = batch.nextOrder();
      this.dispatchOrder(worker, order);
    });

    return this.batch.promise;
  }
}
