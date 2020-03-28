
export default class Event {
  constructor() {
    this.listeners = {};
  }

  on(evt, callback) {
    if (!(evt in this.listeners)) this.listeners[evt] = [];
    this.listeners[evt].push(callback);
  }

  notify(evt, obj) {
    // force the notification to occur from the event loop (always async callback)
    setTimeout(() => {
      const callbacks = this.listeners[evt] || [];
      if (obj) obj.evt = evt;
      callbacks.forEach((cb) => {
        cb(obj);
      });
    }, 0);
  }
}
