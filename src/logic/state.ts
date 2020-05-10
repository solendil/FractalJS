import { store } from "@risingstack/react-easy-state";

export type Tab =
  | "settings"
  | "fractal"
  | "palette"
  | "about"
  | "social"
  | "debug";

interface Store {
  mouse: {
    isOnCanvas: boolean;
    x: number;
    y: number;
    iter: number;
  };
  ui: {
    tab: Tab;
    isDrawer: boolean;
    isNarrowDevice: boolean;
    isInfobox: boolean;
    showSquare: boolean;
    showPois: boolean;
    snackText: string | null;
    screen: {
      width: number;
      height: number;
    };
  };
  guide: {
    active: boolean;
    x: number;
    y: number;
  };
  painter: {
    offset: number;
    id: number;
    density: number; // 0.05 - 20
    fn: "s" | "n";
  };
  set: {
    fractalId: string;
    smooth: boolean;
    x: number;
    y: number;
    w: number;
    iter: number;
    viewport: {
      a: number;
      b: number;
      c: number;
      d: number;
      e: number;
      f: number;
    };
  };
}

export default store<Store>({
  mouse: {
    isOnCanvas: false,
    x: 0,
    y: 0,
    iter: 0,
  },
  ui: {
    tab: "fractal",
    isDrawer: false,
    isNarrowDevice: false,
    isInfobox: false,
    showSquare: false,
    showPois: false,
    snackText: null,
    screen: { width: 0, height: 0 },
  },
  guide: { active: false, x: 0, y: 0 },
  painter: {
    offset: 0,
    id: 0,
    density: 20, // 0.05 - 20
    fn: "s",
  },
  set: {
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
});
