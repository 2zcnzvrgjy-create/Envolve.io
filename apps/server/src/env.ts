export interface ServerEnv {
  port: number;
  host: string;
  isProduction: boolean;
}

function parsePort(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === "") return fallback;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`PORT invalide : "${raw}"`);
  }
  return port;
}

export function readEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  return {
    port: parsePort(source["PORT"], 2567),
    host: source["HOST"] || "0.0.0.0",
    isProduction: source["NODE_ENV"] === "production",
  };
}
