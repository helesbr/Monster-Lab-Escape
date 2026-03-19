export default class regles extends Phaser.Scene {
    constructor() {
        super({ key: "regles" });
    }
preload() {
    this.load.image("zqsd", "src/assets/images/zqsd.webp");
    this.load.image("bouton_entree", "src/assets/images/bouton_entree.png");
    this.load.image("espace", "src/assets/images/espace.png");
}

create() {
    // Fond noir
    this.cameras.main.setBackgroundColor(0x000000);

    // Ajouter les 3 images l'une en dessous de l'autre à gauche (petites)
    const img1 = this.add.image(80, 80, 'zqsd');
    img1.setOrigin(0.5, 0.5);
    img1.setDisplaySize(80, 80);

    const img2 = this.add.image(80, 200, 'bouton_entree');
    img2.setOrigin(0.5, 0.5);
    img2.setDisplaySize(80, 80);

    const img3 = this.add.image(80, 320, 'espace');
    img3.setOrigin(0.5, 0.5);
    img3.setDisplaySize(80, 80);

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
     // Événement au clic du bouton
    boutonRetour.on('pointerdown', () => {
        this.scene.start('menu');
    });
}

    update() {
    }
}
