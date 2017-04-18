/* eslint-disable camelcase */
/* global window */
import binder from '../util/keybinder';
import Vector from './math/vector';
import Logger from '../util/logger';

const log = Logger.get('controller').level(Logger.INFO);

const ZOOM = 0.3; // 1+
const PAN = 0.1;
const SCALE = 0.1; // 1+
const SHEAR = 0.1;
const ANGLE = Math.PI / 18;

export default class Controller {

  constructor(engine) {
    this.engine = engine;
    this.camera = engine.camera;
    this.setupKeyboard();
    this.setupMouse();
    this.setupConsole();
  }

  // pan the screen by the given vector (as a ratio of its size)
  pan(scr_vector_delta) {
    log.info('pan', scr_vector_delta);
    const cam = this.camera;
    const scr_vector = cam.screenSize.times(scr_vector_delta);
    const cpx_point_0 = cam.scr2cpx(new Vector(0, 0));
    const cpx_point_dest = cam.scr2cpx(scr_vector);
    const cpx_vector = cpx_point_0.minus(cpx_point_dest);
    const cpx_new_point = cam.getPos().plus(cpx_vector);
    cam.setPos(cpx_new_point);
    this.engine.draw();
  }

  // transforms the current viewport
  affineTransform(type, valuex, valuey) {
    log.info('transform', type, valuex, valuey);
    this.camera.affineTransform(type, valuex, valuey);
    this.engine.draw();
  }

  affineReset() {
    this.camera.affineReset();
    this.engine.draw();
  }

  // zoom the screen at the given screen point, using the given delta ratio
  zoom(delta, scr_point_arg) {
    const cam = this.camera;
    if (delta < 1 && cam.isZoomLimit()) {
      this.engine.notify('zoom.limit');
      return;
    }
    // zoom @ center of screen by default
    const scr_point = scr_point_arg || cam.screenSize.times(0.5);
    const cpx_point = cam.scr2cpx(scr_point);
    log.info('zoom', delta, scr_point, cpx_point);
    const cpx_center = cam.getPos();
    // complex vector from point to view center
    const cpx_vector = cpx_center.minus(cpx_point);
    // scale vector and compute new center
    const cpx_new_point = cpx_point.plus(cpx_vector.times(delta));
    cam.setPos(cpx_new_point, cam.w * delta);
    this.engine.draw();
  }

  setupKeyboard() {
    binder.bind('up', Δ => this.pan(new Vector(0, PAN * Δ)));
    binder.bind('down', Δ => this.pan(new Vector(0, -PAN * Δ)));
    binder.bind('right', Δ => this.pan(new Vector(-PAN * Δ, 0)));
    binder.bind('left', Δ => this.pan(new Vector(PAN * Δ, 0)));
    binder.bind('+', Δ => this.zoom(1 / (1 + (ZOOM * Δ))));
    binder.bind('-', Δ => this.zoom(1 + (ZOOM * Δ)));
    binder.bind('V', () => this.affineReset());
    binder.bind('R left', Δ => this.affineTransform('Rotation', -ANGLE * Δ));
    binder.bind('R right', Δ => this.affineTransform('Rotation', +ANGLE * Δ));
    binder.bind('S right', Δ => this.affineTransform('Scale', 1 / (1 + (SCALE * Δ)), 1));
    binder.bind('S left', Δ => this.affineTransform('Scale', 1 + (SCALE * Δ), 1));
    binder.bind('S up', Δ => this.affineTransform('Scale', 1, 1 / (1 + (SCALE * Δ))));
    binder.bind('S down', Δ => this.affineTransform('Scale', 1, 1 + (SCALE * Δ)));
    binder.bind('H right', Δ => this.affineTransform('Shear', -SHEAR * Δ, 0));
    binder.bind('H left', Δ => this.affineTransform('Shear', SHEAR * Δ, 0));
    binder.bind('H up', Δ => this.affineTransform('Shear', 0, -SHEAR * Δ));
    binder.bind('H down', Δ => this.affineTransform('Shear', 0, SHEAR * Δ));
  }

  setupConsole() {
    window.set = (str) => {
      const re = /(-?\d.\d*)/g;
      let reres;
      const res = [];
      while (reres = re.exec(str)) {
        res.push(Number(reres[0]));
      }
      const cam = this.camera;
      if (res.length === 2) cam.setPos(new Vector(res[0], res[1]));
      else if (res.length === 3) cam.setPos(new Vector(res[0], res[1]), res[3]);
      else console.error('Did not found two or three valid numbers', res, res.length);
      this.engine.draw();
    };
  }

  setupMouse() {
    const canvas = this.engine.canvas;
    let isDragging = false;
    let dragStart;
    let cameraStart;

    canvas.addEventListener('mousedown', (e) => {
      const evt = e || window.event;
      if (evt.button !== 0) return;
      isDragging = true;
      dragStart = new Vector(evt.screenX, evt.screenY);
      cameraStart = this.camera.clone();
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      const evt = e || window.event;
      if (isDragging) {
        const pos = new Vector(evt.screenX, evt.screenY);
        const scr_vector = pos.minus(dragStart);
        const cpx_point_0 = cameraStart.scr2cpx(new Vector(0, 0));
        const cpx_point_dest = cameraStart.scr2cpx(scr_vector);
        const cpx_vector = cpx_point_dest.minus(cpx_point_0);
        const cpx_new = cameraStart.getPos().minus(cpx_vector);
        this.camera.setPos(cpx_new);
        this.engine.draw();
      }
    });

    const wheelFunction = (e) => {
      const evt = e || window.event;
      evt.preventDefault();
      const modifier = evt.shiftKey ? 1 / 10 : 1;
      let delta = evt.deltaY || evt.wheelDelta; // IE11 special
      delta = delta > 0 ? 1 + (ZOOM * modifier) : 1 / (1 + (ZOOM * modifier));
      const point = new Vector(evt.offsetX, evt.offsetY);
      this.zoom(delta, point);
    };

    // TODO add event instead of surdefining
    if ('onwheel' in canvas) { // IE11 special
      canvas.onwheel = wheelFunction;
    } else {
      canvas.onmousewheel = wheelFunction;
    }
  }

}
