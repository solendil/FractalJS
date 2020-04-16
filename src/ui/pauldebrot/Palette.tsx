import React, { useRef } from "react";
import { ColorFetcher } from "./math";
import { hslp2rgb, rgb2html } from "./convert";

interface Props {
  fetcher: ColorFetcher;
}

const Palette = (props: Props) => {
  const ref = useRef(null);

  React.useEffect(() => {
    const RES = 1000;
    const canvas = (ref.current as unknown) as HTMLCanvasElement;
    canvas.width = RES;
    console.log(canvas.width);
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    for (let i = 0; i < RES; i++) {
      const hsl = props.fetcher(i / RES);
      const rgb = hslp2rgb(hsl);
      ctx.strokeStyle = rgb2html(rgb);
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 150);
      ctx.stroke();
    }
  }, []);

  return (
    <div>
      <canvas ref={ref} style={{ width: "100%", height: "50px" }} />
    </div>
  );
};

export default Palette;
