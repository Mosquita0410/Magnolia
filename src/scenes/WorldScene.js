import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Interactable from '../entities/Interactable.js';
import { gameEvents } from '../systems/events.js';

const WORLD_WIDTH = 1920;
const WORLD_HEIGHT = 1080;

export default class WorldScene extends Phaser.Scene {
    constructor() {
        super('WorldScene');
    }

    create() {
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.add.rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0x3d4a3a).setOrigin(0);

        this.obstacles = this.physics.add.staticGroup();
        this.interactables = [];

        // "Casa" (obstáculo)
        this.addObstacle(700, 300, 160, 120, 0x6b4a32);

        // Geladeira vazia: obstáculo + zona de interação um pouco maior
        this.addObstacle(1100, 600, 80, 80, 0x4a4a3a);
        this.addInteractable(1100, 600, 140, 140, {
            id: 'geladeira',
            lines: [
                'A geladeira está vazia.',
                'Nem uma latinha esquecida. Que maravilha.'
            ]
        });

        this.player = new Player(this, 480, 270);
        this.physics.add.collider(this.player, this.obstacles);

        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Caixinha de texto provisória (depois vira React)
        this.createDebugDialog();
        gameEvents.on('dialog', this.showDebugDialog, this);
    }

    addObstacle(x, y, width, height, color) {
        const rect = this.add.rectangle(x, y, width, height, color);
        this.obstacles.add(rect);
    }

    addInteractable(x, y, width, height, data) {
        this.interactables.push(new Interactable(this, x, y, width, height, data));
    }

    // Qual objeto está encostando na Magnólia agora?
    getNearbyInteractable() {
        return this.interactables.find(item =>
            this.physics.overlap(this.player, item.zone)
        );
    }

    update() {
        this.player.update();

        if (this.player.justPressedInteract()) {
            const target = this.getNearbyInteractable();
            if (target) {
                gameEvents.emit('dialog', target);
            }
        }
    }

    // ---- Provisório: será substituído pelo diálogo em React ----
    createDebugDialog() {
        this.dialogText = this.add.text(480, 500, '', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#000000cc',
            padding: { x: 12, y: 8 },
            wordWrap: { width: 800 }
        })
            .setOrigin(0.5)
            .setScrollFactor(0) // fica fixo na tela, não rola com o mapa
            .setDepth(100)
            .setVisible(false);
    }

    showDebugDialog(target) {
        console.log(`[${target.id}]`, target.lines);
        this.dialogText.setText(target.lines.join('\n')).setVisible(true);

        // Some depois de 3 segundos
        this.time.delayedCall(3000, () => this.dialogText.setVisible(false));
    }
}