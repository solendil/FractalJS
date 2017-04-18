const context = require.context('./fractals/', true, /\.(js)$/);

class Fractals {

  constructor() {
    this.byKey = {};
    context.keys().forEach((filename) => {
      const obj = context(filename).default;
      this.byKey[obj.id] = obj;
    });
  }

  getFunction(id, smooth) {
    const res = this.byKey[id];
    if (smooth) return res.fn.smooth || res.fn.normal;
    return res.fn.normal;
  }

  getPreset(id) {
    const res = this.byKey[id];
    return Object.assign({ type: id }, res.preset);
  }

  listForUi() {
    console.log(this.byKey);
    console.log(Object.values(this.byKey));
    return Object.values(this.byKey).filter(f => !f.hidden).sort((a, b) => a.uiOrder - b.uiOrder);
  }

}

export default new Fractals();
