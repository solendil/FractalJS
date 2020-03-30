import React from "react";
import _ from "lodash";
import Slider from "@material-ui/core/Slider";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import ListSubheader from "@material-ui/core/ListSubheader";
import { useSelector, useDispatch } from "react-redux";
import { Root } from "../redux/reducer";
import { setColorOffset, setColorDensity, setColorId } from "../redux/engine";
import p from "../to_review/util/palette";
import { makeStyles } from "@material-ui/core/styles";
import { WIDTH } from "./Drawer";

const gradients = (() => {
  const res: { id: number; dataURL: string }[] = [];
  const WIDTH = 85;
  const HEIGHT = 50;
  const RES = WIDTH;
  const canvas = document.createElement("canvas") as HTMLCanvasElement;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const imageData = context.createImageData(canvas.width, canvas.height);
  const imageBuffer = new Uint32Array(imageData.data.buffer);
  [0, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].forEach(id => {
    const colorBuffer = p.getBufferFromId(id, RES);
    for (let i = 0; i < WIDTH; i += 1) {
      for (let j = 0; j < HEIGHT; j += 1) {
        imageBuffer[j * WIDTH + i] = colorBuffer[(i + j) % RES];
      }
    }
    context.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL("image/png");
    res.push({ id, dataURL });
  });
  return res;
})();

const useStyles = makeStyles(theme => ({
  swatches: {
    display: "flex",
    flexWrap: "wrap",
    maxWidth: WIDTH,
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}));

function Palette() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const colors = useSelector((state: Root) => state.colors);
  const swatches = gradients.map(g => (
    <Button
      variant="contained"
      onClick={() => dispatch(setColorId(g.id))}
      color={g.id === colors.id ? "primary" : "default"}
    >
      <Avatar key={g.id} src={g.dataURL} />
    </Button>
  ));
  return (
    <div>
      <List component="nav">
        <ListSubheader component="div">Pick a color scheme</ListSubheader>
        <ListItem>
          <div className={classes.swatches}>{swatches}</div>
        </ListItem>
        <ListSubheader component="div">Move and stretch colors</ListSubheader>
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
