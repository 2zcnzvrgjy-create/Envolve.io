import { requireElement } from "./dom";

/** Affichage tête haute en HTML (lisible et net quelle que soit la résolution). */
export class Hud {
  private readonly root = requireElement("hud", HTMLElement);
  private readonly mass = requireElement("hud-mass", HTMLElement);
  private lastMass = -1;

  show(): void {
    this.root.hidden = false;
  }

  hide(): void {
    this.root.hidden = true;
  }

  setMass(mass: number): void {
    const rounded = Math.floor(mass);
    if (rounded === this.lastMass) return;
    this.lastMass = rounded;
    this.mass.textContent = String(rounded);
  }
}
