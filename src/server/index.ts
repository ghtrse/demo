import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { monitor } from "@colyseus/monitor"; 

import { GameRoom } from "./rooms/gameRoom";

const port = Number(process.env.PORT) || 2567; 

const app = express();

app.use(cors());
app.use(express.json());

// Create HTTP & WebSocket servers
const server = http.createServer(app);
const gameServer = new Server({
    server: server
});
gameServer.define("room_play", GameRoom);
app.use("/colyseus", monitor());

gameServer.listen(port);
console.log(`Listening on ${ port }`)
