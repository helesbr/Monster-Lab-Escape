var player;

export default class map_monstre extends Phaser.Scene {
    constructor() {
        super({ key: "map_monstre" });
    }

    preload() {
        this.load.tilemapTiledJSON("monstres", "src/assets/map_monstre.tmj");
        this.load.image("allTiles", "src/tilesets/all_tilesets.png");
        this.load.image('ball', 'src/assets/images/ball.png');
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
        this.load.spritesheet("image_gun", "src/assets/images/gun.png", {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.audio('monstres', 'src/assets/son/monstre.mp3');
    }

    create() {
        this.son_monstre = this.sound.add('monstres');
        this.son_monstre.play();
        this.events.on('shutdown', () => {
            if (this.son_monstre) this.son_monstre.stop();
        });

        // Pour lire la money au démarrage de la scène si besoin :
        this.game.events.emit('getMoney', (money) => {
            console.log('Money actuelle:', money);
        });

        // Pour ajouter de la money (ex: quand un monstre meurt) :
        // this.game.events.emit('addMoney', 10);

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

        // ✅ spawn monstres selon ceux qui sont encore vivants
        this.groupe_monstres = this.physics.add.group();
        const calqueMonstres = carteMonstreLab.getObjectLayer("monstres");

        this.game.events.emit('getMonstresMorts', (monstresMorts) => {
            if (calqueMonstres) {
                calqueMonstres.objects.forEach((monstreObj, index) => {
                    // ✅ si ce monstre a déjà été tué on le skip
                    if (monstresMorts.includes(index)) return;

                    const randomX = Phaser.Math.Between(50, carteMonstreLab.widthInPixels - 50);
                    const randomY = Phaser.Math.Between(50, carteMonstreLab.heightInPixels - 50);
                    const monstre = this.groupe_monstres.create(randomX, randomY, 'monstres');
                    monstre.setBounce(1, 1);
                    monstre.setCollideWorldBounds(true);
                    monstre.setDisplaySize(100, 100);
                    monstre.setDepth(50);
                    monstre.pointsVie = Phaser.Math.Between(3, 6);
                    // ✅ stocker l'index sur le monstre
                    monstre.index = index;
                    monstre.setVelocity(
                        Phaser.Math.Between(-150, 150),
                        Phaser.Math.Between(-150, 150)
                    );

                    monstre.moveEvent = this.time.addEvent({
                        delay: Phaser.Math.Between(2000, 4000),
                        callback: function() {
                            if (monstre.active) {
                                monstre.setVelocity(
                                    Phaser.Math.Between(-150, 150),
                                    Phaser.Math.Between(-150, 150)
                                );
                            }
                        },
                        loop: true
                    });
                });
            }
        });

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
        player.armeEquipee = null;
        player.directionArme = 'droite';
        player.pointsVie = 3;
        this.invincible = false;

        this.game.events.emit('getVie', (vie) => {
            player.pointsVie = vie;
        });

        this.game.events.emit('getArme', (aArme) => {
            if (aArme) {
                const armeSprite = this.add.sprite(player.x + 20, player.y, 'image_gun');
                armeSprite.setDisplaySize(40, 40);
                armeSprite.setDepth(99);
                armeSprite.anims.play('gun_droite');
                player.armeEquipee = armeSprite;
            }
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

        this.groupeBullets = this.physics.add.group();

        this.physics.add.collider(this.groupeBullets, murLayer, (balle) => {
            balle.destroy();
        });

        // ✅ overlap balles/monstres avec index
        this.physics.add.overlap(this.groupeBullets, this.groupe_monstres, (balle, monstre) => {
            balle.destroy();
            monstre.pointsVie--;
            if (monstre.pointsVie <= 0) {
                if (monstre.moveEvent) monstre.moveEvent.remove();
                this.game.events.emit('monstreMort', monstre.index);
                monstre.destroy();
            }
        });

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
                this.game.events.emit('resetArme');
                this.game.events.emit('resetMonstres');
                this.scene.stop('HUD');
                this.scene.start('menu');
            }
        });

        this.physics.world.on("worldbounds", (body) => {
            const objet = body.gameObject;
            if (this.groupeBullets.contains(objet)) {
                objet.destroy();
            }
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.boutonFeu = this.input.keyboard.addKey('A');

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

        // ✅ immunité de 3 secondes à l'entrée dans la scène
        this.invincible = true;
        player.setAlpha(0.5); // effet visuel semi-transparent

        this.time.delayedCall(3000, () => {
            this.invincible = false;
            player.setAlpha(1);
        });
    }

    tirer() {
        if (!player.armeEquipee) return;

        let vx = 0;
        let vy = 0;
        let offsetX = 0;
        let offsetY = 0;
        const vitesse = 600;

        switch (player.directionArme) {
            case 'droite': vx = vitesse;  offsetX = 30;  break;
            case 'gauche': vx = -vitesse; offsetX = -30; break;
            case 'haut':   vy = -vitesse; offsetY = -30; break;
            case 'bas':    vy = vitesse;  offsetY = 30;  break;
        }

        const balle = this.groupeBullets.create(
            player.x + offsetX,
            player.y + offsetY,
            'ball'
        );
        balle.setDisplaySize(12, 12);
        balle.setDepth(90);
        balle.setCollideWorldBounds(true);
        balle.body.allowGravity = false;
        balle.body.onWorldBounds = true;
        balle.setVelocity(vx, vy);
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
            player.directionArme = 'droite';
        } else if (cursors.left.isDown) {
            player.setVelocityX(-160);
            player.setFlipX(false);
            player.anims.play('anim_tourne_gauche', true);
            player.directionArme = 'gauche';
        } else {
            player.setVelocityX(0);
            player.anims.play('anim_face');
        }

        if (cursors.up.isDown) {
            player.setVelocityY(-160);
            player.directionArme = 'haut';
        } else if (cursors.down.isDown) {
            player.setVelocityY(160);
            player.directionArme = 'bas';
        } else {
            player.setVelocityY(0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.boutonFeu)) {
            this.tirer();
        }

        if (this.groupe_monstres) {
            this.groupe_monstres.children.entries.forEach((monstre) => {
                if (monstre.body.velocity.x > 0) monstre.setFlipX(false);
                else if (monstre.body.velocity.x < 0) monstre.setFlipX(true);
            });
        }

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