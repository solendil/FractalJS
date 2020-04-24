import React from "react";
import ReactDOM from "react-dom";
import App from "./ui/App";
import { ThemeProvider } from "@material-ui/styles";
import * as serviceWorker from "./serviceWorker";
import { configureStore } from "@reduxjs/toolkit";
import reducer from "./redux/reducer";
import { Provider } from "react-redux";
import { createMuiTheme } from "@material-ui/core/styles";

const whyDidYouRender = require("@welldone-software/why-did-you-render");
whyDidYouRender(React, {
  trackHooks: true,
  trackAllPureComponents: true,
  trackExtraHooks: [[require("react-redux/lib"), "useSelector"]],
});

const store = configureStore({ reducer });

const theme = createMuiTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#ffeb3b" },
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
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </Provider>,
  document.getElementById("root"),
);

serviceWorker.register();
