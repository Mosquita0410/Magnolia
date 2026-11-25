
import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    create() {
        // Título
        this.add.text(480, 65, 'MAGNÓLIA', {
            fontSize: '48px',
            color: '#e8c99b',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(480, 110, 'Nosso mundo começa aqui.', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Criando a personagem provisória
        this.player = this.add.container(480, 270);

        // Configurando a câmera para acompanhar a personagem
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, 1920, 1080);

        // Pernas
        this.player.add([
            this.add.rectangle(-6, 12, 7, 12, 0x302820),
            this.add.rectangle(6, 12, 7, 12, 0x302820)
        ]);

        // Corpo
        this.player.add(
            this.add.rectangle(0, 0, 19, 19, 0x66745a)
        );

        // Cabeça
        this.player.add(
            this.add.rectangle(0, -15, 15, 14, 0xd9a77b)
        );

        // Cabelo
        this.player.add(
            this.add.rectangle(0, -22, 17, 7, 0x30201b)
        );

        // Olhos
        this.player.add([
            this.add.rectangle(-4, -15, 2, 2, 0x171717),
            this.add.rectangle(4, -15, 2, 2, 0x171717)
        ]);

        // Controles WASD
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Velocidade da personagem
        this.speed = 150;

        // Instruções
        this.add.text(480, 490, 'W A S D  -  MOVIMENTAR', {
            fontSize: '17px',
            color: '#e8c99b'
        }).setOrigin(0.5);
    }

    update(time, delta) {
        let directionX = 0;
        let directionY = 0;

        if (this.keys.left.isDown) directionX--;
        if (this.keys.right.isDown) directionX++;
        if (this.keys.up.isDown) directionY--;
        if (this.keys.down.isDown) directionY++;

        // Impede que a diagonal seja mais rápida
        const length = Math.hypot(directionX, directionY);

        if (length > 0) {
            directionX /= length;
            directionY /= length;
        }

        // Movimenta a personagem
        this.player.x += directionX * this.speed * delta / 1000;
        this.player.y += directionY * this.speed * delta / 1000;

        // Impede que ela saia da tela
        this.player.x = Phaser.Math.Clamp(this.player.x, 12, 948);
        this.player.y = Phaser.Math.Clamp(this.player.y, 145, 528);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game',
    backgroundColor: '#303b32',
    pixelArt: true,
    roundPixels: true,
    scene: [MainScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

new Phaser.Game(config);
