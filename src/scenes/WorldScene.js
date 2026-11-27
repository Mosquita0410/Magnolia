import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Zombie from '../entities/Zombie.js';
import Interactable from '../entities/Interactable.js';
import DialogSystem from '../systems/DialogSystem.js';

const WORLD_WIDTH = 1920;
const WORLD_HEIGHT = 1080;

export default class WorldScene extends Phaser.Scene {
    constructor() {
        super('WorldScene');
    }

    create() {
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.add.rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0x3d4a3a).setOrigin(0);

        this.dialog = new DialogSystem();
        this.obstacles = this.physics.add.staticGroup();
        this.interactables = [];
        this.zombies = [];
        this.gameOver = false;

        // "Casa"
        this.addObstacle(700, 300, 160, 120, 0x6b4a32);

        // Geladeira
        this.addObstacle(1100, 600, 80, 80, 0x4a4a3a);
        this.addInteractable(1100, 600, 140, 140, {
            id: 'geladeira',
            lines: [
                'A geladeira está vazia.',
                'Nem uma latinha esquecida. Que maravilha.',
                'Tá bom, vou ter que sair de casa. Que ódio.'
            ]
        });

        // Espelho
        this.addObstacle(400, 700, 60, 100, 0x5a6a7a);
        this.addInteractable(400, 700, 120, 160, {
            id: 'espelho',
            lines: ['Eu continuo igual. Só mais cansada.']
        });

        this.player = new Player(this, 480, 270);
        this.physics.add.collider(this.player, this.obstacles);

        // Zumbis de teste
        this.spawnZombie(1000, 400);
        this.spawnZombie(1500, 800);

        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.createHud();

        // PROVISÓRIO, só pra testar: troca de arma com 1, 2, 3 e 4
        this.input.keyboard.on('keydown-ONE', () => this.player.equip('garrafa'));
        this.input.keyboard.on('keydown-TWO', () => this.player.equip('faca'));
        this.input.keyboard.on('keydown-THREE', () => this.player.equip('facao'));
        this.input.keyboard.on('keydown-FOUR', () => this.player.equip('punho'));
    }

    addObstacle(x, y, width, height, color) {
        const rect = this.add.rectangle(x, y, width, height, color);
        this.obstacles.add(rect);
    }

    addInteractable(x, y, width, height, data) {
        this.interactables.push(new Interactable(this, x, y, width, height, data));
    }

    spawnZombie(x, y) {
        const zombie = new Zombie(this, x, y);

        this.physics.add.collider(zombie, this.obstacles);

        // Zumbis esbarram uns nos outros (senão viram uma pilha só)
        this.zombies.forEach(other => this.physics.add.collider(zombie, other));

        this.zombies.push(zombie);
        return zombie;
    }

    getNearbyInteractable() {
        return this.interactables.find(item =>
            this.physics.overlap(this.player, item.zone)
        );
    }

    // ---------- Combate ----------
    playerAttack() {
        const area = this.player.tryAttack();
        if (!area) return; // ainda em cooldown

        this.showSwing(area);

        const weapon = this.player.weapon;
        let hitSomething = false;

        for (const zombie of this.zombies) {
            if (zombie.mode === 'dead') continue;

            if (Phaser.Geom.Intersects.RectangleToRectangle(area, zombie.getHitRect())) {
                zombie.takeHit(weapon.damage, this.player.x, this.player.y, weapon.knockback);
                hitSomething = true;
            }
        }

        // Só gasta a arma se acertou alguém
        if (hitSomething) {
            const broken = this.player.consumeDurability();
            if (broken) this.showToast(`${broken} quebrou!`);
        }
    }

    // Clarão branco mostrando onde o golpe acertou (provisório)
    showSwing(area) {
        const swing = this.add.rectangle(area.centerX, area.centerY, area.width, area.height, 0xffffff, 0.4);
        this.time.delayedCall(100, () => swing.destroy());
    }

    checkZombieContact() {
        for (const zombie of this.zombies) {
            if (!zombie.isDangerous()) continue;

            if (this.physics.overlap(this.player, zombie)) {
                this.player.takeDamage(1, zombie.x, zombie.y);
            }
        }
    }

    triggerGameOver() {
        this.gameOver = true;

        this.add.text(480, 270, 'MAGNÓLIA CAIU.', {
            fontSize: '40px',
            color: '#c85a4a',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        this.time.delayedCall(2500, () => this.scene.restart());
    }

    // ---------- HUD provisório (depois vira React) ----------
    createHud() {
        this.hud = this.add.text(16, 12, '', {
            fontSize: '18px',
            color: '#e8c99b',
            backgroundColor: '#000000aa',
            padding: { x: 8, y: 4 }
        }).setScrollFactor(0).setDepth(100);

        this.toast = this.add.text(480, 60, '', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000000cc',
            padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setVisible(false);
    }

    updateHud() {
        const p = this.player;
        const durability = p.durability === Infinity ? '∞' : p.durability;
        this.hud.setText(`VIDA ${p.health}/${p.maxHealth}   ARMA: ${p.weapon.name} (${durability})`);
    }

    showToast(text) {
        this.toast.setText(text).setVisible(true);

        // Se já tinha um aviso na tela, cancela o timer antigo
        if (this.toastTimer) this.toastTimer.remove();
        this.toastTimer = this.time.delayedCall(1800, () => this.toast.setVisible(false));
    }

    // ---------- Loop principal ----------
    update(time, delta) {
        this.dialog.update(delta);

        const frozen = this.dialog.active || this.gameOver;
        this.player.canMove = !frozen;
        this.player.update(delta);

        // Lemos as duas teclas SEMPRE. Se não, um aperto durante o diálogo
        // ficaria "guardado" e viraria um ataque fantasma quando ele fechasse.
        const wantsInteract = this.player.justPressedInteract();
        const wantsAttack = this.player.justPressedAttack();

        if (!this.gameOver) {
            if (wantsInteract) {
                if (this.dialog.active) {
                    this.dialog.interact();
                } else {
                    const target = this.getNearbyInteractable();
                    if (target) this.dialog.open(target.lines);
                }
            } else if (wantsAttack && !this.dialog.active) {
                this.playerAttack();
            }
        }

        for (const zombie of this.zombies) {
            zombie.update(delta, this.player, frozen);
        }

        if (!frozen) this.checkZombieContact();

        if (this.player.isDead() && !this.gameOver) this.triggerGameOver();

        this.updateHud();
    }
}