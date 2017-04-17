import Logger from '../../util/logger';

const log = Logger.get('batch').level(Logger.WARN);
let idSource = 0;

export default class Batch {

  constructor(orders) {
    if (orders.length === 0) throw new Error();
    this.orders = orders;
    this.id = idSource;
    this.nbDone = 0;
    this.nbTodo = orders.length;
    idSource += 1;
    this.promise = new Promise((resolve, reject) => {
      this.promiseHandlers = { resolve, reject };
    });
  }

  nextOrder() {
    if (this.orders.length === 0) throw new Error();
    const res = this.orders.shift();
    res.batchId = this.id;
    return res;
  }

  done(data) {
    this.nbDone += 1;
    if (this.isFinished()) this.promiseHandlers.resolve();
  }

  hasMore() {
    return this.orders.length > 0;
  }

  isFinished() {
    return (this.nbDone === this.nbTodo);
  }

}
