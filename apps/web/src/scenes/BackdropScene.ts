import Phaser from "phaser";

const GRID_TEXTURE_KEY = "backdrop-grid";
const CELL_SIZE = 64;
const DRIFT_SPEED = { x: 6, y: 4 }; // pixels par seconde

/**
 * Fond animé discret de l'arène. Ne contient aucune logique de jeu :
 * la scène d'arène jouable sera ajoutée à l'étape 2.
 */
export class BackdropScene extends Phaser.Scene {
  private grid!: Phaser.GameObjects.TileSprite;

  constructor() {
    super("backdrop");
  }

  create(): void {
    this.createGridTexture();

    const { width, height } = this.scale;
    this.grid = this.add.tileSprite(0, 0, width, height, GRID_TEXTURE_KEY).setOrigin(0, 0);

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

  private createGridTexture(): void {
    if (this.textures.exists(GRID_TEXTURE_KEY)) return;

    const graphics = this.make.graphics({}, false);
    graphics.lineStyle(1, 0x3a4a8a, 0.35);
    graphics.strokeRect(0.5, 0.5, CELL_SIZE, CELL_SIZE);
    graphics.fillStyle(0x3cf2b4, 0.25);
    graphics.fillCircle(0, 0, 1.5);
    graphics.generateTexture(GRID_TEXTURE_KEY, CELL_SIZE, CELL_SIZE);
    graphics.destroy();
  }

  private handleResize(size: Phaser.Structs.Size): void {
    this.grid.setSize(size.width, size.height);
  }
}
