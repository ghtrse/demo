import * as BABYLON from "babylonjs";
global.XMLHttpRequest = require("xhr2").XMLHttpRequest;

export default class App {
  private nullEngine: BABYLON.NullEngine;
  public scene: BABYLON.Scene;

  constructor() {
    // Initialize babylon scene and engine
    this.nullEngine = new BABYLON.NullEngine();
    this.scene = new BABYLON.Scene(this.nullEngine);

    // Add classes

    this.main();
  }

  private main(): void {
    console.log("Babylon Null Engine");
    // Add camera
    new BABYLON.FollowCamera(
      "camera1",
      new BABYLON.Vector3(0, 5, -10),
      this.scene
    );
    var light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    
    light.intensity = 0.7;

    // Loop update
    this.nullEngine.runRenderLoop(() => {
      this.scene.render();
    });
  }
}
