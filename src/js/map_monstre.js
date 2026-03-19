var player;

export default class map_monstre extends Phaser.Scene {
    constructor() {
        super({ key: "map_monstre" });
    }

    preload() {
        this.load.tilemapTiledJSON("monstres", "src/assets/map_monstre.tmj");
        this.load.image("allTiles", "src/tilesets/all_tilesets.png");
        this.load.image('ball', 'src/assets/images/ball.png');
        this.load.spritesheet('monstres', 'src/assets/images/monstre.png', {
            frameWidth: 44,
            frameHeight: 48
        });
        if (this.game.config.personnageSelectionne === 'helias') {
            this.load.image("img_perso", "src/assets/images/helias-perso.png");
        } else {
            this.load.spritesheet("img_perso", "src/assets/images/dude.png", {
                frameWidth: 44,
                frameHeight: 48
            });
        }
        this.load.spritesheet('doors', 'src/assets/images/doors_spritesheet.png', {
            frameWidth: 64,
            frameHeight: 80
        });
        this.load.spritesheet("image_gun", "src/assets/images/gun.png", {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.image('bouton_directeur', 'src/assets/images/bouton.jpg');
        this.load.image('boss_helias', 'src/assets/images/HeliasBoss.png');
        this.load.image('boss_arthus', 'src/assets/images/Arthus.png');
        this.load.image('boss_mehdi', 'src/assets/images/Mehdi.png');
        this.load.image('boss_elias', 'src/assets/images/Elias.png');
        this.load.audio('herve', 'src/assets/son/Herve.mp3');
        this.load.audio('monstres', 'src/assets/son/monstre.mp3');
        this.load.audio('rage_quit', 'src/assets/son/rage_quite.m4a');
        this.load.image('mort_boss_final', 'src/assets/images/image_fin.png');
    }

    create() {
        // Créer les sons
        this.son_herve = this.sound.add('herve');
        this.son_monstre = this.sound.add('monstres');
        this.son_rage_quit = this.sound.add('rage_quit');

        // Jouer Herve d'abord
        this.son_herve.play();

        // Quand Herve se termine, jouer monstre
        this.son_herve.once('complete', () => {
            this.son_monstre.play();
        });

        // Nettoyer les sons au shutdown de la scène
        this.events.on('shutdown', () => {
            if (this.son_herve) this.son_herve.stop();
            if (this.son_monstre) this.son_monstre.stop();
        });



        const carteMonstreLab = this.add.tilemap("monstres");
        const tileset = carteMonstreLab.addTilesetImage("all_tilset", "allTiles");

        const sangLayer = carteMonstreLab.createLayer("blood1", tileset, 0, 0);
        const murLayer = carteMonstreLab.createLayer("Mur", tileset, 0, 0);
        const bloodLayer = carteMonstreLab.createLayer("blood", tileset, 0, 0);

        murLayer.setCollisionByProperty({ estSolide: true });

        this.physics.world.setBounds(0, 0, carteMonstreLab.widthInPixels, carteMonstreLab.heightInPixels);
        this.physics.world.OVERLAP_BIAS = 16;
        this.cameras.main.setBounds(0, 0, carteMonstreLab.widthInPixels, carteMonstreLab.heightInPixels);

        let zoomX = this.scale.width / carteMonstreLab.widthInPixels;
        let zoomY = this.scale.height / carteMonstreLab.heightInPixels;
        this.cameras.main.setZoom(Math.min(zoomX, zoomY));
        this.cameras.main.centerOn(carteMonstreLab.widthInPixels / 2, carteMonstreLab.heightInPixels / 2);

        if (!this.anims.exists("gun_droite")) this.anims.create({ key: "gun_droite", frames: [{ key: "image_gun", frame: 0 }], frameRate: 10 });
        if (!this.anims.exists("gun_gauche")) this.anims.create({ key: "gun_gauche", frames: [{ key: "image_gun", frame: 1 }], frameRate: 10 });
        if (!this.anims.exists("gun_haut")) this.anims.create({ key: "gun_haut", frames: [{ key: "image_gun", frame: 3 }], frameRate: 10 });
        if (!this.anims.exists("gun_bas")) this.anims.create({ key: "gun_bas", frames: [{ key: "image_gun", frame: 2 }], frameRate: 10 });

        this.groupe_monstres = this.physics.add.group();
        const calqueMonstres = carteMonstreLab.getObjectLayer("monstres");

        this.game.events.emit('getMonstresMorts', (monstresMorts) => {
            if (calqueMonstres) {
                calqueMonstres.objects.forEach((monstreObj, index) => {
                    if (monstresMorts.includes(index)) return;
                    const randomX = Phaser.Math.Between(50, carteMonstreLab.widthInPixels - 50);
                    const randomY = Phaser.Math.Between(50, carteMonstreLab.heightInPixels - 50);
                    const monstre = this.groupe_monstres.create(randomX, randomY, 'monstres');
                    monstre.setBounce(1, 1);
                    monstre.setCollideWorldBounds(true);
                    monstre.setDisplaySize(100, 100);
                    monstre.setDepth(50);
                    monstre.pointsVie = Phaser.Math.Between(3, 6);
                    monstre.index = index;
                    monstre.setVelocity(Phaser.Math.Between(-150, 150), Phaser.Math.Between(-150, 150));

                    monstre.moveEvent = this.time.addEvent({
                        delay: Phaser.Math.Between(2000, 4000),
                        callback: function () {
                            if (monstre.active) monstre.setVelocity(Phaser.Math.Between(-150, 150), Phaser.Math.Between(-150, 150));
                        },
                        loop: true
                    });
                });
            }
        });

        this.physics.add.collider(this.groupe_monstres, murLayer);
        this.murLayer = murLayer;

        if (!this.anims.exists("door_closed")) this.anims.create({ key: "door_closed", frames: [{ key: 'doors', frame: 0 }], frameRate: 10 });
        if (!this.anims.exists("door_open")) this.anims.create({ key: "door_open", frames: this.anims.generateFrameNumbers('doors', { start: 1, end: 4 }), frameRate: 10 });

        var groupe_portes = this.physics.add.group();
        const tabPoints1 = carteMonstreLab.getObjectLayer("door_retour");
        const tabPoints2 = carteMonstreLab.getObjectLayer("door retour");
        [tabPoints1, tabPoints2].forEach(tabPoints => {
            if (tabPoints) {
                tabPoints.objects.forEach(point => {
                    const porte = groupe_portes.create(point.x, point.y, 'doors');
                    porte.anims.play('door_closed');
                    porte.setAngle(90);
                    porte.body.setSize(32, 64);
                    porte.body.setOffset(16, -16);
                    porte.setDepth(40);
                    porte.doorName = point.name;
                    porte.body.setCollideWorldBounds(false);
                    porte.body.setImmovable(true);
                    porte.body.moves = false;
                    porte.estSolide = true;
                });
            }
        });

        const { porteDestination } = this.scene.settings.data || {};
        let playerSpawnX = 100;
        let playerSpawnY = 100;
        if (porteDestination) {
            const porteArrivee = groupe_portes.children.entries.find(p => p.doorName === porteDestination);
            if (porteArrivee) { playerSpawnX = porteArrivee.x; playerSpawnY = porteArrivee.y; }
        }

        player = this.physics.add.sprite(playerSpawnX, playerSpawnY, 'img_perso');
        player.setCollideWorldBounds(true);
        player.setDepth(100);
        player.body.setGravityY(-this.physics.world.gravity.y);
        player.armeEquipee = null;
        player.directionArme = 'droite';
        player.pointsVie = 3;
        player.vitesseBase = 160;
        player.vitesseBoost = null; // reset local d'abord
        this.invincible = false;

        this.game.events.emit('getVie', (vie) => { player.pointsVie = vie; });
        this.game.events.emit('getArme', (aArme) => {
            if (aArme) {
                const armeSprite = this.add.sprite(player.x + 20, player.y, 'image_gun');
                armeSprite.setDisplaySize(40, 40);
                armeSprite.setDepth(99);
                armeSprite.anims.play('gun_droite');
                player.armeEquipee = armeSprite;
            }
        });

        // ✅ Récupérer le boost vitesse APRÈS avoir défini vitesseBase
        this.game.events.emit('getBoostVitesse', (actif, tempsRestant) => {
            if (actif && tempsRestant > 0) {
                player.vitesseBoost = player.vitesseBase * 2.5;

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

        if (murLayer) this.physics.add.collider(player, murLayer);

        this.doorCollider = this.physics.add.collider(player, groupe_portes);
        this.groupe_portes = groupe_portes;
        this.cameras.main.startFollow(player);

        this.isDude = this.game.config.personnageSelectionne !== 'helias';
        if (this.isDude) {
            if (!this.anims.exists("anim_tourne_gauche")) this.anims.create({ key: "anim_tourne_gauche", frames: this.anims.generateFrameNumbers("img_perso", { start: 4, end: 5 }), frameRate: 10, repeat: -1 });
            if (!this.anims.exists("anim_tourne_droite")) this.anims.create({ key: "anim_tourne_droite", frames: this.anims.generateFrameNumbers("img_perso", { start: 6, end: 8 }), frameRate: 10, repeat: -1 });
            if (!this.anims.exists("anim_face")) this.anims.create({ key: "anim_face", frames: [{ key: "img_perso", frame: 1 }], frameRate: 20 });
        }

        this.groupeBullets = this.physics.add.group();
        this.physics.add.collider(this.groupeBullets, murLayer, (balle) => balle.destroy());

        this.physics.add.overlap(this.groupeBullets, this.groupe_monstres, (balle, monstre) => {
            balle.destroy();
            monstre.pointsVie--;
            if (monstre.pointsVie <= 0) {
                if (monstre.moveEvent) monstre.moveEvent.remove();
                this.game.events.emit('monstreMort', monstre.index);
                monstre.destroy();
                if (this.groupe_monstres.countActive() === 0) {
                    this.game.events.emit('tousMonstresMorts');
                    // Spawn les boss après tous les monstres normaux tués
                    this.spawnBosses();
                }
            }
        });

        this.physics.add.overlap(player, this.groupe_monstres, () => {
            if (this.invincible) return;
            this.invincible = true;
            this.game.events.emit('playerHit');
            player.pointsVie--;

            this.tweens.add({
                targets: player, alpha: 0, duration: 100, repeat: 5, yoyo: true,
                onComplete: () => { player.setAlpha(1); this.invincible = false; }
            });

            if (player.pointsVie <= 0) {
                this.game.events.emit('resetVie');
                this.game.events.emit('resetArme');
                this.game.events.emit('resetMonstres');
                this.scene.stop('HUD');

                // Jouer le son et attendre sa fin
                if (this.son_rage_quit) {
                    this.son_rage_quit.play();
                    this.son_rage_quit.once('complete', () => {
                        this.scene.start('laboratory', { spawnX: 100, spawnY: 50 });
                        this.scene.launch('HUD');
                    });
                }
            }
        });

        this.physics.world.on("worldbounds", (body) => {
            const objet = body.gameObject;
            if (this.groupeBullets.contains(objet)) objet.destroy();
            if (this.groupeBossBullets && this.groupeBossBullets.contains(objet)) objet.destroy();
        });

        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.boutonFeu = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.doorNearby && this.doorNearby.estSolide) {
                const doorName = this.doorNearby.doorName;
                this.doorNearby.estSolide = false;
                this.doorCollider.active = false;
                this.doorNearby.anims.play('door_open');
                this.cameras.main.fade(500, 0, 0, 0);
                this.time.delayedCall(500, () => {
                    this.scene.start("laboratory", { porteDestination: "door4", offsetX: -50 });
                });
            }
        });

        this.calqueBoutons = carteMonstreLab.getObjectLayer("bouton");
        if (this.calqueBoutons) {
            const pingBoutonDirecteur = this.calqueBoutons.objects.find(obj => obj.name === "bouton_directeur");
            if (pingBoutonDirecteur) {
                const boutonDirecteur = this.physics.add.sprite(pingBoutonDirecteur.x, pingBoutonDirecteur.y, 'bouton_directeur');
                this.boutonDirecteur = boutonDirecteur;

                // Créer le texte pour le bouton centré et en gras
                const texteBouton = this.add.text(carteMonstreLab.widthInPixels / 2, 100, 'Félicitations, clic pour aller dans le bureau du directeur', {
                    fontSize: '18px',
                    fontStyle: 'bold',
                    fill: '#ffffff',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 3
                });
                texteBouton.setOrigin(0.5, 0.5);
                texteBouton.setDepth(51);
                texteBouton.setVisible(false);
                this.texteBouton = texteBouton;

                boutonDirecteur.setInteractive();
                boutonDirecteur.setDepth(50);
                boutonDirecteur.setVisible(false);
                boutonDirecteur.on('pointerdown', () => {
                    this.cameras.main.fade(500, 0, 0, 0);
                    this.time.delayedCall(500, () => {
                        this.scene.start('map_directeur', { porteDestination: 'door_retour' });
                    });
                });
            }
        }

        this.invincible = true;
        player.setAlpha(0.5);
        this.time.delayedCall(1000, () => { this.invincible = false; player.setAlpha(1); });

        // Groupe pour les boss et leurs balles
        this.groupe_boss = this.physics.add.group();
        this.groupeBossBullets = this.physics.add.group();
        this.bossPhaseActive = false;
    }

    spawnBosses() {
        this.bossPhaseActive = true;

        const bossData = [
            { key: 'boss_helias', nom: 'Helias', pv: 20 },
            { key: 'boss_arthus', nom: 'Arthus', pv: 20 },
            { key: 'boss_mehdi', nom: 'Mehdi', pv: 20 },
            { key: 'boss_elias', nom: 'Elias', pv: 20 }
        ];

        const mapW = this.physics.world.bounds.width;
        const mapH = this.physics.world.bounds.height;

        bossData.forEach((data, i) => {
            const spawnX = Phaser.Math.Between(80, mapW - 80);
            const spawnY = Phaser.Math.Between(80, mapH - 80);

            const boss = this.groupe_boss.create(spawnX, spawnY, data.key);
            boss.setDisplaySize(100, 150);
            boss.setDepth(60);
            boss.setCollideWorldBounds(true);
            boss.setBounce(1, 1);
            boss.pointsVie = data.pv;
            boss.nom = data.nom;
            boss.body.allowGravity = false;
            boss.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));

            // Changement de direction aléatoire
            boss.moveEvent = this.time.addEvent({
                delay: Phaser.Math.Between(1500, 3000),
                callback: () => {
                    if (boss.active) boss.setVelocity(Phaser.Math.Between(-120, 120), Phaser.Math.Between(-120, 120));
                },
                loop: true
            });

            // Tir vers le joueur
            boss.shootEvent = this.time.addEvent({
                delay: Phaser.Math.Between(2000, 3500),
                callback: () => {
                    if (boss.active && player.active) this.bossTirer(boss);
                },
                loop: true
            });
        });

        // Collisions boss avec murs
        if (this.murLayer) {
            this.physics.add.collider(this.groupe_boss, this.murLayer);
            this.physics.add.collider(this.groupeBossBullets, this.murLayer, (balle) => balle.destroy());
        }

        // Balles joueur vs boss
        this.physics.add.overlap(this.groupeBullets, this.groupe_boss, (balle, boss) => {
            balle.destroy();
            boss.pointsVie--;

            // Flash blanc quand touché
            boss.setTint(0xff0000);
            this.time.delayedCall(100, () => { if (boss.active) boss.clearTint(); });

            if (boss.pointsVie <= 0) {
                if (boss.moveEvent) boss.moveEvent.remove();
                if (boss.shootEvent) boss.shootEvent.remove();
                boss.destroy();
                this.game.events.emit('addMoney', 25);

                // Tous les boss morts -> bouton directeur
                if (this.groupe_boss.countActive() === 0) {
                    this.bossPhaseActive = false;
                    if (this.boutonDirecteur) {
                        this.boutonDirecteur.setVisible(true);
                        this.boutonDirecteur.setInteractive();
                    }
                    if (this.texteBouton) {
                        this.texteBouton.setVisible(true);
                    }
                }
            }
        });

        // Balles boss vs joueur
        this.physics.add.overlap(player, this.groupeBossBullets, (p, balle) => {
            balle.destroy();
            if (this.invincible) return;
            this.invincible = true;
            this.game.events.emit('playerHit');
            player.pointsVie--;

            this.tweens.add({
                targets: player, alpha: 0, duration: 100, repeat: 5, yoyo: true,
                onComplete: () => { player.setAlpha(1); this.invincible = false; }
            });

            if (player.pointsVie <= 0) {
                this.game.events.emit('resetVie');
                this.game.events.emit('resetArme');
                this.game.events.emit('resetMonstres');
                this.scene.stop('HUD');
                if (this.son_rage_quit) {
                    this.son_rage_quit.play();
                    this.son_rage_quit.once('complete', () => {
                        this.scene.start('mort_boss_final');
                    });
                }
            }
        });

        // Contact direct boss vs joueur
        this.physics.add.overlap(player, this.groupe_boss, () => {
            if (this.invincible) return;
            this.invincible = true;
            this.game.events.emit('playerHit');
            player.pointsVie--;

            this.tweens.add({
                targets: player, alpha: 0, duration: 100, repeat: 5, yoyo: true,
                onComplete: () => { player.setAlpha(1); this.invincible = false; }
            });

            if (player.pointsVie <= 0) {
                this.game.events.emit('resetVie');
                this.game.events.emit('resetArme');
                this.game.events.emit('resetMonstres');
                this.scene.stop('HUD');
                if (this.son_rage_quit) {
                    this.son_rage_quit.play();
                    this.son_rage_quit.once('complete', () => {
                        this.scene.start('mort_boss_final');
                    });
                }
            }
        });
    }

