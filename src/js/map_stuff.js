var player;

export default class map_stuff extends Phaser.Scene {
    constructor() {
        super({ key: "map_stuff" });
    }
    preload() { 
        this.load.tilemapTiledJSON("stuff", "src/assets/map_stuff.tmj");
        this.load.image('allTiles', 'src/tilesets/all_tilesets.png');
        this.load.image('arme', 'src/assets/images/arme.png');
        this.load.spritesheet("img_perso", "src/assets/images/dude.png", {
            frameWidth: 44,
            frameHeight: 48
        });
        this.load.spritesheet('monstre', 'src/assets/images/mini_monstres.png', {
            frameWidth: 44,
            frameHeight: 48
        });
        this.load.spritesheet('doors', 'src/assets/images/doors_spritesheet.png', {
            frameWidth: 64,
            frameHeight: 80
        });
    }

    create() {
        const carte = this.make.tilemap({ key: "stuff" });
            const tileset = carte.addTilesetImage("all_tileset", "allTiles");

            const solLayer    = carte.createLayer("Floor",  tileset, 0, 0);
            const wallLayer   = carte.createLayer("Mur",    tileset, 0, 0);
            const objetsLayer = carte.createLayer("Object", tileset, 0, 0);

            wallLayer.setCollisionByExclusion([-1]);
            objetsLayer.setCollisionByExclusion([-1]);

            // Caméra et zoom
            this.physics.world.setBounds(0, 0, carte.widthInPixels, carte.heightInPixels);
            this.cameras.main.setBounds(0, 0, carte.widthInPixels, carte.heightInPixels);
            let zoomX = this.scale.width / carte.widthInPixels;
            let zoomY = this.scale.height / carte.heightInPixels;
            this.cameras.main.setZoom(Math.min(zoomX, zoomY));
            this.cameras.main.centerOn(carte.widthInPixels / 2, carte.heightInPixels / 2);

            // Animation monstres
            this.anims.create({
                key: "monstre_marche",
                frames: this.anims.generateFrameNumbers("monstre", { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });

            // Créer les animations des portes
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

                    // Vérifier la propriété verticale pour la rotation
                    if (point.properties) {
                        const hasVertical = point.properties.some(prop => prop.name === "verticale" && prop.value === true);
                        
                        if (hasVertical) {
                            porte.setAngle(90);
                        }
                    }
                });
            }

            // ✅ Créer le joueur
            player = this.physics.add.sprite(100, 100, 'img_perso');
            player.setCollideWorldBounds(true);
            player.setDepth(100);
            player.body.setGravityY(-this.physics.world.gravity.y);

            // Collisions du joueur avec les murs
            if (wallLayer) this.physics.add.collider(player, wallLayer);
            if (objetsLayer) this.physics.add.collider(player, objetsLayer);

            // ✅ Collision avec les portes fermées
            this.doorCollider = this.physics.add.collider(player, groupe_portes);
            
            // Stocker référence pour utilisation dans update
            this.groupe_portes = groupe_portes;

            // Suivre le joueur avec la caméra
            this.cameras.main.startFollow(player);

            // Créer les animations du joueur
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

            // Spawn des monstres
            this.groupe_monstres = this.physics.add.group();
            const calqueMonstres = carte.getObjectLayer("monstres");

            if (calqueMonstres) {
                calqueMonstres.objects.forEach((monstreObj) => {
                    const monstre = this.groupe_monstres.create(monstreObj.x, monstreObj.y, 'monstre', 0);
                    monstre.setBounce(1, 1);
                    monstre.setCollideWorldBounds(true);
                    monstre.setDisplaySize(40, 40);
                    monstre.setDepth(50);
                    monstre.setVelocity(
                        Phaser.Math.Between(-80, 80),
                        Phaser.Math.Between(-80, 80)
                    );
                    monstre.anims.play('monstre_marche');

                    this.time.addEvent({
                        delay: Phaser.Math.Between(2000, 4000),
                        callback: function() {
                            monstre.setVelocity(
                                Phaser.Math.Between(-80, 80),
                                Phaser.Math.Between(-80, 80)
                            );
                        },
                        loop: true
                    });
                });

                this.physics.add.collider(this.groupe_monstres, wallLayer);
                this.physics.add.collider(this.groupe_monstres, objetsLayer);
            }

            // Spawn des armes
            const calqueArmes = carte.getObjectLayer("Arme");
            if (calqueArmes) {
                calqueArmes.objects.forEach((armeObj) => {
                    const arme = this.add.image(armeObj.x, armeObj.y, 'arme');
                    arme.setDisplaySize(30, 30);
                    arme.setDepth(45);
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
                        // Déterminer la destination selon le nom de la porte
                        let destination = 'selection'; // défaut
                        if (doorName === 'door_retour2') {
                            destination = 'map_monstre';
                        } else if (doorName === 'door_retour1') {
                            destination = 'selection';
                        }
                        this.scene.start(destination);
                    });
                }
            });
    }

    update() {
        const cursors = this.cursors;
        
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

        // Gestion des monstres
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
