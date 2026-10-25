import { describe, expect, it } from "vitest";
import { GAME_CONFIG, PLAYER_CONFIG } from "./config.js";
import { clampToArena, normalizeInput, radiusForMass, speedForMass } from "./rules.js";

describe("radiusForMass", () => {
  it("croît avec la masse, proportionnellement à sa racine", () => {
    expect(radiusForMass(40)).toBeCloseTo(radiusForMass(10) * 2);
    expect(radiusForMass(11)).toBeGreaterThan(radiusForMass(10));
  });

  it("ne renvoie jamais de rayon négatif ou NaN", () => {
    expect(radiusForMass(-5)).toBe(0);
  });
});

describe("speedForMass", () => {
  it("vaut la vitesse de base à la masse de départ (et en dessous)", () => {
    expect(speedForMass(PLAYER_CONFIG.startMass)).toBe(PLAYER_CONFIG.baseSpeed);
    expect(speedForMass(1)).toBe(PLAYER_CONFIG.baseSpeed);
  });

  it("diminue en grossissant sans passer sous le plancher", () => {
    expect(speedForMass(100)).toBeLessThan(speedForMass(20));
    expect(speedForMass(1e9)).toBe(PLAYER_CONFIG.minSpeed);
  });
});

describe("normalizeInput", () => {
  it("accepte une direction de norme ≤ 1 telle quelle", () => {
    expect(normalizeInput({ x: 0.3, y: -0.4 })).toEqual({ x: 0.3, y: -0.4 });
    expect(normalizeInput({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
  });

  it("ramène une norme trop grande à 1 (pas d'accélération par triche)", () => {
    const v = normalizeInput({ x: 300, y: 400 });
    expect(v?.x).toBeCloseTo(0.6);
    expect(v?.y).toBeCloseTo(0.8);
  });

  it("rejette les entrées malformées", () => {
    for (const raw of [null, undefined, 1, "x", {}, { x: 1 }, { x: "1", y: 0 }, { x: NaN, y: 0 }, { x: Infinity, y: 0 }]) {
      expect(normalizeInput(raw)).toBeNull();
    }
  });
});

describe("clampToArena", () => {
  it("garde le cercle entier dans l'arène", () => {
    expect(clampToArena({ x: -50, y: 99999 }, 20)).toEqual({ x: 20, y: GAME_CONFIG.arena.height - 20 });
  });

  it("ne modifie pas une position valide", () => {
    expect(clampToArena({ x: 500, y: 600 }, 20)).toEqual({ x: 500, y: 600 });
  });
});
