import React, { useState } from 'react';
import type { Player } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface SetupProps {
    onStartGame: (players: Player[]) => void;
}

export const Setup: React.FC<SetupProps> = ({ onStartGame }) => {
    const { language, setLanguage, t } = useTranslation();
    const [players, setPlayers] = useState<Player[]>([]);
    const [inputValue, setInputValue] = useState('');

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        const name = inputValue.trim();
        if (!name) return;
        if (players.length >= 10) {
            alert(t('setup.maxPlayers'));
            return;
        }
        if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            alert(t('setup.playerExists'));
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
                    <div className="language-switcher">
                        <button
                            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                            onClick={() => setLanguage('en')}
                            type="button"
                        >
                            English
                        </button>
                        <button
                            className={`lang-btn ${language === 'zh' ? 'active' : ''}`}
                            onClick={() => setLanguage('zh')}
                            type="button"
                        >
                            中文
                        </button>
                    </div>
                    <div className="logo-icon" role="img" aria-label="Tractor">🚜</div>
                    <h1>{t('setup.title')}</h1>
                    <p>{t('setup.subtitle')}</p>
                </header>

                <form className="form-group" onSubmit={handleAddPlayer}>
                    <label htmlFor="player-input">{t('setup.addPlayerLabel')}</label>
                    <div className="input-row">
                        <input
                            type="text"
                            id="player-input"
                            placeholder={t('setup.placeholder')}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            autoComplete="off"
                        />
                        <button type="submit" className="btn btn-primary">
                            {t('setup.addBtn')} <span style={{ fontSize: '1.2em', lineHeight: 1 }}>+</span>
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
                            {t('setup.noPlayers')}
                        </div>
                    )}
                </div>

                <div className="setup-actions">
                    <p className="status-msg" style={{ color: isValid ? 'var(--accent)' : 'var(--text-muted)' }}>
                        {isValid ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>✓</span> {t('setup.playersReady', { count: players.length })}
                            </span>
                        ) : (
                            t('setup.playersCount', { count: players.length })
                        )}
                    </p>
                    <button
                        className="btn btn-accent"
                        disabled={!isValid}
                        onClick={() => onStartGame(players)}
                    >
                        {t('setup.startGame')} <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
