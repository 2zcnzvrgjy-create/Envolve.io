import { clamp } from "@evolve/shared";

export const CAMERA_CONFIG = {
  /** Étendue du monde visible (en unités) pour un joueur de rayon nul. */
  baseVisibleSpan: 800,
  /** Étendue supplémentaire visible par unité de rayon : on voit plus loin en grossissant. */
  spanPerRadius: 5,
  minZoom: 0.15,
  maxZoom: 2,
  /** Vitesse de convergence du zoom (1/s). */
  zoomSmoothing: 4,
} as const;

/**
 * Zoom de caméra pour un rayon de joueur donné. Basé sur la moyenne géométrique
 * des dimensions de l'écran, pour que portrait et paysage voient une surface comparable.
 */
export function zoomForRadius(radius: number, viewWidth: number, viewHeight: number): number {
  const span = CAMERA_CONFIG.baseVisibleSpan + radius * CAMERA_CONFIG.spanPerRadius;
  const screen = Math.sqrt(Math.max(1, viewWidth) * Math.max(1, viewHeight));
  return clamp(screen / span, CAMERA_CONFIG.minZoom, CAMERA_CONFIG.maxZoom);
}

/** Lissage exponentiel indépendant de la fréquence d'images. */
export function smoothTowards(current: number, target: number, rate: number, dtSeconds: number): number {
  return target + (current - target) * Math.exp(-rate * dtSeconds);
}
