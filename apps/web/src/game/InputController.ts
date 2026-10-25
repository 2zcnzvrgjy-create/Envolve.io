import Phaser from "phaser";
import { NETWORK_CONFIG, type InputMessage, type Vector2 } from "@evolve/shared";
import { directionFromKeys, directionFromPointer } from "./pointerDirection";

/** Écart minimal entre deux directions pour justifier un nouvel envoi. */
const MIN_CHANGE = 0.02;

const round = (v: number) => Math.round(v * 1000) / 1000;

/**
 * Traduit souris, tactile et clavier en direction souhaitée, et l'envoie au
 * serveur uniquement lorsqu'elle change, au plus toutes les `inputSendIntervalMs`.
 */
export class InputController {
  private readonly keys: Record<"up" | "down" | "left" | "right" | "w" | "a" | "s" | "d" | "z" | "q", Phaser.Input.Keyboard.Key> | null;
  private lastSent: Vector2 = { x: 0, y: 0 };
  private lastSentAt = -Infinity;
  private pointerUsed = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly send: (input: InputMessage) => void,
  ) {
    const keyboard = scene.input.keyboard;
    this.keys = keyboard
      ? {
          up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
          down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
          left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
          right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
          w: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
          a: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
          s: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
          d: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
          // Claviers AZERTY : ZQSD.
          z: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
          q: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
        }
      : null;

    // Tant que le pointeur n'a pas bougé, sa position (0,0) ne veut rien dire.
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, () => (this.pointerUsed = true));
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, () => (this.pointerUsed = true));
  }

  /** `playerScreen` : position du joueur local à l'écran ; `radiusPx` : son rayon affiché. */
  update(now: number, playerScreen: Vector2, radiusPx: number): void {
    const direction = this.readDirection(playerScreen, radiusPx);
    const changed = Math.hypot(direction.x - this.lastSent.x, direction.y - this.lastSent.y) > MIN_CHANGE;
    const stopped = direction.x === 0 && direction.y === 0 && (this.lastSent.x !== 0 || this.lastSent.y !== 0);
    if (!changed && !stopped) return;
    if (now - this.lastSentAt < NETWORK_CONFIG.inputSendIntervalMs) return;

    this.lastSent = { x: round(direction.x), y: round(direction.y) };
    this.lastSentAt = now;
    this.send(this.lastSent);
  }

  private readDirection(playerScreen: Vector2, radiusPx: number): Vector2 {
    const k = this.keys;
    if (k) {
      const keyDirection = directionFromKeys(
        k.left.isDown || k.a.isDown || k.q.isDown,
        k.right.isDown || k.d.isDown,
        k.up.isDown || k.w.isDown || k.z.isDown,
        k.down.isDown || k.s.isDown,
      );
      if (keyDirection.x !== 0 || keyDirection.y !== 0) return keyDirection;
    }

    const pointer = this.scene.input.activePointer;
    if (!this.pointerUsed) return { x: 0, y: 0 };
    // Au doigt : on ne bouge que tant que l'écran est touché.
    if (pointer.wasTouch && !pointer.isDown) return { x: 0, y: 0 };
    return directionFromPointer(pointer.x - playerScreen.x, pointer.y - playerScreen.y, radiusPx);
  }
}
