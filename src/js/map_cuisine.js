var player;

export default class map_cuisine extends Phaser.Scene{

    constructor() {

        super({key : "map_cuisine"});

    }

    preload() {

        this.load.tilemapTiledJSON("cuisine", "src/assets/map_cuisine.tmj");

        this.load.image('allTiles', 'src/tilesets/all_tilesets.png');

        this.load.spritesheet('doors', 'src/assets/images/doors_spritesheet.png', {
            frameWidth: 64,
            frameHeight: 80
        });

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

    }

 

    create() {
        // Charger la carte
        const carteCuisine = this.add.tilemap("cuisine");
        const tileset = carteCuisine.addTilesetImage("all_tileset", "allTiles");
        // Create layers
            const solLayer = carteCuisine.createLayer("sol", tileset, 0, 0);
            const wallLayer = carteCuisine.createLayer("Wall", tileset, 0, 0);
            const objetsLayer = carteCuisine.createLayer("objets", tileset, 0, 0);

        // Activer les collisions si les couches existent
        if (solLayer) solLayer.setCollisionByExclusion([-1]);
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

            }
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

                    // Vérifier la propriété verticale pour la rotation
                    if (point.properties) {
                        const hasVertical = point.properties.some(prop => prop.name === "verticale" && prop.value === true);
                        
                        if (hasVertical) {
                            porte.setAngle(90);
                        }
                    }
                });
            }
        });

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
        if (wallLayer) this.physics.add.collider(player, wallLayer);
        if (objetsLayer) this.physics.add.collider(player, objetsLayer);

        // Suivre le joueur avec la caméra
        this.cameras.main.startFollow(player);

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

        // ✅ Collision avec les portes fermées
        this.doorCollider = this.physics.add.collider(player, groupe_portes);
        
        // Stocker référence pour utilisation dans update
        this.groupe_portes = groupe_portes;

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
                    let porteDestination = "door1";
                    let offsetY = 0;
                    if (doorName === "door_retour2") {
                        destination = "selection";
                        porteDestination = "door1";
                        offsetY = 50;
                    } else if (doorName === 'door_retour1') {
                        destination = 'selection';
                        porteDestination = 'door12';
                    }
                    this.scene.start(destination, { porteDestination: porteDestination, offsetY: offsetY });
                });
            }

        });

 

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
 

 

            // ✅ Spawn des creatines (calque séparé)

            const calqueCreatine = carteCuisine.getObjectLayer("calque crea");

            if (calqueCreatine) {

                calqueCreatine.objects.forEach((creatineObj) => {

                    const creatine = this.add.image(creatineObj.x, creatineObj.y, 'creatine');

                    creatine.setDisplaySize(30, 30); // Taille de la creatine

                    creatine.setDepth(45); // Au-dessus de la map mais sous les monstres

                });
            }
        }

    }
    update() {
        // Contrôles du joueur
        if (!this.cursors) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }

          // Gauche / Droite
const cursors = this.cursors;
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

