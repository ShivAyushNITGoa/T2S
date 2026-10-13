import React, { useState } from 'react';
import {
  Shield,
  Eye,
  Compass,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Volume2,
  AlertTriangle,
  Flame,
  Calendar,
} from 'lucide-react';
import {
  LOCKED_COMPETITORS,
  AUTHORITY_HIERARCHY_LEVELS,
  GUIDANCE_VS_SELF_HELP_RULES,
  VIEWER_JOURNEY_STAGES,
  IDEAL_VIDEO_STRUCTURE_STEPS,
  FIVE_FOUNDATIONAL_MANUALS_DETAILS,
  LOW_HIGH_THINKING_CASE_STUDIES,
} from '../data/t2sData';
import {
  RealityAuditSection,
  NoGuruProtocolSection,
  WeeklyCalendarSection,
  FourEbooksCurriculumSection,
} from './blueprint/BlueprintCrucibleSections';
import { VipSectionLockedView } from '../components/common/UiPrimitives';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSpeechSynthesis } from '../utils/speechUtils';

const STICK_FIGURE_SCENARIOS = [
  {
    id: 'salary-ladder',
    title: 'The Salary Query & The Mental Hierarchy Matrix',
    hindiTitle: 'सैलरी का सवाल और सामाजिक पदानुक्रम',
    family: 'Why India?',
    description:
      'Why distant relatives ask "Package kitna hai?" before deciding how much eye contact to grant you.',
    nodes: [
      { label: 'Encounter', text: 'Social gathering in living room / wedding.' },
      {
        label: 'Unspoken Anxiety',
        text: 'Where does this person rank relative to my clan?',
      },
      { label: 'The Proxy Question', text: '"What is your exact CTC package?"' },
      {
        label: 'The Social Sort',
        text: 'High number → Deference. Low number → Pity.',
      },
    ],
    insight:
      'The query is not about you. It is their boundary anxiety seeking an immediate sorting bin in a high-hierarchy society.',
    chandradiptiTake:
      'When you realize the question reveals their insecurity rather than your value, the sting disappears completely.',
  },
  {
    id: 'log-kya-kahenge',
    title: 'The "Log Kya Kahenge" Collective Tribunal',
    hindiTitle: 'लोग क्या कहेंगे: सामाजिक बीमा का कर',
    family: 'Why India?',
    description:
      'Why Indian families prioritize what neighbors might whisper over their own child’s genuine aspirations.',
    nodes: [
      {
        label: 'Lack of State Net',
        text: 'Historically, the state offered zero medical or emergency safety net.',
      },
      {
        label: 'Clan Insurance',
        text: 'The extended biradari became the mutual insurance pool.',
      },
      {
        label: 'Compliance Premium',
        text: 'To stay insured, you must obey all clan customs and dress codes.',
      },
      {
        label: 'The Tribunal',
        text: 'Anyone breaking rank threatens the credibility of the collective pool.',
      },
    ],
    insight:
      '"Log" are not watching you because they care; they are policing the boundary to ensure nobody escapes the compromises they had to make.',
    chandradiptiTake:
      'Recognize the historical insurance mechanism, then decide whether you still need to pay that heavy premium.',
  },
  {
    id: 'coaching-funnel',
    title: 'The Coaching Factory & Demographic Scarcity Funnel',
    hindiTitle: 'कोचिंग चक्रव्यूह और कृत्रिम संकट',
    family: 'The Hidden System',
    description:
      'How 1.5 million youth compete for 15,000 elite seats, creating a ₹10,000 Cr parallel economy.',
    nodes: [
      {
        label: 'Demographic Surge',
        text: 'Millions of young aspirational graduates entering the workforce.',
      },
      {
        label: 'Static Formal Seats',
        text: 'Prestige institutions add capacity at a glacial pace.',
      },
      {
        label: 'Artificial Scarcity',
        text: '0.05% selection creates extreme parental panic.',
      },
      {
        label: 'The Industry',
        text: 'Coaching centers sell insurance against middle-class downward mobility.',
      },
    ],
    insight:
      'The coaching factory does not test original creative problem-solving; it measures tolerance for repetitive psychological friction.',
    chandradiptiTake:
      'Set a hard timebox. Never let an artificial lottery consume the most vital creative decade of your life.',
  },
  {
    id: 'chai-equalizer',
    title: 'The ₹20 Tapri Chai: The Great Democratic Equalizer',
    hindiTitle: 'सड़क किनारे ₹20 की चाय का सामाजिक समझौता',
    family: 'How India Works',
    description:
      'How a roadside tea stall acts as the only physical venue where rigid Indian class boundaries temporarily vanish.',
    nodes: [
      {
        label: 'Urban Stratification',
        text: 'Modern glass towers segregate executives from street workforce.',
      },
      {
        label: 'The Roadside Neutral',
        text: 'The corner tapri is open to all walks of life equally.',
      },
      {
        label: 'The 10-Min Truce',
        text: 'Auto drivers, civil servants, and tech leads drink from the same kettle.',
      },
      {
        label: 'Informal Economy',
        text: 'High velocity, cash-fluid, relationship-driven trust network.',
      },
    ],
    insight:
      'Chai in India is not merely a beverage; it is a temporary democratic armistice between stratified socioeconomic classes.',
    chandradiptiTake:
      'Before criticizing unorganized street commerce, observe the immense social harmony it quietly engineers every morning.',
  },
];

