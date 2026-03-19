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

        // ✅ tableau de 6 coeurs
        this.coeurs = [];
        for (let i = 0; i < 6; i++) {
            const ligne = Math.floor(i / 3); // 0 ou 1
            const colonne = i % 3; // 0, 1 ou 2
            const coeur = this.add.image(this.scale.width - 150 + (colonne * 36), 20 + (ligne * 36), 'heart', 0)
                .setOrigin(0, 0)
                .setDisplaySize(32, 32)
                .setScrollFactor(0)
                .setDepth(200);

            // ✅ cacher les 3 derniers au départ
            if (i >= 3) coeur.setVisible(false);

            this.coeurs.push(coeur);
        }

        // ✅ texte money
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
            // ✅ recacher les 3 derniers coeurs
            for (let i = 3; i < 6; i++) {
                this.coeurs[i].setVisible(false);
            }
            this.updateCoeurs();
        });
        this.game.events.on('getVie', (callback) => {
            callback(this.pointsVie);
        });

        // ✅ creatine → afficher les 3 coeurs supplémentaires
        this.game.events.on('setVieMax', (max, actuelle) => {
            this.vieMax = max;
            this.pointsVie = actuelle;
            // afficher tous les coeurs jusqu'à vieMax
            for (let i = 0; i < 6; i++) {
                if (i < max) {
                    this.coeurs[i].setVisible(true);
                } else {
                    this.coeurs[i].setVisible(false);
                }
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
    }

    updateCoeurs() {
        for (let i = 0; i < this.vieMax; i++) {
            if (i < this.pointsVie) {
                // ✅ coeur plein → frame 0
                this.coeurs[i].setFrame(0);
                this.coeurs[i].setAlpha(1);
            } else {
                // ✅ coeur vide → grisé
                this.coeurs[i].setFrame(0);
                this.coeurs[i].setAlpha(0.3);
            }
        }
    }
}