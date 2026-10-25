import Phaser from "phaser";
import { ensureTextures, TEXTURES } from "../game/textures";

const DRIFT_SPEED = { x: 6, y: 4 }; // pixels par seconde

/** Fond animé discret affiché derrière le menu. */
export class BackdropScene extends Phaser.Scene {
  static readonly KEY = "backdrop";
  private grid!: Phaser.GameObjects.TileSprite;

  constructor() {
    super(BackdropScene.KEY);
  }

  create(): void {
    ensureTextures(this);

    const { width, height } = this.scale;
    this.grid = this.add.tileSprite(0, 0, width, height, TEXTURES.grid).setOrigin(0, 0);

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    });
  }

  override update(_time: number, deltaMs: number): void {
    const seconds = deltaMs / 1000;
    this.grid.tilePositionX += DRIFT_SPEED.x * seconds;
    this.grid.tilePositionY += DRIFT_SPEED.y * seconds;
  }

  private handleResize(size: Phaser.Structs.Size): void {
    this.grid.setSize(size.width, size.height);
  }
}
