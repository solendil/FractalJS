import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Fractal from "./pages/Fractal";
import Palette from "./pages/Palette";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Debug from "./pages/Debug";
import { useDispatch, useSelector } from "react-redux";
import { Root } from "../redux/reducer";
import { setDrawer } from "../redux/ui";
import Divider from "@material-ui/core/Divider";
import MyToolbar from "./Toolbar";

export const navigation: { [key: string]: any } = {
  fractal: { icon: "home", component: <Fractal /> },
  palette: { icon: "invert_colors", component: <Palette /> },
  settings: { icon: "settings", component: <Settings /> },
  about: { icon: "info_outline", component: <About /> },
  debug: { hidden: true, component: <Debug /> },
};

const useStyles = makeStyles((theme) => ({
  appBar: {
    top: "auto",
    bottom: 0,
  },
  drawer: {
    minWidth: "360px",
    [theme.breakpoints.up("sm")]: {
      width: "360px",
    },
  },
  trans: {
    // if we wanna make a transparent background
    // backgroundColor: "rgb(255, 255, 255, 0.85)",
    // backdropFilter: "blur(5px)",
    [theme.breakpoints.only("xs")]: {
      borderTopLeftRadius: "10px",
      borderTopRightRadius: "10px",
    },
  },
  handle: {
    width: "33%",
    margin: "4px auto -2px auto",
    height: "4px",
  },
}));

const Navigation = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { drawer, tab } = useSelector((state: Root) => ({
    drawer: state.ui.drawer,
    tab: state.ui.tab,
  }));
  const bigDevice = useMediaQuery("(min-width:450px)");
  const content = navigation[tab || "fractal"].component;

  return (
    <>
      <MyToolbar />
      <SwipeableDrawer
        anchor={bigDevice ? "left" : "bottom"}
        open={drawer}
        disableDiscovery
        disableSwipeToOpen
        PaperProps={{ className: classes.trans }}
        BackdropProps={{ invisible: true }}
        onClose={() => dispatch(setDrawer(false))}
        onOpen={() => dispatch(setDrawer(true))}
      >
        <div className={classes.drawer}>
          {!bigDevice ? <Divider className={classes.handle} /> : null}
          {content}
        </div>
      </SwipeableDrawer>
    </>
  );
};

export default Navigation;
