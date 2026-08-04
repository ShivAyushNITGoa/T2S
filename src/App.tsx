import React, { useState, useEffect } from 'react';
import { 
  Shield, Flame, PlayCircle, BookOpen, Users, 
  Trophy, Lock, CheckCircle2, ChevronRight, ChevronDown, ChevronUp,
  LogOut, Send, Heart, Menu, X, User,
  TrendingUp, Zap, Target, Settings, Edit2, Save,
  ShoppingCart, ArrowLeft, BarChart3, ExternalLink,
  DollarSign, Share2, Copy, Upload, Image as ImageIcon,
  CreditCard, Check, Smartphone, Download, Youtube, Brain, Volume2, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './components/Logo';
import GatewayView from './components/GatewayView';
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  limit,
  getCountFromServer,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, isOfflineError } from './firebase';
import { UserProfile, TabType, JourneyModule, VideoArchive, LibraryBook, ShopProduct } from './types';
import { RAW_JOURNEY_MODULES, getCategoryForDay } from './journeyData';
import { RANKS, getRankFromXP, getNextRank } from './constants';
import AdminPanel from './components/AdminPanel';
import SovereignLab from './components/SovereignLab';
import LeaderboardTab from './components/LeaderboardTab';
import JourneyView from './components/JourneyView';
import DayCountdownTimer from './components/DayCountdownTimer';

// --- Components ---

const ProgressBar = ({ progress, label }: { progress: number, label?: string }) => (
  <div className="w-full">
    {label && <div className="flex justify-between text-xs font-medium text-gray-400 mb-2">
      <span>{label}</span>
      <span>{Math.round(progress)}%</span>
    </div>}
    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.2)]"
      />
    </div>
  </div>
);

const Card = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={`bg-[#0c0e14] border border-[#1d222e] rounded-[24px] md:rounded-[32px] p-6 md:p-10 hover:border-amber-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-500 group ${className}`}>
    {children}
  </div>
);

const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getIstHourAndDateStr = () => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(new Date());
    const getVal = (type: string) => parts.find(p => p.type === type)?.value || '';
    
    const year = getVal('year');
    const month = getVal('month');
    const day = getVal('day');
    const hour = parseInt(getVal('hour'), 10);
    
    const dateStr = `${year}-${month}-${day}`;
    return { hour, dateStr };
  } catch (e) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const dateStr = istDate.toISOString().split('T')[0];
    const hour = istDate.getUTCHours();
    return { hour, dateStr };
  }
};

const getIstDateStrOfDate = (date: Date) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(date);
    const getVal = (type: string) => parts.find(p => p.type === type)?.value || '';
    
    const year = getVal('year');
    const month = getVal('month');
    const day = getVal('day');
    
    return `${year}-${month}-${day}`;
  } catch (e) {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);
    return istDate.toISOString().split('T')[0];
  }
};

