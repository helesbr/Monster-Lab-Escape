# Monster Lab Escape

**Monster Lab Escape** est un jeu 2D développé avec [Phaser 3] dans le cadre de la Game Jam. Notre jeu se déroule dans le laboratoire du Professeur Croisés. Dans ce laboratoire, il a tenté de mettre au point un remède pour guérir ses blessures, au risque de modifier génétiquement ses amis. Cependant, ses expériences ont mal tourné et il a été tué par les monstres qu’il a lui-même créés.

Tu es le seul survivant : tente de t’échapper de ce laboratoire.

## Aperçu du jeu

Le jeu se compose de plusieurs salles connectées par un hub central (le laboratoire). Chaque salle propose une mécanique de jeu différente : combat, commerce, collecte d'équipement et résolution d'énigmes chronométrées.

## Commandes

| Touche  | Action               |
|---------|----------------------|
| Z       | Se déplacer vers le haut |
| Q       | Se déplacer vers la gauche |
| S       | Se déplacer vers le bas |
| D       | Se déplacer vers la droite |
| ESPACE  | Tirer (si arme équipée) |
| ENTRÉE  | Interagir (portes, objets, PNJ, shop) |
| E       | Ramasser un objet    |


### Laboratoire (Hub central)
Salle principale reliant les 4 zones du jeu :

| Salle | Position | Description |
|-------|----------|-------------|
| **Cuisine** | Haut-gauche | Shop & combat |
| **Directeur** | Haut-droite | Énigmes & évasion |
| **Équipement** | Bas-gauche | Récupération de l'arme |
| **Monstre** | Bas-droite | Arène de boss |

La porte vers la salle des monstres est verrouillée tant que tous les mini-monstres des autres salles ne sont pas éliminés.

### Cuisine — Shop & Combat
- Combattre des mini-monstres pour gagner de l'argent (10 💰 par monstre)
- Accéder au **shop** pour acheter :
  - **Créatine** (30 💰) : +3 vies max (jusqu'à 9)
  - **Preworkout** (30 💰) : vitesse ×2.5 pendant 1 min 30

### Équipement — Récupération de l'arme
- Trouver et ramasser le **pistolet** (touche E)
- Combattre des monstres pour gagner de l'argent

### Monstre — Arène de boss
- **Phase 1** : Éliminer tous les mini-monstres
- **Phase 2** : Affronter **4 boss** (Helias, Arthus, Mehdi, Elias) avec 20 PV chacun
- Les boss tirent des projectiles rouges
- Victoire : débloque l'accès au bureau du directeur

### Directeur — Salle d'énigmes (2 minutes)
- Résoudre **4 énigmes** liées aux objets interactifs (haltères, banc, échecs, PNJ Arthus)
- Chaque réponse forme un chiffre d'un **code à 4 chiffres**
- Entrer le code correct à la porte de sortie pour s'échapper
- ⚠️ Si le temps s'écoule, toute la progression est perdue et le jeu retourne au menu

## Système de jeu

- **Points de vie** : 3 PV de base, extensibles à 9 avec la créatine
- **Argent** : Gagné en éliminant des monstres, dépensé au shop
- **Arme** : Pistolet 
- **Boost vitesse** : Preworkout (×2.5 pendant 90s), persiste entre les salles
- **HUD** : Affichage permanent des cœurs et de l'argent

## Structure des fichiers

```
├── index.html              # Point d'entrée HTML
├── package.json            # Dépendances et scripts
├── src/
│   ├── index.js            # Configuration Phaser et lancement du jeu
│   ├── assets/
│   │   ├── images/         # Sprites, textures, images
│   │   ├── son/            # Musiques et effets sonores
│   │   ├── *.tmj / *.tmx   # Tilemaps (Tiled)
│   ├── js/
│   │   ├── menu.js             # Menu principal
│   │   ├── character_select.js # Sélection du personnage
│   │   ├── Regles.js           # Écran des contrôles
│   │   ├── laboratory.js       # Hub central
│   │   ├── map_cuisine.js      # Salle cuisine (shop + combat)
│   │   ├── map_stuff.js        # Salle équipement
│   │   ├── map_monstre.js      # Salle monstre (boss)
│   │   ├── map_directeur.js    # Salle directeur (énigmes)
│   │   ├── HUD.js              # Interface (vie, argent)
│   │   ├── fin.js              # Écran de victoire
│   │   └── mort_boss_final.js  # Écran de mort (boss)
│   └── tilesets/               # Tilesets pour les cartes
```

## Auteurs

La Mogger Team : Bailly Arthus, Radi Benjelloun Elias, Ammi Mehdi et Essabar Hélias
