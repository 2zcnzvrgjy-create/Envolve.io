import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { ROOM_NAMES } from "@evolve/shared";
import { SoloRoom } from "./rooms/SoloRoom.js";

export interface GameServerOptions {
  /** Affiche la bannière Colyseus au démarrage. */
  greet?: boolean;
}

/** Construit le serveur de jeu sans l'attacher à un port (utile pour les tests). */
export function createGameServer(options: GameServerOptions = {}): Server {
  const server = new Server({
    transport: new WebSocketTransport(),
    greet: options.greet ?? false,
    express: (app) => {
      app.get("/health", (_req, res) => {
        res.json({ status: "ok", uptimeSeconds: Math.round(process.uptime()) });
      });
    },
  });

  server.define(ROOM_NAMES.solo, SoloRoom);

  return server;
}
