import React from "react";
import throttle from "lodash/throttle";
import Slider from "@material-ui/core/Slider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListSubheader from "@material-ui/core/ListSubheader";
import { useSelector, useDispatch } from "react-redux";
import { Root } from "../../redux/reducer";
import {
  setColorOffset,
  setColorDensity,
  setColorId,
} from "../../redux/rdxengine";
import { makeStyles } from "@material-ui/core/styles";
import { getBufferFromId } from "../../util/palette";
import { Typography } from "@material-ui/core";

const DENSITY = (20 * 20) ** (1 / 100);

const gradients = (() => {
  const res: { id: number; dataURL: string }[] = [];
  const WIDTH = 100;
  const HEIGHT = 50;
  const RES = WIDTH;
  const canvas = document.createElement("canvas") as HTMLCanvasElement;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const imageData = context.createImageData(canvas.width, canvas.height);
  const imageBuffer = new Uint32Array(imageData.data.buffer);
  [0, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].forEach((id) => {
    const colorBuffer = getBufferFromId(id, RES);
    for (let i = 0; i < WIDTH; i += 1) {
      for (let j = 0; j < HEIGHT; j += 1) {
        imageBuffer[j * WIDTH + i] =
          colorBuffer[Math.round(i * 0.6 + j * 0.6) % RES];
      }
    }
    context.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL("image/png");
    res.push({ id, dataURL });
  });
  return res;
})();

const useStyles = makeStyles((theme) => ({
  swatches: {
    display: "flex",
    flexWrap: "wrap",
    marginRight: -theme.spacing(1),
    "& > *": {
      paddingBottom: theme.spacing(1),
      paddingRight: theme.spacing(1),
      width: "20%",
      height: "56px",
      position: "relative",
      "& > img": {
        width: "100%",
        height: "100%",
        borderRadius: "4px",
      },
      "& > i": {
        position: "absolute",
        bottom: 0,
        right: 0,
        color: "white",
        fontSize: "36px",
        padding: "0px",
        textShadow: "2px 2px 2px #888",
      },
    },
  },
  txt: {
    width: "100px",
  },
}));

function Palette() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const colors = useSelector((state: Root) => state.colors);
  const swatches = gradients.map((gradient) => (
    <div key={gradient.id} onClick={() => dispatch(setColorId(gradient.id))}>
      <img alt="" src={gradient.dataURL} />
      {colors.id === gradient.id ? (
        <i className="material-icons">check_circle</i>
      ) : null}
    </div>
  ));

  const densitySlider = Math.log(20 * colors.density) / Math.log(DENSITY);
  const getDensity = (val: number) => (1 / 20) * DENSITY ** val;

  return (
    <div>
      <List component="nav" dense>
        <ListSubheader component="div">
          Pick & adjust a color palette
        </ListSubheader>
        <ListItem>
          <div className={classes.swatches}>{swatches}</div>
        </ListItem>
        <ListItem>
          <Typography className={classes.txt}>Move</Typography>
          <Slider
            min={0}
            max={1}
            step={0.001}
            value={colors.offset}
            onChange={throttle((_, v) => dispatch(setColorOffset(v)), 100)}
          />
        </ListItem>
        <ListItem>
          <Typography className={classes.txt}>Stretch</Typography>
          <Slider
            min={0}
            max={100}
            step={1}
            value={densitySlider}
            onChange={throttle(
              (_, v) => dispatch(setColorDensity(getDensity(v))),
              100,
            )}
          />
        </ListItem>
      </List>
    </div>
  );
}

export default Palette;
