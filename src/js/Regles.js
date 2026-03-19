export default class regles extends Phaser.Scene {
    constructor() {
        super({ key: "regles" });
    }
    create() {
        // Fond noir
        this.cameras.main.setBackgroundColor(0x000000);

        // Ajouter l'image regle centré
        const imgRegle = this.add.image(this.scale.width / 2, this.scale.height / 2, 'regle');
        imgRegle.setOrigin(0.5, 0.5);
        imgRegle.setDisplaySize(this.scale.width * 0.9, this.scale.height * 0.8);

        // Bouton de démarrage - EN BAS DE L'ÉCRAN
        const boutonRetour = this.add.rectangle(this.scale.width / 2, this.scale.height - 50, 200, 60, 0x00aa00);
        boutonRetour.setInteractive();
        boutonRetour.setDepth(1);  // Place le bouton au-dessus du fond
        boutonRetour.on('pointerover', () => {
            boutonRetour.setFillStyle(0x00ff00);
        });
        boutonRetour.on('pointerout', () => {
            boutonRetour.setFillStyle(0x00aa00);
        });
        // Texte du bouton
        this.add.text(this.scale.width / 2, this.scale.height - 50, 'RETOUR', {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2);

        // Texte des contrôles - positionnés sous chaque touche
        // ESPACE pour tirer - sous la barre espace (haut droite)
        this.add.text(335, 180, 'ESPACE pour tirer', {
            fontSize: '16px',
            fill: '#fff'
        }).setOrigin(0.5).setDepth(2);

        // ENTRÉE pour intéragir - sous la touche Entrée (bas gauche)
        this.add.text(130, 370, 'ENTRÉE pour intéragir', {
            fontSize: '16px',
            fill: '#fff'
        }).setOrigin(0.5).setDepth(2);

        // E pour ramasser - sous la touche E (bas droite)
        this.add.text(335, 370, 'E pour ramasser', {
            fontSize: '16px',
            fill: '#fff'
        }).setOrigin(0.5).setDepth(2);

        // Touche deplacement
        this.add.text(135, 195, 'Déplacement', {
            fontSize: '16px',
            fill: '#fff'
        }).setOrigin(0.5).setDepth(2);


        // Événement au clic du bouton
        boutonRetour.on('pointerdown', () => {
            this.scene.start('menu');
        });
    }

    update() {
    }
}
