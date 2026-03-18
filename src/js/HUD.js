export default class HUD extends Phaser.Scene {
    constructor() {
        super({ key: 'HUD' });
    }

    create() {
        this.pointsVie = 3;
        this.vieMax = 3;
        this.aArme = false;
        this.money = 0;
        this.monstresMorts = [];
        // ✅ MODIFICATION VITESSE : ajout boost
        this.vitesseBoost = null;
        this.timerBoost = null;

        this.coeurs = [];
        for (let i = 0; i < 6; i++) {
            const ligne = Math.floor(i / 3);
            const colonne = i % 3;
            const coeur = this.add.image(this.scale.width - 150 + (colonne * 36), 20 + (ligne * 36), 'heart', 0)
                .setOrigin(0, 0)
                .setDisplaySize(32, 32)
                .setScrollFactor(0)
                .setDepth(200);
            if (i >= 3) coeur.setVisible(false);
            this.coeurs.push(coeur);
        }

        this.texteMoney = this.add.text(20, 20, 'Money: 0', {
            fontSize: '16px',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(200);

        this.updateCoeurs();

        // vies
        this.game.events.on('playerHit', () => {
            this.pointsVie--;
            this.updateCoeurs();
        });
        this.game.events.on('resetVie', () => {
            this.pointsVie = 3;
            this.vieMax = 3;
            for (let i = 3; i < 6; i++) {
                this.coeurs[i].setVisible(false);
            }
            this.updateCoeurs();
        });
        this.game.events.on('getVie', (callback) => {
            callback(this.pointsVie);
        });

        // creatine
        this.game.events.on('setVieMax', (max, actuelle) => {
            this.vieMax = max;
            this.pointsVie = actuelle;
            for (let i = 0; i < 6; i++) {
                if (i < max) this.coeurs[i].setVisible(true);
                else this.coeurs[i].setVisible(false);
            }
            this.updateCoeurs();
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

        // money
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

        // monstres
        this.game.events.on('monstreMort', (index) => {
            this.monstresMorts.push(index);
        });
        this.game.events.on('getMonstresMorts', (callback) => {
            callback(this.monstresMorts);
        });
        this.game.events.on('resetMonstres', () => {
            this.monstresMorts = [];
        });

        // ✅ MODIFICATION VITESSE : gestion boost
        this.game.events.on('setBoostVitesse', (vitesse, duree) => {
            this.vitesseBoost = vitesse;
            if (this.timerBoost) this.timerBoost.remove();
            this.timerBoost = this.time.delayedCall(duree, () => {
                this.vitesseBoost = null;
            });
        });
        this.game.events.on('getBoostVitesse', (callback) => {
            callback(this.vitesseBoost);
        });
        this.game.events.on('resetBoost', () => {
            this.vitesseBoost = null;
            if (this.timerBoost) this.timerBoost.remove();
        });
    }

    updateCoeurs() {
        for (let i = 0; i < this.vieMax; i++) {
            if (i < this.pointsVie) {
                this.coeurs[i].setFrame(0);
                this.coeurs[i].setAlpha(1);
            } else {
                this.coeurs[i].setFrame(0);
                this.coeurs[i].setAlpha(0.3);
            }
        }
    }
}