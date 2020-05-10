import React from "react";
import Pois from "./Pois";
import state from "../../logic/state";
import { view } from "@risingstack/react-easy-state";

const Overlay = view(() => {
  const { showSquare, showPois } = state.ui;

  return (
    <div className="pois offset">
      {showSquare ? (
        <div className="squares">
          <div className="square" />
          <div className="third" />
        </div>
      ) : null}
      {showPois ? <Pois /> : null}
    </div>
  );
});

export default Overlay;
