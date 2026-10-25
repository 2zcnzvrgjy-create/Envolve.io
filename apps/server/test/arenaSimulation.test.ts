import {
  ArenaState,
  ENERGY_CONFIG,
  EnergyState,
  GAME_CONFIG,
  PLAYER_CONFIG,
  radiusForMass,
  speedForMass,
} from "@evolve/shared";
import { beforeEach, describe, expect, it } from "vitest";
import { ArenaSimulation } from "../src/sim/ArenaSimulation.js";
import { seededRandom } from "../src/sim/random.js";

function createSimulation(): ArenaSimulation {
  return new ArenaSimulation(new ArenaState(), seededRandom(42));
}

function place(sim: ArenaSimulation, id: string, x: number, y: number, mass: number = PLAYER_CONFIG.startMass) {
  const player = sim.state.players.get(id) ?? sim.addPlayer(id, id);
  player.x = x;
  player.y = y;
  player.mass = mass;
  return player;
}

describe("ArenaSimulation", () => {
  let sim: ArenaSimulation;

  beforeEach(() => {
    sim = createSimulation();
  });

  describe("énergie", () => {
    it("remplit l'arène avec le nombre cible de particules, dans les limites", () => {
      sim.fillEnergy();
      expect(sim.state.energy.size).toBe(ENERGY_CONFIG.count);
      sim.state.energy.forEach((e) => {
        expect(e.x).toBeGreaterThanOrEqual(0);
        expect(e.x).toBeLessThanOrEqual(GAME_CONFIG.arena.width);
        expect(e.y).toBeGreaterThanOrEqual(0);
        expect(e.y).toBeLessThanOrEqual(GAME_CONFIG.arena.height);
      });
    });

    it("fait grossir le joueur qui touche une particule et maintient le total", () => {
      sim.fillEnergy();
      const player = place(sim, "a", 1000, 1000);
      sim.state.energy.set("cible", new EnergyState({ x: 1005, y: 1000 }));

      sim.step(0.05);

      expect(sim.state.energy.has("cible")).toBe(false);
      expect(player.mass).toBe(PLAYER_CONFIG.startMass + ENERGY_CONFIG.value);
      expect(sim.state.energy.size).toBe(ENERGY_CONFIG.count);
    });

    it("ne collecte pas une particule hors du rayon", () => {
      const player = place(sim, "a", 1000, 1000);
      const outside = radiusForMass(player.mass) + 2;
      sim.state.energy.set("loin", new EnergyState({ x: Math.ceil(1000 + outside), y: 1000 }));

      sim.step(0.05);

      expect(sim.state.energy.has("loin")).toBe(true);
      expect(player.mass).toBe(PLAYER_CONFIG.startMass);
    });

    it("ne compte une particule qu'une fois si deux joueurs la touchent", () => {
      const a = place(sim, "a", 1000, 1000);
      const b = place(sim, "b", 1030, 1000);
      sim.state.energy.set("partagée", new EnergyState({ x: 1015, y: 1000 }));

      sim.step(0.05);

      expect(a.mass + b.mass).toBe(2 * PLAYER_CONFIG.startMass + ENERGY_CONFIG.value);
    });

    it("plafonne la masse", () => {
      const player = place(sim, "a", 1000, 1000, PLAYER_CONFIG.maxMass);
      sim.state.energy.set("bonus", new EnergyState({ x: 1000, y: 1000 }));
      sim.step(0.05);
      expect(player.mass).toBe(PLAYER_CONFIG.maxMass);
    });
  });

  describe("déplacements", () => {
    it("fait apparaître les joueurs dans l'arène avec la masse de départ", () => {
      for (let i = 0; i < 20; i++) {
        const p = sim.addPlayer(`p${i}`, "x");
        expect(p.mass).toBe(PLAYER_CONFIG.startMass);
        expect(p.x).toBeGreaterThanOrEqual(PLAYER_CONFIG.spawnMargin);
        expect(p.x).toBeLessThanOrEqual(GAME_CONFIG.arena.width - PLAYER_CONFIG.spawnMargin);
      }
    });

    it("reste immobile sans entrée", () => {
      const player = place(sim, "a", 1000, 1000);
      sim.step(0.05);
      expect([player.x, player.y]).toEqual([1000, 1000]);
    });

    it("avance exactement de vitesse × dt dans la direction demandée", () => {
      const player = place(sim, "a", 1000, 1000);
      sim.setInput("a", { x: 1, y: 0 });
      sim.step(0.05);
      expect(player.x).toBeCloseTo(1000 + speedForMass(player.mass) * 0.05);
      expect(player.y).toBe(1000);
    });

    it("plafonne la vitesse même si le client envoie une direction démesurée", () => {
      const player = place(sim, "a", 1000, 1000);
      expect(sim.setInput("a", { x: 1000, y: 0 })).toBe(true);
      sim.step(0.05);
      expect(player.x - 1000).toBeCloseTo(speedForMass(player.mass) * 0.05);
    });

    it("ignore les entrées malformées et celles d'un joueur inconnu", () => {
      const player = place(sim, "a", 1000, 1000);
      sim.setInput("a", { x: 0, y: 1 });
      expect(sim.setInput("a", { x: NaN, y: 0 })).toBe(false);
      expect(sim.setInput("a", "triche")).toBe(false);
      expect(sim.setInput("inconnu", { x: 1, y: 0 })).toBe(false);
      sim.step(0.05);
      expect(player.x).toBe(1000);
      expect(player.y).toBeGreaterThan(1000);
    });

    it("bloque le joueur aux bords de l'arène", () => {
      const player = place(sim, "a", 30, 30);
      sim.setInput("a", { x: -1, y: -1 });
      for (let i = 0; i < 20; i++) sim.step(0.05);
      const r = radiusForMass(player.mass);
      expect(player.x).toBeCloseTo(r);
      expect(player.y).toBeCloseTo(r);
    });

    it("ignore un pas de temps nul, négatif ou invalide", () => {
      const player = place(sim, "a", 1000, 1000);
      sim.setInput("a", { x: 1, y: 0 });
      sim.step(0);
      sim.step(-1);
      sim.step(NaN);
      expect(player.x).toBe(1000);
    });
  });

  describe("collisions entre joueurs", () => {
    it("sépare deux joueurs qui se chevauchent", () => {
      const a = place(sim, "a", 1000, 1000);
      const b = place(sim, "b", 1010, 1000);
      const before = b.x - a.x;
      for (let i = 0; i < 10; i++) sim.step(0.05);
      expect(b.x - a.x).toBeGreaterThan(before);
      expect(b.x - a.x).toBeGreaterThan(radiusForMass(a.mass) + radiusForMass(b.mass) - 1);
    });

    it("déplace moins le joueur le plus lourd", () => {
      const light = place(sim, "léger", 1000, 1000, 10);
      const heavy = place(sim, "lourd", 1040, 1000, 200);
      sim.step(0.05);
      expect(Math.abs(heavy.x - 1040)).toBeLessThan(Math.abs(light.x - 1000));
    });

    it("sépare deux joueurs exactement superposés", () => {
      const a = place(sim, "a", 1000, 1000);
      const b = place(sim, "b", 1000, 1000);
      sim.step(0.05);
      expect(a.x).not.toBe(b.x);
    });
  });

  it("retire le joueur et son entrée au départ", () => {
    place(sim, "a", 1000, 1000);
    sim.removePlayer("a");
    expect(sim.state.players.has("a")).toBe(false);
    expect(sim.setInput("a", { x: 1, y: 0 })).toBe(false);
  });
});
