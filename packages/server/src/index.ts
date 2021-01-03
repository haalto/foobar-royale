import express from "express";
import { createServer } from "http";
import socket from "./socket";
const PORT = 4000;

const app = express();
const server = createServer(app);
socket(server);

app.get("/health", (_, res) => {
  res.end("OK");
});

server.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
