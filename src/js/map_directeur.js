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
        player.vitesseBase = 160;
        player.vitesseBoost = null;
        player.armeEquipee = null;
        player.directionArme = 'droite';
        this.invincible = false;
        
        // ✅ Récupérer la vie persistée
        this.game.events.emit('getVie', (vie) => {
            player.pointsVie = vie;
        });

        // ✅ Récupérer l'arme persistée
        this.game.events.emit('getArme', (aArme) => {
            if (aArme) {
                const armeSprite = this.add.sprite(player.x + 20, player.y, 'image_gun');
                armeSprite.setDisplaySize(40, 40);
                armeSprite.setDepth(99);
                player.armeEquipee = armeSprite;
            }
        });

        // ✅ Récupérer le boost vitesse APRÈS avoir défini vitesseBase
        this.game.events.emit('getBoostVitesse', (actif, tempsRestant) => {
            if (actif && tempsRestant > 0) {
                player.vitesseBoost = player.vitesseBase * 2.5;
                console.log('Boost vitesse récupéré, temps restant:', tempsRestant);
                this.time.delayedCall(tempsRestant, () => {
                    player.vitesseBoost = null;
                    this.game.events.emit('resetBoostVitesse');
                });
            }
        });

        // ✅ Récupérer la vie max persistée (creatine)
        this.game.events.emit('getVieMax', (vieMax) => {
            if (vieMax > 3) {
                // Réappliquer l'affichage des coeurs supplémentaires via getVie
                this.game.events.emit('getVie', (vie) => {
                    // setVieMax met à jour le HUD
                    this.game.events.emit('setVieMax', vieMax, vie);
                    player.pointsVie = vie;
                });
            }
        });
        
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
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        
        // ✅ Variables d'interaction
        this.doorNearby = null;
        this.arthusNearby = null;
        this.arthusDialogueShowing = false;

        // ✅ Minuteur de 2 minutes
        this.tempsRestant = 120;
        this.texteTimer = this.add.text(this.scale.width / 2, this.scale.height / 2, '2:00', {
            fontSize: '40px',
            fontStyle: 'bold',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0).setDepth(200).setScrollFactor(0);

        this.timerCompteur = this.time.addEvent({
            delay: 1000,
            callback: function () {
                this.tempsRestant--;
                const minutes = Math.floor(this.tempsRestant / 60);
                const secondes = this.tempsRestant % 60;
                this.texteTimer.setText(minutes + ':' + (secondes < 10 ? '0' : '') + secondes);

                if (this.tempsRestant <= 10) {
                    this.texteTimer.setFill('#ff0000');
                    this.tweens.add({
                        targets: this.texteTimer,
                        scale: 1.3,
                        duration: 200,
                        yoyo: true
                    });
                }

                if (this.tempsRestant <= 0) {
                    this.timerCompteur.remove();
                    this.game.events.emit('resetVie');
                    this.game.events.emit('resetArme');
                    this.game.events.emit('resetMonstres');
                    this.game.events.emit('resetBoost');
                    this.game.events.emit('resetMoney');
                    this.scene.stop('HUD');
                    this.scene.start('selection');
                }
            },
            callbackScope: this,
            repeat: 119
        });
    }
    update() {

        // ✅ vitesse avec boost preworkout
        const vitesse = player.vitesseBoost || player.vitesseBase || 160;

        // ✅ Détection de proximité avec les portes
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

        // ✅ Détection de proximité avec Arthus
        this.arthusNearby = null;
        if (this.arthus) {
            const distance = Phaser.Math.Distance.Between(
                player.x, player.y,
                this.arthus.x, this.arthus.y
            );
            if (distance < 100) {
                this.arthusNearby = this.arthus;
            }
        }

        // ✅ Gestion des interactions au ENTER
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            if (this.arthusNearby && !this.arthusDialogueShowing) {
                // Afficher le dialogue d'Arthus
                this.arthusDialogueShowing = true;
                const dialogue = this.add.text(240, 150, 
                    "salam j'ai mal",
                    {
                        fontSize: '20px',
                        fill: '#ffffff',
                        align: 'center',
                        wordWrap: { width: 400 },
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                ).setOrigin(0.5).setDepth(200).setScrollFactor(0);

                // Fermer le dialogue après 4 secondes
                this.time.delayedCall(4000, () => {
                    dialogue.destroy();
                    this.arthusDialogueShowing = false;
                });
            }
        }

        if (this.keyD.isDown) {
            player.setVelocityX(vitesse);
            player.setFlipX(false);
            player.anims.play('anim_tourne_droite', true);
        } else if (this.keyQ.isDown) {
            player.setVelocityX(-vitesse);
            player.setFlipX(false);
            player.anims.play('anim_tourne_gauche', true);
        } else {
            player.setVelocityX(0);
            player.anims.play('anim_face');
        }

        if (this.keyZ.isDown) {
            player.setVelocityY(-vitesse);
        } else if (this.keyS.isDown) {
            player.setVelocityY(vitesse);
        } else {
            player.setVelocityY(0);
        }

    }
}