import React, { useRef } from "react";
import "./App.scss";
import Navigation from "./Navigation";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { initEngine } from "../logic/logic";
import InfoBox from "./InfoBox";
import Snackbar from "./Snackbar";
import Overlay from "./overlay/Overlay";
import state from "../logic/state";
import { view } from "@risingstack/react-easy-state";

const App = view(() => {
  const canvasRef = useRef(null);
  const canvasGuideRef = useRef(null);
  const { isDrawer, tab } = state.ui;
  const bigDevice = useMediaQuery("(min-width:450px)");

  React.useEffect(() => {
    const canvas = (canvasRef.current as unknown) as HTMLCanvasElement;
    const canvasGuide = (canvasGuideRef.current as unknown) as HTMLCanvasElement;
    initEngine(canvas, canvasGuide);
  }, []);

  let offsetClass = "";
  if (isDrawer) offsetClass = bigDevice ? "offset-left" : `offset-top-${tab}`;

  return (
    <div className={`main ${offsetClass}`}>
      <canvas ref={canvasRef} className="offset"></canvas>
      <canvas ref={canvasGuideRef} className="offset guide"></canvas>
      <Overlay />
      <Navigation />
      <InfoBox />
      <Snackbar />
    </div>
  );
});

export default App;
