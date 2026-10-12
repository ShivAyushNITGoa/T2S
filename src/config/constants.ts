export interface Rank {
  name: string;
  hindiName: string;
  minXP: number;
  color: string;
  description: string;
}

export const RANKS: Rank[] = [
  {
    name: 'Novice',
    hindiName: 'नौसिखिया',
    minXP: 0,
    color: 'bg-zinc-600',
    description: 'The beginning of your journey. Observe and learn.',
  },
  {
    name: 'Seeker',
    hindiName: 'जिज्ञासु',
    minXP: 1000,
    color: 'bg-emerald-600',
    description: 'Actively questioning the programming and seeking truth.',
  },
  {
    name: 'Initiate',
    hindiName: 'दीक्षित',
    minXP: 3000,
    color: 'bg-blue-600',
    description: 'Stepping onto the path of discipline and self-control.',
  },
  {
    name: 'Adept',
    hindiName: 'निपुण',
    minXP: 6000,
    color: 'bg-purple-600',
    description: 'Skilled in mental frameworks and emotional detachment.',
  },
  {
    name: 'Strategist',
    hindiName: 'रणनीतिकार',
    minXP: 10000,
    color: 'bg-amber-600',
    description: 'Master of social dynamics and calculated moves.',
  },
  {
    name: 'Sovereign',
    hindiName: 'संप्रभु',
    minXP: 15000,
    color: 'bg-red-600',
    description: 'Completely independent, ruling over your own mind and destiny.',
  },
];

export const getRankFromXP = (xp: number): Rank => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) {
      return RANKS[i];
    }
  }
  return RANKS[0];
};

export const getNextRank = (xp: number): { rank: Rank | null; xpNeeded: number } => {
  for (let i = 0; i < RANKS.length; i++) {
    if (xp < RANKS[i].minXP) {
      return { rank: RANKS[i], xpNeeded: RANKS[i].minXP - xp };
    }
  }
  return { rank: null, xpNeeded: 0 };
};

export const DESIGNATED_ADMIN_EMAILS = ['ashivamone@gmail.com'];

export const isDesignatedAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return DESIGNATED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
};

export const isUserAdmin = (
  authUser?: { email?: string | null; providerData?: { email?: string | null }[] } | null,
  userProfile?: { uid?: string; email?: string | null; isAdmin?: boolean } | null
): boolean => {
  if (!authUser) return false;
  if (isDesignatedAdminEmail(authUser?.email)) return true;
  if (authUser?.providerData?.some((p) => isDesignatedAdminEmail(p?.email))) return true;
  if (userProfile?.uid && userProfile.uid !== 'guest' && userProfile.isAdmin === true) {
    return true;
  }
  return false;
};

export const STORAGE_KEYS = {
  PROFILE_CACHE_PREFIX: 't2s_profile_cache_',
  ACTIVE_PROFILE: 't2s_active_profile',
  GUEST_PROFILE: 't2s_guest_profile',
  JOURNEY_CACHE: 't2s_journey_cache',
  ARCHIVES_CACHE: 't2s_archives_catalog_v3',
  LIBRARY_CACHE: 't2s_library_catalog_v3',
  SHOP_CACHE: 't2s_shop_cache',
  DISMISSED_BROADCAST: 't2s_dismissed_broadcast_id',
  REFERRAL_CODE: 't2s_referral',
  CRUCIBLE_AUDIT_SCORES: 't2s_crucible_audit_scores',
  CRUCIBLE_OATH_SIGNED: 't2s_crucible_oath_signed',
  CRUCIBLE_DRILL_LOGS: 't2s_crucible_drill_logs',
  BOOK_READ_PROGRESS_PREFIX: 't2s_book_read_',
  LANGUAGE: 't2s_language',
} as const;
