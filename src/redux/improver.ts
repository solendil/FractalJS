import { updateSet } from "./set";
import { Dispatch } from "@reduxjs/toolkit";
import Engine from "../engine/engine";
import _ from "lodash";
import { Root } from "./reducer";
import { setColorDensity } from "./rdxengine";

/*
The improver hijacks engine to use a more complex rendering; so it's
implemented as a function and a closure instead of a class (whose 'this'
would have been messy)
*/
export default function Improver(
  engineArg: Engine,
  dispatch: Dispatch<any>,
  getState: () => Root,
) {
  const engine = engineArg;
  const draw = engine.draw.bind(engine);
  let frameId = 0;
  let lastState = "";

  const sleep = (duration: number) =>
    new Promise((resolve) => setTimeout(() => resolve(), duration));

  // array contains a count per index; total of this count is 100%
  // this function finds the range in the array that brings back perc% of the values
  // it works by trimming smallest value from start and end until
  const getRangeContaining = (
    array: number[],
    perc: number,
  ): [number, number] => {
    let a = 0;
    let b = array.length - 1;
    let count = _.sum(array);
    const target = count * (perc / 100);
    while (count >= target) {
      if (array[a] < array[b]) {
        count -= array[a];
        a++;
      } else {
        count -= array[b];
        b--;
      }
    }
    return [a, b];
  };

  const analyseColors = (histo: number[]) => {
    console.log(histo);
    const [pa, pb] = getRangeContaining(histo.slice(1), 98);
    console.log(pa, pb);
    const range = pb - pa;
    const resolution = 1000;
    let density = resolution / range;
    density = Math.min(20, density);
    density = Math.max(0.05, density);
    console.log(density);
    dispatch(setColorDensity(density));
  };

  const analysePicture = (histo: number[]) => {
    // takes the same old algorithm
    const iter = engine.ctx.iter;
    const nbTotal = histo.reduce((acc, val) => acc + val, 0);
    const nbInSet = histo[0];
    let minIter = Number.MAX_VALUE;
    let maxIter = -1;
    for (let i = 1; i < histo.length; i += 1) {
      if (histo[i] !== 0) {
        maxIter = i;
        minIter = Math.min(i, minIter);
      }
    }
    const iterRange = maxIter - minIter;
    const fringe10p = iter - Math.ceil(iterRange / 10);
    let nbFringe10p = 0;
    for (let i = fringe10p; i < histo.length; i += 1) {
      nbFringe10p += histo[i];
    }
    const percInSet = (100.0 * nbInSet) / nbTotal;
    const percFringe10p = (100.0 * nbFringe10p) / nbInSet;
    const res = {
      shouldIncrease: false,
      shouldDecrease: false,
    };
    if (percInSet > 1 && percFringe10p > 1) {
      res.shouldIncrease = true;
      // console.log("we should increase iter");
    } else if (percInSet > 1 && percFringe10p > 1) {
      res.shouldDecrease = true;
      // console.log("we should decrease iter");
    } else {
      // console.log("iter is good");
    }
    return res;
  };

  // @ts-ignore
  engine.draw = async () => {
    // ID detects when a rendering is interrupted
    frameId += 1;
    const id = frameId;

    // state detects when the fractal is drew afresh, needing a coarse rendering first
    const state = engine.ctx.fractalId + engine.ctx.smooth;
    if (state !== lastState) {
      await draw({ details: "subsampling", size: 4 });
      if (frameId !== id) return;
    }
    lastState = state;

    // draw, then analyze, then increase iterations if needed
    let analysis: any = {};
    do {
      await draw({ details: "normal", id });
      if (frameId !== id) return;
      const histogram = engine.getHistogram();
      // analyseColors(histogram);
      analysis = analysePicture(histogram);
      if (analysis.shouldIncrease) {
        const iter = engine.ctx.iter;
        dispatch(updateSet({ iter: iter * 1.5 }));
        engine.ctx.iter = Math.round(iter * 1.5);
      }
    } while (analysis.shouldIncrease);

    // wait one sec, then supersample
    await sleep(1000);
    if (frameId !== id) return;
    await draw({ details: "supersampling", size: 4, id });
  };
}
