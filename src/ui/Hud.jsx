import { useState, useEffect } from 'react';
import { gameEvents, hudState } from '../systems/events.js';
import './Hud.css';

export default function Hud() {
    // Começa lendo o "quadro de avisos", então não perde nada se o jogo carregou antes
    const [hud, setHud] = useState({ ...hudState });

    useEffect(() => {
        const onUpdate = (data) => setHud(data);
        gameEvents.on('hud:update', onUpdate);
        setHud({ ...hudState }); // garante que pegou o estado mais recente

        return () => gameEvents.off('hud:update', onUpdate);
    }, []);

    // ♥♥♥♡♡
    const hearts = Array.from({ length: hud.maxHealth }, (_, i) =>
        i < hud.health ? '♥' : '♡'
    ).join(' ');

    // Sempre mostra todos os espaços da mochila, vazios ou não
    const slots = Array.from({ length: hud.capacity }, (_, i) => hud.slots[i] || null);

    const holding = hud.selected === -1 ? 'Punho' : hud.slots[hud.selected]?.name;

    return (
        <div className="hud">
            <div className="hud-hearts">{hearts}</div>

            <div className="hud-slots">
                {slots.map((slot, i) => (
                    <div
                        key={i}
                        className={`hud-slot ${i === hud.selected ? 'hud-slot-selected' : ''}`}
                    >
                        {slot && (
                            <>
                                <span className="hud-slot-name">{slot.name}</span>
                                <div className="hud-slot-bar">
                                    <div
                                        className="hud-slot-bar-fill"
                                        style={{ width: `${(slot.durability / slot.max) * 100}%` }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div className="hud-holding">Em mãos: {holding} &nbsp;[Q] trocar</div>
        </div>
    );
}