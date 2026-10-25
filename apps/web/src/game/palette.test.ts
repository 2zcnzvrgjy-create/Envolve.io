import { PLAYER_COLOR_COUNT } from "@evolve/shared";
import { describe, expect, it } from "vitest";
import { energyColor, ENERGY_COLORS, PLAYER_COLORS, playerColor } from "./palette";

describe("palette", () => {
  it("a une couleur pour chaque index attribué par le serveur", () => {
    expect(PLAYER_COLORS).toHaveLength(PLAYER_COLOR_COUNT);
    expect(new Set(PLAYER_COLORS).size).toBe(PLAYER_COLOR_COUNT);
    expect(playerColor(PLAYER_COLOR_COUNT + 1)).toBe(PLAYER_COLORS[1]);
  });

  it("donne une couleur stable à une particule", () => {
    expect(energyColor("42")).toBe(energyColor("42"));
    expect(ENERGY_COLORS).toContain(energyColor("7"));
  });
});
