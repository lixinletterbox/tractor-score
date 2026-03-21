import React, { useState } from 'react';
import type { Player } from '../types';

interface SetupProps {
    onStartGame: (players: Player[]) => void;
}

export const Setup: React.FC<SetupProps> = ({ onStartGame }) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [inputValue, setInputValue] = useState('');

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        const name = inputValue.trim();
        if (!name) return;
        if (players.length >= 10) {
            alert("Maximum 10 players allowed!");
            return;
        }
        if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            alert("Player already exists!");
            return;
        }

        setPlayers([...players, {
            id: Date.now().toString() + Math.random().toString(),
            name,
            levelHistory: [0], // Starts at '2'
            roundRoles: [],
        }]);
        setInputValue('');
    };

    const removePlayer = (id: string) => {
        setPlayers(players.filter(p => p.id !== id));
    };

    const isValid = players.length >= 4 && players.length <= 10;

    return (
        <div className="animate-fade-in">
            <div className="glass-card setup-card">
                <header className="app-header">
                    <div className="logo-icon" role="img" aria-label="Tractor">🚜</div>
                    <h1>Tractor Score</h1>
                    <p>Start a new game for 4 to 10 players.</p>
                </header>

                <form className="form-group" onSubmit={handleAddPlayer}>
                    <label htmlFor="player-input">Add Player Name</label>
                    <div className="input-row">
                        <input
                            type="text"
                            id="player-input"
                            placeholder="Enter name (e.g. Alice)"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            autoComplete="off"
                        />
                        <button type="submit" className="btn btn-primary">
                            Add <span style={{ fontSize: '1.2em', lineHeight: 1 }}>+</span>
                        </button>
                    </div>
                </form>

                <div className="players-list">
                    {players.map(p => (
                        <div key={p.id} className="player-badge">
                            <span className="badge-initial" style={{
                                width: '26px', height: '26px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)',
                                fontWeight: 'bold', fontSize: '0.85rem'
                            }}>
                                {p.name.charAt(0).toUpperCase()}
                            </span>
                            {p.name}
                            <button onClick={() => removePlayer(p.id)} type="button" title="Remove player">&times;</button>
                        </div>
                    ))}
                    {players.length === 0 && (
                        <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: '1rem 0', gridColumn: '1 / -1' }}>
                            No players added yet. Add at least 4 to begin.
                        </div>
                    )}
                </div>

                <div className="setup-actions">
                    <p className="status-msg" style={{ color: isValid ? 'var(--accent)' : 'var(--text-muted)' }}>
                        {isValid ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>✓</span> {players.length} players ready
                            </span>
                        ) : (
                            `${players.length}/10 players added. Need at least 4.`
                        )}
                    </p>
                    <button
                        className="btn btn-accent"
                        disabled={!isValid}
                        onClick={() => onStartGame(players)}
                    >
                        Start Game <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
