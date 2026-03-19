var player;

export default class map_stuff extends Phaser.Scene {
    constructor() {
        super({ key: "map_stuff" });
    }
    preload() {
        this.load.tilemapTiledJSON("stuff", "src/assets/map_stuff.tmj");
        this.load.image('allTiles', 'src/tilesets/all_tilesets.png');
        this.load.image('ball', 'src/assets/images/ball.png');
        this.load.image('heart', 'src/assets/images/heart.png');
        if (this.game.config.personnageSelectionne === 'helias') {
            this.load.image("img_perso", "src/assets/images/helias-perso.png");
        } else {
            this.load.spritesheet("img_perso", "src/assets/images/dude.png", {
                frameWidth: 44,
                frameHeight: 48
            });
        }
        this.load.spritesheet('monstre', 'src/assets/images/mini_monstres.png', {
            frameWidth: 44,
            frameHeight: 48
        });
        this.load.spritesheet("image_gun", "src/assets/images/gun.png", {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('doors', 'src/assets/images/doors_spritesheet.png', {
            frameWidth: 64,
            frameHeight: 80
        });
        this.load.audio('stuff', 'src/assets/son/stuff.mp3');
        this.load.audio('tkprime', 'src/assets/son/tkprime.mp3');
        this.load.audio('ronnie', 'src/assets/son/yeah_buddy.m4a');
        this.load.audio('rage_quit', 'src/assets/son/rage_quite.m4a');
    }

    create() {
        this.son_stuff = this.sound.add('stuff');
        this.son_stuff.play();
        this.son_tkprime = this.sound.add('tkprime');
        this.son_ronnie = this.sound.add('ronnie');
        this.son_rage_quit = this.sound.add('rage_quit');
        this.events.on('shutdown', () => {
            if (this.son_stuff) this.son_stuff.stop();
            if (this.son_tkprime) this.son_tkprime.stop();
            if (this.son_ronnie) this.son_ronnie.stop();
            if (this.son_rage_quit) this.son_rage_quit.stop();
        });

        const carte = this.add.tilemap("stuff");
        const tileset = carte.addTilesetImage("all_tileset", "allTiles");
        this.game.config.aPistole = false;



        const solLayer = carte.createLayer("Floor", tileset, 0, 0);
        const wallLayer = carte.createLayer("Mur", tileset, 0, 0);
        const objetsLayer = carte.createLayer("Object", tileset, 0, 0);

        wallLayer.setCollisionByProperty({ estSolide: true });
        objetsLayer.setCollisionByProperty({ estSolide: true });

        this.physics.world.setBounds(0, 0, carte.widthInPixels, carte.heightInPixels);
        this.physics.world.OVERLAP_BIAS = 16;
        this.cameras.main.setBounds(0, 0, carte.widthInPixels, carte.heightInPixels);
        let zoomX = this.scale.width / carte.widthInPixels;
        let zoomY = this.scale.height / carte.heightInPixels;
        this.cameras.main.setZoom(Math.min(zoomX, zoomY));
        this.cameras.main.centerOn(carte.widthInPixels / 2, carte.heightInPixels / 2);

        if (!this.anims.exists("monstre_marche")) {
            this.anims.create({
                key: "monstre_marche",
                frames: this.anims.generateFrameNumbers("monstre", { start: 0, end: 2 }),
                frameRate: 6,
                repeat: -1
            });
        }
        if (!this.anims.exists("monstre_dos")) {
            this.anims.create({
                key: "monstre_dos",
                frames: this.anims.generateFrameNumbers("monstre", { start: 3, end: 5 }),
                frameRate: 6,
                repeat: -1
            });
        }
        if (!this.anims.exists("monstre_cote")) {
            this.anims.create({
                key: "monstre_cote",
                frames: this.anims.generateFrameNumbers("monstre", { start: 6, end: 8 }),
                frameRate: 6,
                repeat: -1
            });
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
        const tabPoints = carte.getObjectLayer("door_retour");
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
                    if (hasVertical) {
                        porte.setAngle(90);
                        porte.body.setSize(32, 64);
                        porte.body.setOffset(16, -16);
                    }
                }
            });
        }

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

