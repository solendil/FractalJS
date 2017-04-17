import Logger from '../../util/logger';
import Batch from './scheduler-batch';

let Worker;
if (process.env.BROWSER) {
  Worker = require('worker-loader!./worker-web');
} else {
  Worker = require('./worker-node');
}

const log = Logger.get('scheduler').level(Logger.WARN);

/*
Maintains the list of webworkers.
Receive list of orders from the renderer and dispatches them to the workers.
Can be interrupted in the middle of a rendering.
Deal with neutered arrays (arrays passed by reference between main thread and workers).
*/
export default class Scheduler {

  constructor(nbThreads, callback) {
    if (!nbThreads) throw new Error();
    this.batch = null;
    this.workers = [];
    this.onmessage = this.onmessage.bind(this);
    this.callback = callback;
    this.nbThreads = nbThreads;
    this.createWorkers();
  }

  createWorkers() {
    for (let i = 0; i < this.nbThreads; i += 1) {
      const worker = new Worker();
      worker.onmessage = this.onmessage;
      worker.postMessage({ action: 'init', id: i });
      this.workers.push(worker);
    }
  }

  dispatchOrder(worker, order) {
    if (order) {
      const tile = order.tile;
      if (tile.buffer.length === 0) { // recreate if neutered
        log.info('recreate neutered buffer', order);
        tile.buffer = new Float32Array(tile.width * tile.height);
      }
      worker.postMessage(order, [tile.buffer.buffer]);
    }
  }

  endDraw(worker, data) {
    if (!this.batch || this.batch.id !== data.batchId) {
      log.debug('drop old tile');
      return;
    }
    this.callback(data);
    this.batch.done(data);
    if (this.batch.hasMore()) {
      const order = this.batch.nextOrder();
      this.dispatchOrder(worker, order);
    }
    if (this.batch.isFinished()) this.batch = null;
  }

  onmessage(event) {
    const data = event.data;
    const worker = event.target;
    log.debug('received', data.action, data);
    switch (data.action) {
      case 'end-draw': {
        this.endDraw(worker, data);
        break;
      }
      default:
        throw new Error('Illegal action', data);
    }
  }

  interrupt() {
    if (this.batch) {
      log.debug('interrupting');
      this.batch.promiseHandlers.reject();
      this.batch = null;
    }
  }

  schedule(orders) {
    if (this.batch) throw new Error(); // previous not finished or interrupted

    this.batch = new Batch(orders);
    log.debug('new scheduling batch with id', this.batch.id);

    this.workers.forEach((worker) => {
      const order = this.batch.nextOrder();
      this.dispatchOrder(worker, order);
    });

    return this.batch.promise;
  }

}
