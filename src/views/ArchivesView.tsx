import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PlayCircle, Search, Lock, Unlock, Crown, Zap, Eye } from 'lucide-react';
import { VideoArchive } from '../types';
import { NoContent, VipSectionLockedView } from '../components/common/UiPrimitives';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

const VIDEO_FAMILY_FILTERS = [
  { id: 'All', labelHi: 'सभी (All)', labelEn: 'All Documentaries' },
  { id: 'Why India?', labelHi: 'भारत क्यों? (Why India?)', labelEn: 'Why India?' },
  { id: 'How India Works', labelHi: 'व्यवस्था कैसे काम करती है?', labelEn: 'How India Works' },
  { id: 'The Hidden System', labelHi: 'अदृश्य सामाजिक तंत्र', labelEn: 'The Hidden System' },
  { id: 'The Path', labelHi: 'सही रास्ता (The Path)', labelEn: 'The Path' },
  { id: 'The Uncomfortable Truth', labelHi: 'कड़वा सच (Truth)', labelEn: 'The Uncomfortable Truth' },
];

export const VideoCard: React.FC<{
  video: VideoArchive;
  onClick: () => void;
  isLocked?: boolean;
  onUnlockClick?: () => void;
  isAdmin?: boolean;
  onToggleVip?: (e: React.MouseEvent) => void;
}> = ({ video, onClick, isLocked, onUnlockClick, isAdmin, onToggleVip }) => {
  const { t } = useLanguage();
  const isVip = Boolean(video.isPremium || video.isVip);

  return (
    <div
      className={`group cursor-pointer flex flex-col justify-between space-y-4 ${
        isLocked ? 'opacity-90' : ''
      }`}
      onClick={isLocked ? onUnlockClick : onClick}
    >
      <div className="space-y-3">
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-800/80 shadow-2xl transition-all group-hover:border-amber-500/40 group-hover:scale-[1.01] bg-zinc-950">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isLocked ? (
              <div className="w-14 h-14 bg-zinc-900/90 border border-amber-500/50 rounded-full flex flex-col items-center justify-center shadow-2xl">
                <Lock className="w-5 h-5 text-amber-500 mb-0.5" />
                <span className="text-[7px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                  Unlock
                </span>
              </div>
            ) : (
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <PlayCircle className="w-8 h-8 text-black fill-black" />
              </div>
            )}
          </div>

          {(video.family || video.category) && (
            <div className="absolute top-3 left-3 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider px-2.5 py-1 bg-black/80 backdrop-blur border border-amber-500/30 rounded-md">
              {video.family || video.category}
            </div>
          )}

          {isAdmin && onToggleVip ? (
            <button
              type="button"
              onClick={onToggleVip}
              className={`absolute top-3 right-3 z-10 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg transition-all cursor-pointer ${
                isVip
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-white/20'
              }`}
              title="Admin: Click to Toggle VIP / Free"
            >
              {isVip ? (
                <>
                  <Crown size={11} fill="black" /> VIP LOCKED
                </>
              ) : (
                <>
                  <Unlock size={11} className="text-emerald-400" /> FREE (Lock VIP)
                </>
              )}
            </button>
          ) : (
            isVip && (
              <div className="absolute top-3 right-3 text-[9px] font-mono font-bold text-black uppercase tracking-wider px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-md flex items-center gap-1 shadow-md">
                Sovereign <Zap size={10} fill="black" />
              </div>
            )
          )}
        </div>

        <div className="space-y-1.5 px-0.5">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between gap-2">
            <span>
              {video.family || video.category
                ? `${video.family || video.category} · Investigation`
                : 'Documentary Case File'}
            </span>
            {isVip && (
              <span className="text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                👑 VIP Exclusive
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors tracking-tight line-clamp-2 leading-snug">
            {video.title}
          </h3>

          {(video.question || video.description) && (
            <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
              "{video.question || video.description}"
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono pt-1">
            <span>{video.views || 'Protected'} Views</span>
            <span aria-hidden="true">·</span>
            <span>{video.duration}</span>
            <span aria-hidden="true">·</span>
            <span>{t('हिंदी विश्लेषण', 'Hindi Commentary')}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`w-full py-2.5 border rounded-xl transition-all text-xs font-mono font-bold uppercase tracking-wider cursor-pointer ${
          isLocked
            ? 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500 hover:text-black'
            : 'text-zinc-300 border-zinc-800 bg-zinc-900/60 group-hover:bg-white group-hover:text-black group-hover:border-white'
        }`}
      >
        {isLocked
          ? t('🔒 Sovereign केस-फ़ाइल अनलॉक करें', '🔒 Unlock Sovereign Dossier')
          : t('वृत्तचित्र देखें व विश्लेषण पढ़ें', 'Watch & Inspect Dossier')}
      </button>
    </div>
  );
};

export const ArchivesView: React.FC = () => {
  const {
    archives,
    upsertArchiveItem,
    isSectionVipGated,
    openAscensionModal,
    openVideoModal,
    isUserVip,
    isCurrentUserAdmin,
    handleTabClick,
    showToast,
  } = useAppContext();
  const { t } = useLanguage();

  const [selectedArchiveFamily, setSelectedArchiveFamily] = useState('All');
  const [vipFilter, setVipFilter] = useState<'all' | 'vip' | 'free'>('all');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [previewAsStandardUser, setPreviewAsStandardUser] = useState(false);

  if (isSectionVipGated('archives')) {
    return (
      <VipSectionLockedView
        sectionTitle="Talk2Society Video Archives"
        hindiTitle="सामाजिक वृत्तचित्र संग्रह"
        description="Documentary archives and investigative breakdowns are currently reserved for Sovereign VIP members. Upgrade to unlock all deep video breakdowns."
        onUnlock={openAscensionModal}
      />
    );
  }

  const handleQuickToggleVip = (e: React.MouseEvent, v: VideoArchive) => {
    e.stopPropagation();
    const nextVip = !Boolean(v.isPremium || v.isVip);
    upsertArchiveItem({
      ...v,
      youtubeEmbedId: v.youtubeEmbedId || '',
      isPremium: nextVip,
      isVip: nextVip,
      updatedAt: new Date().toISOString(),
      updatedAtMs: Date.now(),
    });
    showToast({
      title: nextVip ? '👑 Video Locked as VIP' : '🔓 Video Set to Free',
      message: `"${v.title}" is now ${nextVip ? 'Sovereign VIP Only' : 'Free for all users'}.`,
      type: 'success',
    });
  };

  const filteredArchives = archives.filter((v) => {
    const isVideoVip = Boolean(v.isPremium || v.isVip);
    if (vipFilter === 'vip' && !isVideoVip) return false;
    if (vipFilter === 'free' && isVideoVip) return false;

    const fam = v.family || v.category || '';
    const matchesFamily =
      selectedArchiveFamily === 'All' ||
      fam.toLowerCase() === selectedArchiveFamily.toLowerCase();
    const q = archiveSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      v.title.toLowerCase().includes(q) ||
      (v.question && v.question.toLowerCase().includes(q)) ||
      (v.description && v.description.toLowerCase().includes(q)) ||
      fam.toLowerCase().includes(q);
    return matchesFamily && matchesSearch;
  });

  const effectiveIsVipViewer = isUserVip && !previewAsStandardUser;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 w-full"
    >
      <div className="bg-[#0c0e14] border border-[#1d222e] rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400 font-mono">
                Documentary Archives · सामाजिक वृत्तचित्र संग्रह
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Talk2Society{' '}
              <span className="text-amber-400 font-bold">
                {t('डॉक्यूमेंट्री वीडियो', 'Investigative Archives')}
              </span>
            </h2>
            <p className="text-xs text-zinc-300 mt-1 max-w-xl font-normal leading-relaxed">
              {t(
                'भारतीय समाज, पारिवारिक दबावों, शादी के खर्च, कोचिंग माफिया और करियर की ज़मीनी हकीकत पर आधारित गहन वीडियो।',
                'In-depth investigative documentaries dissecting Indian society, family expectations, wedding debt, coaching factories, and economic realities.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {/* VIP Access Filter Toggle Buttons */}
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 text-xs font-mono">
              <button
                type="button"
                onClick={() => setVipFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  vipFilter === 'all'
                    ? 'bg-amber-500 text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t('सभी', 'All')}
              </button>
              <button
                type="button"
                onClick={() => setVipFilter('vip')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  vipFilter === 'vip'
                    ? 'bg-amber-500 text-black'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <Crown className="w-3 h-3" />
                <span>VIP</span>
              </button>
              <button
                type="button"
                onClick={() => setVipFilter('free')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  vipFilter === 'free'
                    ? 'bg-amber-500 text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t('निःशुल्क', 'Free')}
              </button>
            </div>

            {isCurrentUserAdmin && (
              <button
                type="button"
                onClick={() => setPreviewAsStandardUser((p) => !p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  previewAsStandardUser
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
                }`}
                title="Preview how non-VIP users see locked VIP videos"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {previewAsStandardUser
                    ? t('सामान्य यूज़र प्रीव्यू: चालू', 'User Lock Preview: ON')
                    : t('VIP लॉक प्रीव्यू', 'Test VIP Lock')}
                </span>
              </button>
            )}

            <span className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono font-medium text-zinc-300">
              {filteredArchives.length} / {archives.length}{' '}
              {t('वृत्तचित्र', 'Videos')}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={archiveSearch}
              onChange={(e) => setArchiveSearch(e.target.value)}
              placeholder={t(
                'डॉक्यूमेंट्री का नाम, सवाल या विषय खोजें...',
                'Search documentary title, systemic question, or topic...'
              )}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-hide">
            {VIDEO_FAMILY_FILTERS.map((fam) => {
              const isSelected =
                selectedArchiveFamily.toLowerCase() === fam.id.toLowerCase();
              return (
                <button
                  key={fam.id}
                  onClick={() => setSelectedArchiveFamily(fam.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {t(fam.labelHi, fam.labelEn)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {archives.length === 0 ? (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto bg-white/5 rounded-[32px] border border-white/5 p-8">
          <PlayCircle className="w-12 h-12 text-zinc-500 mx-auto" />
          <div className="space-y-1">
            <p className="text-white font-bold text-sm uppercase tracking-wider">
              {t('वृत्तचित्र आर्काइव खाली है', 'Archives Empty')}
            </p>
            <p className="text-zinc-400 text-xs font-mono">
              The documentary archive is being prepared. Real video content will be published soon.
            </p>
          </div>
          {isCurrentUserAdmin && (
            <button
              onClick={() => handleTabClick('admin')}
              className="mt-2 px-5 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 hover:text-black transition-all inline-block cursor-pointer"
            >
              Add Videos in Admin Panel
            </button>
          )}
        </div>
      ) : filteredArchives.length === 0 ? (
        <NoContent label="Matching Documentaries" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredArchives.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              isLocked={Boolean(
                (v.isPremium || v.isVip) && !effectiveIsVipViewer
              )}
              onClick={() => openVideoModal(v)}
              onUnlockClick={openAscensionModal}
              isAdmin={isCurrentUserAdmin}
              onToggleVip={(e) => handleQuickToggleVip(e, v)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
