import { useState, useEffect } from 'react';
import { gameEvents, hudState } from '../systems/events.js';
import './Hud.css';

// Desenho do coração: 1 = pixel pintado, 0 = vazio (7 colunas x 6 linhas)
const HEART = [
    '0110110',
    '1111111',
    '1111111',
    '0111110',
    '0011100',
    '0001000'
];

function Heart({ full }) {
    return (
        <svg className="hud-heart" viewBox="0 0 7 6" shapeRendering="crispEdges">
            {HEART.map((row, y) =>
                [...row].map((cell, x) =>
                    cell === '1' && (
                        <rect
                            key={`${x}-${y}`}
                            x={x}
                            y={y}
                            width="1"
                            height="1"
                            fill={full ? '#c85a4a' : '#3a2e22'}
                        />
                    )
                )
            )}
        </svg>
    );
}

export default function Hud() {
    const [hud, setHud] = useState({ ...hudState });

    useEffect(() => {
        const onUpdate = (data) => setHud(data);
        gameEvents.on('hud:update', onUpdate);
        setHud({ ...hudState });

        return () => gameEvents.off('hud:update', onUpdate);
    }, []);

    const slots = Array.from({ length: hud.capacity }, (_, i) => hud.slots[i] || null);
    const holding = hud.selected === -1 ? 'Punho' : hud.slots[hud.selected]?.name;

    return (
        <div className="hud">
            <div className="hud-hearts">
                {Array.from({ length: hud.maxHealth }, (_, i) => (
                    <Heart key={i} full={i < hud.health} />
                ))}
            </div>

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

            <div className="hud-holding">Em maos: {holding} [Q]</div>
        </div>
    );
}