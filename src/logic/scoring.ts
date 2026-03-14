export const LEVELS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function indexToScore(index: number): string {
    if (index < 0) index = 0;
    const cycle = Math.floor(index / 13);
    const baseIndex = index % 13;
    const stars = '*'.repeat(cycle);
    return `${LEVELS[baseIndex]}${stars}`;
}

export function scoreToIndex(scoreStr: string): number | null {
    const base = scoreStr.replace(/\*/g, '').toUpperCase();
    const starCount = (scoreStr.match(/\*/g) || []).length;

    const baseIndex = LEVELS.indexOf(base);
    if (baseIndex === -1) return null; // Invalid format
    return (starCount * 13) + baseIndex;
}
