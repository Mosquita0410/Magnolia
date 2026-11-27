import { useState, useEffect } from 'react';
import { gameEvents } from '../systems/events.js';
import './DialogBox.css';

export default function DialogBox() {
    // null = caixa fechada | objeto = caixa aberta com aquela fala
    const [line, setLine] = useState(null);

    useEffect(() => {
        const onUpdate = (data) => setLine(data);
        const onClose = () => setLine(null);

        gameEvents.on('dialog:update', onUpdate);
        gameEvents.on('dialog:close', onClose);

        // Limpeza: para de escutar quando o componente sair
        return () => {
            gameEvents.off('dialog:update', onUpdate);
            gameEvents.off('dialog:close', onClose);
        };
    }, []);

    if (!line) return null;

    return (
        <div className="dialog-box">
            <p className="dialog-text">{line.text}</p>
            <span className="dialog-hint">{line.isLast ? '[E] fechar' : '[E] ▼'}</span>
        </div>
    );
}