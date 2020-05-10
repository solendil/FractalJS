import React from "react";
import { makeStyles } from "@material-ui/core";
import Snackbar from "@material-ui/core/Snackbar";
import { view } from "@risingstack/react-easy-state";
import state from "../logic/state";

const useStyles = makeStyles(theme => ({
  snackbar: {
    [theme.breakpoints.only("xs")]: {
      bottom: 64,
    },
  },
}));

const MySnackbar = view(() => {
  const classes = useStyles();
  if (!state.ui.snackText) return null;

  return (
    <Snackbar
      open={true}
      className={classes.snackbar}
      message="Sorry, FractalJS cannot zoom further..."
    ></Snackbar>
  );
});

export default MySnackbar;
