import type { Vector2 } from "@evolve/shared";

export const POINTER_CONFIG = {
  /** Distance (px écran) depuis le bord de la cellule à partir de laquelle on atteint la vitesse max. */
  rampPx: 120,
  /** Zone morte minimale autour du centre, en px écran. */
  minDeadZonePx: 6,
  /** Part du rayon affiché dans laquelle le pointeur n'a pas d'effet. */
  deadZoneRadiusRatio: 0.25,
} as const;

/**
 * Direction de déplacement à partir de l'écart pointeur → joueur, en pixels écran.
 * Proche du centre : immobile ; au-delà de la rampe : vitesse maximale.
 */
export function directionFromPointer(dx: number, dy: number, playerRadiusPx: number): Vector2 {
  const distance = Math.hypot(dx, dy);
  const deadZone = Math.max(POINTER_CONFIG.minDeadZonePx, playerRadiusPx * POINTER_CONFIG.deadZoneRadiusRatio);
  if (distance <= deadZone) return { x: 0, y: 0 };

  const magnitude = Math.min(1, (distance - deadZone) / POINTER_CONFIG.rampPx);
  return { x: (dx / distance) * magnitude, y: (dy / distance) * magnitude };
}

/** Direction à partir des touches pressées (diagonales normalisées). */
export function directionFromKeys(left: boolean, right: boolean, up: boolean, down: boolean): Vector2 {
  const x = (right ? 1 : 0) - (left ? 1 : 0);
  const y = (down ? 1 : 0) - (up ? 1 : 0);
  const length = Math.hypot(x, y);
  return length === 0 ? { x: 0, y: 0 } : { x: x / length, y: y / length };
}
