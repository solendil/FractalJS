import React from "react";
import Poi from "./Poi";
import Camera from "../../engine/math/camera";
import Vector from "../../engine/math/vector";
import Matrix from "../../engine/math/matrix";
import { poiDb } from "../../engine/pois";
import Cross from "./Cross";
import state from "../../logic/state";
import { view } from "@risingstack/react-easy-state";

const CROSS_THRESHOLD = 50; // screen size of a poi before switching from cross to full
const AGG_THRESHOLD = 15; // aggregation threshold of crosses

const Pois = view(() => {
  const { ui, set } = state;

  const camera = new Camera(
    new Vector(ui.screen.width, ui.screen.height),
    new Vector(set.x, set.y),
    set.w,
    Matrix.fromRaw(set.viewport),
  );
  const min = Math.min(ui.screen.width, ui.screen.height);

  const pois = (poiDb[set.fractalId] || []).map(poi => ({
    ...poi,
    width: poi.w * camera.matrix_inv.a,
  }));

  const crosses = pois
    .filter(poi => poi.width < CROSS_THRESHOLD)
    .map(poi => ({
      ...poi,
      scr: camera.cpx2scr(new Vector(poi.x, poi.y)),
    }));
  const aggs: typeof crosses = [];
  crosses.forEach(poi => {
    for (let agg of aggs) {
      if (poi.scr.distanceTo(agg.scr) < AGG_THRESHOLD) return;
    }
    aggs.push(poi);
  });

  const htmlCrosses = aggs.map(poi => <Cross key={poi.id} {...poi} />);

  const full = pois.filter(
    poi => poi.width >= CROSS_THRESHOLD && poi.width < min * 2,
  );
  const htmlFullPois = full.map(poi => (
    <Poi key={poi.id} camera={camera} screen={ui.screen} {...poi} />
  ));
  return (
    <div>
      {htmlFullPois}
      {htmlCrosses}
    </div>
  );
});

export default Pois;
