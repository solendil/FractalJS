import { DrawOrder } from "./types";

let idGenerator: number = 1;

export default class Batch {
  private orders: DrawOrder[];
  public readonly id: number;
  private nbDone: number;
  private nbTodo: number;
  public promise: Promise<any>;
  public promiseHandlers!: {
    resolve: () => any;
    reject: () => any;
  };

  constructor(orders: DrawOrder[]) {
    if (orders.length === 0) throw new Error();
    this.orders = orders;
    this.id = idGenerator++;
    this.nbDone = 0;
    this.nbTodo = orders.length;
    this.promise = new Promise((resolve, reject) => {
      this.promiseHandlers = { resolve, reject };
    });
  }

  nextOrder() {
    const res = this.orders.shift();
    if (!res) throw new Error();
    res.batchId = this.id;
    return res;
  }

  done() {
    this.nbDone += 1;
    if (this.isFinished()) this.promiseHandlers.resolve();
  }

  hasMore() {
    return this.orders.length > 0;
  }

  isFinished() {
    return this.nbDone === this.nbTodo;
  }
}
