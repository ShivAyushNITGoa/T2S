import React, { useState } from 'react';
import { 
  PlayCircle, CheckCircle2, Lock, Flame, Sparkles, 
  Search, BookOpen, Volume2, ArrowLeft, ChevronRight, X, Send, Award,
  HelpCircle, ShieldCheck, ChevronDown, Clock, Zap, AlertTriangle, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JourneyModule, UserProfile } from '../types';
import DayCountdownTimer from './DayCountdownTimer';
import PresenceCalendar from './PresenceCalendar';

interface JourneyViewProps {
  journeyModules: JourneyModule[];
  profile: UserProfile | null;
  onCompleteDay: (day: number) => Promise<void>;
  onSubmitReflection: (content: string) => Promise<void>;
}

export default function JourneyView({ 
  journeyModules, 
  profile, 
  onCompleteDay,
  onSubmitReflection 
}: JourneyViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDayPhase, setSelectedDayPhase] = useState<string>('All Days');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModalModule, setActiveModalModule] = useState<JourneyModule | null>(null);
  const [reflectionInput, setReflectionInput] = useState('');
  const [isSubmittingReflection, setIsSubmittingReflection] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const JOURNEY_FAQS = [
    {
      q_en: "How does the Daily Unlock Cycle work?",
      q_hi: "अनलॉक समय चक्र कैसे काम करता है?",
      a_en: "Every new day's module unlocks automatically at 12:00 AM Midnight IST (India Standard Time, UTC+5:30). You can track the live countdown timer at the top of the Journey view to see exact hours, minutes, and seconds remaining until the next module unlocks.",
      a_hi: "हर नए दिन का मॉड्यूल भारतीय समयानुसार (IST) रात १२:०० बजे (मध्यरात्रि) अपने आप अनलॉक होता है। आप जर्नी व्यू में ऊपर चल रहे लाइव काउंटडाउन टाइमर से देख सकते हैं कि अगला मॉड्यूल खुलने में कितने घंटे, मिनट और सेकंड बाकी हैं।"
    },
    {
      q_en: "Can I skip days or complete modules out of order?",
      q_hi: "क्या मैं बीच के दिन छोड़कर आगे बढ़ सकता हूँ?",
      a_en: "No. The 100-Day Journey enforces a strict sequential prerequisite rule. You must complete Day N-1 before Day N unlocks. This builds genuine daily consistency and prevents rushing through lessons without internalizing them.",
      a_hi: "नहीं। १००-दिन का सफर एक सख्त क्रमिक (Sequential) नियम का पालन करता है। दिन 'N' केवल तभी अनलॉक होगा जब आप उससे पिछला दिन 'N-1' सफलता पूर्वक पूरा कर लेंगे। यह दैनिक अनुशासन और निरंतरता बनाए रखने के लिए अनिवार्य है।"
    },
    {
      q_en: "What is the TFS Strike System & Streak Reset?",
      q_hi: "टीएफएस (TFS) स्ट्राइक सिस्टम और रीसेट क्या है?",
      a_en: "Consistency is non-negotiable. If you fail to complete today's module before 12:00 AM Midnight IST, you receive 1 Strike. Missing 2 consecutive days resets your streak to 0, and missing 3 days resets your entire 100-Day Journey back to Day 1. Completing today's protocol clears active strikes.",
      a_hi: "निरंतरता अत्यंत आवश्यक है। यदि आप रात १२ बजे से पहले आज का टास्क पूरा नहीं करते, तो आपको १ स्ट्राइक मिलती है। लगातार २ दिन छूटने पर आपकी स्ट्रीक शून्य हो जाती है, और ३ दिन छूटने पर आपकी १००-दिन की पूरी प्रगति शून्य (Day 1) पर वापस रीसेट हो जाती है। आज का प्रोटोकॉल पूरा करने पर स्ट्राइक मिट जाती है।"
    },
    {
      q_en: "What happens during the Nightly Council (10:00 PM IST)?",
      q_hi: "रात्रि चिंतन सभा (10:00 PM IST) में क्या होता है?",
      a_en: "At 10:00 PM IST every night, the Nightly Reflection window activates with the prompt: 'What did you teach the world today? / आज तुमने दुनिया को क्या सिखाया?'. Submitting your stoic observation earns you +25 XP and locks in your daily record.",
      a_hi: "हर रात १०:०० बजे एक विशेष चिंतन प्रश्न खुलता है: 'आज तुमने दुनिया को क्या सिखाया?'। इसमें अपना संक्षिप्त अनुभव या सीख दर्ज करने पर आपको +२५ XP मिलते हैं और अगले दिन का रास्ता सुगम होता है।"
    },
    {
      q_en: "How do XP points and Leaderboard Ranks work?",
      q_hi: "एक्सपी (XP) और लीडरबोर्ड रैंक कैसे काम करते हैं?",
      a_en: "You earn +100 XP for completing a daily module, +25 XP for submitting a nightly reflection, and +50 XP for completing AI Scenario simulations in the Mind Lab. Accumulating XP elevates your rank across 6 tiers: Pawn (0 XP) ➔ Knight (500 XP) ➔ Strategist (1500 XP) ➔ Commander (3500 XP) ➔ Overlord (7500 XP) ➔ Sovereign (15000+ XP).",
      a_hi: "प्रत्येक दैनिक मॉड्यूल पूरा करने पर +१०० XP, रात्रि चिंतन पर +२५ XP, और माइंड लैब के सिनेरियो हल करने पर +५० XP प्राप्त होते हैं। आपके संचित अंकों के आधार पर आपकी रैंक ६ स्तरों में बढ़ती है: प्यादा (0 XP) ➔ नाइट (500 XP) ➔ स्ट्रैटेजिस्ट (1500 XP) ➔ कमांडर (3500 XP) ➔ ओवरलॉर्ड (7500 XP) ➔ सर्वसत्ता शासक (15000+ XP)।"
    },
    {
      q_en: "Are my completions verified for anti-cheat protection?",
      q_hi: "क्या सुरक्षा जाँच और एंटी-चीट प्रोटेक्शन है?",
      a_en: "Yes. All XP updates and day completion requests are verified server-side and protected by Firestore Security Rules to prevent score manipulation, ensuring fair ranking across all practitioners.",
      a_hi: "जी हाँ। सभी XP और स्तरों की सुरक्षा जाँच सर्वर-साइड फ़ायरस्टोर नियमों द्वारा की जाती है ताकि कोई अंक बदल न सके और लीडरबोर्ड पर सभी के साथ निष्पक्षता बनी रहे।"
    },
    {
      q_en: "Can I review or re-read previously completed days?",
      q_hi: "क्या मैं पुराने दिनों के पाठ दोबारा पढ़ सकता हूँ?",
      a_en: "Yes! All completed days remain permanently unlocked in your Journey calendar. You can click on any completed day card at any time to re-read the strategies, psychological commands, and stoic wisdom.",
      a_hi: "बिल्कुल! आपके द्वारा पूरे किए गए सभी दिन हमेशा खुले रहते हैं। आप जर्नी व्यू में किसी भी पुराने पूरे किए गए कार्ड पर क्लिक करके उसके सिद्धांतों और रणनीति को कभी भी दोबारा पढ़ सकते हैं।"
    }
  ];

  const categories = [
    'All', 
    'Mindset', 
    'Body Language', 
    'Manipulation', 
    'Discipline', 
    'Mystery & Presence', 
    'Strategic Thinking'
  ];

  const dayPhases = [
    { label: 'All Days', min: 1, max: 100 },
    { label: 'Phase 1 (Days 1-20)', min: 1, max: 20 },
    { label: 'Phase 2 (Days 21-40)', min: 21, max: 40 },
    { label: 'Phase 3 (Days 41-60)', min: 41, max: 60 },
    { label: 'Phase 4 (Days 61-80)', min: 61, max: 80 },
    { label: 'Phase 5 (Days 81-100)', min: 81, max: 100 }
  ];

  const statuses = [
    'All Status',
    'Completed',
    'Unlocked Today',
    'Locked'
  ];

  const completedDaysSet = new Set(profile?.completedDays || []);
  const maxCompletedDay = Math.max(0, ...(profile?.completedDays || [0]));
  
  // Check if today was completed
  const completedToday = (profile?.completedDays || []).length > 0 && maxCompletedDay > 0;

  const filteredModules = journeyModules.filter(m => {
    // 1. Category filter
    const matchesCategory = selectedCategory === 'All' || m.category?.toLowerCase() === selectedCategory.toLowerCase();

    // 2. Day Phase filter
    const activePhaseObj = dayPhases.find(p => p.label === selectedDayPhase) || dayPhases[0];
    const matchesDayPhase = m.day >= activePhaseObj.min && m.day <= activePhaseObj.max;

    // 3. Status filter
    const isCompleted = completedDaysSet.has(m.day);
    const isUnlocked = m.day === maxCompletedDay + 1;
    const isLocked = m.day > maxCompletedDay + 1;

    let matchesStatus = true;
    if (selectedStatus === 'Completed') matchesStatus = isCompleted;
    else if (selectedStatus === 'Unlocked Today') matchesStatus = isUnlocked;
    else if (selectedStatus === 'Locked') matchesStatus = isLocked;

    // 4. Search query filter
    const matchesSearch = (m.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (m.hindiTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          `day ${m.day}`.includes(searchTerm.toLowerCase());

    return matchesCategory && matchesDayPhase && matchesStatus && matchesSearch;
  });

  const handleModuleClick = (module: JourneyModule) => {
    setActiveModalModule(module);
  };

  const handleClaimDayCompletion = async (day: number) => {
    // Validate day prerequisite: Cannot complete Day N if Day N-1 is not completed (unless Day 1)
    if (day > 1 && !completedDaysSet.has(day - 1)) {
      alert(`🔒 PREREQUISITE LOCKED / पूर्वापेक्षा क्रम:\n\nYou must complete Day ${day - 1} before unlocking Day ${day}.\nआपको दिन ${day} अनलॉक करने से पहले दिन ${day - 1} पूरा करना होगा।`);
      return;
    }

    await onCompleteDay(day);
    setActiveModalModule(null);
  };

  const handleReflectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionInput.trim() || isSubmittingReflection) return;
    setIsSubmittingReflection(true);
    try {
      await onSubmitReflection(reflectionInput.trim());
      setReflectionInput('');
      setShowReflectionModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReflection(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner & Timer */}
      <div className="space-y-6">
        <div className="bg-[#0c0e14] border border-[#1d222e] rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
              100-Day Transformation / 100-दिवसीय महासाधना
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tight">
            Sovereign <span className="text-amber-500">Path</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            A progressive 100-day structured roadmap building stoic discipline, physical mastery, and unshakeable focus step by step.
          </p>
        </div>

        {/* Live Unlock Schedule Countdown Timer */}
        <DayCountdownTimer 
          completedToday={completedToday} 
          currentDay={maxCompletedDay + 1 <= 100 ? maxCompletedDay + 1 : 100} 
        />
      </div>

      {/* Attendance Calendar */}
      <div>
        <PresenceCalendar 
          presenceDays={profile?.presenceDays || []} 
          completedDaysCount={(profile?.completedDays || []).length} 
        />
      </div>

      {/* Day, Category & Status Filter Controls */}
      <div className="bg-[#0c0e14] border border-[#1d222e] rounded-[24px] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-widest text-white">
              Journey Filters / साधक फिल्टर
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-400">
            Showing {filteredModules.length} / {journeyModules.length} Days
          </span>
        </div>

        {/* Search Input & Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Day or Topic..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          {/* Day Phase Filter */}
          <div>
            <select
              value={selectedDayPhase}
              onChange={(e) => setSelectedDayPhase(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500/50 transition-all cursor-pointer"
            >
              {dayPhases.map(p => (
                <option key={p.label} value={p.label} className="bg-[#0c0e14] text-white">
                  📅 {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-200 focus:outline-none focus:border-amber-500/50 transition-all cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-[#0c0e14] text-white">
                  📂 {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-200 focus:outline-none focus:border-amber-500/50 transition-all cursor-pointer"
            >
              {statuses.map(st => (
                <option key={st} value={st} className="bg-[#0c0e14] text-white">
                  🎯 {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 border ${
                selectedCategory === cat
                  ? 'bg-amber-500 border-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredModules.map((module) => {
          const isCompleted = completedDaysSet.has(module.day);
          const isCurrentUnlock = module.day === maxCompletedDay + 1;
          const isLocked = module.day > maxCompletedDay + 1;

          return (
            <motion.div
              key={module.id}
              onClick={() => handleModuleClick(module)}
              whileHover={{ y: -4 }}
              className={`p-5 rounded-[24px] border cursor-pointer transition-all flex flex-col justify-between h-48 relative overflow-hidden group ${
                isCompleted
                  ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/60'
                  : isCurrentUnlock
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                  : 'bg-[#0c0e14] border-[#1d222e] hover:border-white/20 opacity-75'
              }`}
            >
              {/* Day Badge Header */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                  isCompleted 
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                    : isCurrentUnlock 
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}>
                  Day {module.day}
                </span>

                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isCurrentUnlock ? (
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-500" />
                )}
              </div>

              {/* Title & Hindi Title */}
              <div className="my-2">
                <h3 className="text-sm font-bold transition-colors line-clamp-1">
                  {isLocked ? (
                    <span className="text-gray-400 flex items-center gap-1.5 font-mono">
                      <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      Locked Protocol #{module.day}
                    </span>
                  ) : (
                    <span className="text-white group-hover:text-amber-400">
                      {module.title}
                    </span>
                  )}
                </h3>
                <span className="text-[10px] text-gray-400 font-mono block line-clamp-1 mt-0.5">
                  {isLocked ? (
                    <span className="text-amber-500/80">
                      Complete Day {module.day - 1} to reveal / पिछला दिन पूरा करें
                    </span>
                  ) : (
                    module.hindiTitle
                  )}
                </span>
              </div>

              {/* Category Footer */}
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono pt-2 border-t border-white/5">
                <span>{isLocked ? '🔒 Classified' : (module.category || 'General')}</span>
                <span className={`${isLocked ? 'text-gray-500' : 'text-amber-500'} flex items-center gap-1`}>
                  {isLocked ? 'Locked' : 'Read'} <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 100-Day Journey FAQ & Rules Accordion */}
      <div className="bg-[#0c0e14] border border-[#1d222e] rounded-[32px] p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-500">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 block">
              Sovereign Protocol Codex / महासाधना नियम
            </span>
            <h3 className="text-lg md:text-xl font-display font-black text-white uppercase italic tracking-tight">
              100-Day Journey <span className="text-amber-500">Rules & FAQ</span>
            </h3>
          </div>
        </div>

        <div className="space-y-3">
          {JOURNEY_FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex flex-col text-left space-y-1">
                    <span className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
                      <span className="text-amber-500 font-mono text-xs">0{idx + 1}.</span>
                      {faq.q_en}
                    </span>
                    <span className="text-[11px] md:text-xs text-amber-400/90 font-medium pl-6">
                      {faq.q_hi}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-amber-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 pb-5 md:px-5 md:pb-5 text-xs leading-relaxed border-t border-white/5 pt-3 space-y-2.5"
                    >
                      <div className="text-gray-200 font-medium leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono block mb-1">ENGLISH EXPLANATION</span>
                        {faq.a_en}
                      </div>
                      <div className="text-amber-200/90 font-medium leading-relaxed bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/10">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono block mb-1">HINDI / हिंदी संपूर्ण नियम</span>
                        {faq.a_hi}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Module Detail Modal */}
      <AnimatePresence>
        {activeModalModule && (() => {
          const isModalLocked = activeModalModule.day > maxCompletedDay + 1;

          return (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0c0e14] border border-[#1d222e] rounded-[32px] p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 relative shadow-2xl"
              >
                <button
                  onClick={() => setActiveModalModule(null)}
                  className="absolute right-6 top-6 p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl border border-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {isModalLocked ? (
                  <div className="py-8 text-center space-y-5">
                    <div className="w-16 h-16 mx-auto bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                      <Lock className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg inline-block">
                        LOCKED DAY #{activeModalModule.day}
                      </span>
                      <h3 className="text-xl font-black text-white uppercase italic pt-1">
                        Task Protocol is Classified
                      </h3>
                      <p className="text-xs text-amber-500 font-mono">
                        यह कार्य अभी गुप्त एवं सुरक्षित है
                      </p>
                    </div>

                    <div className="bg-black/50 border border-white/10 rounded-2xl p-5 text-xs text-gray-300 max-w-md mx-auto space-y-2 text-left">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Prerequisite Locked / पूर्वापेक्षा नियम:
                      </p>
                      <p className="text-gray-400 leading-relaxed">
                        You must complete Day {activeModalModule.day - 1} before unlocking Day {activeModalModule.day}. The daily task details, audio transmission, and psychological strategy are revealed automatically when you unlock this day.
                      </p>
                      <p className="text-amber-400/90 font-medium pt-2 border-t border-white/5 leading-relaxed">
                        दिन {activeModalModule.day} के टास्क और पाठ को देखने के लिए पहले दिन {activeModalModule.day - 1} पूरा करें।
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveModalModule(null)}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all"
                    >
                      Return to Active Path / वापस जाएं
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider rounded-lg inline-block">
                        Day {activeModalModule.day} Module
                      </span>
                      <h2 className="text-xl md:text-2xl font-bold text-white pt-2">
                        {activeModalModule.title}
                      </h2>
                      <p className="text-xs text-amber-500 font-mono">
                        {activeModalModule.hindiTitle}
                      </p>
                    </div>

                    {/* Audio Player if Available */}
                    {activeModalModule.audioUrl && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4">
                        <PlayCircle className="w-8 h-8 text-amber-500 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-white block">Guided Audio Transmission</span>
                          <span className="text-[10px] text-gray-400">Listen to master the mindset lesson</span>
                        </div>
                      </div>
                    )}

                    {/* Lesson Text */}
                    <div className="prose prose-invert max-w-none text-xs leading-relaxed text-gray-300 space-y-3 bg-black/40 p-5 rounded-2xl border border-white/5">
                      <p>{activeModalModule.content || activeModalModule.description}</p>
                      {activeModalModule.hindiDescription && (
                        <p className="text-gray-400 italic font-mono pt-2 border-t border-white/5">
                          {activeModalModule.hindiDescription}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <button
                        onClick={() => setShowReflectionModal(true)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                      >
                        Write Daily Reflection (+25 XP)
                      </button>

                      {!completedDaysSet.has(activeModalModule.day) ? (
                        <button
                          onClick={() => handleClaimDayCompletion(activeModalModule.day)}
                          className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Complete Day {activeModalModule.day} (+100 XP)</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 font-mono">
                          <CheckCircle2 className="w-4 h-4" />
                          Completed & Saved
                        </span>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Reflection Modal */}
      <AnimatePresence>
        {showReflectionModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c0e14] border border-[#1d222e] rounded-[32px] p-6 max-w-lg w-full space-y-4 relative shadow-2xl"
            >
              <button
                onClick={() => setShowReflectionModal(false)}
                className="absolute right-6 top-6 p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-white">Daily Reflection / आज का चिंतन</h3>
              <p className="text-xs text-gray-400">
                "What did you teach the world today?" / "आज तुमने दुनिया को क्या सिखाया?"
              </p>

              <form onSubmit={handleReflectionSubmit} className="space-y-4">
                <textarea
                  value={reflectionInput}
                  onChange={(e) => setReflectionInput(e.target.value)}
                  placeholder="Record your stoic observation or daily victory..."
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none min-h-[120px]"
                />

                <button
                  type="submit"
                  disabled={!reflectionInput.trim() || isSubmittingReflection}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all"
                >
                  Submit Reflection (+25 XP)
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
