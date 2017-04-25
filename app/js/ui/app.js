import 'babel-polyfill';
import Vue from 'vue';
import 'social-share-kit';
import './css';
import Logger from '../util/logger';
import * as helper from './helper';
import fractals from '../engine/fractals';
import Palette from '../util/palette';
import Url from './url';
import Vector from '../engine/math/vector';
import setupKeyboard from './keyboard';

console.log(`FractalJS starting (${BUILD_DATE})`);

const log = Logger.get('ui').level(Logger.INFO);
const init = helper.initParams();
const DENSITY = (20 * 20) ** (1 / 100);
let engine;

export default new Vue({
  el: '#fractaljs-app',
  data: {
    fractalTypes: fractals.listForUi().map(f => ({ type: f.id, name: f.name })),
    gradients: helper.createGradients(),
    ui: {
      showSidebar: false,
      showInfobox: false,
      tab: 'fractal',
      isMobile: !!(/Mobi/.test(navigator.userAgent)),
    },
    param: {
      type: init.type,
      smooth: init.smooth,
      gradientId: init.colors.id,
      color: {
        offset: init.colors.offset,
        density: init.colors.density,
      }
    },
    info: {
      global: { x: init.x, y: init.y, w: init.w, iter: init.iter },
      mouse: { x: 0, y: 0, iter: 0 },
    },
    snack: { title: '', visible: false },
    misc: {
      mouse: { x: 0, y: 0 },
      dataurl: '',
      isMouseOnCanvas: false,
      viewportChanged: false,
    }
  },
  computed: {
    sidebarStyle() {
      const width = this.ui.tab === 'welcome' ? 450 : 300;
      return {
        width: `${width}px`,
        left: `-${width + 20}px`,
      };
    }
  },
  created() {
    // welcome page; use this command in console to display again; or click 'About'
    // localStorage.removeItem('visited')
    const firstVisit = !localStorage.getItem('visited');
    localStorage.setItem('visited', new Date().getTime());
    this.ui.tab = firstVisit ? 'welcome' : 'fractal';
    this.ui.showSidebar = firstVisit;
  },
  mounted() {
    engine = helper.initEngine.call(this, init);
    engine.draw();
    window.engine = engine; // for debugging
    helper.initSliders.call(this);
    window.SocialShareKit.init();
    setupKeyboard.call(this);
  },
  methods: {
    toggleSidebar(status) {
      this.ui.showSidebar = status;
    },
    setTab(tabName) {
      log.info('set tab', tabName);
      this.ui.tab = tabName;
    },
    changeFractalType(type) {
      log.info('change fractal type', type);
      this.param.type = type;
      helper.setDensitySlider(100);
      engine.camera.affineReset();
      engine.set({ colors: { density: 20 } });
      engine.set(fractals.getPreset(type));
      engine.draw();
    },
    changeSmooth() {
      log.info('changeSmooth', this.param.smooth);
      engine.smooth = this.param.smooth;
      engine.draw();
    },
    setColorOffset(val) {
      log.info('setColorOffset', val);
      engine.set({ colors: { offset: val } });
      engine.drawColor();
    },
    setColorDensity(val) {
      log.info('setColorDensity', val);
      engine.set({ colors: { density: (1 / 20) * (DENSITY ** val) } });
      engine.drawColor();
    },
    changeGradient(id) {
      log.info('changeGradient', id);
      this.param.gradientId = id;
      engine.set({ colors: {
        buffer: Palette.getBufferFromId(id, 1000),
        id,
      } });
      engine.drawColor();
    },
    downloadPicture() {
      const dataURL = document.getElementById('main').toDataURL('image/png');
      this.misc.dataurl = dataURL;
    },
    onEngineDraw() {
      Url.update(engine, engine.painter);
      this.misc.viewportChanged = !engine.camera.affineMatrix.isIdentity();
      if (this.ui.showInfobox) this.updateInfobox();
    },
    onZoomLimit() {
      this.snack.title = 'Sorry, FractalJS cannot zoom further...';
      this.snack.visible = true;
    },
    // INFOBOX
    updateMouseInfoBox() {
      const cpx = engine.camera.scr2cpx(new Vector(this.misc.mouse.x, this.misc.mouse.y));
      this.info.mouse.x = cpx.x.toFixed(16);
      this.info.mouse.y = cpx.y.toFixed(16);
      this.info.mouse.iter = engine.renderer.getIterationsAt(cpx).toFixed(2);
    },
    updateInfobox() {
      this.info.global.x = engine.camera.x.toFixed(16);
      this.info.global.y = engine.camera.y.toFixed(16);
      this.info.global.w = engine.camera.w.toExponential(2);
      this.info.global.iter = engine.iter;
      if (this.misc.isMouseOnCanvas) this.updateMouseInfoBox();
    },
    onMouseMove(evt) {
      this.misc.mouse.x = evt.offsetX;
      this.misc.mouse.y = evt.offsetY;
      this.updateMouseInfoBox();
    },
    showInfobox() {
      log.info('showInfobox', this.ui.showInfobox);
      this.updateInfobox();
    },
    resetViewport() {
      engine.camera.affineReset();
      engine.draw();
    }
  }
});
