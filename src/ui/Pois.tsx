import React from "react";
import Poi from "./Poi";
import { Root } from "../redux/reducer";
import Camera from "../engine/math/camera";
import Vector from "../engine/math/vector";
import { createSelector } from "@reduxjs/toolkit";
import Matrix from "../engine/math/matrix";
import { useSelector } from "react-redux";

const pois = [
  {
    name: "The Mandelbrot set",
    x: -0.7700865783521146,
    y: 0.0005149610839296841,
    w: 3.2541397276576007,
  },
  {
    name: "The seahorse valley",
    x: -0.8850169319618038,
    y: 0.20430236940113136,
    w: 0.5341582685511642,
  },
  {
    name: 'Double-spirals on the left, "seahorses" on the right',
    x: -0.761898850758455,
    y: 0.13624533125298993,
    w: 0.06172323608813737,
  },
  {
    name: '"Seahorse" upside down',
    x: -0.7434670975470078,
    y: 0.1264225543830674,
    w: 0.01619893159287557,
  },
  {
    name: "Seahorse tail",
    x: -0.7435575011333871,
    y: 0.13141411010448878,
    w: 0.0023624968121003496,
  },
  {
    name: "Part of the tail",
    x: -0.7436534729475947,
    y: 0.13188172343759305,
    w: 0.0007349349876731434,
  },
  {
    name: "Satellite",
    x: -0.7436414448061901,
    y: 0.13182674539039832,
    w: 0.00012108054070541848,
  },
  {
    name: "Satellite",
    x: -0.7436431541413343,
    y: 0.13182586483571457,
    w: 0.000014770086109824968,
  },
  {
    name: '"Antenna" of the satellite',
    x: -0.7436447696546592,
    y: 0.13182527423151064,
    w: 0.000002970883958121094,
  },
  {
    name: 'The "seahorse valley" of the satellite',
    x: -0.7436441018154397,
    y: 0.13182604877870288,
    w: 6.725696241359014e-7,
  },
  {
    name: "Double-spirals",
    x: -0.7436438803098491,
    y: 0.13182591847076758,
    w: 1.6094281332162775e-7,
  },
  {
    name: "Satellites of second order",
    x: -0.7436438993338419,
    y: 0.13182589080585413,
    w: 5.0066736140673944e-8,
  },
  {
    name: "Island",
    x: -0.7436438886058956,
    y: 0.13182590433282593,
    w: 4.1947898743490354e-9,
  },
  {
    name: "Double hook",
    x: -0.7436438871772372,
    y: 0.13182590424946874,
    w: 6.117797120607018e-10,
  },
  {
    name: "Islands",
    x: -0.7436438870371828,
    y: 0.13182590420568097,
    w: 5.260191508094819e-11,
  },
  {
    name: "Detail of one island",
    x: -0.7436438870365094,
    y: 0.13182590421022766,
    w: 7.448163315952692e-12,
  },
  {
    name: "Detail of the spiral",
    x: -0.7436438870357782,
    y: 0.13182590421248866,
    w: 4.2535996934475523e-13,
  },

  // {
  //   name: "Elephant",
  //   x: 0.2825978775030779,
  //   y: -0.010978200650106018,
  //   w: 0.005987463867743684,
  // },
  // {
  //   name: "Seahorse",
  //   x: -0.7379797261608151,
  //   y: 0.1869569729939288,
  //   w: 0.02890034448399989,
  // },
  // {
  //   name: "Minibrot",
  //   x: -0.1964902184253448,
  //   y: 1.1000787533156122,
  //   w: 2.801531551489556e-7,
  // },
];

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

  const hpois = pois.map((poi, i) => (
    <Poi key={i} camera={camera} screen={screen} {...poi} />
  ));
  return <div>{hpois}</div>;
};

export default Pois;
