import { updateSet } from "./set";
import { Dispatch } from "@reduxjs/toolkit";
import Engine from "../engine/engine";
import { Root } from "./reducer";
import { param } from "../params";

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
    new Promise(resolve => setTimeout(() => resolve(), duration));

  // compute number of pixels in 10% fringe and trigger a redrawing if this
  // number is above a threshold
  const analysePicture2 = () => {
    const histo = engine.getHistogram();
    const nbPixels = engine.ctx.camera.screen.x * engine.ctx.camera.screen.y;
    const iter = engine.ctx.iter;
    let nb = 0;
    for (let i = Math.round(iter * 0.9); i <= iter; i += 1) {
      nb += histo[i];
    }
    const perc = (100 * nb) / nbPixels;
    const shouldIncrease = perc > 0.2;
    const shouldDecrease = perc < 0.05;
    const txt = `10% fringe is ${nb}px or ${perc.toFixed(2)}%`;
    return { shouldIncrease, shouldDecrease, txt };
  };

  // @ts-ignore
  engine.draw = async () => {
    try {
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

      // perform a normal drawing
      await draw({ details: "normal", id });
      if (frameId !== id) return;

      // analyze, then increase iterations if needed
      let analysis: any = analysePicture2();
      while (analysis.shouldIncrease) {
        const newIter = Math.round(engine.ctx.iter * 1.5);
        // console.log(`+ iter ${engine.ctx.iter} -> ${newIter}: ${analysis.txt}`);
        dispatch(updateSet({ iter: newIter }));
        engine.ctx.iter = newIter;
        await draw({ details: "normal", id });
        if (frameId !== id) return;
        analysis = analysePicture2();
      }
      if (analysis.shouldDecrease) {
        const newIter = Math.round(Math.max(50, engine.ctx.iter / 1.5));
        // console.log(`- iter ${engine.ctx.iter} -> ${newIter}: ${analysis.txt}`);
        dispatch(updateSet({ iter: newIter }));
        engine.ctx.iter = newIter;
      }

      // wait one sec, then supersample
      if (param.supersampling) {
        await sleep(1000);
        if (frameId !== id) return;
        await draw({ details: "supersampling", size: 4, id });
      }
    } catch (err) {
      // ignore interrupted frames
    }
  };
}
