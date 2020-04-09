import React from "react";
import { useSelector } from "react-redux";
import { Root } from "../redux/reducer";
import { makeStyles } from "@material-ui/core";
import Snackbar from "@material-ui/core/Snackbar";

const useStyles = makeStyles((theme) => ({
  snackbar: {
    [theme.breakpoints.only("xs")]: {
      bottom: 64,
    },
  },
}));

const MySnackbar = () => {
  const ui = useSelector((state: Root) => state.ui);
  const classes = useStyles();
  if (!ui.snack) return null;

  return (
    <Snackbar
      open={true}
      className={classes.snackbar}
      message="Sorry, FractalJS cannot zoom further..."
    ></Snackbar>
  );
};

export default MySnackbar;
