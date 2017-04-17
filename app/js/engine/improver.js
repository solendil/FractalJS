import Logger from '../util/logger';

const log = Logger.get('improver').level(Logger.INFO);

/*
The improver hijacks engine to use a more complex rendering; so it's
implemented as a function and a closure instead of a class (whose 'this'
would have been messy)
*/
export default function Improver(engineArg) {
  const engine = engineArg;
  const draw = engine.draw.bind(engine);
  let frameId = 0;
  let lastState = '';

  const checkInterrupt = (id) => {
    if (frameId !== id) throw new Error('interrupted');
  };

  const sleep = duration =>
    (...args) => new Promise(resolve => setTimeout(() => resolve(...args), duration));

  const asyncWhile = (condition, action, ctx) => {
    const whilst = data => (condition.call(ctx, data) ?
      Promise.resolve(action.call(ctx, data)).then(whilst) :
      data);
    return whilst();
  };

  const analysePicture = () => {
    // takes the same old algorithm
    const iter = engine.iter;
    const histo = engine.renderer.getHistogram();
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

  engine.draw = () => {
    // ID detects when a rendering is interrupted
    frameId += 1;
    const id = frameId;

    // state detects when the fractal is drew afresh, needing a coarse rendering first
    const state = engine.type + engine.smooth;
    log.debug('states', state, lastState);
    const start = state !== lastState
      ? draw({ details: 'subsampling', size: 4 })
      : Promise.resolve();
    lastState = state;

    // run algorithm
    start
    .then(() => checkInterrupt(id))
    .then(() => draw({ details: 'normal', id }))
    .then(() => checkInterrupt(id))
    .then(() => asyncWhile( // analyse picture and loop if we should increase iterations
      () => {
        checkInterrupt(id);
        const iterState = analysePicture();
        const iter = engine.iter;
        if (iterState.shouldIncrease) {
          engine.iter = Math.round(iter * 1.5);
          return true;
        } else if (iterState.shouldDecrease) {
          engine.iter = Math.round(iter / 1.5);
          return false; // do not redraw if decreasing is needed
        }
        return false;
      },
      () => draw({ details: 'normal', id })
    ))
    .then(sleep(1000))
    .then(() => checkInterrupt(id))
    .then(() => draw({ details: 'supersampling', size: 4, id }))
    .catch((err) => {
      log.debug(`frame ${id} interrupted`, err);
    });
  };
}
