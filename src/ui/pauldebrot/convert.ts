import { Triple } from "./math";

export const html2rgb = (html: string): Triple => {
  if (html.startsWith("#")) html = html.substring(1);
  const r = parseInt(html.substr(0, 2), 16);
  const g = parseInt(html.substr(2, 2), 16);
  const b = parseInt(html.substr(4, 2), 16);
  return [r, g, b];
};

export const hslp2rgb = ([h, s, l]: Triple): Triple => {
  const hsl = hslp2hsl([h, s, l]);
  const rgb = hslToRgb(hsl);
  return rgb;
};

export const hslp2hsl = ([h, s, l]: Triple): Triple => {
  const nh = (h > 4 ? h - 2 : h / 2) / 6;
  const ns = Math.atan(s) / Math.PI + 0.5;
  const nl = Math.atan(l) / Math.PI + 0.5;
  return [nh, ns, nl];
};

export const hsl2hslp = ([h, s, l]: Triple): Triple => {
  h = h * 6;
  return [
    h < 2 ? h * 2 : h + 2,
    Math.tan((s - 0.5) * Math.PI),
    Math.tan((l - 0.5) * Math.PI),
  ];
};

export const rgb2hslp = (rgb: Triple): Triple => {
  const hsl = rgb2hsl(rgb);
  return hsl2hslp(hsl);
};

export function rgb2hsl([r, g, b]: Triple): Triple {
  var max,
    min,
    h = 0,
    s,
    l,
    d;
  r /= 255;
  g /= 255;
  b /= 255;
  max = Math.max(r, g, b);
  min = Math.min(r, g, b);
  l = (max + min) / 2;
  if (max == min) {
    h = s = 0;
  } else {
    d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}

export const rgb2html = ([r, g, b]: Triple): string => {
  const s = (r << 16) | (g << 8) | b;
  const res = "#" + s.toString(16).padStart(6, "0");
  return res;
};

export const rgb2int = ([r, g, b]: Triple): number => {
  const s = (255 << 24) | (r << 16) | (g << 8) | b;
  return s;
};

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
export function hslToRgb([h, s, l]: Triple): Triple {
  var r, g, b;
  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p: number, q: number, t: number) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
