import selection from "./js/selection.js"; 

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
  scene: [selection]
};

// création et lancement du jeu
var game = new Phaser.Game(config);
game.scene.start("selection");  




var player; // désigne le sprite du joueur
var clavier;
var score = 0;
var zone_texte_score;
var groupe_bombes;
var groupe_monstres;
var gameOver = false;

function chocAvecBombe(un_player, une_bombe) {
 this.physics.pause();
 player.setTint(0xff0000);
 player.anims.play("anim_face");
 gameOver = true;
}