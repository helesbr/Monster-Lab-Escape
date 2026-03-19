export default class character_select extends Phaser.Scene {
    constructor() {
        super({ key: "character_select" });
    }

    preload() {
        this.load.image("menu_fond", "src/assets/images/menu_fond.png");
        this.load.image("title", "src/assets/images/title.png");
        // Charger les images des personnages
        this.load.spritesheet("dude_sprite", "src/assets/images/dude.png", {
            frameWidth: 44,
            frameHeight: 48
        });
        this.load.image("helias_sprite", "src/assets/images/helias.png");
    }

    create() {
        // Fond de sécurité
        this.cameras.main.setBackgroundColor(0x2c3e50);

        // Fond
        this.add
            .image(240, 240, "menu_fond")
            .setDisplaySize(480, 480)
            .setOrigin(0.5)
            .setDepth(0);

        // Titre
        this.add
            .image(240, 80, "title")
            .setDisplaySize(350, 220)
            .setOrigin(0.5)
            .setDepth(1);

        // Titre du menu
        this.add.text(240, 150, 'SÉLECTIONNER UN PERSONNAGE', {
            fontSize: '24px',
            fill: '#fff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(2);

        // Personnage 1: Dude
        const dudeContainer = this.add.container(120, 280);
        const dudeFrame = this.add.rectangle(0, 0, 140, 200, 0x4CAF50, 0.6);
        dudeFrame.setInteractive();

        const dudeSprite = this.add.sprite(0, -40, "dude_sprite", 1);
        dudeSprite.setDisplaySize(80, 96);

        const dudeName = this.add.text(0, 60, 'DUDE', {
            fontSize: '18px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        dudeContainer.add([dudeFrame, dudeSprite, dudeName]);
        dudeContainer.setDepth(2);

        dudeFrame.on('pointerover', () => {
            dudeFrame.setFillStyle(0x66BB6A, 0.8);
            dudeFrame.setStrokeStyle(3, 0xffffff);
        });

        dudeFrame.on('pointerout', () => {
            dudeFrame.setFillStyle(0x4CAF50, 0.6);
            dudeFrame.setStrokeStyle(0);
        });

        dudeFrame.on('pointerdown', () => {
            this.game.config.personnageSelectionne = 'dude';
            this.scene.start('laboratory');
        });

        // Personnage 2: Helias
        const heliasContainer = this.add.container(360, 280);
        const heliasFrame = this.add.rectangle(0, 0, 140, 200, 0x2196F3, 0.6);
        heliasFrame.setInteractive();

        const heliasSprite = this.add.image(0, -25, "helias_sprite");
        heliasSprite.setDisplaySize(120, 150);

        const heliasName = this.add.text(0, 60, 'HELIAS', {
            fontSize: '18px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        heliasContainer.add([heliasFrame, heliasSprite, heliasName]);
        heliasContainer.setDepth(2);

        heliasFrame.on('pointerover', () => {
            heliasFrame.setFillStyle(0x42A5F5, 0.8);
            heliasFrame.setStrokeStyle(3, 0xffffff);
        });

        heliasFrame.on('pointerout', () => {
            heliasFrame.setFillStyle(0x2196F3, 0.6);
            heliasFrame.setStrokeStyle(0);
        });

        heliasFrame.on('pointerdown', () => {
            this.game.config.personnageSelectionne = 'helias';
            this.scene.start('laboratory');
        });
    }

    update() {
    }
}
