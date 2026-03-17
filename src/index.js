// chargement des librairies

/***********************************************************************/
/** CONFIGURATION GLOBALE DU JEU ET LANCEMENT 
/***********************************************************************/

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
  scene: {
    // une scene est un écran de jeu. Pour fonctionner il lui faut 3 fonctions  : create, preload, update
    preload: preload, // la phase preload est associée à la fonction preload, du meme nom (on aurait pu avoir un autre nom)
    create: create, // la phase create est associée à la fonction create, du meme nom (on aurait pu avoir un autre nom)
    update: update // la phase update est associée à la fonction update, du meme nom (on aurait pu avoir un autre nom)
  }
};

// création et lancement du jeu
new Phaser.Game(config);


/***********************************************************************/
/** FONCTION PRELOAD 
/***********************************************************************/

/** La fonction preload est appelée une et une seule fois,
 * lors du chargement de la scene dans le jeu.
 * On y trouve surtout le chargement des assets (images, son ..)
 */
function preload() {
  this.load.spritesheet("img_perso", "src/assets/images/dude.png", {
    frameWidth: 32,
    frameHeight: 48
  });
  // chargement tuiles de jeu
this.load.image('allTiles', 'src/tilesets/all_tilesets.png');

// chargement de la carte
this.load.tilemapTiledJSON("carte", "src/assets/laboratory.tmj");  
}

/***********************************************************************/
/** FONCTION CREATE 
/***********************************************************************/

/* La fonction create est appelée lors du lancement de la scene
 * si on relance la scene, elle sera appelée a nouveau
 * on y trouve toutes les instructions permettant de créer la scene
 * placement des peronnages, des sprites, des platesformes, création des animations
 * ainsi que toutes les instructions permettant de planifier des evenements
 */
function create() {
  player = this.physics.add.sprite(100, 450, 'img_perso');
  player.setCollideWorldBounds(true);
  clavier = this.input.keyboard.createCursorKeys();

  this.anims.create({
    key: "anim_tourne_gauche", // key est le nom de l'animation : doit etre unique pour la scene.
    frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 3 }), // on prend toutes les frames de img perso numerotées de 0 à 3
    frameRate: 10, // vitesse de défilement des frames
    repeat: -1 // nombre de répétitions de l'animation. -1 = infini
  });

  this.anims.create({
    key: "anim_tourne_droite",
    frames: this.anims.generateFrameNumbers("img_perso", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "anim_face",
    frames: [{ key: "img_perso", frame: 4 }],
    frameRate: 20
  });

  //On rajoute un groupe monstre, vide pour l'instant
  groupe_monstres = this.physics.add.group();


  groupe_monstres.children.iterate(function iterateur(monstre_i) {
    // On tire un coefficient aléatoire de rebond : valeur entre 0.4 et 0.8
    var coef_rebond = Phaser.Math.FloatBetween(0.4, 0.8);
    monstre_i.setBounceY(coef_rebond); // on attribut le coefficient de rebond à l'étoile etoile_i
  });

  zone_texte_score = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
  groupe_bombes = this.physics.add.group();

  // chargement de la carte
const carteDuNiveau = this.make.tilemap({ key: "carte" });

// chargement du jeu de tuiles
const tileset = carteDuNiveau.addTilesetImage(
    "all_tilset",  // ← nom du tileset dans Tiled
    "allTiles"        // ← clé utilisée dans this.load.image()
)

// Après (les 4 calques)
const fondLayer   = carteDuNiveau.createLayer("Fond",   tileset, 0, 0);
const floorLayer  = carteDuNiveau.createLayer("Floor",  tileset, 0, 0);
const murLayer    = carteDuNiveau.createLayer("Mur",    tileset, 0, 0);
const objectLayer = carteDuNiveau.createLayer("Object", tileset, 0, 0);
}
/***********************************************************************/
/** FONCTION UPDATE 
/***********************************************************************/

function update() {
  if (player.body.touching.down) {
  nbSauts = 0;
}
  if (clavier.right.isDown) {
    player.setVelocityX(160);
    player.anims.play('anim_tourne_droite', true);
  }
  else if (clavier.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play('anim_tourne_gauche', true);
  } else {
    player.setVelocityX(0);
    player.anims.play('anim_face');
  }
  if (Phaser.Input.Keyboard.JustDown(clavier.space) && nbSauts < SAUT_MAX) {
  player.setVelocityY(-330);
  nbSauts++;
}
  if (gameOver) {
 return;
 }
}

var player; // désigne le sprite du joueur
var clavier;
var score = 0;
var zone_texte_score;
var groupe_bombes;
var gameOver = false;

function chocAvecBombe(un_player, une_bombe) {
 this.physics.pause();
 player.setTint(0xff0000);
 player.anims.play("anim_face");
 gameOver = true;
}