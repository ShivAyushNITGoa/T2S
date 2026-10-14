import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  increment,
  arrayUnion,
  where,
  getCountFromServer,
} from 'firebase/firestore';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  isOfflineError,
} from '../config/firebase';
import {
  isDesignatedAdminEmail,
  isUserAdmin,
  STORAGE_KEYS,
} from '../config/constants';
import {
  UserProfile,
  JourneyModule,
  VideoArchive,
  LibraryBook,
  VipSectionGates,
  SystemAnnouncement,
  ToastNotice,
  TabType,
} from '../types';
import { RAW_JOURNEY_MODULES, getCategoryForDay } from '../data/journeyData';
import {
  getLocalDateString,
  getIstHourAndDateStr,
  parseDateTime,
  isCompletedOnDate,
} from '../utils/dateUtils';
import { isDemoArchiveItem, isDemoLibraryItem } from '../utils/mediaUtils';
import { navHistory } from '../utils/navigationHistory';
import {
  sanitizeForFirestore,
  prepareForFirestoreWrite,
  getItemTimestampMs,
  mergeContentById,
  mergeSingleUserProfile,
  mergeUsersLists,
  getCachedUsersRegistry,
  saveUsersRegistry,
  normalizeCompletedDays,
  markDocDeleted,
  unmarkDocDeleted,
  getDeletedDocIds,
  broadcastContentUpdate,
  subscribeContentBroadcast,
  pushServerSync,
  fetchServerSync,
} from '../utils/contentSync';

function createDefaultGuestProfile(): UserProfile {
  const todayStr = getLocalDateString();
  return {
    uid: 'guest',
    email: 'guest@talk2society.local',
    displayName: 'Sovereign Practitioner (Guest)',
    photoURL: '',
    xp: 0,
    level: 1,
    completedDays: [],
    presenceDays: [todayStr],
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    streak: 1,
    isAdmin: false,
    isStrategist: false,
    bio: '',
    referredBy: '',
    dailyReflections: {},
  };
}

interface AppContextValue {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  loading: boolean;
  isOffline: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  quotaError: boolean;
  isCurrentUserAdmin: boolean;
  isUserVip: boolean;
  rank: number | null;
  stats: { users: number; totalXp: number };

  // Navigation & Layout
  activeTab: TabType;
  showGateway: boolean;
  isSidebarOpen: boolean;
  openSidebarDrawer: () => void;
  closeSidebarDrawer: () => void;
  handleTabClick: (nextTab: TabType) => void;
  handleEnterGateway: () => void;
  handleDesktopBack: () => void;
  canGoBack: boolean;

  // Content Collections
  allUsers: UserProfile[];
  journeyModules: JourneyModule[];
  archives: VideoArchive[];
  library: LibraryBook[];
  vipGates: VipSectionGates;
  isSectionVipGated: (key: keyof VipSectionGates) => boolean;
  upsertUserAccount: (
    userUpdate: Partial<UserProfile> & { uid: string },
    options?: { forceReplaceDays?: boolean }
  ) => Promise<void>;
  deleteUserAccountById: (uid: string) => Promise<void>;
  refreshFromCacheAndServer: () => Promise<void>;
  upsertArchiveItem: (item: VideoArchive) => void;
  deleteArchiveItem: (id: string) => void;
  upsertLibraryItem: (item: LibraryBook) => void;
  deleteLibraryItem: (id: string) => void;
  upsertJourneyItem: (item: JourneyModule) => void;
  deleteJourneyItem: (day: number) => void;
  updateVipGates: (nextGates: VipSectionGates) => void;

  // Broadcasts & Toasts
  activeAnnouncement: SystemAnnouncement | null;
  dismissedAnnouncementId: string | null;
  dismissAnnouncement: (id: string) => void;
  toast: ToastNotice | null;
  showToast: (t: Omit<ToastNotice, 'id'>) => void;
  dismissToast: () => void;

  // Modals
  selectedVideo: VideoArchive | null;
  openVideoModal: (v: VideoArchive) => void;
  closeVideoModal: () => void;
  selectedBook: LibraryBook | null;
  openBookModal: (b: LibraryBook) => void;
  closeBookModal: () => void;
  selectedJourneyModule: JourneyModule | null;
  openJourneyModuleModal: (m: JourneyModule) => void;
  closeJourneyModuleModal: () => void;
  isSearchOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;
  isAscensionOpen: boolean;
  openAscensionModal: () => void;
  closeAscensionModal: () => void;
  isResetModalOpen: boolean;
  closeResetModal: () => void;
  showCertificateModal: boolean;
  setShowCertificateModal: (open: boolean) => void;
  showJournalModal: boolean;
  setShowJournalModal: (open: boolean) => void;

