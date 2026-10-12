import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Zap,
  Target,
  Brain,
  Send,
  Check,
  Activity,
} from 'lucide-react';
import {
  REALITY_AUDIT_PARADOXES,
  COMMUNITY_NO_GURU_RULES,
  WEEKLY_CRUCIBLE_CALENDAR,
  CRUCIBLE_DIAGNOSTIC_QUESTIONS,
} from '../../data/blueprintData';
import { LibraryBook } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface BlueprintCrucibleSectionsProps {
  onNavigateTab?: (tab: any) => void;
  onOpenBook?: (book: LibraryBook) => void;
  onAwardXP?: (amount: number, reason: string) => void;
}

// ==========================================
// 1. REALITY AUDIT COMPONENT
// ==========================================
export const RealityAuditSection: React.FC<BlueprintCrucibleSectionsProps> = () => {
  const [selectedParadoxId, setSelectedParadoxId] = useState<string>(
    'delusion-vs-impotence'
  );
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, number>>({});

  const selectedParadox =
    REALITY_AUDIT_PARADOXES.find((p) => p.id === selectedParadoxId) ||
    REALITY_AUDIT_PARADOXES[0];

  const handleSelectOption = (questionId: string, fragilityScore: number) => {
    setDiagnosticAnswers((prev) => ({ ...prev, [questionId]: fragilityScore }));
  };

  const calculateScore = () => {
    const scores: number[] = Object.values(diagnosticAnswers);
    if (scores.length === 0) return 0;
    const sum = scores.reduce((a: number, b: number) => a + b, 0);
    return Math.round((sum / (CRUCIBLE_DIAGNOSTIC_QUESTIONS.length * 10)) * 100);
  };

  const totalAnswered = Object.keys(diagnosticAnswers).length;
  const isComplete = totalAnswered === CRUCIBLE_DIAGNOSTIC_QUESTIONS.length;
  const fragilityPercentage = calculateScore();

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-red-950/40 via-zinc-900 to-black border border-red-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 bg-red-500/10 border border-red-500/40 text-red-400 text-[10px] font-mono font-black uppercase tracking-widest rounded-full">
            भाग 1: कम्युनिटी का मनोवैज्ञानिक व समाजशास्त्रीय ऑडिट
          </span>
          <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-mono uppercase tracking-widest rounded-full">
            THE REALITY AUDIT • ZERO THEORY
          </span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight">
          दिवास्वप्न से ज़मीनी शक्ति तक:{' '}
          <span className="text-red-400">3 गंभीर अंतर्विरोध</span>
        </h2>
        <p className="text-zinc-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
          चैट के स्क्रीनशॉट, वोटिंग डेटा और व्यवहार का वस्तुनिष्ठ विश्लेषण बताता है कि अधिकांश युवा भव्य साम्राज्य के भ्रम में जीते हैं, लेकिन पहली सामाजिक चोट पर टूट जाते हैं। पहले नर्वस सिस्टम का नियंत्रण, फिर मैकियावेली।
        </p>
      </div>

      {/* Paradox Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {REALITY_AUDIT_PARADOXES.map((paradox) => {
          const isSelected = paradox.id === selectedParadoxId;
          return (
            <button
              key={paradox.id}
              onClick={() => setSelectedParadoxId(paradox.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-red-500/10 border-red-500/80 shadow-lg shadow-red-500/10'
                  : 'bg-zinc-900/50 hover:bg-zinc-800/60 border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isSelected
                      ? 'bg-red-500 text-black'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  PARADOX 0{paradox.number}
                </span>
                <AlertTriangle
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-red-400' : 'text-zinc-600'
                  }`}
                />
              </div>
              <h3
                className={`text-sm font-bold ${
                  isSelected ? 'text-white' : 'text-zinc-300'
                }`}
              >
                {paradox.hindiTitle}
              </h3>
              <p className="text-[11px] text-zinc-400 line-clamp-2">
                {paradox.tagline}
              </p>
            </button>
          );
        })}
      </div>

      {/* Visual Paradox Demonstration Card */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-semibold block">
            विस्तृत विच्छेदन · Paradox Analysis #{selectedParadox.number}
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {selectedParadox.title} ({selectedParadox.hindiTitle})
          </h3>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            {selectedParadox.tagline}
          </p>
        </div>

        {/* The Abyss Diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
          <div className="lg:col-span-5 bg-gradient-to-br from-amber-950/20 to-zinc-900 border border-amber-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold rounded uppercase">
                {selectedParadox.delusionSide.title}
              </span>
              <Brain className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xs text-zinc-300 font-medium italic border-l-2 border-amber-400 pl-3 py-1 bg-black/40 rounded-r">
              {selectedParadox.delusionSide.quote}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <strong className="text-zinc-300">व्यवहार पैटर्न: </strong>
              {selectedParadox.delusionSide.behavior}
            </p>
          </div>

          <div className="lg:col-span-1 flex flex-col items-center justify-center py-2 text-center">
            <div className="w-0.5 h-6 lg:h-12 bg-red-500/40" />
            <div className="my-1 px-2 py-1 bg-red-500/20 border border-red-500/40 rounded text-[9px] font-mono font-black text-red-400 uppercase tracking-widest">
              विशाल खाई
            </div>
            <div className="w-0.5 h-6 lg:h-12 bg-red-500/40" />
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-red-950/20 to-zinc-900 border border-red-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-mono font-bold rounded uppercase">
                {selectedParadox.realitySide.title}
              </span>
              <Activity className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-xs text-zinc-300 font-medium italic border-l-2 border-red-400 pl-3 py-1 bg-black/40 rounded-r">
              {selectedParadox.realitySide.quote}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <strong className="text-zinc-300">ज़मीनी सच: </strong>
              {selectedParadox.realitySide.behavior}
            </p>
          </div>
        </div>

        {/* Gap Analysis & Sovereign Conclusion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-black/60 border border-zinc-800 rounded-2xl p-5 space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">
              वस्तुनिष्ठ विश्लेषण (Root Cause Analysis)
            </span>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {selectedParadox.gapAnalysis}
            </p>
            <p className="text-xs text-amber-300/90 font-medium italic pt-1">
              {selectedParadox.hindiGapAnalysis}
            </p>
          </div>

          <div className="bg-red-950/10 border border-red-500/30 rounded-2xl p-5 space-y-2">
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold block">
              रणनीतिक निष्कर्ष (The Sovereign Decree)
            </span>
            <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
              {selectedParadox.strategicConclusion}
            </p>
            <div className="pt-2 space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                तत्काल क्रियान्वयन नियम:
              </span>
              {selectedParadox.actionProtocol.map((protocol, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{protocol}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Self-Diagnostic Tool */}
      <div className="bg-zinc-900/90 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>सॉवरेन क्रूसिबल सेल्फ-कैलिब्रेटर</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              आप कहाँ खड़े हैं? (Delusion vs. Sovereign Reality Index)
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              ईमानदारी से 4 सवालों के उत्तर दें। यह परीक्षण आपके नर्वस सिस्टम की संवेदनशीलता और ज़मीनी तैयारी का सटीक पैमाना है।
            </p>
          </div>

          <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4 text-center shrink-0 min-w-[140px]">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
              प्रगति (Progress)
            </span>
            <span className="text-xl font-mono font-black text-amber-400">
              {totalAnswered} / {CRUCIBLE_DIAGNOSTIC_QUESTIONS.length}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {CRUCIBLE_DIAGNOSTIC_QUESTIONS.map((q, qIndex) => {
            const currentSelected = diagnosticAnswers[q.id];
            return (
              <div
                key={q.id}
                className="bg-black/40 border border-zinc-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-mono font-bold rounded">
                    Q0{qIndex + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white">{q.hindiQuestion}</h4>
                    <span className="text-xs text-zinc-400 block mt-0.5">
                      {q.question}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {q.options.map((opt, optIndex) => {
                    const isChosen = currentSelected === opt.fragilityScore;
                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleSelectOption(q.id, opt.fragilityScore)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isChosen
                            ? opt.fragilityScore >= 8
                              ? 'bg-red-950/30 border-red-500/70 text-white'
                              : opt.fragilityScore >= 5
                                ? 'bg-amber-950/30 border-amber-500/70 text-white'
                                : 'bg-emerald-950/30 border-emerald-500/70 text-white'
                            : 'bg-zinc-900/50 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-white">{opt.hindiLabel}</p>
                          <p className="text-[11px] text-zinc-400">{opt.label}</p>
                        </div>
                        {isChosen && (
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 uppercase ${
                              opt.fragilityScore >= 8
                                ? 'bg-red-500 text-black'
                                : opt.fragilityScore >= 5
                                  ? 'bg-amber-500 text-black'
                                  : 'bg-emerald-500 text-black'
                            }`}
                          >
                            {opt.diagnosticTag.split('(')[0].trim()}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {isComplete && (
          <div className="bg-gradient-to-br from-black via-zinc-900 to-black border-2 border-amber-500 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold block">
                  डायग्नोस्टिक परिणाम · YOUR CRUCIBLE DIAGNOSTIC
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {fragilityPercentage >= 70 ? (
                    <span className="text-red-400">
                      उच्च संवेदनशीलता (High Fragility &amp; Delusion Risk)
                    </span>
                  ) : fragilityPercentage >= 40 ? (
                    <span className="text-amber-400">
                      मध्यम तैयारी (Moderate Friction Resistant)
                    </span>
                  ) : (
                    <span className="text-emerald-400">
                      सॉवरेन ऑपरेटर (Grounded Sovereign Mindset)
                    </span>
                  )}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-3xl font-mono font-black text-white">
                  {fragilityPercentage}%
                </span>
                <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                  Fragility Index
                </span>
              </div>
            </div>

            <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
              <div
                className={`h-full transition-all duration-700 ${
                  fragilityPercentage >= 70
                    ? 'bg-red-500'
                    : fragilityPercentage >= 40
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${fragilityPercentage}%` }}
              />
            </div>

            <div className="p-4 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-2">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold block">
                क्रूसिबल उपचार (Crucible Prescription)
              </span>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {fragilityPercentage >= 70
                  ? "आपको तुरंत सभी दार्शनिक और कूटनीतिक सामग्री पढ़ना बंद करना चाहिए। पहले ई-बुक 'सामाजिक कवच' (The Social Shield) के पहले 3 अध्याय पढ़ें और 100-Day Course का Day 1 से Day 20 तक 'नर्वस सिस्टम शील्ड' का अभ्यास करें। जब तक रोस्ट होने पर आंसू आने बंद न हों, किसी साम्राज्य की योजना न बनाएं।"
                  : fragilityPercentage >= 40
                    ? 'आप सिद्धांतों को समझने लगे हैं लेकिन वास्तविक दुनिया के घर्षण से अभी भी डरते हैं। सप्ताह के ग्राउंड ड्रिल में भाग लें, सड़क पर मोलभाव करें और 6 महीने की वित्तीय ढाल बनाने के लिए एक एकल हाई-इनकम कौशल पर लॉक हो जाएं।'
                    : "आपका नर्वस सिस्टम स्थिर है और आपके पैर ज़मीन पर हैं। अब 'निर्मम प्रभाव' और 'आर्थिक स्वायत्तता' के पाठ्यक्रम का अध्ययन करें और अपने स्वायत्त नकद प्रवाह का विस्तार करें।"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. COMMUNITY NO-GURU PROTOCOL COMPONENT
// ==========================================
export const NoGuruProtocolSection: React.FC<BlueprintCrucibleSectionsProps> = ({
  onAwardXP,
}) => {
  const [pledged, setPledged] = useState<boolean>(() => {
    return localStorage.getItem('t2s_no_guru_pledged') === 'true';
  });

  const handlePledge = () => {
    localStorage.setItem('t2s_no_guru_pledged', 'true');
    setPledged(true);
    if (onAwardXP) {
      onAwardXP(50, 'Accepted No-Guru Community Protocol');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-amber-950/30 via-zinc-900 to-black border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-black uppercase tracking-widest rounded-full">
            कम्युनिटी 'नो-गुरु' प्रोटोकॉल
          </span>
          <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-mono uppercase tracking-widest rounded-full">
            ZERO HERO-WORSHIP • PURE ACCOUNTABILITY
          </span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight">
          व्यक्ति-पूजा निषेध: <span className="text-amber-400">5 अखंड मर्यादाएं</span>
        </h2>
        <p className="text-zinc-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
          Talk2Society कोई पंथ या अंधभक्तों का गिरोह नहीं है। यहाँ किसी की चापलूसी नहीं चलती। सम्मान केवल उस व्यक्ति को मिलता है जो अपनी बात का ज़मीनी प्रमाण (Proof of Work) दिखाता है और अपने नर्वस सिस्टम को नियंत्रित रखता है।
        </p>
      </div>

      <div className="space-y-4">
        {COMMUNITY_NO_GURU_RULES.map((rule) => (
          <div
            key={rule.id}
            className="bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-4 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 bg-amber-500 text-black text-[10px] font-mono font-black rounded uppercase">
                  RULE 0{rule.ruleNumber}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {rule.hindiName}
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">{rule.name}</span>
            </div>

            <div className="bg-black/50 border border-zinc-800/80 rounded-xl p-3.5 text-xs sm:text-sm text-amber-300 font-medium italic">
              “{rule.hindiPrinciple}”
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-red-400 uppercase font-bold block">
                  पूर्णतः वर्जित (Prohibited)
                </span>
                <p className="text-zinc-300 leading-relaxed">{rule.prohibited}</p>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                  अनिवार्य आचरण (Mandated)
                </span>
                <p className="text-zinc-300 leading-relaxed">{rule.mandated}</p>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                  उल्लंघन पर दंड (Enforcement)
                </span>
                <p className="text-zinc-400 leading-relaxed">{rule.enforcement}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-black via-zinc-900 to-black border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">
          सॉवरेन क्रूसिबल शपथ (The Crucible Oath)
        </h3>
        <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
          “मैं शपथ लेता हूँ कि मैं किसी व्यक्ति की अंधभक्ति नहीं करूँगा, झूठे दिलासों के बजाय सत्य को स्वीकार करूँगा, और हर दिन दिवास्वप्नों को त्यागकर ज़मीनी कर्म और नर्वस सिस्टम नियंत्रण पर ध्यान दूँगा।”
        </p>

        <div className="pt-2">
          {pledged ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono font-bold uppercase tracking-wider">
              <Check className="w-4 h-4" />
              <span>शपथ स्वीकृत • Protocol Accepted (+50 XP Claimed)</span>
            </div>
          ) : (
            <button
              onClick={handlePledge}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer font-mono"
            >
              मैं इस मर्यादा को स्वीकार करता हूँ (Accept Protocol +50 XP)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. WEEKLY CONTENT & WAR ROOM CALENDAR
// ==========================================
export const WeeklyCalendarSection: React.FC<BlueprintCrucibleSectionsProps> = ({
  onAwardXP,
}) => {
  const [activeDay, setActiveDay] = useState<string>('Monday');
  const [drillLog, setDrillLog] = useState<string>(() => {
    return localStorage.getItem('t2s_current_drill_log') || '';
  });
  const [isLogSubmitted, setIsLogSubmitted] = useState<boolean>(() => {
    return localStorage.getItem('t2s_drill_submitted') === 'true';
  });

  const selectedEvent =
    WEEKLY_CRUCIBLE_CALENDAR.find((e) => e.day === activeDay) ||
    WEEKLY_CRUCIBLE_CALENDAR[0];

  const handleSubmitDrill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drillLog.trim()) return;
    localStorage.setItem('t2s_current_drill_log', drillLog);
    localStorage.setItem('t2s_drill_submitted', 'true');
    setIsLogSubmitted(true);
    if (onAwardXP) {
      onAwardXP(100, 'Completed Ground Field Drill Log');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-blue-950/30 via-zinc-900 to-black border border-blue-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/40 text-blue-400 text-[10px] font-mono font-black uppercase tracking-widest rounded-full">
            साप्ताहिक परिचालन व कंटेंट कैलेंडर
          </span>
          <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-mono uppercase tracking-widest rounded-full">
            THE 4-DAY WAR ROOM RHYTHM
          </span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight">
          सप्ताहिक अनुशासन चक्र:{' '}
          <span className="text-blue-400">सोमवार से रविवार</span>
        </h2>
        <p className="text-zinc-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
          क्रूसिबल कोई अव्यवस्थित चैट ग्रुप नहीं है। यह एक सैन्य अकादमी की तरह 4-दिवसीय सटीक चक्र पर चलता है: ऑडिट ➔ केस स्टडी ➔ ज़मीनी ड्रिल ➔ लाइव वार रूम।
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {WEEKLY_CRUCIBLE_CALENDAR.map((event) => {
          const isSelected = event.day === activeDay;
          return (
            <button
              key={event.day}
              onClick={() => setActiveDay(event.day)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-blue-500/10 border-blue-500/80 shadow-lg shadow-blue-500/10'
                  : 'bg-zinc-900/50 hover:bg-zinc-800/60 border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isSelected
                      ? 'bg-blue-500 text-black'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {event.timeIST}
                </span>
                <span className="text-[10px] font-mono text-amber-400">
                  +{event.xpReward} XP
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                  {event.day}
                </span>
                <h3
                  className={`text-sm font-bold ${
                    isSelected ? 'text-white' : 'text-zinc-300'
                  }`}
                >
                  {event.hindiDay}
                </h3>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-1">
                {event.hindiFocus}
              </p>
            </button>
          );
        })}
      </div>

      <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-mono font-bold rounded">
                {selectedEvent.day} · {selectedEvent.timeIST}
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">
                Reward: +{selectedEvent.xpReward} XP
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">
              {selectedEvent.hindiName}
            </h3>
            <span className="text-xs text-zinc-400 font-mono block mt-0.5">
              {selectedEvent.name}
            </span>
          </div>

          <div className="bg-black/60 border border-zinc-800 rounded-xl p-3 text-center shrink-0">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
              Event Format
            </span>
            <span className="text-xs font-mono font-bold text-white uppercase">
              {selectedEvent.type.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/50 border border-zinc-800/80 rounded-2xl p-5 space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">
              सत्र का उद्देश्य व विवरण
            </span>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {selectedEvent.description}
            </p>
            <p className="text-xs text-blue-300/90 font-medium italic pt-2">
              फोकस: {selectedEvent.hindiFocus}
            </p>
          </div>

          <div className="bg-black/50 border border-zinc-800/80 rounded-2xl p-5 space-y-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold block">
              अनिवार्य सबमिशन (Deliverable)
            </span>
            <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
              {selectedEvent.deliverable}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>समीक्षा रविवार के लाइव वार रूम में की जाती है।</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-2 border-blue-500/40 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-2">
              <Target className="w-3.5 h-3.5" />
              <span>सक्रिय ज़मीनी फील्ड ड्रिल (Active Weekly Drill)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              शुक्रवार ग्राउंड असाइनमेंट: "24-घंटे शून्य प्रतिक्रिया व सड़क मोलभाव"
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              आज स्क्रीन से बाहर निकलें। बाज़ार में जाकर किसी वस्तु पर 40% कम कीमत पेश करें, या किसी बैठक में पूरे समय मौन रहकर दूसरों के सूक्ष्म संकेत दर्ज करें।
            </p>
          </div>

          <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs font-mono font-bold text-blue-400 shrink-0">
            +100 XP REWARD
          </div>
        </div>

        <form onSubmit={handleSubmitDrill} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-zinc-300 uppercase tracking-wider block mb-2">
              अपना फील्ड अनुभव / लॉग दर्ज करें (Write Your Field Log):
            </label>
            <textarea
              value={drillLog}
              onChange={(e) => setDrillLog(e.target.value)}
              placeholder="आज आपने सड़क या दफ्तर में क्या असाइनमेंट किया? सामने वाले की क्या प्रतिक्रिया थी और आपके नर्वस सिस्टम में क्या हलचल हुई?"
              rows={4}
              className="w-full bg-black/60 border border-zinc-800 rounded-xl p-4 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-zinc-500 italic">
              ईमानदारी से लिखा गया फील्ड लॉग साथी समीक्षा के लिए सुरक्षित रहता है।
            </span>

            {isLogSubmitted ? (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono font-bold uppercase">
                <Check className="w-4 h-4" />
                <span>फील्ड लॉग दर्ज हो गया (+100 XP Earned)</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={!drillLog.trim()}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>फील्ड रिपोर्ट सबमिट करें (+100 XP)</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. FOUR E-BOOKS CURRICULUM COMPONENT
// ==========================================
export const FourEbooksCurriculumSection: React.FC<
  BlueprintCrucibleSectionsProps
> = ({ onNavigateTab, onOpenBook }) => {
  const { library } = useAppContext();
  const [expandedBookId, setExpandedBookId] = useState<string>('');

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-amber-950/30 via-zinc-900 to-black border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-black uppercase tracking-widest rounded-full">
            चारों प्रस्तावित ई-बुक्स का विस्तृत पाठ्यक्रम
          </span>
          <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-mono uppercase tracking-widest rounded-full">
            THE 4 FOUNDATIONAL MANUSCRIPTS
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight">
              सॉवरेन ज्ञानकोश:{' '}
              <span className="text-amber-400">4 संपूर्ण पाठ्यक्रम</span>
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm max-w-3xl leading-relaxed mt-1">
              ये चारों ई-बुक्स Talk2Society के दर्शन को क्रियान्वयन में बदलने का रोडमैप हैं। रक्षात्मक नर्वस सिस्टम से लेकर मूक अवलोकन, लीवरेज और आर्थिक स्वायत्तता तक का संपूर्ण अध्याय-वार पाठ्यक्रम।
            </p>
          </div>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('library')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold uppercase rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-lg shadow-amber-500/20"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>लाइब्रेरी में पढ़ें (Open Library)</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {library.length === 0 ? (
          <div className="p-10 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-amber-500/60 mx-auto" />
            <p className="text-sm font-bold text-zinc-300">
              कोई पुस्तक उपलब्ध नहीं है (No Manuscripts Published Yet)
            </p>
            <p className="text-xs text-zinc-500">
              जैसे ही नई ई-बुक्स और पीडीएफ प्रकाशित होंगी, वे यहाँ और लाइब्रेरी में दिखाई देंगी।
            </p>
          </div>
        ) : (
        library.map((book) => {
          const isExpanded = expandedBookId === book.id;
          return (
            <div
              key={book.id}
              className={`border rounded-3xl transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-zinc-900/90 border-amber-500/50 shadow-xl shadow-amber-500/5'
                  : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div
                onClick={() => setExpandedBookId(isExpanded ? '' : book.id)}
                className="p-6 sm:p-8 cursor-pointer flex flex-col md:flex-row justify-between gap-6 items-start md:items-center"
              >
                <div className="flex gap-5 sm:gap-6 items-start">
                  <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-neutral-900 border border-zinc-700 overflow-hidden shrink-0 shadow-md">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-amber-500">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-mono font-bold rounded uppercase">
                        {book.badge}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        {book.category}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                      {book.hindiTitle}
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono">{book.title}</p>
                    <p className="text-xs text-zinc-300 italic pt-1 max-w-2xl line-clamp-2">
                      "{book.excerpt}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  {onOpenBook && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBook(book);
                      }}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-200 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>पढ़ें (Read)</span>
                    </button>
                  )}
                  <div className="p-2 bg-zinc-800/80 rounded-xl text-zinc-400">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? 'rotate-180 text-amber-400' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-zinc-800 bg-black/50 p-6 sm:p-8 space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                        <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                          कैनन नियम (Ground Rule)
                        </span>
                        <p className="text-xs text-zinc-200 font-medium">
                          {book.groundRule}
                        </p>
                      </div>
                      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                          लक्षित पाठक (Target Audience)
                        </span>
                        <p className="text-xs text-zinc-300">{book.targetAudience}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold block">
                        अध्याय-वार पाठ्यक्रम (5 Comprehensive Chapters)
                      </span>

                      <div className="space-y-3">
                        {book.chapters?.map((ch) => (
                          <div
                            key={ch.number || ch.chapterNumber}
                            className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-zinc-800 text-amber-400 text-[10px] font-mono font-bold rounded">
                                  CH 0{ch.number || ch.chapterNumber}
                                </span>
                                <h4 className="text-sm font-bold text-white">
                                  {ch.hindiTitle}
                                </h4>
                              </div>
                              <span className="text-[11px] font-mono text-zinc-400">
                                {ch.title}
                              </span>
                            </div>

                            <p className="text-xs text-zinc-300 leading-relaxed">
                              {ch.summary}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-xs">
                              <div className="p-3 bg-black/60 rounded-xl border border-zinc-800/80 space-y-1">
                                <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider font-bold block">
                                  मूल सबक (Core Canon Lesson)
                                </span>
                                <p className="text-zinc-200 font-medium italic">
                                  “{ch.keyLesson}”
                                </p>
                              </div>

                              <div className="p-3 bg-black/60 rounded-xl border border-zinc-800/80 space-y-1">
                                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                                  सड़क/दफ्तर ड्रिल (Practical Street Drill)
                                </span>
                                <p className="text-zinc-300">{ch.practicalDrill}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {onOpenBook && (
                      <div className="pt-2 text-center">
                        <button
                          onClick={() => onOpenBook(book)}
                          className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer font-mono shadow-lg shadow-amber-500/20"
                        >
                          इस पुस्तक का पूर्ण पाठ पढ़ें (Read Full Text &amp; Content)
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
};
