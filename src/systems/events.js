import Phaser from 'phaser';

// O "correio" entre Phaser e React
export const gameEvents = new Phaser.Events.EventEmitter();

// O "quadro de avisos": guarda o último estado do HUD.
// Assim, se o React carregar DEPOIS do jogo, ele lê o quadro e não perde nada.
export const hudState = {
    health: 0,
    maxHealth: 0,
    slots: [],
    selected: -1,
    capacity: 0
};

// Atualiza só o que mudou e avisa a interface
export function updateHud(partial) {
    Object.assign(hudState, partial);
    gameEvents.emit('hud:update', { ...hudState });
}