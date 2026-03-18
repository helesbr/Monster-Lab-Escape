// chargement des librairies

var player;

var clavier;

var zone_texte_score;

var groupe_monstres;

var groupe_bombes;

var gameOver = false;

var groupe_portes;

 

export default class selection extends Phaser.Scene {

  constructor() {

    super({ key: "selection" });

  }

 

  preload() {

    this.load.spritesheet("img_perso", "src/assets/images/dude.png", {

      frameWidth: 44,

      frameHeight: 48

    });

    // chargement tuiles de jeu

    this.load.image('allTiles', 'src/tilesets/all_tilesets.png');

    this.load.image('background', 'src/tilesets/tile-background.png');

 

    // chargement de la carte

    this.load.tilemapTiledJSON("carte", "src/assets/laboratory.tmj");

    this.load.tilemapTiledJSON("cuisine", "src/assets/map_cuisine.tmj");

    this.load.tilemapTiledJSON("stuff", "src/assets/map_stuff.tmj");

    this.load.tilemapTiledJSON("directeur", "src/assets/map_directeur.tmj");

    this.load.spritesheet('porte', 'src/assets/images/doors_spritesheet.png', {

      frameWidth: 64,

      frameHeight: 32

    });

  }

 

  create() {

    // Récupération de la carte et du tileset

    const carteDuNiveau = this.make.tilemap({ key: "carte" });

    const tileset = carteDuNiveau.addTilesetImage("all_tilset", "allTiles");

    const backgroundTileset = carteDuNiveau.addTilesetImage("background", "background");

 

    // Création des calques dans l'ordre de profondeur (du plus bas au plus haut)

    const backgroundLayer = carteDuNiveau.createLayer("background", backgroundTileset, 0, 0);

    const fondLayer = carteDuNiveau.createLayer("Fond", tileset, 0, 0);

    const floorLayer = carteDuNiveau.createLayer("Floor", tileset, 0, 0);

    const murLayer = carteDuNiveau.createLayer("Mur", tileset, 0, 0);

    const objectLayer = carteDuNiveau.createLayer("Object", tileset, 0, 0);

 

    // Définition des collisions pour les murs uniquement

    murLayer.setCollisionByExclusion([-1]);

    objectLayer.setCollisionByExclusion([-1]);

 

    // Redimensionnement du monde avec les dimensions calculées via tiled

    this.physics.world.setBounds(0, 0, 960, 960);

    // Ajout du champs de la caméra de taille identique à celle du monde

    this.cameras.main.setBounds(0, 0, 960, 960);

 

    /***********************************************************************/

    /** 2. CRÉATION DU PERSONNAGE (PAR-DESSUS LA CARTE)

    /***********************************************************************/

    player = this.physics.add.sprite(190, 480, 'img_perso');

    player.setCollideWorldBounds(true);

    player.setDepth(100); // Force le joueur au-dessus de la map

    player.body.setGravityY(-this.physics.world.gravity.y);

 

    // Ajout de la collision entre le joueur et les murs

    this.physics.add.collider(player, murLayer);

    this.physics.add.collider(player, objectLayer);

 

    /***********************************************************************/

    /** CRÉATION DES ANIMATIONS DES PORTES

    /***********************************************************************/

    // Créer les animations des portes

    this.anims.create({

      key: 'door_closed',

      
      frames: [{ key: 'porte', frame: 0 }],

      frameRate: 10

    });

 

    this.anims.create({

      key: 'door_open',

      frames: [{ key: 'porte', frame: 1 }],

      frameRate: 10

    });

 

    /***********************************************************************/

    /** CRÉATION DES PORTES

    /***********************************************************************/

    groupe_portes = this.physics.add.group();

    // Récupération du calque d'objets des portes

    const doorsObjectsLayer = carteDuNiveau.getObjectLayer("doors");

 

    // Création des portes sur chaque objet door

    if (doorsObjectsLayer) {

      doorsObjectsLayer.objects.forEach((obj) => {

        if (obj.name.startsWith("door")) {

          const porte = this.physics.add.sprite(obj.x, obj.y, 'porte');

          porte.setCollideWorldBounds(true);

          porte.setDepth(50); // Au-dessus des murs mais accessible au joueur

          porte.setDisplaySize(64, 32);  // Taille correcte pour la collision

          porte.body.setImmovable(true);  // La porte ne se déplace pas

          porte.body.moves = false;  // Désactiver complètement les mouvements du body

          porte.isOpen = false;

          porte.estSolide = true;// État initial : fermée
          porte.nom = obj.name;  // Stocker le nom de la porte
          porte.play('door_closed'); // Affiche le frame fermé

          groupe_portes.add(porte);

          
          if (obj.properties) {
            const destProp = obj.properties.find(p => p.name === "destination");
            if (destProp) {
              porte.destination = destProp.value; // ex: "map_cuisine"
            }
          }
          
          // Vérifier si la porte a la propriété "horizontale"

          if (obj.properties) {

            const hasHorizontal = obj.properties.some(prop =>

              prop.name === "horizontal" || prop.name === "orientation"

            );

            if (!hasHorizontal) {

              porte.setAngle(90); // Tourner de 90° si n'a pas la propriété horizontale

            }

          } else {

            // Si pas de propriétés, tourner de 90° par défaut

            porte.setAngle(90);

          }

        }

      });

    }

   

    // Collider solide entre le joueur et les portes

    this.physics.add.collider(player, groupe_portes);

   

    // Ancrage de la caméra sur le joueur

    this.cameras.main.startFollow(player);

 

    /***********************************************************************/

    /** 3. ENTRÉES CLAVIER ET ANIMATIONS

    /***********************************************************************/

    clavier = this.input.keyboard.createCursorKeys();

this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.anims.create({

      key: "anim_tourne_gauche",

      frames: this.anims.generateFrameNumbers("img_perso", { start: 4, end: 5 }),

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

 

    // On prend la valeur la plus petite pour être sûr que tout rentre sans être coupé

    let meilleurZoom = Math.min(zoomX, zoomY);

    // On applique le zoom et on centre la caméra

    this.cameras.main.setZoom(meilleurZoom);

    this.cameras.main.centerOn(carteDuNiveau.widthInPixels / 2, carteDuNiveau.heightInPixels / 2);

  }

 

  update() {

    // Gauche / Droite

    if (clavier.right.isDown) {

      player.setVelocityX(160);

      player.setFlipX(false);

      player.anims.play('anim_tourne_droite', true);

    }

    else if (clavier.left.isDown) {

      player.setVelocityX(-160);

      player.setFlipX(false);

      player.anims.play('anim_tourne_gauche', true);

    } else {

      player.setVelocityX(0);

      player.setFlipX(false);

      player.anims.play('anim_face');

    }

 

    // Haut / Bas

    if (clavier.up.isDown) {

      player.setVelocityY(-160);

    }

    else if (clavier.down.isDown) {

      player.setVelocityY(160);

    }

    else {

      player.setVelocityY(0);

    }

 

    // Ouverture/Fermeture des portes avec interaction proximité + Enter

    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {

      groupe_portes.children.entries.forEach(porte => {

        const distance = Phaser.Math.Distance.Between(

          player.x, player.y,

          porte.x, porte.y

        );

 

        // Si le joueur est proche et la porte est fermée (solide), ouvrir
        if (distance < 100 && porte.estSolide) {
          porte.estSolide = false;
          porte.setFrame(1);  // Afficher la 2ème image (porte ouverte)
          porte.body.setEnable(false);  // Désactiver la collision
          // Si c'est la porte1, changer de map et définir la position de spawn
          if (porte.name === "door1") {
            if (!window.spawnData) window.spawnData = {};
            window.spawnData.map_cuisine = { x: 100, y: 100 }; // Choisis la position de spawn souhaitée
            this.scene.start("map_cuisine");
          }
        if (distance < 100 && porte.estSolide) {
          porte.estSolide = false;
          porte.setFrame(1);
          porte.body.setEnable(false);

          // Debug: afficher le nom de la porte
          console.log("Porte ouverte:", porte.nom);

          // Téléporter selon le nom de la porte
          if (porte.nom === "door1") {
            this.scene.start("map_cuisine");
          } else if (porte.nom === "door 3") {
            this.scene.start("map_stuff");
          }

        } else if (distance < 100 && !porte.estSolide) {
          porte.estSolide = true;
          porte.setFrame(0);
          porte.body.setEnable(true);
        }
        // Si le joueur est proche et la porte est ouverte, fermer
        else if (distance < 100 && !porte.estSolide) {
          porte.estSolide = true;
          porte.setFrame(0);  // Afficher la 1ère image (porte fermée)
          porte.body.setEnable(true);  // Réactiver la collision
        }

      });

    }

  }

}