    bossTirer(boss) {
        const angle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
        const vitesse = 450;
        const balle = this.groupeBossBullets.create(boss.x, boss.y, 'ball');
        balle.setDisplaySize(18, 18);
        balle.setTint(0xff0000);
        balle.setDepth(90);
        balle.body.allowGravity = false;
        balle.setCollideWorldBounds(true);
        balle.body.onWorldBounds = true;
        balle.setVelocity(Math.cos(angle) * vitesse, Math.sin(angle) * vitesse);
        // Détruire la balle après 3 secondes
        this.time.delayedCall(3000, () => { if (balle.active) balle.destroy(); });
    }

    tirer() {
        if (!player.armeEquipee) return;
        let vx = 0, vy = 0, offsetX = 0, offsetY = 0;
        const vitesse = 600;
        switch (player.directionArme) {
            case 'droite': vx = vitesse; offsetX = 30; break;
            case 'gauche': vx = -vitesse; offsetX = -30; break;
            case 'haut': vy = -vitesse; offsetY = -30; break;
            case 'bas': vy = vitesse; offsetY = 30; break;
        }
        const balle = this.groupeBullets.create(player.x + offsetX, player.y + offsetY, 'ball');
        balle.setDisplaySize(12, 12);
        balle.setDepth(90);
        balle.setCollideWorldBounds(true);
        balle.body.allowGravity = false;
        balle.body.onWorldBounds = true;
        balle.setVelocity(vx, vy);
    }

