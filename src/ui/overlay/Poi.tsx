import React from "react";
import Camera from "../../engine/math/camera";
import Matrix from "../../engine/math/matrix";

export type PoiProps = {
  name: string;
  x: number;
  y: number;
  w: number;
  camera: Camera;
  screen: {
    height: number;
    width: number;
  };
};

const Poi = (props: PoiProps) => {
  const { x, y, w, camera } = props;

  // first we need a matrix that converts 0,0; width,width of div to complex plane
  // prettier-ignore
  const m = Matrix.GetTriangleToTriangle(
    0, 0, 0, 360, 360, 360,
    x - w/2, y + w/2,
    x - w/2, y - w/2,
    x + w/2, y - w/2,
  )

  const m2 = camera.matrix_inv.multiply(m);
  const style = {
    transform: `matrix(${m2.a}, ${m2.b}, ${m2.c}, ${m2.d}, ${m2.e}, ${m2.f})`,
  };
  return (
    <div className="poi" style={style}>
      <div className="frame"></div>
      <div className="bottom">
        {props.name}
        {/* <button
          onClick={() => {
            console.log("tickle!");
          }}
        >
          <i className="material-icons">info_outline</i>
        </button>
        <button>
          <i className="material-icons">where_to_vote</i>
        </button> */}
      </div>
    </div>
  );
};

export default Poi;
