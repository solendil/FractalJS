import { combineReducers } from "@reduxjs/toolkit";
import { reducer as ui } from "./ui";
import { reducer as set } from "./set";

const root = combineReducers({
  ui,
  set,
});

export default root;
export type Root = ReturnType<typeof root>;
