import Phaser from 'phaser';

export default class Player extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.speed = 150;
        this.facing = 'down'; // vai servir pras animações depois

        this.buildPlaceholder();

        // Registra na cena e liga a física
        scene.add.existing(this);
        this.setSize(16, 16);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);

        this.keys = scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        interact: Phaser.Input.Keyboard.KeyCodes.E
});
    }

    // Quando os sprites ficarem prontos, só esse método muda
    buildPlaceholder() {
        const s = this.scene;
        this.add([
            s.add.rectangle(-6, 12, 7, 12, 0x302820),  // pernas
            s.add.rectangle(6, 12, 7, 12, 0x302820),
            s.add.rectangle(0, 0, 19, 19, 0x66745a),   // corpo
            s.add.rectangle(0, -15, 15, 14, 0xd9a77b), // cabeça
            s.add.rectangle(0, -22, 17, 7, 0x30201b),  // cabelo
            s.add.rectangle(-4, -15, 2, 2, 0x171717),  // olhos
            s.add.rectangle(4, -15, 2, 2, 0x171717)
        ]);
    }

    update() {
        let dx = 0;
        let dy = 0;

        if (this.keys.left.isDown) dx--;
        if (this.keys.right.isDown) dx++;
        if (this.keys.up.isDown) dy--;
        if (this.keys.down.isDown) dy++;

        // Guarda pra onde ela está olhando
        if (dx < 0) this.facing = 'left';
        else if (dx > 0) this.facing = 'right';
        else if (dy < 0) this.facing = 'up';
        else if (dy > 0) this.facing = 'down';

        // A física move; a gente só diz a velocidade
        const velocity = new Phaser.Math.Vector2(dx, dy).normalize().scale(this.speed);
        this.body.setVelocity(velocity.x, velocity.y);
    }
}