import React, { useState } from 'react';
import type { Player } from '../types';
import { indexToScore, scoreToIndex } from '../logic/scoring';
import { exportStandingsToPDF } from '../utils/pdfExport';

interface DashboardProps {
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}

export const Dashboard: React.FC<DashboardProps> = ({ players, setPlayers }) => {
    // Round form state
    const [declarerId, setDeclarerId] = useState('');
    const [teamIds, setTeamIds] = useState<string[]>([]);
    const [calledCards, setCalledCards] = useState('');
    const [winner, setWinner] = useState<'declarer' | 'offense' | 'surrender'>('declarer');
    const [levelsWon, setLevelsWon] = useState('1');
    const [penalty, setPenalty] = useState<'none' | 'backTo2' | 'minus2' | 'minus4'>('none');

    const movePlayer = (index: number, direction: number) => {
        const newPlayers = [...players];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newPlayers.length) return;

        const temp = newPlayers[index];
        newPlayers[index] = newPlayers[targetIndex];
        newPlayers[targetIndex] = temp;
        setPlayers(newPlayers);
    };

    // Edit modal state
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [editLevelInput, setEditLevelInput] = useState('');

    const handlePlayerClick = (id: string) => {
        if (declarerId === id) {
            setDeclarerId('');
        } else if (teamIds.includes(id)) {
            setTeamIds(teamIds.filter(tid => tid !== id));
        } else {
            if (!declarerId) {
                setDeclarerId(id);
            } else {
                const maxExtra = Math.floor(players.length / 2) - 1;
                if (teamIds.length < maxExtra) {
                    setTeamIds([...teamIds, id]);
                }
            }
        }
    };

    const handleRecordRound = (e: React.FormEvent) => {
        e.preventDefault();
        if (!declarerId) {
            alert("Please select a declarer");
            return;
        }

        const declarer = players.find(p => p.id === declarerId);
        const declarerLastScore = declarer ? declarer.levelHistory[declarer.levelHistory.length - 1] ?? 0 : 0;
        const isDeclarerJA = (declarerLastScore % 13 === 9) || (declarerLastScore % 13 === 12);

        let declarerTeam = [declarerId, ...teamIds.filter(id => id !== declarerId)];
        if (winner === 'surrender') {
            declarerTeam = [declarerId]; // Only the declarer suffers the surrender penalty
        }

        const wonCount = parseInt(levelsWon, 10);

        setPlayers(prev => prev.map(p => {
            const lastScore = p.levelHistory[p.levelHistory.length - 1] ?? 0;

            if (winner === 'surrender') {
                if (p.id === declarerId) {
                    return { ...p, levelHistory: [...p.levelHistory, Math.max(0, lastScore - 1)] };
                } else {
                    return { ...p, levelHistory: [...p.levelHistory, lastScore + 1] };
                }
            } else if (winner === 'declarer') {
                if (declarerTeam.includes(p.id)) {
                    return { ...p, levelHistory: [...p.levelHistory, lastScore + wonCount] };
                }
                return { ...p, levelHistory: [...p.levelHistory, lastScore] };
            } else {
                // Offense won
                if (!declarerTeam.includes(p.id)) {
                    return { ...p, levelHistory: [...p.levelHistory, lastScore + wonCount] };
                } else {
                    let newScore = lastScore;
                    if (isDeclarerJA) {
                        if (penalty === 'backTo2') {
                            newScore = Math.floor(lastScore / 13) * 13;
                        } else if (penalty === 'minus2') {
                            newScore = Math.max(0, lastScore - 2);
                        } else if (penalty === 'minus4') {
                            newScore = Math.max(0, lastScore - 4);
                        }
                    }
                    return { ...p, levelHistory: [...p.levelHistory, newScore] };
                }
            }
        }));

        // Reset form
        setDeclarerId('');
        setTeamIds([]);
        setCalledCards('');
        setLevelsWon('1');
        setWinner('declarer');
        setPenalty('none');
    };

    const openEditModal = (player: Player) => {
        setEditingPlayer(player);
        const lastScore = player.levelHistory[player.levelHistory.length - 1];
        setEditLevelInput(indexToScore(lastScore));
    };

    const handleSaveEdit = () => {
        if (!editingPlayer) return;

        const newIdx = scoreToIndex(editLevelInput);
        if (newIdx === null) {
            alert("Invalid score format! Use base levels like '2', '10', 'J', 'A', and asterisks like '2*', 'K**'");
            return;
        }

        setPlayers(prev => prev.map(p => {
            if (p.id === editingPlayer.id) {
                const newHistory = [...p.levelHistory];
                newHistory[newHistory.length - 1] = newIdx;
                return { ...p, levelHistory: newHistory };
            }
            return p;
        }));
        setEditingPlayer(null);
    };

    return (
        <div className="animate-fade-in">
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="logo-icon mini">🚜</div>
                    <h2>Tractor Score</h2>
                </div>
                <div className="header-right">
                    <button onClick={() => exportStandingsToPDF(players)} className="btn btn-outline">
                        📥 Export PDF
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                <div className="glass-card table-card">
                    <div className="card-header">
                        <h3>Current Standings</h3>
                    </div>
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Game</th>
                                    {players.map((p, i) => (
                                        <th key={p.id}>
                                            <div className="player-th">
                                                {i > 0 ? <button type="button" onClick={() => movePlayer(i, -1)} className="move-btn" title="Move Left">◀</button> : <span style={{ width: 14 }}></span>}
                                                <span>{p.name}</span>
                                                {i < players.length - 1 ? <button type="button" onClick={() => movePlayer(i, 1)} className="move-btn" title="Move Right">▶</button> : <span style={{ width: 14 }}></span>}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: Math.max(0, ...players.map(p => p.levelHistory.length)) }).map((_, gIndex, arr) => {
                                    const isLastRow = gIndex === arr.length - 1;
                                    return (
                                        <tr key={gIndex}>
                                            <td><strong>{gIndex === 0 ? "Start" : gIndex}</strong></td>
                                            {players.map(p => {
                                                const isDeclarer = p.id === declarerId;
                                                const isTeammate = teamIds.includes(p.id);
                                                let badgeClass = "level-badge";
                                                if (isLastRow) badgeClass += " clickable";
                                                if (isLastRow && isDeclarer) badgeClass += " declarer";
                                                if (isLastRow && isTeammate) badgeClass += " teammate";

                                                return (
                                                    <td key={`${p.id}-${gIndex}`}>
                                                        <span className="score-cell">
                                                            <span 
                                                                className={badgeClass}
                                                                onClick={() => isLastRow ? handlePlayerClick(p.id) : undefined}
                                                                title={isLastRow ? "Click to set Declarer/Teammate" : ""}
                                                            >
                                                                {p.levelHistory[gIndex] !== undefined ? indexToScore(p.levelHistory[gIndex]) : '-'}
                                                            </span>
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                                <tr>
                                    <td><strong>Actions</strong></td>
                                    {players.map(p => (
                                        <td key={`action-${p.id}`}>
                                            <button
                                                className="btn btn-outline btn-danger"
                                                onClick={() => openEditModal(p)}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="glass-card round-card">
                    <div className="card-header">
                        <h3>Record Round Result</h3>
                    </div>

                    <form onSubmit={handleRecordRound}>
                        <div className="form-group info-box" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}>
                                <strong>Declarer:</strong>{' '}
                                {declarerId ? (
                                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{players.find(p => p.id === declarerId)?.name}</span>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Click a player's latest score in the table above</span>
                                )}
                            </p>
                            <p style={{ margin: 0 }}>
                                <strong>Team (Max {Math.floor(players.length / 2) - 1}):</strong>{' '}
                                {teamIds.length > 0 ? (
                                    <span style={{ color: '#fca5a5', fontWeight: 'bold' }}>{teamIds.map(id => players.find(p => p.id === id)?.name).join(', ')}</span>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>None selected</span>
                                )}
                            </p>
                            <small className="help-text" style={{ display: 'block', marginTop: '0.75rem' }}>Click the latest scores in Game Standings to select. Red = Declarer, Light Red = Team.</small>
                        </div>

                        <div className="form-group">
                            <label>Cards Called by Declarer (optional)</label>
                            <input
                                type="text"
                                value={calledCards}
                                onChange={(e) => setCalledCards(e.target.value)}
                                placeholder="e.g. Ace of Spades, King of Hearts"
                            />
                        </div>

                        <div className="form-group">
                            <label>Who won the round?</label>
                            <select value={winner} onChange={(e) => setWinner(e.target.value as any)} required>
                                <option value="declarer">Declarer</option>
                                <option value="offense">Offense</option>
                                <option value="surrender">Surrender</option>
                            </select>
                        </div>

                        {winner !== 'surrender' && (
                            <div className="form-group">
                                <label>Levels Won by {winner === 'declarer' ? "Declarer" : "Offense"}</label>
                                <select value={levelsWon} onChange={(e) => setLevelsWon(e.target.value)} required>
                                    <option value="0">0 Levels (Change Declarer only)</option>
                                    <option value="1">1 Level</option>
                                    <option value="2">2 Levels</option>
                                    <option value="3">3 Levels</option>
                                </select>
                                <small className="help-text">Select how many levels to advance.</small>
                            </div>
                        )}

                        {winner === 'offense' && declarerId && (() => {
                            const declarer = players.find(p => p.id === declarerId);
                            if (!declarer) return null;
                            const scoreIdx = declarer.levelHistory[declarer.levelHistory.length - 1] ?? 0;
                            const isJA = (scoreIdx % 13 === 9) || (scoreIdx % 13 === 12);
                            if (!isJA) return null;

                            return (
                                <div className="form-group">
                                    <label>Penalty for Declarer Team (Lost on {indexToScore(scoreIdx).replace(/\*/g, '')})</label>
                                    <select value={penalty} onChange={e => setPenalty(e.target.value as any)}>
                                        <option value="none">No Penalty (Stay on {indexToScore(scoreIdx)})</option>
                                        <option value="backTo2">Drop to base 2</option>
                                        <option value="minus2">Decrease by 2 levels</option>
                                        <option value="minus4">Decrease by 4 levels</option>
                                    </select>
                                    <small className="help-text">Special penalty rule for losing on J or A.</small>
                                </div>
                            );
                        })()}

                        <button type="submit" className="btn btn-primary w-full mt-4">Record & Update Scores</button>
                    </form>
                </div>
            </main>

            {/* Edit Modal */}
            {editingPlayer && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content">
                        <h3>Edit Score for <span>{editingPlayer.name}</span></h3>
                        <div className="form-group">
                            <label>New Level (e.g. 2, 8, J, A, 3*)</label>
                            <input
                                type="text"
                                value={editLevelInput}
                                onChange={(e) => setEditLevelInput(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="modal-actions">
                            <button type="button" onClick={() => setEditingPlayer(null)} className="btn btn-outline">Cancel</button>
                            <button type="button" onClick={handleSaveEdit} className="btn btn-primary">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
