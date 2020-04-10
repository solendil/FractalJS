import React from "react";
import map from "lodash/map";
import { makeStyles } from "@material-ui/core/styles";
import { navigation } from "./Navigation";
import IconButton from "@material-ui/core/IconButton";
import { useDispatch } from "react-redux";
import { setTab, setDrawer } from "../redux/ui";
import { fade } from "@material-ui/core/styles/colorManipulator";

const useStyles = makeStyles((theme) => ({
  bar: {
    backgroundColor: fade(theme.palette.primary.main, 0.8),
    backdropFilter: "blur(8px)",
    position: "fixed",
    display: "flex",
    [theme.breakpoints.only("xs")]: {
      width: "100%",
      height: "56px",
      bottom: 0,
    },
    [theme.breakpoints.up("sm")]: {
      height: "100%",
      flexDirection: "column",
      left: 0,
      flexWrap: "wrap-reverse",
    },
  },
  icons: {
    color: "white",
    [theme.breakpoints.only("xs")]: {
      width: "64px",
    },
    [theme.breakpoints.up("sm")]: {
      width: "56px",
    },
  },
  brand: {
    [theme.breakpoints.only("xs")]: {
      display: "none",
    },
    color: "white",
    fontSize: "20px",
    lineHeight: "56px",
    writingMode: "vertical-rl",
    transform: "rotate(180deg)",
    fontFamily: "roboto",
    paddingBottom: "56px",
    paddingTop: "0.5em",
    letterSpacing: "3px",
    fontWeight: 500,
    flexGrow: 1,
  },
}));

const ToolBar = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const buttons = map(navigation, (def, tabId) => (
    <IconButton
      key={tabId}
      className={classes.icons}
      onClick={() => {
        dispatch(setTab(tabId));
        dispatch(setDrawer(true));
      }}
    >
      <i className="material-icons">{def.icon}</i>
    </IconButton>
  ));
  buttons.push(
    <div className={classes.brand} key="brand">
      FractalJS
    </div>,
  );

  return <div className={classes.bar}>{buttons}</div>;
};

export default ToolBar;