  // Core Actions
  handleLogin: () => Promise<void>;
  handleLoginWithRedirect: () => Promise<void>;
  handleLogout: () => Promise<void>;
  completeDay: (day: number) => Promise<void>;
  submitDailyReflection: (content: string) => Promise<void>;
  claimSovereignXp: (amount: number, reason: string) => Promise<void>;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const guestStr = localStorage.getItem(STORAGE_KEYS.GUEST_PROFILE);
      if (guestStr) return JSON.parse(guestStr);
    } catch {}
    return createDefaultGuestProfile();
  });
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [quotaError, setQuotaError] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const urlTab = new URLSearchParams(window.location.search).get('tab');
      if (
        urlTab &&
        [
          'journey',
          'framework',
          'blueprint',
          'archives',
          'library',
          'admin',
          'profile',
          'shop',
          'affiliate',
          'leaderboard',
          'forum',
        ].includes(urlTab)
      ) {
        return urlTab as TabType;
      }
    } catch {}
    return 'journey';
  });
  const [showGateway, setShowGateway] = useState<boolean>(() => {
    try {
      const urlTab = new URLSearchParams(window.location.search).get('tab');
      if (urlTab) return false;
    } catch {}
    return true;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [historyDepth, setHistoryDepth] = useState<number>(0);

  // Modals
  const [selectedVideo, setSelectedVideo] = useState<VideoArchive | null>(null);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [selectedJourneyModule, setSelectedJourneyModule] = useState<JourneyModule | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAscensionOpen, setIsAscensionOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [showCertificateModalState, setShowCertificateModalState] = useState(false);
  const [showJournalModalState, setShowJournalModalState] = useState(false);

  const setShowCertificateModal = useCallback((open: boolean) => {
    setShowCertificateModalState(open);
    if (open) {
      navHistory.push('modal-certificate', () => setShowCertificateModalState(false));
    } else {
      navHistory.remove('modal-certificate');
    }
  }, []);

  const setShowJournalModal = useCallback((open: boolean) => {
    setShowJournalModalState(open);
    if (open) {
      navHistory.push('modal-journal', () => setShowJournalModalState(false));
    } else {
      navHistory.remove('modal-journal');
    }
  }, []);

  // Content Collections
  const [journeyModules, setJourneyModules] = useState<JourneyModule[]>(() => {
    let dbModules: JourneyModule[] = [];
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.JOURNEY_CACHE);
      if (cached) dbModules = JSON.parse(cached);
    } catch {}
    return Array.from({ length: 100 }, (_, i) => {
      const d = i + 1;
      const exists = dbModules.find((m) => m.day === d);
      if (exists) {
        return { ...exists, category: exists.category || getCategoryForDay(d) } as JourneyModule;
      }
      const raw = RAW_JOURNEY_MODULES.find((m) => m.day === d)!;
      return {
        id: `raw-${d}`,
        ...raw,
        category: raw.category || getCategoryForDay(d),
      } as JourneyModule;
    });
  });

  const [archives, setArchives] = useState<VideoArchive[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.ARCHIVES_CACHE);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter((v) => !isDemoArchiveItem(v));
        }
      }
    } catch {}
    return [];
  });

  const [library, setLibrary] = useState<LibraryBook[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.LIBRARY_CACHE);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter((b) => !isDemoLibraryItem(b));
        }
      }
    } catch {}
    return [];
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() =>
    getCachedUsersRegistry()
  );

  const [vipGates, setVipGates] = useState<VipSectionGates>(() => {
    try {
      const cached = localStorage.getItem('t2s_vip_gates_cache_v1');
      if (cached) return JSON.parse(cached);
    } catch {}
    return {};
  });
  const [activeAnnouncement, setActiveAnnouncement] = useState<SystemAnnouncement | null>(null);
  const [dismissedAnnouncementId, setDismissedAnnouncementId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.DISMISSED_BROADCAST);
    } catch {
      return null;
    }
  });

  const [toast, setToast] = useState<ToastNotice | null>(null);
  const [stats, setStats] = useState({ users: 1, totalXp: 0 });
  const [rank, setRank] = useState<number | null>(null);

  const isCurrentUserAdmin = isUserAdmin(user, profile);
  const isUserVip = Boolean(profile?.isStrategist || profile?.isAdmin || isCurrentUserAdmin);

  const showToast = useCallback((t: Omit<ToastNotice, 'id'>) => {
    setToast({ id: Date.now(), ...t });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Navigation History helpers
  useEffect(() => {
    navHistory.init();
    setHistoryDepth(navHistory.getDepth());
    return navHistory.subscribe(() => {
      setHistoryDepth(navHistory.getDepth());
    });
  }, []);

  const openVideoModal = useCallback((v: VideoArchive) => {
    setSelectedVideo(v);
    navHistory.push('modal-video', () => setSelectedVideo(null));
  }, []);
  const closeVideoModal = useCallback(() => {
    setSelectedVideo(null);
    navHistory.remove('modal-video');
  }, []);

  const openBookModal = useCallback((b: LibraryBook) => {
    setSelectedBook(b);
    navHistory.push('modal-book', () => setSelectedBook(null));
  }, []);
  const closeBookModal = useCallback(() => {
    setSelectedBook(null);
    navHistory.remove('modal-book');
  }, []);

  const openSearchModal = useCallback(() => {
    setIsSearchOpen(true);
    navHistory.push('modal-search', () => setIsSearchOpen(false));
  }, []);
  const closeSearchModal = useCallback(() => {
    setIsSearchOpen(false);
    navHistory.remove('modal-search');
  }, []);

  const openAscensionModal = useCallback(() => {
    setIsAscensionOpen(true);
    navHistory.push('modal-ascension', () => setIsAscensionOpen(false));
  }, []);
  const closeAscensionModal = useCallback(() => {
    setIsAscensionOpen(false);
    navHistory.remove('modal-ascension');
  }, []);

  const openJourneyModuleModal = useCallback((m: JourneyModule) => {
    setSelectedJourneyModule(m);
    navHistory.push('modal-journey-module', () => setSelectedJourneyModule(null));
  }, []);
  const closeJourneyModuleModal = useCallback(() => {
    setSelectedJourneyModule(null);
    navHistory.remove('modal-journey-module');
  }, []);

  const closeResetModal = useCallback(() => {
    setIsResetModalOpen(false);
    navHistory.remove('modal-reset');
  }, []);

  const openSidebarDrawer = useCallback(() => {
    setIsSidebarOpen(true);
    if (window.innerWidth < 1024) {
      navHistory.push('drawer-sidebar', () => setIsSidebarOpen(false));
    }
  }, []);
  const closeSidebarDrawer = useCallback(() => {
    setIsSidebarOpen(false);
    navHistory.remove('drawer-sidebar');
  }, []);

  const handleTabClick = useCallback(
    (nextTab: TabType) => {
      if (nextTab === 'admin' && !isCurrentUserAdmin) return;
      if (isSidebarOpen && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
        navHistory.remove('drawer-sidebar');
      }
      if (nextTab === activeTab && !showGateway) return;

      const prevTab = activeTab;
      const wasInGateway = showGateway;
      setShowGateway(false);
      setActiveTab(nextTab);

      navHistory.push(`tab-${nextTab}-${Date.now()}`, () => {
        if (wasInGateway) {
          setShowGateway(true);
        } else {
          setActiveTab(prevTab);
        }
      });
    },
    [activeTab, isSidebarOpen, showGateway, isCurrentUserAdmin]
  );

  const handleEnterGateway = useCallback(() => {
    if (isSidebarOpen && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
      navHistory.remove('drawer-sidebar');
    }
    if (showGateway) return;
    const prevTab = activeTab;
    setShowGateway(true);
    navHistory.push(`gateway-${Date.now()}`, () => {
      setShowGateway(false);
      setActiveTab(prevTab);
    });
  }, [activeTab, isSidebarOpen, showGateway]);

  const handleDesktopBack = useCallback(() => {
    if (navHistory.getDepth() > 0) {
      navHistory.goBack();
    } else if (!showGateway) {
      setShowGateway(true);
    }
  }, [showGateway]);

  // Global Keyboard Shortcuts (Ctrl+K / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearchModal();
      }
      if (e.key === 'Escape') {
        closeSearchModal();
        closeVideoModal();
        closeBookModal();
        closeAscensionModal();
        closeJourneyModuleModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    openSearchModal,
    closeSearchModal,
    closeVideoModal,
    closeBookModal,
    closeAscensionModal,
    closeJourneyModuleModal,
  ]);

  // Quota & Redirect Result Listener
  useEffect(() => {
    const handleQuota = () => setQuotaError(true);
    window.addEventListener('firebase-quota-exceeded', handleQuota);

    getRedirectResult(auth)
      .then((res) => {
        if (res?.user) {
          const email = (res.user.email || res.user.providerData?.[0]?.email || '')
            .trim()
            .toLowerCase();
          if (isDesignatedAdminEmail(email)) {
            setShowGateway(false);
            setActiveTab('admin');
          }
        }
      })
      .catch(() => {});

    return () => window.removeEventListener('firebase-quota-exceeded', handleQuota);
  }, []);

  // Real-time Broadcast Banner & VIP Gates Listeners (Active for ALL visitors & signed-in users)
  useEffect(() => {
    const unsubAnnouncements = onSnapshot(
      collection(db, 'announcements'),
      (snap) => {
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as SystemAnnouncement))
          .sort((a, b) => getItemTimestampMs(b) - getItemTimestampMs(a));
        const active =
          docs.find((d) => d.active === true || d.isActive === true) || null;
        setActiveAnnouncement(active);
      },
      () => {}
    );

    const unsubGates = onSnapshot(
      doc(db, 'settings', 'vip_gates'),
      (snap) => {
        if (snap.exists()) {
          setVipGates(snap.data() as VipSectionGates);
        }
      },
      () => {}
    );

    return () => {
      unsubAnnouncements();
      unsubGates();
    };
  }, [user]);

  // Helper to upsert a user profile across React state, localStorage registry, /api/sync, and Firestore
  const upsertUserAccount = useCallback(
    async (
      userUpdate: Partial<UserProfile> & { uid: string },
      options?: { forceReplaceDays?: boolean }
    ) => {
      const targetUid = userUpdate.uid;
      if (!targetUid) return;
      unmarkDocDeleted(targetUid);
      const forceReplaceDays = Boolean(options?.forceReplaceDays);
      const nowIso = new Date().toISOString();
      const nowMs = Date.now();

      let finalMergedUser: UserProfile | null = null;

      setAllUsers((prev) => {
        const registry = getCachedUsersRegistry();
        const combined = mergeUsersLists(prev, registry);
        const targetEmail = (userUpdate.email || '').trim().toLowerCase();
        const existing = combined.find(
          (u) =>
            u.uid === targetUid ||
            (targetEmail && (u.email || '').trim().toLowerCase() === targetEmail)
        );
        const merged = mergeSingleUserProfile(
          existing,
          {
            ...userUpdate,
            uid: existing?.uid || targetUid,
            updatedAt: nowIso,
            updatedAtMs: nowMs,
            ...(forceReplaceDays ? { journeyResetAtMs: nowMs } : {}),
          },
          forceReplaceDays
        );
        finalMergedUser = merged;
        const nextList = [
          merged,
          ...combined.filter(
            (u) =>
              u.uid !== merged.uid &&
              (!targetEmail ||
                (u.email || '').trim().toLowerCase() !== targetEmail)
          ),
        ].sort((a, b) => (b.xp || 0) - (a.xp || 0));
        saveUsersRegistry(nextList);
        return nextList;
      });

      const resolvedUser: UserProfile =
        finalMergedUser ||
        mergeSingleUserProfile(
          null,
          {
            ...userUpdate,
            uid: targetUid,
            updatedAt: nowIso,
            updatedAtMs: nowMs,
            ...(forceReplaceDays ? { journeyResetAtMs: nowMs } : {}),
          },
          forceReplaceDays
        );

      // If this update is for the currently logged-in user, update their live profile state too
      setProfile((prev) => {
        if (!prev) return prev;
        const sameUid = prev.uid === resolvedUser.uid || prev.uid === targetUid;
        const sameEmail =
          prev.email &&
          resolvedUser.email &&
          prev.email.trim().toLowerCase() ===
            resolvedUser.email.trim().toLowerCase();
        if (!sameUid && !sameEmail) return prev;
        const updatedSelf = mergeSingleUserProfile(
          prev,
          resolvedUser,
          forceReplaceDays
        );
        localStorage.setItem(
          STORAGE_KEYS.PROFILE_CACHE_PREFIX + prev.uid,
          JSON.stringify(updatedSelf)
        );
        localStorage.setItem(
          STORAGE_KEYS.ACTIVE_PROFILE,
          JSON.stringify(updatedSelf)
        );
        return updatedSelf;
      });

      await pushServerSync('users', 'set', resolvedUser.uid, {
        ...resolvedUser,
        ...(forceReplaceDays ? { _forceReplaceDays: true } : {}),
      });
      broadcastContentUpdate('users', resolvedUser);

      const firestorePayload = prepareForFirestoreWrite({
        ...resolvedUser,
        lastLoginAt: resolvedUser.lastLoginAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      delete (firestorePayload as any)._forceReplaceDays;

      setDoc(doc(db, 'users', resolvedUser.uid), firestorePayload, {
        merge: true,
      }).catch(() => {});

      if (isDesignatedAdminEmail(resolvedUser.email)) {
        setDoc(
          doc(db, 'admins', resolvedUser.uid),
          {
            email: resolvedUser.email,
            role: 'admin',
            assignedAt: serverTimestamp(),
          },
          { merge: true }
        ).catch(() => {});
      }
    },
    []
  );

  const deleteUserAccountById = useCallback(async (uid: string) => {
    if (!uid) return;
    markDocDeleted(uid);
    setAllUsers((prev) => {
      const next = prev.filter((u) => u.uid !== uid);
      saveUsersRegistry(next);
      return next;
    });
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE_CACHE_PREFIX + uid);
    } catch {}
    await pushServerSync('users', 'delete', uid);
    broadcastContentUpdate('users', { uid, deleted: true });
    deleteDoc(doc(db, 'users', uid)).catch(() => {});
    deleteDoc(doc(db, 'admins', uid)).catch(() => {});
  }, []);

  // Auth & Profile Hydration
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      if (refCode) {
        localStorage.setItem(STORAGE_KEYS.REFERRAL_CODE, refCode);
      }

      const effectiveUser = firebaseUser;
      setUser(effectiveUser);
      if (!effectiveUser) {
        if (unsubProfile) {
          unsubProfile();
          unsubProfile = null;
        }
        setProfile(null);
        setShowGateway(true);
        setLoading(false);
        return;
      }

      setShowGateway(false);
      const userCacheKey = STORAGE_KEYS.PROFILE_CACHE_PREFIX + effectiveUser.uid;
      const userAuthEmail = (
        effectiveUser.email ||
        effectiveUser.providerData?.find((p: any) => p?.email)?.email ||
        ''
      )
        .trim()
        .toLowerCase();
      const isDesignatedAdmin = Boolean(
        isDesignatedAdminEmail(userAuthEmail) ||
          effectiveUser.providerData?.some((p: any) => isDesignatedAdminEmail(p?.email))
      );

      setActiveTab(isDesignatedAdmin ? 'admin' : 'journey');

      const todayStr = getLocalDateString();
      let cachedProfile: UserProfile | null = null;
      try {
        const cachedStr = localStorage.getItem(userCacheKey);
        if (cachedStr) {
          const parsed = JSON.parse(cachedStr);
          if (parsed && parsed.uid === effectiveUser.uid) {
            cachedProfile = parsed;
          }
        }
      } catch {}

      if (!cachedProfile) {
        const regList = getCachedUsersRegistry();
        const fromReg = regList.find(
          (u) =>
            u.uid === effectiveUser.uid ||
            (userAuthEmail &&
              (u.email || '').trim().toLowerCase() === userAuthEmail)
        );
        if (fromReg) {
          cachedProfile = { ...fromReg, uid: effectiveUser.uid };
        }
      }

      const placeholderProfile: UserProfile = cachedProfile
        ? {
            ...cachedProfile,
            uid: effectiveUser.uid,
            email: userAuthEmail || cachedProfile.email || '',
            displayName:
              effectiveUser.displayName ||
              cachedProfile.displayName ||
              'Sovereign Practitioner',
            photoURL: effectiveUser.photoURL || cachedProfile.photoURL || '',
            isAdmin: isDesignatedAdmin || Boolean(cachedProfile.isAdmin),
            isStrategist:
              isDesignatedAdmin || Boolean(cachedProfile.isStrategist),
          }
        : {
            uid: effectiveUser.uid,
            email: userAuthEmail,
            displayName: effectiveUser.displayName || 'Sovereign Practitioner',
            photoURL: effectiveUser.photoURL || '',
            xp: 0,
            level: 1,
            completedDays: [],
            presenceDays: [todayStr],
            updatedAt: new Date(0).toISOString(),
            updatedAtMs: 0,
            lastLoginAt: new Date().toISOString(),
            streak: 1,
            isAdmin: isDesignatedAdmin,
            isStrategist: isDesignatedAdmin,
            bio: '',
            referredBy: localStorage.getItem(STORAGE_KEYS.REFERRAL_CODE) || '',
            dailyReflections: {},
          };

      // Unblock UI immediately without writing empty defaults to Firestore/Server
      setProfile(placeholderProfile);
      setLoading(false);

      const userRef = doc(db, 'users', effectiveUser.uid);
      const adminRef = doc(db, 'admins', effectiveUser.uid);

      try {
        let isAdminUser = isDesignatedAdmin;

        // Fetch existing user data from ALL server sources BEFORE writing anything
        const [adminRes, userRes, emailQueryRes, serverSyncRes] =
          await Promise.allSettled([
            withTimeout(getDoc(adminRef), 6000),
            withTimeout(getDoc(userRef), 8000),
            userAuthEmail
              ? withTimeout(
                  getDocs(
                    query(
                      collection(db, 'users'),
                      where('email', '==', userAuthEmail)
                    )
                  ),
                  6000
                )
              : Promise.resolve(null),
            fetchServerSync(),
          ]);

        if (adminRes.status === 'fulfilled' && adminRes.value.exists()) {
          isAdminUser = true;
        }

        let firestoreRawData: any = null;
        if (userRes.status === 'fulfilled' && userRes.value.exists()) {
          firestoreRawData = userRes.value.data();
        } else if (userRes.status === 'rejected' && isOfflineError(userRes.reason)) {
          setIsOffline(true);
        }

        if (
          !firestoreRawData &&
          emailQueryRes.status === 'fulfilled' &&
          emailQueryRes.value &&
          !emailQueryRes.value.empty
        ) {
          firestoreRawData = emailQueryRes.value.docs[0].data();
        }

        let serverSyncUser: any = null;
        if (
          serverSyncRes.status === 'fulfilled' &&
          Array.isArray(serverSyncRes.value?.users)
        ) {
          serverSyncUser = serverSyncRes.value!.users!.find(
            (u: any) =>
              u?.uid === effectiveUser.uid ||
              u?.id === effectiveUser.uid ||
              (userAuthEmail &&
                (u?.email || '').trim().toLowerCase() === userAuthEmail)
          );
        }

        if (isAdminUser || isDesignatedAdmin) {
          setDoc(
            adminRef,
            {
              email: userAuthEmail || firestoreRawData?.email || '',
              role: 'admin',
              assignedAt: serverTimestamp(),
            },
            { merge: true }
          ).catch(() => {});
        }

        // Merge all sources (placeholder/cache + serverSyncUser + firestoreRawData + guestCache)
        let mergedProfile = mergeSingleUserProfile(
          placeholderProfile,
          serverSyncUser
        );
        if (firestoreRawData) {
          mergedProfile = mergeSingleUserProfile(mergedProfile, {
            ...firestoreRawData,
            uid: effectiveUser.uid,
          });
        }

        const guestCache = localStorage.getItem(STORAGE_KEYS.GUEST_PROFILE);
        if (guestCache) {
          try {
            const guestProfile = JSON.parse(guestCache);
            const hasGuestWork =
              (guestProfile?.completedDays?.length || 0) > 0 ||
              Object.keys(guestProfile?.dailyReflections || {}).length > 0 ||
              (guestProfile?.xp || 0) > 0;
            if (hasGuestWork) {
              mergedProfile = mergeSingleUserProfile(mergedProfile, {
                ...guestProfile,
                uid: effectiveUser.uid,
              });
            }
          } catch {}
          localStorage.removeItem(STORAGE_KEYS.GUEST_PROFILE);
        }

        const isEffectiveAdmin = Boolean(
          isAdminUser ||
            isDesignatedAdmin ||
            isDesignatedAdminEmail(mergedProfile.email)
        );

        const mergedPresence = Array.from(
          new Set([...(mergedProfile.presenceDays || []), todayStr])
        );

        // Daily Login & Streak Maintenance
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        ).getTime();
        const rawLastLogin =
          firestoreRawData?.lastLoginAt || serverSyncUser?.lastLoginAt;
        const lastLogin = parseDateTime(rawLastLogin) || new Date(0);
        const lastLoginDate = new Date(
          lastLogin.getFullYear(),
          lastLogin.getMonth(),
          lastLogin.getDate()
        ).getTime();
        const diffDays = Math.floor(
          (today - lastLoginDate) / (1000 * 60 * 60 * 24)
        );

        let nextStreak = mergedProfile.streak || 1;
        if (lastLogin.getTime() > 0) {
          if (diffDays === 1) {
            nextStreak = (mergedProfile.streak || 0) + 1;
          } else if (diffDays > 1) {
            nextStreak = 1;
          }
        }

        if ((mergedProfile.completedDays?.length || 0) > 0) {
          const lastCompleted = parseDateTime(mergedProfile.lastCompletedAt);
          if (lastCompleted) {
            const lastCompletedDateOnly = new Date(
              lastCompleted.getFullYear(),
              lastCompleted.getMonth(),
              lastCompleted.getDate()
            );
            const todayDateOnly = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate()
            );
            const daysSinceLastSuccess = Math.floor(
              (todayDateOnly.getTime() - lastCompletedDateOnly.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            if (daysSinceLastSuccess >= 3) {
              nextStreak = 0;
            }
          }
        }

        const nowIso = new Date().toISOString();
        const finalProfile: UserProfile = {
          ...mergedProfile,
          uid: effectiveUser.uid,
          email: userAuthEmail || mergedProfile.email || '',
          displayName:
            effectiveUser.displayName ||
            mergedProfile.displayName ||
            'Sovereign Practitioner',
          photoURL: effectiveUser.photoURL || mergedProfile.photoURL || '',
          completedDays: normalizeCompletedDays(mergedProfile.completedDays),
          presenceDays: mergedPresence,
          streak: nextStreak,
          isAdmin: isEffectiveAdmin,
          isStrategist: isEffectiveAdmin
            ? true
            : Boolean(mergedProfile.isStrategist),
          lastLoginAt: nowIso,
          updatedAt: nowIso,
          updatedAtMs: Math.max(mergedProfile.updatedAtMs || 0, Date.now()),
        };

        let profileData: UserProfile = finalProfile;
        setProfile(finalProfile);
        localStorage.setItem(userCacheKey, JSON.stringify(finalProfile));
        localStorage.setItem(
          STORAGE_KEYS.ACTIVE_PROFILE,
          JSON.stringify(finalProfile)
        );
        setLoading(false);

        // Register/update user across allUsers registry, /api/sync, and Firestore
        await upsertUserAccount(finalProfile);

        // Real-time Profile Snapshot Listener
        unsubProfile = onSnapshot(
          userRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              const snapEmail = (data.email || userAuthEmail || '')
                .trim()
                .toLowerCase();
              const isEffectiveAdminNow =
                isDesignatedAdmin || isDesignatedAdminEmail(snapEmail);
              const updatedProfile = mergeSingleUserProfile(profileData, {
                ...data,
                uid: effectiveUser.uid,
                email: data.email || userAuthEmail,
                isAdmin: isEffectiveAdminNow,
                isStrategist: isEffectiveAdminNow
                  ? true
                  : Boolean(data.isStrategist),
              });
              profileData = updatedProfile;
              setProfile(updatedProfile);
              localStorage.setItem(
                userCacheKey,
                JSON.stringify(updatedProfile)
              );
              localStorage.setItem(
                STORAGE_KEYS.ACTIVE_PROFILE,
                JSON.stringify(updatedProfile)
              );
              setAllUsers((prev) => {
                const next = mergeUsersLists([updatedProfile], prev);
                saveUsersRegistry(next);
                return next;
              });
              pushServerSync('users', 'set', effectiveUser.uid, updatedProfile);
            }
          },
          (error) => {
            if (!isOfflineError(error)) {
              handleFirestoreError(
                error,
                OperationType.GET,
                `users/${effectiveUser.uid}/snapshot`
              );
            }
          }
        );
      } catch (error) {
        console.error('Profile Sync Error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, [upsertUserAccount]);

  // Real-time Content Collections Subscriptions (Users, Journey, Archives, Library, Server Sync, Broadcasts)
  const buildMergedJourneyList = useCallback((dbModules: JourneyModule[]) => {
    const deletedIds = getDeletedDocIds();
    return Array.from({ length: 100 }, (_, i) => {
      const d = i + 1;
      const canonicalId = `day_${d}`;
      const legacyId = `day-${d}`;
      const candidates = dbModules.filter(
        (m) =>
          !deletedIds.has(m.id) &&
          (Number(m.day) === d || m.id === canonicalId || m.id === legacyId)
      );
      candidates.sort((a, b) => getItemTimestampMs(b) - getItemTimestampMs(a));
      const exists = candidates[0];
      const raw = RAW_JOURNEY_MODULES.find((m) => m.day === d)!;
      if (exists) {
        const isPrem =
          typeof exists.isPremium === 'boolean'
            ? exists.isPremium
            : Boolean(exists.isVip ?? raw.isPremium ?? raw.isVip);
        return {
          ...raw,
          ...exists,
          id: canonicalId,
          day: d,
          isPremium: isPrem,
          isVip: isPrem,
          category: exists.category || raw.category || getCategoryForDay(d),
        } as JourneyModule;
      }
      return {
        id: `raw-${d}`,
        ...raw,
        category: raw.category || getCategoryForDay(d),
      } as JourneyModule;
    });
  }, []);

  const refreshFromCacheAndServer = useCallback(async () => {
    try {
      const serverData = await fetchServerSync();
      if (serverData?.deletedIds && Array.isArray(serverData.deletedIds)) {
        serverData.deletedIds.forEach((id) => markDocDeleted(id));
      }

      // 0. Users Registry & Current User Sync
      const cachedUsers = getCachedUsersRegistry();
      const serverUsers: UserProfile[] = Array.isArray(serverData?.users)
        ? serverData!.users
        : [];
      const mergedUsers = mergeUsersLists(serverUsers, cachedUsers);
      setAllUsers((prev) => {
        const next = mergeUsersLists(mergedUsers, prev);
        saveUsersRegistry(next);
        return next;
      });

      // Keep active logged-in user's profile synced with server (e.g. after Admin VIP approval or local cache clear)
      setProfile((prev) => {
        if (!prev) return prev;
        const prevEmail = (prev.email || '').trim().toLowerCase();
        const serverMatch = mergedUsers.find(
          (u) =>
            u.uid === prev.uid ||
            (prevEmail && (u.email || '').trim().toLowerCase() === prevEmail)
        );
        if (!serverMatch) return prev;
        const mergedSelf = mergeSingleUserProfile(prev, {
          ...serverMatch,
          uid: prev.uid,
        });
        localStorage.setItem(
          STORAGE_KEYS.PROFILE_CACHE_PREFIX + prev.uid,
          JSON.stringify(mergedSelf)
        );
        localStorage.setItem(
          STORAGE_KEYS.ACTIVE_PROFILE,
          JSON.stringify(mergedSelf)
        );
        return mergedSelf;
      });

      // 1. Archives
      let cachedArchives: VideoArchive[] = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.ARCHIVES_CACHE);
        if (raw) cachedArchives = JSON.parse(raw);
      } catch {}
      const serverArchives: VideoArchive[] = Array.isArray(serverData?.archives)
        ? serverData!.archives
        : [];
      const mergedArchives = mergeContentById<VideoArchive>(
        serverArchives,
        cachedArchives,
        (v) => !isDemoArchiveItem(v)
      );
      setArchives((prev) => {
        const next = mergeContentById<VideoArchive>(
          mergedArchives,
          prev,
          (v) => !isDemoArchiveItem(v)
        );
        localStorage.setItem(STORAGE_KEYS.ARCHIVES_CACHE, JSON.stringify(next));
        return next;
      });

      // 2. Library
      let cachedLibrary: LibraryBook[] = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.LIBRARY_CACHE);
        if (raw) cachedLibrary = JSON.parse(raw);
      } catch {}
      const serverLibrary: LibraryBook[] = Array.isArray(serverData?.library)
        ? serverData!.library
        : [];
      const mergedLibrary = mergeContentById<LibraryBook>(
        serverLibrary,
        cachedLibrary,
        (b) => !isDemoLibraryItem(b)
      );
      setLibrary((prev) => {
        const next = mergeContentById<LibraryBook>(
          mergedLibrary,
          prev,
          (b) => !isDemoLibraryItem(b)
        );
        localStorage.setItem(STORAGE_KEYS.LIBRARY_CACHE, JSON.stringify(next));
        return next;
      });

      // 3. Journey Overrides
      let cachedJourney: JourneyModule[] = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.JOURNEY_CACHE);
        if (raw) cachedJourney = JSON.parse(raw);
      } catch {}
      const serverJourney: JourneyModule[] = Array.isArray(serverData?.journey)
        ? serverData!.journey
        : [];
      const mergedJourneyOverrides = mergeContentById<JourneyModule>(
        serverJourney,
        cachedJourney
      );
      localStorage.setItem(
        STORAGE_KEYS.JOURNEY_CACHE,
        JSON.stringify(mergedJourneyOverrides)
      );
      setJourneyModules(buildMergedJourneyList(mergedJourneyOverrides));

      // 4. VIP Gates
      if (serverData?.vip_gates) {
        setVipGates(serverData.vip_gates);
        localStorage.setItem(
          't2s_vip_gates_cache_v1',
          JSON.stringify(serverData.vip_gates)
        );
      } else {
        try {
          const cachedGates = localStorage.getItem('t2s_vip_gates_cache_v1');
          if (cachedGates) setVipGates(JSON.parse(cachedGates));
        } catch {}
      }

      // 5. Announcements
      if (Array.isArray(serverData?.announcements)) {
        const sorted = [...serverData!.announcements].sort(
          (a, b) => getItemTimestampMs(b) - getItemTimestampMs(a)
        );
        const active =
          sorted.find(
            (d: any) => d.active === true || d.isActive === true
          ) || null;
        if (active) setActiveAnnouncement(active);
      }
    } catch {}
  }, [buildMergedJourneyList]);

  useEffect(() => {
    refreshFromCacheAndServer();
    const unsubBroadcast = subscribeContentBroadcast(() => {
      refreshFromCacheAndServer();
    });

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            markDocDeleted(change.doc.id);
            pushServerSync('users', 'delete', change.doc.id);
          }
        });
        const firestoreUsers = snap.docs.map(
          (d) => ({ uid: d.id, ...d.data() } as UserProfile)
        );
        const cachedUsers = getCachedUsersRegistry();
        // Keep only recently modified local users if snapshot is live from server
        const filteredCached = !snap.metadata.fromCache
          ? cachedUsers.filter(
              (c) =>
                firestoreUsers.some((f) => f.uid === c.uid) ||
                Date.now() - (c.updatedAtMs || 0) < 12000
            )
          : cachedUsers;
        const merged = mergeUsersLists(firestoreUsers, filteredCached);
        setAllUsers(merged);
        saveUsersRegistry(merged);
      },
      () => {}
    );

    const unsubJourney = onSnapshot(
      collection(db, 'journey'),
      (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            markDocDeleted(change.doc.id);
            pushServerSync('journey', 'delete', change.doc.id);
          }
        });
        const firestoreModules = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as JourneyModule)
        );
        let cachedModules: JourneyModule[] = [];
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.JOURNEY_CACHE);
          if (raw) cachedModules = JSON.parse(raw);
        } catch {}
        const filteredCached = !snap.metadata.fromCache
          ? cachedModules.filter(
              (c) =>
                firestoreModules.some(
                  (f) => f.id === c.id || Number(f.day) === Number(c.day)
                ) || Date.now() - (c.updatedAtMs || 0) < 12000
            )
          : cachedModules;
        const combinedOverrides = mergeContentById<JourneyModule>(
          firestoreModules,
          filteredCached
        );
        localStorage.setItem(
          STORAGE_KEYS.JOURNEY_CACHE,
          JSON.stringify(combinedOverrides)
        );
        setJourneyModules(buildMergedJourneyList(combinedOverrides));
      },
      (error) => {
        if (!isOfflineError(error) && user) {
          handleFirestoreError(error, OperationType.LIST, 'journey');
        }
      }
    );

    const unsubArchives = onSnapshot(
      collection(db, 'archives'),
      (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            markDocDeleted(change.doc.id);
            pushServerSync('archives', 'delete', change.doc.id);
          }
        });
        const firestoreData = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as VideoArchive))
          .filter((v) => !isDemoArchiveItem(v));
        let cachedData: VideoArchive[] = [];
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.ARCHIVES_CACHE);
          if (raw) cachedData = JSON.parse(raw);
        } catch {}
        const filteredCached = !snap.metadata.fromCache
          ? cachedData.filter(
              (c) =>
                firestoreData.some((f) => f.id === c.id) ||
                Date.now() - (c.updatedAtMs || 0) < 12000
            )
          : cachedData;
        const merged = mergeContentById<VideoArchive>(
          firestoreData,
          filteredCached,
          (v) => !isDemoArchiveItem(v)
        );
        setArchives(merged);
        localStorage.setItem(STORAGE_KEYS.ARCHIVES_CACHE, JSON.stringify(merged));
        if (isCurrentUserAdmin) {
          snap.docs.forEach((d) => {
            const rawDoc = d.data();
            if (isDemoArchiveItem({ id: d.id, ...rawDoc } as VideoArchive)) {
              deleteDoc(doc(db, 'archives', d.id)).catch(() => {});
            } else if (!rawDoc.createdAt) {
              // Backfill createdAt so the other version of the app (which queries orderBy('createdAt', 'desc')) also displays this video
              setDoc(
                doc(db, 'archives', d.id),
                { createdAt: rawDoc.updatedAt || serverTimestamp() },
                { merge: true }
              ).catch(() => {});
            }
          });
        }
      },
      (error) => {
        if (!isOfflineError(error) && user) {
          handleFirestoreError(error, OperationType.LIST, 'archives');
        }
      }
    );

    const unsubLibrary = onSnapshot(
      collection(db, 'library'),
      (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            markDocDeleted(change.doc.id);
            pushServerSync('library', 'delete', change.doc.id);
          }
        });
        const firestoreData = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as LibraryBook))
          .filter((b) => !isDemoLibraryItem(b));
        let cachedData: LibraryBook[] = [];
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.LIBRARY_CACHE);
          if (raw) cachedData = JSON.parse(raw);
        } catch {}
        const filteredCached = !snap.metadata.fromCache
          ? cachedData.filter(
              (c) =>
                firestoreData.some((f) => f.id === c.id) ||
                Date.now() - (c.updatedAtMs || 0) < 12000
            )
          : cachedData;
        const merged = mergeContentById<LibraryBook>(
          firestoreData,
          filteredCached,
          (b) => !isDemoLibraryItem(b)
        );
        setLibrary(merged);
        localStorage.setItem(STORAGE_KEYS.LIBRARY_CACHE, JSON.stringify(merged));
        if (isCurrentUserAdmin) {
          snap.docs.forEach((d) => {
            if (isDemoLibraryItem({ id: d.id, ...d.data() } as LibraryBook)) {
              deleteDoc(doc(db, 'library', d.id)).catch(() => {});
            }
          });
        }
      },
      (error) => {
        if (!isOfflineError(error) && user) {
          handleFirestoreError(error, OperationType.LIST, 'library');
        }
      }
    );

    return () => {
      unsubBroadcast();
      unsubUsers();
      unsubJourney();
      unsubArchives();
      unsubLibrary();
    };
  }, [user, isCurrentUserAdmin, refreshFromCacheAndServer, buildMergedJourneyList]);

  const upsertArchiveItem = useCallback((item: VideoArchive) => {
    const isPrem =
      typeof item.isPremium === 'boolean'
        ? item.isPremium
        : Boolean(item.isVip);
    const nowIso = new Date().toISOString();
    const stamped: VideoArchive = sanitizeForFirestore({
      ...item,
      title: (item.title || 'Untitled Documentary').trim(),
      isPremium: isPrem,
      isVip: isPrem,
      createdAt: item.createdAt || nowIso,
      updatedAt: nowIso,
      updatedAtMs: Date.now(),
    });
    unmarkDocDeleted(stamped.id);
    setArchives((prev) => {
      const next = mergeContentById<VideoArchive>(
        [stamped],
        prev,
        (v) => !isDemoArchiveItem(v)
      );
      localStorage.setItem(STORAGE_KEYS.ARCHIVES_CACHE, JSON.stringify(next));
      return next;
    });
    pushServerSync('archives', 'set', stamped.id, stamped).then(() => {
      broadcastContentUpdate('archives', stamped);
    });
    setDoc(
      doc(db, 'archives', stamped.id),
      prepareForFirestoreWrite({
        ...stamped,
        createdAt: item.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      { merge: true }
    ).catch(() => {});
  }, []);

  const deleteArchiveItem = useCallback((id: string) => {
    markDocDeleted(id);
    setArchives((prev) => {
      const next = prev.filter((v) => v.id !== id);
      localStorage.setItem(STORAGE_KEYS.ARCHIVES_CACHE, JSON.stringify(next));
      return next;
    });
    pushServerSync('archives', 'delete', id).then(() => {
      broadcastContentUpdate('archives', { id, deleted: true });
    });
    deleteDoc(doc(db, 'archives', id)).catch(() => {});
  }, []);

  const upsertLibraryItem = useCallback((item: LibraryBook) => {
    const isPrem =
      typeof item.isPremium === 'boolean'
        ? item.isPremium
        : Boolean(item.isVip);
    const nowIso = new Date().toISOString();
    const stamped: LibraryBook = sanitizeForFirestore({
      ...item,
      title: (item.title || 'Untitled Manuscript').trim(),
      author: (item.author || 'A. K. Chandradipti').trim(),
      category: (item.category || 'Foundational Manual').trim(),
      excerpt: item.excerpt || item.description || '',
      fileUrl: item.fileUrl || item.pdfUrl || '',
      isPremium: isPrem,
      isVip: isPrem,
      createdAt: item.createdAt || nowIso,
      updatedAt: nowIso,
      updatedAtMs: Date.now(),
    });
    unmarkDocDeleted(stamped.id);
    setLibrary((prev) => {
      const next = mergeContentById<LibraryBook>(
        [stamped],
        prev,
        (b) => !isDemoLibraryItem(b)
      );
      localStorage.setItem(STORAGE_KEYS.LIBRARY_CACHE, JSON.stringify(next));
      return next;
    });
    pushServerSync('library', 'set', stamped.id, stamped).then(() => {
      broadcastContentUpdate('library', stamped);
    });
    setDoc(
      doc(db, 'library', stamped.id),
      prepareForFirestoreWrite({
        ...stamped,
        createdAt: item.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      { merge: true }
    ).catch(() => {});
  }, []);

  const deleteLibraryItem = useCallback((id: string) => {
    markDocDeleted(id);
    setLibrary((prev) => {
      const next = prev.filter((b) => b.id !== id);
      localStorage.setItem(STORAGE_KEYS.LIBRARY_CACHE, JSON.stringify(next));
      return next;
    });
    pushServerSync('library', 'delete', id).then(() => {
      broadcastContentUpdate('library', { id, deleted: true });
    });
    deleteDoc(doc(db, 'library', id)).catch(() => {});
  }, []);

  const upsertJourneyItem = useCallback(
    (item: JourneyModule) => {
      // Use day_${day} as the canonical Firestore document ID to match the other version of the app
      const docId = `day_${item.day}`;
      const legacyDocId = `day-${item.day}`;
      const isPrem =
        typeof item.isPremium === 'boolean'
          ? item.isPremium
          : Boolean(item.isVip);
      const normalized: JourneyModule = sanitizeForFirestore({
        ...item,
        id: docId,
        isPremium: isPrem,
        isVip: isPrem,
        updatedAt: new Date().toISOString(),
        updatedAtMs: Date.now(),
      });
      unmarkDocDeleted(docId);
      unmarkDocDeleted(legacyDocId);
      let cached: JourneyModule[] = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.JOURNEY_CACHE);
        if (raw) cached = JSON.parse(raw);
      } catch {}
      const updatedOverrides = mergeContentById<JourneyModule>(
        [normalized],
        cached.filter((m) => m.id !== legacyDocId)
      );
      localStorage.setItem(
        STORAGE_KEYS.JOURNEY_CACHE,
        JSON.stringify(updatedOverrides)
      );
      setJourneyModules(buildMergedJourneyList(updatedOverrides));
      pushServerSync('journey', 'set', docId, normalized).then(() => {
        broadcastContentUpdate('journey', normalized);
      });
      setDoc(
        doc(db, 'journey', docId),
        prepareForFirestoreWrite({
          ...normalized,
          updatedAt: serverTimestamp(),
        }),
        { merge: true }
      ).catch(() => {});
    },
    [buildMergedJourneyList]
  );

  const deleteJourneyItem = useCallback(
    (day: number) => {
      const docId = `day_${day}`;
      const legacyDocId = `day-${day}`;
      markDocDeleted(docId);
      markDocDeleted(legacyDocId);
      let cached: JourneyModule[] = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.JOURNEY_CACHE);
        if (raw) cached = JSON.parse(raw);
      } catch {}
      const nextOverrides = cached.filter(
        (m) =>
          m.id !== docId && m.id !== legacyDocId && Number(m.day) !== day
      );
      localStorage.setItem(
        STORAGE_KEYS.JOURNEY_CACHE,
        JSON.stringify(nextOverrides)
      );
      setJourneyModules(buildMergedJourneyList(nextOverrides));
      pushServerSync('journey', 'delete', docId).then(() => {
        broadcastContentUpdate('journey', { id: docId, deleted: true });
      });
      deleteDoc(doc(db, 'journey', docId)).catch(() => {});
      deleteDoc(doc(db, 'journey', legacyDocId)).catch(() => {});
    },
    [buildMergedJourneyList]
  );

  const updateVipGates = useCallback((nextGates: VipSectionGates) => {
    const stamped = sanitizeForFirestore({
      ...nextGates,
      updatedAt: new Date().toISOString(),
      updatedAtMs: Date.now(),
    });
    setVipGates(stamped);
    localStorage.setItem('t2s_vip_gates_cache_v1', JSON.stringify(stamped));
    pushServerSync('vip_gates', 'set', 'vip_gates', stamped).then(() => {
      broadcastContentUpdate('vip_gates', stamped);
    });
    // Write only boolean section keys + updatedAt to Firestore so the other app version's Object.values(gates).filter(Boolean).length is exact
    const firestoreGates: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };
    const gateKeys: (keyof VipSectionGates)[] = [
      'journey',
      'archives',
      'library',
      'forum',
      'crucible',
      'blueprint',
      'shop',
      'leaderboard',
      'affiliate',
    ];
    for (const k of gateKeys) {
      if (typeof nextGates[k] === 'boolean') {
        firestoreGates[k] = nextGates[k];
      }
    }
    setDoc(doc(db, 'settings', 'vip_gates'), firestoreGates, {
      merge: true,
    }).catch(() => {});
  }, []);

  // Rank & Metrics
  useEffect(() => {
    if (!profile) return;

    const totalUsers = Math.max(1, allUsers.length);
    const higherRankCount = allUsers.filter(
      (u) => (u.xp || 0) > (profile.xp || 0)
    ).length;
    setStats({
      users: totalUsers,
      totalXp: profile.xp || 0,
    });
    setRank(higherRankCount + 1);
  }, [profile?.xp, allUsers]);

  const handleLogin = useCallback(async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const res = await signInWithPopup(auth, provider);
      const email = (res.user.email || res.user.providerData?.[0]?.email || '')
        .trim()
        .toLowerCase();
      setShowGateway(false);
      if (isDesignatedAdminEmail(email)) {
        setProfile((prev) =>
          prev ? { ...prev, isAdmin: true, isStrategist: true, email } : null
        );
        setActiveTab('admin');
        showToast({
          title: 'प्रशासक लॉगिन (Admin Clearance Granted)',
          message: 'स्वागत है! एडमिन कमांड सेंटर सक्रिय है।',
          type: 'success',
        });
      } else {
        setActiveTab('journey');
        showToast({
          title: 'स्वागत है (Welcome to Talk2Society)',
          message: 'आप सफलतापूर्वक लॉग-इन हो गए हैं।',
          type: 'success',
        });
      }
    } catch (error: any) {
      const code = String(error?.code || '');
      if (code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch {}
      }
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      console.warn('Google sign-in notice:', error);
    }
  }, [showToast]);

  const handleLoginWithRedirect = useCallback(async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.warn('Redirect sign-in notice:', error);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {}
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROFILE);
    setUser(null);
    setProfile(null);
    setShowGateway(true);
  }, []);

  const completeDay = useCallback(
    async (day: number) => {
      if (!user || !profile) {
        await handleLogin();
        return;
      }
      const currentProfile = profile;
      const targetModule = journeyModules.find((m) => m.day === day);
      if (
        targetModule &&
        (targetModule.isVip || targetModule.isPremium) &&
        !isUserVip
      ) {
        openAscensionModal();
        return;
      }

      if (currentProfile.completedDays?.includes(day)) {
        showToast({
          title: 'पहले से पूर्ण (Already Completed)',
          message: `दिन ${day} पहले ही पूरा किया जा चुका है।`,
          type: 'info',
        });
        return;
      }

      if (day > 1 && !currentProfile.completedDays?.includes(day - 1)) {
        showToast({
          title: 'पूर्वापेक्षा क्रम (Prerequisite Locked)',
          message: `दिन ${day} पूरा करने से पहले दिन ${day - 1} का प्रोटोकॉल पूरा करना आवश्यक है।`,
          type: 'warning',
        });
        return;
      }

      const todayLocalStr = getLocalDateString();

      if (
        isCompletedOnDate(
          currentProfile.lastCompletedAt,
          todayLocalStr,
          currentProfile.lastCompletedDate
        )
      ) {
        showToast({
          title: 'प्रतिदिन केवल एक कार्य (One Task Per Day)',
          message:
            'आप प्रतिदिन केवल एक ही दिन का कार्य पूरा कर सकते हैं। अगला दिन मध्यरात्रि 12:00 AM IST पर अनलॉक होगा!',
          type: 'warning',
        });
        return;
      }

      const xpGain = 100;
      const bonusXp = currentProfile.streak
        ? Math.min(currentProfile.streak * 5, 50)
        : 0;
      const totalGain = xpGain + bonusXp;
      const newXp = (currentProfile.xp || 0) + totalGain;
      const newLevel = Math.floor(newXp / 1000) + 1;
      const updatedCompleted = Array.from(
        new Set([...(currentProfile.completedDays || []), day])
      ).sort((a, b) => a - b);
      const updatedPresence = currentProfile.presenceDays?.includes(
        todayLocalStr
      )
        ? currentProfile.presenceDays
        : [...(currentProfile.presenceDays || []), todayLocalStr];

      const nowIso = new Date().toISOString();
      const nowMs = Date.now();
      const optimisticProfile: UserProfile = {
        ...currentProfile,
        uid: user.uid,
        email: (user.email || currentProfile.email || '').trim().toLowerCase(),
        displayName:
          user.displayName ||
          currentProfile.displayName ||
          'Sovereign Practitioner',
        photoURL: user.photoURL || currentProfile.photoURL || '',
        completedDays: updatedCompleted,
        presenceDays: updatedPresence,
        lastCompletedAt: nowIso as any,
        lastCompletedDate: todayLocalStr,
        xp: newXp,
        level: newLevel,
        streak: currentProfile.streak || 1,
        updatedAt: nowIso as any,
        updatedAtMs: nowMs,
      };

      setProfile(optimisticProfile);
      localStorage.setItem(
        STORAGE_KEYS.PROFILE_CACHE_PREFIX + user.uid,
        JSON.stringify(optimisticProfile)
      );
      localStorage.setItem(
        STORAGE_KEYS.ACTIVE_PROFILE,
        JSON.stringify(optimisticProfile)
      );

      showToast({
        title: `दिन ${day} पूरा हुआ (Day ${day} Completed)`,
        message: `शानदार अनुशासन! दिन ${day} का प्रोटोकॉल संकलित कर लिया गया है (+${totalGain} XP)।`,
        type: 'success',
      });

      if ([7, 21, 50, 100].includes(day) || [7, 21, 50, 100].includes(updatedCompleted.length)) {
        setShowCertificateModal(true);
      }

      await upsertUserAccount(optimisticProfile);
    },
    [
      profile,
      user,
      isUserVip,
      journeyModules,
      openAscensionModal,
      handleLogin,
      showToast,
      upsertUserAccount,
      setShowCertificateModal,
    ]
  );

  const submitDailyReflection = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      const currentProfile = profile || createDefaultGuestProfile();
      const { dateStr } = getIstHourAndDateStr();

      const updatedReflections = {
        ...(currentProfile.dailyReflections || {}),
        [dateStr]: content.trim(),
      };
      const newXp = (currentProfile.xp || 0) + 25;
      const newLevel = Math.floor(newXp / 1000) + 1;
      const nowIso = new Date().toISOString();
      const optimisticProfile: UserProfile = {
        ...currentProfile,
        dailyReflections: updatedReflections,
        xp: newXp,
        level: newLevel,
        updatedAt: nowIso,
        updatedAtMs: Date.now(),
      };

      setProfile(optimisticProfile);
      if (user) {
        localStorage.setItem(
          STORAGE_KEYS.PROFILE_CACHE_PREFIX + user.uid,
          JSON.stringify(optimisticProfile)
        );
      } else {
        localStorage.setItem(
          STORAGE_KEYS.GUEST_PROFILE,
          JSON.stringify(optimisticProfile)
        );
      }
      localStorage.setItem(
        STORAGE_KEYS.ACTIVE_PROFILE,
        JSON.stringify(optimisticProfile)
      );

      showToast({
        title: 'दैनिक चिंतन दर्ज (Reflection Saved)',
        message: 'आपका आत्म-अवलोकन सुरक्षित कर लिया गया है (+25 XP)।',
        type: 'success',
      });

      if (user) {
        await upsertUserAccount(optimisticProfile);
      }
    },
    [profile, user, showToast, upsertUserAccount]
  );

  const claimSovereignXp = useCallback(
    async (amount: number, reason: string) => {
      const currentProfile = profile || createDefaultGuestProfile();
      const newXp = (currentProfile.xp || 0) + amount;
      const newLevel = Math.floor(newXp / 1000) + 1;
      const nowIso = new Date().toISOString();

      const optimisticProfile: UserProfile = {
        ...currentProfile,
        xp: newXp,
        level: newLevel,
        updatedAt: nowIso,
        updatedAtMs: Date.now(),
      };

      setProfile(optimisticProfile);
      if (user) {
        localStorage.setItem(
          STORAGE_KEYS.PROFILE_CACHE_PREFIX + user.uid,
          JSON.stringify(optimisticProfile)
        );
      } else {
        localStorage.setItem(
          STORAGE_KEYS.GUEST_PROFILE,
          JSON.stringify(optimisticProfile)
        );
      }
      localStorage.setItem(
        STORAGE_KEYS.ACTIVE_PROFILE,
        JSON.stringify(optimisticProfile)
      );

      showToast({
        title: `+${amount} XP अर्जित (Sovereign XP Claimed)`,
        message: reason,
        type: 'success',
      });

      if (user) {
        await upsertUserAccount(optimisticProfile);
      }
    },
    [user, profile, showToast, upsertUserAccount]
  );

  const dismissAnnouncement = useCallback((id: string) => {
    setDismissedAnnouncementId(id);
    try {
      localStorage.setItem(STORAGE_KEYS.DISMISSED_BROADCAST, id);
    } catch {}
  }, []);

  const isSectionVipGated = useCallback(
    (key: keyof VipSectionGates) => {
      if (key === 'crucible' || key === 'blueprint') {
        return Boolean(vipGates.crucible || vipGates.blueprint) && !isUserVip;
      }
      return Boolean(vipGates[key]) && !isUserVip;
    },
    [vipGates, isUserVip]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        setProfile,
        loading,
        isOffline,
        authError,
        setAuthError,
        quotaError,
        isCurrentUserAdmin,
        isUserVip,
        rank,
        stats,
        activeTab,
        showGateway,
        isSidebarOpen,
        openSidebarDrawer,
        closeSidebarDrawer,
        handleTabClick,
        handleEnterGateway,
        handleDesktopBack,
        canGoBack: historyDepth > 0 || !showGateway,
        allUsers,
        journeyModules,
        archives,
        library,
        vipGates,
        isSectionVipGated,
        upsertUserAccount,
        deleteUserAccountById,
        refreshFromCacheAndServer,
        upsertArchiveItem,
        deleteArchiveItem,
        upsertLibraryItem,
        deleteLibraryItem,
        upsertJourneyItem,
        deleteJourneyItem,
        updateVipGates,
        activeAnnouncement,
        dismissedAnnouncementId,
        dismissAnnouncement,
        toast,
        showToast,
        dismissToast,
        selectedVideo,
        openVideoModal,
        closeVideoModal,
        selectedBook,
        openBookModal,
        closeBookModal,
        selectedJourneyModule,
        openJourneyModuleModal,
        closeJourneyModuleModal,
        isSearchOpen,
        openSearchModal,
        closeSearchModal,
        isAscensionOpen,
        openAscensionModal,
        closeAscensionModal,
        isResetModalOpen,
        closeResetModal,
        showCertificateModal: showCertificateModalState,
        setShowCertificateModal,
        showJournalModal: showJournalModalState,
        setShowJournalModal,
        handleLogin,
        handleLoginWithRedirect,
        handleLogout,
        completeDay,
        submitDailyReflection,
        claimSovereignXp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return ctx;
}
