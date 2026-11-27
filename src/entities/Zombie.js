import Phaser from 'phaser';

export default class Zombie extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.maxHealth = 8;
        this.health = this.maxHealth;

        this.speed = 60;            // perseguindo (a Magnólia anda a 150)
        this.wanderSpeed = 30;      // vagando
        this.sightRange = 220;      // distância em que ele "percebe" ela
        this.loseRange = 340;       // distância em que ele desiste

        // Modos: 'wander' (vaga), 'chase' (persegue), 'dead'
        // (não uso o nome "state" porque o Phaser já usa essa palavra)
        this.mode = 'wander';
        this.wanderTimer = 0;
        this.wanderDir = new Phaser.Math.Vector2(0, 0);
        this.stunTimer = 0;         // > 0 = atordoado (levou golpe)

        this.buildPlaceholder();

        scene.add.existing(this);
        this.setSize(16, 16);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);
    }

    buildPlaceholder() {
        const s = this.scene;
        this.add([
            s.add.rectangle(-6, 12, 7, 12, 0x2a2a22),   // pernas
            s.add.rectangle(6, 12, 7, 12, 0x2a2a22),
            s.add.rectangle(0, 0, 19, 19, 0x5b6b4a),    // corpo
            s.add.rectangle(0, -15, 15, 14, 0x8a9a7a),  // cabeça (pálida)
            s.add.rectangle(-4, -15, 3, 3, 0x7a1f1f),   // olhos vermelhos
            s.add.rectangle(4, -15, 3, 3, 0x7a1f1f)
        ]);
    }

    // player = quem ele persegue | frozen = true durante diálogos
    update(delta, player, frozen) {
        if (this.mode === 'dead') return;

        if (frozen) {
            this.body.setVelocity(0, 0);
            return;
        }

        // Atordoado: o empurrão do golpe continua até o tempo acabar
        if (this.stunTimer > 0) {
            this.stunTimer -= delta;
            if (this.stunTimer <= 0) {
                this.setAlpha(1);
                this.mode = 'chase'; // levou golpe, então ele sabe onde ela está
            }
            return;
        }

        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        const playerAlive = !player.isDead();

        // Dois alcances diferentes (ver até 220, desistir só depois de 340)
        // evitam que ele fique "piscando" entre perseguir e vagar na borda.
        if (this.mode === 'wander' && playerAlive && distance < this.sightRange) {
            this.mode = 'chase';
        } else if (this.mode === 'chase' && (!playerAlive || distance > this.loseRange)) {
            this.mode = 'wander';
        }

        if (this.mode === 'chase') {
            this.moveToward(player.x, player.y);
        } else {
            this.wander(delta);
        }
    }

    moveToward(targetX, targetY) {
        const dir = new Phaser.Math.Vector2(targetX - this.x, targetY - this.y).normalize();
        this.body.setVelocity(dir.x * this.speed, dir.y * this.speed);
    }

    wander(delta) {
        this.wanderTimer -= delta;

        if (this.wanderTimer <= 0) {
            this.wanderTimer = Phaser.Math.Between(1000, 3000);

            // 50% de chance de ficar parado, 50% de andar numa direção aleatória
            if (Math.random() < 0.5) {
                this.wanderDir.set(0, 0);
            } else {
                const angle = Math.random() * Math.PI * 2;
                this.wanderDir.set(Math.cos(angle), Math.sin(angle));
            }
        }

        this.body.setVelocity(
            this.wanderDir.x * this.wanderSpeed,
            this.wanderDir.y * this.wanderSpeed
        );
    }

    // Pode machucar a Magnólia agora?
    isDangerous() {
        return this.mode !== 'dead' && this.stunTimer <= 0;
    }

    // Retângulo do corpo, usado pra checar se o golpe acertou
    getHitRect() {
        return new Phaser.Geom.Rectangle(
            this.body.x, this.body.y, this.body.width, this.body.height
        );
    }

    takeHit(damage, fromX, fromY, knockback) {
        if (this.mode === 'dead') return;

        this.health -= damage;

        if (this.health <= 0) {
            this.die();
            return;
        }

        // Empurra pra longe de quem bateu e atordoa por um instante
        const dir = new Phaser.Math.Vector2(this.x - fromX, this.y - fromY).normalize();
        this.body.setVelocity(dir.x * knockback, dir.y * knockback);
        this.stunTimer = 250;
        this.setAlpha(0.5); // "piscada" de dano
    }

    die() {
        this.mode = 'dead';
        this.body.setVelocity(0, 0);
        this.body.enable = false; // para de colidir

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 500,
            onComplete: () => this.setActive(false).setVisible(false)
        });
    }
}