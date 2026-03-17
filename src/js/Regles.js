export default class regles extends Phaser.Scene {
    constructor() {
        super({ key: "regles" });
    }

    //on charge les images
    preload() {
        this.load.image("regles_fond", "src/assets/images/regles_fond.png");
    }

    create() {
        // Fond de sécurité (couleur)
        this.cameras.main.setBackgroundColor(0x2c3e50);

        // on place les éléments de fond
        this.add
            .image(240, 240, "regles_fond")
            .setDisplaySize(480, 480)  // Redimensionner au 480x480 du canvas
            .setOrigin(0.5)  // Centrer l'image
            .setDepth(0);

        // Bouton de démarrage
        const boutonRetour = this.add.rectangle(240, 240, 200, 60, 0x00aa00);
        boutonRetour.setInteractive();
        boutonRetour.on('pointerover', () => {
            boutonRetour.setFillStyle(0x00ff00);
        });
        boutonRetour.on('pointerout', () => {
            boutonRetour.setFillStyle(0x00aa00);
        });
        // Texte du bouton
        this.add.text(240, 240, 'RETOUR', {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
    }

    update() {
    }
}
