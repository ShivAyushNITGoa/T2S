import React, { useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Lock,
  Unlock,
  Megaphone,
  Database,
  Sparkles,
  Trash2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { db } from '../../config/firebase';
import { VipSectionGates } from '../../types';
import { RAW_JOURNEY_MODULES, getCategoryForDay } from '../../data/journeyData';
import {
  isDemoArchiveItem,
  isDemoLibraryItem,
  isDemoShopItem,
} from '../../utils/mediaUtils';
import {
  pushServerSync,
  broadcastContentUpdate,
} from '../../utils/contentSync';
import { useAppContext } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

const VIP_GATE_SECTIONS: {
  key: keyof VipSectionGates;
  label: string;
  hindi: string;
}[] = [
  { key: 'journey', label: '100-Day Journey', hindi: '१००-दिवसीय यात्रा' },
  { key: 'archives', label: 'Video Archives', hindi: 'डॉक्यूमेंट्री संग्रह' },
  { key: 'library', label: 'Great Library', hindi: 'महान पुस्तकालय' },
  { key: 'blueprint', label: 'Crucible & Blueprint', hindi: 'दर्शन व मॉडल (Crucible)' },
  { key: 'forum', label: 'Community Forum', hindi: 'समुदाय मंच (Sabha)' },
  { key: 'leaderboard', label: 'Leaderboard', hindi: 'लीडरबोर्ड' },
  { key: 'shop', label: 'Strategic Shop', hindi: 'संसाधन दुकान' },
  { key: 'affiliate', label: 'Partner Portal', hindi: 'सहयोगी पोर्टल' },
];

export const AdminOverviewTab: React.FC = () => {
  const {
    allUsers,
    vipGates,
    updateVipGates,
    activeAnnouncement: announcement,
    showToast,
    journeyModules,
    archives,
    library,
  } = useAppContext();
  const { t } = useLanguage();

  const [counts, setCounts] = useState({
    users: allUsers.length,
    journey: journeyModules.length || 100,
    archives: archives.length,
    library: library.length,
    shop: 0,
    posts: 0,
  });
  const [busyAction, setBusyAction] = useState<string | null>(null);

  useEffect(() => {
    setCounts((c) => ({
      ...c,
      users: Math.max(c.users, allUsers.length),
      journey: Math.max(100, journeyModules.length),
      archives: archives.length,
      library: library.length,
    }));
  }, [allUsers.length, journeyModules.length, archives.length, library.length]);

  const [broadcastTitle, setBroadcastTitle] = useState(
    announcement?.title || 'प्रमुख घोषणा (System Broadcast)'
  );
  const [broadcastText, setBroadcastText] = useState(
    announcement?.message || announcement?.text || ''
  );
  const [broadcastType, setBroadcastType] = useState<
    'info' | 'warning' | 'urgent' | 'success' | 'gold' | 'live'
  >(announcement?.type || 'info');
  const [broadcastLabel, setBroadcastLabel] = useState(
    announcement?.linkLabel || announcement?.actionLabel || ''
  );
  const [broadcastUrl, setBroadcastUrl] = useState(
    announcement?.linkUrl || announcement?.actionUrl || ''
  );
  const [broadcastActive, setBroadcastActive] = useState(
    Boolean(announcement?.active ?? announcement?.isActive)
  );

  useEffect(() => {
    if (announcement) {
      setBroadcastTitle(announcement.title || 'प्रमुख घोषणा (System Broadcast)');
      setBroadcastText(announcement.message || announcement.text || '');
      setBroadcastType(announcement.type || 'info');
      setBroadcastLabel(announcement.linkLabel || announcement.actionLabel || '');
      setBroadcastUrl(announcement.linkUrl || announcement.actionUrl || '');
      setBroadcastActive(Boolean(announcement.active ?? announcement.isActive));
    }
  }, [announcement]);

  // Real-time collection counts via onSnapshot so Admin sees immediate live server changes
  useEffect(() => {
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => setCounts((c) => ({ ...c, users: snap.size })),
      () => {}
    );
    const unsubJourney = onSnapshot(
      collection(db, 'journey'),
      (snap) => setCounts((c) => ({ ...c, journey: Math.max(100, snap.size) })),
      () => {}
    );
    const unsubArchives = onSnapshot(
      collection(db, 'archives'),
      (snap) => {
        const valid = snap.docs.filter(
          (d) => !isDemoArchiveItem({ id: d.id, ...d.data() })
        );
        setCounts((c) => ({ ...c, archives: valid.length }));
      },
      () => {}
    );
    const unsubLibrary = onSnapshot(
      collection(db, 'library'),
      (snap) => {
        const valid = snap.docs.filter(
          (d) => !isDemoLibraryItem({ id: d.id, ...d.data() })
        );
        setCounts((c) => ({ ...c, library: valid.length }));
      },
      () => {}
    );
    const unsubShop = onSnapshot(
      collection(db, 'shop'),
      (snap) => {
        const valid = snap.docs.filter(
          (d) => !isDemoShopItem({ id: d.id, ...d.data() })
        );
        setCounts((c) => ({ ...c, shop: valid.length }));
      },
      () => {}
    );
    const unsubPosts = onSnapshot(
      collection(db, 'posts'),
      (snap) => setCounts((c) => ({ ...c, posts: snap.size })),
      () => {}
    );

    return () => {
      unsubUsers();
      unsubJourney();
      unsubArchives();
      unsubLibrary();
      unsubShop();
      unsubPosts();
    };
  }, []);

  const handleToggleVipGate = async (section: keyof VipSectionGates) => {
    const currentLocked =
      section === 'blueprint' || section === 'crucible'
        ? Boolean(vipGates.blueprint || vipGates.crucible)
        : Boolean(vipGates[section]);
    const nextValue = !currentLocked;

    const updatedGates: VipSectionGates = {
      ...vipGates,
      [section]: nextValue,
      updatedAt: new Date().toISOString(),
      updatedAtMs: Date.now(),
    };
    if (section === 'blueprint' || section === 'crucible') {
      updatedGates.blueprint = nextValue;
      updatedGates.crucible = nextValue;
    }

    updateVipGates(updatedGates);
    showToast({
      title: t('VIP गेट अपडेट किया गया', 'VIP Gate Updated'),
      message: `${section.toUpperCase()} is now ${
        nextValue ? 'VIP Locked 🔒' : 'Open to All 🔓'
      }`,
      type: 'success',
    });
  };

  const handleSaveBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyAction('broadcast');
    try {
      const nowIso = new Date().toISOString();
      const payload = {
        id: 'global_broadcast',
        title: broadcastTitle.trim() || 'प्रमुख घोषणा (System Broadcast)',
        message: broadcastText.trim(),
        text: broadcastText.trim(),
        type: broadcastType,
        linkLabel: broadcastLabel.trim(),
        actionLabel: broadcastLabel.trim(),
        linkUrl: broadcastUrl.trim(),
        actionUrl: broadcastUrl.trim(),
        active: broadcastActive,
        isActive: broadcastActive,
        createdAt: nowIso,
        updatedAt: nowIso,
        updatedAtMs: Date.now(),
      };
      await pushServerSync(
        'announcements',
        'set',
        'global_broadcast',
        payload
      );
      broadcastContentUpdate('announcements', payload);
      setDoc(
        doc(db, 'announcements', 'global_broadcast'),
        {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ).catch(() => {});
      showToast({
        title: t('ब्रॉडकास्ट सहेजा गया', 'Broadcast Saved to Server'),
        message: broadcastActive
          ? t(
              'ग्लोबल बैनर अब सभी उपयोगकर्ताओं के लिए लाइव है।',
              'Global banner is now live across all connected users.'
            )
          : t('ग्लोबल बैनर अब छुपा दिया गया है।', 'Global banner is now hidden.'),
        type: 'success',
      });
    } catch (e: any) {
      showToast({
        title: 'Broadcast Error',
        message: e?.message || 'Could not save broadcast to server.',
        type: 'error',
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleSyncJourneyData = async () => {
    setBusyAction('seed');
    try {
      for (const mod of RAW_JOURNEY_MODULES) {
        const docId = `day_${mod.day}`;
        await setDoc(
          doc(db, 'journey', docId),
          {
            ...mod,
            id: docId,
            category: mod.category || getCategoryForDay(mod.day),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
      showToast({
        title: t('१००-दिवसीय यात्रा सिंक पूर्ण', '100-Day Journey Synced'),
        message: t(
          'सभी १०० यात्रा दिन सर्वर (Firestore) पर सिंक हो गए हैं।',
          'All 100 Journey Days synced to Firestore.'
        ),
        type: 'success',
      });
    } catch (e: any) {
      showToast({
        title: 'Sync Error',
        message: e?.message || 'Failed to sync journey data.',
        type: 'error',
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handlePurgeDemoItems = async () => {
    setBusyAction('purge');
    try {
      let purged = 0;
      const archSnap = await getDocs(collection(db, 'archives'));
      for (const d of archSnap.docs) {
        if (isDemoArchiveItem({ id: d.id, ...d.data() })) {
          await deleteDoc(doc(db, 'archives', d.id));
          purged++;
        }
      }
      const libSnap = await getDocs(collection(db, 'library'));
      for (const d of libSnap.docs) {
        if (isDemoLibraryItem({ id: d.id, ...d.data() })) {
          await deleteDoc(doc(db, 'library', d.id));
          purged++;
        }
      }
      const shopSnap = await getDocs(collection(db, 'shop'));
      for (const d of shopSnap.docs) {
        if (isDemoShopItem({ id: d.id, ...d.data() })) {
          await deleteDoc(doc(db, 'shop', d.id));
          purged++;
        }
      }
      showToast({
        title: t('डेमो सफाई पूर्ण', 'Demo Purge Complete'),
        message: `Removed ${purged} legacy demo items from Firestore.`,
        type: 'info',
      });
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Live Firestore Collection Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: t('साधक (Users)', 'Users'), val: counts.users },
          { label: t('यात्रा दिन (Journey)', 'Journey Days'), val: counts.journey },
          { label: t('वृत्तचित्र (Archives)', 'Archives'), val: counts.archives },
          { label: t('पुस्तकें (Library)', 'Library Books'), val: counts.library },
          { label: t('संसाधन (Shop)', 'Shop Items'), val: counts.shop },
          { label: t('मंच पोस्ट (Posts)', 'Forum Posts'), val: counts.posts },
        ].map((item) => (
          <div
            key={item.label}
            className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1"
          >
            <div className="text-[10px] font-mono text-zinc-400 uppercase">
              {item.label}
            </div>
            <div className="text-2xl font-mono font-black text-white">
              {item.val}
            </div>
          </div>
        ))}
      </div>

      {/* Section VIP Access Control Matrix */}
      <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>
                {t(
                  'अनुभाग एक्सेस नियंत्रण (Section VIP Gate Controls)',
                  'Section VIP Gate Controls (Real-Time Server Lock)'
                )}
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {t(
                'किसी भी पूरे सेक्शन को केवल Sovereign VIP सदस्यों के लिए लॉक या सभी उपयोगकर्ताओं के लिए तुरंत अनलॉक करें:',
                'Lock any section exclusively for Sovereign VIP members or unlock it for all users in real time:'
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {VIP_GATE_SECTIONS.map((sec) => {
            const locked =
              sec.key === 'blueprint' || sec.key === 'crucible'
                ? Boolean(vipGates.blueprint || vipGates.crucible)
                : Boolean(vipGates[sec.key]);
            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => handleToggleVipGate(sec.key)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  locked
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white">{sec.label}</div>
                  <div className="text-[11px] text-zinc-400">{sec.hindi}</div>
                </div>
                <div
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 ${
                    locked
                      ? 'bg-amber-500 text-black'
                      : 'bg-zinc-800 text-emerald-400'
                  }`}
                >
                  {locked ? (
                    <>
                      <Lock className="w-3 h-3" /> VIP ONLY
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3" /> OPEN
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Broadcast Banner Manager */}
      <form
        onSubmit={handleSaveBroadcast}
        className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase font-bold">
            <Megaphone className="w-4 h-4" />
            <span>
              {t(
                'शीर्ष सूचना पट्टी (Global Broadcast Banner)',
                'Global Broadcast Banner (Real-Time Alert)'
              )}
            </span>
          </div>

          <label className="flex items-center gap-2 text-xs font-mono text-white cursor-pointer">
            <input
              type="checkbox"
              checked={broadcastActive}
              onChange={(e) => setBroadcastActive(e.target.checked)}
              className="rounded accent-amber-500"
            />
            <span>{t('बैनर सक्रिय (Banner Active)', 'Banner Active')}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            value={broadcastTitle}
            onChange={(e) => setBroadcastTitle(e.target.value)}
            placeholder="Title (e.g. प्रमुख घोषणा)"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
          />
          <div className="md:col-span-2">
            <input
              type="text"
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="सूचना संदेश लिखें (e.g., नया वृत्तचित्र शनिवार रात ८ बजे लाइव होगा)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>
          <div>
            <select
              value={broadcastType}
              onChange={(e) => setBroadcastType(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
            >
              <option value="info">Info (Blue/Cyan)</option>
              <option value="gold">Gold (Sovereign Amber)</option>
              <option value="live">Live (Red Pulse)</option>
              <option value="warning">Warning (Orange)</option>
              <option value="urgent">Urgent (Rose)</option>
              <option value="success">Success (Emerald)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={broadcastLabel}
            onChange={(e) => setBroadcastLabel(e.target.value)}
            placeholder="CTA Button Label (Optional)"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
          />
          <input
            type="text"
            value={broadcastUrl}
            onChange={(e) => setBroadcastUrl(e.target.value)}
            placeholder="CTA Target URL (https://...)"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
          />
          <button
            type="submit"
            disabled={busyAction === 'broadcast'}
            className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono uppercase cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {busyAction === 'broadcast'
                ? 'Saving...'
                : t('ब्रॉडकास्ट सहेजें (Save Broadcast)', 'Save Broadcast')}
            </span>
          </button>
        </div>
      </form>

      {/* Database Maintenance */}
      <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-bold">
            <Database className="w-4 h-4" />
            <span>
              {t(
                '१००-दिवसीय यात्रा सिंक व डेटाबेस रखरखाव',
                '100-Day Journey Sync & Database Maintenance'
              )}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            {t(
              '१०० यात्रा दिनों को Firestore में सिंक करें या पुराने डेमो आइटम हटाएं।',
              'Sync all 100 Journey Days to Firestore or purge any legacy demo items.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={busyAction !== null}
            onClick={handleSyncJourneyData}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {busyAction === 'seed'
                ? 'Syncing 100 Days...'
                : t('१०० यात्रा दिन सिंक करें', 'Sync 100 Journey Days')}
            </span>
          </button>

          <button
            type="button"
            disabled={busyAction !== null}
            onClick={handlePurgeDemoItems}
            className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs font-mono flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('डेमो आइटम हटाएं', 'Purge Demo Items')}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              showToast({
                title: 'Live Sync Active',
                message:
                  'All counters are connected to Firestore via real-time onSnapshot.',
                type: 'info',
              })
            }
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
            title="Live Real-Time Sync Active"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
