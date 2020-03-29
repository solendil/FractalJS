import React from "react";
import _ from "lodash";
import Slider from "@material-ui/core/Slider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListSubheader from "@material-ui/core/ListSubheader";
import { useSelector, useDispatch } from "react-redux";
import { Root } from "../redux/reducer";
import { setColorOffset, setColorDensity } from "../redux/engine";

function Palette() {
  const dispatch = useDispatch();
  const colors = useSelector((state: Root) => state.colors);
  return (
    <div>
      <List
        component="nav"
        subheader={
          <ListSubheader component="div">Move and stretch colors</ListSubheader>
        }
      >
        <ListItem>
          <Slider
            min={0}
            max={1}
            step={0.001}
            value={colors.offset}
            onChange={_.throttle(
              (_, v) => dispatch(setColorOffset((v as unknown) as number)),
              50,
            )}
          />
        </ListItem>
        <ListItem>
          <Slider
            min={0}
            max={100}
            step={1}
            value={colors.densitySlidebar}
            onChange={_.throttle(
              (_, v) => dispatch(setColorDensity((v as unknown) as number)),
              50,
            )}
          />
        </ListItem>
      </List>
    </div>
  );
}

export default Palette;
