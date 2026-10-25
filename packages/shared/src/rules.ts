import { GAME_CONFIG, PLAYER_CONFIG } from "./config.js";

export interface Vector2 {
  x: number;
  y: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Rayon d'un joueur selon sa masse : la surface est proportionnelle à la masse. */
export function radiusForMass(mass: number): number {
  return PLAYER_CONFIG.radiusPerSqrtMass * Math.sqrt(Math.max(0, mass));
}

/** Vitesse d'un joueur selon sa masse : décroît en grossissant, sans passer sous le plancher. */
export function speedForMass(mass: number): number {
  const ratio = PLAYER_CONFIG.startMass / Math.max(PLAYER_CONFIG.startMass, mass);
  return Math.max(PLAYER_CONFIG.minSpeed, PLAYER_CONFIG.baseSpeed * ratio ** PLAYER_CONFIG.speedMassExponent);
}

/**
 * Valide une direction envoyée par un client. Renvoie un vecteur de norme ≤ 1,
 * ou `null` si l'entrée est malformée (elle doit alors être ignorée).
 */
export function normalizeInput(raw: unknown): Vector2 | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { x, y } = raw as Record<string, unknown>;
  if (typeof x !== "number" || typeof y !== "number") return null;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  const length = Math.hypot(x, y);
  if (length <= 1) return { x, y };
  return { x: x / length, y: y / length };
}

/** Garde un cercle entièrement à l'intérieur de l'arène. */
export function clampToArena(position: Vector2, radius: number): Vector2 {
  const { width, height } = GAME_CONFIG.arena;
  const r = Math.min(radius, width / 2, height / 2);
  return {
    x: clamp(position.x, r, width - r),
    y: clamp(position.y, r, height - r),
  };
}
