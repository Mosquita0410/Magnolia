import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Zombie from '../entities/Zombie.js';
import Interactable from '../entities/Interactable.js';
import WorldItem from '../entities/WorldItem.js';
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
        this.worldItems = [];
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

        // Armas espalhadas pelo mapa (a garrafa perto, o facão longe)
        this.addWorldItem(560, 330, 'garrafa');
        this.addWorldItem(900, 520, 'faca');
        this.addWorldItem(1600, 300, 'facao');
        this.addWorldItem(1250, 900, 'garrafa');

        this.player = new Player(this, 480, 270);
        this.physics.add.collider(this.player, this.obstacles);

        // Zumbis de teste
        this.spawnZombie(1000, 400);
        this.spawnZombie(1500, 800);

        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.createToast();
    }

    addObstacle(x, y, width, height, color) {
        const rect = this.add.rectangle(x, y, width, height, color);
        this.obstacles.add(rect);
    }

    addInteractable(x, y, width, height, data) {
        this.interactables.push(new Interactable(this, x, y, width, height, data));
    }

    addWorldItem(x, y, weaponKey) {
        this.worldItems.push(new WorldItem(this, x, y, weaponKey));
    }

    spawnZombie(x, y) {
        const zombie = new Zombie(this, x, y);

        this.physics.add.collider(zombie, this.obstacles);
        this.zombies.forEach(other => this.physics.add.collider(zombie, other));

        this.zombies.push(zombie);
        return zombie;
    }

    getNearbyInteractable() {
        return this.interactables.find(item =>
            this.physics.overlap(this.player, item.zone)
        );
    }

    getNearbyItem() {
        return this.worldItems.find(item =>
            !item.picked && this.physics.overlap(this.player, item.zone)
        );
    }

    // ---------- Interação (tecla E) ----------
    // Prioridade: pegar item do chão, depois examinar objetos
    handleInteract() {
        const item = this.getNearbyItem();
        if (item) {
            this.pickUpItem(item);
            return;
        }

        const target = this.getNearbyInteractable();
        if (target) this.dialog.open(target.lines);
    }

    pickUpItem(item) {
        const fitted = this.player.inventory.add(item.weaponKey);

        if (!fitted) {
            this.showToast('Mochila cheia.');
            return; // o item continua no chão
        }

        item.pickUp();
        this.showToast(`Pegou: ${item.name}`);
    }

    // ---------- Combate ----------
    playerAttack() {
        const area = this.player.tryAttack();
        if (!area) return;

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

        if (hitSomething) {
            const broken = this.player.inventory.useWeapon();
            if (broken) this.showToast(`${broken} quebrou!`);
        }
    }

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

    // ---------- Aviso rápido (o resto do HUD agora é React) ----------
    createToast() {
        this.toast = this.add.text(480, 60, '', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000000cc',
            padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setVisible(false);
    }

    showToast(text) {
        this.toast.setText(text).setVisible(true);

        if (this.toastTimer) this.toastTimer.remove();
        this.toastTimer = this.time.delayedCall(1800, () => this.toast.setVisible(false));
    }

    // ---------- Loop principal ----------
    update(time, delta) {
        this.dialog.update(delta);

        const frozen = this.dialog.active || this.gameOver;
        this.player.canMove = !frozen;
        this.player.update(delta);

        // Lê todas as teclas SEMPRE, pra nenhuma ficar "guardada" durante o diálogo
        const wantsInteract = this.player.justPressedInteract();
        const wantsAttack = this.player.justPressedAttack();
        const wantsSwitch = this.player.justPressedSwitch();

        if (!this.gameOver) {
            if (wantsInteract) {
                if (this.dialog.active) {
                    this.dialog.interact();
                } else {
                    this.handleInteract();
                }
            } else if (wantsAttack && !this.dialog.active) {
                this.playerAttack();
            } else if (wantsSwitch && !this.dialog.active) {
                this.player.inventory.cycle();
            }
        }

        for (const zombie of this.zombies) {
            zombie.update(delta, this.player, frozen);
        }

        if (!frozen) this.checkZombieContact();

        if (this.player.isDead() && !this.gameOver) this.triggerGameOver();
    }
}