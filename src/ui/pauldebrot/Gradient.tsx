import React from "react";
import { Tooltip, Line, LineChart, CartesianGrid, XAxis } from "recharts";
import { gradientFetcher } from "./math";
import Palette from "./Palette";
import { hslp2rgb, hslp2hsl } from "./convert";

const App = () => {
  const RES = 800;

  const p = gradientFetcher("hslp;0 0 0;7.5 -2 -2;0.5 2 2");
  const p2 = gradientFetcher(
    "hex;0:080560;0.2:2969CB;0.40:F1FEFE;0.60:FCA425;0.85:000000",
  );
  const spdzrgb1 = gradientFetcher("rgb;192 64 64;192 64 64;81 71 71"); // 5000
  const spdzrgb2 = gradientFetcher(
    "rgb;199 83 83;192 64 64;172 58 58;192 64 64",
  ); // 10
  const test = p2;

  const data = [];
  for (let i = 0; i < RES; i++) {
    const hsl = test(i / RES);
    const rgb = hslp2rgb(hsl);
    const nhsl = hslp2hsl(hsl);
    const [h, s, l] = hsl;
    const [r, g, b] = rgb;
    const [nh, ns, nl] = nhsl;
    data.push({
      x: i,
      h,
      s,
      l,
      r: r / 100,
      g: g / 100,
      b: b / 100,
      nh: nh,
      ns: ns,
      nl: nl,
    });
  }

  return (
    <div>
      <LineChart width={RES} height={400} data={data}>
        <CartesianGrid />
        <Tooltip />
        <XAxis dataKey="x" />
        <Line
          dataKey="nh"
          dot={false}
          isAnimationActive={false}
          stroke="#888800"
        />
        <Line
          dataKey="ns"
          dot={false}
          isAnimationActive={false}
          stroke="#888800"
        />
        <Line
          dataKey="nl"
          dot={false}
          isAnimationActive={false}
          stroke="#888800"
        />
        <Line
          dataKey="r"
          dot={false}
          isAnimationActive={false}
          stroke="#ff0000"
        />
        <Line
          dataKey="g"
          dot={false}
          isAnimationActive={false}
          stroke="#00ff00"
        />
        <Line
          dataKey="b"
          dot={false}
          isAnimationActive={false}
          stroke="#0000ff"
        />
      </LineChart>
      <Palette fetcher={test} />
    </div>
  );
};

export default App;
