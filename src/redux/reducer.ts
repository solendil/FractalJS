import { combineReducers } from "@reduxjs/toolkit";
import { reducer as ui } from "./ui";
import { reducer as guide } from "./guide";
import { reducer as set } from "./set";
import { reducer as colors } from "./colors";

const root = combineReducers({
  ui,
  guide,
  set,
  colors,
});

export default root;
export type Root = ReturnType<typeof root>;
