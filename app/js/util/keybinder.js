/* global document */
/* eslint-disable quote-props, object-property-newline, no-restricted-syntax */

export default (function IIFE() { // a small ad-hoc keyboard library
  const keymap = [];
  const map = {
    'left': 37, 'up': 38, 'right': 39, 'down': 40,
    '+': 107, '-': 109, 'H': 72, 'R': 82, 'S': 83, 'V': 86,
    'W': 87,
  };
  const bindings = [];
  document.addEventListener('keyup', (evt) => {
    keymap[evt.keyCode] = false;
  });
  document.addEventListener('keydown', (evt) => {
    keymap[evt.keyCode] = true;
    const modifier = evt.shiftKey ? 1 / 10 : 1;
    for (const binding of bindings) {
      const match = binding.combo.every(k => keymap[k]);
      if (match) { binding.func(modifier); return; }
    }
  });
  const bind = (keys_str, func) => {
    const keys = keys_str.split(' ');
    const keycodes = [];
    for (const key of keys) {
      if (!(key in map)) throw new Error(`Unknown key${key}`);
      keycodes.push(map[key]);
    }
    bindings.push({ combo: keycodes, func });
    bindings.sort((a, b) => b.combo.length - a.combo.length);
  };
  return { bind };
}());
