export default class map_directeur extends Phaser.Scene {
    constructor() {
        super({ key: "map_directeur" });
    }
    preload() { }

    create() {
        // Pour lire la money au démarrage de la scène si besoin :
        this.game.events.emit('getMoney', (money) => {
            console.log('Money actuelle:', money);
        });

        // Pour ajouter de la money (ex: quand un monstre meurt) :
        // this.game.events.emit('addMoney', 10);
    }
    update() { }
}