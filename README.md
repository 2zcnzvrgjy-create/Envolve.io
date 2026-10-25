# EVOLVE.IO

Jeu .io multijoueur en temps réel sur navigateur : collecte de l'énergie, évolue, survis.

> **État actuel : étape 2 — première arène jouable.** On rejoint une arène SOLO, on se
> déplace (souris, tactile ou clavier), on collecte de l'énergie et on grossit en
> ralentissant. Les joueurs se repoussent au contact. Pas encore d'élimination, de
> score ni de classement (étape 4), ni de prédiction locale du mouvement (étape 3).

## Règles actuelles

- **Déplacement** : la cellule suit le pointeur (vitesse proportionnelle à son
  éloignement), le doigt maintenu sur mobile, ou les touches ZQSD/WASD/flèches.
- **Énergie** : 600 particules en permanence ; chacune rapporte 1 de masse au contact.
- **Croissance** : rayon ∝ √masse ; vitesse ∝ masse^-0,3, avec un plancher.
- **Collisions** : répulsion entre joueurs, le plus lourd est le moins déplacé.

Toutes les valeurs sont dans `packages/shared/src/config.ts`.

## Architecture

```
apps/
  server/    Serveur de jeu autoritaire — Node.js + Colyseus 0.18 + Express (health)
  web/       Client navigateur — Phaser 4 + Vite 8 (menus en HTML/CSS)
packages/
  shared/    Constantes de jeu, protocole, schéma d'état synchronisé, validation
```

- **Serveur autoritaire** : le client n'envoie qu'une direction souhaitée (norme ≤ 1,
  renormalisée côté serveur) ; positions, collisions, collecte et masse sont calculées
  par `apps/server/src/sim/ArenaSimulation.ts`, indépendante du réseau et testée seule.
  Le débit de messages est limité par salle (`NETWORK_CONFIG.maxMessagesPerSecond`).
- **Affichage interpolé** : le client affiche les positions serveur avec 100 ms de
  retard pour glisser entre deux mises à jour (`apps/web/src/game/interpolation.ts`).
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
pnpm --filter @evolve/server bench   # coût d'un tick de simulation à pleine charge
```

En développement, `window.__evolve.game` donne accès à l'instance Phaser (tests
automatisés, débogage). Cet accès n'existe pas dans le build de production.

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
