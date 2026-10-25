# EVOLVE.IO

Jeu .io multijoueur en temps réel sur navigateur : collecte de l'énergie, évolue, survis.

> **État actuel : étape 1 — fondations.** Le monorepo, le serveur Colyseus, le client
> Phaser et le contrat partagé sont en place. Un joueur peut rejoindre une salle SOLO
> et voir les autres joueurs connectés, mais **il n'y a pas encore de gameplay**
> (arène, déplacements, énergie : étape 2).

## Architecture

```
apps/
  server/    Serveur de jeu autoritaire — Node.js + Colyseus 0.18 + Express (health)
  web/       Client navigateur — Phaser 4 + Vite 8 (menus en HTML/CSS)
packages/
  shared/    Constantes de jeu, protocole, schéma d'état synchronisé, validation
```

- **Serveur autoritaire** : le client n'envoie que des intentions ; toute donnée reçue
  est revalidée (`parseJoinOptions`). Le débit de messages est limité par salle
  (`NETWORK_CONFIG.maxMessagesPerSecond`).
- **Schéma d'état partagé** (`@colyseus/schema`, API `schema()` sans décorateurs) :
  le client et le serveur utilisent exactement les mêmes définitions et types.
- **Sources partagées sans build en dev** : `@evolve/shared` expose une condition
  d'export `@evolve/source` (sources TS) utilisée par Vite, `tsx`, Vitest et `tsc`.
  En production, Node lit `packages/shared/dist`.
- **Paquets Colyseus « à la carte »** (`@colyseus/core`, `ws-transport`, `schema`)
  plutôt que le méta-paquet `colyseus`, qui embarque Redis, monitor et playground.

## Prérequis

- Node.js ≥ 22.12 (voir `.nvmrc`)
- pnpm 10 (`corepack enable` ou `npm i -g pnpm@10`)

## Commandes

```bash
pnpm install          # installe toutes les dépendances du monorepo

pnpm dev              # serveur (ws://localhost:2567) + client (http://localhost:5173)
pnpm dev:server       # serveur seul, rechargement automatique
pnpm dev:web          # client seul

pnpm typecheck        # vérification TypeScript stricte des 3 packages
pnpm test             # tests Vitest (dont un test multi-clients WebSocket réel)
pnpm build            # build shared → server (dist/) + web (dist/)
pnpm start            # lance le serveur compilé (après pnpm build)
pnpm check            # typecheck + test + build
```

Pour tester en multijoueur : ouvrir http://localhost:5173 dans deux navigateurs (ou
une fenêtre privée), cliquer **JOUER** dans chacun ; le badge affiche le nombre de
joueurs de la salle. Depuis un autre appareil du réseau local, utiliser l'IP de la
machine : le client vise par défaut le même hôte, port 2567.

## Configuration

| Variable          | Où       | Défaut                     | Rôle                          |
| ----------------- | -------- | -------------------------- | ----------------------------- |
| `PORT`            | serveur  | `2567`                     | Port HTTP/WebSocket           |
| `HOST`            | serveur  | `0.0.0.0`                  | Adresse d'écoute              |
| `VITE_SERVER_URL` | client   | `ws(s)://<hôte de la page>:2567` | URL du serveur (au build) |

Endpoint de santé : `GET /health` → `{"status":"ok","uptimeSeconds":…}`.

## Ressources graphiques

Aucune ressource externe : tout est dessiné par le code.
