import { describe, expect, it } from "vitest";
import { PLAYER_NAME_RULES } from "./config.js";
import { parseJoinOptions, sanitizePlayerName } from "./validation.js";

describe("sanitizePlayerName", () => {
  it("garde un pseudo valide tel quel", () => {
    expect(sanitizePlayerName("Amibe")).toBe("Amibe");
  });

  it("retombe sur le nom par défaut pour une entrée non textuelle ou vide", () => {
    for (const raw of [undefined, null, 42, {}, [], "", "   ", "​​"]) {
      expect(sanitizePlayerName(raw)).toBe(PLAYER_NAME_RULES.fallback);
    }
  });

  it("supprime les caractères de contrôle et invisibles", () => {
    expect(sanitizePlayerName("A\u0000b‮c​d")).toBe("Abcd");
  });

  it("réduit les espaces multiples et retire ceux des extrémités", () => {
    expect(sanitizePlayerName("  Petit \t\n  Blob  ")).toBe("Petit Blob");
  });

  it("tronque à la longueur maximale sans couper un emoji", () => {
    const name = sanitizePlayerName("🧬".repeat(30));
    expect(Array.from(name)).toHaveLength(PLAYER_NAME_RULES.maxLength);
    expect(name).toBe("🧬".repeat(PLAYER_NAME_RULES.maxLength));
  });
});

describe("parseJoinOptions", () => {
  it("ignore les champs inconnus et nettoie le pseudo", () => {
    expect(parseJoinOptions({ name: " Zoé ", score: 999999, admin: true })).toEqual({ name: "Zoé" });
  });

  it("accepte des options absentes ou malformées", () => {
    expect(parseJoinOptions(undefined)).toEqual({ name: PLAYER_NAME_RULES.fallback });
    expect(parseJoinOptions("hack")).toEqual({ name: PLAYER_NAME_RULES.fallback });
  });
});
