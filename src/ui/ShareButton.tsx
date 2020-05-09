import React from "react";
import { IconButton } from "@material-ui/core";

interface Props {
  className: string;
}

// hack typescript which does not know this property
interface ShareNavigator {
  share: (props: any) => Promise<any>;
}

const Share = (props: Props) => {
  const nav = (navigator as unknown) as ShareNavigator;
  if (!nav.share) return null;
  return (
    <IconButton
      className={props.className}
      onClick={() => {
        nav.share({
          title: "FractalJS",
          text: "Check out this fractal picture !",
          url: window.location.href,
        });
      }}
    >
      <i className="material-icons">share</i>
    </IconButton>
  );
};

export default Share;
