import { Server, Socket } from "socket.io";
import http from "http";

class Player {
  id: string;
  x: number;
  y: number;
  moveAngle: number | null;
  aimAngle: number;

  constructor(id: string) {
    this.id = id;
    this.x = 120;
    this.y = 110;
    this.moveAngle = null;
    this.aimAngle = 11;
  }
}

class Game {
  players: Player[];
  constructor() {
    this.players = [];
  }

  public advance(): Player[] {
    const newGameState = this.players.map((p) => {
      if (p.moveAngle === null) {
        return p;
      } else {
        p.x += 1 * Math.cos(p.moveAngle);
        p.y -= 1 * Math.sin(p.moveAngle);
        console.log(p.x, p.y);
        return p;
      }
    });
    return newGameState;
  }

  public addPlayer(player: Player): void {
    this.players.push(player);
  }
}

const players: Socket[] = [];
const games: Socket[] = [];

interface QueryParams {
  clientType: "player" | "game";
}

const game = new Game();

export default (app: http.Server): Server => {
  const io = new Server(app, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", async (socket: Socket) => {
    const clientType = (socket.handshake.query as QueryParams)?.clientType;

    if (clientType === "game") {
      games.push(socket);
      console.log("Game connected");
    }

    if (clientType === "player") {
      players.push(socket);
      const p = new Player(socket.id);
      game.addPlayer(p);
      console.log("Player connected");
    }

    socket.on("disconnect", () => {
      players.splice(players.indexOf(socket), 1);
      console.log("Client disconneted");
    });

    socket.on("player-move", (angle) => {
      console.log("aim");
      const player = game.players.find((p) => p.id === socket.id);
      if (player) {
        player.moveAngle = angle;
      }
    });

    socket.on("player-aim", (angle) => {
      const player = game.players.find((p) => p.id === socket.id);
      if (player) {
        player.aimAngle = angle;
      }
    });

    while (games.length !== 1) {
      socket.emit("gameState-update", game.advance());
      await wait(16.7);
    }
  });

  return io;
};

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
