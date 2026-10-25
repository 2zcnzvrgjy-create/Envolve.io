import type Phaser from "phaser";
import { ARENA_COLORS } from "./palette";

export const TEXTURES = {
  grid: "grid",
  /** Grille sur fond opaque : sol de l'arène en une seule couche. */
  arenaFloor: "arena-floor",
  energy: "energy",
} as const;

export const GRID_CELL_SIZE = 64;
/** Taille de la texture d'une particule ; affichée ensuite à sa taille réelle. */
export const ENERGY_TEXTURE_SIZE = 32;
/** Part du rayon de la texture occupée par le cœur plein de la particule (le reste est un halo). */
export const ENERGY_CORE_RATIO = 0.45;

/** Crée une fois pour toutes les textures dessinées par le code (aucune ressource externe). */
export function ensureTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists(TEXTURES.grid)) {
    const g = scene.make.graphics({}, false);
    g.lineStyle(1, ARENA_COLORS.gridLine, 0.35);
    g.strokeRect(0.5, 0.5, GRID_CELL_SIZE, GRID_CELL_SIZE);
    g.fillStyle(ARENA_COLORS.border, 0.25);
    g.fillCircle(0, 0, 1.5);
    g.generateTexture(TEXTURES.grid, GRID_CELL_SIZE, GRID_CELL_SIZE);
    g.destroy();
  }

  if (!scene.textures.exists(TEXTURES.arenaFloor)) {
    const g = scene.make.graphics({}, false);
    g.fillStyle(ARENA_COLORS.floor, 1);
    g.fillRect(0, 0, GRID_CELL_SIZE, GRID_CELL_SIZE);
    g.lineStyle(1, ARENA_COLORS.gridLine, 0.35);
    g.strokeRect(0.5, 0.5, GRID_CELL_SIZE, GRID_CELL_SIZE);
    g.fillStyle(ARENA_COLORS.border, 0.25);
    g.fillCircle(0, 0, 1.5);
    g.generateTexture(TEXTURES.arenaFloor, GRID_CELL_SIZE, GRID_CELL_SIZE);
    g.destroy();
  }

  if (!scene.textures.exists(TEXTURES.energy)) {
    // Disque blanc avec halo : teinté par particule via `setTint`.
    const g = scene.make.graphics({}, false);
    const c = ENERGY_TEXTURE_SIZE / 2;
    g.fillStyle(0xffffff, 0.15);
    g.fillCircle(c, c, c);
    g.fillStyle(0xffffff, 0.35);
    g.fillCircle(c, c, c * 0.7);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(c, c, c * ENERGY_CORE_RATIO);
    g.generateTexture(TEXTURES.energy, ENERGY_TEXTURE_SIZE, ENERGY_TEXTURE_SIZE);
    g.destroy();
  }
}
