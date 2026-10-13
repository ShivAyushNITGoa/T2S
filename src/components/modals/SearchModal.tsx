import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Target, PlayCircle, BookOpen, ChevronRight } from 'lucide-react';
import { VideoArchive, LibraryBook } from '../../types';
import { getLocalDateString, isCompletedOnDate } from '../../utils/dateUtils';
import { useAppContext } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    closeSearchModal,
    journeyModules,
    archives,
    library,
    profile,
    isUserVip,
    openAscensionModal,
    handleTabClick,
    openVideoModal,
    openBookModal,
    openJourneyModuleModal,
  } = useAppContext();
  const { t } = useLanguage();

  const [queryStr, setQueryStr] = useState('');

  if (!isSearchOpen) return null;

  const completedDays = profile?.completedDays || [];
  const completedToday = isCompletedOnDate(
    profile?.lastCompletedAt,
    getLocalDateString(),
    profile?.lastCompletedDate
  );
  const nextActiveDay = (() => {
    for (let d = 1; d <= 100; d++) {
      if (!completedDays.includes(d)) return d;
    }
    return 100;
  })();

  const results = [
    ...journeyModules
      .filter((m) => {
        const isCompleted = completedDays.includes(m.day);
        const isTodayUnlocked = !completedToday && m.day === nextActiveDay;
        const journeyLocked = !isCompleted && !isTodayUnlocked;
        const isPremiumLocked = Boolean(m.isPremium || m.isVip) && !isUserVip;
        return !(journeyLocked || isPremiumLocked);
      })
      .map((m) => ({ ...m, type: 'journey' as const })),
    ...archives.map((a) => ({ ...a, type: 'archive' as const })),
    ...library.map((l) => ({ ...l, type: 'library' as const })),
  ]
    .filter((item) => {
      const title = item.title?.toLowerCase() || '';
      const desc =
        (item as any).description?.toLowerCase() || (item as any).excerpt?.toLowerCase() || '';
      const q = queryStr.toLowerCase();
      return title.includes(q) || desc.includes(q);
    })
    .slice(0, 8);

  const handleSelect = (type: 'journey' | 'archive' | 'library', item: any) => {
    const isLocked = Boolean(item.isPremium || item.isVip) && !isUserVip;
    if (isLocked) {
      closeSearchModal();
      openAscensionModal();
      return;
    }
    closeSearchModal();
    if (type === 'journey') {
      handleTabClick('journey');
      openJourneyModuleModal(item);
    }
    if (type === 'archive') {
      handleTabClick('archives');
      openVideoModal(item as VideoArchive);
    }
    if (type === 'library') {
      handleTabClick('library');
      openBookModal(item as LibraryBook);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-start justify-center pt-24 px-6"
      onClick={closeSearchModal}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <button
            onClick={closeSearchModal}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <Target className="text-white w-6 h-6" />
          <input
            autoFocus
            placeholder={t(
              'खोजें: वीडियो, ग्रंथ या अध्याय...',
              'COMMAND: SEARCH DATABASE...'
            )}
            className="flex-1 bg-transparent border-none outline-none text-xl font-black italic text-white placeholder:text-neutral-700 font-mono"
            value={queryStr}
            onChange={(e) => setQueryStr(e.target.value)}
          />
          <div className="px-2 py-1 bg-white/5 rounded text-[8px] font-black uppercase text-gray-700 font-mono">
            {t('बंद करें (ESC)', 'ESC TO EXIT')}
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {queryStr && results.length === 0 && (
            <div className="py-12 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">
              {t('कोई परिणाम नहीं मिला', 'Zero Matches Found in Core')}
            </div>
          )}
          {!queryStr && (
            <div className="py-12 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">
              {t('खोजने के लिए टाइप करें...', 'Input Directive to Search')}
            </div>
          )}
          {results.map((r, i: number) => (
            <button
              key={i}
              onClick={() => handleSelect(r.type, r)}
              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-transparent hover:border-white/10 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white/10 text-white">
                  {r.type === 'journey' ? (
                    <Target size={16} />
                  ) : r.type === 'archive' ? (
                    <PlayCircle size={16} />
                  ) : (
                    <BookOpen size={16} />
                  )}
                </div>
                <div>
                  <div className="text-white font-bold">{r.title}</div>
                  <div className="text-[10px] text-gray-700 uppercase font-black tracking-widest font-mono italic">
                    {r.type} ARCHIVE
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-800" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
