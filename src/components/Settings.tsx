import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Switch from "@material-ui/core/Switch";
import { useSelector, useDispatch } from "react-redux";
import { changeSmooth } from "../redux/rdxengine";
import { Root } from "../redux/reducer";
import { setInfobox } from "../redux/ui";

function Settings() {
  const dispatch = useDispatch();
  const smooth = useSelector((state: Root) => state.set.smooth);
  const infobox = useSelector((state: Root) => state.ui.infobox);

  return (
    <div>
      <List
        component="nav"
        subheader={
          <ListSubheader component="div">Advanced settings</ListSubheader>
        }
      >
        <ListItem>
          <ListItemText primary="Smooth rendering" />
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              onChange={event => {
                dispatch(changeSmooth(event.target.checked));
              }}
              checked={smooth}
              color="primary"
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primary="Information box" />
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              onChange={event => {
                dispatch(setInfobox(event.target.checked));
              }}
              checked={infobox}
              color="primary"
            />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    </div>
  );
}

export default Settings;
