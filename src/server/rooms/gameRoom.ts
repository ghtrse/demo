import { Room, Client } from "colyseus";

import { StateHandler, Player } from "./stateHandler";

export class GameRoom extends Room<StateHandler> {
  maxClients = 2;

  onCreate(options: any) {
    this.setSimulationInterval(() => this.onUpdate());
    this.setState(new StateHandler());

    this.onMessage("key", (client, message) => {
      this.state.players.get(client.sessionId).pressedKeys = message;
    });
    this.updatePosition();
    this.updateScore();
  }

  onJoin(client: Client) {
    const player = new Player();
    player.name = `Player ${this.clients.length}`;
    player.position.x = Math.random();
    player.position.y = Math.random();
    player.position.z = Math.random();
    player.score = 0;

    this.state.players.set(client.sessionId, player);
  }

  onUpdate() {
    this.state.players.forEach((player, sessionId) => {
      player.position.x += player.pressedKeys.x * 0.1;
      player.position.z -= player.pressedKeys.y * 0.1;
      // player.score += Math.round(player.pressedKeys.x  + player.pressedKeys.y );
    });
    // this.updatePosition();
  }

  updatePosition() {

    this.onMessage(
      "updatePosition",
      (client, message: { x: number; y: number; z: number }) => {
        const player = this.state.players.get(client.sessionId);

        if (
          player.position.x != message.x ||
          player.position.y != message.y ||
          player.position.z != message.z
        ) {
          player.position.x = message.x;
          player.position.y = message.y;
          player.position.z = message.z;

          client.send("updatePosition", {
            x: message.x,
            y: message.y,
            z: message.z,
          });
        }
      }
    );
  }
  updateScore() {
    this.onMessage("updateScore", (client, message: {score: number}) => {
      const player = this.state.players.get(client.sessionId);
      player.score++;
      // client.send("updateScore", { score: message.score });
    });
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }

  onDispose() {}
}
