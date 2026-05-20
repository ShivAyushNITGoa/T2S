import React, { useState, useEffect } from 'react';
import { 
  Shield, Flame, PlayCircle, BookOpen, Users, 
  Trophy, Lock, CheckCircle2, ChevronRight, ChevronDown, ChevronUp,
  LogOut, Send, Heart, Menu, X, User,
  TrendingUp, Zap, Target, Settings, Edit2, Save,
  ShoppingCart, ArrowLeft, BarChart3, ExternalLink,
  DollarSign, Share2, Copy, Upload, Image as ImageIcon
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
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, CommunityPost, TabType, JourneyModule, VideoArchive, LibraryBook, ShopProduct } from './types';
import { RAW_JOURNEY_MODULES } from './journeyData';
import { RANKS, getRankFromXP, getNextRank } from './constants';
import AdminPanel from './components/AdminPanel';

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
  <div {...props} className={`bg-[#0a0a0a]/60 backdrop-blur-md border border-white/5 rounded-[32px] md:rounded-[40px] p-6 md:p-10 hover:border-white/20 transition-all duration-500 group ${className}`}>
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
              <div className="grid grid-cols-7 gap-3">
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

      <div className="mt-8 flex flex-wrap gap-6 items-center border-t border-white/5 pt-6">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-lg bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Active / सक्रिय</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-lg bg-white/2 border border-white/5" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Inactivity / निष्क्रिय</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-xl text-center min-w-[100px]">
             <div className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest leading-none mb-1">Total Active</div>
             <div className="text-xs font-bold text-amber-500">{presenceDays.length} Days</div>
          </div>
          <div className="bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl text-center min-w-[100px]">
             <div className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Milestones</div>
             <div className="text-xs font-bold text-white uppercase">{completedDaysCount}/100</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const JourneyProgressCalendar = ({ completedDays }: { completedDays: number[] }) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const totalDaysCount = completedDays.length;
  const nextTargetDay = totalDaysCount + 1;

  // Determine current phase of 10 days (e.g. 1-10, 11-20, etc.)
  const currentPhaseIndex = Math.min(Math.floor(totalDaysCount / 10), 9); // max 9 (91-100)
  const phaseStart = currentPhaseIndex * 10 + 1;
  const phaseEnd = phaseStart + 9;

  return (
    <div className="bg-white/5 border border-white/5 rounded-[32px] p-6 md:p-8 w-full shadow-2xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-purple-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Sadhana Progress / साधना पूर्णता चक्र</span>
          </div>
          <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tight">
            100-Day <span className="text-purple-505 font-mono text-purple-500">Milestones</span>
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            {isMinimized ? `Current Phase: Days ${phaseStart}-${phaseEnd}` : 'Entire 100-Day Path Matrix'}
          </p>
        </div>

        <div>
          <button 
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/80 hover:bg-white/10 transition-colors"
          >
            {isMinimized ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-purple-500" />
                <span>Show All 100 Days / सम्पूर्ण पथ</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-purple-500" />
                <span>Show Current Phase / संक्षिप्त दशा</span>
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div 
            key="minimized-journey"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Phase View: 10 Days row */}
            <div className="bg-purple-505/5 border border-purple-500/10 rounded-2xl p-4 md:p-6 bg-purple-500/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Active Decade: Days {phaseStart} to {phaseEnd}</span>
                <span className="text-[10px] font-bold text-purple-500">{Math.min(completedDays.filter(d => d >= phaseStart && d <= phaseEnd).length, 10)} / 10 Complete</span>
              </div>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const dayNum = phaseStart + idx;
                  const isCompleted = completedDays.includes(dayNum);
                  const isCurrent = dayNum === nextTargetDay;
                  const isLocked = dayNum > nextTargetDay;

                  return (
                    <div 
                      key={dayNum} 
                      onClick={() => {
                        if (!isLocked) {
                          const el = document.getElementById(`module-${dayNum}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                      className={`relative flex flex-col items-center justify-center aspect-square rounded-xl border text-center cursor-pointer transition-all ${
                        isCompleted 
                          ? 'bg-purple-500/20 border-purple-500/40 shadow-[0_0_15px_rgba(147,51,234,0.1)]' 
                          : isCurrent 
                          ? 'bg-white/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/50' 
                          : 'bg-white/2 border-white/5 opacity-40 hover:opacity-100'
                      }`}
                      title={`Day ${dayNum}: ${isCompleted ? 'Completed' : isCurrent ? "Today's Target" : 'Locked'}`}
                    >
                      <span className={`text-xs font-black font-mono ${isCompleted ? 'text-purple-400' : isCurrent ? 'text-amber-500' : 'text-white/20'}`}>
                        {dayNum}
                      </span>
                      {isCompleted && (
                        <CheckCircle2 className="w-3 h-3 text-purple-400 absolute bottom-1" />
                      )}
                      {isCurrent && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      )}
                      {isLocked && (
                        <Lock className="w-2.5 h-2.5 text-white/10 absolute bottom-1.5" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="maximized-journey"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {/* 100-Day Matrix: 10 rows of 10 cols */}
            <div className="grid grid-cols-10 gap-1.5 md:gap-2.5">
              {Array.from({ length: 100 }).map((_, idx) => {
                const dayNum = idx + 1;
                const isCompleted = completedDays.includes(dayNum);
                const isCurrent = dayNum === nextTargetDay;
                const isLocked = dayNum > nextTargetDay;

                return (
                  <motion.div
                    key={dayNum}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: Math.min(dayNum * 0.002, 0.1) }}
                    onClick={() => {
                      if (!isLocked) {
                        const el = document.getElementById(`module-${dayNum}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className={`relative aspect-square rounded-lg md:rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                      isCompleted 
                        ? 'bg-purple-500/20 border-purple-500/40 shadow-[0_0_10px_rgba(147,51,234,0.05)]' 
                        : isCurrent 
                        ? 'bg-white/10 border-amber-500 ring-2 ring-amber-500/30' 
                        : 'bg-white/2 border-white/5 opacity-50 hover:opacity-100 hover:border-white/20'
                    }`}
                    title={`Day ${dayNum}: ${isCompleted ? 'Completed' : isCurrent ? "Today's Target" : 'Locked'}`}
                  >
                    <span className={`text-[10px] md:text-sm font-black font-mono leading-none ${isCompleted ? 'text-purple-400' : isCurrent ? 'text-amber-500' : 'text-white/25'}`}>
                      {dayNum}
                    </span>
                    {isCompleted && (
                      <span className="absolute bottom-0.5 md:bottom-1 w-1 h-1 rounded-full bg-purple-400" />
                    )}
                    {isCurrent && (
                      <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-amber-500 animate-ping" />
                    )}
                    {isLocked && dayNum % 10 === 0 && (
                      <div className="absolute top-0.5 right-0.5 text-[6px] opacity-10">🔒</div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex flex-wrap gap-6 items-center border-t border-white/5 pt-6">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded bg-purple-500/30 border border-purple-500/40" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Completed / पूर्ण</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded border border-amber-500 bg-white/10 ring-1 ring-amber-500/40" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Current / सक्रिय</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded bg-white/2 border border-white/5 opacity-40" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Locked / आगामी</span>
        </div>
        <div className="ml-auto bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full">
          <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Decade Phases Completed: {Math.floor(totalDaysCount / 10)}/10</span>
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
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem('t2s_active_tab');
    if (saved) {
      const validTabs: TabType[] = ['journey', 'archives', 'library', 'community', 'admin', 'profile', 'shop', 'affiliate', 'leaderboard'];
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
    window.addEventListener('firestore-quota', handleQuota);
    return () => {
      window.removeEventListener('firestore-quota', handleQuota);
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
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Default to closed on mobile
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  
  // Dynamic Content
  const [journeyModules, setJourneyModules] = useState<JourneyModule[]>([]);
  const [archives, setArchives] = useState<VideoArchive[]>([]);
  const [library, setLibrary] = useState<LibraryBook[]>([]);
  const [stats, setStats] = useState({ users: 0, posts: 0, totalXp: 0 });
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
          // Check admin status once at login
          const adminSnap = await getDoc(adminRef).catch(err => {
            handleFirestoreError(err, OperationType.GET, `admins/${firebaseUser.uid}`);
            throw err;
          });
          const isAdminUser = adminSnap.exists() || firebaseUser.email === 'shivshivamxyz@gmail.com';
          
          // Initial fetch & Streak Calculation
          const userSnap = await getDoc(userRef).catch(err => {
            handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
            throw err;
          });
          
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

          if (!userSnap.exists()) {
            const storedRef = localStorage.getItem('t2s_referral');
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Anonymous User',
              photoURL: firebaseUser.photoURL || '',
              xp: 0,
              level: 1,
              completedDays: [],
              presenceDays: [getLocalDateString()],
              updatedAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
              streak: 1,
              isAdmin: isAdminUser,
              bio: "",
              referredBy: storedRef || undefined
            };
            await setDoc(userRef, newProfile).catch(err => {
              handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}`);
              throw err;
            });
          } else {
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
            // If the user has completed days, check if they missed 2 consecutive calendar days
            if (userData.completedDays && userData.completedDays.length > 0) {
              const lastCompleted = userData.lastCompletedAt?.toDate?.() || null;
              if (lastCompleted) {
                const lastCompletedDateOnly = new Date(lastCompleted.getFullYear(), lastCompleted.getMonth(), lastCompleted.getDate());
                const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const daysSinceLastSuccess = Math.floor((todayDateOnly.getTime() - lastCompletedDateOnly.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysSinceLastSuccess >= 3) {
                  // Strike System Reset! Missed 2 consecutive full calendar days
                  updates.completedDays = [];
                  updates.lastCompletedAt = null;
                  updates.streak = 0;
                  localStorage.setItem('t2s_reset_notice', 'true');
                }
              } else {
                // Retroactively set lastCompletedAt to avoid unfair immediate resets for old users
                updates.lastCompletedAt = serverTimestamp();
              }
            }
            
            // Always update presence if missing, or update streak/lastLogin if 1+ day passed or when reset triggers
            if (updates.presenceDays || diffDays >= 1 || updates.completedDays !== undefined) {
              await updateDoc(userRef, updates).catch(err => {
                handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
                throw err;
              });
            }
          }

          // Listener for profile updates (isStrategist, displayName, etc)
          unsubProfile = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
              setProfile({ ...snap.data(), isAdmin: isAdminUser } as UserProfile);
            }
          }, (error) => handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}/snapshot`));

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

    const unsubPosts = onSnapshot(query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50)), (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as CommunityPost)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'posts'));

    const unsubJourney = onSnapshot(query(collection(db, 'journey'), orderBy('day', 'asc')), (snap) => {
      const dbModules = snap.docs.map(d => ({ id: d.id, ...d.data() } as JourneyModule));
      const merged = Array.from({ length: 100 }, (_, i) => {
        const d = i + 1;
        const exists = dbModules.find(m => m.day === d);
        if (exists) {
          return exists;
        }
        const raw = RAW_JOURNEY_MODULES.find(m => m.day === d)!;
        return {
          id: `raw-${d}`,
          ...raw
        } as JourneyModule;
      });
      setJourneyModules(merged);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'journey'));

    const unsubArchives = onSnapshot(query(collection(db, 'archives'), orderBy('createdAt', 'desc')), (snap) => {
      setArchives(snap.docs.map(d => ({ id: d.id, ...d.data() } as VideoArchive)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'archives'));

    const unsubLibrary = onSnapshot(query(collection(db, 'library'), orderBy('title', 'asc')), (snap) => {
      setLibrary(snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryBook)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'library'));

    return () => {
      unsubPosts();
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

        const postsCount = await getCountFromServer(collection(db, 'posts')).catch(err => {
          if (err?.message?.includes('failed') || err?.code === 'unavailable') return null;
          handleFirestoreError(err, OperationType.GET, 'posts/count');
          throw err;
        });

        if (!usersCount || !postsCount) {
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
          posts: postsCount.data().count,
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

  const createPost = async (content: string) => {
    if (!user || !content.trim()) return;
    try {
      const xpGain = 20;
      const userRef = doc(db, 'users', user.uid);
      
      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName || 'Anonymous User',
        authorPhotoURL: profile?.photoURL || user.photoURL || null,
        content,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: []
      });

      try {
        await updateDoc(userRef, {
          xp: increment(xpGain),
          updatedAt: serverTimestamp()
        });
      } catch (xpErr) {
        console.warn("Couldn't reward XP to post creator:", xpErr);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    }
  };

  const likePost = async (postId: string, authorId: string) => {
    if (!user) return;
    const postRef = doc(db, 'posts', postId);
    const authorRef = doc(db, 'users', authorId);
    const likerRef = doc(db, 'users', user.uid);

    const postObj = posts.find(p => p.id === postId);
    const hasLiked = postObj?.likedBy?.includes(user.uid) || false;

    try {
      if (hasLiked) {
        // Unlike post
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(user.uid)
        });

        // Award negative XP to author (-5)
        if (authorId !== user.uid) {
          try {
            await updateDoc(authorRef, {
              xp: increment(-5),
              updatedAt: serverTimestamp()
            });
          } catch (authorErr) {
            console.warn("Couldn't update author XP on unlike:", authorErr);
          }
        }

        // Award negative XP to liker (-2)
        try {
          await updateDoc(likerRef, {
            xp: increment(-2),
            updatedAt: serverTimestamp()
          });
        } catch (likerErr) {
          console.warn("Couldn't update liker XP on unlike:", likerErr);
        }
      } else {
        // Like post
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(user.uid)
        });

        // Award XP to author (+5)
        if (authorId !== user.uid) {
          try {
            await updateDoc(authorRef, {
              xp: increment(5),
              updatedAt: serverTimestamp()
            });
          } catch (authorErr) {
            console.warn("Couldn't update author XP on like:", authorErr);
          }
        }

        // Award XP to liker (+2)
        try {
          await updateDoc(likerRef, {
            xp: increment(2),
            updatedAt: serverTimestamp()
          });
        } catch (likerErr) {
          console.warn("Couldn't update liker XP on like:", likerErr);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  if (loading) return <LoadingScreen />;

  if (showGateway) {
    return (
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
        isAuthenticated={!!user} 
        userEmail={user?.email} 
        authError={authError}
        setAuthError={setAuthError}
        quotaError={quotaError}
      />
    );
  }

  if (!user) {
    setShowGateway(true);
    return null;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-gray-200 flex font-sans selection:bg-purple-500/30">
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
      
      <aside className={`fixed lg:sticky top-0 h-screen ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 lg:w-20 -translate-x-full lg:translate-x-0'} bg-zinc-950 border-r border-zinc-850 transition-all duration-500 ease-in-out flex flex-col z-50 overflow-hidden`}>
        <div className="h-24 flex items-center px-8 border-b border-zinc-850 overflow-hidden">
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
          <NavItem icon={<Shield className="w-5 h-5 text-amber-500 animate-pulse" />} label="Intel Briefing" secondaryLabel="गोपनीय जानकारी" active={false} onClick={() => setShowGateway(true)} collapsed={!isSidebarOpen} />
          <NavItem icon={<Flame className="w-5 h-5" />} label="100-Day Journey" secondaryLabel="१०० दिन का सफर" active={activeTab === 'journey'} onClick={() => setActiveTab('journey')} collapsed={!isSidebarOpen} />
          <NavItem icon={<PlayCircle className="w-5 h-5" />} label="Video Archives" secondaryLabel="वीडियो लाइब्रेरी" active={activeTab === 'archives'} onClick={() => setActiveTab('archives')} collapsed={!isSidebarOpen} />
          <NavItem icon={<BookOpen className="w-5 h-5" />} label="The Great Library" secondaryLabel="महान पुस्तकालय" active={activeTab === 'library'} onClick={() => setActiveTab('library')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Users className="w-5 h-5" />} label="Community" secondaryLabel="समुदाय" active={activeTab === 'community'} onClick={() => setActiveTab('community')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Trophy className="w-5 h-5" />} label="Leaderboard" secondaryLabel="लीडरबोर्ड" active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} collapsed={!isSidebarOpen} />
          <NavItem icon={<ShoppingCart className="w-5 h-5" />} label="Strategic Shop" secondaryLabel="रणनीतिक दुकान" active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} collapsed={!isSidebarOpen} />
          <NavItem icon={<User className="w-5 h-5" />} label="Profile Hub" secondaryLabel="प्रोफ़ाइल हब" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} collapsed={!isSidebarOpen} />
          
          {profile?.isAdmin && (
            <NavItem icon={<Settings className="w-5 h-5" />} label="Admin Panel" secondaryLabel="एडमिन कंट्रोल" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} collapsed={!isSidebarOpen} />
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
                      <div className="text-base font-bold text-white capitalize">{profile.displayName.split(' ')[0]}</div>
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

      <main className="flex-1 flex flex-col relative z-10">
        <header className="h-20 md:h-24 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-[10px] md:text-xs uppercase tracking-wider font-semibold text-gray-400 whitespace-nowrap">
              Menu / <span className="text-white">{activeTab.replace('-', ' ')}</span>
            </h2>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Total Points</span>
              <span className="text-lg md:text-xl font-bold font-mono text-white leading-none">{(profile?.xp || 0).toLocaleString()}</span>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center p-0.5 overflow-hidden ring-1 ring-white/5 ring-offset-2 ring-offset-black cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('profile')}>
              <img src={profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16 max-w-7xl w-full mx-auto">
          {quotaError && (
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
              <motion.div key="journey" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-16">
                {/* Real-time Journey Calendar */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-6">
                  <PresenceCalendar 
                    presenceDays={profile?.presenceDays || []} 
                    completedDaysCount={profile?.completedDays?.length || 0}
                  />

                  {/* TFS Strike System Warning banner */}
                  {(() => {
                    if (!profile || !profile.completedDays || profile.completedDays.length === 0) return null;
                    if (!profile.lastCompletedAt) return null;
                    
                    const lastCompleted = profile.lastCompletedAt?.toDate?.() || new Date(profile.lastCompletedAt);
                    const now = new Date();
                    const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const lastCompletedDateOnly = new Date(lastCompleted.getFullYear(), lastCompleted.getMonth(), lastCompleted.getDate());
                    const daysSinceLastSuccess = Math.floor((todayDateOnly.getTime() - lastCompletedDateOnly.getTime()) / (1000 * 60 * 60 * 24));
                    
                    if (daysSinceLastSuccess === 2) {
                      return (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-amber-500/10 border-2 border-amber-500/30 rounded-[24px] p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden">
                          <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-amber-500" />
                          <div className="w-12 h-12 bg-amber-500/15 rounded-full flex items-center justify-center border border-amber-500/20 text-2xl shrink-0 animate-pulse">
                            ⚠️
                          </div>
                          <div className="flex-1 space-y-1 text-center md:text-left">
                            <h4 className="text-amber-500 font-display font-black text-xs uppercase tracking-widest font-mono">
                              1 Strike Active / १ स्ट्राइक सक्रिय!
                            </h4>
                            <p className="text-white font-bold text-base leading-snug">
                              आपने कल टास्क की संकलन (Integrate) नहीं की!
                            </p>
                            <p className="text-gray-400 text-xs md:text-sm">
                              आज का टास्क खत्म करें, नहीं तो आपकी पूरी 100-दिन की प्रगति <span className="text-amber-500 font-bold">शून्य (Day 1)</span> पर रीसेट हो जाएगी।
                            </p>
                          </div>
                          <div className="bg-amber-500/10 px-4 py-1.5 rounded-full text-[9px] font-black text-amber-400 uppercase tracking-widest border border-amber-500/15 animate-pulse shrink-0">
                            CRITICAL LIFELINE
                          </div>
                        </motion.div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {(() => {
                  const nextDay = (profile?.completedDays.length || 0) + 1;
                  const currentModule = journeyModules.find(m => m.day === nextDay) || journeyModules[0];
                  
                  const { hour: istHour, dateStr: istDateStr } = getIstHourAndDateStr();
                  const requiresReflection = istHour >= 22 && (!profile?.dailyReflections || !profile.dailyReflections[istDateStr]);
                  const hasSubmittedReflection = profile?.dailyReflections && profile.dailyReflections[istDateStr];

                  if (requiresReflection) {
                    return (
                      <div className="bg-gradient-to-b from-zinc-950 to-[#0a0a0a] border-2 border-amber-500/30 rounded-[32px] md:rounded-[48px] p-6 md:p-12 relative overflow-hidden group shadow-[0_0_50px_rgba(245,158,11,0.12)]">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
                        <div className="relative z-10 space-y-6 md:space-y-8">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                              <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-bounce"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                              </span>
                              <span className="text-xs md:text-sm font-black uppercase tracking-widest text-amber-500 font-mono">10:00 PM - The Nightly Council / रात्रि चिंतन</span>
                            </div>
                            <span className="text-[10px] font-mono text-white/30 font-bold uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full">{istDateStr} IST</span>
                          </div>
                          
                          <div className="space-y-3">
                            <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight leading-tight uppercase">
                              REFLECTION REQUIRED
                            </h2>
                            <h3 className="text-xl md:text-3xl font-bold text-amber-400 tracking-tight">चिंतन का सवाल: "आज तुमने दुनिया को क्या सिखाया?"</h3>
                            <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
                              भारत के समय के अनुसार रात 10 बज चुके हैं। टॉक2सोसाइटी का नियम है: आज के चिंतन को दर्ज किए बिना आप सफर में आगे नहीं बढ़ सकते।
                            </p>
                          </div>

                          <div className="space-y-4 max-w-2xl">
                            <textarea
                              value={reflectionText}
                              onChange={(e) => setReflectionText(e.target.value)}
                              placeholder="Write your reflection here ... (आज का ज्ञान, सबक या विचार जो आपने किसी को सिखाया या संसार को दिया...)"
                              className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-2xl px-6 py-4 text-sm md:text-base text-white placeholder-gray-650 focus:outline-none focus:ring-1 focus:ring-amber-500/30 h-32 md:h-40 resize-none transition-all font-medium"
                            />
                            
                            <button
                              disabled={isReflectionSubmitting || !reflectionText.trim()}
                              onClick={async () => {
                                if (!reflectionText.trim()) return;
                                setIsReflectionSubmitting(true);
                                await submitDailyReflection(reflectionText);
                                setReflectionText("");
                                setIsReflectionSubmitting(false);
                              }}
                              className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-amber-500 hover:bg-amber-400 text-black text-xs md:text-sm font-black uppercase tracking-wider rounded-2xl transition-all flex flex-col items-center gap-1 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-sans"
                            >
                              <span>{isReflectionSubmitting ? "Locking in..." : "Lock in Reflection / चिंतन सहेजें"}</span>
                              <span className="text-[9px] font-bold opacity-60 uppercase tracking-normal normal-case">Unlocks Next Day (+25 XP)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-[32px] md:rounded-[48px] p-6 md:p-12 relative overflow-hidden group shadow-2xl">
                      <div className="relative z-10 space-y-6 md:space-y-8">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                            <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-white/60">Your Path / आपकी प्रगति</span>
                          </div>
                          {hasSubmittedReflection && (
                            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-1.5 animate-pulse">
                              ✓ REFLECTION COMPLETED / चिंतन पूरा हुआ
                            </span>
                          )}
                        </div>
                        <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight leading-tight uppercase">
                          TODAY'S GOAL: <span className="text-gray-500">{currentModule?.title || 'Starting Point'}</span>
                        </h2>
                        <h3 className="text-xl md:text-3xl font-bold text-white/40 tracking-tight">लक्ष्य: {currentModule?.title || 'शुरुआत'}</h3>
                        <p className="text-gray-400 text-sm md:text-lg max-w-2xl leading-relaxed font-medium">
                          {currentModule?.description || 'Your journey into mind training begins here. Complete the modules below to progress.'}
                        </p>
                        <button 
                          onClick={() => {
                            if (currentModule) {
                              const moduleEl = document.getElementById(`module-${currentModule.id}`);
                              moduleEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }} 
                          className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-white text-black text-xs md:text-sm font-bold uppercase tracking-wider rounded-2xl hover:bg-neutral-200 transition-all flex flex-col items-center gap-1.5 shadow-2xl"
                        >
                           <span>{currentModule ? `Start Day ${currentModule.day}` : 'Begin Journey'}</span>
                           <span className="text-[10px] md:text-[11px] opacity-60 normal-case tracking-normal">{currentModule ? `डे ${currentModule.day} शुरू करें` : 'सफर शुरू करें'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12 pt-8 md:pt-12">
                  <div className="max-w-2xl space-y-4 md:space-y-6">
                    <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tight leading-tight uppercase">
                      100-Day <span className="text-gray-500">Journey</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-2xl leading-relaxed font-medium">
                      A simple, practical path to improving your mental strength. One step at a time.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-6 md:p-8 rounded-[32px] min-w-[200px] md:min-w-[240px]">
                    <div className="text-3xl md:text-4xl font-display font-black text-white mb-2">{(profile?.completedDays.length || 0)}/100</div>
                    <div className="text-[10px] md:text-xs uppercase tracking-wider text-gray-500 font-bold mb-4">Progress Status</div>
                    <ProgressBar progress={(profile?.completedDays.length || 0)} />
                  </div>
                </div>

                {profile && (
                  <JourneyProgressCalendar 
                    completedDays={profile.completedDays || []} 
                  />
                )}

                {journeyModules.length === 0 ? <NoContent label="Journey Modules" /> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {journeyModules.map((module) => {
                      const isCompleted = profile?.completedDays.includes(module.day);
                      const isNext = (profile?.completedDays.length || 0) + 1 === module.day;
                      const journeyLocked = !isCompleted && !isNext && module.day > 1;
                      const isPremiumLocked = module.isPremium && !profile?.isStrategist && !profile?.isAdmin;
                      const finalLocked = journeyLocked || isPremiumLocked;

                      return (
                        <Card 
                          key={module.id} 
                          id={`module-${module.id}`} 
                          className={`cursor-pointer transition-all duration-300 relative overflow-hidden group ${finalLocked ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-white/20 hover:bg-white/[0.02]'}`}
                          onClick={() => {
                            if (!finalLocked) {
                              setSelectedJourneyModule(module);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start mb-6">
                            <span className="text-5xl font-black text-white/5 group-hover:text-amber-500/20 transition-colors duration-500 font-mono">
                              {module.day < 10 ? `0${module.day}` : module.day}
                            </span>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white" /> : finalLocked ? <Lock className="w-5 h-5 text-gray-700" /> : <ChevronRight className="w-5 h-5 text-white" />}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-white leading-tight">
                              {finalLocked ? "🔒 Locked Protocol / लॉक प्रोटोकॉल" : module.title}
                            </h3>
                            {module.isPremium && <Zap className="w-4 h-4 text-white fill-white shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed mb-6 h-12 overflow-hidden line-clamp-3">
                            {finalLocked 
                              ? "इस नियम को खोलने के लिए पिछले दिनों के कार्य पूरे करें। / Complete the previous days' protocols to unlock." 
                              : module.description}
                          </p>
                          {!finalLocked && !isCompleted && (
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                completeDay(module.day); 
                              }} 
                              className="w-full py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all flex flex-col items-center"
                            >
                              <span className="flex items-center gap-2"><Zap className="w-3 h-3" /> Integrate</span>
                              <span className="text-[8px] normal-case tracking-normal opacity-50">शुरू करें</span>
                            </button>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
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
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'library' && (
              <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {library.length === 0 ? (
          <div className="lg:col-span-3">
            <NoContent label="Library Archives" />
            {profile?.isAdmin && (
              <div className="text-center">
                <button 
                  onClick={() => setActiveTab('admin')} 
                  className="text-amber-500 text-xs font-black uppercase tracking-widest border-b border-amber-500/20 hover:border-amber-500 transition-all"
                >
                  Go to Command Panel to Seed Library
                </button>
              </div>
            )}
          </div>
        ) : library.map(b => (
                  <BookCard 
                    key={b.id} 
                    book={b} 
                    isLocked={b.isPremium && !profile?.isStrategist && !profile?.isAdmin}
                    onClick={() => setSelectedBook(b)}
                  />
                ))}
              </motion.div>
            )}

            {activeTab === 'community' && (
              <motion.div key="community" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <CommunityStat label="Users Online" secondaryLabel="सक्रीय सदस्य" value={stats.users.toLocaleString()} icon={<Users className="w-4 h-4" />} />
                  <CommunityStat label="Total Posts" secondaryLabel="कुल पोस्ट" value={stats.posts.toLocaleString()} icon={<TrendingUp className="w-4 h-4" />} />
                  <div className="sm:col-span-2 lg:col-span-1">
                    <CommunityStat label="Global Level" secondaryLabel="ग्लोबल लेवल" value={String(Math.floor(stats.users > 0 ? (stats.totalXp / stats.users) / 100 : 0) + 1)} icon={<Shield className="w-4 h-4" />} />
                  </div>
                </div>
                <PostForm onSubmit={createPost} user={user} displayName={profile?.displayName} />
                <div className="space-y-4">
                  {posts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onLike={() => likePost(post.id, post.authorId)} 
                      currentUserId={user?.uid}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'leaderboard' && (
              <motion.div key="leaderboard" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-12">
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tight uppercase italic underline decoration-amber-500/30 decoration-8 underline-offset-8">Global <span className="text-gray-500">Hierarchy</span></h1>
                  <p className="text-gray-400 text-lg md:text-2xl leading-relaxed font-medium">The most disciplined minds in the society. Ranks are awarded based on total experience and consistency.</p>
                </div>
                <div className="max-w-5xl">
                   <LeaderboardView currentUserUid={user?.uid} />
                </div>
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
        {selectedVideo && (
          <ContentModal 
            title={selectedVideo.title} 
            onClose={() => setSelectedVideo(null)}
          >
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
          </ContentModal>
        )}

        {selectedBook && (
          <ContentModal 
            title={selectedBook.title} 
            onClose={() => setSelectedBook(null)}
            maxWidth="max-w-7xl"
          >
            <div className="h-full flex flex-col min-h-[85vh]">
              <div className="p-8 border-b border-white/5 bg-black/40 shrink-0 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-8 items-start">
                  <div className="w-20 h-28 bg-neutral-900 border border-white/5 rounded-xl flex items-center justify-center shadow-2xl shrink-0">
                    <BookOpen className="w-8 h-8 text-amber-500" />
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
          </ContentModal>
        )}

        {isSearchOpen && (
          <SearchModal 
            onClose={() => setIsSearchOpen(false)} 
            journey={journeyModules} 
            archives={archives} 
            library={library} 
            profile={profile}
            onSelect={(type, item) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        className="bg-zinc-950 border-2 border-red-500/30 rounded-[32px] md:rounded-[40px] p-8 md:p-12 max-w-xl w-full text-center space-y-8 shadow-[0_0_50px_rgba(239,68,68,0.25)] relative overflow-hidden"
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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAscension = async () => {
    setLoading(true);
    // Simulate payment call
    setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'users', profile.uid), { isStrategist: true });
        setStep(3);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${profile.uid}`);
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="w-full max-w-lg bg-[#0a0a0a] border border-white/20 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-2 bg-neutral-900 w-full overflow-hidden">
          <motion.div 
            initial={{ width: '33%' }} 
            animate={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }} 
            className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)]"
          />
        </div>
        
        <div className="p-12 text-center space-y-8 relative">
          <button 
            onClick={onClose} 
            className="absolute top-8 left-8 p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          {step === 1 && (
            <>
              <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[32px] mx-auto flex items-center justify-center">
                <Zap size={48} className="text-white fill-white" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Special Access / विशेष एक्सेस</h2>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  Unlock all premium books and video lessons. Join our community of advanced mind trainers.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
                  <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black italic">$99</div>
                  <div>
                    <div className="text-white font-bold uppercase text-xs tracking-widest">Lifetime Access</div>
                    <div className="text-[10px] text-gray-600 font-bold">जीवनभर के लिए एक्सेस</div>
                  </div>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all flex flex-col items-center"
                >
                  <span>Continue to Unlock</span>
                  <span className="text-[8px] normal-case tracking-normal opacity-60">आगे बढ़ें</span>
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-6">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-8" />
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Synchronizing Ledger...</h2>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-[0.2em]">Contacting Strategic Reserve</p>
                <div className="pt-8">
                   <button 
                     disabled={loading}
                     onClick={handleAscension}
                     className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl"
                   >
                     {loading ? "PROCESSING..." : "FINAL AUTHORIZATION"}
                   </button>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <motion.div 
                initial={{ scale: 0.5 }} 
                animate={{ scale: 1 }} 
                className="w-24 h-24 bg-white rounded-[32px] mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)]"
              >
                <CheckCircle2 size={48} className="text-black" />
              </motion.div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Ascension Complete</h2>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  Your profile has been elevated to Strategist. Your connection to the Nexus is now absolute.
                </p>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  Enter the Chamber
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// --- Sub-Components ---

function ProfileView({ profile, rank, onOpenAscension }: { profile: UserProfile, rank: number | null, onOpenAscension: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(profile.displayName);
  const [newBio, setNewBio] = useState(profile.bio || "");
  const [newPhotoURL, setNewPhotoURL] = useState(profile.photoURL || "");
  const [isUploading, setIsUploading] = useState(false);

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
      <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
        <div className="w-40 h-40 rounded-[40px] overflow-hidden ring-4 ring-white/5 ring-offset-8 ring-offset-black shrink-0 shadow-2xl relative group">
          <img src={newPhotoURL || profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`} alt="avatar" className="w-full h-full object-cover" />
          {isEditing && (
            <label className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Upload className="w-8 h-8 text-white mb-2" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Upload New</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-6">
          <div className="text-white/40 text-xs font-bold uppercase tracking-wider">Level {profile.level} / चरण {profile.level}</div>
          
          {isEditing ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Identity Display (नाम)</label>
                <input 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Your Name (आपका नाम)"
                  className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-3xl font-display font-black text-white w-full max-w-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Profile Visual (प्रोफ़ाइल चित्र)</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="flex items-center gap-3 px-6 py-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-xs font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-all"
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
              <div className="flex gap-4">
                <button onClick={updateProfile} className="px-8 py-3 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 shadow-xl">
                  <Save size={16}/> Save Profile / सुरक्षित करें
                </button>
                <button onClick={() => {
                  setIsEditing(false);
                  setNewName(profile.displayName);
                  setNewBio(profile.bio || "");
                  setNewPhotoURL(profile.photoURL || "");
                }} className="px-8 py-3 bg-white/5 text-white rounded-xl text-xs font-bold uppercase tracking-wider">
                  Cancel / रद्द करें
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tight uppercase leading-none">{profile.displayName}</h1>
                <button onClick={() => setIsEditing(true)} className="p-2 md:p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/5"><Edit2 size={18}/></button>
              </div>
              <p className="text-gray-400 text-base md:text-lg max-w-xl font-medium italic leading-relaxed">
                {profile.bio || "No summary provided. Edit your profile to share your journey. (कोई जानकारी उपलब्ध नहीं है।)"}
              </p>
              <div className="flex items-center gap-3 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
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
        {!profile.isStrategist && !profile.isAdmin && (
          <Card className="lg:col-span-2 bg-white/5 border-white/20">
            <div className="flex flex-col md:flex-row items-center gap-8 py-4">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)] rotate-3">
                <Zap size={48} className="text-black fill-black" />
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Join Special Group / विशेष सदस्य बनें</h2>
                <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-xl">
                  Unlock the full potential. Access all books, video breakdowns, and special training modules. Move from being a member to a guide.
                </p>
                <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                   <button 
                     onClick={onOpenAscension}
                     className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-gray-200 transition-all shadow-xl flex flex-col items-center"
                   >
                     <span>Unlock Special Access</span>
                     <span className="text-[8px] normal-case tracking-normal opacity-60">विशेष एक्सेस लें</span>
                   </button>
                   <div className="px-6 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-700 font-mono">
                     Special Membership Required
                   </div>
                </div>
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
            <ProgressBar progress={(profile.xp % 1000) / 10} label="Current Level Progress" />
            <ProgressBar progress={profile.completedDays.length} label="100 Day Goal Status" />
            <ProgressBar progress={Math.min(100, profile.level * 15)} label="Overall Growth" />
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
             {profile.completedDays.length === 0 ? (
               <p className="text-gray-500 italic text-sm">No modules integrated into frame yet.</p>
             ) : (
               [...profile.completedDays].reverse().slice(0, 5).map(day => (
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

        <div className="lg:col-span-2 mt-8">
          <LeaderboardView currentUserUid={profile.uid} />
        </div>
      </div>
    </motion.div>
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
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users/leaderboard'));
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
              <div className="text-2xl font-display font-black text-white italic">{leader.xp.toLocaleString()}<span className="text-[10px] ml-1 opacity-40 uppercase tracking-widest">xp</span></div>
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
                      <div className="text-sm font-black text-white italic">{leader.xp.toLocaleString()}</div>
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

function VideoCard({ video, onClick, isLocked }: { video: VideoArchive, onClick: () => void, isLocked?: boolean, key?: React.Key }) {
  return (
    <div className={`group cursor-pointer ${isLocked ? 'grayscale opacity-60' : ''}`} onClick={isLocked ? undefined : onClick}>
      <div className="relative aspect-video rounded-[32px] overflow-hidden mb-6 border border-white/5 shadow-2xl transition-all group-hover:scale-[1.02]">
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isLocked ? (
            <div className="w-16 h-16 bg-neutral-900 border border-white/10 rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform"><Lock className="w-6 h-6 text-gray-400" /></div>
          ) : (
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform"><PlayCircle className="w-8 h-8 text-black" /></div>
          )}
        </div>
        {video.isPremium && (
          <div className="absolute top-4 right-4 px-4 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg">
            Premium <Zap size={10} fill="black" />
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
        <button className={`w-full py-4 border border-white/10 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all ${isLocked ? 'text-gray-600 bg-white/5 cursor-not-allowed' : 'text-gray-400 group-hover:bg-white group-hover:text-black'}`}>
          {isLocked ? 'Locked' : 'Watch Now'}
        </button>
      </div>
    </div>
  );
}

function BookCard({ book, onClick, isLocked }: { book: LibraryBook, onClick: () => void, isLocked?: boolean, key?: React.Key }) {
  return (
    <div className={`flex flex-col sm:flex-row gap-6 md:gap-8 group cursor-pointer ${isLocked ? 'grayscale opacity-60' : ''}`} onClick={isLocked ? undefined : onClick}>
      <div className="w-full sm:w-40 h-56 md:h-56 bg-neutral-900 border border-white/5 rounded-3xl shadow-2xl transition-all group-hover:-translate-y-2 flex flex-col p-0 overflow-hidden shrink-0 relative">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 font-display" />
        ) : (
          <div className="flex-1 border border-white/5 rounded flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white/40" />
          </div>
        )}
        
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
            <Lock className="w-10 h-10 text-white/40" />
          </div>
        )}

        {book.isPremium && (
          <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-xl z-10">
            <Zap size={12} className="text-black" fill="black" />
          </div>
        )}
      </div>
      <div className="flex-1 space-y-4 py-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">{book.category}</div>
        </div>
        <h3 className="text-3xl font-display font-black text-white tracking-tight leading-tight">{book.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-4 font-medium italic">"{book.excerpt}"</p>
        <button className={`pt-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${isLocked ? 'text-gray-700 border-white/5 cursor-not-allowed' : 'text-white border-white/20 hover:border-white'}`}>
          {isLocked ? 'Access Restricted' : 'Read Manuscript'} <ChevronRight className="w-4 h-4" />
        </button>
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

function PostCard({ post, onLike, currentUserId }: { post: CommunityPost, onLike?: () => void, currentUserId?: string, key?: React.Key }) {
  const hasLiked = currentUserId && post.likedBy?.includes(currentUserId);
  return (
    <Card className="p-6 md:p-8 group hover:scale-[1.01] transition-transform">
      <div className="flex justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-bold text-white/40 uppercase border border-white/5 overflow-hidden">
            {post.authorPhotoURL ? (
              <img src={post.authorPhotoURL} alt={post.authorName} className="w-full h-full object-cover" />
            ) : (
              post.authorName?.charAt(0)
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-xs md:text-sm font-bold text-white uppercase leading-tight">{post.authorName}</div>
            <div className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-tight">Community Member</div>
          </div>
        </div>
      </div>
      <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6 md:mb-8 font-medium group-hover:text-white transition-colors">{post.content}</p>
      <div className="flex gap-4 md:gap-6 border-t border-white/5 pt-4 md:pt-6">
        <button 
          onClick={onLike}
          className={`flex items-center gap-3 text-xs font-bold uppercase tracking-wider transition-all group/like ${hasLiked ? 'text-amber-500 hover:text-amber-400' : 'text-gray-500 hover:text-white'}`}
        >
          <Heart className={`w-5 h-5 transition-all ${hasLiked ? 'fill-amber-500 text-amber-500 scale-110' : 'group-hover/like:scale-125'}`} /> 
          {post.likes} <span className="hidden sm:inline">{post.likes === 1 ? 'Like' : 'Likes'}</span>
        </button>
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

function CommunityStat({ label, secondaryLabel, value, icon }: { label: string, secondaryLabel?: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-[#0b0b0b] border border-zinc-800 p-6 rounded-3xl text-center space-y-3 group hover:border-zinc-700 transition-all flex flex-col items-center">
      <div className="flex flex-col items-center gap-1.5 text-zinc-300 group-hover:text-white transition-colors">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[10px] font-extrabold uppercase tracking-wider leading-tight">{label}</span>
        </div>
        {secondaryLabel && <span className="text-[8px] font-extrabold text-amber-500/95">{secondaryLabel}</span>}
      </div>
      <div className="text-3xl font-display font-black text-white">{value}</div>
    </div>
  );
}

function ShopView({ profile }: { profile: UserProfile }) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'shop'), orderBy('category', 'asc'));
    return onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as ShopProduct)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'shop'));
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

  const defaultProducts: ShopProduct[] = [
    {
      id: '1',
      name: 'The 48 Laws of Power',
      description: 'The definitive guide to understanding power dynamics in any situation. A must-read for strategic thinkers.',
      price: '₹499',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
      affiliateUrl: 'https://amazon.in',
      platform: 'Amazon',
      category: 'Power'
    },
    {
      id: '2',
      name: 'Thinking, Fast and Slow',
      description: 'Understanding the two systems that drive the way we think. Psychological foundation for master strategists.',
      price: '₹599',
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
      affiliateUrl: 'https://amazon.in',
      platform: 'Amazon',
      category: 'Psychology'
    }
  ];

  const displayProducts = products.length > 0 ? products : defaultProducts;

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-zinc-950 border border-white/10 rounded-[32px] md:rounded-[40px] max-w-2xl w-full text-left p-6 md:p-10 shadow-2xl relative overflow-hidden my-8"
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
