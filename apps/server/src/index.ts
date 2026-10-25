import { createGameServer } from "./createGameServer.js";
import { readEnv } from "./env.js";

const env = readEnv();
const server = createGameServer();

try {
  await server.listen(env.port, env.host);
  console.log(`[evolve] serveur prêt sur ws://${env.host}:${env.port} (health: http://localhost:${env.port}/health)`);
} catch (error) {
  console.error("[evolve] échec du démarrage du serveur", error);
  process.exit(1);
}