export const BlueprintView: React.FC = () => {
  const {
    isSectionVipGated,
    openAscensionModal,
    handleTabClick,
    openBookModal,
    claimSovereignXp,
  } = useAppContext();
  const { t } = useLanguage();

  const [activeSubSection, setActiveSubSection] = useState<
    | 'overview'
    | 'reality_audit'
    | 'no_guru_protocol'
    | 'weekly_calendar'
    | 'stickfigures'
    | 'thinking_model'
    | 'competitors'
    | 'authority'
    | 'manuals'
    | 'guidance_rules'
  >('overview');

  const [selectedCaseStudyId, setSelectedCaseStudyId] =
    useState<string>('salary_obsession');
  const [activeThinkingLevel, setActiveThinkingLevel] = useState<number>(1);
  const [activeDiagramIndex, setActiveDiagramIndex] = useState<number>(0);

  const { isSpeaking, speak, stop } = useSpeechSynthesis();

  if (isSectionVipGated('crucible') || isSectionVipGated('blueprint')) {
    return (
      <VipSectionLockedView
        sectionTitle="Philosophy & Mental Models"
        hindiTitle="दर्शन व मानसिक मॉडल"
        description="The deep philosophical framework, Low vs High Thinking simulator, and Reality Paradoxes are reserved for Sovereign VIP members."
        onUnlock={openAscensionModal}
      />
    );
  }

  const selectedCaseStudy =
    LOW_HIGH_THINKING_CASE_STUDIES.find((cs) => cs.id === selectedCaseStudyId) ||
    LOW_HIGH_THINKING_CASE_STUDIES[0];
  const currentLevelData =
    selectedCaseStudy.levels.find((l) => l.level === activeThinkingLevel) ||
    selectedCaseStudy.levels[0];

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text, 'blueprint-tts');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-2 sm:px-4 md:px-6 pb-20">
      {/* Top Banner / Core Identity Header */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-[#121318] via-[#0c0d12] to-[#07080a] p-6 sm:p-8 md:p-10 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-black uppercase tracking-widest rounded-full">
              LOCKED CHANNEL POSITIONING &amp; COMPETITOR FRAMEWORK
            </span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-mono uppercase tracking-widest rounded-full">
              A. K. CHANDRADIPTI
            </span>
            <span className="px-3 py-1 bg-zinc-800 text-amber-300 text-[10px] font-mono uppercase tracking-widest rounded-full">
              INDIA-CENTRIC
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tight">
                TALK2SOCIETY{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-500">
                  OPERATING BLUEPRINT
                </span>
              </h1>
              <p className="text-zinc-300 text-sm sm:text-base max-w-3xl mt-2 font-medium leading-relaxed">
                India-centric Social Reality &amp; Life Guidance. We don’t just explain society—we help viewers{' '}
                <strong className="text-white">
                  open their eyes → understand reality → expand thinking → recognize hidden systems → see possible paths → make conscious decisions.
                </strong>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-black/60 border border-zinc-800 rounded-2xl p-3 text-center min-w-[130px]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                  मूल चार कदम (Core Mantra)
                </span>
                <span className="text-amber-400 font-display font-black text-xs tracking-wide block mt-0.5">
                  देखना • समझना • सोचना • चुनना
                </span>
              </div>
            </div>
          </div>

          {/* 4 Core Pillars Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3">
              <span className="text-[10px] font-mono text-amber-500 font-bold block">
                01 / SEE · देखना
              </span>
              <span className="text-xs font-bold text-white block mt-0.5">
                सच्चाई पहचानो (Reality Check)
              </span>
              <span className="text-[10px] text-zinc-400">
                भारतीय समाज के अनकहे दबावों को बिना भ्रम के देखें।
              </span>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3">
              <span className="text-[10px] font-mono text-amber-500 font-bold block">
                02 / UNDERSTAND · समझना
              </span>
              <span className="text-xs font-bold text-white block mt-0.5">
                अदृश्य तंत्र को डिकोड करो
              </span>
              <span className="text-[10px] text-zinc-400">
                दहेज, रिश्तेदारी और संस्थाओं के स्वार्थ को समझें।
              </span>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3">
              <span className="text-[10px] font-mono text-amber-500 font-bold block">
                03 / THINK · सोचना
              </span>
              <span className="text-xs font-bold text-white block mt-0.5">
                सोच का स्तर ऊंचा उठाओ
              </span>
              <span className="text-[10px] text-zinc-400">
                सिर्फ शिकायत करने से बाहर निकलकर गहरी समझ बनाएं।
              </span>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3">
              <span className="text-[10px] font-mono text-amber-500 font-bold block">
                04 / CHOOSE · निर्णय
              </span>
              <span className="text-xs font-bold text-white block mt-0.5">
                होश में अपना रास्ता चुनो
              </span>
              <span className="text-[10px] text-zinc-400">
                बिना किसी गुरु के अंधभक्त बने अपनी राह खुद बनाएं।
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-zinc-800">
        {[
          {
            id: 'overview',
            label: t('मूल दिशा (Core Engine)', 'Core Engine'),
            icon: Shield,
          },
          {
            id: 'reality_audit',
            label: t('कम्युनिटी ऑडिट (3 अंतर्विरोध)', 'Reality Audit (3 Paradoxes)'),
            icon: AlertTriangle,
          },
          {
            id: 'no_guru_protocol',
            label: t('नो-गुरु मर्यादा (5 नियम)', 'No-Guru Protocol (5 Rules)'),
            icon: Flame,
          },
          {
            id: 'weekly_calendar',
            label: t('साप्ताहिक टाइम-टेबल व ड्रिल्स', 'Weekly Calendar & Drills'),
            icon: Calendar,
          },
          {
            id: 'manuals',
            label: t('मूल ग्रंथ व 4 ई-बुक्स', 'Foundational Manuals & E-Books'),
            icon: BookOpen,
          },
          {
            id: 'stickfigures',
            label: t('दृश्य चित्र व मैप्स (Visuals)', 'Visual Systemic Maps'),
            icon: Eye,
          },
          {
            id: 'thinking_model',
            label: t('सोच के 8 स्तर (Thinking Model)', '8 Levels of Thinking'),
            icon: Layers,
          },
          {
            id: 'competitors',
            label: t('अन्य चैनलों से तुलना (Benchmark)', 'Channel Benchmark'),
            icon: Users,
          },
          {
            id: 'authority',
            label: t('तर्क व प्रमाण मॉडल (Authority)', 'Authority Hierarchy'),
            icon: Award,
          },
          {
            id: 'guidance_rules',
            label: t('मार्गदर्शन बनाम खोखला मोटिवेशन', 'Guidance vs Self-Help'),
            icon: CheckCircle2,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubSection(tab.id as any)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW & POSITIONING */}
      {activeSubSection === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase font-display">
                    मूल विषय: भारतीय समाज
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400/90 uppercase block font-semibold">
                    Core Subject: Indian Society
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                हमारा एकमात्र मुख्य विषय{' '}
                <strong className="text-white">भारतीय समाज की ज़मीनी हकीकत</strong>{' '}
                है। मनोविज्ञान, इतिहास या अर्थशास्त्र कोई किताबी ज्ञान नहीं, बल्कि भारत के आम युवा की जिंदगी, पारिवारिक दबाव, शादी के खर्च और नौकरी की हकीकत को समझने के हथियार हैं।
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                {[
                  { hi: 'शिक्षा व्यवस्था', en: 'Education' },
                  { hi: 'करियर व नौकरी', en: 'Career' },
                  { hi: 'दिखावा व प्रतिष्ठा', en: 'Status' },
                  { hi: 'पारिवारिक दबाव', en: 'Family Pressure' },
                  { hi: 'सामाजिक संस्थाएं', en: 'Institutions' },
                  { hi: 'शहर व पलायन', en: 'Urban Reality' },
                ].map((subj) => (
                  <span
                    key={subj.en}
                    className="text-[10px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-300"
                  >
                    {subj.hi}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase font-display">
                    5 बुनियादी सवाल
                  </h3>
                  <span className="text-[10px] font-mono text-blue-400/90 uppercase block font-semibold">
                    The 5 Core Inquiries
                  </span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold font-mono">01.</span>
                  <div>
                    <span className="text-white font-bold block">
                      “असल में अंदर चल क्या रहा है?”
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      What is really going on? (मुख्य पड़ताल)
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold font-mono">02.</span>
                  <div>
                    <span className="text-white font-bold block">
                      “हमारा समाज ऐसा क्यों बन गया?”
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Why is society like this?
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold font-mono">03.</span>
                  <div>
                    <span className="text-white font-bold block">
                      “इस बारे में कौन सच छिपा रहा है?”
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      What does nobody tell you?
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold font-mono">04.</span>
                  <div>
                    <span className="text-white font-bold block">
                      “कौन सी ताकतें इसे चला रही हैं?”
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      What forces are shaping this?
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold font-mono">05.</span>
                  <div>
                    <span className="text-white font-bold block">
                      “यह रास्ता हमें कहाँ ले जाएगा?”
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Where can this path lead?
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase font-display">
                    ए. के. चंद्रदीप्ति
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400/90 uppercase block font-semibold">
                    Observer • Investigator • Guide
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                वह कोई गुरु, बाबा या खोखले मोटिवेशनल स्पीकर नहीं हैं। वह एक निष्पक्ष शोधकर्ता हैं जो ज़मीनी तथ्यों की पड़ताल करते हैं ताकि आप खुद स्वतंत्र निर्णय ले सकें।
              </p>
              <div className="bg-black/40 border border-zinc-800 rounded-xl p-3">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">
                  उनका ६-चरणीय चक्र (The 6-Step Loop)
                </span>
                <span className="text-xs font-mono text-zinc-200 mt-1 block">
                  अवलोकन ➔ सवाल ➔ पड़ताल ➔ विश्लेषण ➔ सच उजागर ➔ आत्म-मंथन
                </span>
                <span className="text-[9.5px] text-zinc-500 font-mono mt-0.5 block">
                  Observe → Question → Investigate → Explain → Reveal → Reflect
                </span>
              </div>
            </div>
          </div>

          {/* Viewer Journey (7 Steps) */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-amber-400 text-xs font-mono uppercase tracking-widest font-semibold block">
                Editorial Journey · दर्शक का मानसिक सफर
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                The Psychological Journey of Every Video
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal">
                Every video systematically moves the viewer from everyday recognition to deep reflection and conscious choice.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {VIEWER_JOURNEY_STAGES.map((stg) => (
                <div
                  key={stg.stage}
                  className="bg-black/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative group hover:border-amber-500/40 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-500 font-bold block">
                      STAGE 0{stg.stage}
                    </span>
                    <h4 className="text-sm font-bold text-white uppercase">
                      {stg.name}
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-medium block">
                      {stg.hindiName}
                    </span>
                  </div>
                  <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                    <p className="text-[11px] text-amber-300 font-medium italic">
                      {stg.thought}
                    </p>
                    <p className="text-[9.5px] text-zinc-500 mt-1">
                      {stg.hindiThought}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 8-Step Ideal Video Structure */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-amber-400 text-xs font-mono uppercase tracking-widest font-semibold block">
                Documentary Anatomy · 8-चरण संरचना
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                The 8-Step Documentary Structure
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal">
                How Talk2Society structures investigative documentaries for maximum clarity, evidence, and life impact.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {IDEAL_VIDEO_STRUCTURE_STEPS.map((step) => (
                <div
                  key={step.step}
                  className="bg-black/40 border border-zinc-800 rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                      {step.step}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {step.hindiTitle}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase">
                    {step.title}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {step.desc}
                  </p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                    {step.hindiDesc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1.1 REALITY AUDIT */}
      {activeSubSection === 'reality_audit' && (
        <RealityAuditSection onNavigateTab={handleTabClick} />
      )}

      {/* 1.2 COMMUNITY NO-GURU PROTOCOL */}
      {activeSubSection === 'no_guru_protocol' && (
        <NoGuruProtocolSection onAwardXP={claimSovereignXp} />
      )}

      {/* 1.3 WEEKLY CRUCIBLE CALENDAR & WAR ROOM */}
      {activeSubSection === 'weekly_calendar' && (
        <WeeklyCalendarSection onAwardXP={claimSovereignXp} />
      )}

      {/* 2. STICK-FIGURE VISUAL DIAGRAMS */}
      {activeSubSection === 'stickfigures' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-amber-400 text-xs font-mono uppercase tracking-widest font-semibold block">
                  Visual Architecture · दृश्य पद्धति
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                  Stick-Figure Characters &amp; Structural Diagrams
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl mt-1">
                  Faceless stick figures + diagrams + maps + charts. AI is the production tool; human-directed research and original framing is the intellectual moat.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {STICK_FIGURE_SCENARIOS.map((sc, idx) => (
                  <button
                    key={sc.id}
                    onClick={() => setActiveDiagramIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      activeDiagramIndex === idx
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {sc.family}: {sc.title.split('&')[0]}
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const currentDiagram = STICK_FIGURE_SCENARIOS[activeDiagramIndex];
              return (
                <div className="space-y-6">
                  <div className="bg-[#090a0f] border border-amber-500/20 rounded-3xl p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">
                          Interactive Blueprint · {currentDiagram.family}
                        </span>
                        <h3 className="font-editorial text-xl sm:text-2xl font-bold text-white mt-0.5">
                          {currentDiagram.title}
                        </h3>
                        <span className="text-xs text-zinc-400 font-medium">
                          {currentDiagram.hindiTitle}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          handleSpeak(
                            `${currentDiagram.title}. ${currentDiagram.insight} ${currentDiagram.chandradiptiTake}`
                          )
                        }
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto ${
                          isSpeaking
                            ? 'bg-amber-500 text-black'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{isSpeaking ? 'Stop Audio' : 'Listen AI Voice'}</span>
                      </button>
                    </div>

                    <div className="w-full bg-[#050608] rounded-2xl p-4 sm:p-6 border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden min-h-[260px]">
                      <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

                      <svg
                        viewBox="0 0 800 240"
                        className="w-full h-auto max-h-[300px] z-10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <line
                          x1="80"
                          y1="120"
                          x2="720"
                          y2="120"
                          stroke="#374151"
                          strokeWidth="2"
                          strokeDasharray="6 6"
                        />

                        <g className="cursor-pointer group">
                          <circle
                            cx="120"
                            cy="70"
                            r="16"
                            stroke="#f59e0b"
                            strokeWidth="3"
                            fill="#090a0f"
                          />
                          <circle cx="115" cy="68" r="2" fill="#f59e0b" />
                          <circle cx="125" cy="68" r="2" fill="#f59e0b" />
                          <line
                            x1="120"
                            y1="86"
                            x2="120"
                            y2="140"
                            stroke="#f59e0b"
                            strokeWidth="3"
                          />
                          <line
                            x1="120"
                            y1="100"
                            x2="95"
                            y2="120"
                            stroke="#f59e0b"
                            strokeWidth="3"
                          />
                          <line
                            x1="120"
                            y1="100"
                            x2="145"
                            y2="110"
                            stroke="#f59e0b"
                            strokeWidth="3"
                          />
                          <line
                            x1="120"
                            y1="140"
                            x2="105"
                            y2="190"
                            stroke="#f59e0b"
                            strokeWidth="3"
                          />
                          <line
                            x1="120"
                            y1="140"
                            x2="135"
                            y2="190"
                            stroke="#f59e0b"
                            strokeWidth="3"
                          />
                          <rect
                            x="70"
                            y="20"
                            width="100"
                            height="26"
                            rx="6"
                            fill="#18181b"
                            stroke="#f59e0b"
                            strokeWidth="1"
                          />
                          <text
                            x="120"
                            y="37"
                            fill="#fef08a"
                            fontSize="11"
                            fontFamily="monospace"
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            OBSERVER
                          </text>
                        </g>

                        <g>
                          <rect
                            x="280"
                            y="60"
                            width="240"
                            height="120"
                            rx="16"
                            fill="#18181b"
                            stroke="#f59e0b"
                            strokeWidth="2"
                          />
                          <text
                            x="400"
                            y="90"
                            fill="#f59e0b"
                            fontSize="12"
                            fontFamily="monospace"
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            HIDDEN SYSTEM MECHANISM
                          </text>
                          <line
                            x1="300"
                            y1="105"
                            x2="500"
                            y2="105"
                            stroke="#27272a"
                            strokeWidth="1"
                          />
                          <text
                            x="400"
                            y="128"
                            fill="#e4e4e7"
                            fontSize="11"
                            textAnchor="middle"
                          >
                            {currentDiagram.nodes[1]?.text?.slice(0, 32)}...
                          </text>
                          <text
                            x="400"
                            y="148"
                            fill="#a1a1aa"
                            fontSize="10"
                            textAnchor="middle"
                          >
                            Incentives • Risk Buffer • Unwritten Code
                          </text>
                          <circle cx="400" cy="170" r="4" fill="#10b981" />
                        </g>

                        <g>
                          <circle
                            cx="680"
                            cy="70"
                            r="16"
                            stroke="#9ca3af"
                            strokeWidth="3"
                            fill="#090a0f"
                          />
                          <line
                            x1="680"
                            y1="86"
                            x2="680"
                            y2="140"
                            stroke="#9ca3af"
                            strokeWidth="3"
                          />
                          <line
                            x1="680"
                            y1="100"
                            x2="655"
                            y2="120"
                            stroke="#9ca3af"
                            strokeWidth="3"
                          />
                          <line
                            x1="680"
                            y1="100"
                            x2="705"
                            y2="120"
                            stroke="#9ca3af"
                            strokeWidth="3"
                          />
                          <line
                            x1="680"
                            y1="140"
                            x2="665"
                            y2="190"
                            stroke="#9ca3af"
                            strokeWidth="3"
                          />
                          <line
                            x1="680"
                            y1="140"
                            x2="695"
                            y2="190"
                            stroke="#9ca3af"
                            strokeWidth="3"
                          />
                          <rect
                            x="630"
                            y="20"
                            width="100"
                            height="26"
                            rx="6"
                            fill="#18181b"
                            stroke="#6b7280"
                            strokeWidth="1"
                          />
                          <text
                            x="680"
                            y="37"
                            fill="#d1d5db"
                            fontSize="11"
                            fontFamily="monospace"
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            THE SOCIAL CLAN
                          </text>
                        </g>

                        <polygon points="260,120 250,115 250,125" fill="#f59e0b" />
                        <polygon points="540,120 530,115 530,125" fill="#f59e0b" />
                      </svg>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {currentDiagram.nodes.map((node, i) => (
                        <div
                          key={i}
                          className="bg-black/40 border border-zinc-800 rounded-xl p-3.5 space-y-1"
                        >
                          <span className="text-[10px] font-mono text-amber-500 font-bold block">
                            Step 0{i + 1} · {node.label}
                          </span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {node.text}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                        <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-black block">
                          SYSTEMIC INSIGHT
                        </span>
                        <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                          {currentDiagram.insight}
                        </p>
                      </div>

                      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black block">
                            A. K. CHANDRADIPTI WORLDVIEW
                          </span>
                          <span className="text-[9px] font-mono text-amber-400">
                            GUIDE
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-300 leading-relaxed italic">
                          “{currentDiagram.chandradiptiTake}”
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 3. LOW -> HIGH THINKING MODEL (8 LEVELS) */}
      {activeSubSection === 'thinking_model' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-amber-400 text-xs font-mono uppercase tracking-widest font-semibold block">
                  Cognitive Framework · 8-स्तरीय चिंतन मॉडल
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                  Low → High 8-Level Thinking Model
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl mt-1">
                  The defining intellectual engine of Talk2Society: Simple everyday entry → sophisticated structural understanding → conscious life navigation.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {LOW_HIGH_THINKING_CASE_STUDIES.map((cs) => (
                  <button
                    key={cs.id}
                    onClick={() => {
                      setSelectedCaseStudyId(cs.id);
                      setActiveThinkingLevel(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedCaseStudyId === cs.id
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cs.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {selectedCaseStudy.levels.map((lvl) => {
                const isCurrent = activeThinkingLevel === lvl.level;
                return (
                  <button
                    key={lvl.level}
                    onClick={() => setActiveThinkingLevel(lvl.level)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-mono font-bold block ${
                        isCurrent ? 'text-amber-400' : 'text-zinc-500'
                      }`}
                    >
                      LEVEL 0{lvl.level}
                    </span>
                    <span className="text-xs font-bold font-display uppercase block mt-1 leading-snug line-clamp-2">
                      {lvl.name}
                    </span>
                    <span className="text-[9px] text-zinc-500 block mt-0.5 line-clamp-1">
                      {lvl.hindiName}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="bg-[#0b0c10] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-amber-500 text-black text-[10px] font-mono font-black rounded-lg">
                      LEVEL 0{currentLevelData.level}
                    </span>
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                      {selectedCaseStudy.category} Case Investigation
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-display font-black text-white uppercase mt-2">
                    {currentLevelData.name}{' '}
                    <span className="text-zinc-500 text-sm font-normal">
                      ({currentLevelData.hindiName})
                    </span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleSpeak(
                        `${currentLevelData.name}. ${currentLevelData.question}. ${currentLevelData.explanation}`
                      )
                    }
                    className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                  <button
                    onClick={() => {
                      if (activeThinkingLevel < 8)
                        setActiveThinkingLevel((prev) => prev + 1);
                      else setActiveThinkingLevel(1);
                    }}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next Level</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-black block">
                      Guiding Inquiry · मार्गदर्शक प्रश्न
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                      “{currentLevelData.question}”
                    </h4>
                  </div>

                  <div className="bg-black/50 p-4 rounded-2xl border border-zinc-800/80 space-y-2">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black block">
                      Structural Breakdown · संरचनात्मक व्याख्या
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                      {currentLevelData.explanation}
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed italic border-t border-zinc-800/60 pt-2">
                      {currentLevelData.hindiExplanation}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 flex flex-col justify-between">
                  <div className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-5 space-y-3">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-black block">
                      A. K. CHANDRADIPTI CASE SYNTHESIS
                    </span>
                    <blockquote className="text-xs sm:text-sm text-amber-200 leading-relaxed italic">
                      “{selectedCaseStudy.chandradiptiQuote}”
                    </blockquote>
                  </div>

                  <div className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-800 space-y-2">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold block">
                      HOW TO APPLY IN DAILY LIFE
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Move through levels 1 through 8 whenever you feel social friction, peer comparison, or family pressure. Don’t react at Level 1 or 2—elevate directly to Level 6 (Structure) and Level 7 (Trade-offs).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. COMPETITOR BENCHMARK FRAMEWORK */}
      {activeSubSection === 'competitors' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-amber-400 text-xs font-mono uppercase tracking-widest font-semibold block">
                Competitive Benchmark · प्रतिस्पर्धी विश्लेषण
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                The 8 Adjacent Channels &amp; Talk2Society’s Moat
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-4xl mt-1">
                These are reference competitors to study, not copy. Talk2Society sits uniquely between Documentary, Social Awareness, Life Guidance, and Systems Thinking with character-led faceless storytelling.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LOCKED_COMPETITORS.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-black/50 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-5 space-y-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-white text-xs border border-white/10 shrink-0"
                        style={{
                          backgroundColor: `${comp.accentColor}25`,
                          borderColor: comp.accentColor,
                        }}
                      >
                        {comp.avatarText}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white uppercase">
                          {comp.name}
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">
                          {comp.category}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[9px] font-mono uppercase rounded">
                      Reference #{comp.avatarText}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800/80 space-y-1">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold block">
                        What to Learn · क्या सीखना है?
                      </span>
                      <p className="text-zinc-200 font-medium">{comp.whatToStudy}</p>
                      <p className="text-[10px] text-zinc-500 italic">
                        {comp.hindiWhatToStudy}
                      </p>
                    </div>

                    <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/30 space-y-1">
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold block">
                        Talk2Society Differentiation · हमारा विशिष्ट दृष्टिकोण
                      </span>
                      <p className="text-amber-200 font-medium">
                        {comp.t2sDifference}
                      </p>
                      <p className="text-[10px] text-amber-400/70 italic">
                        {comp.hindiT2sDifference}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. EVIDENCE & AUTHORITY MODEL */}
      {activeSubSection === 'authority' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-amber-400 text-xs font-mono uppercase tracking-widest font-semibold block">
                The Authority Model · प्रमाण और विश्वसनीयता
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                Evidence Hierarchy &amp; Anti-Sensationalism Standard
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl mt-1">
                Authority must come from evidence, not theatrical delivery. We strictly avoid manufactured authority, fake expertise, and conspiracy framing.
              </p>
            </div>

            <div className="space-y-3">
              {AUTHORITY_HIERARCHY_LEVELS.map((lvl) => (
                <div
                  key={lvl.tier}
                  className="bg-black/50 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-black text-sm flex items-center justify-center shrink-0">
                      T{lvl.tier}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-white uppercase">
                          {lvl.title}
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-500">
                          ({lvl.hindiTitle})
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono">
                        Sources: {lvl.sources}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                    <span className="text-[10px] font-mono text-amber-300 font-bold block">
                      {lvl.weight}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                  Editorial Guardrails · वर्जित तौर-तरीके
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-zinc-300">
                {[
                  'Fake expertise or unaccredited claims',
                  '“They don’t want you to know” conspiracies',
                  'Unsupported viral statistics',
                  'Sensational hysteria or rage-baiting',
                  'Dark psychology or manipulation hacks',
                  'Empty hollow motivational clichés',
                ].map((txt) => (
                  <div
                    key={txt}
                    className="bg-black/40 p-2.5 rounded-xl border border-red-500/20 flex items-center gap-2"
                  >
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{txt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. GUIDANCE VS SELF-HELP RULES */}
      {activeSubSection === 'guidance_rules' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-amber-400 text-xs font-mono uppercase tracking-widest font-semibold block">
                Ethical Stance · सामाजिक मार्गदर्शन, न कि सतही सेल्फ-हेल्प
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                Guidance Without Manipulation
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl mt-1">
                Conventional self-help commands: “Do this and you will succeed.” Talk2Society explains: “This is what is happening. These forces shape it. These are consequences. Now think and decide consciously.”
              </p>
            </div>

            <div className="space-y-2.5">
              {GUIDANCE_VS_SELF_HELP_RULES.map((rule, idx) => (
                <div
                  key={idx}
                  className="bg-black/50 border border-zinc-800 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">
                      Conventional Self-Help · {rule.aspect}
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {rule.selfHelp}
                    </p>
                    <p className="text-[10px] text-zinc-500 italic">
                      {rule.hindiSelfHelp}
                    </p>
                  </div>
                  <div className="space-y-1 md:border-l md:border-zinc-800 md:pl-4">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                      Talk2Society Position
                    </span>
                    <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                      {rule.t2s}
                    </p>
                    <p className="text-[10px] text-emerald-400/70 italic">
                      {rule.hindiT2s}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. THE 5 FOUNDATIONAL MANUALS & 4 EBOOKS */}
      {activeSubSection === 'manuals' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-amber-400 text-xs font-mono uppercase tracking-widest font-semibold block">
                  Foundational Books &amp; Library · मूल वैचारिक ग्रंथ
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                  Core Life Manuals &amp; The Great Library
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl mt-1">
                  These core manuals form the foundation of our expanding library. Along with classical philosophy and strategic texts, they provide the analytical tools for personal sovereignty.
                </p>
              </div>

              <button
                onClick={() => handleTabClick('library')}
                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 text-xs font-mono font-bold uppercase rounded-xl transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <BookOpen className="w-3.5 h-3.5" /> Open The Great Library
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {FIVE_FOUNDATIONAL_MANUALS_DETAILS.map((manual) => (
                <div
                  key={manual.stage}
                  className="bg-black/50 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-amber-500 text-black text-[9px] font-mono font-black rounded">
                        STAGE 0{manual.stage}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {manual.focus.split('&')[0]}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white font-display uppercase">
                      {manual.title}
                    </h4>
                    <span className="text-xs font-medium text-amber-300 block">
                      {manual.coreTheme}
                    </span>

                    <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                      {manual.tagline}
                    </p>
                    <p className="text-[10px] text-zinc-500 italic">
                      {manual.hindiTagline}
                    </p>
                  </div>

                  <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 space-y-1">
                    <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest font-bold block">
                      KEY CANON RULE
                    </span>
                    <p className="text-[11px] text-zinc-200 font-medium italic">
                      “{manual.keyRule}”
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <FourEbooksCurriculumSection
                onNavigateTab={handleTabClick}
                onOpenBook={openBookModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
