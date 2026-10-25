import { Client, type Room } from "@colyseus/sdk";
import { ROOM_NAMES, type ArenaState } from "@evolve/shared";

export interface SessionInfo {
  roomId: string;
  playerCount: number;
}

export interface ConnectionEvents {
  onSessionChanged: (info: SessionInfo) => void;
  /** Déconnexion non demandée par le joueur (serveur arrêté, réseau…). */
  onDisconnected: (code: number) => void;
}

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

  async joinSolo(name: string, events: ConnectionEvents): Promise<void> {
    if (this.room) return;

    const room = await this.client.joinOrCreate<ArenaState>(ROOM_NAMES.solo, { name });
    this.room = room;
    this.leaving = false;

    room.onStateChange((state) => {
      events.onSessionChanged({ roomId: room.roomId, playerCount: state.players?.size ?? 0 });
    });

    room.onLeave((code) => {
      this.room = null;
      if (!this.leaving) events.onDisconnected(code);
    });
  }

  async leave(): Promise<void> {
    if (!this.room) return;
    this.leaving = true;
    const room = this.room;
    this.room = null;
    await room.leave();
  }
}
