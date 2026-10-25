import { schema, t, type SchemaType } from "@colyseus/schema";

/** État synchronisé d'un joueur. Position et masse sont calculées par le serveur uniquement. */
export const PlayerState = schema(
  {
    name: t.string(),
    x: t.float32(),
    y: t.float32(),
    mass: t.float32(),
    /** Index dans la palette de couleurs du client. */
    color: t.uint8(),
  },
  "PlayerState",
);
export type PlayerState = SchemaType<typeof PlayerState>;

/** Particule d'énergie. Coordonnées entières : l'arène tient sur 16 bits. */
export const EnergyState = schema(
  {
    x: t.uint16(),
    y: t.uint16(),
  },
  "EnergyState",
);
export type EnergyState = SchemaType<typeof EnergyState>;

/** État synchronisé d'une salle d'arène. */
export const ArenaState = schema(
  {
    players: t.map(PlayerState),
    energy: t.map(EnergyState),
  },
  "ArenaState",
);
export type ArenaState = SchemaType<typeof ArenaState>;
