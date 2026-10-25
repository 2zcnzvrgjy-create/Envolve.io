import {
  ArenaState,
  COLLISION_CONFIG,
  ENERGY_CONFIG,
  EnergyState,
  GAME_CONFIG,
  PLAYER_COLOR_COUNT,
  PLAYER_CONFIG,
  PlayerState,
  clampToArena,
  normalizeInput,
  radiusForMass,
  speedForMass,
  type Vector2,
} from "@evolve/shared";
import { randomBetween, type RandomSource } from "./random.js";

const SPAWN_ATTEMPTS = 12;
const IDLE: Vector2 = { x: 0, y: 0 };

/**
 * Simulation autoritaire d'une arène. Ne dépend pas du réseau : la salle
 * Colyseus lui transmet les entrées et appelle `step` à chaque tick.
 */
export class ArenaSimulation {
  private readonly inputs = new Map<string, Vector2>();
  private nextEnergyId = 0;
  private nextColor = 0;

  constructor(
    readonly state: ArenaState,
    private readonly random: RandomSource = Math.random,
  ) {}

  /** Complète l'arène jusqu'au nombre cible de particules. */
  fillEnergy(): void {
    while (this.state.energy.size < ENERGY_CONFIG.count) this.spawnEnergy();
  }

  addPlayer(id: string, name: string): PlayerState {
    const mass = PLAYER_CONFIG.startMass;
    const { x, y } = this.findSpawnPoint(radiusForMass(mass));
    const player = new PlayerState({ name, x, y, mass, color: this.nextColor });
    this.nextColor = (this.nextColor + 1) % PLAYER_COLOR_COUNT;
    this.state.players.set(id, player);
    this.inputs.set(id, IDLE);
    return player;
  }

  removePlayer(id: string): void {
    this.state.players.delete(id);
    this.inputs.delete(id);
  }

  /** Enregistre la direction souhaitée. Renvoie `false` si l'entrée est rejetée. */
  setInput(id: string, raw: unknown): boolean {
    if (!this.inputs.has(id)) return false;
    const input = normalizeInput(raw);
    if (!input) return false;
    this.inputs.set(id, input);
    return true;
  }

  step(dtSeconds: number): void {
    if (!(dtSeconds > 0)) return;
    this.movePlayers(dtSeconds);
    this.separatePlayers();
    this.collectEnergy();
  }

  private movePlayers(dt: number): void {
    this.state.players.forEach((player, id) => {
      const input = this.inputs.get(id) ?? IDLE;
      const distance = speedForMass(player.mass) * dt;
      const next = clampToArena(
        { x: player.x + input.x * distance, y: player.y + input.y * distance },
        radiusForMass(player.mass),
      );
      player.x = next.x;
      player.y = next.y;
    });
  }

  /**
   * Répulsion entre joueurs qui se chevauchent. Le plus lourd est le moins
   * déplacé. Pas d'élimination à ce stade (étape 4).
   */
  private separatePlayers(): void {
    const players = Array.from(this.state.players.values());
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const a = players[i]!;
        const b = players[j]!;
        const ra = radiusForMass(a.mass);
        const rb = radiusForMass(b.mass);
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let distance = Math.hypot(dx, dy);
        const overlap = ra + rb - distance;
        if (overlap <= 0) continue;

        if (distance === 0) {
          // Superposition exacte : direction arbitraire mais déterministe.
          dx = 1;
          dy = 0;
          distance = 1;
        }
        const nx = dx / distance;
        const ny = dy / distance;
        const correction = overlap * COLLISION_CONFIG.separationFactor;
        const shareA = b.mass / (a.mass + b.mass);
        const shareB = 1 - shareA;

        const nextA = clampToArena({ x: a.x - nx * correction * shareA, y: a.y - ny * correction * shareA }, ra);
        const nextB = clampToArena({ x: b.x + nx * correction * shareB, y: b.y + ny * correction * shareB }, rb);
        a.x = nextA.x;
        a.y = nextA.y;
        b.x = nextB.x;
        b.y = nextB.y;
      }
    }
  }

  /** Un joueur collecte une particule lorsque le centre de celle-ci entre dans son cercle. */
  private collectEnergy(): void {
    const collected = new Set<string>();
    this.state.players.forEach((player) => {
      const radius = radiusForMass(player.mass);
      const radiusSq = radius * radius;
      this.state.energy.forEach((energy, energyId) => {
        const dx = energy.x - player.x;
        const dy = energy.y - player.y;
        if (dx * dx + dy * dy > radiusSq) return;
        if (collected.has(energyId)) return; // déjà prise ce tick par un autre joueur
        collected.add(energyId);
        player.mass = Math.min(PLAYER_CONFIG.maxMass, player.mass + ENERGY_CONFIG.value);
      });
    });

    for (const id of collected) this.state.energy.delete(id);
    this.fillEnergy();
  }

  private spawnEnergy(): void {
    const margin = ENERGY_CONFIG.spawnMargin;
    const { width, height } = GAME_CONFIG.arena;
    const energy = new EnergyState({
      x: Math.round(randomBetween(this.random, margin, width - margin)),
      y: Math.round(randomBetween(this.random, margin, height - margin)),
    });
    this.state.energy.set(String(this.nextEnergyId++), energy);
  }

  /** Cherche un point éloigné des autres joueurs ; garde le meilleur candidat trouvé. */
  private findSpawnPoint(radius: number): Vector2 {
    const margin = PLAYER_CONFIG.spawnMargin;
    const { width, height } = GAME_CONFIG.arena;
    let best: Vector2 = { x: width / 2, y: height / 2 };
    let bestClearance = -Infinity;

    for (let attempt = 0; attempt < SPAWN_ATTEMPTS; attempt++) {
      const candidate = {
        x: randomBetween(this.random, margin, width - margin),
        y: randomBetween(this.random, margin, height - margin),
      };
      let clearance = Infinity;
      this.state.players.forEach((other) => {
        const gap = Math.hypot(other.x - candidate.x, other.y - candidate.y) - radiusForMass(other.mass) - radius;
        clearance = Math.min(clearance, gap);
      });
      if (clearance > bestClearance) {
        best = candidate;
        bestClearance = clearance;
      }
      if (clearance === Infinity) break; // arène vide
    }
    return best;
  }
}
