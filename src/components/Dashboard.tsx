import React, { useState } from 'react';
import type { Player } from '../types';
import { indexToScore, scoreToIndex } from '../logic/scoring';
import { exportStandingsToPDF } from '../utils/pdfExport';
import { useTranslation } from '../i18n/LanguageContext';
import { SEOFooter } from './SEOFooter';

interface DashboardProps {
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    onEndGame: () => void;
    onOpenContact: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ players, setPlayers, onEndGame, onOpenContact }) => {
    const { t } = useTranslation();
    const [declarerId, setDeclarerId] = useState('');
    const [teamIds, setTeamIds] = useState<string[]>([]);
    const [calledCards, setCalledCards] = useState('');
    const [winner, setWinner] = useState<'declarer' | 'offense' | 'surrender'>('declarer');
    const [levelsWon, setLevelsWon] = useState('1');
    const [penalty, setPenalty] = useState<'none' | 'backTo2' | 'minus2' | 'minus4'>('none');

    const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [actionMenuPlayer, setActionMenuPlayer] = useState<Player | null>(null);
    const [dropdownRect, setDropdownRect] = useState<{ top?: number, bottom?: number, left: number, width: number } | null>(null);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [editLevelInput, setEditLevelInput] = useState('');
    const [isGameEnded, setIsGameEnded] = useState(false);
    const [isEndGameModalOpen, setIsEndGameModalOpen] = useState(false);

    const activePlayers = players.filter(p => p.status !== 'quit' && p.status !== 'suspended');

    const movePlayer = (id: string, direction: number) => {
        const index = players.findIndex(p => p.id === id);
        if (index === -1) return;
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= players.length) return;

        setPlayers(prev => {
            const newPlayers = [...prev];
            const temp = newPlayers[index];
            newPlayers[index] = newPlayers[targetIndex];
            newPlayers[targetIndex] = temp;
            return newPlayers;
        });
        setOpenDropdownId(null);
    };

    const handlePlayerClick = (id: string) => {
        const p = players.find(x => x.id === id);
        if (p?.status === 'quit' || p?.status === 'suspended') return;

        if (declarerId === id) {
            setDeclarerId('');
        } else if (teamIds.includes(id)) {
            setTeamIds(teamIds.filter(tid => tid !== id));
        } else {
            if (!declarerId) {
                setDeclarerId(id);
            } else {
                const maxExtra = Math.floor(activePlayers.length / 2) - 1;
                if (teamIds.length < maxExtra) {
                    setTeamIds([...teamIds, id]);
                }
            }
        }
    };

    const getLastScore = (player: Player) => {
        for (let i = player.levelHistory.length - 1; i >= 0; i--) {
            if (player.levelHistory[i] !== undefined) return player.levelHistory[i]!;
        }
        return 0; // fallback base level 2 index
    };

    const handleRecordRound = (e: React.FormEvent) => {
        e.preventDefault();
        if (!declarerId) {
            alert(t('round.alertNoDeclarer'));
            return;
        }

        const declarer = players.find(p => p.id === declarerId);
        const declarerLastScore = declarer ? getLastScore(declarer) : 0;
        const isDeclarerJA = (declarerLastScore % 13 === 9) || (declarerLastScore % 13 === 12);

        let declarerTeam = [declarerId, ...teamIds.filter(id => id !== declarerId)];
        if (winner === 'surrender') {
            declarerTeam = [declarerId];
        }

        const wonCount = parseInt(levelsWon, 10);

        setPlayers(prev => prev.map(p => {
            const lastScore = getLastScore(p);

            const role = p.status === 'quit' ? 'none' :
                p.status === 'suspended' ? 'sitting_out' :
                    p.id === declarerId ? 'declarer' :
                        teamIds.includes(p.id) ? 'teammate' : 'none';

            if (p.status === 'quit' || p.status === 'suspended') {
                return { ...p, levelHistory: [...p.levelHistory, undefined], roundRoles: [...(p.roundRoles ?? []), role as any] };
            }

            if (winner === 'surrender') {
                if (p.id === declarerId) {
                    return { ...p, levelHistory: [...p.levelHistory, Math.max(0, lastScore - 1)], roundRoles: [...(p.roundRoles ?? []), role as any] };
                } else {
                    return { ...p, levelHistory: [...p.levelHistory, lastScore + 1], roundRoles: [...(p.roundRoles ?? []), role as any] };
                }
            } else if (winner === 'declarer') {
                if (declarerTeam.includes(p.id)) {
                    return { ...p, levelHistory: [...p.levelHistory, lastScore + wonCount], roundRoles: [...(p.roundRoles ?? []), role as any] };
                }
                return { ...p, levelHistory: [...p.levelHistory, lastScore], roundRoles: [...(p.roundRoles ?? []), role as any] };
            } else {
                if (!declarerTeam.includes(p.id)) {
                    return { ...p, levelHistory: [...p.levelHistory, lastScore + wonCount], roundRoles: [...(p.roundRoles ?? []), role as any] };
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
                    return { ...p, levelHistory: [...p.levelHistory, newScore], roundRoles: [...(p.roundRoles ?? []), role as any] };
                }
            }
        }));

        setDeclarerId('');
        setTeamIds([]);
        setCalledCards('');
        setLevelsWon('1');
        setWinner('declarer');
        setPenalty('none');
    };

    const openEditModal = (player: Player) => {
        setEditingPlayer(player);
        setEditLevelInput(indexToScore(getLastScore(player)));
        setOpenDropdownId(null);
        setActionMenuPlayer(null);
    };

    const handleSaveEdit = () => {
        if (!editingPlayer) return;
        const newIdx = scoreToIndex(editLevelInput);
        if (newIdx === null) {
            alert(t('edit.invalidScore'));
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

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        const name = newPlayerName.trim();
        if (!name) return;
        if (players.length >= 20) {
            alert(t('addPlayer.maxPlayers'));
            return;
        }
        if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            alert(t('addPlayer.exists'));
            return;
        }

        const lastRoundIndex = Math.max(0, ...players.map(p => p.levelHistory.length)) - 1;

        let lowestScore = Number.MAX_SAFE_INTEGER;
        players.forEach(p => {
            if (p.status !== 'quit') {
                const s = getLastScore(p);
                if (s < lowestScore) lowestScore = s;
            }
        });
        if (lowestScore === Number.MAX_SAFE_INTEGER) lowestScore = 0;

        const history = Array(lastRoundIndex).fill(undefined);
        history.push(lowestScore);

        setPlayers([
            ...players,
            {
                id: Date.now().toString() + Math.random().toString(),
                name,
                levelHistory: history,
                roundRoles: Array(lastRoundIndex).fill('none' as any),
                status: 'active'
            }
        ]);
        setNewPlayerName('');
        setIsAddPlayerOpen(false);
    };

    const togglePlayerSuspend = (id: string) => {
        setPlayers(prev => prev.map(p => {
            if (p.id === id) {
                const newStatus = p.status === 'suspended' ? 'active' : 'suspended';
                let newHistory = [...p.levelHistory];

                // When resuming, fill the 'empty' seat of the last completed round so they can be selected
                if (newStatus === 'active' && newHistory.length > 0 && newHistory[newHistory.length - 1] === undefined) {
                    newHistory[newHistory.length - 1] = getLastScore(p);
                }

                return { ...p, status: newStatus, levelHistory: newHistory };
            }
            return p;
        }));
        if (declarerId === id) setDeclarerId('');
        if (teamIds.includes(id)) setTeamIds(prev => prev.filter(x => x !== id));
        setOpenDropdownId(null);
    };

    const handleQuitPlayer = (id: string) => {
        setPlayers(prev => prev.map(p => {
            if (p.id === id) return { ...p, status: 'quit' };
            return p;
        }));
        if (declarerId === id) setDeclarerId('');
        if (teamIds.includes(id)) setTeamIds(prev => prev.filter(x => x !== id));
        setOpenDropdownId(null);
    };

    const winnerLabel = winner === 'declarer' ? t('round.optionDeclarer') : t('round.optionOffense');

    return (
        <div className="animate-fade-in" onClick={() => setOpenDropdownId(null)}>
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="logo-icon mini" role="img" aria-label="Tractor">🚜</div>
                    <h2>{t('dashboard.title')}</h2>
                    {!isGameEnded ? (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); setIsAddPlayerOpen(true); }} className="btn btn-outline" style={{ marginLeft: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                                {t('dashboard.addPlayer')}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setIsEndGameModalOpen(true); }} className="btn btn-danger" style={{ marginLeft: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                                {t('dashboard.endGame')}
                            </button>
                        </>
                    ) : (
                        <button onClick={(e) => { e.stopPropagation(); onEndGame(); }} className="btn btn-primary" style={{ marginLeft: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                            {t('dashboard.startNewGame')}
                        </button>
                    )}
                </div>
                <div className="header-right" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={(e) => { e.preventDefault(); onOpenContact(); }} className="btn btn-outline" style={{ padding: '0.5rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} title={t('contact.title')}>
                        <span role="img" aria-label="contact">✉️</span> 
                        <span className="hide-on-mobile">{t('contact.title')}</span>
                    </button>
                    <button onClick={() => exportStandingsToPDF(t)} className="btn btn-outline" style={{ padding: '0.5rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        {t('dashboard.exportPdf')}
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                <div className="glass-card table-card">
                    <div className="card-header">
                        <h3>{t('standings.title')}</h3>
                    </div>
                    <div className="table-responsive">
                        <table id="standings-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px', minWidth: '40px' }}></th>
                                    {players.map((p) => (
                                        <th key={p.id}>
                                            <div
                                                className="player-th"
                                                style={{ cursor: 'pointer', display: 'inline-flex', justifyContent: 'center', width: '100%', padding: '0.4rem 0.2rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', userSelect: 'none' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isGameEnded) return;
                                                    if (openDropdownId === p.id) {
                                                        setOpenDropdownId(null);
                                                        setActionMenuPlayer(null);
                                                    } else {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        const isBottom = rect.bottom > window.innerHeight - 250;
                                                        setDropdownRect({
                                                            top: isBottom ? undefined : rect.bottom + 5,
                                                            bottom: isBottom ? window.innerHeight - rect.top + 5 : undefined,
                                                            left: rect.left,
                                                            width: rect.width
                                                        });
                                                        setOpenDropdownId(p.id);
                                                        setActionMenuPlayer(p);
                                                    }
                                                }}
                                                title={t('standings.clickForOptions')}
                                            >
                                                <span style={{
                                                    color: p.status === 'quit' ? 'var(--danger)' : (p.status === 'suspended' ? 'var(--warning)' : 'var(--accent)'),
                                                    opacity: p.status === 'quit' ? 0.7 : 1,
                                                    fontWeight: 'bold',
                                                    textShadow: '0 0 10px rgba(0,0,0,0.5)'
                                                }}>
                                                    {p.name} {p.status === 'suspended' ? '⏸' : ''}
                                                </span>
                                                <span className="kebab-icon">⋮</span>
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
                                            <td style={{ width: '40px', minWidth: '40px' }}><strong>{gIndex === 0 ? "0" : gIndex}</strong></td>
                                            {players.map(p => {
                                                const score = p.levelHistory[gIndex];

                                                if (score === undefined) {
                                                    return <td key={`${p.id}-${gIndex}`}><span className="score-cell" style={{ opacity: 0.2 }}>-</span></td>;
                                                }

                                                const storedRole = (p.roundRoles ?? [])[gIndex];
                                                let prevScore = undefined;
                                                for (let i = gIndex - 1; i >= 0; i--) {
                                                    if (p.levelHistory[i] !== undefined) {
                                                        prevScore = p.levelHistory[i];
                                                        break;
                                                    }
                                                }

                                                const isWinner = gIndex > 0 && prevScore !== undefined && score > prevScore;
                                                const isDecreased = gIndex > 0 && prevScore !== undefined && score < prevScore;

                                                const isDeclarer = p.id === declarerId;
                                                const isTeammate = teamIds.includes(p.id);

                                                let badgeClass = "level-badge";

                                                if (isLastRow) {
                                                    if (p.status !== 'quit' && p.status !== 'suspended') {
                                                        badgeClass += " clickable";
                                                    }
                                                    if (isDeclarer) badgeClass += " declarer";
                                                    else if (isTeammate) badgeClass += " teammate";

                                                    if (isWinner) badgeClass += " winner";
                                                    else if (isDecreased) badgeClass += " decreased";
                                                } else {
                                                    if (storedRole === 'declarer') badgeClass += " declarer";
                                                    else if (storedRole === 'teammate') badgeClass += " teammate";
                                                    else if (storedRole === 'sitting_out') badgeClass += " sitting_out";

                                                    if (isWinner) badgeClass += " winner";
                                                    else if (isDecreased) badgeClass += " decreased";
                                                }

                                                return (
                                                    <td key={`${p.id}-${gIndex}`}>
                                                        <span className="score-cell">
                                                            <span
                                                                className={badgeClass}
                                                                onClick={(e) => { e.stopPropagation(); if (isLastRow && !isGameEnded) handlePlayerClick(p.id); }}
                                                                title={(isLastRow && !isGameEnded) ? t('standings.clickToSetRoles') : ""}
                                                            >
                                                                {indexToScore(score)}
                                                            </span>
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th style={{ width: '40px', minWidth: '40px' }}></th>
                                    {players.map((p) => (
                                        <th key={`footer-${p.id}`}>
                                            <div
                                                className="player-th"
                                                style={{ cursor: 'pointer', display: 'inline-flex', justifyContent: 'center', width: '100%', padding: '0.4rem 0.2rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', userSelect: 'none' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isGameEnded) return;
                                                    if (openDropdownId === p.id) {
                                                        setOpenDropdownId(null);
                                                        setActionMenuPlayer(null);
                                                    } else {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        const isBottom = rect.bottom > window.innerHeight - 250;
                                                        setDropdownRect({
                                                            top: isBottom ? undefined : rect.bottom + 5,
                                                            bottom: isBottom ? window.innerHeight - rect.top + 5 : undefined,
                                                            left: rect.left,
                                                            width: rect.width
                                                        });
                                                        setOpenDropdownId(p.id);
                                                        setActionMenuPlayer(p);
                                                    }
                                                }}
                                                title={t('standings.clickForOptions')}
                                            >
                                                <span style={{
                                                    color: p.status === 'quit' ? 'var(--danger)' : (p.status === 'suspended' ? 'var(--warning)' : 'var(--accent)'),
                                                    opacity: p.status === 'quit' ? 0.7 : 1,
                                                    fontWeight: 'bold',
                                                    textShadow: '0 0 10px rgba(0,0,0,0.5)'
                                                }}>
                                                    {p.name} {p.status === 'suspended' ? '⏸' : ''}
                                                </span>
                                                <span className="kebab-icon">⋮</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="glass-card round-card" onClick={(e) => e.stopPropagation()}>
                    <div className="card-header">
                        <h3>{t('round.title')}</h3>
                    </div>

                    <form onSubmit={handleRecordRound}>
                        <div className="form-group info-box">
                            <p>
                                <strong>{t('round.declarer')}</strong>{' '}
                                {declarerId ? (
                                    <span className="role-chip declarer">{players.find(p => p.id === declarerId)?.name}</span>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>{t('round.selectDeclarer')}</span>
                                )}
                            </p>
                            <p>
                                <strong>{t('round.teamMax', { count: Math.floor(activePlayers.length / 2) - 1 })}</strong>{' '}
                                {teamIds.length > 0 ? (
                                    <span style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {teamIds.map(id => <span key={id} className="role-chip team">{players.find(p => p.id === id)?.name}</span>)}
                                    </span>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>{t('round.noneSelected')}</span>
                                )}
                            </p>
                        </div>

                        <div className="form-group">
                            <label>{t('round.calledCards')}</label>
                            <input
                                type="text"
                                value={calledCards}
                                onChange={(e) => setCalledCards(e.target.value)}
                                placeholder={t('round.calledCardsPlaceholder')}
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('round.whoWon')}</label>
                            <select value={winner} onChange={(e) => setWinner(e.target.value as any)} required>
                                <option value="declarer">{t('round.optionDeclarer')}</option>
                                <option value="offense">{t('round.optionOffense')}</option>
                                <option value="surrender">{t('round.optionSurrender')}</option>
                            </select>
                        </div>

                        {winner !== 'surrender' && (
                            <div className="form-group">
                                <label>{t('round.levelsWonBy', { winner: winnerLabel })}</label>
                                <select value={levelsWon} onChange={(e) => setLevelsWon(e.target.value)} required>
                                    <option value="0">{t('round.level0')}</option>
                                    <option value="1">{t('round.level1')}</option>
                                    <option value="2">{t('round.level2')}</option>
                                    <option value="3">{t('round.level3')}</option>
                                </select>
                                <small className="help-text">{t('round.levelsHelp')}</small>
                            </div>
                        )}

                        {winner === 'offense' && declarerId && (() => {
                            const declarer = players.find(p => p.id === declarerId);
                            if (!declarer) return null;
                            const scoreIdx = getLastScore(declarer);
                            const isJA = (scoreIdx % 13 === 9) || (scoreIdx % 13 === 12);
                            if (!isJA) return null;

                            const scoreLabel = indexToScore(scoreIdx).replace(/\*/g, '');

                            return (
                                <div className="form-group">
                                    <label>{t('round.penalty', { score: scoreLabel })}</label>
                                    <select value={penalty} onChange={e => setPenalty(e.target.value as any)}>
                                        <option value="none">{t('round.penaltyNone', { score: indexToScore(scoreIdx) })}</option>
                                        <option value="backTo2">{t('round.penaltyBackTo2')}</option>
                                        <option value="minus2">{t('round.penaltyMinus2')}</option>
                                        <option value="minus4">{t('round.penaltyMinus4')}</option>
                                    </select>
                                    <small className="help-text">{t('round.penaltyHelp')}</small>
                                </div>
                            );
                        })()}

                        <button type="submit" className="btn btn-primary w-full mt-4" disabled={isGameEnded}>
                            <span style={{ fontSize: '1.2rem' }}>✓</span> {t('round.submit')}
                        </button>
                    </form>
                </div>
            </main >

            {/* Edit Modal */}
            {
                editingPlayer && (
                    <div className="modal-overlay" onClick={() => setEditingPlayer(null)}>
                        <div className="glass-card modal-content" onClick={e => e.stopPropagation()}>
                            <h3>{t('edit.title')} <span>{editingPlayer.name}</span></h3>
                            <div className="form-group">
                                <label>{t('edit.label')}</label>
                                <input
                                    type="text"
                                    value={editLevelInput}
                                    onChange={(e) => setEditLevelInput(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setEditingPlayer(null)} className="btn btn-outline">{t('edit.cancel')}</button>
                                <button type="button" onClick={handleSaveEdit} className="btn btn-primary">{t('edit.save')} <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>✓</span></button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Add Player Modal */}
            {
                isAddPlayerOpen && (
                    <div className="modal-overlay" onClick={() => setIsAddPlayerOpen(false)}>
                        <div className="glass-card modal-content" onClick={e => e.stopPropagation()}>
                            <h3>{t('addPlayer.title')}</h3>
                            <form onSubmit={handleAddPlayer} className="form-group" style={{ marginBottom: 0 }}>
                                <label>{t('addPlayer.label')}</label>
                                <input
                                    type="text"
                                    value={newPlayerName}
                                    onChange={(e) => setNewPlayerName(e.target.value)}
                                    placeholder={t('addPlayer.placeholder')}
                                    autoFocus
                                />
                                <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                                    <button type="button" onClick={() => setIsAddPlayerOpen(false)} className="btn btn-outline">{t('addPlayer.cancel')}</button>
                                    <button type="submit" className="btn btn-primary">{t('addPlayer.add')} <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span></button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Fixed Dropdown Menu Overlay */}
            {
                openDropdownId && actionMenuPlayer && dropdownRect && (
                    <div
                        className="dropdown-menu animate-fade-in"
                        style={{
                            position: 'fixed',
                            top: dropdownRect.top,
                            bottom: dropdownRect.bottom,
                            left: dropdownRect.left + (dropdownRect.width / 2),
                            transform: 'translateX(-50%)',
                            zIndex: 1000,
                            fontWeight: 'normal',
                            textTransform: 'none',
                            letterSpacing: 'normal'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', gap: '0.2rem', paddingBottom: '0.3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.2rem' }}>
                            <button style={{ flex: 1, textAlign: 'center', padding: '0.3rem' }} onClick={(e) => { e.stopPropagation(); movePlayer(actionMenuPlayer.id, -1); }} title={t('menu.moveLeft')}>◀</button>
                            <button style={{ flex: 1, textAlign: 'center', padding: '0.3rem' }} onClick={(e) => { e.stopPropagation(); movePlayer(actionMenuPlayer.id, 1); }} title={t('menu.moveRight')}>▶</button>
                        </div>

                        <button onClick={(e) => { e.stopPropagation(); openEditModal(actionMenuPlayer); }}>
                            {t('menu.editScore')}
                        </button>

                        {actionMenuPlayer.status !== 'quit' && (
                            <button onClick={(e) => { e.stopPropagation(); togglePlayerSuspend(actionMenuPlayer.id); }}>
                                {actionMenuPlayer.status === 'suspended' ? t('menu.resume') : t('menu.suspend')}
                            </button>
                        )}

                        {actionMenuPlayer.status !== 'quit' && (
                            <button className="danger" onClick={(e) => { e.stopPropagation(); handleQuitPlayer(actionMenuPlayer.id); }}>
                                {t('menu.quit')}
                            </button>
                        )}
                    </div>
                )
            }

            {/* End Game Confirm Modal */}
            {
                isEndGameModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsEndGameModalOpen(false)}>
                        <div className="glass-card modal-content" onClick={e => e.stopPropagation()}>
                            <h3>{t('endGame.title')}</h3>
                            <p style={{ margin: '1rem 0', color: 'var(--text-main)' }}>
                                {t('endGame.confirm')}
                            </p>
                            <div className="modal-actions">
                                <button className="btn btn-outline" onClick={() => setIsEndGameModalOpen(false)}>{t('endGame.cancel')}</button>
                                <button className="btn btn-danger" onClick={() => { setIsGameEnded(true); setIsEndGameModalOpen(false); }}>{t('endGame.confirmBtn')}</button>
                            </div>
                        </div>
                    </div>
                )
            }
            <SEOFooter />
        </div >
    );
};
