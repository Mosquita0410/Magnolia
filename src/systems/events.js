import Phaser from 'phaser';

// Um "correio" global. O jogo envia mensagens, a interface escuta.
export const gameEvents = new Phaser.Events.EventEmitter();