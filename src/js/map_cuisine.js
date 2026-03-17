export default class map_cuisine extends Phaser.Scene{
    constructor() {
        super({key : "map_cuisine"});
    }
    preload() {
        // Charger les assets nécessaires
        this.load.image('allTiles', 'src/tilesets/all_tilesets.png');
        this.load.tilemapTiledJSON("cuisine", "src/assets/map_cuisine.tmj");
    }

    create() {
        // Récupération de la carte et du tileset
        const carteDuNiveau = this.make.tilemap({ key: "cuisine" });
        const tileset = carteDuNiveau.addTilesetImage("all_tilset", "allTiles");

        // Création des calques
        const fondLayer = carteDuNiveau.createLayer("Fond", tileset, 0, 0);
        const floorLayer = carteDuNiveau.createLayer("Floor", tileset, 0, 0);
        const murLayer = carteDuNiveau.createLayer("Mur", tileset, 0, 0);
        const objectLayer = carteDuNiveau.createLayer("Object", tileset, 0, 0);

        // Redimensionnement du monde
        this.physics.world.setBounds(0, 0, carteDuNiveau.widthInPixels, carteDuNiveau.heightInPixels);
        this.cameras.main.setBounds(0, 0, carteDuNiveau.widthInPixels, carteDuNiveau.heightInPixels);
    }
    update() {}
}