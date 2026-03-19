var player;

export default class mort_boss_final extends Phaser.Scene {
    constructor() {
        super({ key: "mort_boss_final" });
    }

    preload() {
            this.load.image('mort_boss_final', 'src/assets/images/mort_boss_final.png');
    }

    create() {
        this.add.image(400, 300, 'mort_boss_final');

        const bouton = this.add.text(400, 530, 'Retour au menu', {
            fontSize: '28px',
            fontStyle: 'bold',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 },
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });

        bouton.on('pointerover', () => bouton.setStyle({ fill: '#ffff00' }));
        bouton.on('pointerout', () => bouton.setStyle({ fill: '#ffffff' }));
        bouton.on('pointerdown', () => {
            this.scene.start('menu');
        });
    }
}