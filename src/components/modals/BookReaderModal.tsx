import React, { Suspense, useState, useRef, useEffect } from 'react';
import {
  Lock,
  BookOpen,
  Shield,
  FileText,
  List,
  Maximize2,
  Minimize2,
  ArrowLeft,
  X,
} from 'lucide-react';
import { ContentModal, ViewLoader } from '../common/UiPrimitives';
import { BuiltInBookReader } from './BuiltInBookReader';
import { getInAppPdfViewerUrl } from '../../utils/mediaUtils';
import { useAppContext } from '../../context/AppContext';

export const BookReaderModal: React.FC = () => {
  const {
    selectedBook,
    closeBookModal,
    openAscensionModal,
    isUserVip,
  } = useAppContext();

  const [viewMode, setViewMode] = useState<'pdf' | 'chapters'>('pdf');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const fullScreenContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement && isFullScreen) {
        // Keep in-app fullscreen state controllable via button or Escape
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [isFullScreen]);

  if (!selectedBook) return null;

  const isLocked = Boolean(
    (selectedBook.isPremium || selectedBook.isVip) && !isUserVip
  );
  const rawPdfUrl = selectedBook.fileUrl || selectedBook.pdfUrl || '';
  const inAppPdfUrl = getInAppPdfViewerUrl(rawPdfUrl);
  const hasChapters = Boolean(
    selectedBook.chapters && selectedBook.chapters.length > 0
  );

  const activeMode =
    inAppPdfUrl && hasChapters
      ? viewMode
      : inAppPdfUrl
        ? 'pdf'
        : hasChapters
          ? 'chapters'
          : 'empty';

  const toggleInAppFullScreen = async () => {
    const next = !isFullScreen;
    setIsFullScreen(next);
    try {
      if (next && fullScreenContainerRef.current?.requestFullscreen) {
        await fullScreenContainerRef.current.requestFullscreen();
      } else if (!next && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Fallback to fixed inset-0 z-[150] in-app fullscreen overlay
    }
  };

  const handleCloseReader = async () => {
    setIsFullScreen(false);
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {}
    closeBookModal();
  };

  const renderPdfOrChaptersViewport = (fullScreenActive: boolean) => (
    <div
      className={`flex-1 bg-neutral-900 relative ${
        fullScreenActive ? 'h-[calc(100vh-56px)]' : 'min-h-[620px]'
      }`}
    >
      {activeMode === 'pdf' && inAppPdfUrl ? (
        <div
          className="relative w-full h-full min-h-[620px]"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-0">
            <div className="text-center p-8">
              <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                Loading Protected In-App PDF Reader...
              </p>
            </div>
          </div>

          {/* Floating In-App Fullscreen Toggle inside PDF Viewport */}
          <button
            type="button"
            onClick={toggleInAppFullScreen}
            className="absolute top-3 left-3 z-30 px-3.5 py-2 rounded-xl bg-black/85 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-2 shadow-xl transition-all cursor-pointer"
            title={
              fullScreenActive
                ? 'Exit Full Screen (सामान्य दृश्य)'
                : 'Full Screen Inside App (पूर्ण स्क्रीन)'
            }
          >
            {fullScreenActive ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Full Screen (सामान्य दृश्य)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Screen (पूर्ण स्क्रीन)</span>
              </>
            )}
          </button>

          <iframe
            key={inAppPdfUrl}
            src={inAppPdfUrl}
            className="absolute inset-0 w-full h-full border-0 z-10"
            title="book-viewer"
            referrerPolicy="strict-origin-when-cross-origin"
          />

          {/* Protective Shield over top-right corner of iframe to block external pop-out / download buttons */}
          <div
            className="absolute top-0 right-0 w-24 h-16 z-20 bg-transparent"
            onContextMenu={(e) => e.preventDefault()}
            title="In-App Protected Document"
          />
        </div>
      ) : activeMode === 'chapters' && hasChapters ? (
        <Suspense fallback={<ViewLoader label="Loading Manuscript Reader..." />}>
          <BuiltInBookReader book={selectedBook} />
        </Suspense>
      ) : (
        <div className="h-full flex items-center justify-center p-12 text-center bg-[#0a0a0a]">
          <div className="max-w-md space-y-6">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">
                {selectedBook.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {selectedBook.description || selectedBook.excerpt}
              </p>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 font-mono">
                यह पुस्तक इन-ऐप सुरक्षित रीडर में उपलब्ध है। (Protected In-App Manuscript)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ContentModal
      title={selectedBook.title}
      onClose={handleCloseReader}
      maxWidth="max-w-7xl"
    >
      {isLocked ? (
        <div className="p-12 text-center space-y-6 my-auto select-none">
          <div className="w-16 h-16 mx-auto bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg inline-block">
              SOVEREIGN MANUSCRIPT RESTRICTED
            </span>
            <h3 className="text-2xl font-black text-white uppercase italic">
              {selectedBook.title}
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              This strategic manuscript is restricted to Sovereign Tier members. Upgrade your account to unlock full in-app manuscript reading.
            </p>
          </div>
          <button
            onClick={() => {
              handleCloseReader();
              openAscensionModal();
            }}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-105 transition-all cursor-pointer font-mono"
          >
            Unlock Full Library Access / अपग्रेड करें
          </button>
        </div>
      ) : (
        <div
          ref={fullScreenContainerRef}
          className={
            isFullScreen
              ? 'fixed inset-0 z-[150] w-screen h-screen bg-[#050608] flex flex-col select-none'
              : 'h-full flex flex-col min-h-[85vh] select-none'
          }
          onContextMenu={(e) => e.preventDefault()}
        >
          {isFullScreen ? (
            /* Slim In-App Full Screen Top Bar */
            <div className="h-14 px-4 sm:px-6 bg-[#07080c] border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={toggleInAppFullScreen}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                  <span>Exit Full Screen (वापस)</span>
                </button>
                <span className="text-xs sm:text-sm font-bold text-white truncate">
                  {selectedBook.title}
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold items-center gap-1 shrink-0">
                  <Shield className="w-2.5 h-2.5" /> In-App Full Screen (No Download)
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {inAppPdfUrl && hasChapters && (
                  <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setViewMode('pdf')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer ${
                        activeMode === 'pdf'
                          ? 'bg-amber-500 text-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3 h-3" /> PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('chapters')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer ${
                        activeMode === 'chapters'
                          ? 'bg-amber-500 text-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <List className="w-3 h-3" /> Chapters
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={toggleInAppFullScreen}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Minimize</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseReader}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white cursor-pointer"
                  title="Close Reader"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Standard Modal Header */
            <div className="p-5 sm:p-6 border-b border-white/5 bg-black/40 shrink-0 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
              <div className="flex gap-5 items-start">
                <div className="w-16 h-24 bg-neutral-900 border border-white/5 rounded-xl flex items-center justify-center shadow-2xl shrink-0 overflow-hidden">
                  {selectedBook.coverUrl ? (
                    <img
                      src={selectedBook.coverUrl}
                      className="w-full h-full object-cover"
                      alt="cover"
                      draggable={false}
                    />
                  ) : (
                    <BookOpen className="w-7 h-7 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-amber-500 text-[9px] font-mono font-black uppercase tracking-widest">
                      {selectedBook.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5" /> In-App Protected Reader (No Download)
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-white italic tracking-tight leading-snug">
                    {selectedBook.title}
                  </h2>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    — {selectedBook.author}
                  </div>
                  <p className="text-gray-400 text-xs italic leading-relaxed line-clamp-2">
                    "{selectedBook.description || selectedBook.excerpt}"
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {inAppPdfUrl && hasChapters && (
                  <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setViewMode('pdf')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                        activeMode === 'pdf'
                          ? 'bg-amber-500 text-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" /> PDF View
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('chapters')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                        activeMode === 'chapters'
                          ? 'bg-amber-500 text-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" /> Interactive Chapters
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={toggleInAppFullScreen}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs font-mono flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-amber-500/20"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Screen (पूर्ण स्क्रीन)</span>
                </button>
              </div>
            </div>
          )}

          {renderPdfOrChaptersViewport(isFullScreen)}
        </div>
      )}
    </ContentModal>
  );
};
