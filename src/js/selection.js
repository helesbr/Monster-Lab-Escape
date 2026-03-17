// chargement des librairies
var player;
var clavier;
var score = 0;
var zone_texte_score;
var groupe_monstres;
var groupe_bombes;
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
    this.load.image('porte', 'src/assets/images/wall128x128.png');
  }

  create() {

    // Récupération de la carte et du tileset
    const carteDuNiveau = this.make.tilemap({ key: "carte" });
    const tileset = carteDuNiveau.addTilesetImage("all_tilesets", "allTiles");

    // Création des calques dans l'ordre de profondeur (du plus bas au plus haut)
    const fondLayer = carteDuNiveau.createLayer("Fond", tileset, 0, 0);
    const floorLayer = carteDuNiveau.createLayer("Floor", tileset, 0, 0);
    const murLayer = carteDuNiveau.createLayer("Mur", tileset, 0, 0);
    const objectLayer = carteDuNiveau.createLayer("Object", tileset, 0, 0);

    // Définition des collisions pour les murs uniquement
    murLayer.setCollisionByExclusion([-1]);

    /***********************************************************************/
    /** 2. CRÉATION DU PERSONNAGE (PAR-DESSUS LA CARTE)
    /***********************************************************************/
    player = this.physics.add.sprite(200, 200, 'img_perso');
    console.log("Player créé:", player);
    console.log("Position joueur:", player.x, player.y);
    console.log("Texture:", player.texture.key);
    console.log("Visible:", player.visible);
    console.log("Alpha:", player.alpha);
    console.log("Scale:", player.scaleX, player.scaleY);
    console.log("Active:", player.active);

    // Check the sprite's display origin and bounds
    console.log("Display origin:", player.displayOriginX, player.displayOriginY);
    console.log("Bounds:", player.getBounds());
    console.log("Display list:", this.sys.displayList.length);
    player.setCollideWorldBounds(true);
    player.setDepth(100); // Force le joueur au-dessus de la map
    player.body.setGravityY(-this.physics.world.gravity.y);

    // Ajout de la collision entre le joueur et les murs
    this.physics.add.collider(player, murLayer);

    /***********************************************************************/
    /** 3. ENTRÉES CLAVIER ET ANIMATIONS
    /***********************************************************************/
    clavier = this.input.keyboard.createCursorKeys();

    this.anims.create({
      key: "anim_tourne_gauche",
      frames: this.anims.generateFrameNumbers("img_perso", { start: 4, end: 4 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: "anim_tourne_droite",
      frames: this.anims.generateFrameNumbers("img_perso", { start: 6, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: "anim_face",
      frames: [{ key: "img_perso", frame: 1 }],
      frameRate: 20
    });

    /***********************************************************************/
    /** 4. GROUPES ET INTERFACE
    /***********************************************************************/
    groupe_monstres = this.physics.add.group();
    groupe_bombes = this.physics.add.group();

    zone_texte_score = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#000'
    });
    let zoomX = this.scale.width / carteDuNiveau.widthInPixels;
    let zoomY = this.scale.height / carteDuNiveau.heightInPixels;

    // 2. On prend la valeur la plus petite pour être sûr que tout rentre sans être coupé
    let meilleurZoom = Math.min(zoomX, zoomY);
    // 3. On applique le zoom et on centre la caméra
    this.cameras.main.setZoom(meilleurZoom);
    this.cameras.main.centerOn(carteDuNiveau.widthInPixels / 2, carteDuNiveau.heightInPixels / 2);

  }
  update() {

    // Gauche / Droite (déjà existant)
    if (clavier.right.isDown) {
      player.setVelocityX(160);
      player.setFlipX(false);
      player.anims.play('anim_tourne_droite', true);
    }
    else if (clavier.left.isDown) {
      player.setVelocityX(-160);
      player.setFlipX(true);
      player.anims.play('anim_tourne_gauche', true);
    } else {
      player.setVelocityX(0);
      player.setFlipX(false);
      player.anims.play('anim_face');
    }

    // ✅ Haut / Bas — tu rajoutes juste ces lignes ici :
    if (clavier.up.isDown) {
      player.setVelocityY(-160);
    }
    else if (clavier.down.isDown) {
      player.setVelocityY(160);
    }
  }
}
