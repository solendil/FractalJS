export type Callback = (x: any) => void;

type Events =
  | "scheduler.finished"
  | "scheduler.interrupted"
  | "draw.redraw"
  | "draw.start"
  | "zoom.limit";

export default class EventBus {
  private listeners: {
    [key: string]: Callback[];
  };

  constructor() {
    this.listeners = {};
  }

  on(evt: Events, callback: Callback) {
    if (!(evt in this.listeners)) this.listeners[evt] = [];
    this.listeners[evt].push(callback);
  }

  notify(evt: Events, obj?: any) {
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
