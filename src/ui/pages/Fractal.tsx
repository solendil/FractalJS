import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import { useSelector, useDispatch } from "react-redux";
import { changeFractalType } from "../../redux/rdxengine";
import { Root } from "../../redux/reducer";
import { listForUi } from "../../engine/fractals";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";

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
  const dispatch = useDispatch();
  const type = useSelector((state: Root) => state.set.fractalId);

  const buttons = listForUi().map(o => {
    return (
      <div key={o.fractalId}>
        <Button
          variant={type === o.fractalId ? "contained" : "outlined"}
          color={type === o.fractalId ? "primary" : "default"}
          onClick={() => dispatch(changeFractalType(o.fractalId))}
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
