import { createSlice } from "@reduxjs/toolkit";

const DENSITY = (20 * 20) ** (1 / 100);

const ui = createSlice({
  name: "colors",
  initialState: {
    offset: 0,
    density: 20, // 0.05 - 20
    densitySlidebar: 100, // 0-100
  },
  reducers: {
    setOffset: (state, action) => ({ ...state, offset: action.payload }),
    setDensitySlidebar: (state, action) => ({
      ...state,
      densitySlidebar: action.payload,
      density: (1 / 20) * DENSITY ** action.payload,
    }),
  },
});

export const { reducer, actions } = ui;
export const { setOffset, setDensitySlidebar } = actions;
