import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  CheckCircle2,
  Lock,
  Play,
  Volume2,
  Square,
  Sparkles,
  BookOpen,
  Calendar,
  Award,
  Search,
  ChevronRight,
  Send,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { getCategoryForDay } from '../data/journeyData';
import { DayCountdownTimer } from '../components/common/DayCountdownTimer';
import { PresenceCalendar } from '../components/common/PresenceCalendar';
import { VipSectionLockedView } from '../components/common/UiPrimitives';
import {
  getLocalDateString,
  isCompletedOnDate,
} from '../utils/dateUtils';
import { useSpeechSynthesis } from '../utils/speechUtils';

export const JourneyView: React.FC = () => {
  const {
    profile,
    journeyModules: journey,
    completeDay,
    submitDailyReflection,
    openJourneyModuleModal,
    setShowCertificateModal,
    setShowJournalModal,
    isSectionVipGated,
    openAscensionModal,
    isUserVip,
    showToast,
  } = useAppContext();
  const { lang, t } = useLanguage();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [submittingReflection, setSubmittingReflection] = useState(false);
  const [showPresencePanel, setShowPresencePanel] = useState(false);
  const { isSpeaking, speak, stop } = useSpeechSynthesis();

  if (isSectionVipGated('journey')) {
    return (
      <VipSectionLockedView
        sectionTitle="100-Day Consciousness Journey"
        hindiTitle="१००-दिवसीय चेतना यात्रा"
        description="The 100-Day Consciousness & Discipline Protocol is currently reserved for Sovereign VIP members."
        onUnlock={openAscensionModal}
      />
    );
  }

  const phaseFilters = [
    { id: 'all', label: t('सभी १०० दिन', 'All 100 Days') },
    { id: 'pending', label: t('बाकी दिन', 'Remaining') },
    { id: 'completed', label: t('पूरे किए गए', 'Completed') },
    {
      id: 'De-programming',
      label: t('चरण १: डी-प्रोग्रामिंग (1-25)', 'Phase 1: De-programming (1-25)'),
    },
    {
      id: 'The Awakening',
      label: t('चरण २: जागरण (26-50)', 'Phase 2: The Awakening (26-50)'),
    },
    {
      id: 'Mental Models',
      label: t('चरण ३: मानसिक मॉडल (51-75)', 'Phase 3: Mental Models (51-75)'),
    },
    {
      id: 'Sovereignty',
      label: t('चरण ४: संप्रभुता (76-100)', 'Phase 4: Sovereignty (76-100)'),
    },
  ];

  const completedDays = profile?.completedDays || [];
  const todayStr = getLocalDateString();
  const hasCompletedTaskToday = isCompletedOnDate(
    profile?.lastCompletedAt,
    todayStr,
    profile?.lastCompletedDate
  );

  // First uncompleted day in sequential order (1..100)
  const nextUncompletedDayNumber = (() => {
    for (let d = 1; d <= 100; d++) {
      if (!completedDays.includes(d)) return d;
    }
    return 100;
  })();

  // If the user has ALREADY completed a day today, no new day is unlocked until 12:00 AM IST.
  // Only the single active day (when !hasCompletedTaskToday) has its task unlocked.
  const currentUnlockedDayNumber = hasCompletedTaskToday
    ? null
    : nextUncompletedDayNumber;

  const lastCompletedDayNumber =
    completedDays.length > 0 ? Math.max(...completedDays) : 1;

  // The module shown in the top hero card:
  // - If the user has NOT completed today's quota: show today's unlocked day (`nextUncompletedDayNumber`).
  // - If the user HAS completed today's quota: show the locked countdown state for `nextUncompletedDayNumber`
  //   with its task and lesson hidden until 12:00 AM IST!
  const activeModule =
    journey.find((m) => m.day === nextUncompletedDayNumber) || journey[0];

  const todayReflection = profile?.dailyReflections?.[todayStr] || '';

  const handleReflectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim() || submittingReflection) return;
    setSubmittingReflection(true);
    try {
      await submitDailyReflection(reflectionText);
      setReflectionText('');
    } finally {
      setSubmittingReflection(false);
    }
  };

  const filteredModules = journey.filter((m) => {
    const isDone = completedDays.includes(m.day);
    const cat = m.category || m.phase || getCategoryForDay(m.day);
    if (selectedFilter === 'completed' && !isDone) return false;
    if (selectedFilter === 'pending' && isDone) return false;
    if (
      selectedFilter !== 'all' &&
      selectedFilter !== 'completed' &&
      selectedFilter !== 'pending' &&
      !cat.toLowerCase().includes(selectedFilter.toLowerCase())
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        (m.hindiTitle || '').toLowerCase().includes(q) ||
        String(m.day) === q
      );
    }
    return true;
  });

  const progressPct = Math.min(
    100,
    Math.round((completedDays.length / 100) * 100)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 w-full"
    >
      {/* Top Hero Banner */}
      <div className="bg-[#0c0e14] border border-[#1d222e] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100-DAY CONSCIOUSNESS &amp; DISCIPLINE PROTOCOL</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t('१००-दिवसीय चेतना यात्रा', '100-Day Consciousness Journey')}{' '}
              <span className="text-amber-400">(The Crucible)</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {t(
                'प्रतिदिन केवल १ अध्याय पूरा किया जा सकता है। अन्य सभी दिनों के कार्य (Tasks) गोपनीय और लॉक रहते हैं तथा प्रतिदिन रात 12:00 AM IST पर केवल अगला १ दिन अनलॉक होता है।',
                'Only 1 Journey day can be completed per day. Tasks for all other days remain strictly hidden until each day unlocks sequentially at 12:00 AM IST.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3">
              <Flame className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase">
                  {t('निरंतरता (Streak)', 'Current Streak')}
                </div>
                <div className="text-base font-mono font-black text-white">
                  {profile?.streak || 1} {t('दिन', 'Days')}
                </div>
              </div>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase">
                  {t('प्रगति (Progress)', 'Progress')}
                </div>
                <div className="text-base font-mono font-black text-white">
                  {completedDays.length} / 100 ({progressPct}%)
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPresencePanel((p) => !p)}
              className="px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-bold text-amber-400 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('उपस्थिति कैलेंडर', 'Presence Calendar')}</span>
            </button>

            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-4 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-mono font-bold text-amber-300 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Award className="w-4 h-4" />
              <span>{t('प्रमाण-पत्र', 'Certificate')}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.max(2, progressPct)}%` }}
            />
          </div>
        </div>

        {showPresencePanel && (
          <div className="pt-2">
            <PresenceCalendar
              presenceDays={profile?.presenceDays || []}
              streak={profile?.streak || 1}
            />
          </div>
        )}
      </div>

      {/* Today's Active Assignment Card */}
      {activeModule && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-b from-amber-500/10 via-[#0e1017] to-[#0c0e14] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
            {hasCompletedTaskToday ? (
              /* User has ALREADY completed 1 day today -> Next day & its task are strictly locked until 12:00 AM IST */
              <div className="space-y-6 py-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-black font-mono font-black text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {t(
                          `दिन ${lastCompletedDayNumber} आज पूर्ण हुआ`,
                          `Day ${lastCompletedDayNumber} Completed Today`
                        )}
                      </span>
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      {t(
                        'प्रतिदिन केवल १ दिन की सीमा सक्रिय',
                        '1 Day Per Day Limit Active'
                      )}
                    </span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/30 space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm sm:text-base font-extrabold text-white">
                        {t(
                          `आज का १-दिवसीय कोटा पूरा हो चुका है! अगला अध्याय (Day ${activeModule.day}) रात 12:00 AM IST पर अनलॉक होगा।`,
                          `Today's 1-Day Quota Completed! Next Protocol (Day ${activeModule.day}) Unlocks at 12:00 AM IST.`
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {t(
                          'नियम के अनुसार आप एक दिन में केवल एक ही अध्याय पूरा कर सकते हैं। अगले दिन का कार्य (Task) मध्यरात्रि 12:00 AM IST से पहले दिखाई नहीं देगा।',
                          'By protocol rule, you can complete only one journey day per calendar day. The next day’s task remains hidden until midnight 12:00 AM IST.'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-mono text-amber-300 font-bold">
                      {t(
                        `Day ${activeModule.day} अनलॉक होने में शेष समय:`,
                        `Time remaining until Day ${activeModule.day} unlocks:`
                      )}
                    </span>
                    <DayCountdownTimer />
                  </div>
                </div>
              </div>
            ) : (
              /* User has NOT completed a day today -> Show Today's Single Unlocked Day */
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-black font-mono font-black text-xs">
                      DAY{' '}
                      {activeModule.day < 10
                        ? `0${activeModule.day}`
                        : activeModule.day}{' '}
                      · {t('आज का सक्रिय अध्याय', "Today's Unlocked Protocol")}
                    </span>
                    <span className="text-xs font-mono text-amber-300">
                      {activeModule.category ||
                        getCategoryForDay(activeModule.day)}
                    </span>
                  </div>

                  {!Boolean(
                    (activeModule.isVip || activeModule.isPremium) && !isUserVip
                  ) && (
                    <button
                      onClick={() => {
                        if (isSpeaking) {
                          stop();
                        } else {
                          speak(
                            `दिन ${activeModule.day}: ${activeModule.hindiTitle || activeModule.title}. ${activeModule.lesson || activeModule.description}. आज का अभ्यास: ${activeModule.task || activeModule.command || ''}`,
                            `day-${activeModule.day}`
                          );
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        isSpeaking
                          ? 'bg-amber-500 text-black border-amber-400'
                          : 'bg-zinc-900 text-amber-400 border-amber-500/30 hover:bg-zinc-800'
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>{t('रोकें (Stop Audio)', 'Stop Audio')}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t('सुनें (Listen)', 'Listen Audio')}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                    {lang === 'hi'
                      ? activeModule.hindiTitle || activeModule.title
                      : activeModule.title}
                  </h2>
                  {activeModule.hindiTitle && (
                    <div className="text-xs font-mono text-zinc-400">
                      {lang === 'hi'
                        ? activeModule.title
                        : activeModule.hindiTitle}
                    </div>
                  )}
                </div>

                {Boolean(
                  (activeModule.isVip || activeModule.isPremium) && !isUserVip
                ) ? (
                  <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                        SOVEREIGN PREMIUM PROTOCOL
                      </div>
                      <p className="text-xs text-zinc-300 max-w-md mx-auto">
                        {t(
                          'यह अध्याय केवल Sovereign VIP सदस्यों के लिए आरक्षित है। इसे अनलॉक करने के लिए अपना अकाउंट अपग्रेड करें।',
                          'This day is reserved exclusively for Sovereign VIP members. Upgrade your account to unlock and complete this protocol.'
                        )}
                      </p>
                    </div>
                    <button
                      onClick={openAscensionModal}
                      className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs font-mono uppercase tracking-wider cursor-pointer"
                    >
                      {t('Sovereign VIP अनलॉक करें', 'Unlock Sovereign VIP')}
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm sm:text-base text-zinc-200 leading-relaxed whitespace-pre-line">
                      {activeModule.lesson || activeModule.description}
                    </p>

                    {(activeModule.task || activeModule.command) && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                        <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                          ⚡{' '}
                          {t(
                            'आज का व्यावहारिक अभ्यास (Today’s Actionable Task)',
                            "Today's Actionable Task"
                          )}
                        </div>
                        <p className="text-sm font-medium text-white leading-relaxed">
                          {activeModule.task || activeModule.command}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <button
                        onClick={() => completeDay(activeModule.day)}
                        className="px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {t(
                            `अभ्यास पूर्ण करें · Complete Day ${activeModule.day} (+100 XP)`,
                            `Complete Day ${activeModule.day} Protocol (+100 XP)`
                          )}
                        </span>
                      </button>

                      <button
                        onClick={() => openJourneyModuleModal(activeModule)}
                        className="px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white cursor-pointer"
                      >
                        {t('पूर्ण विवरण खोलें →', 'Open Full Dossier →')}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Daily Reflection Card */}
          <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                  {t('रात्रि आत्म-चिंतन (Wisdom Log)', 'Wisdom Log & Reflection')}
                </span>
                <button
                  onClick={() => setShowJournalModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('डायरी व PDF', 'Diary & PDF')}</span>
                </button>
              </div>

              <h3 className="text-base font-bold text-white">
                {t(
                  'आज आपने अपने व्यवहार या समाज में क्या नया देखा?',
                  'What systemic pattern or personal habit did you observe today?'
                )}
              </h3>

              {todayReflection ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                  <div className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {t(
                        `आज का चिंतन दर्ज है (${todayStr})`,
                        `Saved for Today (${todayStr})`
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200 italic leading-relaxed">
                    "{todayReflection}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t(
                    <>
                      अपना दैनिक अनुभव लिखने पर आपको अतिरिक्त{' '}
                      <strong className="text-amber-400">+25 XP</strong> मिलते हैं
                      और यह आपकी व्यक्तिगत डायरी में सुरक्षित रहता है।
                    </>,
                    <>
                      Logging your daily observation awards{' '}
                      <strong className="text-amber-400">+25 XP</strong> and
                      saves to your cloud journal.
                    </>
                  )}
                </p>
              )}
            </div>

            <form onSubmit={handleReflectionSubmit} className="space-y-3">
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder={
                  todayReflection
                    ? t(
                        'आज के चिंतन को अपडेट करें...',
                        "Update today's reflection..."
                      )
                    : t(
                        'आज का अनुभव यहाँ लिखें...',
                        'Write your observation here...'
                      )
                }
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
              />
              <button
                type="submit"
                disabled={!reflectionText.trim() || submittingReflection}
                className="w-full py-3 rounded-xl bg-zinc-100 hover:bg-white disabled:opacity-40 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {todayReflection
                    ? t('चिंतन अपडेट करें', 'Update Reflection')
                    : t(
                        'चिंतन सुरक्षित करें (+25 XP)',
                        'Save Reflection (+25 XP)'
                      )}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-[#0c0e14] border border-zinc-800/80 rounded-2xl p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              'दिन संख्या (उदा. 12) या शीर्षक खोजें...',
              'Search by day number (e.g. 12) or title...'
            )}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {phaseFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 100-Day Modules Grid (Tasks strictly hidden on grid cards; locked days cannot be peeked) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredModules.map((mod) => {
          const isCompleted = completedDays.includes(mod.day);
          const isTodayUnlocked = mod.day === currentUnlockedDayNumber;
          const isAccessible = isCompleted || isTodayUnlocked;
          const isVipLocked = Boolean(
            (mod.isVip || mod.isPremium) && !isUserVip
          );

          return (
            <div
              key={mod.id}
              onClick={() => {
                if (isVipLocked) {
                  openAscensionModal();
                  return;
                }
                if (!isAccessible) {
                  showToast({
                    title: t('अध्याय लॉक है (Day Locked)', 'Day Locked'),
                    message: hasCompletedTaskToday
                      ? t(
                          'आप प्रतिदिन केवल १ दिन पूरा कर सकते हैं। अगला अध्याय रात 12:00 AM IST पर अनलॉक होगा।',
                          'You can complete only 1 day per day. The next day unlocks at 12:00 AM IST.'
                        )
                      : t(
                          `दिन ${mod.day} देखने के लिए पहले दिन ${nextUncompletedDayNumber} पूरा करें।`,
                          `Complete Day ${nextUncompletedDayNumber} first to unlock sequential days.`
                        ),
                    type: 'warning',
                  });
                  return;
                }
                openJourneyModuleModal(mod);
              }}
              className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                isTodayUnlocked
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-lg'
                  : isCompleted
                    ? 'bg-emerald-950/15 border-emerald-500/25 hover:border-emerald-500/40'
                    : 'bg-zinc-950/60 border-zinc-900 opacity-75 hover:opacity-95'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isTodayUnlocked
                          ? 'bg-amber-500 text-black'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    DAY {mod.day < 10 ? `0${mod.day}` : mod.day}
                  </span>

                  {isVipLocked ? (
                    <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> VIP
                    </span>
                  ) : isCompleted ? (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                      {t('पूर्ण', 'Done')}
                    </span>
                  ) : isTodayUnlocked ? (
                    <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                      <Play className="w-3 h-3 fill-current" />{' '}
                      {t('आज सक्रिय', 'Unlocked Today')}
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> {t('लॉक', 'Locked')}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white line-clamp-2 leading-snug">
                  {lang === 'hi' ? mod.hindiTitle || mod.title : mod.title}
                </h3>

                <p className="text-xs text-zinc-500 leading-relaxed flex items-center gap-1.5">
                  {isCompleted ? (
                    <span className="text-emerald-400/90">
                      {t(
                        '✓ यह अध्याय पूरा किया जा चुका है।',
                        '✓ This day protocol has been completed.'
                      )}
                    </span>
                  ) : isTodayUnlocked ? (
                    <span className="text-amber-300/90">
                      {t(
                        'आज का अध्याय अनलॉक है — खोलने के लिए क्लिक करें।',
                        "Today's protocol is unlocked — click to open."
                      )}
                    </span>
                  ) : (
                    <span>
                      {t(
                        '🔒 कार्य गोपनीय है — पिछले दिन पूरे होने पर खुलेगा।',
                        '🔒 Task & protocol hidden until unlocked sequentially.'
                      )}
                    </span>
                  )}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500 truncate max-w-[70%]">
                  {mod.category || getCategoryForDay(mod.day)}
                </span>
                {isAccessible ? (
                  <span className="text-amber-400 flex items-center gap-0.5 font-bold">
                    <span>{t('खोलें', 'Open')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="text-zinc-600 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>{t('बंद', 'Locked')}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
