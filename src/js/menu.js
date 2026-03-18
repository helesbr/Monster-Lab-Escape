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

        const boutonJouer = this.add.rectangle(240, 150, 200, 60, 0x00aa00);
        boutonJouer.setInteractive();
        boutonJouer.on('pointerover', () => {
            boutonJouer.setFillStyle(0x00ff00);
        });
        boutonJouer.on('pointerout', () => {
            boutonJouer.setFillStyle(0x00aa00);
        });

        this.add.text(240, 150, 'JOUER', {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        boutonJouer.on('pointerdown', () => {
            if (this.scene.isActive('HUD')) {
                this.scene.stop('HUD');
            }
            this.game.events.emit('resetVie');
            this.game.events.emit('resetArme');
            this.game.events.emit('resetMonstres');
            this.scene.start('selection');
            this.scene.launch('HUD');
        });

        const boutonRegle = this.add.rectangle(240, 330, 200, 60, 0x00aa00);
        boutonRegle.setInteractive();
        boutonRegle.on('pointerover', () => {
            boutonRegle.setFillStyle(0x00ff00);
        });
        boutonRegle.on('pointerout', () => {
            boutonRegle.setFillStyle(0x00aa00);
        });

        this.add.text(240, 330, 'RÈGLES', {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        boutonRegle.on('pointerdown', () => {
            this.scene.start('regles');
        });
    }

    update() {
    }
}