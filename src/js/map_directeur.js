var player;

export default class map_directeur extends Phaser.Scene {
    constructor() {
        super({ key: "map_directeur" });
    }
    preload() { 
        this.load.tilemapTiledJSON("directeur", "src/assets/map_directeur.tmj");
        this.load.image("allTiles", "src/tilesets/all_tilesets.png");
        this.load.image("tapis_jaune", "src/tilesets/YellowPlastic_d.jpg");
        this.load.spritesheet("img_perso", "src/assets/images/dude.png", {
            frameWidth: 44,
            frameHeight: 48
        });
        this.load.image('doors', 'src/assets/images/door_solo.png');
        this.load.image('arthus', 'src/assets/images/arthus1.png');
    }

    create() {
        // Pour lire la money au démarrage de la scène si besoin :
        this.game.events.emit('getMoney', (money) => {
        });

        const carteDirecteurLab = this.add.tilemap("directeur");
        const tileset = carteDirecteurLab.addTilesetImage("all-tileset", "allTiles");
        const yellow = carteDirecteurLab.addTilesetImage("yellow", "tapis_jaune", 32, 32);
        const floorLayer = carteDirecteurLab.createLayer("floor", tileset, 0, 0);
        const yellowLayer = carteDirecteurLab.createLayer("yellow", yellow, 0, 0);
        const carpetLayer = carteDirecteurLab.createLayer("carpet", tileset, 0, 0);
        const wallLayer = carteDirecteurLab.createLayer("wall", tileset, 0, 0);
        const objectsLayer = carteDirecteurLab.createLayer("objects", tileset, 0, 0);
        wallLayer.setCollisionByProperty({ estSolide: true });
        objectsLayer.setCollisionByProperty({ estSolide: true });


        this.physics.world.setBounds(0, 0, carteDirecteurLab.widthInPixels, carteDirecteurLab.heightInPixels);
        this.cameras.main.setBounds(0, 0, carteDirecteurLab.widthInPixels, carteDirecteurLab.heightInPixels);

        let zoomX = this.scale.width / carteDirecteurLab.widthInPixels;
        let zoomY = this.scale.height / carteDirecteurLab.heightInPixels;
        this.cameras.main.setZoom(Math.min(zoomX, zoomY));
        this.cameras.main.centerOn(carteDirecteurLab.widthInPixels / 2, carteDirecteurLab.heightInPixels / 2);
        
        // ✅ Créer la porte "door_retour"
        const groupe_portes = this.physics.add.group();
        const doorsObjectsLayer = carteDirecteurLab.getObjectLayer("door_retour");
        if (doorsObjectsLayer) {
            const obj = doorsObjectsLayer.objects[0];
            if (obj) {
                const porte = this.physics.add.sprite(obj.x, obj.y, 'doors');
                porte.setCollideWorldBounds(true);
                porte.setDepth(50);
                porte.setDisplaySize(64, 32);
                porte.setRotation(Math.PI / 2);
                porte.body.setImmovable(true);
                porte.body.moves = false;
                porte.estSolide = true;
                porte.nom = obj.name;
                porte.doorName = obj.name;
                groupe_portes.add(porte);
            }
        }

        // ✅ Créer l'image Arthus au ping "arthus"
        const arthusObjectsLayer = carteDirecteurLab.getObjectLayer("arthus");
        if (arthusObjectsLayer) {
            const obj = arthusObjectsLayer.objects[0];
            if (obj) {
                this.arthus = this.physics.add.sprite(obj.x, obj.y, 'arthus');
                this.arthus.setCollideWorldBounds(true);
                this.arthus.setDepth(50);
                this.arthus.body.setImmovable(true);
                this.arthus.body.moves = false;
            }
        }

        // ✅ Récupérer la position de spawn du joueur selon la porte de destination
        const { porteDestination } = this.scene.settings.data || {};
        let playerSpawnX = 100;
        let playerSpawnY = 100;
        if (porteDestination) {
            const taxiPoints = carteDirecteurLab.getObjectLayer("doors");
            if (taxiPoints) {
                const door = taxiPoints.objects.find(obj => obj.name === porteDestination);
                if (door) {
                    playerSpawnX = door.x;
                    playerSpawnY = door.y;
                }
            }
        }

        player = this.physics.add.sprite(playerSpawnX, playerSpawnY, 'img_perso');
        player.setCollideWorldBounds(true);
        player.setDepth(100);
        player.body.setGravityY(-this.physics.world.gravity.y);
        player.pointsVie = 3;
        this.invincible = false;
        
        if (wallLayer) this.physics.add.collider(player, wallLayer);
        if (objectsLayer) this.physics.add.collider(player, objectsLayer);
        if (this.arthus) this.physics.add.collider(player, this.arthus);

        this.doorCollider = this.physics.add.collider(player, groupe_portes);
        this.groupe_portes = groupe_portes;
        this.cameras.main.startFollow(player);

        if (!this.anims.exists("anim_tourne_gauche")) {
            this.anims.create({
                key: "anim_tourne_gauche",
                frames: this.anims.generateFrameNumbers("img_perso", { start: 4, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }
        if (!this.anims.exists("anim_tourne_droite")) {
            this.anims.create({
                key: "anim_tourne_droite",
                frames: this.anims.generateFrameNumbers("img_perso", { start: 6, end: 8 }),
                frameRate: 10,
                repeat: -1
            });
        }
        if (!this.anims.exists("anim_face")) {
            this.anims.create({
                key: "anim_face",
                frames: [{ key: "img_perso", frame: 1 }],
                frameRate: 20
            });
        }

        // ✅ Initialiser le clavier
        this.cursors = this.input.keyboard.createCursorKeys();

    }
    update() { 
        const cursors = this.cursors;

        this.doorNearby = null;
        if (this.groupe_portes) {
            this.groupe_portes.children.entries.forEach((door) => {
                const distance = Phaser.Math.Distance.Between(
                    player.x, player.y,
                    door.x, door.y
                );
                if (distance < 100 && door.estSolide) {
                    this.doorNearby = door;
                }
            });
        }

        if (cursors.right.isDown) {
            player.setVelocityX(160);
            player.setFlipX(false);
            player.anims.play('anim_tourne_droite', true);
        } else if (cursors.left.isDown) {
            player.setVelocityX(-160);
            player.setFlipX(false);
            player.anims.play('anim_tourne_gauche', true);
        } else {
            player.setVelocityX(0);
            player.anims.play('anim_face');
        }

        if (cursors.up.isDown) {
            player.setVelocityY(-160);
        } else if (cursors.down.isDown) {
            player.setVelocityY(160);
        } else {
            player.setVelocityY(0);
        }

    }
}