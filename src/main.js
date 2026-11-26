import Phaser from 'phaser';
import WorldScene from './scenes/WorldScene.js';

new Phaser.Game({
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game',
    backgroundColor: '#303b32',
    pixelArt: true,
    roundPixels: true,
    physics: {
        default: 'arcade',
        arcade: { debug: true } // mostra as caixas de colisão; desligue no final
    },
    scene: [WorldScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
});