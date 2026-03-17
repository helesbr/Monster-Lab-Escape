export default class regles extends Phaser.Scene {
    constructor() {
        super({ key: "regles" });
    }

    //on charge les images
    preload() {
        this.load.image("menu_fond", "src/assets/images/menu_fond.png");
        this.load.image("imageBoutonPlay", "src/assets/images/bouton_play.png");
    }

    create() {
        // Fond de sécurité (couleur)
        this.cameras.main.setBackgroundColor(0x2c3e50);

        // on place les éléments de fond
        this.add
            .image(240, 240, "menu_fond")
            .setDisplaySize(480, 480)  // Redimensionner au 480x480 du canvas
            .setOrigin(0.5)  // Centrer l'image
            .setDepth(0);

        // Bouton de démarrage
        const boutonJouer = this.add.rectangle(240, 240, 200, 60, 0x00aa00);
        boutonJouer.setInteractive();
        boutonJouer.on('pointerover', () => {
            boutonJouer.setFillStyle(0x00ff00);
        });
        boutonJouer.on('pointerout', () => {
            boutonJouer.setFillStyle(0x00aa00);
        });

        // Texte du bouton
        this.add.text(240, 240, 'JOUER', {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Événement au clic du bouton
        boutonJouer.on('pointerdown', () => {
            this.scene.start('selection');
        });
        const boutonRegle = this.add.rectangle(240, 320, 200, 60, 0x00aa00);
        boutonRegle.setInteractive();
        boutonRegle.on('pointerover', () => {
            boutonRegle.setFillStyle(0x00ff00);
        });
        boutonRegle.on('pointerout', () => {
            boutonRegle.setFillStyle(0x00aa00);
        });

        // Texte du bouton
        this.add.text(240, 320, 'RÈGLES', {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Événement au clic du bouton
        boutonRegle.on('pointerdown', () => {
            this.scene.start('regles');
        });
    }

    update() {
    }
}
