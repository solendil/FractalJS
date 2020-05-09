import Worker from "./worker";
import { DrawOrder, WorkerResponse } from "./types";
import { Context } from "../engine";
import throttle from "lodash/throttle";

/*
Maintains the list of webworkers.
Receive list of orders from the renderer and dispatches them to the workers.
Can be interrupted in the middle of a rendering.
Deal with neutered arrays (arrays passed by reference between main thread and workers).
*/
export default class Scheduler {
  private scheduleId: number = 0;
  private orders: DrawOrder[] = [];
  private workers: Worker[] = [];
  private upperCallback: (data: WorkerResponse) => void;
  public handlers!: {
    accept: () => any;
    reject: (x: any) => any;
  };

  constructor(ctx: Context, callback: (data: WorkerResponse) => void) {
    this.upperCallback = callback;
    for (let i = 0; i < ctx.nbThreads; i += 1) {
      const callback = this.onWorkerResponse.bind(this);
      this.workers.push(new Worker(i, callback));
    }
    this.throttledSchedule = throttle(this.throttledSchedule.bind(this), 200);
  }

  private onWorkerResponse(worker: Worker, data: WorkerResponse) {
    if (data.scheduleId === this.scheduleId) this.upperCallback(data);
    const order = this.orders.shift();
    if (order) worker.draw(order);
    if (!this.isWorking) this.handlers.accept();
  }

  get availableWorkers() {
    return this.workers.filter(w => w.available);
  }

  get busyWorkers() {
    return this.workers.filter(w => !w.available);
  }

  get isWorking() {
    return this.orders.length || this.busyWorkers.length;
  }

  private throttledSchedule(orders: DrawOrder[]) {
    // store current draw orders, and assign one to each worker
    this.orders = orders.map(o => ({ ...o, scheduleId: this.scheduleId }));
    this.busyWorkers.forEach(w => w.cancel());
    this.availableWorkers.forEach(w => {
      const order = this.orders.shift();
      if (order) w.draw(order);
    });
  }

  // returns a pending promise that will be resolved by either
  // - rejection if schedule is called before all orders have been handled
  // - acception when everything has been settled
  async schedule(orders: DrawOrder[]) {
    // increase scheduleId to be able to reject outdated workers answering
    this.scheduleId++;

    // if we had previous orders, or busy workers, clear orders, reject
    // previous promise
    if (this.isWorking) {
      this.orders = [];
      if (this.handlers) this.handlers.reject("Scheduler interrupted");
    }

    // throttle real work to avoid building/destroying webworkers too often
    this.throttledSchedule(orders);

    return new Promise((accept, reject) => {
      this.handlers = { accept, reject };
    });
  }
}
