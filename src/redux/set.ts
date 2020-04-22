import { createSlice } from "@reduxjs/toolkit";

const ui = createSlice({
  name: "set",
  initialState: {
    fractalId: "mandelbrot",
    smooth: true,
    x: 0,
    y: 0,
    w: 0,
    iter: 0,
    viewport: {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 0,
      f: 0,
    },
  },
  reducers: {
    setSet: (state, action) => action.payload,
    updateSet: (state, action) => ({ ...state, ...action.payload }),
  },
});

export const { reducer, actions } = ui;
export const { setSet, updateSet } = actions;
