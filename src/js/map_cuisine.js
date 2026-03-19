var player;

export default class map_cuisine extends Phaser.Scene {
    constructor() {
        super({ key: "map_cuisine" });
    }

    preload() {
        this.load.tilemapTiledJSON("cuisine", "src/assets/map_cuisine.tmj");
        this.load.image('allTiles', 'src/tilesets/all_tilesets.png');
        this.load.image('ball', 'src/assets/images/ball.png');
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
        this.load.spritesheet("image_gun", "src/assets/images/gun.png", {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.image('preworkout', 'src/assets/images/prewarkout.png');
        this.load.image('creatine', 'src/assets/images/creatine.png');
        this.load.image('creatine_shop', 'src/assets/images/creatine.png');
        this.load.image('preworkout_shop', 'src/assets/images/prewarkout.png');
        this.load.image('prewarkout', 'src/assets/images/prewarkout.png');
        this.load.audio('cuisine', 'src/assets/son/cuisine.mp3');
        this.load.audio('ronnie', 'src/assets/son/yeah_buddy.m4a');
        this.load.audio('tkprime2', 'src/assets/son/tkprime2.mp3');
    }

    create() {
        this.son_cuisine = this.sound.add('cuisine');
        this.son_cuisine.play();
        this.son_ronnie = this.sound.add('ronnie');
        this.son_tkprime2 = this.sound.add('tkprime2');
        this.events.on('shutdown', () => {
            if (this.son_cuisine) this.son_cuisine.stop();
            if (this.son_ronnie) this.son_ronnie.stop();
            if (this.son_tkprime2) this.son_tkprime2.stop();
        });

        this.game.events.emit('getMoney', (money) => {
            console.log('Money actuelle:', money);
        });

        const carteCuisine = this.add.tilemap("cuisine");
        const tileset = carteCuisine.addTilesetImage("all_tileset", "allTiles");
        const solLayer = carteCuisine.createLayer("sol", tileset, 0, 0);
        const wallLayer = carteCuisine.createLayer("Wall", tileset, 0, 0);
        const objetsLayer = carteCuisine.createLayer("objets", tileset, 0, 0);

        wallLayer.setCollisionByProperty({ estSolide: true });
        objetsLayer.setCollisionByProperty({ estSolide: true });

        this.physics.world.setBounds(0, 0, carteCuisine.widthInPixels, carteCuisine.heightInPixels);
        this.physics.world.OVERLAP_BIAS = 16;
        this.cameras.main.setBounds(0, 0, carteCuisine.widthInPixels, carteCuisine.heightInPixels);

        let zoomX = this.scale.width / carteCuisine.widthInPixels;
        let zoomY = this.scale.height / carteCuisine.heightInPixels;
        this.cameras.main.setZoom(Math.min(zoomX, zoomY));
        this.cameras.main.centerOn(carteCuisine.widthInPixels / 2, carteCuisine.heightInPixels / 2);

        if (!this.anims.exists("anim_tourne_gauche")) {
            this.anims.create({
                key: "anim_tourne_gauche",
                frames: this.anims.generateFrameNumbers("img_perso", { start: 4, end: 5 }),
                frameRate: 10, repeat: -1
            });
        }
        if (!this.anims.exists("anim_tourne_droite")) {
            this.anims.create({
                key: "anim_tourne_droite",
                frames: this.anims.generateFrameNumbers("img_perso", { start: 6, end: 8 }),
                frameRate: 10, repeat: -1
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
                frames: this.anims.generateFrameNumbers("monstre", { start: 0, end: 2 }),
                frameRate: 6, repeat: -1
            });
        }
        if (!this.anims.exists("monstre_dos")) {
            this.anims.create({
                key: "monstre_dos",
                frames: this.anims.generateFrameNumbers("monstre", { start: 3, end: 5 }),
                frameRate: 6, repeat: -1
            });
        }
        if (!this.anims.exists("monstre_cote")) {
            this.anims.create({
                key: "monstre_cote",
                frames: this.anims.generateFrameNumbers("monstre", { start: 6, end: 8 }),
                frameRate: 6, repeat: -1
            });
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
        const calqueMonstres = carteCuisine.getObjectLayer("Calque monstres");
        this.groupe_monstres = this.physics.add.group();
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
                        if (hasVertical) {
                            porte.setAngle(90);
                            porte.body.setSize(32, 64);
                            porte.body.setOffset(16, -16);
                        }
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
        player.armeEquipee = null;
        player.directionArme = 'droite';
        player.pointsVie = 3;
        player.vitesseBase = 160;
        this.invincible = false;

        this.game.events.emit('getVie', (vie) => { player.pointsVie = vie; });
        this.game.events.emit('getArme', (aArme) => {
            if (aArme) {
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
            }
        });

        this.physics.world.on("worldbounds", (body) => {
            const objet = body.gameObject;
            if (this.groupeBullets.contains(objet)) objet.destroy();
        });

        // ✅ KeyCodes explicite pour éviter tout conflit
        this.cursors = this.input.keyboard.createCursorKeys();
        this.boutonFeu = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

        const calqueShops = carteCuisine.getObjectLayer("shops");
        this.shopNearby = null;
        this.shop = null;
        this.menuShopVisible = false;
        this.menuShop = null;

        if (calqueShops && calqueShops.objects.length > 0) {
            const shopObj = calqueShops.objects[0];
            this.shop = { x: shopObj.x, y: shopObj.y, name: shopObj.name || "shop" };
        }

        this.objetsDisponibles = { prewarkout: [], creatine: [] };

        const calqueProduit = carteCuisine.getObjectLayer("Calque Produit");
        if (calqueProduit) {
            calqueProduit.objects.forEach((produitObj) => {
                if (produitObj.name === 'creatine') {
                    this.objetsDisponibles.creatine.push({ x: produitObj.x, y: produitObj.y });
                } else if (produitObj.name === 'prewarkout' || produitObj.name === 'preworkout') {
                    this.objetsDisponibles.prewarkout.push({ x: produitObj.x, y: produitObj.y });
                }
            });
        }

        const calqueCreatine = carteCuisine.getObjectLayer("calque crea");
        if (calqueCreatine) {
            calqueCreatine.objects.forEach((creatineObj) => {
                this.objetsDisponibles.creatine.push({ x: creatineObj.x, y: creatineObj.y });
            });
        }

        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.menuShopVisible) {
                this.fermerMenuShop();
                return;
            }

            if (this.doorNearby && this.doorNearby.estSolide) {
                const doorName = this.doorNearby.doorName;
                this.doorNearby.estSolide = false;
                this.doorCollider.active = false;
                this.doorNearby.anims.play('door_open');
                this.time.delayedCall(500, () => {
                    let destination = "selection";
                    let porteDestination = "door1";
                    let offsetY = 0;
                    let offsetX = 0;
                    if (doorName === "door_retour2") {
                        destination = "selection";
                        porteDestination = "door1";
                        offsetY = 50;
                    } else if (doorName === 'door_retour1') {
                        destination = 'selection';
                        porteDestination = 'door12';
                        offsetX = 50;
                    }
                    this.cameras.main.fade(500, 0, 0, 0);
                    this.time.delayedCall(500, () => {
                        this.scene.start(destination, { porteDestination, offsetY, offsetX });
                    });
                });
            } else if (this.shopNearby) {
                this.ouvrirMenuShop();
            }
        });

        this.game.config.maVariable -= 10;
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
        if (!this.cursors || !this.boutonFeu) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.boutonFeu = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            return;
        }

