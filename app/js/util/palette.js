import * as util from './util';

const standardGradients = {
  0: '0#080560;0.2#2969CB;0.40#F1FEFE;0.60#FCA425;0.85#000000',
  1: '0.0775#78591e;0.55#d6e341', // gold
  2: '0#0000FF;0.33#FFFFFF;0.66#FF0000', // bleublancrouge
  3: '0.08#09353e;0.44#1fc3e6;0.77#08173e', // night
  4: '0#000085;0.25#fffff5;0.5#ffb500;0.75#9c0000', // defaultProps
  5: '0#000000;0.25#000000;0.5#7f7f7f;0.75#ffffff;0.975#ffffff', // emboss
  // flatUI palettes (http://designmodo.github.io/Flat-UI/)
  10: '0#000000;0.25#16A085;0.5#FFFFFF;0.75#16A085', // green sea
  11: '0#000000;0.25#27AE60;0.5#FFFFFF;0.75#27AE60', // nephritis
  12: '0#000000;0.25#2980B9;0.5#FFFFFF;0.75#2980B9', // nephritis
  13: '0#000000;0.25#8E44AD;0.5#FFFFFF;0.75#8E44AD', // wisteria
  14: '0#000000;0.25#2C3E50;0.5#FFFFFF;0.75#2C3E50', // midnight blue
  15: '0#000000;0.25#F39C12;0.5#FFFFFF;0.75#F39C12', // orange
  16: '0#000000;0.25#D35400;0.5#FFFFFF;0.75#D35400', // pumpkin
  17: '0#000000;0.25#C0392B;0.5#FFFFFF;0.75#C0392B', // pmoegranate
  18: '0#000000;0.25#BDC3C7;0.5#FFFFFF;0.75#BDC3C7', // silver
  19: '0#000000;0.25#7F8C8D;0.5#FFFFFF;0.75#7F8C8D', // asbestos
};

export default class Palette {

  static buildBufferFromStringGradient(resolution, gradient) {
    const indices = [];
    const reds = [];
    const greens = [];
    const blues = [];

    const buildStops = (str) => {
      str.split(';').forEach((stop) => {
        const items = stop.split('#');
        indices.push(Number(items[0]));
        reds.push(parseInt(items[1].substring(0, 2), 16));
        greens.push(parseInt(items[1].substring(2, 4), 16));
        blues.push(parseInt(items[1].substring(4, 6), 16));
      });
    };

    const buffer = new Int32Array(resolution);
    const buildBuffer = () => {
      // loop first stop to end
      indices.push(indices[0] + 1);
      reds.push(reds[0]);
      greens.push(greens[0]);
      blues.push(blues[0]);

      const interR = util.createInterpolant(indices, reds);
      const interG = util.createInterpolant(indices, greens);
      const interB = util.createInterpolant(indices, blues);

      const byteBuffer = new Uint8Array(buffer.buffer); // create an 8-bit view on the buffer
      let bufferIndex = 0;
      for (let i = 0; i < resolution; i += 1) {
        let floatIndex = i / resolution;
        if (floatIndex < indices[0]) floatIndex += 1;
        byteBuffer[bufferIndex + 0] = interR(floatIndex);
        byteBuffer[bufferIndex + 1] = interG(floatIndex);
        byteBuffer[bufferIndex + 2] = interB(floatIndex);
        byteBuffer[bufferIndex + 3] = 255;
        bufferIndex += 4;
      }
    };

    buildStops(gradient);
    buildBuffer();
    return buffer;
  }

  static getBufferFromId(id, res = 400) {
    return Palette.buildBufferFromStringGradient(res, standardGradients[id]);
  }

}

