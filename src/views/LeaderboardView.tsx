import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Trophy, Flame, Shield, Crown, Sparkles, UserCheck } from 'lucide-react';
import {
  db,
  isOfflineError,
  handleFirestoreError,
  OperationType,
} from '../config/firebase';
import { UserProfile } from '../types';
import { getRankFromXP, RANKS } from '../config/constants';
import { VipSectionLockedView } from '../components/common/UiPrimitives';
import { useAppContext } from '../context/AppContext';

export const LeaderboardView: React.FC<{
  embedded?: boolean;
}> = ({ embedded = false }) => {
  const {
    allUsers,
    profile: currentUserProfile,
    isSectionVipGated,
    openAscensionModal,
    refreshFromCacheAndServer,
  } = useAppContext();

  const [firestoreLeaders, setFirestoreLeaders] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshFromCacheAndServer();
    const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(25));
    return onSnapshot(
      q,
      (snap) => {
        setFirestoreLeaders(
          snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile))
        );
        setLoading(false);
      },
      (error) => {
        if (!isOfflineError(error)) {
          handleFirestoreError(error, OperationType.LIST, 'users/leaderboard');
        }
        setLoading(false);
      }
    );
  }, [refreshFromCacheAndServer]);

  const leaders = React.useMemo(() => {
    const map = new Map<string, UserProfile>();
    for (const u of allUsers) {
      if (u?.uid) map.set(u.uid, u);
    }
    for (const u of firestoreLeaders) {
      if (u?.uid && !map.has(u.uid)) map.set(u.uid, u);
    }
    if (currentUserProfile?.uid) {
      map.set(currentUserProfile.uid, currentUserProfile);
    }
    return Array.from(map.values())
      .sort((a, b) => (b.xp || 0) - (a.xp || 0))
      .slice(0, 25);
  }, [allUsers, firestoreLeaders, currentUserProfile]);

  if (!embedded && isSectionVipGated('leaderboard')) {
    return (
      <VipSectionLockedView
        sectionTitle="Discipline Leaderboard & Hall of Fame"
        hindiTitle="अनुशासन लीडरबोर्ड व साधक सम्मान"
        description="The platform ranking, top streaks, and practitioner standings are reserved for Sovereign VIP members. Upgrade your account to view leaderboard standings."
        onUnlock={openAscensionModal}
      />
    );
  }

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto">
      {!embedded && (
        <div className="bg-[#0c0e14] border border-[#1d222e] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
                <Trophy className="w-3.5 h-3.5" />
                <span>SOVEREIGN DISCIPLINE HALL OF FAME</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                शीर्ष साधक तालिका <span className="text-amber-400">(Leaderboard)</span>
              </h1>
              <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
                यहाँ वे साधक हैं जो केवल वीडियो नहीं देखते, बल्कि प्रतिदिन 100-Day Consciousness Course के नियमों को अपने जीवन में उतारते हैं।
              </p>
            </div>

            {currentUserProfile && (
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shrink-0">
                <img
                  src={
                    currentUserProfile.photoURL ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserProfile.uid}`
                  }
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-amber-500/30"
                />
                <div>
                  <div className="text-xs text-zinc-400 font-mono">आपकी स्थिति (Your Standing)</div>
                  <div className="text-base font-bold text-white">
                    {currentUserProfile.displayName}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-amber-400 mt-0.5">
                    <span>{(currentUserProfile.xp || 0).toLocaleString()} XP</span>
                    <span>•</span>
                    <span>{(currentUserProfile.completedDays || []).length}/100 Days</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!embedded && (
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>चेतना के ६ स्तर (6 Tiers of Sovereignty)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {RANKS.map((r) => (
              <div
                key={r.name}
                className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-white">{r.hindiName}</span>
                  <span className={`w-2 h-2 rounded-full ${r.color}`} />
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">{r.name}</div>
                <div className="text-[10px] text-amber-400/90 font-mono mt-1.5">
                  {r.minXP.toLocaleString()}+ XP
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-zinc-900/40 rounded-3xl border border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : leaders.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800 space-y-2">
          <Trophy className="w-10 h-10 text-zinc-600 mx-auto" />
          <div className="text-white font-bold">अभी कोई साधक सूची में नहीं है</div>
          <p className="text-xs text-zinc-400">
            अपना पहला दिन पूरा करें और शीर्ष स्थान प्राप्त करें।
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaders.slice(0, 3).map((leader, i) => {
              const rankInfo = getRankFromXP(leader.xp || 0);
              const isCurrent = leader.uid === currentUserProfile?.uid;
              return (
                <motion.div
                  key={leader.uid}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`p-6 rounded-3xl border flex flex-col items-center text-center relative overflow-hidden ${
                    i === 0
                      ? 'bg-gradient-to-b from-amber-500/15 via-zinc-900 to-zinc-950 border-amber-500/40 shadow-xl'
                      : i === 1
                        ? 'bg-gradient-to-b from-zinc-700/20 via-zinc-900 to-zinc-950 border-zinc-700'
                        : 'bg-gradient-to-b from-amber-900/15 via-zinc-900 to-zinc-950 border-amber-800/40'
                  } ${isCurrent ? 'ring-2 ring-amber-400' : ''}`}
                >
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/50 border border-white/10 text-xs font-mono font-bold text-amber-400">
                    #{i + 1}
                  </div>
                  {i === 0 && <Crown className="w-6 h-6 text-amber-400 mb-2" />}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden mb-3 ring-2 ring-white/15">
                    <img
                      src={
                        leader.photoURL ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.uid}`
                      }
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <h3 className="font-bold text-white text-base truncate max-w-full">
                    {leader.displayName || 'Practitioner'}
                  </h3>
                  <div className="text-xs text-zinc-400 mt-0.5 mb-3">
                    {rankInfo.hindiName} ({rankInfo.name})
                  </div>

                  <div className="w-full pt-3 border-t border-white/10 flex items-center justify-around text-xs font-mono">
                    <div>
                      <div className="text-zinc-500 text-[10px]">XP</div>
                      <div className="text-amber-400 font-bold">
                        {(leader.xp || 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-[10px]">STREAK</div>
                      <div className="text-white font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500" />
                        {leader.streak || 1}d
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-[10px]">DAYS</div>
                      <div className="text-emerald-400 font-bold">
                        {(leader.completedDays || []).length}/100
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-mono uppercase text-zinc-400">
                    <th className="px-5 py-3.5">स्थान (Rank)</th>
                    <th className="px-5 py-3.5">साधक (Practitioner)</th>
                    <th className="px-5 py-3.5">स्तर (Tier)</th>
                    <th className="px-5 py-3.5">पूरे दिन (Days)</th>
                    <th className="px-5 py-3.5">स्ट्रीक (Streak)</th>
                    <th className="px-5 py-3.5 text-right">अंक (XP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-sm">
                  {leaders.map((leader, index) => {
                    const rankInfo = getRankFromXP(leader.xp || 0);
                    const isCurrent = leader.uid === currentUserProfile?.uid;
                    return (
                      <tr
                        key={leader.uid}
                        className={`hover:bg-zinc-900/40 transition-colors ${
                          isCurrent ? 'bg-amber-500/10' : ''
                        }`}
                      >
                        <td className="px-5 py-4 font-mono font-bold">
                          <span className={index < 3 ? 'text-amber-400' : 'text-zinc-500'}>
                            #{index + 1}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                leader.photoURL ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.uid}`
                              }
                              className="w-9 h-9 rounded-xl object-cover border border-zinc-700 shrink-0"
                              alt=""
                            />
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <span>{leader.displayName || 'Practitioner'}</span>
                                {isCurrent && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-black font-mono font-bold">
                                    YOU
                                  </span>
                                )}
                                {(leader.isStrategist || leader.isAdmin) && (
                                  <span title="Sovereign Member">
                                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-[11px] px-2.5 py-1 rounded-lg font-medium text-white inline-block ${rankInfo.color}`}
                          >
                            {rankInfo.hindiName} · {rankInfo.name}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-zinc-300">
                          <span className="inline-flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            {(leader.completedDays || []).length} / 100
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-amber-400">
                          🔥 {leader.streak || 1}d
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-white text-right">
                          {(leader.xp || 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderboardView;
