import React, { useState, useEffect, useRef } from 'react';
import {
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Plus,
  Trash2,
  Save,
  Crown,
  Unlock,
  MessageSquare,
  ShoppingBag,
  BookOpen,
  Edit3,
  X,
  Send,
  Upload,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react';
import { db } from '../../config/firebase';
import {
  JourneyModule,
  VideoArchive,
  LibraryBook,
  BookChapter,
  ShopProduct,
  CommunityPost,
} from '../../types';
import { RAW_JOURNEY_MODULES, getCategoryForDay } from '../../data/journeyData';
import {
  compressImageFileToDataUrl,
  getYouTubeId,
  isDemoShopItem,
} from '../../utils/mediaUtils';
import {
  sanitizeForFirestore,
  prepareForFirestoreWrite,
  mergeContentById,
  markDocDeleted,
  unmarkDocDeleted,
  broadcastContentUpdate,
  subscribeContentBroadcast,
  pushServerSync,
  fetchServerSync,
} from '../../utils/contentSync';
import { STORAGE_KEYS } from '../../config/constants';
import { useAppContext } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

// ==========================================
// 1. ADMIN JOURNEY TAB (ADD / EDIT / DELETE OVERRIDE)
// ==========================================
export const AdminJourneyTab: React.FC = () => {
  const {
    journeyModules: journey,
    upsertJourneyItem,
    deleteJourneyItem,
    showToast,
  } = useAppContext();
  const { t } = useLanguage();

  const [editingDay, setEditingDay] = useState<number>(1);
  const currentMod =
    journey.find((m) => m.day === editingDay) || {
      id: `day-${editingDay}`,
      day: editingDay,
      title: '',
      hindiTitle: '',
      description: '',
      lesson: '',
      command: '',
      task: '',
      videoUrl: '',
      isVip: false,
      category: getCategoryForDay(editingDay),
    };

  const [title, setTitle] = useState(currentMod.title || '');
  const [hindiTitle, setHindiTitle] = useState(currentMod.hindiTitle || '');
  const [lesson, setLesson] = useState(
    currentMod.lesson || currentMod.description || ''
  );
  const [task, setTask] = useState(
    currentMod.task || currentMod.command || ''
  );
  const [videoUrl, setVideoUrl] = useState(currentMod.videoUrl || '');
  const [youtubeEmbedId, setYoutubeEmbedId] = useState(
    currentMod.youtubeEmbedId || getYouTubeId(currentMod.videoUrl || '') || ''
  );
  const [category, setCategory] = useState(
    currentMod.category || getCategoryForDay(editingDay)
  );
  const [isVip, setIsVip] = useState(Boolean(currentMod.isVip));

  useEffect(() => {
    const found = journey.find((m) => m.day === editingDay);
    if (found) {
      setTitle(found.title || '');
      setHindiTitle(found.hindiTitle || '');
      setLesson(found.lesson || found.description || '');
      setTask(found.task || found.command || '');
      setVideoUrl(found.videoUrl || '');
      setYoutubeEmbedId(
        found.youtubeEmbedId || getYouTubeId(found.videoUrl || '') || ''
      );
      setCategory(found.category || getCategoryForDay(editingDay));
      setIsVip(Boolean(found.isVip));
    }
  }, [editingDay, journey]);

  const saveDayModule = async (e: React.FormEvent) => {
    e.preventDefault();
    const docId = `day_${editingDay}`;
    const resolvedYtId =
      getYouTubeId(youtubeEmbedId) || getYouTubeId(videoUrl) || '';
    const resolvedVideoUrl = resolvedYtId
      ? `https://www.youtube.com/embed/${resolvedYtId}`
      : videoUrl.trim();
    const payload: JourneyModule = {
      id: docId,
      day: editingDay,
      title: title.trim(),
      hindiTitle: hindiTitle.trim(),
      description: lesson.trim(),
      lesson: lesson.trim(),
      command: task.trim(),
      task: task.trim(),
      videoUrl: resolvedVideoUrl,
      youtubeEmbedId: resolvedYtId || '',
      category: category || getCategoryForDay(editingDay),
      isPremium: isVip,
      isVip,
      updatedAt: new Date().toISOString(),
      updatedAtMs: Date.now(),
    };
    upsertJourneyItem(payload);
    showToast({
      title: t(`दिन ${editingDay} सहेजा गया`, `Day ${editingDay} Saved to Server`),
      message: t(
        'अध्याय परिवर्तन तुरंत सभी साधकों के लिए लाइव हो गए हैं।',
        'Curriculum module updated in Firestore and live for all users.'
      ),
      type: 'success',
    });
  };

  const handleDeleteOrResetDay = async () => {
    deleteJourneyItem(editingDay);
    const raw = RAW_JOURNEY_MODULES.find((m) => m.day === editingDay);
    if (raw) {
      setTitle(raw.title || '');
      setHindiTitle(raw.hindiTitle || '');
      setLesson(raw.lesson || raw.description || '');
      setTask(raw.task || raw.command || '');
      setVideoUrl(raw.videoUrl || '');
      setYoutubeEmbedId(
        raw.youtubeEmbedId || getYouTubeId(raw.videoUrl || '') || ''
      );
      setCategory(raw.category || getCategoryForDay(editingDay));
      setIsVip(Boolean(raw.isVip));
    }
    showToast({
      title: t(`दिन ${editingDay} रीसेट किया गया`, `Day ${editingDay} Override Deleted`),
      message: t(
        'कस्टम बदलाव हटाकर मूल १००-दिवसीय अध्याय बहाल किया गया।',
        'Custom Firestore override deleted and original Journey day restored.'
      ),
      type: 'info',
    });
  };

  return (
    <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">
            {t(
              '१००-दिवसीय पाठ्यक्रम संपादक (100-Day Curriculum Editor)',
              '100-Day Curriculum Editor (Real-Time Sync)'
            )}
          </h3>
          <p className="text-xs text-zinc-400">
            {t(
              'किसी भी दिन का पाठ, दैनिक अभ्यास, इन-ऐप वीडियो लिंक या VIP स्थिति संपादित करें:',
              'Select any day (1–100) to add/edit its lesson, task protocol, in-app video link, or VIP lock:'
            )}
          </p>
        </div>

        <select
          value={editingDay}
          onChange={(e) => setEditingDay(Number(e.target.value))}
          className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-mono text-amber-400"
        >
          {Array.from({ length: 100 }, (_, i) => i + 1).map((d) => {
            const m = journey.find((item) => item.day === d);
            return (
              <option key={d} value={d}>
                Day {d}: {m?.title ? m.title.slice(0, 38) : ''}
              </option>
            );
          })}
        </select>
      </div>

      <form onSubmit={saveDayModule} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Day Title (Hindi / English)"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-bold"
          />
          <input
            type="text"
            value={hindiTitle}
            onChange={(e) => setHindiTitle(e.target.value)}
            placeholder="Secondary / Hindi Subtitle"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-amber-300 font-bold"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-mono text-white"
          >
            <option value="De-programming">
              Phase 1: De-programming (Days 1-25)
            </option>
            <option value="The Awakening">
              Phase 2: The Awakening (Days 26-50)
            </option>
            <option value="Mental Models">
              Phase 3: Mental Models (Days 51-75)
            </option>
            <option value="Sovereignty">
              Phase 4: Sovereignty (Days 76-100)
            </option>
          </select>
        </div>

        <textarea
          value={lesson}
          onChange={(e) => setLesson(e.target.value)}
          placeholder="Lesson / Philosophical Discourse Content"
          rows={5}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-white leading-relaxed"
        />

        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Actionable Task (दैनिक अभ्यास / Command)"
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-amber-200"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <input
            type="text"
            value={youtubeEmbedId}
            onChange={(e) => {
              const val = e.target.value;
              setYoutubeEmbedId(val);
              const extracted = getYouTubeId(val);
              if (extracted) {
                setVideoUrl(`https://www.youtube.com/embed/${extracted}`);
              }
            }}
            placeholder="YouTube Video Embed ID (e.g. dQw4w9WgXcQ)"
            className="w-full bg-zinc-950 border border-amber-500/40 rounded-xl px-4 py-2.5 text-xs text-amber-200 font-mono"
          />

          <input
            type="text"
            value={videoUrl}
            onChange={(e) => {
              const val = e.target.value;
              setVideoUrl(val);
              const extracted = getYouTubeId(val);
              if (extracted) {
                setYoutubeEmbedId(extracted);
              }
            }}
            placeholder="Or In-App Video URL (YouTube / Drive / MP4)"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs font-mono text-amber-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isVip}
                onChange={(e) => setIsVip(e.target.checked)}
                className="accent-amber-500"
              />
              <span>Sovereign VIP Exclusive Day</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDeleteOrResetDay}
                className="px-4 py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                title="Delete custom override and restore default day"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Day
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono uppercase flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Day {editingDay}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// ==========================================
// 2. ADMIN ARCHIVES TAB (LOCAL THUMBNAIL UPLOAD + ADD / EDIT / DELETE + VIP TOGGLES)
// ==========================================
export const AdminArchivesTab: React.FC = () => {
  const {
    archives,
    vipGates,
    updateVipGates,
    upsertArchiveItem,
    deleteArchiveItem,
    showToast,
  } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [family, setFamily] = useState('Why India?');
  const [question, setQuestion] = useState('');
  const [hiddenSystemSummary, setHiddenSystemSummary] = useState('');
  const [consequence, setConsequence] = useState('');
  const [chandradiptiReflection, setChandradiptiReflection] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [youtubeEmbedId, setYoutubeEmbedId] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [thumbnailFileName, setThumbnailFileName] = useState('');
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [duration, setDuration] = useState('18:20');
  const [isPremium, setIsPremium] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setFamily('Why India?');
    setQuestion('');
    setHiddenSystemSummary('');
    setConsequence('');
    setChandradiptiReflection('');
    setVideoUrl('');
    setYoutubeEmbedId('');
    setThumbnail('');
    setThumbnailFileName('');
    setDuration('18:20');
    setIsPremium(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startEdit = (v: VideoArchive) => {
    setEditingId(v.id);
    setTitle(v.title || '');
    setFamily(v.family || v.category || 'Why India?');
    setQuestion(v.question || v.description || '');
    setHiddenSystemSummary(v.hiddenSystemSummary || '');
    setConsequence(v.consequence || '');
    setChandradiptiReflection(v.chandradiptiReflection || '');
    setVideoUrl(v.videoUrl || v.youtubeUrl || '');
    setYoutubeEmbedId(
      v.youtubeEmbedId ||
        getYouTubeId(v.videoUrl || v.youtubeUrl || '') ||
        ''
    );
    setThumbnail(v.thumbnail || '');
    setThumbnailFileName(
      v.thumbnail?.startsWith('data:image/') ? 'Uploaded Local Image' : ''
    );
    setDuration(v.duration || '18:20');
    setIsPremium(Boolean(v.isPremium || v.isVip));
  };

  const handleLocalThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    try {
      const compressedDataUrl = await compressImageFileToDataUrl(file);
      setThumbnail(compressedDataUrl);
      setThumbnailFileName(file.name);
      showToast({
        title: 'Thumbnail Uploaded Locally',
        message: `"${file.name}" optimized and attached to video.`,
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        title: 'Thumbnail Upload Error',
        message: err?.message || 'Failed to read local image file.',
        type: 'error',
      });
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast({
        title: 'Title Required',
        message: 'Please enter a documentary title.',
        type: 'warning',
      });
      return;
    }

    const docId = editingId || `vid_${Date.now()}`;
    const resolvedYtId =
      getYouTubeId(youtubeEmbedId) || getYouTubeId(videoUrl) || '';
    const resolvedVideoUrl = resolvedYtId
      ? `https://www.youtube.com/embed/${resolvedYtId}`
      : videoUrl.trim();
    const defaultThumb = resolvedYtId
      ? `https://img.youtube.com/vi/${resolvedYtId}/hqdefault.jpg`
      : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80';

    const payload: VideoArchive = {
      id: docId,
      title: title.trim(),
      family,
      category: family,
      question: question.trim(),
      description: question.trim(),
      hiddenSystemSummary: hiddenSystemSummary.trim(),
      consequence: consequence.trim(),
      chandradiptiReflection: chandradiptiReflection.trim(),
      videoUrl: resolvedVideoUrl,
      youtubeUrl: resolvedVideoUrl,
      youtubeEmbedId: resolvedYtId || '',
      thumbnail: thumbnail.trim() || defaultThumb,
      views: 'Protected',
      duration: duration.trim() || '18:20',
      date: new Date().toISOString().slice(0, 10),
      isPremium: Boolean(isPremium),
      isVip: Boolean(isPremium),
      updatedAt: new Date().toISOString(),
      updatedAtMs: Date.now(),
    };

    upsertArchiveItem(payload);
    if (editingId) {
      showToast({
        title: 'Documentary Updated',
        message: `"${payload.title}" (${isPremium ? 'VIP Exclusive' : 'Free Access'}) saved to server.`,
        type: 'success',
      });
    } else {
      showToast({
        title: 'Documentary Added',
        message: `"${payload.title}" (${isPremium ? 'VIP Exclusive' : 'Free Access'}) published to Video Archives.`,
        type: 'success',
      });
    }
    resetForm();
  };

  const toggleSingleVideoVip = (v: VideoArchive) => {
    const nextVip = !Boolean(v.isPremium || v.isVip);
    const updatedItem: VideoArchive = {
      ...v,
      youtubeEmbedId: v.youtubeEmbedId || '',
      isPremium: nextVip,
      isVip: nextVip,
      updatedAt: new Date().toISOString(),
      updatedAtMs: Date.now(),
    };
    upsertArchiveItem(updatedItem);
    if (editingId === v.id) {
      setIsPremium(nextVip);
    }
    showToast({
      title: nextVip ? '👑 Video Locked as VIP' : '🔓 Video Unlocked (Free)',
      message: `"${v.title}" is now ${nextVip ? 'Sovereign VIP Only' : 'Free for all users'}.`,
      type: 'success',
    });
  };

  const setAllVideosVip = (vipOnly: boolean) => {
    const nowIso = new Date().toISOString();
    const nowMs = Date.now();
    for (const item of archives) {
      upsertArchiveItem({
        ...item,
        youtubeEmbedId: item.youtubeEmbedId || '',
        isPremium: vipOnly,
        isVip: vipOnly,
        updatedAt: nowIso,
        updatedAtMs: nowMs,
      });
    }
    if (editingId) {
      setIsPremium(vipOnly);
    }
    showToast({
      title: vipOnly ? 'All Videos Locked as VIP' : 'All Videos Set to Free',
      message: `Updated all ${archives.length} videos in Video Archives to ${
        vipOnly ? 'VIP Only' : 'Free'
      }.`,
      type: 'success',
    });
  };

  const toggleEntireArchivesSectionVip = () => {
    const nextSectionLock = !Boolean(vipGates.archives);
    updateVipGates({
      ...vipGates,
      archives: nextSectionLock,
      updatedAt: new Date().toISOString(),
      updatedAtMs: Date.now(),
    });
    showToast({
      title: nextSectionLock
        ? '🔒 Video Archives Section Locked (VIP Only)'
        : '🔓 Video Archives Section Open to All',
      message: nextSectionLock
        ? 'Only Sovereign VIP users can enter the Video Archives section.'
        : 'All logged-in users can browse Video Archives (individual VIP videos remain locked).',
      type: 'success',
    });
  };

  const handleDeleteVideo = async (id: string) => {
    deleteArchiveItem(id);
    if (editingId === id) {
      resetForm();
    }
    showToast({
      title: 'Documentary Deleted',
      message: 'Removed from Video Archives.',
      type: 'info',
    });
  };

  const isArchivesSectionLocked = Boolean(vipGates.archives);

  return (
    <div className="space-y-6">
      {/* Top VIP Controls Bar for Video Archives */}
      <div className="bg-[#0c0e14] border border-amber-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Crown className="w-4 h-4" />
            <span>Video Archives VIP Access Control</span>
          </div>
          <p className="text-xs text-zinc-400">
            Lock the entire Video Archives tab for VIPs, or toggle individual videos between VIP and Free below.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleEntireArchivesSectionVip}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isArchivesSectionLocked
                ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-200 border-zinc-700 hover:border-amber-500/40'
            }`}
          >
            {isArchivesSectionLocked ? (
              <>
                <Crown className="w-3.5 h-3.5" /> Entire Section: VIP LOCKED
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" /> Entire Section: OPEN
              </>
            )}
          </button>
          {archives.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setAllVideosVip(true)}
                className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" /> Lock All Videos VIP
              </button>
              <button
                type="button"
                onClick={() => setAllVideosVip(false)}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" /> Make All Videos Free
              </button>
            </>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSaveVideo}
        className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-bold text-white">
            {editingId
              ? 'Edit Documentary Case File (वृत्तचित्र संपादित करें)'
              : 'Add Documentary Case File (नया वीडियो जोड़ें)'}
          </h3>
          <div className="flex items-center gap-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancel Edit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Documentary Title"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
          />
          <select
            value={family}
            onChange={(e) => setFamily(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
          >
            <option value="Why India?">Why India?</option>
            <option value="How India Works">How India Works</option>
            <option value="The Hidden System">The Hidden System</option>
            <option value="The Path">The Path</option>
            <option value="The Uncomfortable Truth">
              The Uncomfortable Truth
            </option>
            <option value="Mental Models">Mental Models</option>
            <option value="Systemic Analysis">Systemic Analysis</option>
          </select>
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration (e.g. 18:20)"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
          />
        </div>

        {/* YouTube Embed ID + Video URL + Local Thumbnail Upload */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
              YouTube Video Embed ID (उदा. dQw4w9WgXcQ या Embed Code)
            </label>
            <input
              value={youtubeEmbedId}
              onChange={(e) => {
                const val = e.target.value;
                setYoutubeEmbedId(val);
                const extracted = getYouTubeId(val);
                if (extracted) {
                  setVideoUrl(`https://www.youtube.com/embed/${extracted}`);
                  if (!thumbnail.trim()) {
                    setThumbnail(
                      `https://img.youtube.com/vi/${extracted}/hqdefault.jpg`
                    );
                  }
                }
              }}
              placeholder="e.g. dQw4w9WgXcQ or paste <iframe>"
              className="w-full bg-zinc-950 border border-amber-500/40 rounded-xl px-4 py-2.5 text-xs text-amber-200 font-mono"
            />
            {(getYouTubeId(youtubeEmbedId) || getYouTubeId(videoUrl)) && (
              <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-between pt-0.5">
                <span>
                  ✓ Embed ID:{' '}
                  <strong>
                    {getYouTubeId(youtubeEmbedId) || getYouTubeId(videoUrl)}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const id =
                      getYouTubeId(youtubeEmbedId) || getYouTubeId(videoUrl);
                    if (id) {
                      setThumbnail(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
                      setThumbnailFileName('');
                    }
                  }}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  Use YT Thumbnail
                </button>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
              Or Full Video URL (YouTube / Google Drive / Direct MP4)
            </label>
            <input
              value={videoUrl}
              onChange={(e) => {
                const val = e.target.value;
                setVideoUrl(val);
                const extracted = getYouTubeId(val);
                if (extracted) {
                  setYoutubeEmbedId(extracted);
                  if (!thumbnail.trim()) {
                    setThumbnail(
                      `https://img.youtube.com/vi/${extracted}/hqdefault.jpg`
                    );
                  }
                }
              }}
              placeholder="https://www.youtube.com/watch?v=... or Google Drive link"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
              Video Thumbnail (Upload Locally from Device or Paste URL)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLocalThumbnailChange}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingThumb}
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {uploadingThumb
                    ? 'Processing...'
                    : thumbnailFileName
                      ? 'Change Local Thumbnail'
                      : 'Upload Local Thumbnail'}
                </span>
              </button>

              <input
                value={thumbnail.startsWith('data:image/') ? '' : thumbnail}
                onChange={(e) => {
                  setThumbnail(e.target.value);
                  setThumbnailFileName('');
                }}
                placeholder={
                  thumbnail.startsWith('data:image/')
                    ? `Local file: ${thumbnailFileName || 'Attached'}`
                    : 'Or paste image URL...'
                }
                className="flex-1 min-w-[160px] bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            {thumbnail && (
              <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <img
                  src={thumbnail}
                  alt="Thumbnail preview"
                  className="w-20 h-12 object-cover rounded-lg border border-zinc-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-emerald-400 truncate flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 shrink-0" />
                    <span>
                      {thumbnail.startsWith('data:image/')
                        ? `Local Thumbnail Ready (${thumbnailFileName || 'Uploaded'})`
                        : 'External Thumbnail URL Ready'}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    16:9 preview attached to case file
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setThumbnail('');
                    setThumbnailFileName('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 cursor-pointer"
                  title="Remove Thumbnail"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Core Systemic Question / Documentary Dossier Description"
          rows={2}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <textarea
            value={hiddenSystemSummary}
            onChange={(e) => setHiddenSystemSummary(e.target.value)}
            placeholder="The Hidden System Summary (Optional)"
            rows={2}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white"
          />
          <textarea
            value={consequence}
            onChange={(e) => setConsequence(e.target.value)}
            placeholder="The Unseen Consequence (Optional)"
            rows={2}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white"
          />
          <textarea
            value={chandradiptiReflection}
            onChange={(e) => setChandradiptiReflection(e.target.value)}
            placeholder="A. K. Chandradipti Reflection (Optional)"
            rows={2}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsPremium((prev) => !prev)}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer border ${
              isPremium
                ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-amber-500/40'
            }`}
          >
            {isPremium ? (
              <>
                <Crown className="w-4 h-4 fill-black" />
                <span>👑 Sovereign VIP Exclusive (Locked)</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span>🔓 Free Access (Click to Lock for VIP)</span>
              </>
            )}
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer"
          >
            {editingId ? (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Publish Video
              </>
            )}
          </button>
        </div>
      </form>

      <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 space-y-3">
        <h4 className="text-sm font-bold text-white">
          Published Archives ({archives.length})
        </h4>
        {archives.length === 0 ? (
          <div className="text-xs text-zinc-500 py-8 text-center">
            No video archives published yet. Use the form above to add your first documentary.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {archives.map((v) => {
              const vip = Boolean(v.isPremium || v.isVip);
              return (
                <div
                  key={v.id}
                  className="py-3 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {v.thumbnail && (
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="w-16 h-10 object-cover rounded-lg border border-zinc-800 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="truncate">{v.title}</span>
                        {vip ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono shrink-0">
                            👑 VIP
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono shrink-0">
                            FREE
                          </span>
                        )}
                      </div>
                      <div className="text-zinc-500 font-mono truncate">
                        {v.family || v.category} · {v.duration}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleSingleVideoVip(v)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all ${
                        vip
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                      }`}
                      title="Click to toggle VIP / Free status"
                    >
                      {vip ? (
                        <>
                          <Crown className="w-3 h-3 fill-black" /> VIP LOCKED
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3 text-emerald-400" /> FREE
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => startEdit(v)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-amber-400 cursor-pointer"
                      title="Edit Documentary"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(v.id)}
                      className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 cursor-pointer"
                      title="Delete Documentary"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. ADMIN LIBRARY TAB (ADD / EDIT / DELETE BOOKS & CHAPTERS + COVER UPLOAD)
// ==========================================
export const AdminLibraryTab: React.FC = () => {
  const {
    library,
    upsertLibraryItem,
    deleteLibraryItem,
    showToast,
  } = useAppContext();
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [hindiTitle, setHindiTitle] = useState('');
  const [author, setAuthor] = useState('A. K. Chandradipti');
  const [category, setCategory] = useState('Foundational Manual');
  const [excerpt, setExcerpt] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverFileName, setCoverFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [chapters, setChapters] = useState<BookChapter[]>([]);

  // Chapter sub-form (Add or Edit Chapter)
  const [editingChapterIdx, setEditingChapterIdx] = useState<number | null>(
    null
  );
  const [chapTitle, setChapTitle] = useState('');
  const [chapContent, setChapContent] = useState('');
  const [chapTakeaways, setChapTakeaways] = useState('');
  const [chapExercise, setChapExercise] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setHindiTitle('');
    setAuthor('A. K. Chandradipti');
    setCategory('Foundational Manual');
    setExcerpt('');
    setCoverUrl('');
    setCoverFileName('');
    setFileUrl('');
    setIsPremium(false);
    setChapters([]);
    setEditingChapterIdx(null);
    setChapTitle('');
    setChapContent('');
    setChapTakeaways('');
    setChapExercise('');
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = '';
    }
  };

  const startEditBook = (b: LibraryBook) => {
    setEditingId(b.id);
    setTitle(b.title || '');
    setHindiTitle(b.hindiTitle || '');
    setAuthor(b.author || 'A. K. Chandradipti');
    setCategory(b.category || 'Foundational Manual');
    setExcerpt(b.description || b.excerpt || '');
    setCoverUrl(b.coverUrl || '');
    setCoverFileName(
      b.coverUrl?.startsWith('data:image/') ? 'Uploaded Local Cover' : ''
    );
    setFileUrl(b.fileUrl || b.pdfUrl || '');
    setIsPremium(Boolean(b.isVip || b.isPremium));
    setChapters(b.chapters || []);
    setEditingChapterIdx(null);
    setChapTitle('');
    setChapContent('');
    setChapTakeaways('');
    setChapExercise('');
  };

  const handleLocalCoverUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFileToDataUrl(file, 600, 840, 0.82);
      setCoverUrl(dataUrl);
      setCoverFileName(file.name);
      showToast({
        title: 'Book Cover Uploaded',
        message: `"${file.name}" attached to manuscript.`,
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        title: 'Cover Upload Failed',
        message: err?.message || 'Could not process cover image.',
        type: 'error',
      });
    }
  };

  const handleSaveChapterToDraft = () => {
    if (!chapTitle.trim() || !chapContent.trim()) return;
    const takeawaysArr = chapTakeaways
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingChapterIdx !== null) {
      const updated = chapters.map((ch, idx) =>
        idx === editingChapterIdx
          ? {
              ...ch,
              number: idx + 1,
              chapterNumber: idx + 1,
              title: chapTitle.trim(),
              hindiTitle: chapTitle.trim(),
              content: chapContent.trim(),
              summary: chapContent.trim(),
              keyTakeaways: takeawaysArr,
              practicalExercise: chapExercise.trim(),
              practicalDrill: chapExercise.trim(),
            }
          : ch
      );
      setChapters(updated);
      setEditingChapterIdx(null);
    } else {
      const nextNum = chapters.length + 1;
      const newChap: BookChapter = {
        number: nextNum,
        chapterNumber: nextNum,
        title: chapTitle.trim(),
        hindiTitle: chapTitle.trim(),
        content: chapContent.trim(),
        summary: chapContent.trim(),
        keyTakeaways: takeawaysArr,
        practicalExercise: chapExercise.trim(),
        practicalDrill: chapExercise.trim(),
      };
      setChapters([...chapters, newChap]);
    }
    setChapTitle('');
    setChapContent('');
    setChapTakeaways('');
    setChapExercise('');
  };

  const startEditChapterInDraft = (idx: number) => {
    const ch = chapters[idx];
    if (!ch) return;
    setEditingChapterIdx(idx);
    setChapTitle(ch.hindiTitle || ch.title || '');
    setChapContent(ch.content || ch.summary || '');
    setChapTakeaways((ch.keyTakeaways || []).join('\n'));
    setChapExercise(ch.practicalExercise || ch.practicalDrill || '');
  };

  const removeChapterFromDraft = (idx: number) => {
    setChapters(
      chapters
        .filter((_, i) => i !== idx)
        .map((c, i) => ({ ...c, number: i + 1, chapterNumber: i + 1 }))
    );
    if (editingChapterIdx === idx) {
      setEditingChapterIdx(null);
      setChapTitle('');
      setChapContent('');
      setChapTakeaways('');
      setChapExercise('');
    }
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast({
        title: 'Title Required',
        message: 'Please enter a book title.',
        type: 'warning',
      });
      return;
    }

    const docId = editingId || `book_${Date.now()}`;
    const payload: LibraryBook = {
      id: docId,
      title: title.trim(),
      hindiTitle: hindiTitle.trim() || title.trim(),
      author: author.trim() || 'A. K. Chandradipti',
      category: category.trim() || 'Foundational Manual',
      excerpt: excerpt.trim(),
      description: excerpt.trim(),
      coverUrl:
        coverUrl.trim() ||
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
      fileUrl: fileUrl.trim(),
      pdfUrl: fileUrl.trim(),
      isPremium,
      isVip: isPremium,
      chapters,
      updatedAt: new Date().toISOString(),
    };

    upsertLibraryItem(payload);
    if (editingId) {
      showToast({
        title: 'Book Updated',
        message: `"${payload.title}" updated in the Great Library for all users.`,
        type: 'success',
      });
    } else {
      showToast({
        title: 'Book Added',
        message: `"${payload.title}" published to the Great Library for all users.`,
        type: 'success',
      });
    }
    resetForm();
  };

  const toggleBookVip = async (b: LibraryBook) => {
    const nextVip = !Boolean(b.isVip || b.isPremium);
    upsertLibraryItem({
      ...b,
      isVip: nextVip,
      isPremium: nextVip,
      updatedAt: new Date().toISOString(),
    });
    showToast({
      title: nextVip ? 'Book Locked (VIP)' : 'Book Unlocked (Free)',
      message: `${b.title} is now ${nextVip ? 'VIP Exclusive' : 'Free'}.`,
      type: 'info',
    });
  };

  const handleDeleteBook = async (id: string) => {
    deleteLibraryItem(id);
    if (editingId === id) {
      resetForm();
    }
    showToast({
      title: 'Book Deleted',
      message: 'Removed from the Great Library.',
      type: 'info',
    });
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSaveBook}
        className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>
              {editingId
                ? 'Edit Manuscript & Interactive Chapters (पुस्तक संपादित करें)'
                : 'Add Manuscript / Book (नई पुस्तक जोड़ें)'}
            </span>
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Book Title (English / Primary)"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
          />
          <input
            value={hindiTitle}
            onChange={(e) => setHindiTitle(e.target.value)}
            placeholder="Hindi Title (Optional)"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-amber-300"
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
              Book Cover Image (Upload Locally or Paste URL)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLocalCoverUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {coverFileName ? 'Change Cover' : 'Upload Cover Image'}
                </span>
              </button>
              <input
                value={coverUrl.startsWith('data:image/') ? '' : coverUrl}
                onChange={(e) => {
                  setCoverUrl(e.target.value);
                  setCoverFileName('');
                }}
                placeholder={
                  coverUrl.startsWith('data:image/')
                    ? `Local file: ${coverFileName || 'Attached'}`
                    : 'Or paste cover image URL...'
                }
                className="flex-1 min-w-[150px] bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
              In-App Protected PDF / Google Drive URL (Optional — Opens Strictly In-App)
            </label>
            <input
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="Google Drive PDF share link or direct PDF URL"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>
        </div>

        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Core Thesis / Description"
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-white"
        />

        {/* Built-in Interactive Chapters Builder */}
        <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 uppercase font-bold">
              Interactive In-App Reader Chapters ({chapters.length} Chapters)
            </span>
            {editingChapterIdx !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingChapterIdx(null);
                  setChapTitle('');
                  setChapContent('');
                  setChapTakeaways('');
                  setChapExercise('');
                }}
                className="text-[10px] font-mono text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel Chapter Edit
              </button>
            )}
          </div>

          {chapters.length > 0 && (
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {chapters.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs"
                >
                  <span className="text-zinc-200 font-medium truncate">
                    Ch {idx + 1}: {c.hindiTitle || c.title}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => startEditChapterInDraft(idx)}
                      className="text-amber-400 hover:text-amber-300 p-1 cursor-pointer"
                      title="Edit Chapter"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeChapterFromDraft(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      title="Delete Chapter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2.5 pt-1">
            <input
              type="text"
              value={chapTitle}
              onChange={(e) => setChapTitle(e.target.value)}
              placeholder="Chapter Title (e.g. अध्याय १: मानसिक संप्रभुता)"
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <textarea
              value={chapContent}
              onChange={(e) => setChapContent(e.target.value)}
              placeholder="Chapter Full Text Content..."
              rows={3}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={chapTakeaways}
                onChange={(e) => setChapTakeaways(e.target.value)}
                placeholder="Key Takeaways (optional, separated by newline)"
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chapExercise}
                  onChange={(e) => setChapExercise(e.target.value)}
                  placeholder="Practical Field Drill (Optional)"
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleSaveChapterToDraft}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-mono font-bold cursor-pointer shrink-0"
                >
                  {editingChapterIdx !== null
                    ? 'Update Chapter'
                    : '+ Add Chapter'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-mono text-amber-400 cursor-pointer">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="accent-amber-500"
            />
            <span>Sovereign VIP Exclusive</span>
          </label>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer"
          >
            {editingId ? (
              <>
                <Save className="w-4 h-4" /> Save Book Changes
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Publish Book
              </>
            )}
          </button>
        </div>
      </form>

      <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 space-y-3">
        <h4 className="text-sm font-bold text-white">
          Library Catalog ({library.length})
        </h4>
        {library.length === 0 ? (
          <div className="text-xs text-zinc-500 py-8 text-center">
            No books published yet. Use the form above to add a manuscript or PDF book.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {library.map((b) => {
              const vip = Boolean(b.isVip || b.isPremium);
              return (
                <div
                  key={b.id}
                  className="py-3 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {b.coverUrl && (
                      <img
                        src={b.coverUrl}
                        alt={b.title}
                        className="w-10 h-14 object-cover rounded-lg border border-zinc-800 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="truncate">{b.title}</span>
                        {vip && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono shrink-0">
                            VIP
                          </span>
                        )}
                      </div>
                      <div className="text-zinc-500 font-mono truncate">
                        {b.author} · {b.category} · {(b.chapters || []).length}{' '}
                        chapters {b.fileUrl ? '· PDF Attached' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleBookVip(b)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold cursor-pointer ${
                        vip
                          ? 'bg-amber-500 text-black'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {vip ? 'VIP' : 'FREE'}
                    </button>
                    <button
                      onClick={() => startEditBook(b)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-amber-400 cursor-pointer"
                      title="Edit Book & Chapters"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBook(b.id)}
                      className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 cursor-pointer"
                      title="Delete Book"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. ADMIN SHOP TAB (ADD / EDIT / DELETE + IMAGE UPLOAD)
// ==========================================
export const AdminShopTab: React.FC = () => {
  const { showToast } = useAppContext();
  const productImgInputRef = useRef<HTMLInputElement | null>(null);

  const [products, setProducts] = useState<ShopProduct[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SHOP_CACHE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter((p) => !isDemoShopItem(p));
        }
      }
    } catch {}
    return [];
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('₹299');
  const [category, setCategory] = useState('Books & Manuals');
  const [platform, setPlatform] = useState('Amazon');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetchServerSync().then((serverData) => {
      if (Array.isArray(serverData?.shop)) {
        setProducts((prev) => {
          const next = mergeContentById<ShopProduct>(
            serverData!.shop!,
            prev,
            (p) => !isDemoShopItem(p)
          );
          localStorage.setItem(STORAGE_KEYS.SHOP_CACHE, JSON.stringify(next));
          return next;
        });
      }
    });

    const unsubSnap = onSnapshot(
      collection(db, 'shop'),
      (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            markDocDeleted(change.doc.id);
            pushServerSync('shop', 'delete', change.doc.id);
          }
        });
        const firestoreProducts = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as ShopProduct))
          .filter((p) => !isDemoShopItem(p));
        let cached: ShopProduct[] = [];
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.SHOP_CACHE);
          if (raw) cached = JSON.parse(raw);
        } catch {}
        const filteredCached = !snap.metadata.fromCache
          ? cached.filter(
              (c) =>
                firestoreProducts.some((f) => f.id === c.id) ||
                Date.now() - (c.updatedAtMs || 0) < 12000
            )
          : cached;
        const merged = mergeContentById<ShopProduct>(
          firestoreProducts,
          filteredCached,
          (p) => !isDemoShopItem(p)
        );
        setProducts(merged);
        localStorage.setItem(STORAGE_KEYS.SHOP_CACHE, JSON.stringify(merged));
      },
      () => {}
    );

    const unsubBroadcast = subscribeContentBroadcast(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.SHOP_CACHE);
        if (raw) {
          setProducts(
            mergeContentById<ShopProduct>(
              JSON.parse(raw),
              [],
              (p) => !isDemoShopItem(p)
            )
          );
        }
      } catch {}
    });

    return () => {
      unsubSnap();
      unsubBroadcast();
    };
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrice('₹299');
    setCategory('Books & Manuals');
    setPlatform('Amazon');
    setAffiliateUrl('');
    setImageUrl('');
    setImageFileName('');
    setDescription('');
    setIsPremium(false);
    if (productImgInputRef.current) {
      productImgInputRef.current.value = '';
    }
  };

  const startEditProduct = (p: ShopProduct) => {
    setEditingId(p.id);
    setName(p.name || '');
    setPrice(p.price || '₹299');
    setCategory(p.category || 'Books & Manuals');
    setPlatform(p.platform || 'Amazon');
    setAffiliateUrl(p.affiliateUrl || '');
    setImageUrl(p.imageUrl || '');
    setImageFileName(
      p.imageUrl?.startsWith('data:image/') ? 'Uploaded Local Image' : ''
    );
    setDescription(p.description || '');
    setIsPremium(Boolean(p.isPremium));
  };

  const handleLocalProductImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFileToDataUrl(file, 700, 700, 0.82);
      setImageUrl(dataUrl);
      setImageFileName(file.name);
      showToast({
        title: 'Product Image Uploaded',
        message: `"${file.name}" attached to product.`,
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        title: 'Upload Failed',
        message: err?.message || 'Could not process product image.',
        type: 'error',
      });
    }
  };

  const upsertShopProduct = (item: ShopProduct) => {
    const nowIso = new Date().toISOString();
    const cleanItem = sanitizeForFirestore({
      ...item,
      name: (item.name || 'Strategic Resource').trim(),
      category: (item.category || 'Resources').trim(),
      createdAt: item.createdAt || nowIso,
      updatedAtMs: Date.now(),
      updatedAt: nowIso,
    }) as ShopProduct;

    unmarkDocDeleted(cleanItem.id);
    setProducts((prev) => {
      const next = mergeContentById<ShopProduct>(
        [cleanItem],
        prev,
        (p) => !isDemoShopItem(p)
      );
      localStorage.setItem(STORAGE_KEYS.SHOP_CACHE, JSON.stringify(next));
      return next;
    });
    pushServerSync('shop', 'set', cleanItem.id, cleanItem).finally(() => {
      broadcastContentUpdate('shop', cleanItem);
    });
    setDoc(
      doc(db, 'shop', cleanItem.id),
      prepareForFirestoreWrite({
        ...cleanItem,
        createdAt: item.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      { merge: true }
    ).catch(() => {});
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast({
        title: 'Product Name Required',
        message: 'Please enter a product name.',
        type: 'warning',
      });
      return;
    }

    const docId = editingId || `prod_${Date.now()}`;
    const payload: ShopProduct = {
      id: docId,
      name: name.trim(),
      price: price.trim(),
      category: category.trim(),
      platform: platform.trim(),
      affiliateUrl: affiliateUrl.trim() || 'https://www.amazon.in',
      imageUrl:
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop',
      description: description.trim(),
      isPremium,
      clicks: editingId
        ? products.find((p) => p.id === editingId)?.clicks || 0
        : 0,
      updatedAt: new Date().toISOString(),
    };

    upsertShopProduct(payload);
    if (editingId) {
      showToast({
        title: 'Product Updated',
        message: `"${payload.name}" updated in Strategic Shop for all users.`,
        type: 'success',
      });
    } else {
      showToast({
        title: 'Shop Product Added',
        message: `"${payload.name}" published to Strategic Shop for all users.`,
        type: 'success',
      });
    }
    resetForm();
  };

  const toggleProductVip = async (p: ShopProduct) => {
    const nextVip = !Boolean(p.isPremium);
    upsertShopProduct({
      ...p,
      isPremium: nextVip,
      updatedAt: new Date().toISOString(),
    });
    showToast({
      title: nextVip ? 'Product VIP Locked' : 'Product Unlocked',
      message: `${p.name} is now ${nextVip ? 'VIP Exclusive' : 'Open to All'}.`,
      type: 'info',
    });
  };

  const handleDeleteProduct = async (id: string) => {
    markDocDeleted(id);
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.SHOP_CACHE, JSON.stringify(next));
      return next;
    });
    pushServerSync('shop', 'delete', id).finally(() => {
      broadcastContentUpdate('shop', { id, deleted: true });
    });
    deleteDoc(doc(db, 'shop', id)).catch(() => {});
    if (editingId === id) {
      resetForm();
    }
    showToast({
      title: 'Product Removed',
      message: 'Deleted from Strategic Shop.',
      type: 'info',
    });
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSaveProduct}
        className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>
              {editingId
                ? 'Edit Strategic Resource / Product (संसाधन संपादित करें)'
                : 'Add Strategic Resource / Product (नया संसाधन जोड़ें)'}
            </span>
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product Name"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price (e.g., ₹399)"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
          />
          <input
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="Platform (e.g., Amazon)"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <input
            value={affiliateUrl}
            onChange={(e) => setAffiliateUrl(e.target.value)}
            placeholder="Store / Affiliate Link URL"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
          />
          <div className="flex items-center gap-2">
            <input
              ref={productImgInputRef}
              type="file"
              accept="image/*"
              onChange={handleLocalProductImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => productImgInputRef.current?.click()}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{imageFileName ? 'Change Image' : 'Upload Image'}</span>
            </button>
            <input
              value={imageUrl.startsWith('data:image/') ? '' : imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImageFileName('');
              }}
              placeholder={
                imageUrl.startsWith('data:image/')
                  ? `Local file: ${imageFileName || 'Attached'}`
                  : 'Or Product Image URL'
              }
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
            />
          </div>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Strategic value description"
          rows={2}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-white"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-mono text-amber-400 cursor-pointer">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="accent-amber-500"
            />
            <span>VIP Exclusive Resource</span>
          </label>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer"
          >
            {editingId ? (
              <>
                <Save className="w-4 h-4" /> Save Product
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add Product
              </>
            )}
          </button>
        </div>
      </form>

      <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 space-y-3">
        <h4 className="text-sm font-bold text-white">
          Shop Catalog ({products.length})
        </h4>
        {products.length === 0 ? (
          <div className="text-xs text-zinc-500 py-8 text-center">
            No shop items published yet. Use the form above to add a product.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {products.map((p) => (
              <div
                key={p.id}
                className="py-3 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-12 h-12 object-cover rounded-lg border border-zinc-800 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="truncate">{p.name}</span>
                      <span className="text-amber-400 font-mono shrink-0">
                        ({p.price})
                      </span>
                      {p.isPremium && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono shrink-0">
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-500 font-mono truncate">
                      {p.category} · {p.platform || 'Store'} · {p.clicks || 0}{' '}
                      clicks
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleProductVip(p)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold cursor-pointer ${
                      p.isPremium
                        ? 'bg-amber-500 text-black'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {p.isPremium ? 'VIP' : 'FREE'}
                  </button>
                  <button
                    onClick={() => startEditProduct(p)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-amber-400 cursor-pointer"
                    title="Edit Product"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 cursor-pointer"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 5. ADMIN FORUM TAB (ADD / EDIT / DELETE POSTS)
// ==========================================
export const AdminForumTab: React.FC = () => {
  const { user, profile, showToast } = useAppContext();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [adminDecree, setAdminDecree] = useState('');
  const [topic, setTopic] = useState('Systemic Observations');

  useEffect(() => {
    return onSnapshot(
      collection(db, 'posts'),
      (snap) => {
        const list = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as CommunityPost)
        );
        list.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() || 0;
          const tb = b.createdAt?.toMillis?.() || 0;
          return tb - ta;
        });
        setPosts(list);
      },
      () => {}
    );
  }, []);

  const resetPostForm = () => {
    setEditingPostId(null);
    setAdminDecree('');
    setTopic('Systemic Observations');
  };

  const startEditPost = (post: CommunityPost) => {
    setEditingPostId(post.id);
    setAdminDecree(post.content || '');
    setTopic(post.topic || 'Systemic Observations');
  };

  const handleSaveAdminPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminDecree.trim() || !user) return;

    if (editingPostId) {
      await setDoc(
        doc(db, 'posts', editingPostId),
        {
          topic,
          content: adminDecree.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      showToast({
        title: 'Post Updated',
        message: 'Forum post updated on server.',
        type: 'success',
      });
    } else {
      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: profile?.displayName || 'Sovereign Command (Admin)',
        authorPhotoURL: profile?.photoURL || null,
        authorRole: 'Admin',
        topic,
        content: adminDecree.trim(),
        likes: 0,
        likedBy: [],
        replies: [],
        createdAt: serverTimestamp(),
      });
      showToast({
        title: 'Admin Decree Published',
        message: 'Your official post is now live in the Sovereign Sabha.',
        type: 'success',
      });
    }
    resetPostForm();
  };

  const handleDeletePost = async (id: string) => {
    await deleteDoc(doc(db, 'posts', id));
    if (editingPostId === id) {
      resetPostForm();
    }
    showToast({
      title: 'Post Removed',
      message: 'Forum post deleted by moderator.',
      type: 'info',
    });
  };

  return (
    <div className="space-y-6">
      {user && (
        <form
          onSubmit={handleSaveAdminPost}
          className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-400" />
              <span>
                {editingPostId
                  ? 'Edit Forum Post (पोस्ट संपादित करें)'
                  : 'Publish Official Admin Decree to Sabha (प्रशासक संदेश)'}
              </span>
            </h3>
            <div className="flex items-center gap-2">
              {editingPostId && (
                <button
                  type="button"
                  onClick={resetPostForm}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Cancel Edit
                </button>
              )}
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono text-amber-400"
              >
                <option value="Systemic Observations">
                  Systemic Observations
                </option>
                <option value="100-Day Protocol">100-Day Protocol</option>
                <option value="Mental Models">Mental Models</option>
                <option value="Book Insights">Book Insights</option>
              </select>
            </div>
          </div>
          <textarea
            value={adminDecree}
            onChange={(e) => setAdminDecree(e.target.value)}
            placeholder="Write an official Sovereign Command announcement or discussion prompt..."
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-white"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              {editingPostId ? (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Post Changes
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Post Official Decree
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Community Forum Moderation ({posts.length} Posts)</span>
          </h3>
        </div>

        {posts.length === 0 ? (
          <div className="text-xs text-zinc-500 py-8 text-center">
            No community posts to moderate.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {posts.map((post) => (
              <div
                key={post.id}
                className="py-4 flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{post.authorName}</span>
                    {post.authorRole && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                        {post.authorRole}
                      </span>
                    )}
                    <span className="text-amber-400 font-mono">
                      [{post.topic || 'General'}]
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">{post.content}</p>
                  <div className="text-[10px] font-mono text-zinc-500">
                    {post.likes || 0} likes · {(post.replies || []).length} replies
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => startEditPost(post)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-amber-400 cursor-pointer"
                    title="Edit Post"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 cursor-pointer"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
