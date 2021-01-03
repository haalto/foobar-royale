import React from "react";
import useCanvas from "./useCanvas";

interface Props {
  draw: (ctx: CanvasRenderingContext2D, frameCount: number) => void;
}

const Canvas: React.FC<Props> = (props) => {
  const { draw, ...rest } = props;
  const canvasRef = useCanvas(draw);

  return (
    <canvas
      style={{ width: "100vw", height: "100vh" }}
      ref={canvasRef}
      {...rest}
    />
  );
};

export default Canvas;
