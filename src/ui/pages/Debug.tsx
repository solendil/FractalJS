import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListSubheader from "@material-ui/core/ListSubheader";
import { getEngine } from "../../logic/logic";

export default function Debug() {
  const engine = getEngine();
  const camera = engine.ctx.camera;
  return (
    <div>
      <List component="nav">
        <ListSubheader component="div">Debug</ListSubheader>
        <ListItem>Threads: {engine.ctx.nbThreads}</ListItem>
        <ListItem>
          Screen: {camera.screen.x} * {camera.screen.y}
        </ListItem>
      </List>
    </div>
  );
}
