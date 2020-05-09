import React from "react";
import Poi from "./Poi";
import { Root } from "../../redux/reducer";
import Camera from "../../engine/math/camera";
import Vector from "../../engine/math/vector";
import { createSelector } from "@reduxjs/toolkit";
import Matrix from "../../engine/math/matrix";
import { useSelector } from "react-redux";
import { poiDb } from "../../engine/pois";
import Cross from "./Cross";

// create a camera reselector
const set = (state: Root) => state.set;
const screen = (state: Root) => state.ui.screen;
const cameraSelector = createSelector(set, screen, (set, screen) => {
  return new Camera(
    new Vector(screen.width, screen.height),
    new Vector(set.x, set.y),
    set.w,
    Matrix.fromRaw(set.viewport),
  );
});

const CROSS_THRESHOLD = 50; // screen size of a poi before switching from cross to full
const AGG_THRESHOLD = 15; // aggregation threshold of crosses

const Pois = () => {
  const camera = useSelector((state: Root) => cameraSelector(state));
  const screen = useSelector((state: Root) => state.ui.screen);
  const fractalId = useSelector((state: Root) => state.set.fractalId);

  const pois = (poiDb[fractalId] || []).map(poi => ({
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
    poi => poi.width >= CROSS_THRESHOLD && poi.width < screen.min * 2,
  );
  const htmlFullPois = full.map(poi => (
    <Poi key={poi.id} camera={camera} screen={screen} {...poi} />
  ));
  return (
    <div>
      {htmlFullPois}
      {htmlCrosses}
    </div>
  );
};

export default Pois;
