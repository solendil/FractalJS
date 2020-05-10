import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Fractal from "./pages/Fractal";
import Palette from "./pages/Palette";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Debug from "./pages/Debug";
import Divider from "@material-ui/core/Divider";
import MyToolbar from "./Toolbar";
import { view } from "@risingstack/react-easy-state";
import state from "../logic/state";

export const navigation: { [key: string]: any } = {
  fractal: { icon: "collections", component: <Fractal /> },
  palette: { icon: "format_paint", component: <Palette /> },
  settings: { icon: "settings", component: <Settings /> },
  about: { icon: "help", component: <About /> },
  debug: { hidden: true, component: <Debug /> },
};

const useStyles = makeStyles(theme => ({
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

const Navigation = view(() => {
  const classes = useStyles();
  const bigDevice = useMediaQuery("(min-width:450px)"); // TODO change
  const { ui } = state;
  const content = navigation[ui.tab || "fractal"].component;

  return (
    <>
      <MyToolbar />
      <SwipeableDrawer
        anchor={bigDevice ? "left" : "bottom"}
        open={ui.isDrawer}
        disableDiscovery
        disableSwipeToOpen
        PaperProps={{ className: classes.trans }}
        BackdropProps={{ invisible: true }}
        onClose={() => (ui.isDrawer = false)}
        onOpen={() => (ui.isDrawer = true)}
      >
        <div className={classes.drawer}>
          {!bigDevice ? <Divider className={classes.handle} /> : null}
          {content}
        </div>
      </SwipeableDrawer>
    </>
  );
});

export default Navigation;
