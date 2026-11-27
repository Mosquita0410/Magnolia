import Phaser from 'phaser';

export default class Interactable {
    // x, y = centro do objeto | width, height = tamanho da zona de interação
    constructor(scene, x, y, width, height, data) {
        this.id = data.id;
        this.lines = data.lines; // lista de falas

        // Zona invisível (só detecta, não bloqueia)
        this.zone = scene.add.zone(x, y, width, height);
        scene.physics.add.existing(this.zone, true); // true = estático
    }
}