export interface JourneyModule {
  id: string;
  day: number;
  title: string;
  description: string;
  command?: string;
  logic?: string;
  phase?: string;
  isPremium?: boolean;
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
  bio?: string;
  referredBy?: string;
  rank?: string;
  rankIndex?: number;
  lastCompletedAt?: any;
  dailyReflections?: Record<string, string>;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: any;
  likes: number;
  likedBy?: string[];
  authorPhotoURL?: string;
  isPremium?: boolean;
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

export type TabType = 'journey' | 'archives' | 'library' | 'community' | 'admin' | 'profile' | 'shop' | 'affiliate' | 'leaderboard';
