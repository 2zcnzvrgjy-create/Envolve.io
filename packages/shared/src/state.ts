import { schema, t, type SchemaType } from "@colyseus/schema";

/**
 * État synchronisé d'un joueur. Volontairement minimal à l'étape 1 :
 * la position, la taille et l'énergie arriveront avec l'arène jouable.
 */
export const PlayerState = schema(
  {
    name: t.string(),
  },
  "PlayerState",
);
export type PlayerState = SchemaType<typeof PlayerState>;

/** État synchronisé d'une salle d'arène. */
export const ArenaState = schema(
  {
    players: t.map(PlayerState),
  },
  "ArenaState",
);
export type ArenaState = SchemaType<typeof ArenaState>;
