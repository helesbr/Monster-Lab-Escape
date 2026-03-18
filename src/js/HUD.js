export default class HUD extends Phaser.Scene {
    constructor() {
        super({ key: 'HUD' });
    }

    create() {
        this.pointsVie = 3;
        this.aArme = false;
        this.money = 0; // ✅ ajout money
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

        // ✅ texte money
        this.texteMoney = this.add.text(20, 60, 'Money: 0', {
            fontSize: '16px',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(200);

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

        // ✅ événements money
        this.game.events.on('addMoney', (montant) => {
            this.money += montant;
            this.texteMoney.setText('Money: ' + this.money);
        });

        this.game.events.on('getMoney', (callback) => {
            callback(this.money);
        });

        this.game.events.on('resetMoney', () => {
            this.money = 0;
            this.texteMoney.setText('Money: 0');
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