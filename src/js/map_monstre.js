export default class map_monstre extends Phaser.Scene {
    constructor() {
        super({ key: "map_monstre" });
    }
    preload() {
        this.load.tilemapTiledJSON("monstre", "src/assets/map_monstre.tmj");
        this.load.image("allTiles", "src/tilesets/all_tilesets.png");
        this.load.spritesheet('monstre', 'src/assets/images/monstre.png', {
            frameWidth: 44,
            frameHeight: 48
        });
    }

    create() {
        try {
            const carteMonstreLab = this.make.tilemap({ key: "monstre" });
            const tileset = carteMonstreLab.addTilesetImage("all_tilset", "allTiles");

            // Create layers
            const sangLayer = carteMonstreLab.createLayer("blood1", tileset, 0, 0);
            const murLayer = carteMonstreLab.createLayer("Mur", tileset, 0, 0);
            const bloodLayer = carteMonstreLab.createLayer("blood", tileset, 0, 0);

            // Set collision for walls
            murLayer.setCollisionByExclusion([-1]);

            // Ajuster le monde et la caméra pour afficher la totalité de la map
            this.physics.world.setBounds(0, 0, carteMonstreLab.widthInPixels, carteMonstreLab.heightInPixels);
            this.cameras.main.setBounds(0, 0, carteMonstreLab.widthInPixels, carteMonstreLab.heightInPixels);

            // Auto-zoom to fit map
            let zoomX = this.scale.width / carteMonstreLab.widthInPixels;
            let zoomY = this.scale.height / carteMonstreLab.heightInPixels;
            let meilleurZoom = Math.min(zoomX, zoomY);
            this.cameras.main.setZoom(meilleurZoom);
            this.cameras.main.centerOn(carteMonstreLab.widthInPixels / 2, carteMonstreLab.heightInPixels / 2);

            // Create animation for monsters (removed - using static image)

            // Spawn monsters from object layer
            this.groupe_monstres = this.physics.add.group();
            const calqueMonstres = carteMonstreLab.getObjectLayer("monstres");
            
            if (calqueMonstres) {
                calqueMonstres.objects.forEach((monstreObj) => {
                    // Position aléatoire sur la map
                    const randomX = Phaser.Math.Between(50, carteMonstreLab.widthInPixels - 50);
                    const randomY = Phaser.Math.Between(50, carteMonstreLab.heightInPixels - 50);
                    
                    const monstre = this.groupe_monstres.create(randomX, randomY, 'monstre');
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
                        callback: function() {
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

        } catch (error) {
            console.error("Erreur création map monstre:", error);
        }
    }
    update() {
        // Handle monster direction based on velocity
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
    