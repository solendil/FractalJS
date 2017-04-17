import fs from 'fs';
import { PNG } from 'node-png';
import Twitter from 'twitter';
import Engine from '../engine/main';
import Palette from '../util/palette';
import Canvas from './canvas';

const WIDTH = 2048;
const HEIGHT = 1024;

// simulate browser environment
global.navigator = { hardwareConcurrency: 1 };
global.performance = { now() { return Date.now(); } };

export function renderOnCanvas(desc, color) {
  const canvas = new Canvas(WIDTH, HEIGHT);
  const params = {
    canvas,
    ...desc,
    colors: {
      ...color,
      buffer: Palette.getBufferFromId(color.id, 1000),
    }
  };
  const engine = new Engine(params);
  return engine.draw({ details: 'normal' })
  .then(() => engine.draw({ details: 'supersampling', size: 4 }))
  .then(() => {
    const buffer = canvas.buffer;
    return new Uint8Array(buffer);
  });
}

export function getUserHome() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

export function getPngBuffer(array) {
  return new Promise((resolve, reject) => {
    const png = new PNG({
      width: WIDTH,
      height: HEIGHT,
      filterType: -1
    });
    for (let i = 0; i < WIDTH * HEIGHT * 4; i += 1) {
      png.data[i] = array[i];
    }

    const dst = fs.createWriteStream(`${getUserHome()}/.fjs.png`);
    png.pack().pipe(dst); // stupid PNG library... !
    dst.on('finish', () => {
      resolve();
    });
  });
}

export function tweet(credentials, text) {
  const image = fs.readFileSync(`${getUserHome()}/.fjs.png`);
  return new Promise((resolve, reject) => {
    const client = new Twitter(credentials);
    client.post('media/upload', { media: image }, (error, media, response) => {
      if (!error) {
        const status = {
          status: text,
          media_ids: media.media_id_string,
        };
        client.post('statuses/update', status, (error, tweet, response) => {
          if (!error) {
            console.log('tweet OK');
            resolve(tweet);
          } else {
            console.log(error);
            reject(error);
          }
        });
      } else {
        console.log(error);
        reject(error);
      }
    });
  });
}
