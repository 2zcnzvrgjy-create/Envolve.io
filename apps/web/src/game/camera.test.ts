import { describe, expect, it } from "vitest";
import { CAMERA_CONFIG, smoothTowards, zoomForRadius } from "./camera";

describe("zoomForRadius", () => {
  it("dézoome quand le joueur grossit", () => {
    expect(zoomForRadius(100, 1280, 720)).toBeLessThan(zoomForRadius(20, 1280, 720));
  });

  it("reste dans les bornes", () => {
    expect(zoomForRadius(1e6, 1280, 720)).toBe(CAMERA_CONFIG.minZoom);
    expect(zoomForRadius(0, 1e5, 1e5)).toBe(CAMERA_CONFIG.maxZoom);
    expect(zoomForRadius(20, 0, 0)).toBe(CAMERA_CONFIG.minZoom);
  });
});

describe("smoothTowards", () => {
  it("converge vers la cible sans la dépasser", () => {
    const v = smoothTowards(0, 10, 4, 0.1);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(10);
    expect(smoothTowards(0, 10, 4, 100)).toBeCloseTo(10);
  });
});
