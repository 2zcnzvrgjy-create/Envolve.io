/**
 * Mesure le coût d'un tick de simulation à pleine charge (sans réseau).
 * Usage : pnpm --filter @evolve/server bench
 */
import { ArenaState, GAME_CONFIG, NETWORK_CONFIG } from "@evolve/shared";
import { ArenaSimulation } from "../src/sim/ArenaSimulation.js";
import { seededRandom } from "../src/sim/random.js";

const TICKS = 2000;
const random = seededRandom(1);
const sim = new ArenaSimulation(new ArenaState(), random);
sim.fillEnergy();
for (let i = 0; i < GAME_CONFIG.maxPlayersPerRoom; i++) sim.addPlayer(`p${i}`, `p${i}`);

const dt = 1 / NETWORK_CONFIG.serverTickRate;
const durations: number[] = [];
for (let tick = 0; tick < TICKS; tick++) {
  if (tick % 20 === 0) {
    sim.state.players.forEach((_p, id) => sim.setInput(id, { x: random() * 2 - 1, y: random() * 2 - 1 }));
  }
  const start = performance.now();
  sim.step(dt);
  durations.push(performance.now() - start);
}

durations.sort((a, b) => a - b);
const avg = durations.reduce((s, d) => s + d, 0) / durations.length;
const p99 = durations[Math.floor(durations.length * 0.99)]!;
const budget = 1000 / NETWORK_CONFIG.serverTickRate;
console.log(
  `${GAME_CONFIG.maxPlayersPerRoom} joueurs, ${sim.state.energy.size} particules, ${TICKS} ticks : ` +
    `moyenne ${avg.toFixed(3)} ms, p99 ${p99.toFixed(3)} ms (budget ${budget} ms/tick)`,
);
