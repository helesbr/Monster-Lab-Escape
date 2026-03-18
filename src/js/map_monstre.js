var player;

export default class map_monstre extends Phaser.Scene {
    constructor() {
        super({ key: "map_monstre" });
    }

    preload() {
        this.load.tilemapTiledJSON("monstres", "src/assets/map_monstre.tmj");
        this.load.image("allTiles", "src/tilesets/all_tilesets.png");
        this.load.spritesheet('monstres', 'src/assets/images/monstre.png', {
            frameWidth: 44,
            frameHeight: 48
        });
        this.load.spritesheet("img_perso", "src/assets/images/dude.png", {
            frameWidth: 44,
            frameHeight: 48
        });
        this.load.spritesheet('doors', 'src/assets/images/doors_spritesheet.png', {
            frameWidth: 64,
            frameHeight: 80
        });
        this.load.audio('monstres', 'src/assets/son/monstre.mp3');
    }

    create() {
        this.son_monstre = this.sound.add('monstres');
        this.son_monstre.play();
        this.events.on('shutdown', () => {
            if (this.son_monstre) this.son_monstre.stop();
        });

        const carteMonstreLab = this.add.tilemap("monstres");
        const tileset = carteMonstreLab.addTilesetImage("all_tilset", "allTiles");

        const sangLayer = carteMonstreLab.createLayer("blood1", tileset, 0, 0);
        const murLayer = carteMonstreLab.createLayer("Mur", tileset, 0, 0);
        const bloodLayer = carteMonstreLab.createLayer("blood", tileset, 0, 0);

        murLayer.setCollisionByProperty({ estSolide: true });

        this.physics.world.setBounds(0, 0, carteMonstreLab.widthInPixels, carteMonstreLab.heightInPixels);
        this.cameras.main.setBounds(0, 0, carteMonstreLab.widthInPixels, carteMonstreLab.heightInPixels);

        let zoomX = this.scale.width / carteMonstreLab.widthInPixels;
        let zoomY = this.scale.height / carteMonstreLab.heightInPixels;
        this.cameras.main.setZoom(Math.min(zoomX, zoomY));
        this.cameras.main.centerOn(carteMonstreLab.widthInPixels / 2, carteMonstreLab.heightInPixels / 2);

        // Spawn monstres
        this.groupe_monstres = this.physics.add.group();
        const calqueMonstres = carteMonstreLab.getObjectLayer("monstres");
        if (calqueMonstres) {
            calqueMonstres.objects.forEach((monstreObj) => {
                const randomX = Phaser.Math.Between(50, carteMonstreLab.widthInPixels - 50);
                const randomY = Phaser.Math.Between(50, carteMonstreLab.heightInPixels - 50);
                const monstre = this.groupe_monstres.create(randomX, randomY, 'monstres');
                monstre.setBounce(1, 1);
                monstre.setCollideWorldBounds(true);
                monstre.setDisplaySize(100, 100);
                monstre.setDepth(50);
                monstre.pointsVie = Phaser.Math.Between(1, 3);
                monstre.setVelocity(
                    Phaser.Math.Between(-80, 80),
                    Phaser.Math.Between(-80, 80)
                );

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
        }

        this.physics.add.collider(this.groupe_monstres, murLayer);

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
        const tabPoints1 = carteMonstreLab.getObjectLayer("door_retour");
        const tabPoints2 = carteMonstreLab.getObjectLayer("door retour");
        [tabPoints1, tabPoints2].forEach(tabPoints => {
            if (tabPoints) {
                tabPoints.objects.forEach(point => {
                    const porte = groupe_portes.create(point.x, point.y, 'doors');
                    porte.anims.play('door_closed');
                    porte.setAngle(90);
                    porte.setDepth(40);
                    porte.doorName = point.name;
                    porte.body.setCollideWorldBounds(false);
                    porte.body.setImmovable(true);
                    porte.body.moves = false;
                    porte.estSolide = true;
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

        if (murLayer) this.physics.add.collider(player, murLayer);

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
                    let porteDestination = "door4";
                    if (doorName === "selection") {
                        destination = "selection";
                        porteDestination = "door4";
                    }
                    this.scene.start(destination, { porteDestination });
                });
            }
        });
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

        if (this.groupe_monstres) {
            this.groupe_monstres.children.entries.forEach((monstre) => {
                if (monstre.body.velocity.x > 0) monstre.setFlipX(false);
                else if (monstre.body.velocity.x < 0) monstre.setFlipX(true);
            });
        }
    }
}