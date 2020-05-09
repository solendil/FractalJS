import React from "react";
import { Root } from "../../redux/reducer";
import { useSelector } from "react-redux";
import Pois from "./Pois";

const Overlay = () => {
  const square = useSelector((state: Root) => state.ui.square);
  const showPois = useSelector((state: Root) => state.ui.showPois);

  return (
    <div className="pois offset">
      {square ? (
        <div className="squares">
          <div className="square" />
          <div className="third" />
        </div>
      ) : null}
      {showPois ? <Pois /> : null}
    </div>
  );
};

export default Overlay;
