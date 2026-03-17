import menu from "./js/menu.js";
import selection from "./js/selection.js";
import map_cuisine from "./js/map_cuisine.js";
import regles from "./js/Regles.js";

// configuration générale du jeu
var config = {
  type: Phaser.AUTO,
  width: 480, // largeur en pixels// 960 * 0.5
  height: 480, // hauteur en pixels// 960 * 0.5
  physics: {
    // définition des parametres physiques
    default: "arcade", // mode arcade : le plus simple : des rectangles pour gérer les collisions. Pas de pentes
    arcade: {
      gravity: { y: 0 },
      debug: false // permet de voir les hitbox et les vecteurs d'acceleration quand mis à true
    }
  },
  scene: [menu, selection, map_cuisine, regles] // liste des scènes du jeu

};

// création et lancement du jeu
var game = new Phaser.Game(config);
game.scene.start("menu"); // Démarrer avec le menu
function chocAvecBombe(un_player, une_bombe) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play("anim_face");
  gameOver = true;
}