        const cursors = this.cursors;

        let vitesse = 160;
        this.game.events.emit('getBoostVitesse', (boost) => {
            if (boost) vitesse = boost;
        });

        if (cursors.right.isDown) {
            player.setVelocityX(vitesse);
            player.setFlipX(false);
            player.anims.play('anim_tourne_droite', true);
            player.directionArme = 'droite';
        } else if (cursors.left.isDown) {
            player.setVelocityX(-vitesse);
            player.setFlipX(false);
            player.anims.play('anim_tourne_gauche', true);
            player.directionArme = 'gauche';
        } else {
            player.setVelocityX(0);
            player.anims.play('anim_face');
        }

        if (cursors.up.isDown) {
            player.setVelocityY(-vitesse);
            player.directionArme = 'haut';
        } else if (cursors.down.isDown) {
            player.setVelocityY(vitesse);
            player.directionArme = 'bas';
        } else {
            player.setVelocityY(0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.boutonFeu)) this.tirer();

        this.doorNearby = null;
        if (this.groupe_portes) {
            this.groupe_portes.children.entries.forEach((door) => {
                const distance = Phaser.Math.Distance.Between(player.x, player.y, door.x, door.y);
                if (distance < 100 && door.estSolide) this.doorNearby = door;
            });
        }

        this.shopNearby = null;
        if (this.shop) {
            const distanceShop = Phaser.Math.Distance.Between(player.x, player.y, this.shop.x, this.shop.y);
            if (distanceShop < 100) this.shopNearby = this.shop;
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

    ouvrirMenuShop() {
        this.menuShopVisible = true;
        this.physics.pause();
        this.son_tkprime2.setVolume(1.3);
        this.son_tkprime2.play();
        this.son_cuisine.setVolume(0.5);

        const fondMenu = this.add.rectangle(240, 240, 1050, 825, 0x000000, 0.7);
        fondMenu.setDepth(200);
        fondMenu.setScrollFactor(0);

        const titre = this.add.text(240, 70, 'SHOP', {
            fontSize: '64px', fill: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

        const imgCreatine = this.add.image(90, 280, 'creatine_shop');
        imgCreatine.setDisplaySize(340, 340).setDepth(201).setScrollFactor(0).setInteractive();
        imgCreatine.on('pointerdown', () => this.spawnObjet('creatine'));
        imgCreatine.on('pointerover', () => imgCreatine.setDisplaySize(370, 370));
        imgCreatine.on('pointerout', () => imgCreatine.setDisplaySize(340, 340));

        const prixCreatine = this.add.text(90, 460, '30 💰', {
            fontSize: '24px', fill: '#FFD700', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

        const descCreatine = this.add.text(90, 490, '+3 vies', {
            fontSize: '18px', fill: '#fff', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

        const imgPreworkout = this.add.image(390, 280, 'preworkout_shop');
        imgPreworkout.setDisplaySize(340, 340).setDepth(201).setScrollFactor(0).setInteractive();
        imgPreworkout.on('pointerdown', () => this.spawnObjet('prewarkout'));
        imgPreworkout.on('pointerover', () => imgPreworkout.setDisplaySize(370, 370));
        imgPreworkout.on('pointerout', () => imgPreworkout.setDisplaySize(340, 340));

        const prixPreworkout = this.add.text(390, 460, '30 💰', {
            fontSize: '24px', fill: '#FFD700', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

        const descPreworkout = this.add.text(390, 490, 'Vitesse x2.5 (1min30)', {
            fontSize: '18px', fill: '#fff', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

        this.game.events.emit('getMoney', (money) => {
            this.texteMoneyShop = this.add.text(240, 530, 'Ton argent : ' + money + ' 💰', {
                fontSize: '22px', fill: '#FFD700', stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5).setDepth(201).setScrollFactor(0);
        });

        this.texteErreur = this.add.text(240, 565, '', {
            fontSize: '18px', fill: '#ff4444', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

        const message = this.add.text(240, 600, 'ENTRÉE pour fermer', {
            fontSize: '20px', fill: '#fff', align: 'center'
        }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

        this.menuShop = {
            fond: fondMenu, titre, imgCreatine, imgPreworkout,
            prixCreatine, prixPreworkout, descCreatine, descPreworkout, message
        };
    }

    spawnObjet(type) {
        this.game.events.emit('getMoney', (money) => {
            if (money < 30) {
                if (this.texteErreur) {
                    this.texteErreur.setText("Pas assez d'argent ! (30 💰 requis)");
                    this.time.delayedCall(2000, () => { if (this.texteErreur) this.texteErreur.setText(''); });
                }
                return;
            }

            this.game.events.emit('addMoney', -30);
            if (this.texteMoneyShop) {
                this.texteMoneyShop.setText('Ton argent : ' + (money - 30) + ' 💰');
            }

            if (this.objetsDisponibles[type] && this.objetsDisponibles[type].length > 0) {
                const position = this.objetsDisponibles[type].shift();
                const objet = this.physics.add.sprite(position.x, position.y, type);
                objet.setDisplaySize(30, 30).setDepth(45);
                objet.body.setImmovable(true);
                objet.body.moves = false;

                this.physics.add.overlap(player, objet, () => {
                    if (type === 'prewarkout') {
                        this.game.events.emit('setBoostVitesse', 160 * 2.5, 90000);
                    } else if (type === 'creatine') {
                        this.game.events.emit('getVie', (vieActuelle) => {
                            this.game.events.emit('getVieMax', (vieMax) => {
                                const nouveauMax = Math.min(vieMax + 3, 9);
                                const nouvelleVie = Math.min(vieActuelle + 3, nouveauMax);
                                player.pointsVie = nouvelleVie;
                                this.game.events.emit('setVieMax', nouveauMax, nouvelleVie);
                            });
                        });
                    }
                    objet.destroy();
                });
            } else {
                if (this.texteErreur) {
                    this.texteErreur.setText('Stock épuisé !');
                    this.time.delayedCall(2000, () => { if (this.texteErreur) this.texteErreur.setText(''); });
                }
            }
        });
    }

    fermerMenuShop() {
        if (this.son_tkprime2) this.son_tkprime2.stop();
        if (this.son_cuisine) this.son_cuisine.setVolume(1.0);
        this.physics.resume();
        if (this.menuShop) {
            this.menuShop.fond.destroy();
            this.menuShop.titre.destroy();
            this.menuShop.imgCreatine.destroy();
            this.menuShop.imgPreworkout.destroy();
            this.menuShop.prixCreatine.destroy();
            this.menuShop.prixPreworkout.destroy();
            this.menuShop.descCreatine.destroy();
            this.menuShop.descPreworkout.destroy();
            this.menuShop.message.destroy();
            this.menuShop = null;
        }
        if (this.texteMoneyShop) { this.texteMoneyShop.destroy(); this.texteMoneyShop = null; }
        if (this.texteErreur) { this.texteErreur.destroy(); this.texteErreur = null; }
        this.menuShopVisible = false;
    }
}