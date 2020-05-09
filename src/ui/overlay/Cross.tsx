import React from "react";
import Vector from "../../engine/math/vector";

export type PoiProps = {
  scr: Vector;
};

const Cross = (props: PoiProps) => {
  const { scr } = props;
  const style = {
    transform: `translate(${scr.x}px, ${scr.y}px) translate(-50%, -50%)`,
  };
  return (
    <div className="cross" style={style}>
      <div className="h1"></div>
      <div className="h2"></div>
      <div className="v1"></div>
      <div className="v2"></div>
    </div>
  );
};

export default Cross;
