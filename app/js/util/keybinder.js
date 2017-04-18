/* global document */
/* eslint-disable quote-props, object-property-newline, no-restricted-syntax */

export default (function IIFE() { // a small ad-hoc keyboard library
  const keymap = [];
  const map = {
    'left': 37, 'up': 38, 'right': 39, 'down': 40,
    '+': 107, '-': 109, 'esc': 27,
    'A': 65,
    'B': 66,
    'C': 67,
    'D': 68,
    'E': 69,
    'F': 70,
    'G': 71,
    'H': 72,
    'I': 73,
    'J': 74,
    'K': 75,
    'L': 76,
    'M': 77,
    'N': 78,
    'O': 79,
    'P': 80,
    'Q': 81,
    'R': 82,
    'S': 83,
    'T': 84,
    'U': 85,
    'V': 86,
    'W': 87,
    'X': 88,
    'Y': 89,
    'Z': 90,
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