    update() {

        // ✅ MODIFICATION VITESSE : récupérer boost depuis HUD
        let vitesse = 160;
        this.game.events.emit('getBoostVitesse', (boost) => {
            if (boost) vitesse = boost;
        });

        this.doorNearby = null;
        if (this.groupe_portes) {
            this.groupe_portes.children.entries.forEach((door) => {
                const distance = Phaser.Math.Distance.Between(player.x, player.y, door.x, door.y);
                if (distance < 50 && door.estSolide) this.doorNearby = door;
            });
        }

        if (this.keyD.isDown) {
            player.setVelocityX(vitesse);
            player.setFlipX(false);
            if (this.isDude) player.anims.play('anim_tourne_droite', true);
            player.directionArme = 'droite';
        } else if (this.keyQ.isDown) {
            player.setVelocityX(-vitesse);
            player.setFlipX(false);
            if (this.isDude) player.anims.play('anim_tourne_gauche', true);
            player.directionArme = 'gauche';
        } else {
            player.setVelocityX(0);
            if (this.isDude) player.anims.play('anim_face');
        }

        if (this.keyZ.isDown) {
            player.setVelocityY(-vitesse);
            player.directionArme = 'haut';
        } else if (this.keyS.isDown) {
            player.setVelocityY(vitesse);
            player.directionArme = 'bas';
        } else {
            player.setVelocityY(0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.boutonFeu)) this.tirer();

        if (this.groupe_monstres) {
            this.groupe_monstres.children.entries.forEach((monstre) => {
                if (monstre.body.velocity.x > 0) monstre.setFlipX(false);
                else if (monstre.body.velocity.x < 0) monstre.setFlipX(true);
            });
        }

        if (player.armeEquipee) {
            switch (player.directionArme) {
                case 'droite': player.armeEquipee.anims.play('gun_droite', true); player.armeEquipee.setPosition(player.x + 30, player.y); break;
                case 'gauche': player.armeEquipee.anims.play('gun_gauche', true); player.armeEquipee.setPosition(player.x - 20, player.y); break;
                case 'haut': player.armeEquipee.anims.play('gun_haut', true); player.armeEquipee.setPosition(player.x, player.y - 30); break;
                case 'bas': player.armeEquipee.anims.play('gun_bas', true); player.armeEquipee.setPosition(player.x, player.y + 30); break;
            }
        }
    }
}