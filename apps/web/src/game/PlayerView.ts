import Phaser from "phaser";
import { NETWORK_CONFIG, clamp, radiusForMass, type PlayerState } from "@evolve/shared";
import { smoothTowards } from "./camera";
import { SnapshotBuffer } from "./interpolation";
import { playerColor } from "./palette";

const RADIUS_SMOOTHING = 10; // 1/s : la croissance s'anime au lieu de sauter
const LABEL_BASE_RADIUS = 30;
/** En dessous de cet écart, on ne redessine pas le cercle (évite de recalculer sa géométrie à chaque image). */
const RADIUS_EPSILON = 0.05;

/** Représentation visuelle d'un joueur. Ne contient aucune règle de jeu. */
export class PlayerView {
  readonly buffer = new SnapshotBuffer(NETWORK_CONFIG.patchIntervalMs);
  x: number;
  y: number;
  radius: number;
  private targetRadius: number;
  private appliedRadius = -1;
  private readonly body: Phaser.GameObjects.Arc;
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, state: PlayerState, private readonly isLocal: boolean) {
    this.x = state.x;
    this.y = state.y;
    this.radius = this.targetRadius = radiusForMass(state.mass);

    const color = playerColor(state.color);
    this.body = scene.add.circle(this.x, this.y, this.radius, color, 0.9);
    this.label = scene.add
      .text(this.x, this.y, state.name, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "22px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#05070f",
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0.5);

    this.buffer.push(performance.now(), state.x, state.y);
    this.applyRadius();
  }

  setMass(mass: number): void {
    this.targetRadius = radiusForMass(mass);
  }

  update(renderTime: number, dtSeconds: number): void {
    const position = this.buffer.sample(renderTime);
    if (position) {
      this.x = position.x;
      this.y = position.y;
    }
    this.radius = smoothTowards(this.radius, this.targetRadius, RADIUS_SMOOTHING, dtSeconds);
    if (Math.abs(this.radius - this.appliedRadius) > RADIUS_EPSILON) this.applyRadius();
    this.body.setPosition(this.x, this.y);
    this.label.setPosition(this.x, this.y);
  }

  destroy(): void {
    this.body.destroy();
    this.label.destroy();
  }

  private applyRadius(): void {
    this.appliedRadius = this.radius;
    this.body.setRadius(this.radius);
    // Le joueur local se distingue par un contour clair.
    const strokeWidth = Math.max(2, this.radius * 0.08);
    this.body.setStrokeStyle(strokeWidth, this.isLocal ? 0xffffff : 0x05070f, this.isLocal ? 0.9 : 0.5);
    // Les plus gros sont dessinés par-dessus les plus petits.
    this.body.setDepth(10 + this.radius);
    this.label.setDepth(10 + this.radius + 0.5);
    this.label.setScale(clamp(this.radius / LABEL_BASE_RADIUS, 0.6, 4));
  }
}
