import React from "react";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { useSelector } from "react-redux";
import { Root } from "../redux/reducer";

const useStyles = makeStyles((theme) => ({
  box: {
    position: "fixed",
    bottom: 0,
    right: 0,
    margin: "16px",
    background: "white",
    padding: "16px",
  },
}));

function InfoBox() {
  const classes = useStyles();
  const set = useSelector((state: Root) => state.set);
  const ui = useSelector((state: Root) => state.ui);
  if (ui.smallDevice) return null;
  if (!ui.infobox) return null;
  const d: any = {};
  if (ui.mouseOnCanvas) {
    d.x = ui.mouse.x;
    d.y = ui.mouse.y;
    d.iter = ui.mouse.iter;
    d.w = set.w;
  } else {
    d.x = set.x;
    d.y = set.y;
    d.iter = set.iter;
    d.w = set.w;
  }
  return (
    <Paper elevation={3} className={classes.box}>
      <Typography color="primary" gutterBottom variant="h6">
        {ui.mouseOnCanvas ? "Mouse" : "Screen"}
      </Typography>
      <Typography component="div">
        <Box fontFamily="Monospace">X: {d.x.toFixed(16)}</Box>
        <Box fontFamily="Monospace">Y: {d.y.toFixed(16)}</Box>
        <Box fontFamily="Monospace">iterations: {d.iter.toFixed(2)}</Box>
        <Box fontFamily="Monospace">extent: {d.w.toExponential(2)}</Box>
      </Typography>
    </Paper>
  );
}

export default InfoBox;
