/** Couleurs des joueurs, choisies pour rester distinctes sur fond sombre. */
export const PLAYER_COLORS = [
  0x3cf2b4, // menthe
  0xff6b9a, // rose
  0xffc145, // ambre
  0x5ab0ff, // bleu
  0xb18cff, // violet
  0xff8a4c, // orange
  0x7ee05a, // vert
  0x4fe3ff, // cyan
] as const;

export function playerColor(index: number): number {
  return PLAYER_COLORS[index % PLAYER_COLORS.length] ?? PLAYER_COLORS[0];
}

/** Teintes des particules d'énergie : pastel, pour ne pas se confondre avec les joueurs. */
export const ENERGY_COLORS = [0xfff38a, 0xa8ffe4, 0xffb3e6, 0xb8d4ff] as const;

export function energyColor(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return ENERGY_COLORS[Math.abs(hash) % ENERGY_COLORS.length] ?? ENERGY_COLORS[0];
}

export const ARENA_COLORS = {
  outside: 0x070a16,
  floor: 0x0d1328,
  gridLine: 0x3a4a8a,
  border: 0x3cf2b4,
} as const;
