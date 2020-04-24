import React, { useRef } from "react";
import "./App.scss";
import { useSelector, useDispatch } from "react-redux";
import { Root } from "../redux/reducer";
import Navigation from "./Navigation";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { initEngine } from "../redux/rdxengine";
import InfoBox from "./InfoBox";
import Snackbar from "./Snackbar";
import Overlay from "./Overlay";

const App = () => {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const canvasGuideRef = useRef(null);
  const drawer = useSelector((state: Root) => state.ui.drawer);
  const tab = useSelector((state: Root) => state.ui.tab);
  const bigDevice = useMediaQuery("(min-width:450px)");

  React.useEffect(() => {
    const canvas = (canvasRef.current as unknown) as HTMLCanvasElement;
    const canvasGuide = (canvasGuideRef.current as unknown) as HTMLCanvasElement;
    dispatch(initEngine(canvas, canvasGuide));
  }, [dispatch]);

  let offsetClass = "";
  if (drawer) offsetClass = bigDevice ? "offset-left" : `offset-top-${tab}`;

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
};

export default App;
