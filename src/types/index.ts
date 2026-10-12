export interface JourneyModule {
  id: string;
  day: number;
  title: string;
  hindiTitle?: string;
  description: string;
  lesson?: string;
  command?: string;
  task?: string;
  videoUrl?: string;
  youtubeEmbedId?: string;
  logic?: string;
  phase?: string;
  category?: string;
  isPremium?: boolean;
  isVip?: boolean;
  updatedAt?: any;
  updatedAtMs?: number;
}

export interface VideoArchive {
  id: string;
  title: string;
  duration: string;
  views: string;
  thumbnail: string;
  videoUrl?: string;
  youtubeUrl?: string;
  youtubeEmbedId?: string;
  family?: string;
  category?: string;
  hindiFamily?: string;
  question?: string;
  description?: string;
  hindiQuestion?: string;
  hiddenSystemSummary?: string;
  consequence?: string;
  chandradiptiReflection?: string;
  isPremium?: boolean;
  isVip?: boolean;
  date?: string;
  createdAt?: any;
  updatedAt?: any;
  updatedAtMs?: number;
}

export interface BookChapter {
  number?: number;
  chapterNumber?: number;
  title: string;
  hindiTitle?: string;
  summary?: string;
  keyLesson?: string;
  keyTakeaways?: string[];
  practicalDrill?: string;
  practicalExercise?: string;
  content?: string;
  estimatedMinutes?: number;
}

export interface LibraryBook {
  id: string;
  title: string;
  hindiTitle?: string;
  author: string;
  excerpt: string;
  description?: string;
  coverUrl?: string;
  fileUrl?: string;
  pdfUrl?: string;
  category: string;
  badge?: string;
  targetAudience?: string;
  tableOfContents?: string[];
  chapters?: BookChapter[];
  groundRule?: string;
  isPremium?: boolean;
  isVip?: boolean;
  createdAt?: any;
  updatedAt?: any;
  updatedAtMs?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  xp: number;
  level: number;
  completedDays: number[];
  presenceDays?: string[];
  updatedAt: any;
  updatedAtMs?: number;
  journeyResetAtMs?: number;
  _forceReplaceDays?: boolean;
  lastLoginAt?: any;
  lastCompletedAt?: any;
  lastCompletedDate?: string;
  isAdmin?: boolean;
  isStrategist?: boolean;
  bio?: string;
  streak?: number;
  referredBy?: string;
  rank?: string;
  rankIndex?: number;
  dailyReflections?: Record<string, string>;
  premiumRequestStatus?: 'pending' | 'approved' | 'denied' | 'rejected' | 'revoked' | 'none';
  premiumRequestPlan?: 'sovereign' | 'elite';
  premiumRequestPlanName?: string;
  premiumRequestPaymentMethod?: 'card' | 'upi';
  premiumRequestDetails?: string;
  premiumRequestTransactionId?: string;
  premiumPaymentId?: string;
  utrNumber?: string;
  premiumRequestTimestamp?: any;
  premiumRequestDate?: any;
  premiumRequestedAt?: any;
  premiumApprovedAt?: any;
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
  isPremium?: boolean;
  createdAt?: any;
  updatedAt?: any;
  updatedAtMs?: number;
}

export interface VipSectionGates {
  journey?: boolean;
  archives?: boolean;
  library?: boolean;
  forum?: boolean;
  crucible?: boolean;
  blueprint?: boolean;
  shop?: boolean;
  leaderboard?: boolean;
  affiliate?: boolean;
  updatedAt?: any;
  updatedAtMs?: number;
}

export interface AffiliateStats {
  uid?: string;
  referralCode: string;
  clicks?: number;
  conversions?: number;
  earnings?: number;
  totalClicks?: number;
  totalConversions?: number;
  unpaidEarnings?: number;
  totalWithdrawn?: number;
}

export interface CommunityPostReply {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  authorRole?: string;
  authorRank?: string;
  authorIsVip?: boolean;
  content: string;
  createdAt: any;
  likes: number;
  likedBy?: string[];
  dayNumber?: number;
  topic?: string;
  replies?: CommunityPostReply[];
}

export interface SystemAnnouncement {
  id?: string;
  title?: string;
  hindiTitle?: string;
  message?: string;
  text?: string;
  linkUrl?: string;
  linkLabel?: string;
  actionUrl?: string;
  actionLabel?: string;
  type?: 'info' | 'warning' | 'urgent' | 'success' | 'gold' | 'live';
  active?: boolean;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface ToastNotice {
  id: number;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}

export type TabType =
  | 'journey'
  | 'framework'
  | 'blueprint'
  | 'archives'
  | 'library'
  | 'admin'
  | 'profile'
  | 'shop'
  | 'affiliate'
  | 'leaderboard'
  | 'forum';
