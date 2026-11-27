import { useState, useEffect } from 'react';
import { gameEvents } from '../systems/events.js';
import './DialogBox.css';

export default function DialogBox() {
    const [line, setLine] = useState(null);

    useEffect(() => {
        const onUpdate = (data) => setLine(data);
        const onClose = () => setLine(null);

        gameEvents.on('dialog:update', onUpdate);
        gameEvents.on('dialog:close', onClose);

        return () => {
            gameEvents.off('dialog:update', onUpdate);
            gameEvents.off('dialog:close', onClose);
        };
    }, []);

    if (!line) return null;

    // Parte já digitada e parte que ainda vai aparecer
    const typed = line.visibleText;
    const remaining = line.fullText.slice(typed.length);

    return (
        <div className="dialog-box">
            <p className="dialog-text">
                {typed}
                {/* Texto invisível que "reserva" o espaço: a caixa não fica
                    crescendo enquanto digita */}
                <span className="dialog-ghost">{remaining}</span>
            </p>

            {/* A dica só aparece quando a fala terminou de digitar */}
            <span className="dialog-hint">
                {line.isTyping ? '\u00A0' : line.isLast ? '[E] fechar' : '[E] ▼'}
            </span>
        </div>
    );
    
}

