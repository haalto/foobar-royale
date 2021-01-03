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
      width={860}
      height={640}
      style={{ width: "95vw", height: "95vh", border: "1px solid black" }}
      ref={canvasRef}
      {...rest}
    />
  );
};

export default Canvas;
