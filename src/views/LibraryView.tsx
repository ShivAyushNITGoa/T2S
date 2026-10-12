import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, Lock, Zap, ChevronRight } from 'lucide-react';
import { LibraryBook } from '../types';
import { VipSectionLockedView } from '../components/common/UiPrimitives';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export const BookCard: React.FC<{
  book: LibraryBook;
  onClick: () => void;
  isLocked?: boolean;
  onUnlockClick?: () => void;
}> = ({ book, onClick, isLocked, onUnlockClick }) => {
  const { t } = useLanguage();
  const isVip = Boolean(book.isPremium || book.isVip);

  return (
    <div
      className={`bg-[#0c0e14] border border-[#1d222e] hover:border-amber-500/30 rounded-[28px] p-5 transition-all group cursor-pointer flex flex-col justify-between shadow-xl relative overflow-hidden ${
        isLocked ? 'opacity-90' : ''
      }`}
      onClick={isLocked ? onUnlockClick : onClick}
    >
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="w-full sm:w-32 h-44 bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shrink-0 relative group-hover:scale-[1.02] transition-transform">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          ) : (
            <div className="w-full h-full border border-white/5 bg-black/50 flex flex-col items-center justify-center p-2 text-center">
              <BookOpen className="w-8 h-8 text-amber-500/60 mb-2" />
              <span className="text-[8px] font-mono text-gray-500 uppercase">
                Strategic Text
              </span>
            </div>
          )}

          {isLocked && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-[2px]">
              <Lock className="w-6 h-6 text-amber-500 mb-1" />
              <span className="text-[7px] font-mono text-amber-500 font-black uppercase tracking-widest">
                Locked Pass
              </span>
            </div>
          )}

          {isVip && (
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
              {isVip && (
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
              "{book.description || book.excerpt}"
            </p>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span
              className={`text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 ${
                isLocked
                  ? 'text-amber-500'
                  : 'text-gray-300 group-hover:text-amber-400'
              }`}
            >
              {isLocked
                ? t('🔒 Sovereign ग्रंथ अनलॉक करें', '🔒 Unlock Sovereign Manuscript')
                : t('ग्रंथ पढ़ें (Read Manuscript)', 'Read Manuscript')}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const LibraryView: React.FC = () => {
  const {
    library,
    isSectionVipGated,
    openAscensionModal,
    openBookModal,
    isUserVip,
    isCurrentUserAdmin,
    handleTabClick,
  } = useAppContext();
  const { t } = useLanguage();

  const [selectedLibraryCategory, setSelectedLibraryCategory] = useState('All');
  const [librarySearch, setLibrarySearch] = useState('');

  if (isSectionVipGated('library')) {
    return (
      <VipSectionLockedView
        sectionTitle="Sovereign Library & Manuscripts"
        hindiTitle="संप्रभु पुस्तकालय व ग्रंथ"
        description="The foundational manuscripts, books, and digital chapter readers are reserved for Sovereign VIP members. Upgrade your account to unlock full manuscript reading."
        onUnlock={openAscensionModal}
      />
    );
  }

  const libraryCategories = [
    'All',
    ...Array.from(new Set(library.map((b) => b.category).filter(Boolean))),
  ];
  const filteredLibrary = library.filter((b) => {
    const matchesCat =
      selectedLibraryCategory === 'All' ||
      b.category?.toLowerCase() === selectedLibraryCategory.toLowerCase();
    const q = librarySearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q) ||
      b.excerpt?.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

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
            <div className="flex items-center gap-3 mb-1.5">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 font-mono">
                CLASSIFIED MANUSCRIPTS / महान पुस्तकालय
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tight">
              {t(
                <>
                  महान <span className="text-amber-500">पुस्तकालय</span> (The Great Library)
                </>,
                <>
                  The Great <span className="text-amber-500">Library</span> (पुस्तकालय)
                </>
              )}
            </h2>
            <p className="text-xs text-zinc-300 mt-1 max-w-xl leading-relaxed">
              {t(
                'A. K. Chandradipti के 5 जीवन ग्रंथ, 4 क्रूसिबल ई-बुक्स और दर्शन, पैसे की समझ व स्वतंत्र सोच पर आधारित पुस्तकें।',
                '5 foundational life manuals by A. K. Chandradipti, 4 interactive Crucible e-books, and strategic texts on wealth, power, and independent thinking.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono font-bold text-gray-300">
              {filteredLibrary.length} / {library.length}{' '}
              {t('पुस्तकें', 'Books')}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              placeholder={t(
                'किताब का नाम, लेखक या विषय खोजें (उदा. अस्पृश्य, शक्ति, चाणक्य)...',
                'Search book title, author, or theme...'
              )}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-all font-medium"
            />
          </div>

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
                {cat === 'All' ? t('सभी (All)', 'All') : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {library.length === 0 ? (
          <div className="lg:col-span-3 py-20 text-center space-y-4 bg-white/5 rounded-[32px] border border-white/5 p-8 max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-zinc-500 mx-auto" />
            <div className="space-y-1">
              <p className="text-white font-bold text-sm uppercase tracking-wider">
                {t('पुस्तकालय अभी रिक्त है', 'Library Empty')}
              </p>
              <p className="text-zinc-400 text-xs font-mono">
                The manuscript catalog is being curated. Books and manuals will be published soon.
              </p>
            </div>
            {isCurrentUserAdmin && (
              <button
                onClick={() => handleTabClick('admin')}
                className="mt-2 px-5 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 hover:text-black transition-all inline-block cursor-pointer"
              >
                Add Books in Admin Panel
              </button>
            )}
          </div>
        ) : filteredLibrary.length === 0 ? (
          <div className="lg:col-span-3 py-16 text-center space-y-4 bg-white/5 rounded-[32px] border border-white/5">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto" />
            <div>
              <p className="text-white font-bold text-sm uppercase tracking-wider">
                {t('कोई पुस्तक नहीं मिली', 'No Manuscripts Match Search')}
              </p>
              <p className="text-gray-500 text-xs font-mono mt-1">
                {t(
                  'कृपया अपनी खोज या श्रेणी बदलें',
                  'Try adjusting your category filter or search keywords'
                )}
              </p>
            </div>
          </div>
        ) : (
          filteredLibrary.map((b) => {
            const isVip = Boolean(b.isPremium || b.isVip);
            return (
              <BookCard
                key={b.id}
                book={b}
                isLocked={Boolean(isVip && !isUserVip)}
                onClick={() => {
                  if (isVip && !isUserVip) {
                    openAscensionModal();
                  } else {
                    openBookModal(b);
                  }
                }}
                onUnlockClick={openAscensionModal}
              />
            );
          })
        )}
      </div>
    </motion.div>
  );
};
