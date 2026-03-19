export default class fin extends Phaser.Scene {
    constructor() {
        super({ key: "fin" });
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Fond sombre
        this.add.rectangle(centerX, centerY, this.scale.width, this.scale.height, 0x000000, 0.85)
            .setDepth(0);

        // Titre de victoire
        this.add.text(centerX, centerY - 80, 'bien joué', {
            fontSize: '28px',
            fontStyle: 'bold',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(1);

        

        // Bouton Rejouer
        const btnBg = this.add.rectangle(centerX, centerY + 20, 200, 60, 0x00aa00)
            .setDepth(1).setInteractive({ useHandCursor: true });

        const btnText = this.add.text(centerX, centerY + 20, 'REJOUER', {
            fontSize: '32px',
            fontStyle: 'bold',
            fill: '#fff'
        }).setOrigin(0.5).setDepth(2);

        // Hover
        btnBg.on('pointerover', () => {
            btnBg.setFillStyle(0x00ff00);
        });
        btnBg.on('pointerout', () => {
            btnBg.setFillStyle(0x00aa00);
        });

        // Clic → retour au menu
        btnBg.on('pointerdown', () => {
            this.game.events.emit('resetVie');
            this.game.events.emit('resetArme');
            this.game.events.emit('resetMonstres');
            this.game.events.emit('resetBoost');
            this.game.events.emit('resetMoney');
            this.scene.stop('HUD');
            this.scene.start('menu');
        });
    }
}