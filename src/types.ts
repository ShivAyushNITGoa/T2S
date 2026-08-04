export interface JourneyModule {
  id: string;
  day: number;
  title: string;
  hindiTitle?: string;
  description: string;
  command?: string;
  logic?: string;
  phase?: string;
  isPremium?: boolean;
  category?: string;
}

export interface VideoArchive {
  id: string;
  title: string;
  duration: string;
  views: string;
  thumbnail: string;
  videoUrl?: string; // YouTube embed URL or ID
  isPremium?: boolean;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  excerpt: string;
  fileUrl?: string; // PDF or custom reader URL
  coverUrl?: string; // Book cover image URL
  isPremium?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  xp: number;
  level: number;
  completedDays: number[];
  presenceDays: string[];
  updatedAt: any;
  lastLoginAt?: any;
  streak?: number;
  isAdmin?: boolean;
  isStrategist?: boolean;
  premiumRequestStatus?: 'pending' | 'approved' | 'denied';
  premiumRequestPlan?: 'sovereign' | 'elite';
  premiumRequestPlanName?: string;
  premiumRequestPaymentMethod?: 'card' | 'upi';
  premiumRequestDetails?: string;
  premiumRequestTransactionId?: string;
  premiumRequestDate?: any;
  bio?: string;
  referredBy?: string;
  rank?: string;
  rankIndex?: number;
  lastCompletedAt?: any;
  dailyReflections?: Record<string, string>;
}

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  affiliateUrl: string;
  category: string;
  platform?: string;
  clicks?: number;
}

export interface AffiliateStats {
  totalClicks: number;
  totalConversions: number;
  unpaidEarnings: number;
  totalWithdrawn: number;
  referralCode: string;
}

export type TabType = 'journey' | 'archives' | 'library' | 'admin' | 'profile' | 'shop' | 'affiliate' | 'leaderboard' | 'mindlab';
