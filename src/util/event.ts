export type Callback = (x: any) => void;

export default class Event {
  private listeners: {
    [key: string]: Callback[];
  };

  constructor() {
    this.listeners = {};
  }

  on(evt: string, callback: Callback) {
    if (!(evt in this.listeners)) this.listeners[evt] = [];
    this.listeners[evt].push(callback);
  }

  notify(evt: string, obj: any) {
    // force the notification to occur from the event loop (always async callback)
    setTimeout(() => {
      const callbacks = this.listeners[evt] || [];
      if (obj) obj.evt = evt;
      callbacks.forEach(cb => {
        cb(obj);
      });
    }, 0);
  }
}
