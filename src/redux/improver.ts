import { updateSet } from "./set";
import { Dispatch } from "@reduxjs/toolkit";
import Engine from "../engine/engine";

/*
The improver hijacks engine to use a more complex rendering; so it's
implemented as a function and a closure instead of a class (whose 'this'
would have been messy)
*/
export default function Improver(engineArg: Engine, dispatch: Dispatch<any>) {
  const engine = engineArg;
  const draw = engine.draw.bind(engine);
  let frameId = 0;
  let lastState = "";

  const sleep = (duration: number) =>
    new Promise(resolve => setTimeout(() => resolve(), duration));

  const analysePicture = () => {
    // takes the same old algorithm
    const iter = engine.ctx.iter;
    const histo = engine.getHistogram();
    const nbTotal = histo.reduce((acc, val) => acc + val, 0);
    const nbInSet = histo[0];
    let minIter = Number.MAX_VALUE;
    let maxIter = -1;
    for (let i = 0; i < histo.length; i += 1) {
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
    // console.log(`asked ${iter} observed [${minIter}-${maxIter}]=${iterRange}, fringe ${fringe10p}`);
    // console.log(`${nbTotal} pixels, ${nbInSet} in set -> ${percInSet.toFixed(2)}%`);
    // console.log(`${percFringe10p.toFixed(2)}% in fringe`);
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

    // first normal drawy
    await draw({ details: "normal", id });
    if (frameId !== id) return;

    // increase/decrease iterations if required
    let analysis = analysePicture();
    while (analysis.shouldIncrease || analysis.shouldDecrease) {
      if (frameId !== id) return;
      const iter = engine.ctx.iter;
      if (analysis.shouldIncrease) {
        dispatch(updateSet({ iter: iter * 1.5 }));
        engine.ctx.iter = Math.round(iter * 1.5);
      } else if (analysis.shouldDecrease) {
        dispatch(updateSet({ iter: iter / 1.5 }));
        engine.ctx.iter = Math.round(iter / 1.5);
      }
      await draw({ details: "normal", id });
      analysis = analysePicture();
    }

    // wait one sec, then supersample
    await sleep(1000);
    if (frameId !== id) return;
    await draw({ details: "supersampling", size: 4, id });
  };
}
