/* eslint-env worker */
/*
This class is used from a web context; it plugs the webworker architecture
to the abstract worker.
*/
import Worker from './worker';

function myPost(...args) {
  postMessage(...args);
}

const worker = new Worker(myPost);

onmessage = (...args) => {
  worker.onmessage(...args);
};
