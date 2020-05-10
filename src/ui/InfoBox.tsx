import React from "react";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { view } from "@risingstack/react-easy-state";
import state from "../logic/state";

const useStyles = makeStyles(theme => ({
  box: {
    position: "fixed",
    bottom: 0,
    right: 0,
    margin: "16px",
    background: "white",
    padding: "16px",
  },
}));

const InfoBox = view(() => {
  const classes = useStyles();
  const { ui, set, mouse } = state;

  if (ui.isNarrowDevice) return null;
  if (!ui.isInfobox) return null;

  const d = mouse.isOnCanvas ? { ...mouse, w: set.w } : { ...set };

  return (
    <Paper elevation={3} className={classes.box}>
      <Typography color="primary" gutterBottom variant="h6">
        {mouse.isOnCanvas ? "Mouse" : "Screen"}
      </Typography>
      <Typography component="div">
        <Box fontFamily="Monospace">X: {d.x.toFixed(16)}</Box>
        <Box fontFamily="Monospace">Y: {d.y.toFixed(16)}</Box>
        <Box fontFamily="Monospace">iterations: {d.iter.toFixed(2)}</Box>
        <Box fontFamily="Monospace">extent: {d.w.toExponential(2)}</Box>
      </Typography>
    </Paper>
  );
});

export default InfoBox;
