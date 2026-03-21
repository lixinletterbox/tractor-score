export interface Player {
    id: string;
    name: string;
    levelHistory: (number | undefined)[];
    roundRoles: ('declarer' | 'teammate' | 'sitting_out' | 'none')[];
    status?: 'active' | 'suspended' | 'quit';
}
