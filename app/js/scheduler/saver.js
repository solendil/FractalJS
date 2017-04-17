import binder from '../util/keybinder';
import * as util from '../util/util';

const SIZE = 120;
export const KEY = 'saved-pictures';

export default class Saver {

  constructor() {
    binder.bind('W', () => { this.save(); });
  }

  save() {
    console.log('save');

    // create a small canvas and copy big one into it
    const canvas = document.getElementById('main');
    const thumbnail = document.createElement('canvas');
    thumbnail.width = SIZE;
    thumbnail.height = SIZE;
    const context = thumbnail.getContext('2d');
    if (canvas.width >= canvas.height) {
      context.drawImage(canvas,
        (canvas.width - canvas.height) / 2, 0, canvas.height, canvas.height,
        0, 0, SIZE, SIZE);
    } else {
      context.drawImage(canvas,
        0, (canvas.height - canvas.width) / 2, canvas.width, canvas.width,
        0, 0, SIZE, SIZE);
    }
    const data = thumbnail.toDataURL('image/jpeg', 0.5);
    const id = `PIC_${util.guid()}`;
    // document.write(`<img src="${data}"></img>`);

    const saveds = localStorage.getItem(KEY);
    const saved = JSON.parse(saveds) || [];

    saved.push({
      location: window.location.hash,
      id,
      time: new Date().getTime(),
    });

    localStorage.setItem(KEY, JSON.stringify(saved));
    localStorage.setItem(id, data);
  }

}
