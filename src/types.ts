export interface Player {
    id: string;
    name: string;
    levelHistory: number[];
    // Role for each recorded round (index aligns with levelHistory index 1..N, so roundRoles[i] = role after round i)
    roundRoles: ('declarer' | 'teammate' | 'none')[];
}