const PresenceCalendar = ({ presenceDays, completedDaysCount }: { presenceDays: string[], completedDaysCount: number }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMinimized, setIsMinimized] = useState(true);
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const hindiMonths = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

  const days = [];
  // Fill empty slots for previous month days
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  // Fill actual days
  for (let i = 1; i <= numDays; i++) {
    days.push(i);
  }

  const todayStr = getLocalDateString();

  return (
    <div className="bg-white/5 border border-white/5 rounded-[32px] p-6 md:p-8 w-full shadow-2xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Attendance Tracker / दैनिक उपस्थिति</span>
          </div>
          <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tight">
            Presence <span className="text-amber-500">Calendar</span>
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">दैनिक सक्रियता एवं उपस्थिति रिकॉर्ड</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/80 hover:bg-white/10 transition-colors"
          >
            {isMinimized ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
                <span>Maximize / पूर्ण रूप</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-500" />
                <span>Minimize / संक्षिप्त रूप</span>
              </>
            )}
          </button>

          {!isMinimized && (
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={prevMonth} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center justify-center">
                <ArrowLeft size={14} />
              </button>
              <button type="button" onClick={() => setCurrentDate(new Date())} className="px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider hover:bg-white/10 transition-colors">
                Today
              </button>
              <button type="button" onClick={nextMonth} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors rotate-180 flex items-center justify-center">
                 <ArrowLeft size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div 
            key="minimized-presence"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Weekly Strip: Last 7 days */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 md:p-6">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Last 7 Days Consistency / पिछले 7 दिन की निरंतरता</div>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
                {Array.from({ length: 7 }).map((_, idx) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - idx));
                  const dateStr = getLocalDateString(d);
                  const isDayToday = dateStr === todayStr;
                  const isActive = presenceDays.includes(dateStr);
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                  
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{dayName}</span>
                      <div className={`relative w-full aspect-square max-w-[48px] rounded-xl border flex items-center justify-center transition-all ${
                        isActive 
                          ? 'bg-amber-500/20 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                          : 'bg-white/2 border-white/5'
                      } ${isDayToday ? 'ring-1 ring-amber-500' : ''}`}>
                        <span className={`text-xs font-bold ${isActive ? 'text-amber-500' : 'text-white/25'}`}>{d.getDate()}</span>
                        {isActive && (
                          <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,1)]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="maximized-presence"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">
                {months[month]} <span className="text-amber-500">{year}</span>
              </h3>
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{hindiMonths[month]} {year}</p>
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-gray-600 uppercase tracking-widest pb-4 md:pb-6">{d}</div>
              ))}
              
              {days.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />;
                
                const dateObj = new Date(year, month, day);
                const dateStr = getLocalDateString(dateObj);
                const isToday = dateStr === todayStr;
                const hasPresence = presenceDays.includes(dateStr);
                
                return (
                  <motion.div
                    key={day}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: Math.min(day * 0.005, 0.15) }}
                    className={`relative aspect-square rounded-xl md:rounded-2xl border flex flex-col items-center justify-center transition-all group ${
                      hasPresence 
                        ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]' 
                        : 'bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10'
                    } ${isToday ? 'ring-2 ring-amber-500 ring-offset-4 ring-offset-black' : ''}`}
                  >
                    <span className={`text-base md:text-xl font-display font-black leading-none ${hasPresence ? 'text-amber-500' : 'text-white/25'}`}>
                      {day}
                    </span>
                    
                    {hasPresence && (
                      <motion.div 
                        layoutId="presence-glow"
                        className="absolute bottom-2 md:bottom-3 w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 items-stretch sm:items-center border-t border-white/5 pt-6">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-lg bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Active / सक्रिय</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-lg bg-white/2 border border-white/5" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Inactivity / निष्क्रिय</span>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-3 sm:gap-4 justify-between sm:justify-start">
          <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-center flex-1 sm:flex-initial sm:min-w-[100px]">
             <div className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest leading-none mb-1">Total Active</div>
             <div className="text-xs font-bold text-amber-500">{presenceDays.length} Days</div>
          </div>
          <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-center flex-1 sm:flex-initial sm:min-w-[100px]">
             <div className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Milestones</div>
             <div className="text-xs font-bold text-white uppercase">{completedDaysCount}/100</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGateway, setShowGateway] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [quotaError, setQuotaError] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPWAInstallPrompt, setShowPWAInstallPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem('t2s_active_tab');
    if (saved) {
      const validTabs: TabType[] = ['journey', 'archives', 'library', 'admin', 'profile', 'shop', 'affiliate', 'leaderboard', 'mindlab'];
      if (validTabs.includes(saved as TabType)) {
        return saved as TabType;
      }
    }
    return 'journey';
  });

  useEffect(() => {
    localStorage.setItem('t2s_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleQuota = (e: any) => {
      setQuotaError(e.detail || true);
    };
    const handleOffline = () => {
      setIsOffline(true);
    };
    const handleOnline = () => {
      setIsOffline(false);
    };
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPWAInstallPrompt(true);
    };

    window.addEventListener('firestore-quota', handleQuota);
    window.addEventListener('firestore-offline', handleOffline);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
    }
    
    return () => {
      window.removeEventListener('firestore-quota', handleQuota);
      window.removeEventListener('firestore-offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Redirect login successful:", result.user);
        }
      })
      .catch((error) => {
        console.error("Redirect login failed:", error);
        if (error.code === 'auth/popup-closed-by-user') {
          setAuthError('auth/popup-closed-by-user');
        } else {
          setAuthError(error.code || error.message);
        }
      });
  }, []);

  const handlePWAInstall = async () => {
    if (!deferredPrompt) {
      setShowPWAInstallPrompt(false);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("User install choice response:", outcome);
    setDeferredPrompt(null);
    setShowPWAInstallPrompt(false);
  };

  const [isSidebarOpen, setSidebarOpen] = useState(false); // Default to closed on mobile
  
  // Dynamic Content
  const [journeyModules, setJourneyModules] = useState<JourneyModule[]>([]);
  const [selectedJourneyCategory, setSelectedJourneyCategory] = useState<string>('All');
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [selectedLibraryCategory, setSelectedLibraryCategory] = useState<string>('All');
  const [archives, setArchives] = useState<VideoArchive[]>([]);
  const [library, setLibrary] = useState<LibraryBook[]>([]);
  const [stats, setStats] = useState({ users: 0, totalXp: 0 });
  const [rank, setRank] = useState<number | null>(null);

  const [selectedVideo, setSelectedVideo] = useState<VideoArchive | null>(null);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [selectedJourneyModule, setSelectedJourneyModule] = useState<JourneyModule | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAscensionOpen, setIsAscensionOpen] = useState(false);

  const [reflectionText, setReflectionText] = useState("");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isReflectionSubmitting, setIsReflectionSubmitting] = useState(false);

  // Trigger reset modal if needed
  useEffect(() => {
    if (user && localStorage.getItem('t2s_reset_notice') === 'true') {
      setIsResetModalOpen(true);
    }
  }, [user]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  const getDrivePreviewUrl = (url: string) => {
    if (!url) return null;
    // Regex for both /file/d/ID and ?id=ID formats
    const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|file\/u\/\d+\/d\/)|docs\.google\.com\/(?:file\/d\/|open\?id=|file\/u\/\d+\/d\/))([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  };

  // Auth & Profile Sync
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      if (refCode) {
        localStorage.setItem('t2s_referral', refCode);
      }

      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const adminRef = doc(db, 'admins', firebaseUser.uid);
        
        try {
          // Check admin status once at login (with offline resilience)
          let isAdminUser = firebaseUser.email === 'shivshivamxyz@gmail.com';
          try {
            const adminSnap = await getDoc(adminRef);
            isAdminUser = adminSnap.exists() || firebaseUser.email === 'shivshivamxyz@gmail.com';
          } catch (err: any) {
            console.warn("Could not check admin status directly from Firestore:", err);
            if (!isOfflineError(err)) {
              handleFirestoreError(err, OperationType.GET, `admins/${firebaseUser.uid}`);
            }
          }
          
          // Initial fetch & Streak Calculation
          let userSnap: any = null;
          let isOfflineLocal = false;
          try {
            userSnap = await getDoc(userRef);
          } catch (err: any) {
            console.warn("Could not fetch user profile directly from Firestore:", err);
            isOfflineLocal = isOfflineError(err);
            if (isOfflineLocal) {
              setIsOffline(true);
            } else {
              handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
            }
          }
          
          let profileData: any = null;

          if (userSnap && userSnap.exists()) {
            profileData = { uid: firebaseUser.uid, ...userSnap.data() };
            // Cache the profile locally for future offline loads
            localStorage.setItem('t2s_profile_cache_' + firebaseUser.uid, JSON.stringify(profileData));
            
            // Execute daily login / streak checks since we are online
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const userData = userSnap.data();
            const lastLogin = userData.lastLoginAt?.toDate?.() || new Date(0);
            const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()).getTime();
            
            const diffDays = Math.floor((today - lastLoginDate) / (1000 * 60 * 60 * 24));
            
            let updates: any = { lastLoginAt: serverTimestamp() };
            const todayStr = getLocalDateString();
            if (!userData.presenceDays?.includes(todayStr)) {
              updates.presenceDays = arrayUnion(todayStr);
            }

            if (diffDays === 1) {
              updates.streak = (userData.streak || 0) + 1;
            } else if (diffDays > 1) {
              updates.streak = 1;
            }

            // --- TFS Strike System check ---
            if (userData.completedDays && userData.completedDays.length > 0) {
              const lastCompleted = userData.lastCompletedAt?.toDate?.() || null;
              if (lastCompleted) {
                const lastCompletedDateOnly = new Date(lastCompleted.getFullYear(), lastCompleted.getMonth(), lastCompleted.getDate());
                const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const daysSinceLastSuccess = Math.floor((todayDateOnly.getTime() - lastCompletedDateOnly.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysSinceLastSuccess >= 3) {
                  updates.completedDays = [];
                  updates.lastCompletedAt = null;
                  updates.streak = 0;
                  localStorage.setItem('t2s_reset_notice', 'true');
                }
              } else {
                updates.lastCompletedAt = serverTimestamp();
              }
            }
            
            if (updates.presenceDays || diffDays >= 1 || updates.completedDays !== undefined) {
              await updateDoc(userRef, updates).catch(err => {
                if (!isOfflineError(err)) {
                  handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
                }
              });
            }
          } else {
            // Fallback: load from cache since we are offline or document is not fetched
            const cached = localStorage.getItem('t2s_profile_cache_' + firebaseUser.uid);
            if (cached) {
              try {
                profileData = JSON.parse(cached);
                console.log("Successfully loaded profile from local cache for offline usage:", profileData);
              } catch (parseErr) {
                console.error("Failed to parse cached profile data:", parseErr);
              }
            }
            
            // If they are a first-time user but offline with no cache, construct a resilient default
            if (!profileData) {
              profileData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || 'Anonymous User',
                photoURL: firebaseUser.photoURL || '',
                xp: 0,
                level: 1,
                completedDays: [],
                presenceDays: [getLocalDateString()],
                updatedAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                streak: 1,
                isAdmin: isAdminUser,
                bio: "Offline mode.",
                referredBy: ""
              };
            }
          }

          // Initial set to display the profile immediately
          setProfile({ ...profileData, isAdmin: isAdminUser } as UserProfile);

          // Listener for profile updates (works background-synced, handles offline reconnect automatically)
          unsubProfile = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
              const updatedProfile = { ...snap.data(), isAdmin: isAdminUser } as UserProfile;
              setProfile(updatedProfile);
              localStorage.setItem('t2s_profile_cache_' + firebaseUser.uid, JSON.stringify(updatedProfile));
            }
          }, (error) => {
            if (!isOfflineError(error)) {
              handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}/snapshot`);
            } else {
              console.warn("Snapshot listener is currently waiting for internet connection...");
            }
          });

        } catch (error) {
          console.error("Profile Sync Error:", error);
        }
      } else {
        setProfile(null);
        if (unsubProfile) {
          unsubProfile();
          unsubProfile = null;
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  // Content Subscriptions
  useEffect(() => {
    if (!user) return;

    const unsubJourney = onSnapshot(query(collection(db, 'journey'), orderBy('day', 'asc')), (snap) => {
      const dbModules = snap.docs.map(d => ({ id: d.id, ...d.data() } as JourneyModule));
      localStorage.setItem('t2s_journey_cache', JSON.stringify(dbModules));
      const merged = Array.from({ length: 100 }, (_, i) => {
        const d = i + 1;
        const exists = dbModules.find(m => m.day === d);
        if (exists) {
          return {
            ...exists,
            category: exists.category || getCategoryForDay(d)
          } as JourneyModule;
        }
        const raw = RAW_JOURNEY_MODULES.find(m => m.day === d)!;
        return {
          id: `raw-${d}`,
          ...raw,
          category: raw.category || getCategoryForDay(d)
        } as JourneyModule;
      });
      setJourneyModules(merged);
    }, (error) => {
      if (!isOfflineError(error)) {
        handleFirestoreError(error, OperationType.LIST, 'journey');
      } else {
        console.warn("Waiting for internet connection to sync journey data...");
      }
      const cached = localStorage.getItem('t2s_journey_cache');
      let dbModules: JourneyModule[] = [];
      if (cached) {
        try {
          dbModules = JSON.parse(cached);
        } catch (e) {
          console.error("Failed to parse cached journey:", e);
        }
      }
      const merged = Array.from({ length: 100 }, (_, i) => {
        const d = i + 1;
        const exists = dbModules.find(m => m.day === d);
        if (exists) {
          return {
            ...exists,
            category: exists.category || getCategoryForDay(d)
          } as JourneyModule;
        }
        const raw = RAW_JOURNEY_MODULES.find(m => m.day === d)!;
        return {
          id: `raw-${d}`,
          ...raw,
          category: raw.category || getCategoryForDay(d)
        } as JourneyModule;
      });
      setJourneyModules(merged);
    });

    const unsubArchives = onSnapshot(query(collection(db, 'archives'), orderBy('createdAt', 'desc')), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as VideoArchive));
      setArchives(data);
      localStorage.setItem('t2s_archives_cache', JSON.stringify(data));
    }, (error) => {
      if (!isOfflineError(error)) {
        handleFirestoreError(error, OperationType.LIST, 'archives');
      } else {
        console.warn("Waiting for internet connection to sync video archives...");
      }
      const cached = localStorage.getItem('t2s_archives_cache');
      if (cached) {
        try {
          setArchives(JSON.parse(cached));
        } catch (e) {
          console.error("Failed to parse cached archives:", e);
        }
      } else {
        // Fallback default archives
        setArchives([
          {
            id: 'arch-1',
            title: 'Sovereign Introduction / संप्रभु परिचय',
            duration: '10:15',
            views: '1.2K',
            thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            isPremium: false
          }
        ]);
      }
    });

    const unsubLibrary = onSnapshot(query(collection(db, 'library'), orderBy('title', 'asc')), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryBook));
      setLibrary(data);
      localStorage.setItem('t2s_library_cache', JSON.stringify(data));
    }, (error) => {
      if (!isOfflineError(error)) {
        handleFirestoreError(error, OperationType.LIST, 'library');
      } else {
        console.warn("Waiting for internet connection to sync library books...");
      }
      const cached = localStorage.getItem('t2s_library_cache');
      if (cached) {
        try {
          setLibrary(JSON.parse(cached));
        } catch (e) {
          console.error("Failed to parse cached library:", e);
        }
      } else {
        // Fallback default library
        setLibrary([
          {
            id: 'lib-1',
            title: 'The Sovereign Will / संप्रभु इच्छाशक्ति',
            author: 'Marcus Aurelius',
            category: 'Philosophy',
            excerpt: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
            coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300',
            isPremium: false
          }
        ]);
      }
    });

    return () => {
      unsubJourney();
      unsubArchives();
      unsubLibrary();
    };
  }, [user]);

  // Dynamic Metrics & Rank
  useEffect(() => {
    if (!user || !profile) return;

    const fetchMetrics = async () => {
      try {
        const usersCount = await getCountFromServer(collection(db, 'users')).catch(err => {
          if (err?.message?.includes('failed') || err?.code === 'unavailable') {
             // Silently retry later for common connection blips
             return null;
          }
          handleFirestoreError(err, OperationType.GET, 'users/count');
          throw err;
        });

        if (!usersCount) {
          console.warn("Metrics fetch incomplete due to connection issues, will retry...");
          return;
        }
        
        // Fetch users for rank calculation
        const qRank = query(collection(db, 'users'), where('xp', '>', profile.xp));
        const rankSnap = await getCountFromServer(qRank).catch(err => {
          if (err?.message?.includes('failed') || err?.code === 'unavailable') return null;
          handleFirestoreError(err, OperationType.GET, 'users/rank-count');
          throw err;
        });
        
        setStats({
          users: usersCount.data().count,
          totalXp: (profile.xp || 0)
        });
        if (rankSnap) {
          setRank(rankSnap.data().count + 1);
        }
      } catch (e) {
        console.error("Failed to fetch metrics:", e);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [user, profile?.xp]);

  const handleLogin = async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/popup-closed-by-user' || error.message?.includes('popup-closed-by-user')) {
        setAuthError('auth/popup-closed-by-user');
      } else {
        setAuthError(error.code || error.message || "Unknown login error");
      }
    }
  };

  const handleLoginWithRedirect = async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Redirect login initiate failed:", error);
      setAuthError(error.code || error.message || "Failed to start redirect login");
    }
  };

  const handleLogout = () => signOut(auth);

  const completeDay = async (day: number) => {
    if (!user || !profile || profile.completedDays.includes(day)) return;

    // --- Limit to one day task per calendar day (Local and IST timezone checks) ---
    if (profile.lastCompletedAt) {
      const lastCompleted = profile.lastCompletedAt.toDate ? profile.lastCompletedAt.toDate() : new Date(profile.lastCompletedAt);
      const lastCompletedLocalStr = getLocalDateString(lastCompleted);
      const todayLocalStr = getLocalDateString();
      
      const lastCompletedIstStr = getIstDateStrOfDate(lastCompleted);
      const todayIstStr = getIstHourAndDateStr().dateStr;
      
      if (lastCompletedLocalStr === todayLocalStr || lastCompletedIstStr === todayIstStr) {
        alert("🔒 ONE TASK PER DAY / प्रतिदिन केवल एक कार्य:\n\nआप प्रतिदिन केवल एक ही दिन का कार्य पूरा कर सकते हैं। कृपया कल वापस आएं!\n\nYou can only complete one day's task per calendar day. Please return tomorrow!");
        return;
      }
    }

    // --- TFS Element 3: 10:00 PM IST Daily Reflection lock ---
    const { hour, dateStr } = getIstHourAndDateStr();
    if (hour >= 22) {
      const hasReflection = profile.dailyReflections && profile.dailyReflections[dateStr];
      if (!hasReflection) {
        alert("🔒 REFLECTION REQUIRED / चिंतन आवश्यक:\n\nभारत के समय के अनुसार रात 10 बजे के बाद, अगला दिन अनलॉक करने के लिए आपको आज का चिंतन साझा करना होगा: \"आज तुमने दुनिया को क्या सिखाया?\"\n\nकृपया पहले आज का चिंतन पूरा करें।");
        return;
      }
    }

    const userRef = doc(db, 'users', user.uid);
    const xpGain = 100; // Base XP for completing a day
    const bonusXp = profile.streak ? Math.min(profile.streak * 5, 50) : 0; // Streak bonus
    const totalGain = xpGain + bonusXp;
    
    const newXp = (profile.xp || 0) + totalGain;
    const newLevel = Math.floor(newXp / 1000) + 1;

    try {
      await updateDoc(userRef, {
        completedDays: arrayUnion(day),
        presenceDays: arrayUnion(getLocalDateString()),
        lastCompletedAt: serverTimestamp(),
        xp: increment(totalGain),
        level: newLevel,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const submitDailyReflection = async (content: string) => {
    if (!user || !profile || !content.trim()) return;
    const { dateStr } = getIstHourAndDateStr();
    const userRef = doc(db, 'users', user.uid);
    
    try {
      await updateDoc(userRef, {
        [`dailyReflections.${dateStr}`]: content.trim(),
        xp: increment(25), // Reward 25 XP for thoughtful daily reflection
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/reflection`);
    }
  };

  const claimSovereignXp = async (amount: number, reason: string) => {
    if (!user || !profile) return;
    const userRef = doc(db, 'users', user.uid);
    const newXp = (profile.xp || 0) + amount;
    const newLevel = Math.floor(newXp / 1000) + 1;
    
    try {
      await updateDoc(userRef, {
        xp: increment(amount),
        level: newLevel,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/xp`);
    }
  };

  if (loading) return <LoadingScreen />;

  if (showGateway) {
    return (
      <>
        <GatewayView 
          onLogin={handleLogin} 
          onLoginRedirect={handleLoginWithRedirect}
          onEnter={() => {
            if (user) {
              setShowGateway(false);
            } else {
              handleLogin();
            }
          }} 
          onEnterWithTab={(tab) => {
            setActiveTab(tab);
            if (user) {
              setShowGateway(false);
            } else {
              handleLogin();
            }
          }}
          isAuthenticated={!!user} 
          userEmail={user?.email} 
          authError={authError}
          setAuthError={setAuthError}
          quotaError={quotaError}
          onLogout={handleLogout}
          profile={profile}
          onOpenAscension={() => setIsAscensionOpen(true)}
        />
        {isAscensionOpen && profile && (
          <AscensionModal onClose={() => setIsAscensionOpen(false)} profile={profile} />
        )}
      </>
    );
  }

  if (!user) {
    setShowGateway(true);
    return null;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#07080a] text-gray-200 flex font-sans selection:bg-amber-500/20">
      <div className="fixed inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 z-0" />
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      
      <aside className={`fixed lg:sticky top-0 h-screen ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 lg:w-20 -translate-x-full lg:translate-x-0'} bg-[#0a0b10] border-r border-[#1a1d24] transition-all duration-500 ease-in-out flex flex-col z-50 overflow-hidden`}>
        <div className="h-24 flex items-center px-8 border-b border-[#1a1d24] overflow-hidden">
          <Logo className="min-w-[40px] w-10 h-10" src={import.meta.env.VITE_APP_LOGO_URL || "/logo.png"} />
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="ml-3 font-black text-xl tracking-tighter text-white whitespace-nowrap"
              >
                Talk2Society
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
          <NavItem icon={<Shield className="w-5 h-5 text-amber-500 animate-pulse" />} label="Intel Briefing" secondaryLabel="गोपनीय जानकारी" active={false} onClick={() => { setShowGateway(true); setSidebarOpen(false); }} collapsed={!isSidebarOpen} />
          <NavItem icon={<ShoppingCart className="w-5 h-5" />} label="Strategic Shop" secondaryLabel="रणनीतिक दुकान" active={activeTab === 'shop'} onClick={() => { setActiveTab('shop'); setSidebarOpen(false); }} collapsed={!isSidebarOpen} />
          <NavItem icon={<Flame className="w-5 h-5" />} label="100-Day Journey" secondaryLabel="१०० दिन का सफर" active={activeTab === 'journey'} onClick={() => { setActiveTab('journey'); setSidebarOpen(false); }} collapsed={!isSidebarOpen} />
          <NavItem icon={<Brain className="w-5 h-5 text-amber-500" />} label="Sovereign Lab" secondaryLabel="मानसिक प्रयोगशाला" active={activeTab === 'mindlab'} onClick={() => { setActiveTab('mindlab'); setSidebarOpen(false); }} collapsed={!isSidebarOpen} />
          <NavItem icon={<PlayCircle className="w-5 h-5" />} label="Video Archives" secondaryLabel="वीडियो लाइब्रेरी" active={activeTab === 'archives'} onClick={() => { setActiveTab('archives'); setSidebarOpen(false); }} collapsed={!isSidebarOpen} />
          <NavItem icon={<BookOpen className="w-5 h-5" />} label="The Great Library" secondaryLabel="महान पुस्तकालय" active={activeTab === 'library'} onClick={() => { setActiveTab('library'); setSidebarOpen(false); }} collapsed={!isSidebarOpen} />
          <NavItem icon={<Trophy className="w-5 h-5" />} label="Leaderboard" secondaryLabel="लीडरबोर्ड" active={activeTab === 'leaderboard'} onClick={() => { setActiveTab('leaderboard'); setSidebarOpen(false); }} collapsed={!isSidebarOpen} />
          <NavItem icon={<User className="w-5 h-5" />} label="Profile Hub" secondaryLabel="प्रोफ़ाइल हब" active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }} collapsed={!isSidebarOpen} />
          
          <a
            href="https://www.youtube.com/@Talk2Society"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group text-zinc-400 hover:text-red-500 hover:bg-red-500/5"
          >
            <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">
              <Youtube className="w-5 h-5 text-red-500" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col text-left overflow-hidden min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider leading-none">YouTube Channel</span>
                <span className="text-[9px] font-medium tracking-wide leading-none mt-1 uppercase text-zinc-500 group-hover:text-red-400/80">यूट्यूब चैनल</span>
              </div>
            )}
          </a>

          <a
            href="https://t.me/Talk2Society"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group text-zinc-400 hover:text-blue-400 hover:bg-blue-500/5"
          >
            <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">
              <Send className="w-5 h-5 text-blue-400 fill-blue-500/10" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col text-left overflow-hidden min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider leading-none">Telegram Channel</span>
                <span className="text-[9px] font-medium tracking-wide leading-none mt-1 uppercase text-zinc-500 group-hover:text-blue-300">टेलीग्राम चैनल</span>
              </div>
            )}
          </a>

          <a
            href="https://t.me/+DlpQ9XstJ2VjYzU1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group text-zinc-400 hover:text-blue-400 hover:bg-blue-500/5"
          >
            <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col text-left overflow-hidden min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider leading-none">Telegram Group</span>
                <span className="text-[9px] font-medium tracking-wide leading-none mt-1 uppercase text-zinc-500 group-hover:text-blue-300">टेलीग्राम ग्रुप</span>
              </div>
            )}
          </a>
          
          {profile?.isAdmin && (
            <NavItem icon={<Settings className="w-5 h-5" />} label="Admin Panel" secondaryLabel="एडमिन कंट्रोल" active={activeTab === 'admin'} onClick={() => { setActiveTab('admin'); setSidebarOpen(false); }} collapsed={!isSidebarOpen} />
          )}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4 shrink-0 pb-8 lg:pb-4">
          <AnimatePresence>
            {isSidebarOpen && profile && (() => {
              const currentRank = getRankFromXP(profile.xp || 0);
              const nextRankInfo = getNextRank(profile.xp || 0);
              const xpInCurrentRank = (profile.xp || 0) - currentRank.threshold;
              const xpNeededForNext = nextRankInfo.rank ? nextRankInfo.rank.threshold - currentRank.threshold : 1000;
              const progress = nextRankInfo.rank ? (xpInCurrentRank / xpNeededForNext) * 100 : 100;

              return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 rounded-2xl p-5 border border-white/5">
                  <div className="flex justify-between items-end mb-4">
                    <div className="flex-1">
                      <div className={`text-[9px] px-2 py-0.5 rounded-full w-fit mb-1 font-black uppercase tracking-widest text-white ${currentRank.color}`}>
                        {currentRank.name}
                      </div>
                      <div className="text-[8px] text-white/30 font-bold uppercase tracking-wider mb-1">
                        {profile.isAdmin ? 'Admin' : profile.isStrategist ? 'Special Member' : currentRank.hindiName}
                      </div>
                      <div className="text-base font-bold text-white capitalize">{(profile.displayName || 'Anonymous').split(' ')[0]}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold font-mono leading-none">{profile.xp}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total XP</div>
                    </div>
                  </div>
                  <ProgressBar progress={progress} label={nextRankInfo.rank ? `Next: ${nextRankInfo.rank.name}` : 'Highest Rank Reached'} />
                </motion.div>
              );
            })()}
          </AnimatePresence>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-3 text-gray-500 hover:text-white hover:bg-red-500/10 rounded-xl transition-all group">
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            {isSidebarOpen && (
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-xs font-bold uppercase tracking-widest leading-tight">Logout</span>
                <span className="text-[8px] text-gray-600 font-bold leading-tight">लॉगआउट करें</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden relative z-10">
        <header className="h-20 md:h-24 border-b border-[#1a1d24] bg-[#0c0e14]/90 backdrop-blur-md flex items-center justify-between px-4 md:px-10 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-1.5 md:gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-[10px] md:text-xs uppercase tracking-wider font-semibold text-gray-400 whitespace-nowrap">
              <span className="hidden sm:inline">Menu / </span><span className="text-white">{activeTab.replace('-', ' ')}</span>
            </h2>
            {isOffline && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[8px] md:text-[9px] font-bold text-amber-500 rounded-full font-mono uppercase tracking-widest select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>Offline / ऑफ़लाइन सिंक</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            {profile && (profile.isStrategist || profile.isAdmin) ? (
              <div className="flex items-center gap-1.5 px-2 py-1.5 md:px-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-[9px] font-black uppercase tracking-wider">
                <Zap className="w-3 h-3 text-green-400 fill-green-400 animate-pulse" />
                <span className="hidden sm:inline">Premium / संप्रभु</span>
                <span className="sm:hidden">Premium</span>
              </div>
            ) : (
              <button
                onClick={() => setIsAscensionOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 md:px-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.03] text-black rounded-lg text-[9px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all cursor-pointer shrink-0"
              >
                <Zap className="w-3 h-3 fill-black text-black shrink-0" />
                <span className="hidden sm:inline">Unlock Premium</span>
                <span className="inline sm:hidden">Unlock</span>
              </button>
            )}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Total Points</span>
              <span className="text-lg md:text-xl font-bold font-mono text-white leading-none">{(profile?.xp || 0).toLocaleString()}</span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center p-0.5 overflow-hidden ring-1 ring-white/5 ring-offset-2 ring-offset-black cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('profile')}>
              <img src={profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 md:p-12 lg:p-16 max-w-7xl w-full mx-auto">
          {quotaError && profile?.isAdmin && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="bg-red-500/10 border-2 border-red-500/30 rounded-[24px] p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative overflow-hidden mb-8"
            >
              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-red-500" />
              <div className="w-12 h-12 bg-red-500/15 rounded-full flex items-center justify-center border border-red-500/20 text-2xl shrink-0">
                🚨
              </div>
              <div className="flex-1 space-y-1 text-center md:text-left">
                <h4 className="text-red-500 font-display font-black text-xs uppercase tracking-widest font-mono">
                  DATABASE READ LIMIT EXCEEDED / डेटाबेस कोटा समाप्त
                </h4>
                <p className="text-white font-bold text-base leading-snug">
                  The application has hit its Google Firestore free-tier read limits.
                </p>
                <p className="text-gray-400 text-xs md:text-sm">
                  We have automatically activated the **Sovereign offline caching system** so you can continue exploring your content without failure! Admins can resolve this by enabling billing/upgrade in their Firebase project.
                </p>
              </div>
              <a
                href="https://console.firebase.google.com/project/gen-lang-client-0467831205/firestore/databases/ai-studio-14532041-e5ec-4f1b-b575-758b9a243f26/data?openUpgradeDialog=true"
                target="_blank"
                rel="noreferrer"
                className="bg-red-600 hover:bg-red-700 font-black text-[10px] text-white px-5 py-2.5 rounded-xl uppercase tracking-widest border border-red-500 transition-all shrink-0 font-mono text-center cursor-pointer shadow-md inline-block"
              >
                Upgrade Plan / अपग्रेड करें
              </a>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'journey' && (
              <motion.div key="journey" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <JourneyView
                  journeyModules={journeyModules}
                  profile={profile}
                  onCompleteDay={completeDay}
                  onSubmitReflection={submitDailyReflection}
                />
              </motion.div>
            )}

            {activeTab === 'archives' && (
              <motion.div key="archives" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                {archives.length === 0 ? <NoContent label="Video Archives" /> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {archives.map(v => (
                      <VideoCard 
                        key={v.id} 
                        video={v} 
                        isLocked={v.isPremium && !profile?.isStrategist && !profile?.isAdmin}
                        onClick={() => setSelectedVideo(v)} 
                        onUnlockClick={() => setIsAscensionOpen(true)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'library' && (() => {
              const libraryCategories = ['All', ...Array.from(new Set(library.map(b => b.category).filter(Boolean)))];
              const filteredLibrary = library.filter(b => {
                const matchesCat = selectedLibraryCategory === 'All' || b.category?.toLowerCase() === selectedLibraryCategory.toLowerCase();
                const q = librarySearch.toLowerCase().trim();
                const matchesSearch = !q || b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q) || b.excerpt?.toLowerCase().includes(q);
                return matchesCat && matchesSearch;
              });

              return (
                <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 w-full">
                  {/* Great Library Header Banner */}
                  <div className="bg-[#0c0e14] border border-[#1d222e] rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 font-mono">
                            CLASSIFIED MANUSCRIPTS / महान पुस्तकालय
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tight">
                          The Great <span className="text-amber-500">Library</span>
                        </h2>
                        <p className="text-xs text-gray-400 mt-1 max-w-xl">
                          Access strategic manuscripts, power laws, psychological studies, and foundational texts for sovereign thinkers.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-start md:self-auto">
                        <span className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono font-bold text-gray-300">
                          {filteredLibrary.length} / {library.length} Manuscripts
                        </span>
                      </div>
                    </div>

                    {/* Search & Category Filter Bar */}
                    <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                      <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={librarySearch}
                          onChange={(e) => setLibrarySearch(e.target.value)}
                          placeholder="Search title, author, or keywords..."
                          className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                        />
                      </div>

                      {/* Category Filter Pills */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                        {libraryCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedLibraryCategory(cat)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                              selectedLibraryCategory === cat
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Books Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredLibrary.length === 0 ? (
                      <div className="lg:col-span-3 py-16 text-center space-y-4 bg-white/5 rounded-[32px] border border-white/5">
                        <BookOpen className="w-12 h-12 text-gray-600 mx-auto" />
                        <div>
                          <p className="text-white font-bold text-sm uppercase tracking-wider">No Manuscripts Match Search</p>
                          <p className="text-gray-500 text-xs font-mono mt-1">Try adjusting your category filter or search keywords</p>
                        </div>
                        {profile?.isAdmin && (
                          <button 
                            onClick={() => setActiveTab('admin')} 
                            className="mt-4 px-5 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 hover:text-black transition-all inline-block"
                          >
                            Add New Books via Admin Panel
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredLibrary.map(b => (
                        <BookCard 
                          key={b.id} 
                          book={b} 
                          isLocked={b.isPremium && !profile?.isStrategist && !profile?.isAdmin}
                          onClick={() => {
                            if (b.isPremium && !profile?.isStrategist && !profile?.isAdmin) {
                              setIsAscensionOpen(true);
                            } else {
                              setSelectedBook(b);
                            }
                          }}
                          onUnlockClick={() => setIsAscensionOpen(true)}
                        />
                      ))
                    )}
                  </div>
                </motion.div>
              );
            })()}



            {activeTab === 'leaderboard' && (
              <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LeaderboardTab currentUserProfile={profile} />
              </motion.div>
            )}

            {activeTab === 'mindlab' && (
              <motion.div key="mindlab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SovereignLab profile={profile} onXpEarned={claimSovereignXp} />
              </motion.div>
            )}

            {activeTab === 'profile' && profile && (
              <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProfileView profile={profile} rank={rank} onOpenAscension={() => setIsAscensionOpen(true)} />
              </motion.div>
            )}

            {activeTab === 'shop' && (
              <motion.div key="shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ShopView profile={profile!} />
              </motion.div>
            )}

            {activeTab === 'admin' && profile?.isAdmin && (
              <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AdminPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <AnimatePresence>
        {selectedVideo && (() => {
          const isLocked = selectedVideo.isPremium && !profile?.isStrategist && !profile?.isAdmin;
          return (
            <ContentModal 
              title={selectedVideo.title} 
              onClose={() => setSelectedVideo(null)}
            >
              {isLocked ? (
                <div className="p-12 text-center space-y-6 my-auto">
                  <div className="w-16 h-16 mx-auto bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg inline-block">
                      SOVEREIGN PREMIUM TRANSMISSION
                    </span>
                    <h3 className="text-xl font-black text-white uppercase italic">
                      {selectedVideo.title}
                    </h3>
                    <p className="text-xs text-gray-400 max-w-md mx-auto">
                      This video transmission is classified exclusively for Sovereign Tier members. Upgrade your account to unlock full access.
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelectedVideo(null); setIsAscensionOpen(true); }}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-105 transition-all cursor-pointer font-mono"
                  >
                    Upgrade Account Access / अपग्रेड करें
                  </button>
                </div>
              ) : (
                <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-white/5">
                  {selectedVideo.videoUrl ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.videoUrl)}?autoplay=1`}
                      className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <img src={selectedVideo.thumbnail} className="w-full h-full object-cover opacity-20 grayscale" alt="video" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                          <PlayCircle className="w-10 h-10 text-black fill-black" />
                        </div>
                        <h2 className="text-2xl font-black text-white italic mb-2 tracking-tighter uppercase">{selectedVideo.title}</h2>
                        <div className="text-white/40 font-black text-[10px] uppercase tracking-[0.3em]">Authorized Archive Stream</div>
                        <p className="mt-8 text-gray-600 text-xs max-w-md font-medium leading-relaxed font-mono uppercase">
                          Deciphering behavioral layers. Audio stream encrypted.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </ContentModal>
          );
        })()}

        {selectedBook && (() => {
          const isLocked = selectedBook.isPremium && !profile?.isStrategist && !profile?.isAdmin;
          return (
            <ContentModal 
              title={selectedBook.title} 
              onClose={() => setSelectedBook(null)}
              maxWidth="max-w-7xl"
            >
              {isLocked ? (
                <div className="p-12 text-center space-y-6 my-auto">
                  <div className="w-16 h-16 mx-auto bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg inline-block">
                      SOVEREIGN MANUSCRIPT RESTRICTED
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase italic">
                      {selectedBook.title}
                    </h3>
                    <p className="text-xs text-gray-400 max-w-md mx-auto">
                      This strategic manuscript is restricted to Sovereign Tier members. Upgrade your account to unlock full manuscript reading.
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelectedBook(null); setIsAscensionOpen(true); }}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-105 transition-all cursor-pointer font-mono"
                  >
                    Unlock Full Library Access / अपग्रेड करें
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col min-h-[85vh]">
                  <div className="p-8 border-b border-white/5 bg-black/40 shrink-0 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                    <div className="flex gap-8 items-start">
                      <div className="w-20 h-28 bg-neutral-900 border border-white/5 rounded-xl flex items-center justify-center shadow-2xl shrink-0 overflow-hidden">
                        {selectedBook.coverUrl ? (
                          <img src={selectedBook.coverUrl} className="w-full h-full object-cover" alt="cover" />
                        ) : (
                          <BookOpen className="w-8 h-8 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <div className="text-amber-500 text-[8px] font-black uppercase tracking-widest mb-1">{selectedBook.category}</div>
                          <h2 className="text-2xl font-black text-white italic tracking-tighter leading-none">{selectedBook.title}</h2>
                          <div className="text-[10px] text-gray-500 mt-1 font-bold uppercase tracking-widest">— {selectedBook.author}</div>
                        </div>
                        <p className="text-gray-400 text-[10px] italic leading-relaxed line-clamp-2">
                          "{selectedBook.excerpt}"
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-neutral-900 relative min-h-[600px]">
                    {selectedBook.fileUrl ? (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-0">
                          <div className="text-center p-8">
                            <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Initializing Secure Nexus Reader...</p>
                            <p className="text-gray-700 text-[10px] mt-2 italic max-w-xs mx-auto">
                              If the manuscript remains encrypted (does not load), ensure you are logged into Google and "Third-party cookies" are allowed for this session.
                            </p>
                          </div>
                        </div>
                        <iframe 
                          key={selectedBook.fileUrl}
                          src={getDrivePreviewUrl(selectedBook.fileUrl) || undefined} 
                          className="absolute inset-0 w-full h-full border-0 z-10"
                          title="book-viewer"
                          allow="autoplay"
                          sandbox="allow-scripts allow-same-origin allow-forms"
                          referrerPolicy="no-referrer"
                        />
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center p-12 text-center bg-[#0a0a0a]">
                        <div className="max-w-md space-y-6">
                          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                            <Lock className="w-8 h-8 text-amber-500" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">Manuscript Restricted</h3>
                            <p className="text-gray-500 text-xs font-medium leading-relaxed uppercase tracking-widest">
                              The central database record for this manuscript does not contain a verified link. 
                            </p>
                          </div>
                          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] text-gray-400 font-bold uppercase tracking-widest text-left">
                            <p className="mb-2 text-amber-500/80">ADMIN ACTION REQUIRED:</p>
                            1. Visit Nexus Command (Admin Panel)<br/>
                            2. Edit this book record<br/>
                            3. Provide a valid Google Drive Sharing URL
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </ContentModal>
          );
        })()}

        {isSearchOpen && (
          <SearchModal 
            onClose={() => setIsSearchOpen(false)} 
            journey={journeyModules} 
            archives={archives} 
            library={library} 
            profile={profile}
            onSelect={(type, item) => {
              const isLocked = item.isPremium && !profile?.isStrategist && !profile?.isAdmin;
              if (isLocked) {
                setIsSearchOpen(false);
                setIsAscensionOpen(true);
                return;
              }
              if (type === 'journey') setActiveTab('journey');
              if (type === 'archive') {
                setActiveTab('archives');
                setSelectedVideo(item as VideoArchive);
              }
              if (type === 'library') {
                setActiveTab('library');
                setSelectedBook(item as LibraryBook);
              }
              setIsSearchOpen(false);
            }} 
          />
        )}

        {isAscensionOpen && (
          <AscensionModal onClose={() => setIsAscensionOpen(false)} profile={profile!} />
        )}

        {selectedJourneyModule && (
          <JourneyModuleDetailModal 
            module={selectedJourneyModule} 
            isCompleted={profile?.completedDays.includes(selectedJourneyModule.day) || false}
            onClose={() => setSelectedJourneyModule(null)}
            onIntegrate={async () => {
              const day = selectedJourneyModule.day;
              setSelectedJourneyModule(null);
              await completeDay(day);
            }}
          />
        )}

        {isResetModalOpen && (
          <StrikeResetModal onClose={() => {
            localStorage.removeItem('t2s_reset_notice');
            setIsResetModalOpen(false);
          }} />
        )}

        {showPWAInstallPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-[#0a0a0a]/95 border border-amber-500/30 rounded-[28px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md text-left"
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Smartphone className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-white text-xs font-black uppercase tracking-wider font-display">T2S Nexus Mobile / मोबाइल</h4>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-none">Install for Standalone & Offline Access</div>
                </div>
              </div>
              <button 
                onClick={() => setShowPWAInstallPrompt(false)} 
                className="p-1 px-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-400 leading-relaxed font-sans">
              Install the official **T2S Nexus** app on your Android/mobile device for 100% native speeds, zero URL bar, and offline memory syncing.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={handlePWAInstall}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[10px] font-black uppercase tracking-wider rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install / इनस्टॉल</span>
              </button>
              <button
                onClick={() => setShowPWAInstallPrompt(false)}
                className="px-4 py-2.5 bg-white/5 border border-white/5 text-gray-400 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-white/10 transition-colors"
              >
                Later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function StrikeResetModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        className="bg-zinc-950 border-2 border-red-500/30 rounded-[32px] md:rounded-[40px] p-6 md:p-12 max-w-xl w-full text-center space-y-8 shadow-[0_0_50px_rgba(239,68,68,0.25)] relative overflow-hidden my-auto"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
        
        <div className="mx-auto w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center animate-pulse border border-red-500/20">
          <span className="text-5xl text-red-500">⚠️</span>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-display font-black text-red-500 uppercase tracking-tight leading-none">
            STRIKES LIMIT REACHED !
          </h2>
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-none">
            दंड विधान: प्रोग्रेस रीसेट
          </h3>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            आप लगातार 2 दिन टास्क की संकलन (Integrate) करने में असफल रहे। 
            <br />
            टॉक2सोसाइटी का नियम अत्यंत सरल और कठोर है: <span className="text-red-400 font-bold">अनुशासनहीनता की कोई जगह नहीं है।</span>
          </p>
          <p className="text-slate-500 text-xs md:text-sm italic leading-relaxed">
            "Your 100-day progress has been wiped out and reset back to Day 1. Every step towards sovereignty must be earned with daily devotion."
          </p>
        </div>
        
        <button 
          onClick={onClose}
          className="w-full py-4 bg-white text-black text-xs md:text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-neutral-200 transition-all shadow-xl font-mono"
        >
          I Accept, Start Over / मुझे स्वीकार है, पुनः शुरू करें
        </button>
      </motion.div>
    </motion.div>
  );
}

function ContentModal({ title, onClose, children, maxWidth = "max-w-5xl" }: { title: string, onClose: () => void, children: React.ReactNode, maxWidth?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="absolute inset-0" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`bg-[#0a0a0a] border-t sm:border border-white/10 w-full ${maxWidth} rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-[90vh] sm:h-auto sm:max-h-[95vh] relative z-10`}
      >
        <div className="h-16 px-6 md:px-8 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Back</span>
            </button>
            <div className="w-[1px] h-4 bg-white/10 mx-1" />
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic leading-tight">{title}</span>
                <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest leading-tight">सामाग्री लोड हो रही है</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white sm:hidden">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Modals ---

function SearchModal({ onClose, journey, archives, library, onSelect, profile }: { 
  onClose: () => void, 
  journey: JourneyModule[], 
  archives: VideoArchive[], 
  library: LibraryBook[], 
  onSelect: (type: string, item: any) => void,
  profile: UserProfile | null
}) {
  const [queryStr, setQueryStr] = useState('');
  
  const results = [
    ...journey.filter(m => {
      const isCompleted = profile?.completedDays?.includes(m.day) || false;
      const isNext = (profile?.completedDays?.length || 0) + 1 === m.day;
      const journeyLocked = !isCompleted && !isNext && m.day > 1;
      const isPremiumLocked = m.isPremium && !profile?.isStrategist && !profile?.isAdmin;
      return !(journeyLocked || isPremiumLocked);
    }).map(m => ({ ...m, type: 'journey' })),
    ...archives.map(a => ({ ...a, type: 'archive' })),
    ...library.map(l => ({ ...l, type: 'library' }))
  ].filter(item => {
    const title = item.title?.toLowerCase() || '';
    const desc = (item as any).description?.toLowerCase() || (item as any).excerpt?.toLowerCase() || '';
    const q = queryStr.toLowerCase();
    return title.includes(q) || desc.includes(q);
  }).slice(0, 8);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-start justify-center pt-24 px-6" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <Target className="text-white w-6 h-6" />
          <input 
            autoFocus
            placeholder="COMMAND: SEARCH DATABASE..." 
            className="flex-1 bg-transparent border-none outline-none text-xl font-black italic text-white placeholder:text-neutral-700 font-mono"
            value={queryStr}
            onChange={e => setQueryStr(e.target.value)}
          />
          <div className="px-2 py-1 bg-white/5 rounded text-[8px] font-black uppercase text-gray-700 font-mono">ESC TO EXIT</div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {queryStr && results.length === 0 && (
            <div className="py-12 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">Zero Matches Found in Core</div>
          )}
          {!queryStr && (
            <div className="py-12 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">Input Directive to Search</div>
          )}
          {results.map((r, i: number) => (
            <button 
              key={i}
              onClick={() => onSelect(r.type, r)}
              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-transparent hover:border-white/10 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white/10 text-white">
                  {r.type === 'journey' ? <Target size={16}/> : r.type === 'archive' ? <PlayCircle size={16}/> : <BookOpen size={16}/>}
                </div>
                <div>
                  <div className="text-white font-bold">{r.title}</div>
                  <div className="text-[10px] text-gray-700 uppercase font-black tracking-widest font-mono italic">{r.type} ARCHIVE</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-800" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function AscensionModal({ onClose, profile }: { onClose: () => void, profile: UserProfile }) {
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="w-full max-w-xl bg-zinc-950 border border-zinc-900 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(245,158,11,0.1)] relative p-6 md:p-10 text-center space-y-8 my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button on Top Right */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-900 w-10 h-10 flex items-center justify-center hover:bg-white/5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Premium Badge Icon */}
        <div className="w-16 h-16 bg-gradient-to-tr from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.15)] animate-pulse">
          <Zap className="w-8 h-8 text-amber-500 fill-amber-500/20" />
        </div>

        {/* Headings */}
        <div className="space-y-3">
          <h2 className="text-3xl font-display font-black text-white italic tracking-tighter uppercase leading-none select-none">
            Sovereign Ascension / संप्रभु प्रवेश
          </h2>
          <p className="text-zinc-500 font-mono text-[10px] font-black tracking-widest uppercase select-none">
            The Elite Strategists Handshake
          </p>
        </div>

        {/* Price Card */}
        <div className="p-4 bg-zinc-900 border border-zinc-900 rounded-2xl flex justify-between items-center text-left">
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Lifetime Membership / आजीवन सदस्यता</div>
            <div className="text-white font-black text-sm uppercase">Sovereign Pass / संप्रभु पास</div>
            <div className="text-[9px] text-amber-500 font-mono mt-0.5 uppercase tracking-wider font-extrabold flex items-center gap-1">
              <span className="w-1 h-1 bg-amber-500 rounded-full animate-ping" /> First 100 Users Special Offer
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1.5">
              <span className="line-through text-zinc-600 text-xs font-bold">Rs. 2,999</span>
              <span className="text-2xl font-display font-black text-amber-500">Rs. 299</span>
            </div>
            <div className="text-[9px] font-mono text-zinc-500 font-black uppercase">One-Time / सदा के लिए</div>
          </div>
        </div>

        {/* Deliverables Checklist / Features */}
        <div className="p-5 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-4 text-left">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Authorized Member Deliverables:</div>
          <div className="space-y-4 text-xs text-zinc-300 font-sans">
            <div className="flex items-start gap-3">
              <Check className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <strong className="text-white block font-bold text-sm">100-Day Special Journey</strong>
                <span className="text-zinc-400">Unlock Day 01-100 full strategums, pdf scripts, and shadow channels.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <strong className="text-white block font-bold text-sm">Limitless Audio & Video Archives</strong>
                <span className="text-zinc-400">Gain access to all locked video lessons and hidden audio entries.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <strong className="text-white block font-bold text-sm">One-on-One Interaction Option</strong>
                <span className="text-zinc-400">Priority strategic mentor audit lesson with A. K. Chandradipti.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instruction Message */}
        <div className="p-6 bg-amber-500/[0.02] border border-amber-500/20 rounded-2xl space-y-3 text-center">
          <div className="text-amber-400 font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
            <Send className="w-3.5 h-3.5 fill-amber-500/10" /> Telegram DM Request
          </div>
          <p className="text-zinc-200 text-xs font-medium leading-relaxed max-w-sm mx-auto">
            To unlock Premium access for only <strong className="text-amber-400 font-bold">Rs. 299</strong> instead of the standard <span className="line-through text-zinc-500 font-bold">Rs. 2,999</span> (special slot for first 100 users), <strong className="text-amber-400 font-bold">DM us directly on Telegram</strong>. We will guide you to elevate your account manually.
          </p>
          <p className="text-zinc-400 text-[10px] font-semibold leading-relaxed max-w-sm mx-auto uppercase tracking-wide font-mono">
            पहले 100 उपयोगकर्ताओं के लिए विशेष छूट: असली कीमत Rs. 2,999 के बजाय केवल Rs. 299 में प्रीमियम एक्सेस और भुगतान विवरण प्राप्त करने के लिए कृपया टेलीग्राम पर हमें सीधे संदेश (DM) भेजें।
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <a 
            href="https://t.me/A_K_Chandradipti" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-mono font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 font-bold cursor-pointer font-sans"
          >
            <Send className="w-4 h-4 fill-black" /> DM on Telegram / टेलीग्राम पर संदेश भेजें
          </a>
          <button 
            onClick={onClose}
            className="px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl font-mono font-black uppercase tracking-widest text-[10px] md:text-xs transition-all cursor-pointer"
          >
            Close / बंद करें
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Sub-Components ---

function ProfileView({ profile, rank, onOpenAscension }: { profile: UserProfile, rank: number | null, onOpenAscension: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(profile.displayName || "Anonymous User");
  const [newBio, setNewBio] = useState(profile.bio || "");
  const [newPhotoURL, setNewPhotoURL] = useState(profile.photoURL || "");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setNewName(profile.displayName || "Anonymous User");
      setNewBio(profile.bio || "");
      setNewPhotoURL(profile.photoURL || "");
    }
  }, [profile, isEditing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 700000) { // Limit to ~700KB for Base64 in Firestore to stay under 1MB doc limit
      alert("Image is too large. Please select an image under 700KB. (चित्र बहुत बड़ा है। कृपया 700KB से छोटा चित्र चुनें।)");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPhotoURL(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const updateProfile = async () => {
    if (
      (!newName.trim() || newName === profile.displayName) && 
      newBio === (profile.bio || "") &&
      newPhotoURL === (profile.photoURL || "")
    ) {
      setIsEditing(false);
      return;
    }
    const userRef = doc(db, 'users', profile.uid);
    try {
      await updateDoc(userRef, { 
        displayName: newName,
        bio: newBio,
        photoURL: newPhotoURL,
        updatedAt: serverTimestamp()
      });
      setIsEditing(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
      <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center md:items-start text-center md:text-left">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] md:rounded-[40px] overflow-hidden ring-4 ring-white/5 ring-offset-4 md:ring-offset-8 ring-offset-black shrink-0 shadow-2xl relative group">
          <img src={newPhotoURL || profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`} alt="avatar" className="w-full h-full object-cover" />
          {isEditing && (
            <label className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Upload className="w-6 h-6 text-white mb-2" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white">Upload New</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-6 w-full">
          <div className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Level {profile.level} / चरण {profile.level}</div>
          
          {isEditing ? (
            <div className="space-y-6 text-left">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Identity Display (नाम)</label>
                <input 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Your Name (आपका नाम)"
                  className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-xl sm:text-3xl font-display font-black text-white w-full max-w-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Profile Visual (प्रोफ़ाइल चित्र)</label>
                <div className="flex items-center gap-4 flex-wrap">
                  <button 
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="flex items-center gap-3 px-5 py-3 sm:px-6 sm:py-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-xs font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-all text-left"
                  >
                    <ImageIcon size={16} />
                    Change Photo / फोटो बदलें
                  </button>
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  {newPhotoURL && newPhotoURL.startsWith('data:') && (
                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">New Image Selected</span>
                  )}
                </div>
              </div>
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                placeholder="Talk about yourself... (अपने बारे में कुछ लिखें...)"
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-gray-400 w-full max-w-md h-32 resize-none font-medium"
              />
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md">
                <button onClick={updateProfile} className="px-8 py-3 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl">
                  <Save size={16}/> Save Profile / सुरक्षित करें
                </button>
                <button onClick={() => {
                  setIsEditing(false);
                  setNewName(profile.displayName);
                  setNewBio(profile.bio || "");
                  setNewPhotoURL(profile.photoURL || "");
                }} className="px-8 py-3 bg-white/5 text-white rounded-xl text-xs font-bold uppercase tracking-wider justify-center">
                  Cancel / रद्द करें
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-4 sm:gap-6">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-black text-white tracking-tight uppercase leading-none">{profile.displayName}</h1>
                <button onClick={() => setIsEditing(true)} className="p-2 md:p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/5 shrink-0"><Edit2 size={18}/></button>
              </div>
              <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl font-medium italic leading-relaxed mx-auto md:mx-0">
                {profile.bio || "No summary provided. Edit your profile to share your journey. (कोई जानकारी उपलब्ध नहीं है।)"}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-3 text-gray-600 text-[10px] font-bold uppercase tracking-widest flex-wrap">
                <span>{profile.email}</span>
                <span className="w-1 h-1 bg-gray-800 rounded-full" />
                <span>Verified Participant</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Trophy className="text-white" />} label="Total Points" secondaryLabel="कुल अंक" value={profile.xp.toLocaleString()} />
        <StatCard icon={<Flame className="text-white" />} label="Daily Streak" secondaryLabel="दैनिक सिलसिला" value={`${profile.streak || 1} Days`} />
        {(() => {
          const rankInfo = getRankFromXP(profile.xp || 0);
          return <StatCard icon={<Target className="text-white" />} label="Your Rank" secondaryLabel={rankInfo.name} value={`#${rank || '...'}`} />;
        })()}
        <StatCard 
          icon={<Shield className="text-white" />} 
          label="Member Status" 
          secondaryLabel="सदस्यता स्तर"
          value={profile.isAdmin ? 'Admin' : profile.isStrategist ? 'Special' : 'Standard'} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {(!profile.isStrategist && !profile.isAdmin) ? (
          <Card className="lg:col-span-2 bg-white/5 border-white/20">
            {profile.premiumRequestStatus === 'pending' ? (
              <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                <div className="w-24 h-24 bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.15)] animate-pulse rotate-3 shrink-0">
                  <Zap size={48} className="text-amber-400 fill-amber-400/20" />
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-full text-[9px] font-mono font-black uppercase tracking-widest">
                    ⏱️ PAYMENT VERIFICATION PENDING / सत्यापन लंबित है
                  </div>
                  <h2 className="text-3xl font-display font-black text-white italic tracking-tighter uppercase leading-none pt-1">Ledger Update in Progress</h2>
                  <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-xl">
                    व्यवस्थापक (<strong className="text-amber-400">A. K. Chandradipti</strong>) आपके भुगतान सत्यापन का मिलान कर रहे हैं। आपके अनुरोध की समीक्षा पूर्ण होने पर, आपकी सदस्यता स्वचालित रूप से <strong className="text-white">Special Strategist (संप्रभु)</strong> स्तर पर उन्नत कर दी जाएगी। (सामान्यतः इसमें 1-2 घंटे का समय लगता है)
                  </p>
                  <div className="pt-3 font-mono text-[10px] text-zinc-500 uppercase flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start">
                    <div>
                      <span className="text-zinc-600 font-bold">Plan Requested:</span> <strong className="text-amber-400 font-mono">{profile.premiumRequestPlan === 'elite' ? 'Elite 1-on-1 Consult' : 'Sovereign Full Pass'}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-600 font-bold">Details:</span> <strong className="text-zinc-300 font-mono">{profile.premiumRequestDetails || 'Cash/UPI'}</strong>
                    </div>
                    {profile.premiumRequestTransactionId && (
                      <div>
                        <span className="text-zinc-600 font-bold">Transaction ID:</span> <strong className="text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/20 rounded">{profile.premiumRequestTransactionId}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)] rotate-3 shrink-0">
                  <Zap size={48} className="text-black fill-black" />
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Join Special Group / विशेष सदस्य बनें</h2>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-xl">
                    Unlock the exclusive full potential (<span className="line-through">Rs. 2,999</span> <strong className="text-amber-400 font-bold">Rs. 299</strong> only for the first 100 users!). Access all books, video breakdowns, and special training modules.
                  </p>
                  <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                    <button 
                      onClick={onOpenAscension}
                      className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-gray-200 transition-all shadow-xl flex flex-col items-center cursor-pointer font-bold animate-pulse"
                    >
                      <span>Unlock Special Access</span>
                      <span className="text-[8px] normal-case tracking-normal opacity-60">Rs. 299 (<s>Rs. 2,999</s>) • 1st 100 users offer</span>
                    </button>
                    <div className="px-6 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-700 font-mono">
                      Special Membership Required
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="lg:col-span-2 bg-gradient-to-r from-green-500/5 via-neutral-900 to-green-500/5 border-green-500/20">
            <div className="flex flex-col md:flex-row items-center gap-8 py-4">
              <div className="w-24 h-24 bg-green-500/10 border-2 border-green-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.15)] rotate-3 shrink-0">
                <Zap size={48} className="text-green-400 fill-green-400" />
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-400/30 text-green-400 rounded-full text-[9px] font-mono font-black uppercase tracking-widest">
                  👑 SOVEREIGN CLEARANCE / प्रीमियम संप्रभु प्राप्त है
                </div>
                <h2 className="text-3xl font-display font-black text-white italic tracking-tighter uppercase leading-none pt-1">Premium Access Active</h2>
                <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-xl">
                  Your payment confirmation has been successfully matched against the manual ledger and approved. You hold complete administrative & special membership permissions. Enjoy limitless files, strategies, and shadow channels.
                </p>
              </div>
            </div>
          </Card>
        )}
        
        <Card className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> My Progress / मेरी प्रगति
            </h3>
            <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Active / सक्रिय</span>
          </div>
          <div className="space-y-8">
            {(() => {
              const currentRank = getRankFromXP(profile.xp || 0);
              const nextRankInfo = getNextRank(profile.xp || 0);
              const xpInCurrentRank = (profile.xp || 0) - currentRank.threshold;
              const xpNeededForNext = nextRankInfo.rank ? nextRankInfo.rank.threshold - currentRank.threshold : 1000;
              const progress = nextRankInfo.rank ? (xpInCurrentRank / xpNeededForNext) * 100 : 100;
              return (
                <div className="space-y-2 p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="flex justify-between items-center text-[10px] font-mono font-black uppercase text-zinc-400">
                    <span className="flex items-center gap-1"><span className="text-xs">{currentRank.icon}</span> {currentRank.name}</span>
                    <span>{nextRankInfo.rank ? `Next: ${nextRankInfo.rank.name}` : "Max Rank"}</span>
                  </div>
                  <ProgressBar progress={progress} label={nextRankInfo.rank ? `${nextRankInfo.xpNeeded} XP for Rank Ascension` : "Ultimate Sovereignty Reached"} />
                </div>
              );
            })()}
            <ProgressBar progress={(profile.completedDays || []).length} label="100 Day Goal Status" />
            <ProgressBar progress={Math.min(100, (profile.level || 1) * 15)} label="Overall Growth" />
          </div>
        </Card>

        <Card className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Recent Integrations
            </h3>
            <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Encrypted</span>
          </div>
          <div className="space-y-3">
             {(!profile.completedDays || profile.completedDays.length === 0) ? (
               <p className="text-gray-500 italic text-sm">No modules integrated into frame yet.</p>
             ) : (
               [...(profile.completedDays || [])].reverse().slice(0, 5).map(day => (
                 <div key={day} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="text-xs font-black text-white/40 font-mono">DAY {day < 10 ? `0${day}` : day}</div>
                     <div className="text-xs text-white/70 font-bold uppercase tracking-tight">Pattern Recognized</div>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono">AUTHORIZED</div>
                 </div>
               ))
             )}
          </div>
        </Card>

        {/* TFS Dynamic Wisdom Log / Daily Reflections Timeline */}
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" /> Wisdom Log / दैनिक चिंतन इतिहास
            </h3>
            <span className="text-[10px] text-amber-500 font-mono font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/10 font-bold">
              Recorded Thoughts
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            {!profile.dailyReflections || Object.keys(profile.dailyReflections).length === 0 ? (
              <p className="text-gray-500 italic text-sm text-center py-8 col-span-2">
                No nightly reflections recorded yet. Your wisdom timeline will appear here. (कोई चिंतन उपलब्ध नहीं है।)
              </p>
            ) : (
              Object.entries(profile.dailyReflections)
                .sort((a, b) => b[0].localeCompare(a[0])) // Sort newest calendar date first
                .map(([date, reflection]) => (
                  <div key={date} className="p-4 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl space-y-3 transition-colors flex flex-col justify-between">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-500/10">
                        {date}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.15em]">
                        10:00 PM Council
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-400 font-medium italic leading-relaxed">
                      "{reflection}"
                    </p>
                  </div>
                ))
            )}
          </div>
        </Card>

        <div className="lg:col-span-2">
          <AndroidInstallCard />
        </div>

        <div className="lg:col-span-2 mt-8">
          <LeaderboardView currentUserUid={profile.uid} />
        </div>
      </div>
    </motion.div>
  );
}

function AndroidInstallCard() {
  const [installSupported, setInstallSupported] = useState(false);
  const [deferredPromptState, setDeferredPromptState] = useState<any>(null);

  useEffect(() => {
    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPromptState(e);
      setInstallSupported(true);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const triggerInstall = async () => {
    if (!deferredPromptState) {
      alert("Mobile App Integration Verified! If you don't see the automated prompt, please tap your browser’s menu button (three vertical dots at top right or bottom of browser) and select 'Install app / Add to Home screen' to lock T2S Nexus on your launcher! (यदि स्वचालित इंस्टॉलेशन प्रॉम्प्ट नहीं आ रहा है, तो क्रोम या ब्राउज़र मेनू के तीन डॉट्स पर क्लिक करके 'Install app' या 'Add to home screen' विकल्प चुनें।)");
      return;
    }
    deferredPromptState.prompt();
    const { outcome } = await deferredPromptState.userChoice;
    if (outcome === 'accepted') {
      setInstallSupported(false);
    }
  };

  return (
    <Card className="bg-[#0c0c0c] border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.05)] overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6">
        <div className="flex items-center gap-5 text-left">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <Smartphone className="w-8 h-8 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-500 rounded-full font-mono uppercase tracking-widest select-none mb-1.5">
              <span>Android & iOS Native App Installer</span>
            </div>
            <h4 className="text-white text-lg font-black uppercase tracking-tight">T2S Nexus Mobile Installer / मोबाइल ऐप</h4>
            <p className="text-xs text-gray-400 max-w-xl mt-1 leading-relaxed">
              Install the sovereign mobile client! Running T2S Nexus directly on your Android / iOS phone unlocks full standalone immersion, custom bottom layouts, faster launch, and persistent local databases for complete offline study.
            </p>
          </div>
        </div>
        <button
          onClick={triggerInstall}
          className="w-full md:w-auto px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Install App / कनवर्ट मोबाइल ऐप</span>
        </button>
      </div>
      
      <div className="border-t border-white/5 bg-black/40 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">Step 01 • Connect URL</span>
          <h5 className="text-white text-xs font-black uppercase tracking-tight leading-none pt-0.5">Mobile Access Route</h5>
          <p className="text-[10px] text-gray-500 leading-normal">
            Open Chrome, Samsung Web Browser, or any Safari browser on your phone and enter this active URL.
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">Step 02 • Native Install</span>
          <h5 className="text-white text-xs font-black uppercase tracking-tight leading-none pt-0.5">Launcher Integration</h5>
          <p className="text-[10px] text-gray-500 leading-normal">
            Select "Add to home screen" inside browser settings or click the button above to spawn the native icon package.
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">Step 03 • Synchronized Core</span>
          <h5 className="text-white text-xs font-black uppercase tracking-tight leading-none pt-0.5">Real-Time Ledger</h5>
          <p className="text-[10px] text-gray-500 leading-normal">
            Log in on mobile to automatically resume your daily streaks, module integrations, and premium access with 100% security.
          </p>
        </div>
      </div>
    </Card>
  );
}

function LeaderboardView({ currentUserUid }: { currentUserUid?: string }) {
  const [leaders, setLeaders] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(10));
    return onSnapshot(q, (snap) => {
      setLeaders(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
      setLoading(false);
    }, (error) => {
      if (!isOfflineError(error)) {
        handleFirestoreError(error, OperationType.LIST, 'users/leaderboard');
      } else {
        console.warn("Waiting for internet connection to fetch leaderboard...");
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 bg-white/5 rounded-[32px] animate-pulse" />
          ))}
        </div>
      ) : leaders.length === 0 ? (
        <NoContent label="Strategists" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {leaders.slice(0, 3).map((leader, i) => {
          const rankInfo = getRankFromXP(leader.xp || 0);
          return (
            <motion.div
              key={leader.uid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-[32px] border flex flex-col items-center text-center relative overflow-hidden ${
                i === 0 ? 'bg-amber-500/10 border-amber-500/30 scale-105 z-10' : 
                i === 1 ? 'bg-blue-500/10 border-blue-500/30' : 
                'bg-slate-500/10 border-slate-500/30'
              }`}
            >
              <div className="absolute top-4 right-4 text-2xl font-black italic opacity-20">#{i + 1}</div>
              <div className="w-20 h-20 rounded-3xl overflow-hidden mb-4 ring-2 ring-white/10 p-0.5">
                <img src={leader.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.uid}`} className="w-full h-full object-cover" alt="" />
              </div>
              <h3 className="font-bold text-white uppercase tracking-tight text-lg leading-tight mb-1">{leader.displayName}</h3>
              <div className={`text-[10px] px-3 py-0.5 rounded-full font-black uppercase tracking-widest text-white mb-4 ${rankInfo.color}`}>
                {rankInfo.name}
              </div>
              <div className="text-2xl font-display font-black text-white italic">{(leader.xp || 0).toLocaleString()}<span className="text-[10px] ml-1 opacity-40 uppercase tracking-widest">xp</span></div>
            </motion.div>
          );
        })}
      </div>

      <Card className="p-0 border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Rank</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Member</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">XP Points</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((leader, index) => {
                const rankInfo = getRankFromXP(leader.xp || 0);
                const isCurrent = leader.uid === currentUserUid;
                return (
                  <tr key={leader.uid} className={`border-b border-white/5 hover:bg-white/2 transition-colors ${isCurrent ? 'bg-amber-500/5' : ''}`}>
                    <td className="px-8 py-6">
                      <span className={`text-sm font-black italic ${index < 3 ? 'text-amber-500' : 'text-gray-600'}`}>#{index + 1}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0">
                          <img src={leader.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.uid}`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white uppercase">{leader.displayName}</div>
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{rankInfo.hindiName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-black text-white italic">{(leader.xp || 0).toLocaleString()}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest text-white inline-block ${rankInfo.color} shadow-lg`}>
                        {rankInfo.name}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )}
</div>
  );
}

function StatCard({ icon, label, secondaryLabel, value }: { icon: React.ReactNode, label: string, secondaryLabel?: string, value: string }) {
  return (
    <Card className="flex items-center gap-6 p-6">
      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">{icon}</div>
      <div className="flex flex-col items-start leading-tight">
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</div>
        {secondaryLabel && <div className="text-[9px] text-gray-500 font-medium mb-1">{secondaryLabel}</div>}
        <div className="text-3xl font-display font-black text-white">{value}</div>
      </div>
    </Card>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full"
      />
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 md:p-8 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm text-center relative z-10 space-y-8 md:space-y-12">
        <Logo className="w-24 h-24 md:w-32 md:h-32 mx-auto shadow-[0_0_50px_rgba(255,255,255,0.05)]" src={import.meta.env.VITE_APP_LOGO_URL || "/logo.png"} />
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight text-white uppercase">Talk2Society</h1>
          <p className="text-gray-400 text-xs md:text-sm font-medium leading-relaxed uppercase tracking-widest">Mind Training & Personal Growth / दिमागी प्रशिक्षण</p>
        </div>
        <button onClick={onLogin} className="w-full py-5 md:py-6 bg-white text-black rounded-3xl font-bold uppercase tracking-wider text-[10px] md:text-xs hover:bg-neutral-200 transition-all flex flex-col items-center justify-center gap-2 shadow-2xl">
          <div className="flex items-center gap-3">
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="google" />
            <span>Login with Google</span>
          </div>
          <span className="text-[10px] opacity-40 font-semibold lowercase tracking-normal">गूगल से लॉग इन करें</span>
        </button>
      </motion.div>
    </div>
  );
}

function NoContent({ label }: { label: string }) {
  return (
    <div className="py-20 text-center space-y-4">
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto"><Target className="w-8 h-8 text-white/20" /></div>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No {label} available in central database</p>
    </div>
  );
}

function VideoCard({ video, onClick, isLocked, onUnlockClick }: { video: VideoArchive, onClick: () => void, isLocked?: boolean, onUnlockClick?: () => void, key?: React.Key }) {
  return (
    <div className={`group cursor-pointer ${isLocked ? 'opacity-80' : ''}`} onClick={isLocked ? onUnlockClick : onClick}>
      <div className="relative aspect-video rounded-[32px] overflow-hidden mb-6 border border-white/5 shadow-2xl transition-all group-hover:scale-[1.02]">
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isLocked ? (
            <div className="w-16 h-16 bg-neutral-900 border border-amber-500/50 rounded-full flex flex-col items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
              <Lock className="w-5 h-5 text-amber-500 mb-0.5" />
              <div className="text-[7px] font-mono text-amber-500 uppercase tracking-widest font-black">Unlock</div>
            </div>
          ) : (
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform"><PlayCircle className="w-8 h-8 text-black" /></div>
          )}
        </div>
        {video.isPremium && (
          <div className="absolute top-4 right-4 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[10px] font-mono font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-lg">
            Sovereign <Zap size={10} fill="black" />
          </div>
        )}
      </div>
      <div className="space-y-4 px-2">
        <div>
          <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-amber-500 transition-colors tracking-tight">
            {video.title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-gray-500 font-medium uppercase tracking-wider">
            <span>{video.views} Views</span>
            <span>{video.duration}</span>
          </div>
        </div>
        <button className={`w-full py-4 border rounded-2xl transition-all text-xs font-mono font-black uppercase tracking-widest ${isLocked ? 'text-amber-500 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500 hover:text-black hover:border-amber-500' : 'text-gray-400 border-white/10 group-hover:bg-white group-hover:text-black'}`}>
          {isLocked ? '🔒 UNLOCK PREMIUM' : 'Watch Now'}
        </button>
      </div>
    </div>
  );
}

function BookCard({ book, onClick, isLocked, onUnlockClick }: { book: LibraryBook, onClick: () => void, isLocked?: boolean, onUnlockClick?: () => void, key?: React.Key }) {
  return (
    <div 
      className={`bg-[#0c0e14] border border-[#1d222e] hover:border-amber-500/30 rounded-[28px] p-5 transition-all group cursor-pointer flex flex-col justify-between shadow-xl relative overflow-hidden ${isLocked ? 'opacity-90' : ''}`} 
      onClick={isLocked ? onUnlockClick : onClick}
    >
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="w-full sm:w-32 h-44 bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shrink-0 relative group-hover:scale-[1.02] transition-transform">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
          ) : (
            <div className="w-full h-full border border-white/5 bg-black/50 flex flex-col items-center justify-center p-2 text-center">
              <BookOpen className="w-8 h-8 text-amber-500/60 mb-2" />
              <span className="text-[8px] font-mono text-gray-500 uppercase">Strategic Text</span>
            </div>
          )}
          
          {isLocked && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-[2px]">
              <Lock className="w-6 h-6 text-amber-500 mb-1" />
              <span className="text-[7px] font-mono text-amber-500 font-black uppercase tracking-widest">Locked Pass</span>
            </div>
          )}

          {book.isPremium && (
            <div className="absolute top-2.5 right-2.5 w-6 h-6 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg z-10">
              <Zap size={10} className="text-black" fill="black" />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-500/90 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                {book.category || 'General'}
              </span>
              {book.isPremium && (
                <span className="text-[8px] font-mono font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                  Sovereign <Zap size={8} fill="currentColor" />
                </span>
              )}
            </div>
            <h3 className="text-lg font-display font-black text-white group-hover:text-amber-400 transition-colors tracking-tight leading-snug line-clamp-2">
              {book.title}
            </h3>
            {book.author && (
              <p className="text-[10px] text-gray-400 font-mono font-semibold uppercase tracking-wider mt-0.5">
                by {book.author}
              </p>
            )}
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 italic mt-2">
              "{book.excerpt}"
            </p>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className={`text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 ${isLocked ? 'text-amber-500' : 'text-gray-300 group-hover:text-amber-400'}`}>
              {isLocked ? '🔒 Unlock Sovereign Manuscript' : 'Read Manuscript'}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PostForm({ onSubmit, user, displayName }: any) {
  return (
    <Card className="bg-neutral-900/40 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0"><User className="text-white/40" /></div>
        <form onSubmit={(e) => { e.preventDefault(); const input = (e.target as any).content; onSubmit(input.value); input.value = ''; }} className="flex-1 flex flex-col gap-4 md:gap-6">
          <textarea name="content" placeholder="Share your experience... (अपने अनुभव साझा करें...)" className="w-full bg-white/5 border border-white/5 rounded-[24px] p-4 md:p-6 text-sm focus:outline-none min-h-[100px] md:min-h-[120px] resize-none font-medium placeholder:text-gray-600" />
          <button className="w-full sm:w-auto self-end px-8 md:px-10 py-3 md:py-4 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-gray-200 transition-all shadow-xl">Post Insight / पोस्ट करें</button>
        </form>
      </div>
    </Card>
  );
}

function NavItem({ icon, label, secondaryLabel, active, onClick, collapsed }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 group relative ${active ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800'}`}>
      <span className={`${active ? 'text-white scale-110' : 'text-zinc-400 group-hover:text-white group-hover:scale-110'} transition-all duration-300`}>{icon}</span>
      {!collapsed && (
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-xs font-black uppercase tracking-widest leading-tight">{label}</span>
          {secondaryLabel && <span className="text-[10px] font-black opacity-80 group-hover:opacity-100 leading-tight text-amber-400/90 group-hover:text-amber-400">{secondaryLabel}</span>}
        </div>
      )}
      {active && <motion.div layoutId="nav-active" className="absolute left-[-1rem] top-1/4 bottom-1/4 w-1 bg-amber-500 rounded-r-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />}
    </button>
  );
}

function ShopView({ profile }: { profile: UserProfile }) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'shop'), orderBy('category', 'asc'));
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as ShopProduct));
      setProducts(data);
      localStorage.setItem('t2s_shop_cache', JSON.stringify(data));
      setLoading(false);
    }, (error) => {
      if (!isOfflineError(error)) {
        handleFirestoreError(error, OperationType.LIST, 'shop');
      } else {
        console.warn("Waiting for internet connection to fetch shop catalog...");
      }
      const cached = localStorage.getItem('t2s_shop_cache');
      if (cached) {
        try {
          setProducts(JSON.parse(cached));
        } catch (e) {
          console.error("Failed to parse cached shop products:", e);
        }
      }
      setLoading(false);
    });
  }, []);

  const handleProductClick = async (product: ShopProduct) => {
    try {
      if (product.id) {
        await updateDoc(doc(db, 'shop', product.id), {
          clicks: increment(1)
        });
      }
    } catch (e) {
      console.error('Failed to track click:', e);
    }
  };

  const displayProducts = products;

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-16 pb-20">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tight uppercase">Strategic <span className="text-gray-500">Shop</span></h1>
        <p className="text-gray-400 text-base md:text-xl leading-relaxed font-medium">
          Curated resources for your personal growth. We recommend essential tools from trusted external platforms.
          (आपके विकास के लिए बेहतरीन संसाधन)
        </p>
        <div className="flex items-center gap-2 text-[10px] text-amber-500/60 font-bold uppercase tracking-widest bg-amber-500/5 border border-amber-500/10 w-fit px-3 py-1 rounded-full">
          <ExternalLink size={10} />
          <span>Product links will redirect to respective stores</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayProducts.map(product => (
          <div key={product.id} className="group bg-[#0a0a0a] border border-white/5 rounded-[40px] overflow-hidden flex flex-col hover:border-white/20 transition-all duration-500 shadow-2xl">
            <div className="aspect-[4/3] overflow-hidden bg-neutral-900 relative">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <div className="px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-xl text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                  {product.category}
                </div>
                {product.platform && (
                  <div className="px-4 py-1.5 bg-amber-500 rounded-xl text-[10px] font-black uppercase tracking-wider text-black shadow-2xl">
                    On {product.platform}
                  </div>
                )}
              </div>
            </div>
            <div className="p-10 flex-1 flex flex-col space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-display font-black text-white tracking-tight leading-tight">{product.name}</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-amber-500">{product.price}</span>
                  {product.clicks !== undefined && (
                    <span className="text-[10px] text-gray-500 font-bold uppercase">{product.clicks} Clicks</span>
                  )}
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium leading-relaxed flex-1 italic">
                {product.description}
              </p>
              <a 
                href={product.affiliateUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleProductClick(product)}
                className="w-full py-5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-neutral-200 transition-all flex flex-col items-center justify-center gap-1 shadow-xl group-hover:bg-amber-500 group-hover:text-black transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>View on {product.platform || 'Store'}</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
                <span className="text-[10px] normal-case tracking-normal opacity-60 font-bold">Respective platform पर देखें</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {displayProducts.length === 0 && <NoContent label="Resources" />}
    </div>
  );
}

interface JourneyModuleDetailModalProps {
  module: JourneyModule;
  isCompleted: boolean;
  onClose: () => void;
  onIntegrate: () => void;
}

function JourneyModuleDetailModal({ module, isCompleted, onClose, onIntegrate }: JourneyModuleDetailModalProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-zinc-950 border border-white/10 rounded-[32px] md:rounded-[40px] max-w-2xl w-full text-left p-6 md:p-10 shadow-2xl relative overflow-hidden my-auto"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/5 border border-white/5 hover:border-white/10 rounded-full text-gray-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="space-y-1.5 pt-4">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-amber-500 font-mono block">
              {module.phase || "Phase 1: THE PURGE"}
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-mono font-black py-0.5 px-2.5 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20 shrink-0">
                DAY {module.day}
              </span>
              <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-tight leading-none">
                {module.title}
              </h2>
            </div>
          </div>

          <div className="border-t border-white/5 my-4" />

          {/* Command */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500 animate-pulse" /> COMMAND / निर्देश
            </h4>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-white text-sm md:text-base leading-relaxed font-semibold">
              {module.command || module.description}
            </div>
          </div>

          {/* Dark Psychology */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500" /> DARK PSYCHOLOGY / डार्क साइकोलॉजी (WHY)
            </h4>
            <div className="p-5 bg-rose-950/5 border border-rose-500/10 rounded-2xl text-zinc-300 text-xs md:text-sm leading-relaxed font-mono">
              {module.logic || "The logic for this day is heavily guided by ancient sovereign secrets. Formulate sovereignty in action."}
            </div>
          </div>

          <div className="border-t border-white/5 my-4" />

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            {!isCompleted ? (
              <button
                onClick={onIntegrate}
                className="flex-1 py-4 bg-white hover:bg-zinc-200 text-black text-xs md:text-sm font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl font-mono flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <span>Integrate Day {module.day} / संकलन करें</span>
                <span className="text-[9px] opacity-60 font-medium normal-case font-sans">Marks progress (+100 XP)</span>
              </button>
            ) : (
              <div className="flex-1 py-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs md:text-sm font-black uppercase tracking-widest rounded-2xl text-center flex flex-col items-center justify-center gap-1">
                <span>✓ Day Completed / पूरा हो गया</span>
                <span className="text-[9px] opacity-60 font-medium normal-case font-sans">You have integrated this task.</span>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white text-xs md:text-sm font-black uppercase tracking-widest rounded-2xl transition-all font-mono cursor-pointer"
            >
              Close / बंद करें
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
