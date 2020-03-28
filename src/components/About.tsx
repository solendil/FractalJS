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
import { WIDTH } from "./Drawer";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    avatar: {
      backgroundColor: theme.palette.primary.main,
    },
    inline: {
      display: "inline",
    },
    key: {
      display: "inline-block",
      verticalAlign: "middle",
      border: "1px solid #888",
      background: "#EEE",
      borderRadius: "4px",
      padding: "1px 4px",
      margin: "2px 0px",
      fontSize: "13px",
      minWidth: "1.8em",
      textAlign: "center",
      color: "black",
    },
  }),
);

const Keys = () => {
  const classes = useStyles();
  return (
    <small>
      <span className={classes.key}>&#x2190;</span>{" "}
      <span className={classes.key}>&#x2191;</span>{" "}
      <span className={classes.key}>&#x2192;</span>{" "}
      <span className={classes.key}>&#x2193;</span> ,{" "}
      <span className={classes.key}>+</span>{" "}
      <span className={classes.key}>-</span>
      <br />
      (+ <span className={classes.key}>S</span>{" "}
      <span className={classes.key}>H</span>{" "}
      <span className={classes.key}>R</span>,{" "}
      <span className={classes.key}>V</span> )
      <br />
      (+ <span className={classes.key}>shift</span> )
    </small>
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
      <List component="nav" style={{ maxWidth: `${WIDTH}px` }}>
        <ListSubheader component="div">Controls</ListSubheader>
        <ListItem>
          <ListItemAvatar>
            <Avatar className={classes.avatar}>
              <i className="material-icons">mouse</i>
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Mouse" secondary="Drag & wheel zoom" />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar className={classes.avatar}>
              <i className="material-icons">keyboard</i>
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Keyboard" secondary={<Keys />} />
        </ListItem>
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

// const useStyles = makeStyles({
//   bullet: {
//     display: "inline-block",
//     margin: "0 2px",
//     transform: "scale(0.8)",
//   },
//   pos: {
//     marginBottom: 12,
//   },
// });

// export default function SimpleCard() {
//   const classes = useStyles();
//   const bull = <span className={classes.bullet}>•</span>;

//   return (
//     // <Card>
//     <CardContent>
//       <Typography color="textSecondary" gutterBottom>
//         Word of the Day
//       </Typography>
//     </CardContent>
//     // {/* </Card> */}
//   );
// }

// function About() {
//   return (
//     <div style={{}}>
//       <Typography component="div">
//         FractalJS is open-source. You can report bugs, or add you favorite
//         fractal set by heading to{" "}
//         <a target="_blank" href="https://github.com/solendil/fractaljs/">
//           GitHub
//         </a>
//       </Typography>
//     </div>
//   );
// }

// export default About;
