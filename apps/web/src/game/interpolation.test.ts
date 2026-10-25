import { describe, expect, it } from "vitest";
import { SnapshotBuffer } from "./interpolation";

describe("SnapshotBuffer", () => {
  it("renvoie null tant qu'aucune position n'est connue", () => {
    expect(new SnapshotBuffer(50).sample(0)).toBeNull();
  });

  it("interpole linéairement entre deux échantillons", () => {
    const buffer = new SnapshotBuffer(50);
    buffer.push(1000, 0, 0);
    buffer.push(1050, 100, 50);
    expect(buffer.sample(1025)).toEqual({ x: 50, y: 25 });
  });

  it("n'extrapole pas au-delà du dernier échantillon", () => {
    const buffer = new SnapshotBuffer(50);
    buffer.push(1000, 0, 0);
    buffer.push(1050, 100, 0);
    expect(buffer.sample(5000)).toEqual({ x: 100, y: 0 });
    expect(buffer.sample(0)).toEqual({ x: 0, y: 0 });
  });

  it("après une pause, ne répartit pas le mouvement sur toute la pause", () => {
    const buffer = new SnapshotBuffer(50);
    buffer.push(1000, 0, 0);
    buffer.push(4000, 10, 0); // reprise après 3 s d'immobilité
    // Sans correction, on serait déjà à ~5 à t = 2500.
    expect(buffer.sample(2500)).toEqual({ x: 0, y: 0 });
    expect(buffer.sample(3975)!.x).toBeCloseTo(5);
  });

  it("garde la valeur la plus récente pour un même instant", () => {
    const buffer = new SnapshotBuffer(50);
    buffer.push(1000, 0, 0);
    buffer.push(1000, 7, 7);
    expect(buffer.sample(1000)).toEqual({ x: 7, y: 7 });
  });
});
