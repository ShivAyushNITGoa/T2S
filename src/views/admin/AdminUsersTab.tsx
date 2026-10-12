import React, { useState, useEffect } from 'react';
import {
  Crown,
  Check,
  X,
  Search,
  Trash2,
  Plus,
  Minus,
  RotateCcw,
  FastForward,
  Edit3,
  Save,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export const AdminUsersTab: React.FC = () => {
  const {
    allUsers,
    upsertUserAccount,
    deleteUserAccountById,
    refreshFromCacheAndServer,
    showToast,
  } = useAppContext();
  const { t } = useLanguage();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'pending' | 'vip'>('all');
  const [syncing, setSyncing] = useState(false);

  // Add / Edit User state
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formXp, setFormXp] = useState<number>(0);
  const [formStreak, setFormStreak] = useState<number>(1);
  const [formVip, setFormVip] = useState<boolean>(false);

  // Keep user directory & VIP queue synced in real time while Admin is viewing
  useEffect(() => {
    refreshFromCacheAndServer();
    const interval = setInterval(() => {
      refreshFromCacheAndServer();
    }, 4000);
    return () => clearInterval(interval);
  }, [refreshFromCacheAndServer]);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await refreshFromCacheAndServer();
      showToast({
        title: t('साधक सूची सिंक हुई', 'Users & VIP Queue Synced'),
        message: t(
          'सभी लॉग-इन उपयोगकर्ता और लंबित VIP अनुरोध अपडेट किए गए।',
          'Fetched latest logged-in users and pending VIP requests from server.'
        ),
        type: 'info',
      });
    } finally {
      setSyncing(false);
    }
  };

  const pendingVipUsers = allUsers.filter(
    (u) => u.premiumRequestStatus === 'pending'
  );
  const vipUsersCount = allUsers.filter((u) => Boolean(u.isStrategist)).length;

  const filteredUsers = allUsers.filter((u) => {
    if (roleFilter === 'vip' && !u.isStrategist) return false;
    if (roleFilter === 'pending' && u.premiumRequestStatus !== 'pending') {
      return false;
    }
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.uid?.toLowerCase().includes(q) ||
      (u.utrNumber && u.utrNumber.toLowerCase().includes(q)) ||
      (u.premiumPaymentId && u.premiumPaymentId.toLowerCase().includes(q))
    );
  });

  const resetUserForm = () => {
    setEditingUid(null);
    setFormDisplayName('');
    setFormEmail('');
    setFormXp(0);
    setFormStreak(1);
    setFormVip(false);
  };

  const startEditUser = (u: UserProfile) => {
    setEditingUid(u.uid);
    setFormDisplayName(u.displayName || '');
    setFormEmail(u.email || '');
    setFormXp(u.xp || 0);
    setFormStreak(u.streak || 1);
    setFormVip(Boolean(u.isStrategist));
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDisplayName.trim()) return;
    const targetUid = editingUid || `user_${Date.now()}`;
    const safeXp = Math.max(0, Number(formXp) || 0);
    const safeLevel = Math.floor(safeXp / 1000) + 1;

    await upsertUserAccount({
      uid: targetUid,
      displayName: formDisplayName.trim(),
      email: formEmail.trim().toLowerCase(),
      xp: safeXp,
      level: safeLevel,
      streak: Math.max(0, Number(formStreak) || 0),
      isStrategist: formVip,
      premiumRequestStatus: formVip ? 'approved' : 'none',
    });

    showToast({
      title: editingUid ? 'Practitioner Updated' : 'Practitioner Added',
      message: `"${formDisplayName.trim()}" saved to server database.`,
      type: 'success',
    });
    resetUserForm();
  };

  const handleApproveVip = async (u: UserProfile) => {
    await upsertUserAccount({
      ...u,
      uid: u.uid,
      isStrategist: true,
      premiumRequestStatus: 'approved',
      premiumApprovedAt: new Date().toISOString(),
    });
    showToast({
      title: t('Sovereign VIP स्वीकृत', 'Sovereign VIP Approved'),
      message: `${u.displayName} now has full Sovereign VIP clearance.`,
      type: 'success',
    });
  };

  const handleRejectVip = async (u: UserProfile) => {
    await upsertUserAccount({
      ...u,
      uid: u.uid,
      isStrategist: false,
      premiumRequestStatus: 'rejected',
    });
    showToast({
      title: t('VIP अनुरोध अस्वीकृत', 'VIP Request Rejected'),
      message: `Request for ${u.displayName} marked as rejected.`,
      type: 'info',
    });
  };

  const toggleStrategist = async (u: UserProfile) => {
    const next = !u.isStrategist;
    await upsertUserAccount({
      ...u,
      uid: u.uid,
      isStrategist: next,
      premiumRequestStatus: next ? 'approved' : 'none',
    });
    showToast({
      title: next ? 'VIP Granted' : 'VIP Revoked',
      message: `${u.displayName} is now ${
        next ? 'Sovereign VIP' : 'Standard Member'
      }.`,
      type: 'success',
    });
  };

  const adjustXp = async (u: UserProfile, delta: number) => {
    const nextXp = Math.max(0, (u.xp || 0) + delta);
    const nextLevel = Math.floor(nextXp / 1000) + 1;
    await upsertUserAccount(
      {
        ...u,
        uid: u.uid,
        xp: nextXp,
        level: nextLevel,
      },
      { forceReplaceDays: true }
    );
    showToast({
      title: 'XP Updated',
      message: `${u.displayName}: ${nextXp} XP (Level ${nextLevel})`,
      type: 'success',
    });
  };

  const advanceNextDay = async (u: UserProfile) => {
    const completed = Array.from(
      new Set((u.completedDays || []).map(Number).filter((n) => n > 0))
    ).sort((a, b) => a - b);
    const nextDay = completed.length > 0 ? Math.max(...completed) + 1 : 1;
    if (nextDay > 100) return;
    const updatedDays = [...completed, nextDay];
    const nextXp = (u.xp || 0) + 100;
    await upsertUserAccount(
      {
        ...u,
        uid: u.uid,
        completedDays: updatedDays,
        xp: nextXp,
        level: Math.floor(nextXp / 1000) + 1,
      },
      { forceReplaceDays: true }
    );
    showToast({
      title: `Day ${nextDay} Unlocked`,
      message: `Completed Day ${nextDay} for ${u.displayName}.`,
      type: 'success',
    });
  };

  const resetUserJourney = async (u: UserProfile) => {
    await upsertUserAccount(
      {
        ...u,
        uid: u.uid,
        completedDays: [],
        streak: 0,
        lastCompletedAt: null,
        lastCompletedDate: '',
      },
      { forceReplaceDays: true }
    );
    showToast({
      title: 'Journey Reset',
      message: `Reset 100-Day progress for ${u.displayName}.`,
      type: 'info',
    });
  };

  const deleteUserAccount = async (u: UserProfile) => {
    await deleteUserAccountById(u.uid);
    if (editingUid === u.uid) {
      resetUserForm();
    }
    showToast({
      title: 'User Deleted',
      message: `Removed ${u.displayName} from server database.`,
      type: 'info',
    });
  };

  return (
    <div className="space-y-8">
      {/* Pending ₹299 Sovereign Pass Verification Queue */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span>
              {t(
                `लंबित Sovereign VIP सत्यापन कतार (${pendingVipUsers.length})`,
                `Pending Sovereign VIP Verification Queue (${pendingVipUsers.length})`
              )}
            </span>
          </h3>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={syncing}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`}
            />
            <span>{t('रिफ्रेश करें', 'Refresh Queue')}</span>
          </button>
        </div>

        {pendingVipUsers.length === 0 ? (
          <div className="text-xs text-zinc-400 font-mono py-2">
            {t(
              'वर्तमान में कोई लंबित UTR/VIP सत्यापन अनुरोध नहीं है। आप नीचे किसी भी साधक को सीधे VIP दे सकते हैं।',
              'No pending UTR/VIP verification requests right now. You can also grant VIP directly to any user in the directory below.'
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingVipUsers.map((u) => (
              <div
                key={u.uid}
                className="p-4 rounded-2xl bg-zinc-950/90 border border-amber-500/30 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="font-bold text-white text-sm truncate">
                    {u.displayName}
                  </div>
                  <div className="text-xs text-zinc-400 font-mono truncate">
                    {u.email}
                  </div>
                  {(u.utrNumber || u.premiumPaymentId) && (
                    <div className="text-xs font-mono text-amber-400 mt-1 font-bold">
                      UTR / Ref: {u.utrNumber || u.premiumPaymentId}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApproveVip(u)}
                    className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleRejectVip(u)}
                    className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Practitioner Form */}
      <form
        onSubmit={handleSaveUser}
        className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>
              {editingUid
                ? 'Edit Practitioner Profile (साधक संपादित करें)'
                : 'Add Practitioner Profile (नया साधक जोड़ें)'}
            </span>
          </h3>
          {editingUid && (
            <button
              type="button"
              onClick={resetUserForm}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            value={formDisplayName}
            onChange={(e) => setFormDisplayName(e.target.value)}
            placeholder="Practitioner Name"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
          />
          <input
            type="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            placeholder="Google Gmail Address"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
          />
          <input
            type="number"
            value={formXp}
            onChange={(e) => setFormXp(Number(e.target.value))}
            placeholder="XP"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
          />
          <input
            type="number"
            value={formStreak}
            onChange={(e) => setFormStreak(Number(e.target.value))}
            placeholder="Streak Days"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-mono text-amber-400 cursor-pointer">
            <input
              type="checkbox"
              checked={formVip}
              onChange={(e) => setFormVip(e.target.checked)}
              className="accent-amber-500"
            />
            <span>Sovereign VIP Member</span>
          </label>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer"
          >
            {editingUid ? (
              <>
                <Save className="w-4 h-4" /> Save Practitioner
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add Practitioner
              </>
            )}
          </button>
        </div>
      </form>

      {/* User Directory */}
      <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-bold text-white">
              {t(
                `साधक निर्देशिका (${filteredUsers.length})`,
                `Practitioner Directory (${filteredUsers.length})`
              )}
            </h3>
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-2.5 py-1 rounded-lg uppercase font-bold cursor-pointer ${
                  roleFilter === 'all'
                    ? 'bg-amber-500 text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All ({allUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('pending')}
                className={`px-2.5 py-1 rounded-lg uppercase font-bold cursor-pointer ${
                  roleFilter === 'pending'
                    ? 'bg-amber-500 text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                VIP Queue ({pendingVipUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('vip')}
                className={`px-2.5 py-1 rounded-lg uppercase font-bold cursor-pointer ${
                  roleFilter === 'vip'
                    ? 'bg-amber-500 text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                VIP ({vipUsersCount})
              </button>
            </div>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(
                'नाम, ईमेल, UTR या UID खोजें...',
                'Search name, email, UTR, UID...'
              )}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase">
                <th className="py-3 px-3">User (Google Account)</th>
                <th className="py-3 px-3">XP / 100-Day Progress</th>
                <th className="py-3 px-3">VIP Status</th>
                <th className="py-3 px-3 text-right">Server Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredUsers.map((u) => {
                const daysCompleted = (u.completedDays || []).length;
                return (
                  <tr key={u.uid} className="hover:bg-zinc-900/40">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        {u.photoURL ? (
                          <img
                            src={u.photoURL}
                            alt={u.displayName}
                            className="w-7 h-7 rounded-full object-cover border border-zinc-700 shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                            {(u.displayName || 'U').slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">
                            {u.displayName}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono truncate">
                            {u.email || u.uid}
                          </div>
                          {u.premiumRequestStatus === 'pending' && (
                            <div className="text-[10px] text-amber-400 font-mono font-bold">
                              ⏳ Pending VIP (UTR:{' '}
                              {u.utrNumber || u.premiumPaymentId || 'Requested'})
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <div>
                        <span className="text-amber-400 font-bold">
                          {u.xp || 0} XP
                        </span>{' '}
                        ·{' '}
                        <span className="text-emerald-400 font-bold">
                          {daysCompleted}/100 Days
                        </span>
                      </div>
                      {daysCompleted > 0 && (
                        <div className="text-[10px] text-zinc-500 truncate max-w-[180px]">
                          Latest: Day {Math.max(...(u.completedDays || [1]))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => toggleStrategist(u)}
                        className={`px-2.5 py-1 rounded-lg font-mono font-bold cursor-pointer ${
                          u.isStrategist
                            ? 'bg-amber-500 text-black'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {u.isStrategist ? '👑 VIP ACTIVE' : 'Standard'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                        <button
                          onClick={() => adjustXp(u, 100)}
                          title="Award +100 XP"
                          className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-mono cursor-pointer inline-flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> 100 XP
                        </button>
                        <button
                          onClick={() => adjustXp(u, -100)}
                          title="Deduct 100 XP"
                          className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono cursor-pointer inline-flex items-center gap-1"
                        >
                          <Minus className="w-3 h-3" /> 100
                        </button>
                        <button
                          onClick={() => advanceNextDay(u)}
                          title="Complete Next Journey Day"
                          className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-mono cursor-pointer inline-flex items-center gap-1"
                        >
                          <FastForward className="w-3 h-3" /> +1d
                        </button>
                        <button
                          onClick={() => resetUserJourney(u)}
                          title="Reset Journey Days"
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-300 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => startEditUser(u)}
                          title="Edit User"
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteUserAccount(u)}
                          title="Delete User"
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
