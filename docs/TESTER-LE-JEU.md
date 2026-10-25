# Tester EVOLVE.IO sans rien installer

Ce guide est fait pour les débutants : **aucune commande à taper**. Le jeu tourne
dans un ordinateur temporaire chez GitHub (un *Codespace*), et tu y joues depuis ton
navigateur habituel (Chrome, Firefox, Edge ou Safari).

> Coût : GitHub offre chaque mois un quota gratuit de Codespaces aux comptes
> personnels. Pense à **arrêter** ton Codespace quand tu as fini (étape 6) pour ne
> pas le consommer inutilement.

## 1. Ouvrir le dépôt

1. Va sur https://github.com/2zcnzvrgjy-create/Envolve.io (connecte-toi à GitHub si besoin).
2. Clique sur le bouton vert **`<> Code`**, en haut à droite de la liste des fichiers.
3. Choisis l'onglet **Codespaces**.
4. Clique sur **Create codespace on claude/evolve-io-foundations-rvg8ck**
   (le nom de la branche s'affiche dans le bouton).

## 2. Patienter pendant la préparation (2 à 5 minutes la première fois)

Un nouvel onglet s'ouvre avec un éditeur de code (Visual Studio Code dans le navigateur).
En bas de l'écran, un panneau **Terminal** affiche du texte qui défile : c'est normal,
le Codespace installe tout seul ce qu'il faut. **Tu n'as rien à taper.**

C'est prêt quand le terminal affiche une ligne qui contient :

```
[evolve] serveur prêt sur ws://0.0.0.0:2567
```

et une autre qui contient `Local:   http://localhost:5173/`.

## 3. Ouvrir le jeu

En général, un **nouvel onglet s'ouvre automatiquement** avec le jeu. Sinon :

- une petite fenêtre apparaît en bas à droite (« Your application running on port
  5173 is available ») : clique sur **Open in Browser** ;
- ou bien, dans le panneau du bas, clique sur l'onglet **PORTS**, survole la ligne
  **EVOLVE.IO (jeu)** (port 5173) et clique sur l'icône en forme de **globe** 🌐.

Si ton navigateur bloque l'ouverture d'un onglet (icône de pop-up bloquée dans la
barre d'adresse), autorise-la ou utilise l'onglet **PORTS**.

## 4. Jouer

1. Tape un pseudo, clique sur **JOUER**.
2. Tu es la cellule au **contour blanc**, au centre de l'écran.
3. Déplace-toi :
   - **souris** : la cellule va vers le pointeur ; plus il est loin, plus elle va vite ;
   - **clavier** : ZQSD, WASD ou les flèches (clique d'abord une fois sur le jeu) ;
   - **écran tactile** : garde le doigt posé là où tu veux aller.
4. Passe sur les **points lumineux** (l'énergie) : ta **masse** (en bas à gauche) augmente,
   ta cellule grossit, ralentit un peu, et la caméra recule pour voir plus loin.
5. Le bord vert est la limite de l'arène.

## 5. Tester à plusieurs

- **Seul, deux joueurs** : copie l'adresse de l'onglet du jeu et ouvre-la dans un
  **deuxième onglet** du même navigateur. Clique sur JOUER dans les deux : le badge en
  haut indique « 2 joueurs » et chaque cellule voit l'autre bouger. Les cellules se
  repoussent quand elles se touchent.
- **Avec un ami ou ton téléphone** : par défaut l'adresse est privée (elle ne marche
  que sur ton compte GitHub). Pour la partager, dans l'onglet **PORTS**, fais un clic
  droit sur la ligne du port 5173 → **Port Visibility** → **Public**, puis envoie
  l'adresse. ⚠️ Toute personne qui a ce lien peut alors rejoindre ; remets le port en
  **Private** ensuite.

## 6. Arrêter

Ferme les onglets, puis sur https://github.com/codespaces, clique sur **`…`** à côté de
ton Codespace → **Stop codespace**. Pour rejouer plus tard, reviens sur cette page et
clique sur ton Codespace : il redémarre et relance le jeu tout seul.

## Si quelque chose ne marche pas

| Ce que tu vois | Que faire |
| --- | --- |
| « Impossible de rejoindre le serveur. Est-il démarré ? » | Attends que le terminal affiche `[evolve] serveur prêt`, puis clique à nouveau sur JOUER. |
| Une page d'erreur à la place du jeu | Attends quelques secondes et recharge la page (touche F5). |
| Le terminal ne montre plus rien de nouveau et le jeu ne répond plus | Recharge l'onglet de l'éditeur : le jeu est relancé automatiquement. |
| Autre problème | Copie le texte du terminal (ou fais une capture d'écran) et envoie-le-moi. |

Au moindre doute, une capture d'écran suffit pour que je puisse t'aider.
