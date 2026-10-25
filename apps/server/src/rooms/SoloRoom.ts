import { Room, type Client } from "@colyseus/core";
import { ArenaState, CLIENT_MESSAGES, GAME_CONFIG, NETWORK_CONFIG, parseJoinOptions } from "@evolve/shared";
import { ArenaSimulation } from "../sim/ArenaSimulation.js";

/**
 * Salle SOLO (free-for-all). La salle ne fait que relayer : toutes les règles
 * de jeu vivent dans ArenaSimulation, seule autorité sur l'état de la partie.
 */
export class SoloRoom extends Room<{ state: ArenaState }> {
  override maxClients = GAME_CONFIG.maxPlayersPerRoom;
  override maxMessagesPerSecond = NETWORK_CONFIG.maxMessagesPerSecond;
  override state = new ArenaState();

  private simulation!: ArenaSimulation;

  override onCreate(): void {
    this.simulation = new ArenaSimulation(this.state);
    this.simulation.fillEnergy();

    this.onMessage(CLIENT_MESSAGES.input, (client, message: unknown) => {
      // Une entrée invalide est simplement ignorée : le joueur garde sa direction précédente.
      this.simulation.setInput(client.sessionId, message);
    });

    this.setPatchRate(NETWORK_CONFIG.patchIntervalMs);
    this.setSimulationInterval((deltaMs) => {
      this.simulation.step(Math.min(deltaMs / 1000, NETWORK_CONFIG.maxStepSeconds));
    }, 1000 / NETWORK_CONFIG.serverTickRate);
  }

  override onJoin(client: Client, rawOptions?: unknown): void {
    const { name } = parseJoinOptions(rawOptions);
    this.simulation.addPlayer(client.sessionId, name);
  }

  override onLeave(client: Client): void {
    this.simulation.removePlayer(client.sessionId);
  }
}
