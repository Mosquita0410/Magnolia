import { WEAPONS } from '../data/weapons.js';

// Cor provisória de cada arma no chão (depois viram sprites)
const COLORS = {
    garrafa: 0x6fa58a,
    faca: 0xb8bcc4,
    facao: 0xd0a85c
};

export default class WorldItem {
    constructor(scene, x, y, weaponKey) {
        this.weaponKey = weaponKey;
        this.name = WEAPONS[weaponKey].name;
        this.picked = false;

        // Visual: quadradinho com borda, pra destacar no chão
        this.sprite = scene.add.rectangle(x, y, 14, 14, COLORS[weaponKey])
            .setStrokeStyle(2, 0xf2e6d0);

        // Sobe e desce devagar, pra chamar atenção
        scene.tweens.add({
            targets: this.sprite,
            y: y - 4,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Zona de pegar (mesma ideia do Interactable)
        this.zone = scene.add.zone(x, y, 48, 48);
        scene.physics.add.existing(this.zone, true);
    }

    pickUp() {
        this.picked = true;
        this.sprite.destroy();
        this.zone.destroy();
    }
}