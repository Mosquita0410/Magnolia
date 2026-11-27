import { gameEvents } from './events.js';

const CHARS_PER_SECOND = 40; // velocidade da digitação (aumente = mais rápido)

export default class DialogSystem {
    constructor() {
        this.lines = [];
        this.index = 0;
        this.active = false;

        this.charCount = 0;  // quantas letras já apareceram
        this.elapsed = 0;    // tempo (ms) desde que a fala começou
        this.typing = false; // ainda está digitando?
    }

    get fullText() {
        return this.lines[this.index];
    }

    open(lines) {
        this.lines = lines;
        this.index = 0;
        this.active = true;
        this.startLine();
    }

    // Começa a digitar a fala atual do zero
    startLine() {
        this.charCount = 0;
        this.elapsed = 0;
        this.typing = true;
        this.emitCurrent();
    }

    // Chamado todo frame pela cena (delta = ms desde o último frame)
    update(delta) {
        if (!this.active || !this.typing) return;

        this.elapsed += delta;

        const target = Math.min(
            Math.floor((this.elapsed / 1000) * CHARS_PER_SECOND),
            this.fullText.length
        );

        // Só avisa a interface quando aparece letra nova
        if (target !== this.charCount) {
            this.charCount = target;
            if (this.charCount >= this.fullText.length) this.typing = false;
            this.emitCurrent();
        }
    }

    // Chamado quando o jogador aperta E durante um diálogo
    interact() {
        if (!this.active) return;

        if (this.typing) {
            // Completa a fala instantaneamente
            this.charCount = this.fullText.length;
            this.typing = false;
            this.emitCurrent();
        } else {
            this.advance();
        }
    }

    advance() {
        this.index++;

        if (this.index >= this.lines.length) {
            this.close();
            return;
        }
        this.startLine();
    }

    close() {
        this.active = false;
        this.typing = false;
        this.lines = [];
        gameEvents.emit('dialog:close');
    }

    emitCurrent() {
        gameEvents.emit('dialog:update', {
            visibleText: this.fullText.slice(0, this.charCount),
            fullText: this.fullText,
            isTyping: this.typing,
            isLast: this.index === this.lines.length - 1
        });
    }
}