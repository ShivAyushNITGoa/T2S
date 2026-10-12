import React from 'react';
import { Lock, PlayCircle, Volume2, Shield } from 'lucide-react';
import { ContentModal } from '../common/UiPrimitives';
import { getInAppVideoEmbedInfo } from '../../utils/mediaUtils';
import { speakOneShot } from '../../utils/speechUtils';
import { useAppContext } from '../../context/AppContext';

export const VideoDossierModal: React.FC = () => {
  const {
    selectedVideo,
    closeVideoModal,
    openAscensionModal,
    isUserVip,
  } = useAppContext();

  if (!selectedVideo) return null;

  const isLocked = Boolean(
    (selectedVideo.isPremium || selectedVideo.isVip) && !isUserVip
  );
  const videoSource =
    selectedVideo.youtubeEmbedId ||
    selectedVideo.videoUrl ||
    selectedVideo.youtubeUrl ||
    '';
  const embedInfo = getInAppVideoEmbedInfo(videoSource);

  return (
    <ContentModal title={selectedVideo.title} onClose={closeVideoModal}>
      {isLocked ? (
        <div className="p-12 text-center space-y-6 my-auto select-none">
          <div className="w-16 h-16 mx-auto bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg inline-block">
              SOVEREIGN PREMIUM TRANSMISSION
            </span>
            <h3 className="text-xl font-black text-white uppercase italic">
              {selectedVideo.title}
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              This video transmission is classified exclusively for Sovereign Tier members. Upgrade your account to unlock full in-app access.
            </p>
          </div>
          <button
            onClick={() => {
              closeVideoModal();
              openAscensionModal();
            }}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-105 transition-all cursor-pointer font-mono"
          >
            Upgrade Account Access / अपग्रेड करें
          </button>
        </div>
      ) : (
        <div
          className="select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="aspect-video bg-black overflow-hidden relative border-b border-white/5">
            {embedInfo.type === 'youtube' || embedInfo.type === 'drive' ? (
              <div className="relative w-full h-full">
                <iframe
                  src={embedInfo.src}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  title={selectedVideo.title}
                />
                {/* Protective In-App Shield blocking external pop-out / download / open-in-new-tab buttons */}
                <div
                  className="absolute top-0 left-0 right-0 h-14 z-20 bg-transparent"
                  onContextMenu={(e) => e.preventDefault()}
                  title="Protected In-App Stream"
                />
                {embedInfo.type === 'youtube' && (
                  <div
                    className="absolute bottom-0 right-12 w-28 h-12 z-20 bg-transparent"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                )}
              </div>
            ) : embedInfo.type === 'direct' ? (
              <video
                src={embedInfo.src}
                poster={selectedVideo.thumbnail}
                controls
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <>
                <img
                  src={selectedVideo.thumbnail}
                  className="w-full h-full object-cover opacity-25 grayscale"
                  alt={selectedVideo.title}
                  draggable={false}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center mb-4">
                    <PlayCircle className="w-8 h-8 text-amber-400" />
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-white italic mb-2 tracking-tight uppercase">
                    {selectedVideo.title}
                  </h2>
                  <div className="text-amber-400/80 font-mono text-xs uppercase tracking-widest flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>In-App Protected Documentary Dossier</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-5 sm:p-7 md:p-8 space-y-6 bg-[#0a0b0e]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {(selectedVideo.family || selectedVideo.category) && (
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs uppercase rounded-lg">
                    {selectedVideo.family || selectedVideo.category}
                  </span>
                )}
                {selectedVideo.hindiFamily && (
                  <span className="text-xs text-zinc-400 font-medium font-mono">
                    ({selectedVideo.hindiFamily})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                <span>{selectedVideo.views || 'Protected'}</span>
                <span>•</span>
                <span>{selectedVideo.duration}</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> In-App Only
                </span>
              </div>
            </div>

            {(selectedVideo.question || selectedVideo.description) && (
              <div className="bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-1.5">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-black block">
                  CORE INVESTIGATION QUESTION // मूल प्रश्न व सार
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                  “{selectedVideo.question || selectedVideo.description}”
                </h4>
                {selectedVideo.hindiQuestion && (
                  <p className="text-xs text-zinc-400 italic">
                    {selectedVideo.hindiQuestion}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedVideo.hiddenSystemSummary && (
                <div className="bg-black/50 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black block">
                    THE HIDDEN SYSTEM // अदृश्य व्यवस्था
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                    {selectedVideo.hiddenSystemSummary}
                  </p>
                </div>
              )}

              {selectedVideo.consequence && (
                <div className="bg-black/50 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2">
                  <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-black block">
                    THE UNSEEN CONSEQUENCE // परिणाम
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                    {selectedVideo.consequence}
                  </p>
                </div>
              )}
            </div>

            {selectedVideo.chandradiptiReflection && (
              <div className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-black block">
                    A. K. CHANDRADIPTI REFLECTION // चंद्रदीप्ति का चिंतन
                  </span>
                  <button
                    onClick={() =>
                      speakOneShot(selectedVideo.chandradiptiReflection!)
                    }
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-black rounded-lg text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen Voice</span>
                  </button>
                </div>
                <blockquote className="text-xs sm:text-sm text-amber-200 italic leading-relaxed">
                  “{selectedVideo.chandradiptiReflection}”
                </blockquote>
              </div>
            )}
          </div>
        </div>
      )}
    </ContentModal>
  );
};
