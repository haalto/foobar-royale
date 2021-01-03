import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Canvas from "./Canvas";

interface Player {
  id: string;
  x: number;
  y: number;
  aimAngle: number;
  health: number;
}

interface Bullet {
  x: number;
  y: number;
  angle: number;
}

interface GameState {
  players: Player[];
  bullets: Bullet[];
}

const Game = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    bullets: [],
  });

  const { current: socket } = useRef(
    io("http://localhost:4000", {
      autoConnect: false,
      query: {
        clientType: "game",
      },
    })
  );

  const draw = async (ctx: CanvasRenderingContext2D, frameCount: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    //Draw players
    if (gameState.players && gameState.players.length !== 0) {
      for (const player of gameState.players) {
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        //Draw id and health
        ctx.font = "10px serif";
        ctx.fillText(player.id, player.x - 50, player.y + -30);
        ctx.fillText(player.health.toString(), player.x - 8, player.y - 16);
        //Draw body
        ctx.arc(player.x, player.y, 10, 0, 2 * Math.PI);

        //Draw weapon
        ctx.arc(
          player.x + 12 * Math.cos(player.aimAngle),
          player.y - 12 * Math.sin(player.aimAngle),
          4,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    }

    //Draw bullets
    if (gameState.bullets && gameState.bullets.length !== 0) {
      for (const bullet of gameState.bullets) {
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  useEffect(() => {
    socket.open();

    socket.on("gameState-update", (data: GameState) => {
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
