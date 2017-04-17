/*
This class is used from a node context; it simulates the webworker API.
*/
import Worker from './worker';

module.exports = class {
  constructor() {
    const myPost = (data) => {
      this.onmessage({ data, target: this });
    };
    this.worker = new Worker(myPost);
  }
  postMessage(data) {
    setTimeout(() => {
      this.worker.onmessage({ data });
    }, 0);
  }
};
