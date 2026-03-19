import menu from "./js/menu.js";
import character_select from "./js/character_select.js";
import selection from "./js/selection.js";
import map_cuisine from "./js/map_cuisine.js";
import regles from "./js/Regles.js";
import map_directeur from "./js/map_directeur.js";
import map_stuff from "./js/map_stuff.js";
import map_monstre from "./js/map_monstre.js";
import HUD from './js/HUD.js';
import mort_boss_final from './js/mort_boss_final.js';

// configuration générale du jeu
var config = {
  type: Phaser.AUTO,
  width: 480,
  height: 480,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-container',
    expandParent: true,
    fullscreenTarget: 'game-container'
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
<<<<<<< HEAD
  scene: [ mort_boss_final,menu, map_directeur, character_select,regles, selection, map_cuisine, map_stuff, map_monstre, HUD]
=======
  scene: [ menu, character_select,regles, selection, map_cuisine, map_stuff, map_monstre,map_directeur, HUD]
>>>>>>> 9a41eedb211d3c0b7b0aaacd5e7357f1f8bd067a
};

// création et lancement du jeu
var game = new Phaser.Game(config);
<<<<<<< HEAD
game.scene.start("mort_boss_final"); // Démarrer avec le menu
=======
game.scene.start("menu"); // Démarrer avec le menu
>>>>>>> 9a41eedb211d3c0b7b0aaacd5e7357f1f8bd067a
