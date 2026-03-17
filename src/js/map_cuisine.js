export default class map_cuisine extends Phaser.Scene{
    constructor() {
        super({key : "map_cuisine"});
    }
    preload() {
        this.load.tilemapTiledJSON("cuisine", "src/assets/map_cuisine.tmj");
        this.load.image('allTiles', 'src/tilesets/all_tilesets.png');
        this.load.image('porte', 'src/assets/images/wall128x128.png');
        // Charger les monstres en tant que spritesheet
        this.load.spritesheet('monstre', 'src/assets/images/mini_monstres.png', {
            frameWidth: 44,
            frameHeight: 48
        });
    }

    create() {
        try {
            // Charger la carte
            const carteCuisine = this.make.tilemap({ key: "cuisine" });
            const tileset = carteCuisine.addTilesetImage("all_tileset", "allTiles");

            // Créer les couches
            const solLayer = carteCuisine.createLayer("sol", tileset, 0, 0);
            const wallLayer = carteCuisine.createLayer("Wall", tileset, 0, 0);
            const objetsLayer = carteCuisine.createLayer("objets", tileset, 0, 0);

            // ✅ ACTIVER LES COLLISIONS DES COUCHES
            wallLayer.setCollisionByExclusion([-1]);
            objetsLayer.setCollisionByExclusion([-1]);

            // Ajuster le monde et la caméra pour afficher la totalité de la map
            this.physics.world.setBounds(0, 0, carteCuisine.widthInPixels, carteCuisine.heightInPixels);
            this.cameras.main.setBounds(0, 0, carteCuisine.widthInPixels, carteCuisine.heightInPixels);
            
            // Calculer le zoom pour faire rentrer la map entière
            let zoomX = this.scale.width / carteCuisine.widthInPixels;
            let zoomY = this.scale.height / carteCuisine.heightInPixels;
            let meilleurZoom = Math.min(zoomX, zoomY);
            
            // Appliquer le zoom et centrer la caméra
            this.cameras.main.setZoom(meilleurZoom);
            this.cameras.main.centerOn(carteCuisine.widthInPixels / 2, carteCuisine.heightInPixels / 2);

            // ✅ Créer les animations des monstres
            this.anims.create({
                key: "monstre_marche",
                frames: this.anims.generateFrameNumbers("monstre", { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });

            // ✅ Spawn des monstres
            const calqueMonstres = carteCuisine.getObjectLayer("Calque monstres");
            this.groupe_monstres = this.physics.add.group(); // Garder en référence pour update()
            
            if (calqueMonstres) {
                calqueMonstres.objects.forEach((monstreObj) => {
                    const monstre = this.groupe_monstres.create(monstreObj.x, monstreObj.y, 'monstre', 0);
                    monstre.setBounce(1, 1);
                    monstre.setCollideWorldBounds(true);
                    monstre.setDisplaySize(40, 40); // Redimensionner pour affichage correct
                    monstre.setDepth(50); // Au-dessus de la map
                    let velocityX = Phaser.Math.Between(-80, 80);
                    let velocityY = Phaser.Math.Between(-80, 80);
                    monstre.setVelocity(velocityX, velocityY);
                    monstre.anims.play('monstre_marche');
                    
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
                
                // ✅ Ajouter les collisions avec les murs et objets
                this.physics.add.collider(this.groupe_monstres, wallLayer);
                this.physics.add.collider(this.groupe_monstres, objetsLayer);
                
                console.log("Monstres spawned!");
            }

            console.log("Map cuisine chargée!");
        } catch (error) {
            console.error("Erreur lors du chargement de la map cuisine:", error);
        }
    }
    
    update() {
        // Vérifier la direction de chaque monstre et ajuster le flip
        if (this.groupe_monstres) {
            this.groupe_monstres.children.entries.forEach((monstre) => {
                const vx = monstre.body.velocity.x;
                
                // Si le monstre se déplace à droite
                if (vx > 0) {
                    monstre.setFlipX(false);
                } 
                // Si le monstre se déplace à gauche
                else if (vx < 0) {
                    monstre.setFlipX(true);
                }
            });
        }
    }
}
