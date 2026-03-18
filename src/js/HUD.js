export default class HUD extends Phaser.Scene {
    constructor() {
        super({ key: 'HUD' });
    }

    create() {
        this.pointsVie = 3;
        this.aArme = false;
        this.monstresMorts = [];
        const heartSize = 32;
        this.heartSize = heartSize;

        this.heartVide = this.add.image(20, 20, 'heart')
            .setOrigin(0, 0)
            .setDisplaySize(heartSize, heartSize)
            .setScrollFactor(0)
            .setDepth(200)
            .setAlpha(0.3);

        this.heartPlein = this.add.image(20, 20, 'heart')
            .setOrigin(0, 0)
            .setDisplaySize(heartSize, heartSize)
            .setScrollFactor(0)
            .setDepth(201);

        this.updateHeart();

        // vies
        this.game.events.on('playerHit', () => {
            this.pointsVie--;
            this.updateHeart();
        });
        this.game.events.on('resetVie', () => {
            this.pointsVie = 3;
            this.updateHeart();
        });
        this.game.events.on('getVie', (callback) => {
            callback(this.pointsVie);
        });

        // arme
        this.game.events.on('armeRamassee', () => {
            this.aArme = true;
        });
        this.game.events.on('getArme', (callback) => {
            callback(this.aArme);
        });
        this.game.events.on('resetArme', () => {
            this.aArme = false;
        });

        // ✅ monstres par index
        this.game.events.on('monstreMort', (index) => {
            this.monstresMorts.push(index);
        });
        this.game.events.on('getMonstresMorts', (callback) => {
            callback(this.monstresMorts);
        });
        this.game.events.on('resetMonstres', () => {
            this.monstresMorts = [];
        });
    }

    updateHeart() {
        const ratio = this.pointsVie / 3;
        this.heartPlein.setDisplaySize(this.heartSize * ratio, this.heartSize);
    }
}