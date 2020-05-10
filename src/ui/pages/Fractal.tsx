import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListSubheader from "@material-ui/core/ListSubheader";
import { changeFractalType } from "../../logic/logic";
import { listForUi } from "../../engine/fractals";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import state from "../../logic/state";

const useStyles = makeStyles(theme => ({
  swatches: {
    display: "flex",
    flexWrap: "wrap",
    marginLeft: -theme.spacing(1),
    "& > *": {
      "& > *": {
        textTransform: "none",
        width: "100%",
      },
      width: "50%",
      paddingLeft: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
  },
}));

function Fractal() {
  const classes = useStyles();

  const buttons = listForUi().map(o => {
    return (
      <div key={o.fractalId}>
        <Button
          variant={
            state.set.fractalId === o.fractalId ? "contained" : "outlined"
          }
          color={state.set.fractalId === o.fractalId ? "primary" : "default"}
          onClick={() => changeFractalType(o.fractalId)}
        >
          {o.name}
        </Button>
      </div>
    );
  });
  return (
    <div>
      <List
        component="nav"
        subheader={
          <ListSubheader component="div">Pick a fractal set</ListSubheader>
        }
      >
        <ListItem>
          <div className={classes.swatches}>{buttons}</div>
        </ListItem>
      </List>
    </div>
  );
}

export default Fractal;
