import { WEAPONS } from '../data/weapons.js';
import { updateHud } from './events.js';

const MAX_SLOTS = 4;

export default class Inventory {
    constructor() {
        this.items = [];    // cada item: { key: 'faca', durability: 8 }
        this.selected = -1; // -1 = punho (sempre disponível, não ocupa espaço)
        this.emitChange();
    }

    // A arma que ela está segurando agora
    get currentWeapon() {
        if (this.selected === -1) return WEAPONS.punho;
        return WEAPONS[this.items[this.selected].key];
    }

    isFull() {
        return this.items.length >= MAX_SLOTS;
    }

    // Devolve true se coube na mochila
    add(weaponKey) {
        if (this.isFull()) return false;

        this.items.push({
            key: weaponKey,
            durability: WEAPONS[weaponKey].durability
        });

        // Se estava de punho, já segura a arma nova
        if (this.selected === -1) this.selected = this.items.length - 1;

        this.emitChange();
        return true;
    }

    // Passa pra próxima arma: faca → facão → ... → punho → volta
    cycle() {
        this.selected++;
        if (this.selected >= this.items.length) this.selected = -1;
        this.emitChange();
    }

    // Gasta 1 de durabilidade da arma em mãos.
    // Se quebrar, remove da mochila e devolve o nome dela.
    useWeapon() {
        if (this.selected === -1) return null; // punho não quebra

        const item = this.items[this.selected];
        item.durability--;

        if (item.durability <= 0) {
            const brokenName = WEAPONS[item.key].name;
            this.items.splice(this.selected, 1); // tira da mochila
            this.selected = -1;                  // volta pro punho
            this.emitChange();
            return brokenName;
        }

        this.emitChange();
        return null;
    }

    emitChange() {
        updateHud({
            slots: this.items.map(item => ({
                name: WEAPONS[item.key].name,
                durability: item.durability,
                max: WEAPONS[item.key].durability
            })),
            selected: this.selected,
            capacity: MAX_SLOTS
        });
    }
}