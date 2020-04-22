import { createSlice } from "@reduxjs/toolkit";
import { PainterArgs } from "../engine/painter";

const ui = createSlice({
  name: "colors",
  initialState: {
    offset: 0,
    id: 0,
    density: 20, // 0.05 - 20
    fn: "s",
  } as PainterArgs,
  reducers: {
    setColorId: (state, action) => ({ ...state, id: action.payload }),
    setOffset: (state, action) => ({ ...state, offset: action.payload }),
    setDensity: (state, action) => ({ ...state, density: action.payload }),
    setPaint: (state, action) => ({ ...state, ...action.payload }),
  },
});

export const { reducer, actions } = ui;
export const { setOffset, setColorId, setDensity, setPaint } = actions;
