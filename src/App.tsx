import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setDrawer } from "./redux/ui";
import Drawer from "./components/Drawer";
import InfoBox from "./components/InfoBox";
import { initEngine } from "./redux/engine";
import { Root } from "./redux/reducer";
import Snackbar from "@material-ui/core/Snackbar";

function App() {
  const dispatch = useDispatch();
  const ref = useRef(null);
  const { ui } = useSelector((state: Root) => ({
    ui: state.ui,
  }));

  React.useEffect(() => {
    const canvas = (ref.current as unknown) as HTMLCanvasElement;
    dispatch(initEngine(canvas));
  }, [dispatch]);

  return (
    <>
      <canvas ref={ref} className={ui.drawer ? "offset" : ""}></canvas>
      <div className="burger" onClick={() => dispatch(setDrawer(true))}>
        <i className="material-icons">menu</i>
      </div>
      <Drawer />
      <InfoBox />
      {ui.snack ? (
        <Snackbar
          open={true}
          message="Sorry, FractalJS cannot zoom further..."
        ></Snackbar>
      ) : null}
    </>
  );
}

export default App;
