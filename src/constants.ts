export interface Rank {
  name: string;
  hindiName: string;
  threshold: number;
  color: string;
  icon: string;
}

export const RANKS: Rank[] = [
  { 
    name: 'Recruit', 
    hindiName: 'रंगरूट', 
    threshold: 0, 
    color: 'bg-slate-500', 
    icon: '👤' 
  },
  { 
    name: 'Strategist', 
    hindiName: 'रणनीतिकार', 
    threshold: 500, 
    color: 'bg-blue-500', 
    icon: '🏹' 
  },
  { 
    name: 'Elite', 
    hindiName: 'कुलीन', 
    threshold: 1500, 
    color: 'bg-amber-500', 
    icon: '⚔️' 
  },
  { 
    name: 'Commander', 
    hindiName: 'कमांडर', 
    threshold: 3500, 
    color: 'bg-emerald-500', 
    icon: '🎖️' 
  },
  { 
    name: 'Master', 
    hindiName: 'गुरु', 
    threshold: 7500, 
    color: 'bg-violet-600', 
    icon: '🔮' 
  },
  { 
    name: 'Grandmaster', 
    hindiName: 'ग्रैंडमास्टर', 
    threshold: 15000, 
    color: 'bg-rose-600', 
    icon: '👑' 
  }
];

export const getRankFromXP = (xp: number): Rank => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].threshold) {
      return RANKS[i];
    }
  }
  return RANKS[0];
};

export const getNextRank = (xp: number): { rank: Rank | null; xpNeeded: number } => {
  for (let i = 0; i < RANKS.length; i++) {
    if (xp < RANKS[i].threshold) {
      return { rank: RANKS[i], xpNeeded: RANKS[i].threshold - xp };
    }
  }
  return { rank: null, xpNeeded: 0 };
};
