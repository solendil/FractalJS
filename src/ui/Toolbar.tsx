import React from "react";
import map from "lodash/map";
import { makeStyles } from "@material-ui/core/styles";
import { navigation } from "./Navigation";
import IconButton from "@material-ui/core/IconButton";
import { useDispatch, useSelector } from "react-redux";
import { setTab, setDrawer, setUi } from "../redux/ui";
import { fade } from "@material-ui/core/styles/colorManipulator";
import Share from "./ShareButton";
import { Root } from "../redux/reducer";

const useStyles = makeStyles(theme => ({
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
      width: "60px",
    },
    [theme.breakpoints.up("sm")]: {
      width: "56px",
    },
  },
  selected: {
    color: theme.palette.secondary.main,
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
    textDecoration: "none",
  },
}));

const ToolBar = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const showPois = useSelector((state: Root) => state.ui.showPois);

  const buttons = map(navigation, (def, tabId) =>
    !def.hidden ? (
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
    ) : null,
  ).filter(Boolean);
  buttons.push(
    <a
      href="https://github.com/solendil/FractalJS"
      target="_"
      className={classes.brand}
      key="brand"
    >
      FractalJS
    </a>,
  );
  const poi = (
    <IconButton
      className={`${classes.icons} ${showPois ? classes.selected : ""}`}
      key="pois"
      onClick={() => dispatch(setUi({ showPois: !showPois }))}
    >
      <i className="material-icons">map</i>
    </IconButton>
  );

  buttons.splice(2, 0, poi);
  buttons.splice(2, 0, <Share key="share" className={classes.icons} />);

  return <div className={classes.bar}>{buttons}</div>;
};

export default ToolBar;
