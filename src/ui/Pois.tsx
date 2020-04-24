import React from "react";
import Poi from "./Poi";
import { Root } from "../redux/reducer";
import Camera from "../engine/math/camera";
import Vector from "../engine/math/vector";
import { createSelector } from "@reduxjs/toolkit";
import Matrix from "../engine/math/matrix";
import { useSelector } from "react-redux";
import { poiDb } from "../engine/pois";

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

const Pois = () => {
  const camera = useSelector((state: Root) => cameraSelector(state));
  const screen = useSelector((state: Root) => state.ui.screen);
  const fractalId = useSelector((state: Root) => state.set.fractalId);

  const pois = poiDb[fractalId] || [];

  const hpois = pois.map((poi, i) => (
    <Poi key={i} camera={camera} screen={screen} {...poi} />
  ));
  return <div>{hpois}</div>;
};

export default Pois;
