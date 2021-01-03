import { Server, Socket } from "socket.io";
import http from "http";

class Player {
  id: string;
  x: number;
  y: number;
  _weapon: Weapon | null;
  moveAngle: number | null;
  aimAngle: number;
  hitBox: number;
  health: number;
  movementSpeed: number;

  constructor(id: string) {
    this.id = id;
    this.x = 120;
    this.y = 110;
    this.moveAngle = null;
    this.aimAngle = 11;
    this.hitBox = 10;
    this.health = 100;
    this._weapon = null;
    this.movementSpeed = 5;
  }

  get weapon(): Weapon | null {
    return this._weapon;
  }

  set weapon(weapon: Weapon | null) {
    this._weapon = weapon;
  }
}

class Weapon {
  playerId: string;
  velocity: number;
  maxRange: number;

  constructor(playerId: string, velocity: number, maxRange: number) {
    this.playerId = playerId;
    this.velocity = velocity;
    this.maxRange = maxRange;
  }

  public shoot(game: Game): void {
    const p = game.players.find((p) => p.id === this.playerId);
    if (p) {
      const bullet = new Bullet(
        p.id,
        p.x,
        p.y,
        p.aimAngle,
        this.maxRange,
        this.velocity
      );
      game.addBullet(bullet);
    }
  }
}

class Shotgun extends Weapon {
  constructor(playerId: string, velocity: number, maxRange: number) {
    super(playerId, velocity, maxRange);
  }
  public shoot(game: Game): void {
    const p = game.players.find((p) => p.id === this.playerId);

    if (p) {
      for (let i = 0; i < 6; i++) {
        const bulletAngle =
          i % 2 === 0
            ? p.aimAngle + 0.1 * Math.random()
            : p.aimAngle + -0.1 * Math.random();

        const bullet = new Bullet(
          p.id,
          p.x + 20 * Math.random(),
          p.y + 20 * Math.random(),
          bulletAngle,
          this.maxRange,
          this.velocity
        );
        game.addBullet(bullet);
      }
    }
  }
}

class Bullet {
  playerdId: string;
  x: number;
  y: number;
  startX: number;
  startY: number;
  angle: number;
  maxRange: number;
  speed: number;

  constructor(
    playerId: string,
    x: number,
    y: number,
    angle: number,
    maxRange: number,
    speed: number
  ) {
    this.playerdId = playerId;
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.angle = angle;
    this.maxRange = maxRange;
    this.speed = speed;
  }
}

interface GameState {
  players: Player[];
  bullets: Bullet[];
}

class Game {
  bullets: Bullet[];
  players: Player[];
  resolutionX: number;
  resolutionY: number;

  constructor(resolutionX: number, resolutionY: number) {
    this.resolutionX = resolutionX;
    this.resolutionY = resolutionY;
    this.players = [];
    this.bullets = [];
  }

  private removeBullet(bullet: Bullet): void {
    this.bullets.splice(this.bullets.indexOf(bullet), 1);
  }

  private removePlayer(player: Player): void {
    this.players.splice(this.players.indexOf(player), 1);
  }

  private checkIfHit(bullet: Bullet): void {
    this.players.forEach((p) => {
      const manhattanDistance =
        Math.abs(p.x - bullet.x) + Math.abs(p.y - bullet.y);
      if (manhattanDistance < p.hitBox && bullet.playerdId !== p.id) {
        this.removeBullet(bullet);
        p.health -= 25;
      }

      if (p.health <= 0) {
        this.removePlayer(p);
      }
    });
  }

  public advance(): GameState {
    //Move players
    this.players.forEach((p) => {
      if (p.moveAngle === null) {
        return p;
      }

      const newX = p.x + p.movementSpeed * Math.cos(p.moveAngle);
      const newY = p.y - p.movementSpeed * Math.sin(p.moveAngle);

      if (newX > this.resolutionX || newX < 0) {
        return;
      }

      if (newY > this.resolutionY || newY < 0) {
        return;
      }

      p.x = newX;
      p.y = newY;
      return p;
    });
    //Move bullets
    this.bullets.forEach((b) => {
      //Check if bullet hitted players
      this.checkIfHit(b);
      b.x += b.speed * Math.cos(b.angle);
      b.y -= b.speed * Math.sin(b.angle);

      const distanceTravelled =
        Math.abs(b.x - b.startX) + Math.abs(b.y - b.startY);

      if (distanceTravelled >= b.maxRange) {
        this.bullets.splice(this.bullets.indexOf(b), 1);
      }
    });

    return { players: this.players, bullets: this.bullets };
  }

  public addPlayer(player: Player): void {
    this.players.push(player);
  }

  public addBullet(bullet: Bullet): void {
    this.bullets.push(bullet);
  }
}

const players: Socket[] = [];
const games: Socket[] = [];

interface QueryParams {
  clientType: "player" | "game";
}

const game = new Game(860, 640);

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
      const weapon = new Shotgun(p.id, 4, 500);
      p.weapon = weapon;
      game.addPlayer(p);
      console.log("Player connected");
    }

    socket.on("disconnect", () => {
      players.splice(players.indexOf(socket), 1);
      console.log("Client disconneted");
    });

    socket.on("player-move", (angle) => {
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

    socket.on("player-shoot", () => {
      const player = game.players.find((p) => p.id === socket.id);
      player?.weapon?.shoot(game);
    });

    while (games.length !== 1) {
      socket.emit("gameState-update", game.advance());
      //Use 15.6, 50 or 100
      await tick(15.6);
    }
  });

  return io;
};

function tick(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
