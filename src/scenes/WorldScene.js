import Phaser from 'phaser';
import Player from '../entities/Player.js';

const WORLD_WIDTH = 1920;
const WORLD_HEIGHT = 1080;

export default class WorldScene extends Phaser.Scene {
    constructor() {
        super('WorldScene');
    }

    create() {
        // Limites do mundo (a física usa isso)
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

        // Chão provisório, só pra você ver a câmera andando
        this.add.rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0x3d4a3a).setOrigin(0);

        // Obstáculos de teste (depois viram objetos do Tiled)
        this.obstacles = this.physics.add.staticGroup();
        this.addObstacle(700, 300, 160, 120, 0x6b4a32); // "casa"
        this.addObstacle(1100, 600, 80, 80, 0x4a4a3a);  // "caixa"

        this.player = new Player(this, 480, 270);
        this.physics.add.collider(this.player, this.obstacles);

        // Câmera
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    addObstacle(x, y, width, height, color) {
        const rect = this.add.rectangle(x, y, width, height, color);
        this.obstacles.add(rect);
    }

    update() {
        this.player.update();
    }
}