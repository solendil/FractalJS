/* global document */
import Logger from '../util/logger';

const log = Logger.get('redrawer').level(Logger.DEBUG);

export default class Redrawer {

  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.offCanvas = document.createElement('canvas');
    this.offCanvas.width = canvas.width;
    this.offCanvas.height = canvas.height;
  }

  redraw(newMatrix, model, id) {
    // if type has changed, don't redraw
    if (this.lastType !== model.type) this.lastMatrix = null;
    if (this.lastId === id) return;
    let tileSorter;

    if (this.lastMatrix) {
      // compute movement matrix
      const m = this.lastMatrix.inverse().multiply(newMatrix).inverse();

      // use movement to quickly redraw last picture at new position
      const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.offCanvas.getContext('2d').putImageData(imageData, 0, 0);
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.transform(m.a, m.b, m.c, m.d, m.e, m.f);
      this.context.drawImage(this.offCanvas, 0, 0);
      this.context.setTransform(1, 0, 0, 1, 0, 0);

      // use movement to infer an optimal redrawing order of tiles
      // tiles are sorted according to their distance to the tileSorter x, y point
      // compute invariant point
      /* eslint-disable no-mixed-operators */
      const x = (m.c * m.f - m.d * m.e + m.e) / (m.a * m.d - m.a - m.b * m.c - m.d + 1);
      const y = (m.a * m.f - m.b * m.e - m.f) / (m.a * (-m.d) + m.a + m.b * m.c + m.d - 1);
      /* eslint-enable no-mixed-operators */

      if (m.a > 1.001 && m.d > 1.001) {
        tileSorter = { x, y };
      } else if (m.a < 0.99 && m.d < 0.99) {
        tileSorter = { x, y, reverse: true };
      } else if (Math.abs(m.e) > 0.01 || Math.abs(m.f) > 0.01 ) {
        tileSorter = {
          x: this.canvas.width / 2,
          y: this.canvas.height / 2,
          reverse: true,
        };
        if (m.e < -0.01) tileSorter.x = 0;
        if (m.e > 0.01) tileSorter.x = this.canvas.width;
        if (m.f < -0.01) tileSorter.y = 0;
        if (m.f > 0.01) tileSorter.y = this.canvas.height;
      }
    } else {
      this.lastType = model.type;
    }

    this.lastId = id;
    this.lastMatrix = newMatrix;
    return tileSorter;
  }
}
