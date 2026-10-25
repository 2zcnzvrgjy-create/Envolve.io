import { Client, type Room } from "@colyseus/sdk";
import { ROOM_NAMES, type ArenaState } from "@evolve/shared";

/** Point d'entrée unique du client vers le serveur de jeu. */
export class GameConnection {
  private readonly client: Client;
  private room: Room<ArenaState> | null = null;
  private leaving = false;

  constructor(serverUrl: string) {
    this.client = new Client(serverUrl);
  }

  get isConnected(): boolean {
    return this.room !== null;
  }

  /**
   * Rejoint (ou crée) une salle SOLO.
   * `onDisconnected` n'est appelé que pour une déconnexion non demandée par le joueur.
   */
  async joinSolo(name: string, onDisconnected: (code: number) => void): Promise<Room<ArenaState>> {
    if (this.room) return this.room;

    const room = await this.client.joinOrCreate<ArenaState>(ROOM_NAMES.solo, { name });
    this.room = room;
    this.leaving = false;

    room.onLeave((code) => {
      this.room = null;
      if (!this.leaving) onDisconnected(code);
    });
    return room;
  }

  async leave(): Promise<void> {
    if (!this.room) return;
    this.leaving = true;
    const room = this.room;
    this.room = null;
    await room.leave();
  }
}
