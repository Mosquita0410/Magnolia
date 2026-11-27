import { gameEvents } from './events.js';

export default class DialogSystem {
    constructor() {
        this.lines = [];
        this.index = 0;
        this.active = false;
    }

    // Abre o diálogo com uma lista de falas
    open(lines) {
        this.lines = lines;
        this.index = 0;
        this.active = true;
        this.emitCurrent();
    }

    // Vai pra próxima fala; se acabou, fecha
    advance() {
        this.index++;

        if (this.index >= this.lines.length) {
            this.close();
            return;
        }
        this.emitCurrent();
    }

    close() {
        this.active = false;
        this.lines = [];
        gameEvents.emit('dialog:close');
    }

    // Avisa a interface qual fala mostrar
    emitCurrent() {
        gameEvents.emit('dialog:update', {
            text: this.lines[this.index],
            isLast: this.index === this.lines.length - 1
        });
    }
}