import Phaser from 'phaser';
import Player from '../entities/Player.js';
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

        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    addObstacle(x, y, width, height, color) {
        const rect = this.add.rectangle(x, y, width, height, color);
        this.obstacles.add(rect);
    }

    addInteractable(x, y, width, height, data) {
        this.interactables.push(new Interactable(this, x, y, width, height, data));
    }

    getNearbyInteractable() {
        return this.interactables.find(item =>
            this.physics.overlap(this.player, item.zone)
        );
    }

    update(time, delta) {
    // O sistema de diálogo precisa do tempo pra digitar as letras
    this.dialog.update(delta);

    this.player.canMove = !this.dialog.active;
    this.player.update();

    if (this.player.justPressedInteract()) {
        if (this.dialog.active) {
            this.dialog.interact(); // completa a fala OU avança
        } else {
            const target = this.getNearbyInteractable();
            if (target) this.dialog.open(target.lines);
        }
    }
}
}