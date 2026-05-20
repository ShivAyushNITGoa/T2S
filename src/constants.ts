export interface Rank {
  name: string;
  hindiName: string;
  threshold: number;
  color: string;
  icon: string;
}

export const RANKS: Rank[] = [
  { 
    name: 'Pawn', 
    hindiName: 'प्यादा (पॉड)', 
    threshold: 0, 
    color: 'bg-zinc-600 text-white', 
    icon: '♟️' 
  },
  { 
    name: 'Knight', 
    hindiName: 'शूरवीर (नाइट)', 
    threshold: 500, 
    color: 'bg-indigo-600 text-white', 
    icon: '♞' 
  },
  { 
    name: 'Strategist', 
    hindiName: 'रणनीतिज्ञ (स्ट्रेटेजिस्ट)', 
    threshold: 1500, 
    color: 'bg-violet-600 text-white', 
    icon: '🏹' 
  },
  { 
    name: 'Commander', 
    hindiName: 'सेनापति (कमांडर)', 
    threshold: 3500, 
    color: 'bg-emerald-600 text-white', 
    icon: '🎖️' 
  },
  { 
    name: 'Overlord', 
    hindiName: 'अधिपति (ओवरलॉर्ड)', 
    threshold: 7500, 
    color: 'bg-rose-600 text-white', 
    icon: '🔥' 
  },
  { 
    name: 'Sovereign', 
    hindiName: 'सर्वसत्ता शासक (सॉवरेन)', 
    threshold: 15000, 
    color: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black border border-amber-300 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)]', 
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
