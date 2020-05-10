import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Switch from "@material-ui/core/Switch";
import { changeSmooth } from "../../logic/logic";
import state from "../../logic/state";
import { view } from "@risingstack/react-easy-state";

const Settings = view(() => {
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
                changeSmooth(event.target.checked);
              }}
              checked={state.set.smooth}
              color="primary"
            />
          </ListItemSecondaryAction>
        </ListItem>
        {state.ui.isNarrowDevice ? null : (
          <ListItem>
            <ListItemText primary="Information box" />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                onChange={evt => {
                  state.ui.isInfobox = evt.target.checked;
                }}
                checked={state.ui.isInfobox}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>
        )}
      </List>
    </div>
  );
});

export default Settings;
