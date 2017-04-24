/* global history, document, window */
import Logger from '../util/logger';
import Matrix from '../engine/math/matrix';

const log = Logger.get('ui').level(Logger.DEBUG);
const mapNbToType = ['mandelbrot', 'mandelbrot3', 'burningship', 'tippetts', '', '', 'mandelbrot4'];

export default class Url {

  static update(engine, color) {
    try {
      const args = [];
      args.push(['t', engine.type]);
      args.push(['x', engine.camera.x]);
      args.push(['y', engine.camera.y]);
      args.push(['w', engine.camera.w]);
      args.push(['i', engine.iter]);
      args.push(['fs', engine.smooth ? 1 : 0]);
      if (color) {
        args.push(['ct', color.id]);
        args.push(['co', Math.round(color.offset * 100)]);
        args.push(['cd', +color.density.toFixed(2)]);
      }
      if (!engine.camera.affineMatrix.isIdentity()) {
        args.push(['va', engine.camera.affineMatrix.a.toFixed(4)]);
        args.push(['vb', engine.camera.affineMatrix.b.toFixed(4)]);
        args.push(['vc', engine.camera.affineMatrix.c.toFixed(4)]);
        args.push(['vd', engine.camera.affineMatrix.d.toFixed(4)]);
      }
      log.debug(args);
      const str = args.reduce((acc, arg) => `${acc}&${arg[0]}_${arg[1]}`, '');
      history.replaceState('', '', `#B${str.substr(1)}`);
    } catch (e) {
      log.error('Could not set URL', e);
    }
  }

  // http://stackoverflow.com/questions/21797299/convert-base64-string-to-arraybuffer
  static base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  static readOldScheme(url) {
    let base64String = url.substr(2);
    base64String = base64String.split('*').join('/');
    base64String = base64String.split('_').join('=');
    const buffer = Url.base64ToArrayBuffer(base64String);
    const byteArray = new Uint8Array(buffer);
    const intArray = new Uint16Array(buffer);
    const doubleArray = new Float64Array(buffer);
    const floatArray = new Float32Array(buffer);
    const flags = byteArray[36];
    const desc = {
      x: doubleArray[1],
      y: -doubleArray[2],
      w: doubleArray[3],
      iter: intArray[1],
      type: byteArray[4],
      smooth: (flags & 0x1) === 1 // eslint-disable-line no-bitwise
    };
    if (!isNaN(desc.type)) desc.type = mapNbToType[desc.type];
    const color = {
      offset: intArray[3] / 10000.0,
      density: byteArray.length > 32 ? floatArray[8] : 20,
      id: byteArray[5],
    };
    log.debug('read old URL scheme', desc, color);
    return [desc, color];
  }

  static readCurrentScheme(url) {
    const str = url.substr(2);
    const tuples = str.split('&');
    const map = tuples.reduce((acc, tuple) => {
      const parts = tuple.split('_');
      return Object.assign(acc, { [parts[0]]: parts[1] });
    }, {});
    const desc = {
      x: parseFloat(map.x),
      y: parseFloat(map.y),
      w: parseFloat(map.w),
      iter: parseInt(map.i, 10),
      type: map.t,
      smooth: parseInt(map.fs, 10) === 1,
    };
    if (!isNaN(desc.type)) desc.type = mapNbToType[desc.type];
    if ('va' in map) {
      desc.viewport = new Matrix(parseFloat(map.va), parseFloat(map.vb),
        parseFloat(map.vc), parseFloat(map.vd), 0, 0);
    }
    const color = {
      offset: parseInt(map.co, 10) / 100.0,
      density: parseFloat(map.cd),
      id: parseInt(map.ct, 10),
    };
    log.debug('read new scheme', desc, color);
    return [desc, color];
  }

  static read() {
    try {
      const url = document.location.hash;
      if (url.startsWith('#A')) {
        return Url.readOldScheme(url);
      } else if (url.startsWith('#B')) {
        return Url.readCurrentScheme(url);
      }
    } catch (e) {
      log.error('Could not read URL', e);
    }
    return null;
  }

}
