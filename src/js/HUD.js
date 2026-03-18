export default class HUD extends Phaser.Scene {
    constructor() {
        super({ key: 'HUD' });
    }

    create() {
        this.pointsVie = 3;
        const heartSize = 48;
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

        // ✅ reçoit un coup
        this.game.events.on('playerHit', () => {
            this.pointsVie--;
            this.updateHeart();
        });

        // ✅ reset complet (retour menu)
        this.game.events.on('resetVie', () => {
            this.pointsVie = 3;
            this.updateHeart();
        });

        // ✅ une autre scène demande la vie actuelle
        this.game.events.on('getVie', (callback) => {
            callback(this.pointsVie);
        });
    }

    updateHeart() {
        const ratio = this.pointsVie / 3;
        this.heartPlein.setDisplaySize(this.heartSize * ratio, this.heartSize);
    }
}