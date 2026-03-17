import selection from "./js/selection.js";
import map_cuisine from "./js/map_cuisine.js";

// configuration générale du jeu
var config = {
  type: Phaser.AUTO,
  width: 960, // largeur en pixels
  height: 960, // hauteur en pixels
  physics: {
    // définition des parametres physiques
    default: "arcade", // mode arcade : le plus simple : des rectangles pour gérer les collisions. Pas de pentes
    arcade: {
      debug: false // permet de voir les hitbox et les vecteurs d'acceleration quand mis à true
    }
  },
  scene: [selection, map_cuisine] // liste des scènes du jeu

};

// création et lancement du jeu
var game = new Phaser.Game(config);
game.scene.start("selection");






function chocAvecBombe(un_player, une_bombe) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play("anim_face");
  gameOver = true;
}