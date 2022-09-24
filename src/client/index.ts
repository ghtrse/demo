import * as BABYLON from "babylonjs";
import "./index.css";
import Keycode from "keycode.js";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";
// import "babylonjs-inspector";

import { StateHandler, PressedKeys } from "../server/rooms/stateHandler";
import { Client } from "colyseus.js";

const PROTOCOL = window.location.protocol.replace("http", "ws");

const ENDPOINT =
  window.location.hostname.indexOf("heroku") >= 0 ||
  window.location.hostname.indexOf("now.sh") >= 0
    ? `${PROTOCOL}//${window.location.hostname}`
    : `${PROTOCOL}//${window.location.hostname}:2567`;

const client = new Client(ENDPOINT);

const canvas = document.getElementById("game") as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true);

var scene = new BABYLON.Scene(engine);

var camera = new BABYLON.FollowCamera(
  "camera1",
  new BABYLON.Vector3(0, 5, -10),
  scene
);

camera.setTarget(BABYLON.Vector3.Zero());

camera.attachControl(true);

var light = new BABYLON.HemisphericLight(
  "light1",
  new BABYLON.Vector3(0, 1, 0),
  scene
);

light.intensity = 0.7;

var gameUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");

var scoreText: TextBlock[] = [];

scoreText[0] = new TextBlock("score", "0");
scoreText[0].width = 2;
scoreText[0].height = 2;
scoreText[0].color = "white";
scoreText[0].fontSize = 70;
scoreText[0].top = "-35%";
scoreText[0].paddingLeft = "-200px";
gameUI.addControl(scoreText[0]);

scoreText[1] = new TextBlock("score", "0");
scoreText[1].width = 2;
scoreText[1].height = 2;
scoreText[1].color = "red";
scoreText[1].fontSize = 70;
scoreText[1].top = "-35%";
scoreText[1].paddingRight = "-200px";
gameUI.addControl(scoreText[1]);

// var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);

class Player {
  mesh: BABYLON.Mesh;
  score: number = 0;
  index: number = 0;

  constructor(mesh: BABYLON.Mesh, isMe: boolean) {
    this.mesh = mesh;
    this.index = isMe ? 1 : 0;
  }
}

// Colyseus / Join Room
client.joinOrCreate<StateHandler>("room_play").then((room) => {
  const playerViews: { [id: string]: Player } = {};

  room.state.players.onAdd = function (player, key) {
    playerViews[key] = new Player(BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene), room.sessionId == key);

    playerViews[key].mesh.position.set(
      player.position.x,
      player.position.y,
      player.position.z
    );
    // if (key === room.sessionId) {
    //   scoreText.text = player.score.toString();
    //   console.log(player.score);
    // }
    // console.log(player.position.x);
    // console.log(player.position.y);
    // console.log(player.position.z);

    player.onChange = () => {
      playerViews[key].score = player.score;
      scoreText[playerViews[key].index].text = playerViews[key].score.toString();
    }
    player.position.onChange = () => {
      // console.log(player.position.x);
      // console.log(player.position.y);
      // console.log(player.position.z);
      playerViews[key].mesh.position.set(
        player.position.x,
        player.position.y,
        player.position.z
      );
      // if (key === room.sessionId) {
      //   scoreText.text = player.score.toString();
      //   console.log(player.score);
      // }

      // console.log(player.position.x);
      // console.log(player.position.y);
      // console.log(player.position.z);
    };

    // Set camera to follow current player
    if (key === room.sessionId) {
      camera.setTarget(playerViews[key].mesh.position);
    }
    room.onMessage("updatePosition", (data) => {
      player.position.x = data.x;
      player.position.y = data.y;
      player.position.z = data.z;

      playerViews[room.sessionId].mesh.position.set(
        player.position.x,
        player.position.y,
        player.position.z
      );

    });
    // room.onMessage("updateScore", 
      // scoreText.text = player.score.toString();
      // scoreText1.text = player.score.toString();

      // room.send("updateScore", { score: player.score });
    // });

    // const changePosition = (x: number, y: number, z: number) => {
    //   playerViews[key].position.x = x;
    //   playerViews[key].position.y = y;
    //   playerViews[key].position.z = z;

    //   // player.position.onChange = () => {
    //   //     playerViews[key].position.x = x;
    //   // playerViews[key].position.y = y;
    //   // playerViews[key].position.z = z;
    //   // };
    // };
  };

  room.state.players.onRemove = function (player, key) {
    scene.removeMesh(playerViews[key].mesh);
    delete playerViews[key];
  };

  room.onStateChange((state) => {
    console.log("New room state:", state.toJSON());
  });

  // Keyboard listeners
  const keyboard: PressedKeys = { x: 0, y: 0 };
  window.addEventListener("keydown", function (e) {
    if (e.which === Keycode.LEFT) {
      keyboard.x = -1;
    } else if (e.which === Keycode.RIGHT) {
      keyboard.x = 1;
    } else if (e.which === Keycode.UP) {
      keyboard.y = -1;
    } else if (e.which === Keycode.DOWN) {
      keyboard.y = 1;
    }
    else if (e.which === Keycode.ENTER) {
      room.send("updateScore");
    }
    room.send("key", keyboard);
    // console.log(room.send("key", keyboard));
  });

  window.addEventListener("keyup", function (e) {
    if (e.which === Keycode.LEFT) {
      keyboard.x = 0;
    } else if (e.which === Keycode.RIGHT) {
      keyboard.x = 0;
    } else if (e.which === Keycode.UP) {
      keyboard.y = 0;
    } else if (e.which === Keycode.DOWN) {
      keyboard.y = 0;
    }
    room.send("key", keyboard);
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });
});

// Scene render loop
engine.runRenderLoop(function () {
  scene.render();
});
