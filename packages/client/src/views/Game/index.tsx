import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Canvas from "./Canvas";

interface Player {
  x: number;
  y: number;
  aimAngle: number;
}

const Game = () => {
  const [gameState, setGameState] = useState<Player[]>([]);

  const { current: socket } = useRef(
    io("http://localhost:4000", {
      autoConnect: false,
      query: {
        clientType: "game",
      },
    })
  );

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

  const draw = async (ctx: CanvasRenderingContext2D, frameCount: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    resizeCanvasToDisplaySize(ctx.canvas);
    if (gameState && gameState.length !== 0) {
      for (const player of gameState) {
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(player.x, player.y, 10, 0, 2 * Math.PI);
        ctx.arc(
          player.x + 15 * Math.cos(player.aimAngle),
          player.y - 15 * Math.sin(player.aimAngle),
          4,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    }
  };

  useEffect(() => {
    socket.open();

    socket.on("gameState-update", (data: Player[]) => {
      setGameState(data);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <div>
      <Canvas draw={draw} />
    </div>
  );
};

export default Game;
