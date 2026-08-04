import React, { useState, useEffect } from 'react';
import { 
  Trophy, Flame, Shield, Search, Zap, Crown, 
  ChevronDown, Loader2, Award, Sparkles 
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { RANKS, getRankFromXP } from '../constants';

interface LeaderboardTabProps {
  currentUserProfile: UserProfile | null;
}

export default function LeaderboardTab({ currentUserProfile }: LeaderboardTabProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRankPosition, setUserRankPosition] = useState<number | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Fetch top 50 users sorted by XP
        const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(50));
        const snap = await getDocs(q);
        const fetched: UserProfile[] = snap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
        setUsers(fetched);

        // Find position of logged-in user
        if (currentUserProfile) {
          const idx = fetched.findIndex(u => u.uid === currentUserProfile.uid);
          if (idx !== -1) {
            setUserRankPosition(idx + 1);
          }
        }
      } catch (error) {
        console.error("Leaderboard fetch error:", error);
        // Fallback default mock leaderboard if quota or network issue
        setUsers([
          {
            uid: '1',
            email: 'master@sovereign.io',
            displayName: 'Aurelius Sovereign',
            photoURL: '',
            xp: 28500,
            level: 28,
            completedDays: Array.from({ length: 90 }, (_, i) => i + 1),
            presenceDays: [],
            updatedAt: null,
            streak: 42,
            rank: 'Sovereign Emperor'
          },
          {
            uid: '2',
            email: 'strategist@sovereign.io',
            displayName: 'Vikram Strategist',
            photoURL: '',
            xp: 19400,
            level: 19,
            completedDays: Array.from({ length: 65 }, (_, i) => i + 1),
            presenceDays: [],
            updatedAt: null,
            streak: 28,
            rank: 'Grandmaster Strategist'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [currentUserProfile]);

  const filteredUsers = users.filter(u => 
    (u.displayName || 'User').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.rank || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0c0e14] border border-[#1d222e] rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Honor Roll / शौर्य सूची
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tight">
          Sovereign <span className="text-amber-500">Leaderboard</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-xl">
          Top disciplined practitioners ranked by total XP earned through daily module mastery and mental focus.
        </p>

        {/* Current User Standings Card */}
        {currentUserProfile && (
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center font-black text-amber-400 text-sm">
                #{userRankPosition || 'Top 100'}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Your Current Standing / आपकी रैंक
                </span>
                <span className="text-[10px] font-mono text-amber-400">
                  {currentUserProfile.displayName || 'Sovereign Practitioner'} • {currentUserProfile.xp || 0} XP
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-mono font-bold text-amber-400">
                {currentUserProfile.streak || 0} Day Streak
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search practitioner name or rank... / नाम या रैंक खोजें"
          className="w-full bg-[#0c0e14] border border-[#1d222e] rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-all"
        />
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#0c0e14] border border-[#1d222e] rounded-[28px] overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-500 gap-3">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="text-xs uppercase font-mono tracking-widest">Retrieving Leaderboard Standings...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs font-mono uppercase tracking-wider">
            No practitioners found matching search.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredUsers.map((userItem, index) => {
              const rankObj = getRankFromXP(userItem.xp || 0);
              const isSelf = currentUserProfile?.uid === userItem.uid;
              const isTop3 = index < 3;

              return (
                <div
                  key={userItem.uid}
                  className={`p-4 md:p-5 flex items-center justify-between gap-4 transition-colors ${
                    isSelf ? 'bg-amber-500/10 border-l-4 border-l-amber-500' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Left: Position + Avatar + Name */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                      {index === 0 ? (
                        <Crown className="w-6 h-6 text-amber-400 fill-amber-400/20" />
                      ) : index === 1 ? (
                        <Award className="w-5 h-5 text-slate-300" />
                      ) : index === 2 ? (
                        <Award className="w-5 h-5 text-amber-700" />
                      ) : (
                        <span className="text-xs font-mono font-bold text-gray-500">
                          #{index + 1}
                        </span>
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0 overflow-hidden">
                      {userItem.photoURL ? (
                        <img src={userItem.photoURL} alt={userItem.displayName} className="w-full h-full object-cover" />
                      ) : (
                        userItem.displayName?.[0]?.toUpperCase() || 'S'
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold truncate ${isSelf ? 'text-amber-400' : 'text-white'}`}>
                          {userItem.displayName || 'Practitioner'}
                        </span>
                        {isSelf && (
                          <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-[8px] font-black text-amber-400 uppercase tracking-wider rounded">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 block truncate font-mono">
                        {rankObj.name}
                      </span>
                    </div>
                  </div>

                  {/* Right: XP + Streak */}
                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <span className="text-sm font-mono font-black text-amber-400 block">
                        {(userItem.xp || 0).toLocaleString()} <span className="text-[10px] text-gray-500">XP</span>
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono block">
                        {(userItem.completedDays || []).length} Days Completed
                      </span>
                    </div>

                    {(userItem.streak || 0) > 0 && (
                      <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-mono font-bold">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{userItem.streak}d</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
