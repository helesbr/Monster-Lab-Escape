// chargement des librairies
var player;
var clavier;
var score = 0;
var zone_texte_score;
var groupe_bombes;
var groupe_monstres;
var gameOver = false;

export default class selection extends Phaser.Scene {
  constructor() {
    super({ key: "selection" });
  }

  preload() {
    this.load.spritesheet("img_perso", "src/assets/images/dude.png", {
      frameWidth: 32,
      frameHeight: 48
    });
    // chargement tuiles de jeu
    this.load.image('allTiles', 'src/tilesets/all_tilesets.png');

    // chargement de la carte
    this.load.tilemapTiledJSON("carte", "src/assets/laboratory.tmj");
    this.load.tilemapTiledJSON("cuisine", "src/assets/map_cuisine.tmj");
    this.load.tilemapTiledJSON("stuff", "src/assets/map_stuff.tmj");
    this.load.tilemapTiledJSON("directeur", "src/assets/map_directeur.tmj");  
  }

  create() {
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
    const fondLayer = carteDuNiveau.createLayer("Fond", tileset, 0, 0);
    const floorLayer = carteDuNiveau.createLayer("Floor", tileset, 0, 0);
    const murLayer = carteDuNiveau.createLayer("Mur", tileset, 0, 0);
    const objectLayer = carteDuNiveau.createLayer("Object", tileset, 0, 0);
  }

  update() {
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
}
