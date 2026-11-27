import Phaser from 'phaser';
import { WEAPONS } from '../data/weapons.js';

export default class Player extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.speed = 150;
        this.facing = 'down';
        this.canMove = true;

        this.maxHealth = 5;
        this.health = this.maxHealth;
        this.invulnTimer = 0;     // tempo de "imunidade" depois de levar dano
        this.knockbackTimer = 0;  // tempo sendo empurrada
        this.attackCooldown = 0;

        this.equip('faca');

        this.buildPlaceholder();

        scene.add.existing(this);
        this.setSize(16, 16);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);

        this.keys = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            interact: Phaser.Input.Keyboard.KeyCodes.E,
            attack: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    }

    buildPlaceholder() {
        const s = this.scene;
        this.add([
            s.add.rectangle(-6, 12, 7, 12, 0x302820),
            s.add.rectangle(6, 12, 7, 12, 0x302820),
            s.add.rectangle(0, 0, 19, 19, 0x66745a),
            s.add.rectangle(0, -15, 15, 14, 0xd9a77b),
            s.add.rectangle(0, -22, 17, 7, 0x30201b),
            s.add.rectangle(-4, -15, 2, 2, 0x171717),
            s.add.rectangle(4, -15, 2, 2, 0x171717)
        ]);
    }

    // ---------- Arma ----------
    equip(key) {
        this.weaponKey = key;
        this.weapon = WEAPONS[key];
        this.durability = this.weapon.durability;
    }

    // Gasta 1 de durabilidade. Se quebrar, devolve o nome da arma quebrada.
    consumeDurability() {
        this.durability--;

        if (this.durability <= 0) {
            const brokenName = this.weapon.name;
            this.equip('punho');
            return brokenName;
        }
        return null;
    }

    // ---------- Ataque ----------
    justPressedInteract() {
        return Phaser.Input.Keyboard.JustDown(this.keys.interact);
    }

    justPressedAttack() {
        return Phaser.Input.Keyboard.JustDown(this.keys.attack);
    }

    // Tenta atacar. Devolve a área do golpe, ou null se ainda está em cooldown.
    tryAttack() {
        if (this.attackCooldown > 0) return null;

        this.attackCooldown = this.weapon.cooldown;
        return this.getAttackArea();
    }

    // Retângulo na frente dela, do tamanho do alcance da arma
    getAttackArea() {
        const reach = this.weapon.range;
        const thick = 28; // largura do golpe
        const half = 8;   // metade do corpo dela

        switch (this.facing) {
            case 'left':
                return new Phaser.Geom.Rectangle(this.x - half - reach, this.y - thick / 2, reach, thick);
            case 'up':
                return new Phaser.Geom.Rectangle(this.x - thick / 2, this.y - half - reach, thick, reach);
            case 'down':
                return new Phaser.Geom.Rectangle(this.x - thick / 2, this.y + half, thick, reach);
            default: // right
                return new Phaser.Geom.Rectangle(this.x + half, this.y - thick / 2, reach, thick);
        }
    }

    // ---------- Vida ----------
    isDead() {
        return this.health <= 0;
    }

    // Devolve true se o dano foi aplicado
    takeDamage(amount, fromX, fromY) {
        if (this.invulnTimer > 0 || this.isDead()) return false;

        this.health -= amount;
        this.invulnTimer = 1000;

        if (this.isDead()) {
            this.knockbackTimer = 0;
            this.body.setVelocity(0, 0);
            return true;
        }

        // Empurrão pra longe do zumbi
        const dir = new Phaser.Math.Vector2(this.x - fromX, this.y - fromY).normalize();
        this.body.setVelocity(dir.x * 250, dir.y * 250);
        this.knockbackTimer = 150;
        return true;
    }

    // ---------- Update ----------
    update(delta) {
        this.invulnTimer = Math.max(0, this.invulnTimer - delta);
        this.attackCooldown = Math.max(0, this.attackCooldown - delta);

        // Pisca enquanto está imune
        const blinkOff = this.invulnTimer > 0 && Math.floor(this.invulnTimer / 100) % 2 === 0;
        this.setAlpha(blinkOff ? 0.3 : 1);

        // Sendo empurrada: não controla, a velocidade do golpe continua
        if (this.knockbackTimer > 0) {
            this.knockbackTimer -= delta;
            return;
        }

        if (!this.canMove) {
            this.body.setVelocity(0, 0);
            return;
        }

        let dx = 0;
        let dy = 0;

        if (this.keys.left.isDown) dx--;
        if (this.keys.right.isDown) dx++;
        if (this.keys.up.isDown) dy--;
        if (this.keys.down.isDown) dy++;

        if (dx < 0) this.facing = 'left';
        else if (dx > 0) this.facing = 'right';
        else if (dy < 0) this.facing = 'up';
        else if (dy > 0) this.facing = 'down';

        const velocity = new Phaser.Math.Vector2(dx, dy).normalize().scale(this.speed);
        this.body.setVelocity(velocity.x, velocity.y);
    }
}