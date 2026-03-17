export default class menu extends Phaser.Scene {
    constructor() {
        super({ key: "menu" });
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

        // on ajoute un bouton de clic, nommé bouton_play
        var bouton_play = this.add.image(240, 360, "imageBoutonPlay")
            .setDisplaySize(120, 60)  // Redimensionner le bouton
            .setDepth(1);

        // on rend le bouton interactif
        bouton_play.setInteractive();

        // Cas ou la souris passe sur le bouton play
        bouton_play.on("pointerover", () => {
            bouton_play.setScale(1.1); // Agrandir légèrement
            bouton_play.setTint(0xcccccc); // Changer la couleur
        });

        // Cas ou la souris ne passe plus sur le bouton play
        bouton_play.on("pointerout", () => {
            bouton_play.setScale(1); // Taille normale
            bouton_play.clearTint(); // Couleur normale
        });

        // Cas ou la souris clique sur le bouton play
        // on lance le niveau 1 (la scène "selection")
        bouton_play.on("pointerup", () => {
            this.scene.start("selection");
        });
    }

    update() {
    }
}
