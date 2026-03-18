var player;

export default class map_cuisine extends Phaser.Scene {
    constructor() {
        super({ key: "map_cuisine" });
    }

    preload() {
        this.load.tilemapTiledJSON("cuisine", "src/assets/map_cuisine.tmj");
        this.load.image('allTiles', 'src/tilesets/all_tilesets.png');
        this.load.spritesheet('doors', 'src/assets/images/doors_spritesheet.png', {
            frameWidth: 64,
            frameHeight: 80
        });
        this.load.spritesheet("img_perso", "src/assets/images/dude.png", {
            frameWidth: 44,
            frameHeight: 48
        });
        this.load.spritesheet('monstre', 'src/assets/images/mini_monstres.png', {
            frameWidth: 44,
            frameHeight: 48
        });
        this.load.image('preworkout', 'src/assets/images/prewarkout.png');
        this.load.image('creatine', 'src/assets/images/creatine.png');
        this.load.audio('cuisine', 'src/assets/son/cuisine.mp3');
    }

    create() {
        this.son_cuisine = this.sound.add('cuisine');
        this.son_cuisine.play();
        this.events.on('shutdown', () => {
            if (this.son_cuisine) this.son_cuisine.stop();
        });

        const carteCuisine = this.add.tilemap("cuisine");
        const tileset = carteCuisine.addTilesetImage("all_tileset", "allTiles");
        const solLayer = carteCuisine.createLayer("sol", tileset, 0, 0);
        const wallLayer = carteCuisine.createLayer("Wall", tileset, 0, 0);
        const objetsLayer = carteCuisine.createLayer("objets", tileset, 0, 0);

        wallLayer.setCollisionByProperty({ estSolide: true });
        objetsLayer.setCollisionByProperty({ estSolide: true });

        this.physics.world.setBounds(0, 0, carteCuisine.widthInPixels, carteCuisine.heightInPixels);
        this.cameras.main.setBounds(0, 0, carteCuisine.widthInPixels, carteCuisine.heightInPixels);

        let zoomX = this.scale.width / carteCuisine.widthInPixels;
        let zoomY = this.scale.height / carteCuisine.heightInPixels;
        this.cameras.main.setZoom(Math.min(zoomX, zoomY));
        this.cameras.main.centerOn(carteCuisine.widthInPixels / 2, carteCuisine.heightInPixels / 2);

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

        if (!this.anims.exists("monstre_marche")) {
            this.anims.create({
                key: "monstre_marche",
                frames: this.anims.generateFrameNumbers("monstre", { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Spawn des monstres
        const calqueMonstres = carteCuisine.getObjectLayer("Calque monstres");
        this.groupe_monstres = this.physics.add.group();
        if (calqueMonstres) {
            calqueMonstres.objects.forEach((monstreObj) => {
                const monstre = this.groupe_monstres.create(monstreObj.x, monstreObj.y, 'monstre', 0);
                monstre.setBounce(1, 1);
                monstre.setCollideWorldBounds(true);
                monstre.setDisplaySize(40, 40);
                monstre.setDepth(50);
                monstre.pointsVie = Phaser.Math.Between(1, 3);
                monstre.setVelocity(
                    Phaser.Math.Between(-80, 80),
                    Phaser.Math.Between(-80, 80)
                );
                monstre.anims.play('monstre_marche');

                monstre.moveEvent = this.time.addEvent({
                    delay: Phaser.Math.Between(2000, 4000),
                    callback: function() {
                        if (monstre.active) {
                            monstre.setVelocity(
                                Phaser.Math.Between(-80, 80),
                                Phaser.Math.Between(-80, 80)
                            );
                        }
                    },
                    loop: true
                });
            });
            if (wallLayer) this.physics.add.collider(this.groupe_monstres, wallLayer);
            if (objetsLayer) this.physics.add.collider(this.groupe_monstres, objetsLayer);
        }

        if (!this.anims.exists("door_closed")) {
            this.anims.create({
                key: "door_closed",
                frames: [{ key: 'doors', frame: 0 }],
                frameRate: 10
            });
        }
        if (!this.anims.exists("door_open")) {
            this.anims.create({
                key: "door_open",
                frames: this.anims.generateFrameNumbers('doors', { start: 1, end: 4 }),
                frameRate: 10
            });
        }

        var groupe_portes = this.physics.add.group();
        const tabPoints1 = carteCuisine.getObjectLayer("door_retour");
        const tabPoints2 = carteCuisine.getObjectLayer("door retour");
        [tabPoints1, tabPoints2].forEach(tabPoints => {
            if (tabPoints) {
                tabPoints.objects.forEach(point => {
                    const porte = groupe_portes.create(point.x, point.y, 'doors');
                    porte.anims.play('door_closed');
                    porte.setDepth(40);
                    porte.doorName = point.name;
                    porte.body.setImmovable(true);
                    porte.body.moves = false;
                    porte.estSolide = true;
                    if (point.properties) {
                        const hasVertical = point.properties.some(prop => prop.name === "verticale" && prop.value === true);
                        if (hasVertical) porte.setAngle(90);
                    }
                });
            }
        });

        const { porteDestination } = this.scene.settings.data || {};
        let playerSpawnX = 100;
        let playerSpawnY = 100;
        if (porteDestination) {
            const porteArrivee = groupe_portes.children.entries.find(p => p.doorName === porteDestination);
            if (porteArrivee) {
                playerSpawnX = porteArrivee.x;
                playerSpawnY = porteArrivee.y;
            }
        }

        player = this.physics.add.sprite(playerSpawnX, playerSpawnY, 'img_perso');
        player.setCollideWorldBounds(true);
        player.setDepth(100);
        player.body.setGravityY(-this.physics.world.gravity.y);
        player.pointsVie = 3;
        this.invincible = false;

        // ✅ récupérer les vies depuis le HUD
        this.game.events.emit('getVie', (vie) => {
            player.pointsVie = vie;
        });

        if (wallLayer) this.physics.add.collider(player, wallLayer);
        if (objetsLayer) this.physics.add.collider(player, objetsLayer);

        this.doorCollider = this.physics.add.collider(player, groupe_portes);
        this.groupe_portes = groupe_portes;
        this.cameras.main.startFollow(player);

        // ✅ overlap joueur/monstres → envoie au HUD
        this.physics.add.overlap(player, this.groupe_monstres, () => {
            if (this.invincible) return;

            this.invincible = true;
            this.game.events.emit('playerHit');
            player.pointsVie--;

            this.tweens.add({
                targets: player,
                alpha: 0,
                duration: 100,
                repeat: 5,
                yoyo: true,
                onComplete: () => {
                    player.setAlpha(1);
                    this.invincible = false;
                }
            });

            if (player.pointsVie <= 0) {
                this.game.events.emit('resetVie');
                this.scene.stop('HUD');
                this.scene.start('menu');
            }
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.doorNearby && this.doorNearby.estSolide) {
                const doorName = this.doorNearby.doorName;
                this.doorNearby.estSolide = false;
                this.doorCollider.active = false;
                this.doorNearby.anims.play('door_open');
                this.time.delayedCall(500, () => {
                    let destination = "selection";
                    let porteDestination = "door1";
                    let offsetY = 0;
                    if (doorName === "door_retour2") {
                        destination = "selection";
                        porteDestination = "door1";
                        offsetY = 50;
                    } else if (doorName === 'door_retour1') {
                        destination = 'selection';
                        porteDestination = 'door12';
                    }
                    this.scene.start(destination, { porteDestination, offsetY, offsetX });
                });
            }
        });

        const calqueProduit = carteCuisine.getObjectLayer("Calque Produit");
        if (calqueProduit) {
            calqueProduit.objects.forEach((produitObj) => {
                const imageKey = produitObj.name === 'creatine' ? 'creatine' : 'preworkout';
                const produit = this.add.image(produitObj.x, produitObj.y, imageKey);
                produit.setDisplaySize(30, 30);
                produit.setDepth(45);
            });

            const calqueCreatine = carteCuisine.getObjectLayer("calque crea");
            if (calqueCreatine) {
                calqueCreatine.objects.forEach((creatineObj) => {
                    const creatine = this.add.image(creatineObj.x, creatineObj.y, 'creatine');
                    creatine.setDisplaySize(30, 30);
                    creatine.setDepth(45);
                });
            }
        }

        this.game.config.maVariable -= 10;
    }

    update() {
        if (!this.cursors) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }
        const cursors = this.cursors;

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

        if (this.groupe_monstres) {
            this.groupe_monstres.children.entries.forEach((monstre) => {
                if (monstre.body.velocity.x > 0) monstre.setFlipX(false);
                else if (monstre.body.velocity.x < 0) monstre.setFlipX(true);
            });
        }
    }
}
