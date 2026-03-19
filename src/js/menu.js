export default class menu extends Phaser.Scene {
    constructor() {
        super({ key: "menu" });
    }

    preload() {
        this.load.image("menu_fond", "src/assets/images/menu_fond.png");
        this.load.image("title", "src/assets/images/title.png");
        this.load.image("mogger", "src/assets/images/mogger.png");
        this.load.audio('menu', 'src/assets/son/menu.mp3');
        this.load.image('heart', 'src/assets/images/heart.png');
        this.load.image('boutonjouer', 'src/assets/images/boutonjouer.png');
        this.load.image('boutontouche', 'src/assets/images/boutontouche.png');
        this.load.image('regle', 'src/assets/images/regle.png');
    }

    create() {
        this.son_menu = this.sound.add('menu');
        this.son_menu.play();

        this.events.on('shutdown', () => {
            if (this.son_menu) {
                this.son_menu.stop();
            }
        });

        this.cameras.main.setBackgroundColor(0x2c3e50);

        this.add
            .image(240, 240, "menu_fond")
            .setDisplaySize(480, 480)
            .setOrigin(0.5)
            .setDepth(0);

        this.add
            .image(240, 80, "title")
            .setDisplaySize(350, 220)
            .setOrigin(0.5)
            .setDepth(1);

        this.add
            .image(240, 420, "mogger")
            .setDisplaySize(300, 200)
            .setOrigin(0.5)
            .setDepth(1);

        const boutonJouer = this.add.image(240, 215, 'boutonjouer');
        boutonJouer.setDisplaySize(430, 200);
        boutonJouer.setInteractive();
        boutonJouer.setDepth(1);
        boutonJouer.on('pointerover', () => {
            boutonJouer.setDisplaySize(450, 258);
        });
        boutonJouer.on('pointerout', () => {
            boutonJouer.setDisplaySize(430, 200);
        });

        boutonJouer.on('pointerdown', () => {
            if (this.scene.isActive('HUD')) {
                this.scene.stop('HUD');
            }
            this.game.events.emit('resetVie');
            this.game.events.emit('resetArme');
            this.game.events.emit('resetMonstres');
            // ✅ MODIFICATION VITESSE : reset boost au nouveau jeu
            this.game.events.emit('resetBoost');
            this.scene.start('character_select');
            this.scene.launch('HUD');
        });

        const boutonRegle = this.add.image(240, 310, 'boutontouche');
        boutonRegle.setDisplaySize(450, 200);
        boutonRegle.setInteractive();
        boutonRegle.setDepth(1);
        boutonRegle.on('pointerover', () => {
            boutonRegle.setDisplaySize(470, 210);
        });
        boutonRegle.on('pointerout', () => {
            boutonRegle.setDisplaySize(450, 200);
        });

        boutonRegle.on('pointerdown', () => {
            this.scene.start('regles');
        });
    }

    update() {
    }
}