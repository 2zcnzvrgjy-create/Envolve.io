import type { Vector2 } from "@evolve/shared";

interface Sample {
  time: number;
  x: number;
  y: number;
}

const MAX_SAMPLES = 12;

/**
 * Tampon d'interpolation : on affiche chaque entité distante avec un léger
 * retard (`delayMs`) pour toujours avoir deux positions serveur encadrantes
 * et glisser de l'une à l'autre, au lieu de sauter à chaque patch.
 */
export class SnapshotBuffer {
  private readonly samples: Sample[] = [];

  constructor(private readonly expectedIntervalMs: number) {}

  push(time: number, x: number, y: number): void {
    const last = this.samples.at(-1);
    if (last && time <= last.time) {
      // Même instant : on garde la valeur la plus récente.
      last.x = x;
      last.y = y;
      return;
    }
    if (last && time - last.time > this.expectedIntervalMs * 1.5) {
      // Après une pause (entité immobile, rien reçu), on repart de la dernière
      // position un intervalle avant ce nouvel échantillon, pour ne pas étaler
      // le mouvement sur toute la durée de la pause.
      this.samples.push({ time: time - this.expectedIntervalMs, x: last.x, y: last.y });
    }
    this.samples.push({ time, x, y });
    if (this.samples.length > MAX_SAMPLES) this.samples.splice(0, this.samples.length - MAX_SAMPLES);
  }

  /** Position à afficher à l'instant `renderTime` (sans extrapolation). */
  sample(renderTime: number): Vector2 | null {
    const first = this.samples[0];
    const last = this.samples.at(-1);
    if (!first || !last) return null;
    if (renderTime <= first.time) return { x: first.x, y: first.y };
    if (renderTime >= last.time) return { x: last.x, y: last.y };

    for (let i = this.samples.length - 1; i > 0; i--) {
      const from = this.samples[i - 1]!;
      const to = this.samples[i]!;
      if (renderTime >= from.time) {
        const alpha = (renderTime - from.time) / (to.time - from.time);
        return { x: from.x + (to.x - from.x) * alpha, y: from.y + (to.y - from.y) * alpha };
      }
    }
    return { x: last.x, y: last.y };
  }
}
