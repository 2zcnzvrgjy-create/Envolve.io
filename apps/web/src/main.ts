import Phaser from "phaser";
import { resolveServerUrl } from "./config";
import { GameConnection } from "./net/GameConnection";
import { ArenaScene, type ArenaSceneData } from "./scenes/ArenaScene";
import { BackdropScene } from "./scenes/BackdropScene";
import { Hud } from "./ui/Hud";
import { MenuController } from "./ui/MenuController";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#0b1020",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  // Le menu de fond démarre seul ; l'arène est lancée à la connexion.
  scene: [BackdropScene, ArenaScene],
});

const hud = new Hud();
const connection = new GameConnection(resolveServerUrl());

new MenuController(connection, {
  onEnterGame: (room) => {
    game.scene.stop(BackdropScene.KEY);
    game.scene.start(ArenaScene.KEY, { room, hud } satisfies ArenaSceneData);
  },
  onExitGame: () => {
    game.scene.stop(ArenaScene.KEY);
    game.scene.start(BackdropScene.KEY);
  },
}).mount();

// Accès de débogage pour les tests automatisés, absent du build de production.
if (import.meta.env.DEV) {
  (window as unknown as { __evolve: unknown }).__evolve = { game };
}
