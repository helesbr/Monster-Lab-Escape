var player;

export default class map_cuisine extends Phaser.Scene{
    constructor() {
        super({key : "map_cuisine"});
    }
    preload() {
        this.load.tilemapTiledJSON("cuisine", "src/assets/map_cuisine.tmj");
        this.load.image('allTiles', 'src/tilesets/all_tilesets.png');
        this.load.image('porte', 'src/assets/images/wall128x128.png');
        this.load.spritesheet("img_perso", "src/assets/images/dude.png", {
            frameWidth: 44,
            frameHeight: 48
        });
        // Charger les monstres en tant que spritesheet
        this.load.spritesheet('monstre', 'src/assets/images/mini_monstres.png', {
            frameWidth: 44,
            frameHeight: 48
        });
        // Charger les images des produits
        this.load.image('preworkout', 'src/assets/images/prewarkout.png');
        this.load.image('creatine', 'src/assets/images/creatine.png');
        this.load.spritesheet('porte', 'src/assets/images/doors_spritesheet.png', {
      frameWidth: 64,
      frameHeight: 32
    });
    }

    create() {
        try {
            // Charger la carte
            const carteCuisine = this.make.tilemap({ key: "cuisine" });

            // Activer les collisions si les couches existent
            if (wallLayer) wallLayer.setCollisionByExclusion([-1]);
            if (objetsLayer) objetsLayer.setCollisionByExclusion([-1]);

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

            // ✅ Créer le joueur
            player = this.physics.add.sprite(100, 100, 'img_perso');
            player.setCollideWorldBounds(true);
            player.setDepth(100); // Au-dessus de la map
            player.body.setGravityY(-this.physics.world.gravity.y);
            
            // Collisions du joueur avec les murs et objets si les couches existent
            if (wallLayer) this.physics.add.collider(player, wallLayer);
            if (objetsLayer) this.physics.add.collider(player, objetsLayer);
            
            // Suivre le joueur avec la caméra
            this.cameras.main.startFollow(player);
            

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
                if (wallLayer) this.physics.add.collider(this.groupe_monstres, wallLayer);
                if (objetsLayer) this.physics.add.collider(this.groupe_monstres, objetsLayer);
                
                console.log("Monstres spawned!");
            }

    /** CRÉATION DES ANIMATIONS DES PORTES
    /***********************************************************************/
    // Créer les animations des portes seulement si elles n'existent pas
    if (!this.anims.exists('door_closed')) {
      this.anims.create({
        key: 'door_closed',
        frames: [{ key: 'porte', frame: 0 }],
        frameRate: 10
      });
    }

    if (!this.anims.exists('door_open')) {
      this.anims.create({
        key: 'door_open',
        frames: [{ key: 'porte', frame: 1 }],
        frameRate: 10
      });
    }

    /***********************************************************************/
    /** CRÉATION DES PORTES
    /***********************************************************************/
    const groupe_portes = this.physics.add.group();
    // Récupération du calque d'objets des portes
    const doorsObjectsLayer = carteCuisine.getObjectLayer("door_retour");

    // Création des portes sur chaque objet door
    if (doorsObjectsLayer) {
      doorsObjectsLayer.objects.forEach((obj) => {
        if (obj.name.startsWith("door")) {
          const porte = this.physics.add.sprite(obj.x, obj.y, 'porte');
          porte.setCollideWorldBounds(true);
          porte.setDepth(50); // Au-dessus des murs mais accessible au joueur
          porte.setDisplaySize(64, 32);  // Taille correcte pour la collision
          porte.body.setImmovable(true);  // La porte ne se déplace pas
          porte.body.moves = false;  // Désactiver complètement les mouvements du body
          porte.isOpen = false;
          porte.estSolide = true;// État initial : fermée
          porte.play('door_closed'); // Affiche le frame fermé
          groupe_portes.add(porte);
          
          if (obj.properties) {
            const destProp = obj.properties.find(p => p.name === "destination");
            if (destProp) {
              porte.destination = destProp.value; // ex: "map_cuisine"
            }
          }
          
          // Vérifier si la porte a la propriété "horizontal" et si elle est vraie
          if (obj.properties) {
            const horizontalProp = obj.properties.find(prop =>
              prop.name === "horizontal" || prop.name === "orientation"
            );
            // Si la propriété n'existe PAS ou est fausse, on tourne de 90°
            if (!horizontalProp || (horizontalProp.value !== true && horizontalProp.value !== "true")) {
              porte.setAngle(90);
            }
          } else {
            // Si pas de propriétés, tourner de 90° par défaut
            porte.setAngle(90);
          }
        }
      });
    }
    
    // Collider solide entre le joueur et les portes
    this.physics.add.collider(player, groupe_portes);
    

            // ✅ Spawn des produits (creatine et pre-workout)
            const calqueProduit = carteCuisine.getObjectLayer("Calque Produit");
            if (calqueProduit) {
                calqueProduit.objects.forEach((produitObj) => {
                    // Déterminer l'image selon le nom du produit
                    const imageKey = produitObj.name === 'creatine' ? 'creatine' : 'preworkout';
                    const produit = this.add.image(produitObj.x, produitObj.y, imageKey);
                    produit.setDisplaySize(30, 30); // Taille du produit
                    produit.setDepth(45); // Au-dessus de la map mais sous les monstres
                    // Les produits restent statiques (pas de physique)
                });
                console.log("Produits spawned!");
            }

            // ✅ Spawn des creatines (calque séparé)
            const calqueCreatine = carteCuisine.getObjectLayer("calque crea");
            if (calqueCreatine) {
                calqueCreatine.objects.forEach((creatineObj) => {
                    const creatine = this.add.image(creatineObj.x, creatineObj.y, 'creatine');
                    creatine.setDisplaySize(30, 30); // Taille de la creatine
                    creatine.setDepth(45); // Au-dessus de la map mais sous les monstres
                });
                console.log("Creatines spawned!");
            }

            console.log("Map cuisine chargée!");
        } catch (error) {
            console.error("Erreur lors du chargement de la map cuisine:", error);
        }
    }
    
    update() {
        // Contrôles du joueur
        if (!this.cursors) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }
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
