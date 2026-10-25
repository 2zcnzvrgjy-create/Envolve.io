import { createServer } from "node:net";
import { Client, type Room } from "@colyseus/sdk";
import type { Server } from "@colyseus/core";
import { ROOM_NAMES, type ArenaState } from "@evolve/shared";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createGameServer } from "../src/createGameServer.js";

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      probe.close(() => {
        if (address && typeof address === "object") resolve(address.port);
        else reject(new Error("port introuvable"));
      });
    });
  });
}

async function waitFor(predicate: () => boolean, timeoutMs = 3_000): Promise<void> {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) throw new Error("condition non atteinte à temps");
    await new Promise((r) => setTimeout(r, 20));
  }
}

describe("salle SOLO (vrais clients WebSocket)", () => {
  let server: Server;
  let port: number;

  beforeAll(async () => {
    port = await getFreePort();
    server = createGameServer();
    await server.listen(port, "127.0.0.1");
  });

  afterAll(async () => {
    await server.gracefullyShutdown(false);
  });

  it("expose un point de santé HTTP", async () => {
    const response = await fetch(`http://127.0.0.1:${port}/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: "ok" });
  });

  it("synchronise l'arrivée et le départ de plusieurs clients distincts", async () => {
    const endpoint = `ws://127.0.0.1:${port}`;
    const clientA = new Client(endpoint);
    const clientB = new Client(endpoint);

    const roomA: Room<ArenaState> = await clientA.joinOrCreate(ROOM_NAMES.solo, { name: "  Alpha\u0000 " });
    const roomB: Room<ArenaState> = await clientB.joinOrCreate(ROOM_NAMES.solo, { name: "Beta", score: 1e9 });

    expect(roomB.roomId).toBe(roomA.roomId);

    await waitFor(() => roomA.state.players?.size === 2 && roomB.state.players?.size === 2);
    expect(roomB.state.players.get(roomA.sessionId)?.name).toBe("Alpha");
    expect(roomA.state.players.get(roomB.sessionId)?.name).toBe("Beta");

    await roomB.leave();
    await waitFor(() => roomA.state.players.size === 1);
    expect(roomA.state.players.has(roomB.sessionId)).toBe(false);

    await roomA.leave();
  });
});
