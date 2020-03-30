import { FractalDef } from "./fractals/example";

// @ts-ignore
const context = require.context("./fractals/", true, /\.([jt]s)$/);

const byId: { [key: string]: FractalDef } = {};
context.keys().forEach((filename: string) => {
  const obj = context(filename).default;
  byId[obj.id] = obj;
});

export const getFunction = (id: string, smooth: boolean) => {
  const res = byId[id];
  if (smooth) return res.fn.smooth || res.fn.normal;
  return res.fn.normal;
};

export const getPreset = (id: string) => {
  const res = byId[id];
  return { type: id, ...res.preset };
};

export const listForUi = () =>
  Object.values(byId)
    .filter(f => !f.hidden)
    .sort((a, b) => (a.uiOrder || 0) - (b.uiOrder || 0));
