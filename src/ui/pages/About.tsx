import React from "react";
import { Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import { Divider } from "@material-ui/core";
import GitHubButton from "react-github-btn";
import { isMobileDevice, isTouchDevice, isMouseDevice } from "../../util/misc";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    avatar: {
      backgroundColor: theme.palette.primary.main,
    },
    inline: {
      display: "inline",
    },
    keyboard: {
      "& > span": {
        display: "inline-block",
        verticalAlign: "middle",
        border: "1px solid #888",
        background: "#EEE",
        borderRadius: "4px",
        padding: "1px 4px",
        margin: "2px 0px",
        fontSize: "14px",
        minWidth: "1.8em",
        textAlign: "center",
        color: "black",
        marginRight: "0.4em",
      },
    },
  }),
);

const Keys = () => {
  const classes = useStyles();
  return (
    <span className={classes.keyboard}>
      <span>🠜</span>
      <span>🠝</span>
      <span>🠞</span>
      <span>🠟</span> : move
      <br />
      {/* zoom */}
      <span>
        <b>+</b>
      </span>
      <span>
        <b>-</b>
      </span>{" "}
      : zoom
      <br />
      {/* rotate */}
      <span>R</span> + <span>🠜</span>
      <span>🠞</span> : rotate
      <br />
      <span>S</span> + <span>🠜</span>
      <span>🠝</span>
      <span>🠞</span>
      <span>🠟</span> : scale x or y
      <br />
      <span>H</span> + <span>🠜</span>
      <span>🠝</span>
      <span>🠞</span>
      <span>🠟</span> : shear x or y
      <br />
      all + <span>shift</span> : smaller movement
      <br />
      <span>G</span> : set a guide point
    </span>
  );
};

const Speech = () => {
  const classes = useStyles();
  return (
    <Typography
      component="span"
      variant="body1"
      className={classes.inline}
      color="textPrimary"
    >
      FractalJS is open-source. You can report bugs, or add you favorite fractal
      set by heading to{" "}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/solendil/fractaljs/"
      >
        GitHub
      </a>
      .
    </Typography>
  );
};

export default function SimpleCard() {
  const classes = useStyles();

  return (
    <>
      <List component="nav" style={{ maxWidth: `360px` }}>
        <ListSubheader component="div">Controls</ListSubheader>
        {isTouchDevice() ? (
          <ListItem>
            <ListItemAvatar>
              <Avatar className={classes.avatar}>
                <i className="material-icons">touch_app</i>
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Touch" secondary="Swipe & Pinch to zoom" />
          </ListItem>
        ) : null}
        {isMouseDevice() ? (
          <ListItem>
            <ListItemAvatar>
              <Avatar className={classes.avatar}>
                <i className="material-icons">mouse</i>
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Mouse" secondary="Drag & wheel zoom" />
          </ListItem>
        ) : null}
        {!isMobileDevice() ? (
          <ListItem>
            <ListItemAvatar>
              <Avatar className={classes.avatar}>
                <i className="material-icons">keyboard</i>
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Keyboard" secondary={<Keys />} />
          </ListItem>
        ) : null}
        <Divider />
        <ListSubheader component="div">About</ListSubheader>
        <ListItem>
          <Speech />
        </ListItem>
        <ListItem>
          <GitHubButton
            href="https://github.com/solendil/fractaljs"
            data-color-scheme="no-preference: light; light: light; dark: light;"
            data-size="large"
            data-show-count={true}
            aria-label="Star solendil/fractaljs on GitHub"
          >
            Star
          </GitHubButton>{" "}
        </ListItem>
      </List>
    </>
  );
}
