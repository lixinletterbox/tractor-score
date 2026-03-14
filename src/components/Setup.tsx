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
            levelHistory: [0] // Starts at '2'
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
                    <div className="logo-icon">🚜</div>
                    <h1>Tractor Score</h1>
                    <p>Start a new game for 4 to 10 players.</p>
                </header>

                <form className="form-group" onSubmit={handleAddPlayer}>
                    <label htmlFor="player-input">Add Player Name</label>
                    <div className="input-row">
                        <input
                            type="text"
                            id="player-input"
                            placeholder="Enter name and press Add"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">Add</button>
                    </div>
                </form>

                <div className="players-list">
                    {players.map(p => (
                        <div key={p.id} className="player-badge">
                            {p.name}
                            <button onClick={() => removePlayer(p.id)} type="button">&times;</button>
                        </div>
                    ))}
                </div>

                <div className="setup-actions">
                    <p className="status-msg" style={{ color: isValid ? 'var(--accent)' : 'var(--text-muted)' }}>
                        {isValid ? `${players.length} players added. Ready to start!` : `Need at least 4 players (${players.length}/10).`}
                    </p>
                    <button
                        className="btn btn-accent"
                        disabled={!isValid}
                        onClick={() => onStartGame(players)}
                    >
                        Start Game
                    </button>
                </div>
            </div>
        </div>
    );
};
