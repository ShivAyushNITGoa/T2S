import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, X, Target, Shield, PlayCircle, Lock } from 'lucide-react';
import { getLocalDateString, isCompletedOnDate } from '../../utils/dateUtils';
import { getInAppVideoEmbedInfo } from '../../utils/mediaUtils';
import { DayCountdownTimer } from '../common/DayCountdownTimer';
import { useAppContext } from '../../context/AppContext';

export const JourneyModuleDetailModal: React.FC = () => {
  const {
    selectedJourneyModule: module,
    closeJourneyModuleModal,
    openAscensionModal,
    isUserVip,
    profile,
    completeDay,
  } = useAppContext();

  if (!module) return null;

  const isVipLocked = Boolean((module.isVip || module.isPremium) && !isUserVip);
  const completedDays = profile?.completedDays || [];
  const isCompleted = completedDays.includes(module.day);
  const isPrerequisiteLocked =
    module.day > 1 && !completedDays.includes(module.day - 1);
  const completedToday = isCompletedOnDate(
    profile?.lastCompletedAt,
    getLocalDateString(),
    profile?.lastCompletedDate
  );

  // A day's task and content are only visible if already completed OR if it is today's single active unlocked day
  const isDayLocked = !isCompleted && (isPrerequisiteLocked || completedToday);

  const rawVideoInput = module.youtubeEmbedId || module.videoUrl;
  const embedInfo =
    !isDayLocked && !isVipLocked && rawVideoInput
      ? getInAppVideoEmbedInfo(rawVideoInput)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-zinc-950 border border-white/10 rounded-[32px] md:rounded-[40px] max-w-2xl w-full text-left p-6 md:p-10 shadow-2xl relative overflow-hidden my-auto"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />

        <div className="flex items-center justify-between mb-2 pt-2">
          <button
            onClick={closeJourneyModuleModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 active:scale-95 rounded-xl border border-white/10 text-xs text-zinc-300 hover:text-white font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Back (वापस)</span>
          </button>
          <button
            onClick={closeJourneyModuleModal}
            className="ml-auto p-2 bg-white/5 border border-white/5 hover:border-white/10 rounded-full text-gray-400 hover:text-white transition-all cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-1.5 pt-4">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-amber-500 font-mono block">
              {module.phase || module.category || 'Phase 1: THE PURGE'}
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-mono font-black py-0.5 px-2.5 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20 shrink-0">
                DAY {module.day}
              </span>
              <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-tight leading-none">
                {module.title}
              </h2>
            </div>
          </div>

          <div className="border-t border-white/5 my-4" />

          {isVipLocked ? (
            <div className="p-8 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-4">
              <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg inline-block">
                SOVEREIGN PREMIUM DAY LOCKED
              </span>
              <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                This protocol is classified exclusively for Sovereign VIP members. Upgrade your account to unlock this day.
              </p>
              <button
                onClick={() => {
                  closeJourneyModuleModal();
                  openAscensionModal();
                }}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-105 transition-all cursor-pointer font-mono"
              >
                Unlock Sovereign VIP / अपग्रेड करें
              </button>
            </div>
          ) : isDayLocked ? (
            <div className="p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg inline-block">
                  PROTOCOL TASK LOCKED
                </span>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                  {completedToday
                    ? 'आप प्रतिदिन केवल १ अध्याय पूरा कर सकते हैं। अगले दिन का कार्य (Task) रात 12:00 AM IST पर अनलॉक होगा।'
                    : `दिन ${module.day} का कार्य देखने के लिए पहले पिछले सभी दिन क्रमबद्ध रूप से पूरे करें।`}
                </p>
              </div>
              {completedToday && (
                <div className="pt-2 flex justify-center">
                  <DayCountdownTimer />
                </div>
              )}
              <button
                onClick={closeJourneyModuleModal}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-mono font-bold uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Close / बंद करें
              </button>
            </div>
          ) : (
            <>
              {embedInfo && embedInfo.type !== 'none' && (
                <div
                  className="space-y-2 select-none"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <h4 className="text-[10px] font-mono text-amber-400 font-black uppercase tracking-widest flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-amber-400" /> IN-APP
                    COMPANION TRANSMISSION
                  </h4>
                  <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-white/10">
                    {embedInfo.type === 'youtube' ||
                    embedInfo.type === 'drive' ? (
                      <div className="relative w-full h-full">
                        <iframe
                          src={embedInfo.src}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                          title={module.title}
                        />
                        <div
                          className="absolute top-0 left-0 right-0 h-12 z-20 bg-transparent"
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      </div>
                    ) : (
                      <video
                        src={embedInfo.src}
                        controls
                        controlsList="nodownload noplaybackrate"
                        disablePictureInPicture
                        onContextMenu={(e) => e.preventDefault()}
                        className="w-full h-full object-contain bg-black"
                      />
                    )}
                  </div>
                </div>
              )}

              {(module.lesson || module.description) && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono text-zinc-500 font-black uppercase tracking-widest">
                    LESSON / मुख्य शिक्षा
                  </h4>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-zinc-200 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                    {module.lesson || module.description}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-[10px] font-mono text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" /> COMMAND / आज का
                  अभ्यास
                </h4>
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-white text-sm md:text-base leading-relaxed font-semibold">
                  {module.task || module.command || module.description}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-mono text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-500" /> DARK PSYCHOLOGY /
                  डार्क साइकोलॉजी (WHY)
                </h4>
                <div className="p-5 bg-rose-950/5 border border-rose-500/10 rounded-2xl text-zinc-300 text-xs md:text-sm leading-relaxed font-mono">
                  {module.logic ||
                    'The logic for this day is heavily guided by ancient sovereign secrets. Formulate sovereignty in action.'}
                </div>
              </div>

              <div className="border-t border-white/5 my-4" />

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {isCompleted ? (
                  <div className="flex-1 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs md:text-sm font-black uppercase tracking-widest rounded-2xl text-center flex flex-col items-center justify-center gap-1 font-mono">
                    <span>✓ Day Completed / पूरा हो गया</span>
                    <span className="text-[9px] opacity-60 font-medium normal-case font-sans">
                      You have integrated this task.
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      const day = module.day;
                      closeJourneyModuleModal();
                      await completeDay(day);
                    }}
                    className="flex-1 py-4 bg-amber-500 hover:bg-amber-400 text-black text-xs md:text-sm font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] font-mono flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-98"
                  >
                    <span>Integrate Day {module.day} / संकलन करें</span>
                    <span className="text-[9px] opacity-80 font-bold normal-case font-sans">
                      Marks progress (+100 XP)
                    </span>
                  </button>
                )}

                <button
                  onClick={closeJourneyModuleModal}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white text-xs md:text-sm font-black uppercase tracking-widest rounded-2xl transition-all font-mono cursor-pointer"
                >
                  Close / बंद करें
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const StrikeResetModal: React.FC = () => {
  const { isResetModalOpen, closeResetModal } = useAppContext();

  if (!isResetModalOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        className="bg-zinc-950 border-2 border-amber-500/30 rounded-[32px] md:rounded-[40px] p-6 md:p-12 max-w-xl w-full text-center space-y-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden my-auto"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600" />

        <div className="mx-auto w-24 h-24 bg-amber-600/10 rounded-full flex items-center justify-center border border-amber-500/20">
          <span className="text-5xl text-amber-500">🔥</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-display font-black text-amber-500 uppercase tracking-tight leading-none">
            STREAK RESET NOTICE
          </h2>
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-none">
            दैनिक निरंतरता अनुस्मारक
          </h3>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            अनुपस्थिति के कारण आपकी दैनिक स्ट्रीक (Streak) शून्य पर रीसेट हो गई है।
            <br />
            <span className="text-emerald-400 font-bold">
              आपके पूरे किए गए सभी दिन (Completed Days), संचित XP एवं ज्ञान पूरी तरह सुरक्षित हैं।
            </span>
          </p>
          <p className="text-slate-400 text-xs md:text-sm italic leading-relaxed">
            "The streak counter resets after 3 days of inactivity, but your completed days and earned XP are never lost."
          </p>
        </div>

        <button
          onClick={closeResetModal}
          className="w-full py-5 bg-gradient-to-r from-amber-600 to-yellow-500 text-black text-xs md:text-sm font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)] font-mono cursor-pointer"
        >
          CONTINUE MY JOURNEY / अपनी यात्रा जारी रखें
        </button>
      </motion.div>
    </motion.div>
  );
};
