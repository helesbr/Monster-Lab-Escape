// chargement des librairies

/***********************************************************************/
/** CONFIGURATION GLOBALE DU JEU ET LANCEMENT 
/***********************************************************************/

// configuration générale du jeu
var config = {
  type: Phaser.AUTO,
  width: 800, // largeur en pixels
  height: 600, // hauteur en pixels
  physics: {
    // définition des parametres physiques
    default: "arcade", // mode arcade : le plus simple : des rectangles pour gérer les collisions. Pas de pentes
    arcade: {
      // parametres du mode arcade
      gravity: {
        y: 300 // gravité verticale : acceleration ddes corps en pixels par seconde
      },
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
  this.load.image("img_ciel", "src/assets/sky.png");
  this.load.image("img_plateforme", "src/assets/platform.png");
  this.load.spritesheet("img_perso", "src/assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48
  });
  this.load.image("img_etoile", "src/assets/star.png");
  this.load.image("img_bombe", "src/assets/bomb.png");
  // chargement tuiles de jeu
this.load.image("Phaser_tuilesdejeu", "src/assets/tuilesJeu.png");

// chargement de la carte
this.load.tilemapTiledJSON("carte", "src/assets/map.json");  
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
  this.add.image(400, 300, "img_ciel");
  groupe_plateformes = this.physics.add.staticGroup();
  groupe_plateformes.create(200, 584, "img_plateforme");
  groupe_plateformes.create(600, 584, "img_plateforme");
  groupe_plateformes.create(50, 300, "img_plateforme");
  groupe_plateformes.create(600, 450, "img_plateforme");
  groupe_plateformes.create(750, 270, "img_plateforme");
  player = this.physics.add.sprite(100, 450, 'img_perso');
  player.setCollideWorldBounds(true);
  this.physics.add.collider(player, groupe_plateformes);
  player.setBounce(0.2);
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

  //On rajoute un groupe d'étoiles, vide pour l'instant
  groupe_etoiles = this.physics.add.group();
  // on rajoute 10 étoiles avec une boucle for :
  // on répartit les ajouts d'étoiles tous les 70 pixels sur l'axe des x
  for (var i = 0; i < 10; i++) {
    var coordX = 70 + 70 * i;
    groupe_etoiles.create(coordX, 10, "img_etoile");
  }

  this.physics.add.collider(groupe_etoiles, groupe_plateformes);
  groupe_etoiles.children.iterate(function iterateur(etoile_i) {
    // On tire un coefficient aléatoire de rebond : valeur entre 0.4 et 0.8
    var coef_rebond = Phaser.Math.FloatBetween(0.4, 0.8);
    etoile_i.setBounceY(coef_rebond); // on attribut le coefficient de rebond à l'étoile etoile_i
  });
  this.physics.add.overlap(player, groupe_etoiles, ramasserEtoile, null, this);

  zone_texte_score = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
  groupe_bombes = this.physics.add.group();
  this.physics.add.collider(groupe_bombes, groupe_plateformes);
  this.physics.add.collider(player, groupe_bombes, chocAvecBombe, null, this);
  // chargement de la carte
const carteDuNiveau = this.add.tilemap("carte");

// chargement du jeu de tuiles
const tileset = carteDuNiveau.addTilesetImage(
          "tuiles_de_jeu",
          "Phaser_tuilesdejeu"
        ); 
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

var groupe_plateformes;
var player; // désigne le sprite du joueur
var clavier;
var groupe_etoiles; // contient tous les sprite etoiles


function ramasserEtoile(un_player, une_etoile) {
  // on désactive le "corps physique" de l'étoile mais aussi sa texture
  // l'étoile existe alors sans exister : elle est invisible et ne peut plus intéragir
  une_etoile.disableBody(true, true);
  // on regarde le nombre d'étoiles qui sont encore actives (non ramassées)
  if (groupe_etoiles.countActive(true) === 0) {
    // si ce nombre est égal à 0 : on va réactiver toutes les étoiles désactivées
    // pour chaque étoile etoile_i du groupe, on réacttive etoile_i avec la méthode enableBody
    // ceci s'ecrit bizarrement : avec un itérateur sur les enfants (children) du groupe (equivalent du for)
    groupe_etoiles.children.iterate(function iterateur(etoile_i) {
      etoile_i.enableBody(true, etoile_i.x, 0, true, true);
    });
  }
  // on ajoute 10 points au score total, on met à jour l'affichage
 score += 10;
 zone_texte_score.setText("Score: " + score);
// on ajoute une nouvelle bombe au jeu
 // - on génère une nouvelle valeur x qui sera l'abcisse de la bombe
 var x;
 if (player.x < 400) {
 x = Phaser.Math.Between(400, 800);
 } else {
 x = Phaser.Math.Between(0, 400);
 }
 var une_bombe = groupe_bombes.create(x, 16, "img_bombe");
 une_bombe.setBounce(1);
 une_bombe.setCollideWorldBounds(true);
 une_bombe.setVelocity(Phaser.Math.Between(-200, 200), 20);
 une_bombe.allowGravity = false;
 }


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

var nbSauts = 0;
var SAUT_MAX = 2; 