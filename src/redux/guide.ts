import { createSlice } from "@reduxjs/toolkit";

const ui = createSlice({
  name: "ui",
  initialState: {
    active: true,
    x: 0,
    y: 0,
  },
  reducers: {
    setGuide: (state, action) => ({ ...state, ...action.payload }),
  },
});

export const { reducer, actions } = ui;
export const { setGuide } = actions;
