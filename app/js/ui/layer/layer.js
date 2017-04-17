import Logger from 'util/logger';
import Vector from 'engine/math/vector';

const log = Logger.get('graphic-layer').level(Logger.DEBUG);
const POINT_SIZE = 10;

const drawPoint = (context, v) => {
  context.lineWidth = 2;
  context.strokeStyle = '#ff0000';
  context.beginPath();
  context.moveTo(v.x - POINT_SIZE, v.y);
  context.lineTo(v.x + POINT_SIZE, v.y);
  context.stroke();
  context.moveTo(v.x, v.y - POINT_SIZE);
  context.lineTo(v.x, v.y + POINT_SIZE);
  context.stroke();
};

const drawRect = (context, v1, v2) => {
  context.lineWidth = 2;
  context.strokeStyle = '#ff0000';
  context.strokeRect(v1.x, v1.y, (v2.x - v1.x), (v2.y - v1.y));
};

export default class GraphicLayer {

  constructor(engine) {
    this.camera = engine.camera;
    this.canvas = document.getElementById('graphic');
    this.items = [
      { type: 'point', v: new Vector(-1.2368438539288882, 0.3177863771964916) },
      { type: 'point', v: new Vector(0.2628244708134985, -0.0023008245187983) },
      { type: 'rec',
        v1: new Vector(-0.7234472380823072, 0.2606681113671335),
        v2: new Vector(-0.7234472380815247, 0.2606681113667272),
      },
    ];
    engine.on('draw.start', this.draw.bind(this));
  }

  draw() {
    log.debug('draw');
    const context = this.canvas.getContext('2d');
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.items.forEach((item) => {
      if (item.type === 'point') {
        const v = this.camera.cpx2scr(item.v);
        drawPoint(context, v);
      } else if (item.type === 'rec') {
        const v1 = this.camera.cpx2scr(item.v1);
        const v2 = this.camera.cpx2scr(item.v2);
        if (v2.x - v1.x < POINT_SIZE || v2.y - v1.y < POINT_SIZE) {
          drawPoint(context, v1.midPoint(v2));
        } else {
          drawRect(context, v1, v2);
        }
      } else {
        throw new Error('unknown graphic');
      }
    });
  }

}
