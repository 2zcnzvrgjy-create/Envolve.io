import { Room, type Client } from "@colyseus/core";
import { ArenaState, GAME_CONFIG, NETWORK_CONFIG, PlayerState, parseJoinOptions } from "@evolve/shared";

/**
 * Salle SOLO (free-for-all). À l'étape 1 elle ne gère que l'arrivée et le
 * départ des joueurs ; la simulation de l'arène sera ajoutée à l'étape 2.
 */
export class SoloRoom extends Room<{ state: ArenaState }> {
  override maxClients = GAME_CONFIG.maxPlayersPerRoom;
  override maxMessagesPerSecond = NETWORK_CONFIG.maxMessagesPerSecond;
  override state = new ArenaState();

  override onCreate(): void {
    this.setPatchRate(NETWORK_CONFIG.patchIntervalMs);
  }

  override onJoin(client: Client, rawOptions?: unknown): void {
    const { name } = parseJoinOptions(rawOptions);
    this.state.players.set(client.sessionId, new PlayerState({ name }));
  }

  override onLeave(client: Client): void {
    this.state.players.delete(client.sessionId);
  }
}
