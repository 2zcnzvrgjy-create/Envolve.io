import Phaser from "phaser";
import { resolveServerUrl } from "./config";
import { GameConnection } from "./net/GameConnection";
import { BackdropScene } from "./scenes/BackdropScene";
import { MenuController } from "./ui/MenuController";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#0b1020",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: [BackdropScene],
});

const connection = new GameConnection(resolveServerUrl());
new MenuController(connection).mount();
