/** Source d'aléa injectable : `Math.random` en jeu, une graine fixe dans les tests. */
export type RandomSource = () => number;

/** Générateur pseudo-aléatoire déterministe (mulberry32), pour des tests reproductibles. */
export function seededRandom(seed: number): RandomSource {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomBetween(random: RandomSource, min: number, max: number): number {
  return min + random() * (max - min);
}
