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
        this.vitesseBoost = null;
        this.timerBoost = null;

        this.coeurs = [];
        for (let i = 0; i < 9; i++) {
            const ligne = Math.floor(i / 3);
            const colonne = i % 3;
            const coeur = this.add.image(this.scale.width - 150 + (colonne * 36), 20 + (ligne * 36), 'heart', 0)
                .setOrigin(0, 0)
                .setDisplaySize(32, 32)
                .setScrollFactor(0)
                .setDepth(200);
            coeur.setVisible(false);
            this.coeurs.push(coeur);
        }
        for (let i = 0; i < 3; i++) this.coeurs[i].setVisible(true);

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
            this.updateCoeurs();
        });
        this.game.events.on('getVie', (callback) => {
            callback(this.pointsVie);
        });
        this.game.events.on('getVieMax', (callback) => {
            callback(this.vieMax);
        });

        // creatine
        this.game.events.on('setVieMax', (max, actuelle) => {
            this.vieMax = Math.min(max, 9);
            this.pointsVie = Math.min(actuelle, this.vieMax);
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

        // === BOOST VITESSE (preworkout) ===
        this.boostVitesse = false;
        this.boostVitesseExpire = 0; // timestamp d'expiration

        this.game.events.on('setBoostVitesse', (duree) => {
            this.boostVitesse = true;
            this.boostVitesseExpire = Date.now() + duree;
        });
        this.game.events.on('getBoostVitesse', (callback) => {
            // Si le boost a expiré, on le reset
            if (this.boostVitesse && Date.now() > this.boostVitesseExpire) {
                this.boostVitesse = false;
            }
            const tempsRestant = this.boostVitesse ? this.boostVitesseExpire - Date.now() : 0;
            callback(this.boostVitesse, tempsRestant);
        });
        this.game.events.on('resetBoostVitesse', () => {
            this.boostVitesse = false;
            this.boostVitesseExpire = 0;
        });

        // === VIE MAX (creatine) ===
        // déjà géré via setVieMax, mais on expose aussi getVieMax
        this.game.events.on('getVieMax', (callback) => {
            callback(this.vieMax);
        });

        // money
        this.game.events.on('addMoney', (montant) => {
            this.money = Math.max(0, this.money + montant);
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

        // boost vitesse
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
        for (let i = 0; i < this.coeurs.length; i++) {
            if (i < this.vieMax) {
                this.coeurs[i].setVisible(true);
                this.coeurs[i].setFrame(0);
                this.coeurs[i].setAlpha(i < this.pointsVie ? 1 : 0.3);
            } else {
                this.coeurs[i].setVisible(false);
            }
        }
    }
}