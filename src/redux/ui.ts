import { createSlice } from "@reduxjs/toolkit";

type Tab = "settings" | "fractal" | "palette" | "about";
interface Int {
  drawer: boolean;
  infobox: boolean;
  mouseOnCanvas: boolean;
  tab: Tab;
  snack?: string;
  mouse: {
    x: number;
    y: number;
    iter: number;
  };
}

const ui = createSlice({
  name: "ui",
  initialState: {
    drawer: false,
    mouseOnCanvas: false,
    tab: "fractal",
    infobox: false,
    mouse: { x: 0, y: 0, iter: 0 },
  } as Int,
  reducers: {
    setDrawer: (state, action) => ({ ...state, drawer: action.payload }),
    setTab: (state, action) => ({ ...state, tab: action.payload }),
    setInfobox: (state, action) => ({ ...state, infobox: action.payload }),
    setMouseOnCanvas: (state, action) => ({
      ...state,
      mouseOnCanvas: action.payload,
    }),
    setMouseInfo: (state, action) => ({ ...state, mouse: action.payload }),
    setSnack: (state, action) => ({ ...state, snack: action.payload }),
  },
});

export const { reducer, actions } = ui;
export const {
  setDrawer,
  setTab,
  setInfobox,
  setMouseOnCanvas,
  setMouseInfo,
  setSnack,
} = actions;
