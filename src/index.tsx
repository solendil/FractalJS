import React from "react";
import ReactDOM from "react-dom";
import App from "./ui/App";
import { ThemeProvider } from "@material-ui/styles";
import * as serviceWorker from "./serviceWorker";
import { createMuiTheme } from "@material-ui/core/styles";

// const whyDidYouRender = require("@welldone-software/why-did-you-render");
// whyDidYouRender(React, {
//   trackHooks: true,
//   trackAllPureComponents: true,
// });

const theme = createMuiTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#ffc107" },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 450, // 'sm' value at 450 (ie mobile portrait width) is our only real point
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  document.getElementById("root"),
);

serviceWorker.register();
