var player;

export default class mort_boss_final extends Phaser.Scene {
    constructor() {
        super({ key: "mort_boss_final" });
    }

    preload() {
            this.load.image('mort_boss_final', 'src/assets/images/image_fin.png');
    }

    create() {
        const img = this.add.image(240, 200, 'mort_boss_final');
        img.setDisplaySize(460, 300);

        const boutonRetour = this.add.rectangle(this.scale.width / 2, this.scale.height - 80, 200, 60, 0x00aa00);
        boutonRetour.setInteractive();
        boutonRetour.setDepth(1);
        boutonRetour.on('pointerover', () => {
            boutonRetour.setFillStyle(0x00ff00);
        });
        boutonRetour.on('pointerout', () => {
            boutonRetour.setFillStyle(0x00aa00);
        });
        this.add.text(this.scale.width / 2, this.scale.height - 80, 'RETOUR', {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2);
        boutonRetour.on('pointerdown', () => {
            this.scene.start('menu');
        });
    }
}