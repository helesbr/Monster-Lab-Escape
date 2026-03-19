var player;

export default class map_directeur extends Phaser.Scene {
    constructor() {
        super({ key: "map_directeur" });
    }
    preload() { 
        this.load.tilemapTiledJSON("directeur", "src/assets/map_directeur.tmj");
        this.load.image("allTiles", "src/tilesets/all_tilesets.png");
        this.load.image("tapis_jaune", "src/tilesets/YellowPlastic_d.jpg");
        if (this.game.config.personnageSelectionne === 'helias') {
            this.load.image("img_perso", "src/assets/images/helias-perso.png");
        } else {
            this.load.spritesheet("img_perso", "src/assets/images/dude.png", {
                frameWidth: 44,
                frameHeight: 48
            });
        }
        this.load.image('doors', 'src/assets/images/door_solo.png');
        this.load.image('arthus', 'src/assets/images/arthus1.png');
    }

    create() {
        // Pour lire la money au démarrage de la scène si besoin :
        this.game.events.emit('getMoney', (money) => {
        });

        const carteDirecteurLab = this.add.tilemap("directeur");
        const tileset = carteDirecteurLab.addTilesetImage("all-tileset", "allTiles");
        const yellow = carteDirecteurLab.addTilesetImage("yellow", "tapis_jaune", 32, 32);
        const floorLayer = carteDirecteurLab.createLayer("floor", tileset, 0, 0);
        const yellowLayer = carteDirecteurLab.createLayer("yellow", yellow, 0, 0);
        const carpetLayer = carteDirecteurLab.createLayer("carpet", tileset, 0, 0);
        const wallLayer = carteDirecteurLab.createLayer("wall", tileset, 0, 0);
        const objectsLayer = carteDirecteurLab.createLayer("objects", tileset, 0, 0);
        wallLayer.setCollisionByProperty({ estSolide: true });
        objectsLayer.setCollisionByProperty({ estSolide: true });


        this.physics.world.setBounds(0, 0, carteDirecteurLab.widthInPixels, carteDirecteurLab.heightInPixels);
        this.cameras.main.setBounds(0, 0, carteDirecteurLab.widthInPixels, carteDirecteurLab.heightInPixels);

        let zoomX = this.scale.width / carteDirecteurLab.widthInPixels;
        let zoomY = this.scale.height / carteDirecteurLab.heightInPixels;
        this.cameras.main.setZoom(Math.min(zoomX, zoomY));
        this.cameras.main.centerOn(carteDirecteurLab.widthInPixels / 2, carteDirecteurLab.heightInPixels / 2);
        
        // ✅ Créer la porte "door_retour"
        const groupe_portes = this.physics.add.group();
        const doorsObjectsLayer = carteDirecteurLab.getObjectLayer("door_retour");
        if (doorsObjectsLayer) {
            const obj = doorsObjectsLayer.objects[0];
            if (obj) {
                const porte = this.physics.add.sprite(obj.x, obj.y, 'doors');
                porte.setCollideWorldBounds(true);
                porte.setDepth(50);
                porte.setDisplaySize(64, 32);
                porte.setRotation(Math.PI / 2);
                porte.body.setImmovable(true);
                porte.body.moves = false;
                porte.estSolide = true;
                porte.nom = obj.name;
                porte.doorName = obj.name;
                groupe_portes.add(porte);
            }
        }

        // ✅ Créer l'image Arthus au ping "arthus"
        const arthusObjectsLayer = carteDirecteurLab.getObjectLayer("arthus");
        if (arthusObjectsLayer) {
            const obj = arthusObjectsLayer.objects[0];
            if (obj) {
                this.arthus = this.physics.add.sprite(obj.x, obj.y, 'arthus');
                this.arthus.setCollideWorldBounds(true);
                this.arthus.setDepth(50);
                this.arthus.body.setImmovable(true);
                this.arthus.body.moves = false;
            }
        }

        // ✅ Récupérer la position de spawn du joueur selon la porte de destination
        const { porteDestination } = this.scene.settings.data || {};
        let playerSpawnX = 100;
        let playerSpawnY = 100;
        if (porteDestination) {
            const taxiPoints = carteDirecteurLab.getObjectLayer("doors");
            if (taxiPoints) {
                const door = taxiPoints.objects.find(obj => obj.name === porteDestination);
                if (door) {
                    playerSpawnX = door.x;
                    playerSpawnY = door.y;
                }
            }
        }

        player = this.physics.add.sprite(playerSpawnX, playerSpawnY, 'img_perso');
        player.setCollideWorldBounds(true);
        player.setDepth(100);
        player.body.setGravityY(-this.physics.world.gravity.y);
        player.pointsVie = 3;
        player.vitesseBase = 160;
        player.vitesseBoost = null;
        player.armeEquipee = null;
        player.directionArme = 'droite';
        this.invincible = false;
        
        // ✅ Récupérer la vie persistée
        this.game.events.emit('getVie', (vie) => {
            player.pointsVie = vie;
        });

        // ✅ Récupérer l'arme persistée
        this.game.events.emit('getArme', (aArme) => {
            if (aArme) {
                const armeSprite = this.add.sprite(player.x + 20, player.y, 'image_gun');
                armeSprite.setDisplaySize(40, 40);
                armeSprite.setDepth(99);
                player.armeEquipee = armeSprite;
            }
        });

        // ✅ Récupérer le boost vitesse APRÈS avoir défini vitesseBase
        this.game.events.emit('getBoostVitesse', (actif, tempsRestant) => {
            if (actif && tempsRestant > 0) {
                player.vitesseBoost = player.vitesseBase * 2.5;
                console.log('Boost vitesse récupéré, temps restant:', tempsRestant);
                this.time.delayedCall(tempsRestant, () => {
                    player.vitesseBoost = null;
                    this.game.events.emit('resetBoostVitesse');
                });
            }
        });

        // ✅ Récupérer la vie max persistée (creatine)
        this.game.events.emit('getVieMax', (vieMax) => {
            if (vieMax > 3) {
                // Réappliquer l'affichage des coeurs supplémentaires via getVie
                this.game.events.emit('getVie', (vie) => {
                    // setVieMax met à jour le HUD
                    this.game.events.emit('setVieMax', vieMax, vie);
                    player.pointsVie = vie;
                });
            }
        });
        
        if (wallLayer) this.physics.add.collider(player, wallLayer);
        if (objectsLayer) this.physics.add.collider(player, objectsLayer);
        if (this.arthus) this.physics.add.collider(player, this.arthus);

        this.doorCollider = this.physics.add.collider(player, groupe_portes);
        this.groupe_portes = groupe_portes;
        this.cameras.main.startFollow(player);

        this.isDude = this.game.config.personnageSelectionne !== 'helias';
        if (this.isDude) {
            if (!this.anims.exists("anim_tourne_gauche")) {
                this.anims.create({
                    key: "anim_tourne_gauche",
                    frames: this.anims.generateFrameNumbers("img_perso", { start: 4, end: 5 }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            if (!this.anims.exists("anim_tourne_droite")) {
                this.anims.create({
                    key: "anim_tourne_droite",
                    frames: this.anims.generateFrameNumbers("img_perso", { start: 6, end: 8 }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            if (!this.anims.exists("anim_face")) {
                this.anims.create({
                    key: "anim_face",
                    frames: [{ key: "img_perso", frame: 1 }],
                    frameRate: 20
                });
            }
        }

        // ✅ Initialiser le clavier
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        
        // ✅ Créer la porte "porte_fin"
        const porteFinLayer = carteDirecteurLab.getObjectLayer("porte_fin");
        this.porteFin = null;
        if (porteFinLayer) {
            const obj = porteFinLayer.objects[0];
            if (obj) {
                this.porteFin = this.physics.add.sprite(obj.x, obj.y, 'doors');
                this.porteFin.setCollideWorldBounds(true);
                this.porteFin.setDepth(50);
                this.porteFin.setDisplaySize(64, 32);
                this.porteFin.setRotation(Math.PI / 2);
                this.porteFin.body.setImmovable(true);
                this.porteFin.body.moves = false;
                this.physics.add.collider(player, this.porteFin);
            }
        }

        // ✅ Récupérer les objets interactifs depuis le calque "objets"
        const objetsLayer = carteDirecteurLab.getObjectLayer("objets");
        this.halteres = null;
        if (objetsLayer) {
            const halteresObj = objetsLayer.objects.find(o => o.name === "halteres");
            if (halteresObj) {
                this.halteres = { x: halteresObj.x, y: halteresObj.y };
            }
            const benchObj = objetsLayer.objects.find(o => o.name === "bench");
            if (benchObj) {
                this.bench = { x: benchObj.x, y: benchObj.y };
            }
            const echecObj = objetsLayer.objects.find(o => o.name === "echec");
            if (echecObj) {
                this.echec = { x: echecObj.x, y: echecObj.y };
            }
        }

        // ✅ Variables d'interaction
        this.doorNearby = null;
        this.arthusNearby = null;
        this.arthusDialogueShowing = false;
        this.halteresNearby = false;
        this.halteresDialogueShowing = false;
        this.benchNearby = false;
        this.benchDialogueShowing = false;
        this.echecNearby = false;
        this.echecDialogueShowing = false;
        this.porteFinNearby = false;
        this.codeInputActive = false;
        this.codeEntered = '';
        this.correctCode = '2845';
        this.porteFinOuverte = false;

        // ✅ Minuteur de 2 minutes
        this.tempsRestant = 120;
        this.texteTimer = this.add.text(this.scale.width / 2, this.scale.height / 2, '4:00', {
            fontSize: '40px',
            fontStyle: 'bold',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0).setDepth(200).setScrollFactor(0);

        // ✅ Message d'arrivée (bloque le joueur et retarde le chrono)
        this.playerBlocked = true;
        this.messageArrivee = this.add.text(this.scale.width / 2, this.scale.height / 2 + 85,
            "Bienvenue dans le bureau du directeur !\nRésous les énigmes pour t'échapper !",
            {
                fontSize: '22px',
                fontStyle: 'bold',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: 400 },
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(200).setScrollFactor(0);

        this.time.delayedCall(5000, () => {
            this.messageArrivee.destroy();
            this.playerBlocked = false;
            // ✅ Lancer le chrono après le message
            this.timerCompteur = this.time.addEvent({
                delay: 1000,
                callback: function () {
                    this.tempsRestant--;
                    const minutes = Math.floor(this.tempsRestant / 60);
                    const secondes = this.tempsRestant % 60;
                    this.texteTimer.setText(minutes + ':' + (secondes < 10 ? '0' : '') + secondes);

                    if (this.tempsRestant <= 10) {
                        this.texteTimer.setFill('#ff0000');
                        this.tweens.add({
                            targets: this.texteTimer,
                            scale: 1.3,
                            duration: 200,
                            yoyo: true
                        });
                    }

                    if (this.tempsRestant <= 0) {
                        this.timerCompteur.remove();
                        this.game.events.emit('resetVie');
                        this.game.events.emit('resetArme');
                        this.game.events.emit('resetMonstres');
                        this.game.events.emit('resetBoost');
                        this.game.events.emit('resetMoney');
                        this.scene.stop('HUD');
                        this.scene.start('menu');
                    }
                },
            callbackScope: this,
            repeat: 119
            });
        });
    }
    update() {

        // ✅ Bloquer le joueur pendant le message d'arrivée
        if (this.playerBlocked) {
            player.setVelocity(0, 0);
            return;
        }

        // ✅ vitesse avec boost preworkout
        const vitesse = player.vitesseBoost || player.vitesseBase || 160;

        // ✅ Détection de proximité avec les portes
        this.doorNearby = null;
        if (this.groupe_portes) {
            this.groupe_portes.children.entries.forEach((door) => {
                const distance = Phaser.Math.Distance.Between(
                    player.x, player.y,
                    door.x, door.y
                );
                if (distance < 50 && door.estSolide) {
                    this.doorNearby = door;
                }
            });
        }

        // ✅ Détection de proximité avec Arthus
        this.arthusNearby = null;
        if (this.arthus) {
            const distance = Phaser.Math.Distance.Between(
                player.x, player.y,
                this.arthus.x, this.arthus.y
            );
            if (distance < 100) {
                this.arthusNearby = this.arthus;
            }
        }

        // ✅ Détection de proximité avec les haltères
        this.halteresNearby = false;
        if (this.halteres) {
            const distHalteres = Phaser.Math.Distance.Between(
                player.x, player.y,
                this.halteres.x, this.halteres.y
            );
            if (distHalteres < 100) {
                this.halteresNearby = true;
            }
        }

        // ✅ Détection de proximité avec le bench
        this.benchNearby = false;
        if (this.bench) {
            const distBench = Phaser.Math.Distance.Between(
                player.x, player.y,
                this.bench.x, this.bench.y
            );
            if (distBench < 100) {
                this.benchNearby = true;
            }
        }

        // ✅ Détection de proximité avec les échecs
        this.echecNearby = false;
        if (this.echec) {
            const distEchec = Phaser.Math.Distance.Between(
                player.x, player.y,
                this.echec.x, this.echec.y
            );
            if (distEchec < 100) {
                this.echecNearby = true;
            }
        }

        // ✅ Détection de proximité avec porte_fin
        this.porteFinNearby = false;
        if (this.porteFin && !this.porteFinOuverte) {
            const distPorteFin = Phaser.Math.Distance.Between(
                player.x, player.y,
                this.porteFin.x, this.porteFin.y
            );
            if (distPorteFin < 100) {
                this.porteFinNearby = true;
            }
        }

        // ✅ Gestion des interactions au ENTER
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            if (this.halteresNearby && !this.halteresDialogueShowing) {
                this.halteresDialogueShowing = true;
                const dialogueHalteres = this.add.text(240, 100,
                    "3 rangées, mais la rangée du milieu a disparu. Combien reste-t-il ?",
                    {
                        fontSize: '20px',
                        fontStyle: 'bold',
                        fill: '#ff0000',
                        align: 'center',
                        wordWrap: { width: 400 },
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                ).setOrigin(0.5).setDepth(200).setScrollFactor(0);

                this.time.delayedCall(5000, () => {
                    dialogueHalteres.destroy();
                    this.halteresDialogueShowing = false;
                });
            }
            else if (this.benchNearby && !this.benchDialogueShowing) {
                this.benchDialogueShowing = true;
                const dialogueBench = this.add.text(240, 100,
                    "Le patron fait 4 séries de 2 exercices. Mais il dit que seul le total d'une série compte.",
                    {
                        fontSize: '20px',
                        fontStyle: 'bold',
                        fill: '#ff0000',
                        align: 'center',
                        wordWrap: { width: 400 },
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                ).setOrigin(0.5).setDepth(200).setScrollFactor(0);

                this.time.delayedCall(5000, () => {
                    dialogueBench.destroy();
                    this.benchDialogueShowing = false;
                });
            }
            else if (this.echecNearby && !this.echecDialogueShowing) {
                this.echecDialogueShowing = true;
                const dialogueEchec = this.add.text(240, 100,
                    "Blanc a perdu toutes ses pièces sauf le double de 2. Noir n'a plus que la moitié de ça.",
                    {
                        fontSize: '20px',
                        fontStyle: 'bold',
                        fill: '#ff0000',
                        align: 'center',
                        wordWrap: { width: 400 },
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                ).setOrigin(0.5).setDepth(200).setScrollFactor(0);

                this.time.delayedCall(5000, () => {
                    dialogueEchec.destroy();
                    this.echecDialogueShowing = false;
                });
            }
            else if (this.porteFinNearby && !this.codeInputActive && !this.porteFinOuverte) {
                this.showCodeInput();
            }
            else if (this.arthusNearby && !this.arthusDialogueShowing) {
                // Afficher le dialogue d'Arthus
                this.arthusDialogueShowing = true;
                const dialogue = this.add.text(240, 150,
                    "Salam j'ai mal... le patron est obsédé par ses chiffres. Il dit toujours : 'l'ordre c'est la clé'. Commence par ce qui se soulève, puis où on s'allonge, puis le jeu du roi... et moi je suis le dernier.",
                    {
                        fontSize: '20px',
                        fontStyle: 'bold',
                        fill: '#ff0000',
                        align: 'center',
                        wordWrap: { width: 400 },
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                ).setOrigin(0.5).setDepth(200).setScrollFactor(0);

                // Fermer le dialogue après 5 secondes
                this.time.delayedCall(5000, () => {
                    dialogue.destroy();
                    this.arthusDialogueShowing = false;
                });
            }
        }

        // ✅ Gestion du code input actif
        if (this.codeInputActive) {
            return;
        }

        if (this.keyD.isDown) {
            player.setVelocityX(vitesse);
            player.setFlipX(false);
            if (this.isDude) player.anims.play('anim_tourne_droite', true);
        } else if (this.keyQ.isDown) {
            player.setVelocityX(-vitesse);
            player.setFlipX(false);
            if (this.isDude) player.anims.play('anim_tourne_gauche', true);
        } else {
            player.setVelocityX(0);
            if (this.isDude) player.anims.play('anim_face');
        }

        if (this.keyZ.isDown) {
            player.setVelocityY(-vitesse);
        } else if (this.keyS.isDown) {
            player.setVelocityY(vitesse);
        } else {
            player.setVelocityY(0);
        }

    }

    showCodeInput() {
        this.codeInputActive = true;
        this.codeEntered = '';
        player.setVelocity(0, 0);

        // Fond sombre
        this.codeOverlay = this.add.rectangle(240, 240, 480, 480, 0x000000, 0.7)
            .setDepth(300).setScrollFactor(0);

        // Panneau
        this.codePanel = this.add.rectangle(240, 220, 360, 200, 0x222222, 0.95)
            .setDepth(301).setScrollFactor(0).setStrokeStyle(3, 0xff0000);

        // Titre
        this.codeTitle = this.add.text(240, 155, 'Entrez le code :', {
            fontSize: '22px', fontStyle: 'bold', fill: '#ffffff',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(302).setScrollFactor(0);

        // Affichage du code (4 tirets)
        this.codeDisplay = this.add.text(240, 210, '_ _ _ _', {
            fontSize: '36px', fontStyle: 'bold', fill: '#00ff00',
            fontFamily: 'monospace', stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(302).setScrollFactor(0);

        // Instruction
        this.codeHint = this.add.text(240, 265, 'Tapez 4 chiffres puis ENTER\nESCHAP pour annuler', {
            fontSize: '14px', fill: '#aaaaaa', align: 'center',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(302).setScrollFactor(0);

        // Écouter les touches numériques
        this.codeKeys = [];
        for (let i = 0; i <= 9; i++) {
            const key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO + i);
            this.codeKeys.push(key);
        }
        this.codeKeyBackspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
        this.codeKeyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.codeInputHandler = this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                // Chiffres 0-9
                for (let i = 0; i <= 9; i++) {
                    if (Phaser.Input.Keyboard.JustDown(this.codeKeys[i]) && this.codeEntered.length < 4) {
                        this.codeEntered += i.toString();
                        this.updateCodeDisplay();
                    }
                }
                // Backspace
                if (Phaser.Input.Keyboard.JustDown(this.codeKeyBackspace) && this.codeEntered.length > 0) {
                    this.codeEntered = this.codeEntered.slice(0, -1);
                    this.updateCodeDisplay();
                }
                // Echap → fermer
                if (Phaser.Input.Keyboard.JustDown(this.codeKeyEsc)) {
                    this.closeCodeInput();
                }
                // Enter → valider
                if (Phaser.Input.Keyboard.JustDown(this.enterKey) && this.codeEntered.length === 4) {
                    this.validateCode();
                }
            }
        });
    }

    updateCodeDisplay() {
        let display = '';
        for (let i = 0; i < 4; i++) {
            display += (i < this.codeEntered.length) ? this.codeEntered[i] : '_';
            if (i < 3) display += ' ';
        }
        this.codeDisplay.setText(display);
    }

    closeCodeInput() {
        if (this.codeInputHandler) this.codeInputHandler.remove();
        if (this.codeOverlay) this.codeOverlay.destroy();
        if (this.codePanel) this.codePanel.destroy();
        if (this.codeTitle) this.codeTitle.destroy();
        if (this.codeDisplay) this.codeDisplay.destroy();
        if (this.codeHint) this.codeHint.destroy();
        if (this.codeResultText) { this.codeResultText.destroy(); this.codeResultText = null; }

        // Supprimer les listeners de touches
        if (this.codeKeys) {
            this.codeKeys.forEach(k => k.destroy());
            this.codeKeys = null;
        }
        if (this.codeKeyBackspace) { this.codeKeyBackspace.destroy(); this.codeKeyBackspace = null; }
        if (this.codeKeyEsc) { this.codeKeyEsc.destroy(); this.codeKeyEsc = null; }

        this.codeInputActive = false;
    }

    validateCode() {
        if (this.codeInputHandler) this.codeInputHandler.remove();

        if (this.codeEntered === this.correctCode) {
            // Code correct → ouvrir la porte
            this.codeDisplay.setFill('#00ff00');
            this.codeResultText = this.add.text(240, 265, 'Code correct ! La porte s\'ouvre...', {
                fontSize: '18px', fontStyle: 'bold', fill: '#00ff00',
                stroke: '#000000', strokeThickness: 3, align: 'center'
            }).setOrigin(0.5).setDepth(302).setScrollFactor(0);
            if (this.codeHint) this.codeHint.destroy();

            this.time.delayedCall(1500, () => {
                this.closeCodeInput();
                this.porteFinOuverte = true;
                if (this.porteFin) {
                    this.porteFin.destroy();
                    this.porteFin = null;
                }
            });
        } else {
            // Code incorrect
            this.codeDisplay.setFill('#ff0000');
            this.codeResultText = this.add.text(240, 265, 'Code incorrect !', {
                fontSize: '18px', fontStyle: 'bold', fill: '#ff0000',
                stroke: '#000000', strokeThickness: 3, align: 'center'
            }).setOrigin(0.5).setDepth(302).setScrollFactor(0);
            if (this.codeHint) this.codeHint.destroy();

            this.time.delayedCall(1500, () => {
                this.closeCodeInput();
            });
        }
    }
}