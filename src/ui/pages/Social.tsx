// @ts-nocheck
import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListSubheader from "@material-ui/core/ListSubheader";

export default function Debug() {
  const share = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "web.dev",
          text: "Check out web.dev.",
          url: "https://web.dev/",
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    }
  };
  return (
    <div>
      <List component="nav">
        <ListSubheader component="div">Share</ListSubheader>
        <ListItem>
          <button onClick={share}>Share</button>
        </ListItem>
      </List>
    </div>
  );
}
