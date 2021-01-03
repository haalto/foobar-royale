import { useRef, useEffect } from "react";

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const { width, height } = canvas.getBoundingClientRect();

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true; // here you can return some usefull information like delta width and delta height instead of just true
    // this information can be used in the next redraw...
  }

  return false;
}

const useCanvas = (draw: (ctx: any, frameCount: number) => void) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    let frameCount = 0;
    let animationFrameId: number;

    const render = () => {
      frameCount++;
      resizeCanvasToDisplaySize(canvas as HTMLCanvasElement);
      draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return canvasRef;
};

export default useCanvas;
