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
        this.load.image('bouton_directeur', 'src/assets/images/bouton.jpg');

        // Chargement du son monstre
        this.load.audio('monstres', 'src/assets/son/monstre.mp3');
    }



    create() {
        // Lancer le son de monstre
        this.son_monstre = this.sound.add('monstres');
        this.son_monstre.play();

        // Arrêter la musique quand on quitte la scène
        this.events.on('shutdown', () => {
            if (this.son_monstre) {
                this.son_monstre.stop();
            }
        });

        const carteMonstreLab = this.add.tilemap("monstres");
        const tileset = carteMonstreLab.addTilesetImage("all_tilset", "allTiles");

        // Create layers
        const sangLayer = carteMonstreLab.createLayer("blood1", tileset, 0, 0);
        const murLayer = carteMonstreLab.createLayer("Mur", tileset, 0, 0);
        const bloodLayer = carteMonstreLab.createLayer("blood", tileset, 0, 0);

        murLayer.setCollisionByProperty({ estSolide: true });


        // Ajuster le monde et la caméra pour afficher la totalité de la map
        this.physics.world.setBounds(0, 0, carteMonstreLab.widthInPixels, carteMonstreLab.heightInPixels);
        this.cameras.main.setBounds(0, 0, carteMonstreLab.widthInPixels, carteMonstreLab.heightInPixels);

        // Auto-zoom to fit map
        let zoomX = this.scale.width / carteMonstreLab.widthInPixels;
        let zoomY = this.scale.height / carteMonstreLab.heightInPixels;
        let meilleurZoom = Math.min(zoomX, zoomY);
        this.cameras.main.setZoom(meilleurZoom);
        this.cameras.main.centerOn(carteMonstreLab.widthInPixels / 2, carteMonstreLab.heightInPixels / 2);

        // Spawn monsters from object layer
        this.groupe_monstres = this.physics.add.group();
        const calqueMonstres = carteMonstreLab.getObjectLayer("monstres");
        if (calqueMonstres) {
            calqueMonstres.objects.forEach((monstreObj) => {
                // Position aléatoire sur la map
                const randomX = Phaser.Math.Between(50, carteMonstreLab.widthInPixels - 50);
                const randomY = Phaser.Math.Between(50, carteMonstreLab.heightInPixels - 50);

                const monstre = this.groupe_monstres.create(randomX, randomY, 'monstres');
                monstre.setBounce(1, 1);
                monstre.setCollideWorldBounds(true);
                monstre.setDisplaySize(100, 100);
                monstre.setDepth(50);
                let velocityX = Phaser.Math.Between(-80, 80);
                let velocityY = Phaser.Math.Between(-80, 80);
                monstre.setVelocity(velocityX, velocityY);

                // IA: Changer de direction aléatoirement
                this.time.addEvent({
                    delay: Phaser.Math.Between(2000, 4000),
                    callback: function () {
                        monstre.setVelocity(
                            Phaser.Math.Between(-80, 80),
                            Phaser.Math.Between(-80, 80)
                        );
                    },
                    loop: true
                });
            });
        }

        // Add monsters-wall collisions
        this.physics.add.collider(this.groupe_monstres, murLayer);

        // ✅ Créer les animations des portes
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

        // ✅ Spawn des portes
        var groupe_portes = this.physics.add.group();

        // Charger les deux couches de portes
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

        // ✅ Créer le bouton_directeur à partir du ping
        this.calqueBoutons = carteMonstreLab.getObjectLayer("bouton");
        if (this.calqueBoutons) {
            const pingBoutonDirecteur = this.calqueBoutons.objects.find(obj => obj.name === "bouton_directeur");
            if (pingBoutonDirecteur) {
                const boutonDirecteur = this.physics.add.sprite(pingBoutonDirecteur.x, pingBoutonDirecteur.y, 'bouton_directeur');
                boutonDirecteur.disableInteractive();
                boutonDirecteur.setDepth(50);
                boutonDirecteur.setVisible(false); // Cacher le bouton
                
                // Interaction au clic
                boutonDirecteur.on('pointerdown', () => {
                    this.scene.start('map_directeur');
                });
            }
        }


        // ✅ Créer le joueur - positionné selon la porte d'arrivée
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

        // Collisions du joueur avec les murs
        if (murLayer) this.physics.add.collider(player, murLayer);

        // ✅ Collision avec les portes fermées
        this.doorCollider = this.physics.add.collider(player, groupe_portes);

        // Stocker référence pour utilisation dans update
        this.groupe_portes = groupe_portes;



        // Créer les animations du joueur s'ils n'existent pas
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

        // ✅ Initialiser le clavier une seule fois
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
                    let offsetX = 0;

                    if (doorName === "selection") {
                        destination = "selection";
                        porteDestination = "door4";
                        let offsetY = -50;
                    }
                    this.scene.start(destination, { porteDestination: porteDestination, offsetX: offsetX    });
                });
            }

        });

    }
    update() {
        const cursors = this.cursors;

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

        // Gauche / Droite
        if (cursors.right.isDown) {
            player.setVelocityX(160);
            player.setFlipX(false);
            player.anims.play('anim_tourne_droite', true);
        }
        else if (cursors.left.isDown) {
            player.setVelocityX(-160);
            player.setFlipX(false);
            player.anims.play('anim_tourne_gauche', true);
        } else {
            player.setVelocityX(0);
            player.anims.play('anim_face');
        }

        // Haut / Bas
        if (cursors.up.isDown) {
            player.setVelocityY(-160);
        }
        else if (cursors.down.isDown) {
            player.setVelocityY(160);
        }
        else {
            player.setVelocityY(0);
        }

        // Handle monster direction based on velocity
        if (this.groupe_monstres) {
            this.groupe_monstres.children.entries.forEach((monstre) => {
                const vx = monstre.body.velocity.x;
                if (vx > 0) {
                    monstre.setFlipX(false);
                } else if (vx < 0) {
                    monstre.setFlipX(true);
                }
            });
        }
    }

}