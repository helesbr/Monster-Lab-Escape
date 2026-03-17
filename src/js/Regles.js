export default class regles extends Phaser.Scene {
    constructor() {
        super({ key: "regles" });
    }

    create() {
        // Fond noir
        this.cameras.main.setBackgroundColor(0x000000);

        // Bouton de démarrage
        const boutonRetour = this.add.rectangle(240, 240, 200, 60, 0x00aa00);
        boutonRetour.setInteractive();
        boutonRetour.setDepth(1);  // Place le bouton au-dessus du fond
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
        }).setOrigin(0.5).setDepth(2);
         // Événement au clic du bouton
        boutonRetour.on('pointerdown', () => {
            this.scene.start('menu');
        });
    }

    update() {
    }
}
