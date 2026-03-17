export default class map_stuff extends Phaser.Scene {
    constructor() {
        super({ key: "map_stuff" });
    }

    preload() { 
        this.load.tilemapTiledJSON("stuff", "src/assets/map_stuff.tmj");
        this.load.image('allTiles', 'src/tilesets/all_tilesets.png');
        this.load.image('porte', 'src/assets/images/wall128x128.png');
        this.load.spritesheet('monstre', 'src/assets/images/mini_monstres.png', {
            frameWidth: 44,
            frameHeight: 48
        });
        this.load.spritesheet("img_perso", "src/assets/images/dude.png", {
            frameWidth: 32,
            frameHeight: 48
        });
    }

    create() {
        try {
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

                console.log("Monstres spawned!");
            } else {
                console.warn("Calque 'monstres' introuvable dans map_stuff");
            }

            console.log("Map stuff chargée!");
        } catch (error) {
            console.error("Erreur lors du chargement de map_stuff:", error);
        }
    }

    update() {
        if (this.groupe_monstres) {
            this.groupe_monstres.children.entries.forEach((monstre) => {
                if (monstre.body.velocity.x > 0) {
                    monstre.setFlipX(false);
                } else if (monstre.body.velocity.x < 0) {
                    monstre.setFlipX(true);
                }
            });
        }
    }
}

