export default class map_stuff extends Phaser.Scene {

    constructor() {
        super({ key: "map_stuff" });
    }

    preload() {
        this.load.tilemapTiledJSON("stuff", "src/assets/map_stuff.tmj");
        this.load.image('tilesFloor32', 'src/tilesets/tilesFloor32.png');
        this.load.image('spriteSheet_tiledLiquids_32x32', 'src/tilesets/floor-tiles.png');
        this.load.image('tilesWalls', 'src/tilesets/tilesWalls.png');
        this.load.image('tilesStuff', 'src/tilesets/tilesStuff.png');
        this.load.image('porte', 'src/assets/images/wall128x128.png');
        // Charger les monstres en tant que spritesheet
        this.load.spritesheet('monstre', 'src/assets/images/mini_monstres.png', {
            frameWidth: 44,
            frameHeight: 48
        });
        // Charger l'image de l'arme
        this.load.image('arme', 'src/assets/images/arme.png');
    }

    create() {
        try {
            // Charger la carte
            const carteStuff = this.make.tilemap({ key: "stuff" });
            
        
            // Créer les couches (il n'y a pas de couche "Fond" dans map_stuff)
            const floorLayer = carteStuff.createLayer("Floor", [tileset1, tileset2], 0, 0);
            const objetLayer = carteStuff.createLayer("Object", tileset4, 0, 0);
            const murLayer = carteStuff.createLayer("Mur", [tileset3, tileset4], 0, 0);

            // ✅ ACTIVER LES COLLISIONS DES COUCHES
            if (murLayer) murLayer.setCollisionByExclusion([-1]);
            if (objetLayer) objetLayer.setCollisionByExclusion([-1]);

            // Ajuster le monde et la caméra pour afficher la totalité de la map
            this.physics.world.setBounds(0, 0, carteStuff.widthInPixels, carteStuff.heightInPixels);
            this.cameras.main.setBounds(0, 0, carteStuff.widthInPixels, carteStuff.heightInPixels);
            
            // Calculer le zoom pour faire rentrer la map entière
            let zoomX = this.scale.width / carteStuff.widthInPixels;
            let zoomY = this.scale.height / carteStuff.heightInPixels;
            let meilleurZoom = Math.min(zoomX, zoomY);
            
            // Appliquer le zoom et centrer la caméra
            this.cameras.main.setZoom(meilleurZoom);
            this.cameras.main.centerOn(carteStuff.widthInPixels / 2, carteStuff.heightInPixels / 2);

            // ✅ Créer les animations des monstres
            this.anims.create({
                key: "monstre_marche",
                frames: this.anims.generateFrameNumbers("monstre", { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });

            // ✅ Spawn des monstres
            const calqueMonstres = carteStuff.getObjectLayer("monstres");
            this.groupe_monstres = this.physics.add.group();
            
            if (calqueMonstres) {
                calqueMonstres.objects.forEach((monstreObj) => {
                    const monstre = this.groupe_monstres.create(monstreObj.x, monstreObj.y, 'monstre', 0);
                    monstre.setBounce(1, 1);
                    monstre.setCollideWorldBounds(true);
                    monstre.setDisplaySize(40, 40);
                    monstre.setDepth(50);
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
                if (murLayer) this.physics.add.collider(this.groupe_monstres, murLayer);
                if (objetLayer) this.physics.add.collider(this.groupe_monstres, objetLayer);
                
                console.log("Monstres spawned!");
            }

            // ✅ Spawn des armes (statiques)
            const calqueArmes = carteStuff.getObjectLayer("Arme");
            if (calqueArmes) {
                calqueArmes.objects.forEach((armeObj) => {
                    const arme = this.add.image(armeObj.x, armeObj.y, 'arme');
                    arme.setDisplaySize(30, 30);
                    arme.setDepth(45);
                });
                console.log("Armes spawned!");
            }

            console.log("Map stuff chargée!");
        } catch (error) {
            console.error("Erreur lors du chargement de la map stuff:", error);
        }
    }

    update() {
        // Vérifier la direction de chaque monstre et ajuster le flip
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



 

 