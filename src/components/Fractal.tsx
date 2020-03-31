import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import { useSelector, useDispatch } from "react-redux";
import { changeFractalType } from "../redux/rdxengine";
import { Root } from "../redux/reducer";
import { listForUi } from "../engine/fractals";

function Fractal() {
  const dispatch = useDispatch();
  const type = useSelector((state: Root) => state.set.type);

  const buttons = listForUi().map(o => {
    return (
      <ListItem
        key={o.fractalId}
        button
        onClick={() => dispatch(changeFractalType(o.fractalId))}
        selected={type === o.fractalId}
      >
        <ListItemText primary={o.name} />
      </ListItem>
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
        {buttons}
      </List>
    </div>
  );
}

export default Fractal;