        if (!this.game.config.aPistole) {
            this.game.config.aPistole = false;
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
                if (!this.anims.exists("gun_droite")) {
                    this.anims.create({ key: "gun_droite", frames: [{ key: "image_gun", frame: 0 }], frameRate: 10 });
                }
                const armeSprite = this.add.sprite(player.x + 20, player.y, 'image_gun');
                armeSprite.setDisplaySize(40, 40);
                armeSprite.setDepth(99);
                armeSprite.anims.play('gun_droite');
                player.armeEquipee = armeSprite;
            }
        });

        if (wallLayer) this.physics.add.collider(player, wallLayer);
        if (objetsLayer) this.physics.add.collider(player, objetsLayer);

        this.doorCollider = this.physics.add.collider(player, groupe_portes);
        this.groupe_portes = groupe_portes;
        this.cameras.main.startFollow(player);

        this.isDude = this.game.config.personnageSelectionne !== 'helias';
        if (this.isDude) {
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
        }
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

        // Spawn des monstres
        this.groupe_monstres = this.physics.add.group();
        const calqueMonstres = carte.getObjectLayer("monstres");
        if (calqueMonstres) {
            calqueMonstres.objects.forEach((monstreObj) => {
                const monstre = this.groupe_monstres.create(monstreObj.x, monstreObj.y, 'monstre', 0);
                monstre.setBounce(1, 1);
                monstre.setCollideWorldBounds(true);
                monstre.setDisplaySize(60, 60);
                monstre.setDepth(50);
                monstre.pointsVie = Phaser.Math.Between(1, 3);
                monstre.setVelocity(
                    Phaser.Math.Between(-80, 80),
                    Phaser.Math.Between(-80, 80)
                );
                monstre.anims.play('monstre_marche');

                monstre.moveEvent = this.time.addEvent({
                    delay: Phaser.Math.Between(2000, 4000),
                    callback: function () {
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
            this.physics.add.collider(this.groupe_monstres, wallLayer);
            this.physics.add.collider(this.groupe_monstres, objetsLayer);
        }

        // Spawn des armes
        this.groupe_armes = this.physics.add.group();
        const calqueArmes = carte.getObjectLayer("Arme");
        if (calqueArmes) {
            calqueArmes.objects.forEach((armeObj) => {
                const arme = this.groupe_armes.create(armeObj.x, armeObj.y, 'image_gun');
                arme.setDisplaySize(48, 48);
                arme.setDepth(45);
                arme.body.setImmovable(true);
                arme.body.moves = false;
            });
        }

        this.game.events.emit('getArme', (aArme) => {
            if (aArme) {
                this.groupe_armes.children.entries.forEach(arme => arme.destroy());
            }
        });

        this.groupeBullets = this.physics.add.group();

        if (wallLayer) {
            this.physics.add.collider(this.groupeBullets, wallLayer, (balle) => balle.destroy());
        }
        if (objetsLayer) {
            this.physics.add.collider(this.groupeBullets, objetsLayer, (balle) => balle.destroy());
        }

        this.physics.add.overlap(this.groupeBullets, this.groupe_monstres, (balle, monstre) => {
            balle.destroy();
            monstre.pointsVie--;
            if (monstre.pointsVie <= 0) {
                if (monstre.moveEvent) monstre.moveEvent.remove();
                monstre.destroy();
                this.game.events.emit('addMoney', 10);
                this.son_ronnie.play();
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
                this.scene.stop('HUD');
                
                // Jouer le son et attendre sa fin
                if (this.son_rage_quit) {
                    this.son_rage_quit.play();
                    this.son_rage_quit.once('complete', () => {
                        this.scene.start('menu');
                    });
                } else {
                    // Fallback si le son n'existe pas
                    this.scene.start('menu');
                }
            }
        });

        this.physics.world.on("worldbounds", (body) => {
            const objet = body.gameObject;
            if (this.groupeBullets.contains(objet)) objet.destroy();
        });

        // ✅ KeyCodes explicite pour éviter tout conflit
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.boutonFeu = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.input.keyboard.on('keydown-E', () => {
            if (this.armeNearby && !this.armeNearby.collectee && !player.armeEquipee) {
                this.armeNearby.collectee = true;
                const armeSprite = this.add.sprite(player.x + 20, player.y, 'image_gun');
                armeSprite.setDisplaySize(40, 40);
                armeSprite.setDepth(99);
                armeSprite.anims.play('gun_droite');
                player.armeEquipee = armeSprite;
                this.armeNearby.destroy();
                this.armeNearby = null;
                this.son_tkprime.play();
                this.game.events.emit('armeRamassee');
            }
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.doorNearby && this.doorNearby.estSolide) {
                const doorName = this.doorNearby.doorName;
                this.doorNearby.estSolide = false;
                this.doorCollider.active = false;
                this.doorNearby.anims.play('door_open');
                this.time.delayedCall(500, () => {
                    let destination = 'laboratory';
                    let porteDestination = 'door3';
                    let offsetX = 0;
                    let offsetY = 0;
                    if (doorName === 'door_retour1') {
                        destination = 'laboratory';
                        porteDestination = 'door3';
                        offsetY = -50;
                    } else if (doorName === 'door_retour2') {
                        destination = 'laboratory';
                        porteDestination = 'door31';
                        offsetX = 50;
                    }
                    this.cameras.main.fade(500, 0, 0, 0);
                    this.time.delayedCall(500, () => {
                        this.scene.start(destination, { porteDestination, offsetX, offsetY });
                    });
                });
            }
        });

        this.invincible = true;
        player.setAlpha(0.5);
        this.time.delayedCall(1000, () => {
            this.invincible = false;
            player.setAlpha(1);
        });
    }

    tirer() {
        if (!player || !player.armeEquipee) return;
        let vx = 0, vy = 0, offsetX = 0, offsetY = 0;
        const vitesse = 600;
        switch (player.directionArme) {
            case 'droite': vx = vitesse; offsetX = 30; break;
            case 'gauche': vx = -vitesse; offsetX = -30; break;
            case 'haut': vy = -vitesse; offsetY = -30; break;
            case 'bas': vy = vitesse; offsetY = 30; break;
        }
        const balle = this.groupeBullets.create(player.x + offsetX, player.y + offsetY, 'ball');
        balle.setDisplaySize(12, 12);
        balle.setDepth(90);
        balle.setCollideWorldBounds(true);
        balle.body.allowGravity = false;
        balle.body.onWorldBounds = true;
        balle.setVelocity(vx, vy);
    }

    update() {
        // ✅ guard unifié cursors + boutonFeu
        if (!this.keyD || !this.boutonFeu) {
            this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
            this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
            this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
            this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.boutonFeu = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            return;
        }

        let vitesse = 160;
        this.game.events.emit('getBoostVitesse', (boost) => {
            if (boost) vitesse = boost;
        });

        if (this.keyD.isDown) {
            player.setVelocityX(vitesse);
            player.setFlipX(false);
            if (this.isDude) player.anims.play('anim_tourne_droite', true);
            player.directionArme = 'droite';
        } else if (this.keyQ.isDown) {
            player.setVelocityX(-vitesse);
            player.setFlipX(false);
            if (this.isDude) player.anims.play('anim_tourne_gauche', true);
            player.directionArme = 'gauche';
        } else {
            player.setVelocityX(0);
            if (this.isDude) player.anims.play('anim_face');
        }

        if (this.keyZ.isDown) {
            player.setVelocityY(-vitesse);
            player.directionArme = 'haut';
        } else if (this.keyS.isDown) {
            player.setVelocityY(vitesse);
            player.directionArme = 'bas';
        } else {
            player.setVelocityY(0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.boutonFeu)) this.tirer();

        this.armeNearby = null;
        if (this.groupe_armes) {
            this.groupe_armes.children.entries.forEach((arme) => {
                if (arme.collectee) return;
                const distance = Phaser.Math.Distance.Between(player.x, player.y, arme.x, arme.y);
                if (distance < 60) this.armeNearby = arme;
            });
        }

        this.doorNearby = null;
        if (this.groupe_portes) {
            this.groupe_portes.children.entries.forEach((door) => {
                const distance = Phaser.Math.Distance.Between(player.x, player.y, door.x, door.y);
                if (distance < 50 && door.estSolide) this.doorNearby = door;
            });
        }

        if (this.groupe_monstres) {
            this.groupe_monstres.children.entries.forEach((monstre) => {
                const vx = monstre.body.velocity.x;
                const vy = monstre.body.velocity.y;

                if (Math.abs(vx) > Math.abs(vy)) {
                    monstre.anims.play('monstre_cote', true);
                    monstre.setFlipX(vx < 0);
                } else if (vy < 0) {
                    monstre.anims.play('monstre_dos', true);
                    monstre.setFlipX(false);
                } else {
                    monstre.anims.play('monstre_marche', true);
                    monstre.setFlipX(false);
                }
            });
        }

        if (player.armeEquipee) {
            switch (player.directionArme) {
                case 'droite': player.armeEquipee.anims.play('gun_droite', true); player.armeEquipee.setPosition(player.x + 30, player.y); break;
                case 'gauche': player.armeEquipee.anims.play('gun_gauche', true); player.armeEquipee.setPosition(player.x - 20, player.y); break;
                case 'haut': player.armeEquipee.anims.play('gun_haut', true); player.armeEquipee.setPosition(player.x, player.y - 30); break;
                case 'bas': player.armeEquipee.anims.play('gun_bas', true); player.armeEquipee.setPosition(player.x, player.y + 30); break;
            }
        }
    }
}