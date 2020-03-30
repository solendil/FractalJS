// a mere javascript file is required as the entry point for the worker
// with my current setup...
import Worker from "./worker/worker";

function myPost(...args) {
  postMessage(...args);
}

const worker = new Worker(myPost);

onmessage = (...args) => {
  worker.onmessage(...args);
};
