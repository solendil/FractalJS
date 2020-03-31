import Worker from "./worker";
import { DrawOrder, WorkerResponse } from "./types";

/*
Maintains the list of webworkers.
Receive list of orders from the renderer and dispatches them to the workers.
Can be interrupted in the middle of a rendering.
Deal with neutered arrays (arrays passed by reference between main thread and workers).
*/
export default class Scheduler {
  private orders: DrawOrder[] = [];
  private workers: Worker[] = [];
  private upperCallback: (data: WorkerResponse) => void;
  private batchId: number = 1;
  public handlers!: {
    resolve: () => any;
    reject: () => any;
  };

  constructor(nbThreads: number, callback: (data: WorkerResponse) => void) {
    this.upperCallback = callback;
    for (let i = 0; i < nbThreads; i += 1) {
      this.workers.push(new Worker(i, this.callback.bind(this)));
    }
  }

  private callback(worker: Worker, data: WorkerResponse) {
    if (data.batchId === this.batchId) this.upperCallback(data);
    const order = this.orders.shift();
    if (order) {
      worker.draw(order);
    } else {
      if (this.workers.every(w => w.available)) this.handlers.resolve();
    }
  }

  interrupt() {
    this.orders = [];
    if (this.handlers) this.handlers.reject();
  }

  async schedule(orders: DrawOrder[]) {
    // store current draw orders, and assign one to each worker
    this.batchId++;
    this.orders = orders.map(o => ({ ...o, batchId: this.batchId }));
    this.workers.forEach(worker => {
      const order = this.orders.shift();
      if (order) worker.draw(order);
    });
    // return a pending promise
    return new Promise((resolve, reject) => {
      this.handlers = { resolve, reject };
    });
  }
}
