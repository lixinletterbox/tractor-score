import type { Player } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { indexToScore } from '../logic/scoring';

export function exportStandingsToPDF(players: Player[]) {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Tractor Card Game Tracker - Results", 14, 22);

    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const numGames = Math.max(0, ...players.map(p => p.levelHistory.length));
    
    const headers = ['Game', ...players.map(p => p.name)];
    
    const tableData = Array.from({ length: numGames }).map((_, gIndex) => {
        return [
            gIndex === 0 ? 'Start' : gIndex.toString(),
            ...players.map(p => p.levelHistory[gIndex] !== undefined ? indexToScore(p.levelHistory[gIndex]) : '-')
        ];
    });

    autoTable(doc, {
        startY: 40,
        head: [headers],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save('tractor-scores.pdf');
}
