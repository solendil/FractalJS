import React from "react";
import { Tooltip, Line, LineChart, CartesianGrid, XAxis } from "recharts";
import { gradientFetcher, multiwaveFetcher } from "./math";
import Palette from "./Palette";
import Wavetest from "./Wavetest";

const App = () => {
  // const waves = [
  //   { def: "hslp;0 0 0;7.5 -2 -2;0.5 2 2", lg: 30 },
  //   { def: "hslp;0 0 0;0 -1 -2;0 0 0;0 1 2", lg: 120 },
  //   { def: "hslp;0 0 0;7.5 0 -3;6.5 -3 0;7.5 0 3", lg: 1000 },
  //   { def: "hslp;0 0 0;2.5 3 -5;3.5 5 -2;2 -4 4;0.5 4 2", lg: 3500 },
  // ];

  // const waves = [
  //   {
  //     def: "hex;0:080560;0.2:2969CB;0.40:F1FEFE;0.60:FCA425;0.85:000000",
  //     lg: 30,
  //   },
  //   { def: "hslp;0 0 0;0 -1 -2;0 0 0;0 1 2", lg: 120 },
  //   { def: "hslp;0 0 0;7.5 0 -3;6.5 -3 0;7.5 0 3", lg: 1000 },
  //   { def: "hslp;0 0 0;2.5 3 -5;3.5 5 -2;2 -4 4;0.5 4 2", lg: 3500 },
  // ];

  const waves = [
    {
      def: "hex;0:080560;0.2:2969CB;0.40:F1FEFE;0.60:FCA425;0.85:000000",
      lg: 7,
      noDampen: true,
    },
    // {
    //   def: "hslp;0 0 0;0 -2 -2; 0 2 2",
    //   lg: 290,
    // },
    // {
    //   def: "hex;0:080560;0.2:2969CB;0.40:F1FEFE;0.60:FCA425;0.85:000000",
    //   lg: 1500,
    // },
  ];

  const palettes = waves.map((w, i) => (
    <div>
      P{i} (lg {w.lg}, log {Math.log10(w.lg).toFixed(2)})
      <Palette key={i} fetcher={gradientFetcher(w.def)} />
    </div>
  ));

  const mw = multiwaveFetcher(waves);
  const glou = [50, 200, 1000, 2000, 5000].map(lg => (
    <div>
      Apply on 0-{lg}
      <Wavetest fetcher={mw} to={lg} />
    </div>
  ));

  return (
    <div>
      {palettes}
      <hr />
      {glou}
    </div>
  );
};

export default App;
