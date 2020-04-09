import React, { useRef } from "react";
import "./App.scss";
import { useSelector, useDispatch } from "react-redux";
import { Root } from "../redux/reducer";
import Navigation from "./Navigation";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { initEngine } from "../redux/rdxengine";
import InfoBox from "./InfoBox";
import Snackbar from "./Snackbar";

const App = () => {
  const dispatch = useDispatch();
  const ref = useRef(null);
  const ui = useSelector((state: Root) => state.ui);
  const bigDevice = useMediaQuery("(min-width:450px)");

  React.useEffect(() => {
    const canvas = (ref.current as unknown) as HTMLCanvasElement;
    dispatch(initEngine(canvas));
  }, [dispatch]);

  let canvasClass = "";
  if (ui.drawer)
    canvasClass = bigDevice ? "offset-left" : `offset-top-${ui.tab}`;

  return (
    <div>
      <canvas ref={ref} className={canvasClass}></canvas>
      <Navigation />
      <InfoBox />
      <Snackbar />
    </div>
  );
};

export default App;
