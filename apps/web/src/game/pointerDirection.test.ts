import { describe, expect, it } from "vitest";
import { directionFromKeys, directionFromPointer, POINTER_CONFIG } from "./pointerDirection";

describe("directionFromPointer", () => {
  it("reste immobile dans la zone morte", () => {
    expect(directionFromPointer(2, 2, 10)).toEqual({ x: 0, y: 0 });
  });

  it("atteint la vitesse max au-delà de la rampe", () => {
    const v = directionFromPointer(1000, 0, 10);
    expect(v.x).toBeCloseTo(1);
    expect(v.y).toBeCloseTo(0);
  });

  it("module la vitesse dans la rampe", () => {
    const deadZone = POINTER_CONFIG.minDeadZonePx;
    const v = directionFromPointer(0, deadZone + POINTER_CONFIG.rampPx / 2, 0);
    expect(Math.hypot(v.x, v.y)).toBeCloseTo(0.5);
  });
});

describe("directionFromKeys", () => {
  it("normalise les diagonales", () => {
    const v = directionFromKeys(false, true, true, false);
    expect(Math.hypot(v.x, v.y)).toBeCloseTo(1);
    expect(v.x).toBeGreaterThan(0);
    expect(v.y).toBeLessThan(0);
  });

  it("annule des touches opposées", () => {
    expect(directionFromKeys(true, true, false, false)).toEqual({ x: 0, y: 0 });
  });
});
