var player;
var clavier;
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
        this.load.audio('menu', 'src/assets/son/menu.mp3');
        this.load.audio('laboratory', 'src/assets/son/laboratory.mp3');
        this.load.image('allTiles', 'src/tilesets/all_tilesets.png');
        this.load.image('background', 'src/tilesets/tile-background.png');
        this.load.tilemapTiledJSON("carte", "src/assets/laboratory.tmj");
        this.load.tilemapTiledJSON("cuisine", "src/assets/map_cuisine.tmj");
        this.load.tilemapTiledJSON("stuff", "src/assets/map_stuff.tmj");
        this.load.tilemapTiledJSON("directeur", "src/assets/map_directeur.tmj");
        this.load.spritesheet('porte', 'src/assets/images/doors_spritesheet.png', {
            frameWidth: 64,
            frameHeight: 32
        });
        // ✅ chargement du gun
        this.load.spritesheet("image_gun", "src/assets/images/gun.png", {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create() {
        this.son_laboratory = this.sound.add('laboratory');
        this.son_laboratory.play();
        this.events.on('shutdown', () => {
            if (this.son_laboratory) this.son_laboratory.stop();
        });

        // Pour lire la money au démarrage de la scène si besoin :
        this.game.events.emit('getMoney', (money) => {
            console.log('Money actuelle:', money);
        });

        // Pour ajouter de la money (ex: quand un monstre meurt) :
        // this.game.events.emit('addMoney', 10);

        const carteDuNiveau = this.add.tilemap("carte");
        const tileset = carteDuNiveau.addTilesetImage("all_tilset", "allTiles");
        const backgroundTileset = carteDuNiveau.addTilesetImage("background", "background");

        const backgroundLayer = carteDuNiveau.createLayer("background", backgroundTileset, 0, 0);
        const floorLayer = carteDuNiveau.createLayer("Floor", tileset, 0, 0);
        const murLayer = carteDuNiveau.createLayer("Mur", tileset, 0, 0);
        const objectLayer = carteDuNiveau.createLayer("Object", tileset, 0, 0);

        murLayer.setCollisionByProperty({ estSolide: true });

        this.physics.world.setBounds(0, 0, 960, 960);
        this.cameras.main.setBounds(0, 0, 960, 960);

        const { porteDestination, offsetY = 0, offsetX = 0 } = this.scene.settings.data || {};
        let playerX = 190;
        let playerY = 480;

        if (porteDestination) {
            const taxiPoints = carteDuNiveau.getObjectLayer("doors");
            if (taxiPoints) {
                const door = taxiPoints.objects.find(obj => obj.name === porteDestination);
                if (door) {
                    playerX = door.x + offsetX;
                    playerY = door.y + offsetY;
                }
            }
        }

        player = this.physics.add.sprite(playerX, playerY, 'img_perso');
        player.setCollideWorldBounds(true);
        player.setDepth(100);
        player.body.setGravityY(-this.physics.world.gravity.y);
        // ✅ initialiser arme et direction
        player.armeEquipee = null;
        player.directionArme = 'droite';

        this.physics.add.collider(player, murLayer);
        this.physics.add.collider(player, objectLayer);

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

        groupe_portes = this.physics.add.group();
        const doorsObjectsLayer = carteDuNiveau.getObjectLayer("doors");
        if (doorsObjectsLayer) {
            doorsObjectsLayer.objects.forEach((obj) => {
                if (obj.name.startsWith("door")) {
                    const porte = this.physics.add.sprite(obj.x, obj.y, 'porte');
                    porte.setCollideWorldBounds(true);
                    porte.setDepth(50);
                    porte.setDisplaySize(64, 32);
                    porte.body.setImmovable(true);
                    porte.body.moves = false;
                    porte.isOpen = false;
                    porte.estSolide = true;
                    porte.nom = obj.name;
                    porte.play('door_closed');
                    porte.doorName = obj.name;
                    groupe_portes.add(porte);

                    if (obj.properties) {
                        const destProp = obj.properties.find(p => p.name === "destination");
                        if (destProp) porte.destination = destProp.value;
                    }

                    if (obj.properties) {
                        const hasHorizontal = obj.properties.some(prop =>
                            prop.name === "horizontal" || prop.name === "orientation"
                        );
                        if (!hasHorizontal) porte.setAngle(90);
                    } else {
                        porte.setAngle(90);
                    }
                }
            });
        }

        this.physics.add.collider(player, groupe_portes);
        this.cameras.main.startFollow(player);

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

        // ✅ animations gun
        if (!this.anims.exists("gun_droite")) {
            this.anims.create({ key: "gun_droite", frames: [{ key: "image_gun", frame: 0 }], frameRate: 10 });
        }
        if (!this.anims.exists("gun_gauche")) {
            this.anims.create({ key: "gun_gauche", frames: [{ key: "image_gun", frame: 1 }], frameRate: 10 });
        }
        if (!this.anims.exists("gun_haut")) {
            this.anims.create({ key: "gun_haut", frames: [{ key: "image_gun", frame: 3 }], frameRate: 10 });
        }
        if (!this.anims.exists("gun_bas")) {
            this.anims.create({ key: "gun_bas", frames: [{ key: "image_gun", frame: 2 }], frameRate: 10 });
        }

        groupe_monstres = this.physics.add.group();
        groupe_bombes = this.physics.add.group();

        

        let zoomX = this.scale.width / carteDuNiveau.widthInPixels;
        let zoomY = this.scale.height / carteDuNiveau.heightInPixels;
        this.cameras.main.setZoom(Math.min(zoomX, zoomY));
        this.cameras.main.centerOn(carteDuNiveau.widthInPixels / 2, carteDuNiveau.heightInPixels / 2);

        // ✅ récupérer si le joueur a déjà l'arme
        this.game.events.emit('getArme', (aArme) => {
            if (aArme) {
                const armeSprite = this.add.sprite(player.x + 20, player.y, 'image_gun');
                armeSprite.setDisplaySize(40, 40);
                armeSprite.setDepth(99);
                armeSprite.anims.play('gun_droite');
                player.armeEquipee = armeSprite;
            }
        });
    }

    update() {
        if (clavier.right.isDown) {
            player.setVelocityX(160);
            player.setFlipX(false);
            player.anims.play('anim_tourne_droite', true);
            player.directionArme = 'droite';
        } else if (clavier.left.isDown) {
            player.setVelocityX(-160);
            player.setFlipX(false);
            player.anims.play('anim_tourne_gauche', true);
            player.directionArme = 'gauche';
        } else {
            player.setVelocityX(0);
            player.setFlipX(false);
            player.anims.play('anim_face');
        }

        if (clavier.up.isDown) {
            player.setVelocityY(-160);
            player.directionArme = 'haut';
        } else if (clavier.down.isDown) {
            player.setVelocityY(160);
            player.directionArme = 'bas';
        } else {
            player.setVelocityY(0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            for (const porte of groupe_portes.children.entries) {
                const distance = Phaser.Math.Distance.Between(
                    player.x, player.y,
                    porte.x, porte.y
                );

                if (distance < 100 && porte.estSolide) {
                    // Vérifier si c'est la porte 2 (fermée) - bloquée si monstres actifs
                    if (porte.doorName === "door2" && groupe_monstres.countActive(true) > 0) {
                        const texte = this.add.text(480, 480, "Cette porte est fermée, il faut tuer tous les monstres de la salle monstre", {
                            fontSize: '32px',
                            fontStyle: 'bold',
                            align: 'center',
                            fill: '#ffffff',
                            wordWrap: { width: 400 }
                        }).setOrigin(0.5);
                        this.time.delayedCall(4000, () => texte.destroy());
                        break; // Sortir complètement de la boucle
                    }

                    // Ouvrir la porte et se préparer à changer de scène
                    porte.estSolide = false;
                    porte.setFrame(1);
                    porte.body.setEnable(false);

                    let destination = "map_cuisine";
                    let porteDestination = "door_retour";

                    if (porte.doorName === "door3") {
                        destination = "map_stuff";
                        porteDestination = "door_retour1";
                    } else if (porte.doorName === "door31") {
                        destination = "map_stuff";
                        porteDestination = "door_retour2";
                    } else if (porte.doorName === "door4") {
                        destination = "map_monstre";
                        porteDestination = "door_monstre";
                    } else if (porte.doorName === "door1") {
                        destination = "map_cuisine";
                        porteDestination = "door_retour2";
                    } else if (porte.doorName === "door12") {
                        destination = "map_cuisine";
                        porteDestination = "door_retour1";
                    } else if (porte.doorName === "door2") {
                        destination = "map_monstre";
                        porteDestination = "door_monstre";
                    }
                    this.scene.start(destination, { porteDestination });
                    break; // Sortir après lancement de la scène

                } else if (distance < 100 && !porte.estSolide) {
                    porte.estSolide = true;
                    porte.setFrame(0);
                    porte.body.setEnable(true);
                    break;
                }
            }
        }

        // ✅ mettre à jour la position de l'arme
        if (player.armeEquipee) {
            switch (player.directionArme) {
                case 'droite':
                    player.armeEquipee.anims.play('gun_droite', true);
                    player.armeEquipee.setPosition(player.x + 30, player.y);
                    break;
                case 'gauche':
                    player.armeEquipee.anims.play('gun_gauche', true);
                    player.armeEquipee.setPosition(player.x - 20, player.y);
                    break;
                case 'haut':
                    player.armeEquipee.anims.play('gun_haut', true);
                    player.armeEquipee.setPosition(player.x, player.y - 30);
                    break;
                case 'bas':
                    player.armeEquipee.anims.play('gun_bas', true);
                    player.armeEquipee.setPosition(player.x, player.y + 30);
                    break;
            }
        }
    }
}


