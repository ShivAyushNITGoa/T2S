import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Volume2, Shield, Play, Square, Activity, 
  CheckCircle2, ChevronRight, RefreshCw, Trophy, Zap, Clock,
  Target, AlertTriangle, HelpCircle, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AIScenarioSimulator from './AIScenarioSimulator';

interface SovereignLabProps {
  profile: any;
  onXpEarned: (amount: number, reason: string) => Promise<void>;
}

interface Scenario {
  id: string;
  title: string;
  hindiTitle: string;
  description: string;
  hindiDescription: string;
  options: {
    text: string;
    hindiText: string;
    isSovereign: boolean;
    feedback: string;
    hindiFeedback: string;
    countermeasure: string;
    hindiCountermeasure: string;
  }[];
}

interface BreathProtocol {
  id: string;
  name: string;
  hindiName: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  description: string;
  hindiDescription: string;
}

const BREATH_PROTOCOLS: BreathProtocol[] = [
  {
    id: "box",
    name: "Box Breathing",
    hindiName: "संतुलित श्वास (4-4-4-4)",
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    description: "The Navy SEAL standard for instant calm, situational awareness, and heart-rate control.",
    hindiDescription: "अत्यधिक तनावपूर्ण स्थितियों में त्वरित शांति, घबराहट पर नियंत्रण और मानसिक संतुलन के लिए अचूक विधि।"
  },
  {
    id: "calm",
    name: "Calming Breath",
    hindiName: "विश्राम प्राणायाम (4-7-8)",
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    description: "Acts as a natural tranquilizer for the nervous system, rapidly lowering cortisol levels.",
    hindiDescription: "नर्वस सिस्टम को शांत करने, दिमाग को स्थिर करने और तनाव हार्मोन कार्टिसोल को कम करने के लिए गहन अभ्यास।"
  },
  {
    id: "charge",
    name: "Sovereign Charge",
    hindiName: "ऊर्जा संचरण (5-2-5-2)",
    inhale: 5,
    holdIn: 2,
    exhale: 5,
    holdOut: 2,
    description: "Enhances oxygen supply to the prefrontal cortex, stimulating rapid logical focus and high energy.",
    hindiDescription: "मस्तिष्क के तार्किक हिस्से में ऑक्सीजन का संचार बढ़ाकर संकल्प शक्ति (Willpower) को जागृत करना।"
  },
  {
    id: "coherent",
    name: "Coherent Flow",
    hindiName: "सामंजस्य प्रवाह (5-0-5-0)",
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    description: "Stabilizes autonomic nervous system oscillations, aligning heart-rate and breathing rhythms.",
    hindiDescription: "शरीर की आंतरिक लय और हृदय गति में संतुलन स्थापित करने के लिए एक सीधा व सरल अभ्यास।"
  }
];

const TEST_COLORS = [
  { name: 'Red', hex: '#ef4444', textClass: 'text-red-500' },
  { name: 'Blue', hex: '#3b82f6', textClass: 'text-blue-500' },
  { name: 'Green', hex: '#22c55e', textClass: 'text-green-500' },
  { name: 'Yellow', hex: '#eab308', textClass: 'text-yellow-500' },
  { name: 'Purple', hex: '#a855f7', textClass: 'text-purple-500' }
];

const TEST_WORDS = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'];

export default function SovereignLab({ profile, onXpEarned }: SovereignLabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'binaural' | 'combat' | 'focustest' | 'audit'>('binaural');
  
  // 1. Respiration & Binaural States
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [carrierFreq, setCarrierFreq] = useState<number>(432); // 432Hz or 528Hz
  const [audioVolume, setAudioVolume] = useState<number>(0.3);
  const [selectedBreathProtocol, setSelectedBreathProtocol] = useState<BreathProtocol>(BREATH_PROTOCOLS[0]);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold-in' | 'exhale' | 'hold-out'>('inhale');
  const [breathTimer, setBreathTimer] = useState<number>(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  
  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const leftGainRef = useRef<GainNode | null>(null);
  const rightGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Breathing loop ref
  const breathIntervalRef = useRef<any>(null);

  // 2. Scenario Simulator States
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number | null>(null);
  const [scenarioStep, setScenarioStep] = useState<'intro' | 'question' | 'result'>('intro');
  const [chosenOptionIndex, setChosenOptionIndex] = useState<number | null>(null);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>(() => {
    const saved = localStorage.getItem('t2s_completed_scenarios');
    return saved ? JSON.parse(saved) : [];
  });
  const [xpClaimLoading, setXpClaimLoading] = useState(false);

  // 3. Focus Test Game States (Stroop Effect)
  const [focusGameState, setFocusGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [focusTimeLeft, setFocusTimeLeft] = useState<number>(20);
  const [focusScore, setFocusScore] = useState<number>(0);
  const [focusAttempts, setFocusAttempts] = useState<number>(0);
  const [focusWord, setFocusWord] = useState<string>('');
  const [focusColor, setFocusColor] = useState<any>(TEST_COLORS[0]);
  const [focusReactionTimes, setFocusReactionTimes] = useState<number[]>([]);
  const [focusTurnStartTime, setFocusTurnStartTime] = useState<number>(0);
  const [isFocusXpClaimedToday, setIsFocusXpClaimedToday] = useState(() => {
    const today = new Date().toDateString();
    return localStorage.getItem('t2s_last_focus_test_date') === today;
  });

  // 4. Self-Audit States
  const [auditScores, setAuditScores] = useState({
    notificationsOff: false,
    noEndlessScroll: false,
    readBooks: false,
    resistedSugar: false,
    focusedWork: false
  });
  const [isAuditSubmitted, setIsAuditSubmitted] = useState(() => {
    const today = new Date().toDateString();
    return localStorage.getItem('t2s_last_audit_date') === today;
  });

  const scenarios: Scenario[] = [
    {
      id: "gaslighting_boss",
      title: "The Office Manipulation / क्रेडिट चोरी का जाल",
      hindiTitle: "दफ़्तर की राजनीति और क्रेडिट हेरफेर",
      description: "During a major presentation, your senior colleague casually takes complete credit for an innovative psychological concept you designed. They look at you smilingly and say, 'We worked as a team, right?' in front of everyone.",
      hindiDescription: "एक महत्वपूर्ण मीटिंग के दौरान, आपका वरिष्ठ सहयोगी आपके द्वारा डिज़ाइन की गई अभिनव मनोवैज्ञानिक रणनीति का पूरा श्रेय ले लेता है। वह मुस्कुराते हुए सबके सामने कहता है, 'हमने एक टीम की तरह काम किया, है ना?'",
      options: [
        {
          text: "React aggressively: Speak up immediately with anger and declare they did nothing.",
          hindiText: "गुस्से में तुरंत बोलना: सबके सामने चिल्लाकर कहना कि उन्होंने कुछ नहीं किया।",
          isSovereign: false,
          feedback: "Anger displays a lack of emotional self-mastery. You look reactive, defensive, and hard to work with in front of senior executives.",
          hindiFeedback: "गुस्सा आपके आत्म-नियंत्रण की कमी को दर्शाता है। आप अधिकारियों के सामने प्रतिक्रियाशील और अव्यवस्थित दिखेंगे।",
          countermeasure: "Reaction Trap / प्रतिक्रिया का जाल",
          hindiCountermeasure: "शांत रहें, प्रतिक्रिया हमेशा सोच-समझकर दें।"
        },
        {
          text: "Sovereign Counter-Mirror: Nod calmly, smile, and say: 'Exactly, as a team. I drafted the entire framework and strategy overnight, and you presented it perfectly today. Brilliant execution.'",
          hindiText: "संप्रभु दर्पण प्रतिउत्तर (Calm Mirror): शांति से मुस्कुराएं और कहें: 'बिल्कुल सही, टीम की तरह। मैंने रातभर जागकर इस रणनीति और ढांचे को तैयार किया, और आपने आज इसे बहुत सुंदर ढंग से पेश किया। बेहतरीन प्रस्तुति!'",
          isSovereign: true,
          feedback: "Sovereign mastery. You reclaimed 100% of the authorship with absolute poise, while sounding like an elite team player. They cannot argue, and everyone knows you created it.",
          hindiFeedback: "पूर्ण मानसिक विजय। आपने अत्यंत सम्मानजनक और शांत तरीके से पूरा श्रेय वापस ले लिया। वे आपकी बात का खंडन नहीं कर सकते और सबको पता चल गया कि निर्माता आप हैं।",
          countermeasure: "Framing Dominance / फ्रेमिंग संप्रभुता",
          hindiCountermeasure: "बिना गुस्साए अपनी बात को इस तरह से फ्रेम करना कि सच उजागर हो जाए और आपकी परिपक्वता दिखे।"
        },
        {
          text: "Submit silently: Smile, nod, and let them take the credit to avoid any conflict.",
          hindiText: "चुपचाप स्वीकार करना: विवाद से बचने के लिए मुस्कुराकर चुप रहना और उन्हें पूरा श्रेय लेने देना।",
          isSovereign: false,
          feedback: "Submission training. By accepting this behavior, you train the manipulator to exploit you repeatedly. Silence is interpreted as consent.",
          hindiFeedback: "कमजोरी का प्रमाण। इस व्यवहार को स्वीकार करके, आप शोषक को बार-बार आपका शोषण करने का प्रशिक्षण दे रहे हैं।",
          countermeasure: "Submission Response / समर्पण प्रतिक्रिया",
          hindiCountermeasure: "विवाद से न डरें; कूटनीतिक रूप से अपनी सीमाओं की रक्षा करें।"
        }
      ]
    },
    {
      id: "dopamine_scroll",
      title: "The Midnight Dopamine Trap / रात का स्क्रॉलिंग चक्र",
      hindiTitle: "आधी रात का अंतहीन स्क्रॉलिंग जाल",
      description: "It is 23:30. You are tired and planning to sleep. Suddenly, a notification pops up with a sensational title matching your exact interest, promising a 'mind-blowing reveal'. You feel a strong biological urge to click.",
      hindiDescription: "रात के ११:३० बज रहे हैं। आप थके हुए हैं और सोने की योजना बना रहे हैं। अचानक, एक सनसनीखेज शीर्षक वाला नोटिफिकेशन आता है जो आपके शौक से मेल खाता है। आपको क्लिक करने की तीव्र इच्छा महसूस होती है।",
      options: [
        {
          text: "Just watch for 5 minutes: You promise yourself to only read/watch for a few minutes.",
          hindiText: "सिर्फ ५ मिनट देखना: खुद से वादा करना कि आप केवल कुछ मिनट देखेंगे और फिर सो जाएंगे।",
          isSovereign: false,
          feedback: "The algorithm is built by elite psychologists to bypass your willpower. 5 minutes inevitably turns into 2 hours, crushing your next day's cortisol and focus.",
          hindiFeedback: "एल्गोरिदम आपके आत्म-नियंत्रण को तोड़ने के लिए डिज़ाइन किया गया है। ५ मिनट अनिवार्य रूप से २ घंटे में बदल जाएंगे, जो अगले दिन के फोकस को नष्ट कर देंगे।",
          countermeasure: "Bait Compliance / चारे का शिकार",
          hindiCountermeasure: "कभी भी एल्गोरिदम की बुद्धिमत्ता को कम मत समझो। जाल में पैर न रखें।"
        },
        {
          text: "Sovereign Zero-Dopamine Wall: Lock the device, move it to another room, close your eyes, and apply deep circular breathing. Acknowledge the urge as 'algorithmic engineering' and consciously disconnect.",
          hindiText: "शून्य-डोपामाइन दीवार (Hard Disconnect): तुरंत फोन लॉक करें, इसे दूसरे कमरे में रखें, आँखें बंद करें और गहरी साँस लें। इस इच्छा को 'अल्गोरिद्म का हमला' मानकर खुद को अलग करें।",
          isSovereign: true,
          feedback: "Masterful discipline. You recognized the urge not as yours, but as a simulated trigger. By physically isolating the device, you maintained absolute biological sovereignty.",
          hindiFeedback: "अद्भुत अनुशासन। आपने महसूस किया कि यह इच्छा आपकी नहीं बल्कि एक बाहरी कृत्रिम ट्रिगर थी। भौतिक दूरी बनाकर आपने अपनी स्वायत्तता की रक्षा की।",
          countermeasure: "Algorithmic Immunity / एल्गोरिथम सुरक्षा कवच",
          hindiCountermeasure: "डिजिटल प्रलोभनों पर तत्काल भौतिक नियंत्रण और मानसिक दूरी।"
        }
      ]
    },
    {
      id: "peer_pressure",
      title: "The Social Mockery Test / साथियों का उपहास परीक्षण",
      hindiTitle: "मित्रों का दबाव और उपहास",
      description: "At a gathering, your childhood friends notice you are avoiding social media, waking up early, and focusing heavily on books. They laugh, calling you a 'pseudo-intellectual' or 'boring sadhu' and force you to download the trendiest short-video app.",
      hindiDescription: "एक सभा में, आपके बचपन के दोस्त ध्यान देते हैं कि आप सोशल मीडिया से बच रहे हैं, जल्दी उठ रहे हैं, और किताबों पर ध्यान केंद्रित कर रहे हैं। वे हंसते हुए आपको 'साधु' या 'बोरिंग' कहते हैं और आपको नया ट्रेंडिंग ऐप डाउनलोड करने के लिए मजबूर करते हैं।",
      options: [
        {
          text: "Apologetically explain yourself: Try to logically convince them about self-improvement and mental training.",
          hindiText: "सफाई देना: उन्हें आत्म-सुधार और मानसिक प्रशिक्षण के फायदों के बारे में समझाने की कोशिश करना।",
          isSovereign: false,
          feedback: "Explaining yourself validates their frame. It puts you in a subordinate position seeking their permission or approval for your personal choices.",
          hindiFeedback: "सफाई देने से उनका दृष्टिकोण मजबूत होता है। यह आपको उनके अधीन खड़ा करता है जहाँ आप अपने व्यक्तिगत निर्णयों के लिए उनकी स्वीकृति मांग रहे हैं।",
          countermeasure: "Validation Trap / स्पष्टीकरण जाल",
          hindiCountermeasure: "अपनी जीवनशैली के लिए कभी किसी को स्पष्टीकरण न दें।"
        },
        {
          text: "Humorous Unshakability: Smile comfortably, laugh with them, and say: 'Yes, I am training to become a high-performance boring sadhu. It works wonders.' Continue with your stance without downloading anything.",
          hindiText: "अडिग हास्य प्रतिउत्तर (Amused Unshakability): शांति से मुस्कुराएं, उनके साथ हंसें और कहें: 'हाँ यार, मैं एक अत्यधिक अनुशासित साधु बनने की ट्रेनिंग ले रहा हूँ। इसके नतीजे कमाल के हैं।' बिना कुछ डाउनलोड किए शांत रहें।",
          isSovereign: true,
          feedback: "Incredible resilience. By agreeing with the label and amplifying it with humor, you completely neutralize their mockery. They cannot trigger you, and you maintain absolute boundary sovereignty.",
          hindiFeedback: "अद्वितीय मानसिक शक्ति। उनके उपहास को अपने हास्य में मिला देने से उनका वार खाली चला जाता है। वे आपको उत्तेजित नहीं कर सकते, और आपकी सीमाएं अडिग रहती हैं।",
          countermeasure: "Amused Non-Reactivity / गैर-प्रतिक्रियाशील हास्य",
          hindiCountermeasure: "कटाक्ष और तानों को सहज स्वीकार कर उन्हें शक्तिहीन कर देना।"
        }
      ]
    },
    {
      id: "guilt_trip",
      title: "The Guilt-Trip Anchor / भावनात्मक ब्लैकमेल",
      hindiTitle: "अपराध बोध और भावनात्मक दबाव",
      description: "A close friend or relative messages you saying: 'You have changed completely. You don't care about us anymore. All you care about is your strict routine, your work, and your books. You are becoming extremely selfish.' They are demanding you break your scheduled routine to spend hours gossiping with them.",
      hindiDescription: "एक करीबी रिश्तेदार या मित्र आपको संदेश भेजता है: 'तुम बिल्कुल बदल गए हो। तुम्हें अब हमारी कोई परवाह नहीं है। तुम्हें सिर्फ अपनी दिनचर्या, काम और किताबों से मतलब है। तुम स्वार्थी हो रहे हो।' वे चाहते हैं कि आप अपनी दिनचर्या तोड़कर उनके साथ घंटों फालतू गप्पें मारें।",
      options: [
        {
          text: "Break routine out of guilt: Immediately cancel your evening learning slot and meet them to prove that you are still a caring and good person.",
          hindiText: "गिल्ट में आकर रूटीन तोड़ना: तुरंत अपनी शाम के अध्ययन और ध्यान का समय रद्द करें और यह साबित करने के लिए उनसे मिलें कि आप अभी भी अच्छे इंसान हैं।",
          isSovereign: false,
          feedback: "Guilt compliance. You prioritized temporary external validation over long-term strategic evolution. They now know guilt is your emotional off-switch.",
          hindiFeedback: "भावनात्मक रूप से कमजोर निर्णय। आपने दीर्घकालिक विकास के ऊपर क्षणिक बाहरी प्रमाण को प्राथमिकता दी। अब उन्हें पता चल गया है कि 'अपराध बोध' आपका कमजोर बिंदु है।",
          countermeasure: "Guilt Compliance Trap / गिल्ट समर्पण जाल",
          hindiCountermeasure: "अपराध बोध के आगे कभी समर्पण न करें; यह एक क्लासिक हेरफेर है।"
        },
        {
          text: "Sovereign Poise & Kind Boundary: Reply calmly: 'I understand you feel that way. My routine is non-negotiable because it allows me to bring my absolute best energy to everyone, including you. Let us plan a structured meeting this weekend when I am fully free.'",
          hindiText: "संप्रभु सौम्य सीमा (Poised Boundary): शांत भाव से जवाब दें: 'मैं समझता हूँ कि तुम्हें ऐसा लग रहा है। मेरी दिनचर्या अटल है क्योंकि यह मुझे तुम जैसे मेरे प्रियजनों के लिए सबसे ऊर्जावान और श्रेष्ठ स्वरूप में रहने की शक्ति देती है। हम इस वीकेंड पर शांति से मिलते हैं।'",
          isSovereign: true,
          feedback: "Perfect boundary defense. You validated their emotions without absorbing their projection. You maintained control over your time while showing respectful firmness.",
          hindiFeedback: "अचूक सीमा निर्धारण। आपने उनके गुस्से को स्वीकार किया लेकिन उनके प्रभाव को खुद पर हावी नहीं होने दिया। सम्मानजनक दृढ़ता दिखाते हुए अपने समय का नियंत्रण हाथ में रखा।",
          countermeasure: "Non-Reactive Boundary / गैर-प्रतिक्रियाशील सीमा निर्धारण",
          hindiCountermeasure: "दूसरों की भावनाओं का आदर करें, परंतु अपने स्वाध्याय व लक्ष्यों की सीमा को अभेद्य रखें।"
        },
        {
          text: "Hostile counter-attack: Fire back aggressively, calling them toxic, demanding, and accusing them of holding you back from achieving greatness.",
          hindiText: "आक्रामक पलटवार: गुस्से में आकर उन्हें जहरीला (toxic) कहना और आरोप लगाना कि वे आपकी सफलता के बीच में आ रहे हैं।",
          isSovereign: false,
          feedback: "Defensive aggression. Anger reveals that their words pierced your ego. By counter-attacking, you start a messy emotional war that drains your strategic bandwidth.",
          hindiFeedback: "आक्रामक कमजोरी। गुस्सा दिखाता है कि उनकी बात सीधे आपके अहंकार पर लगी। पलटवार करके, आप एक ऐसी मानसिक लड़ाई शुरू कर रहे हैं जो आपकी कीमती ऊर्जा को सोख लेगी।",
          countermeasure: "Ego Reactivity Trap / अहंकार प्रतिक्रिया जाल",
          hindiCountermeasure: "बिना उत्तेजित हुए कूटनीतिक रूप से अपनी सीमाओं पर अड़े रहें।"
        }
      ]
    },
    {
      id: "interrupting_bully",
      title: "The Interrupting Bully / बातचीत रोकने वाला",
      hindiTitle: "वार्तालाप में दखल और प्रभुत्व",
      description: "During an important team project review, an aggressive colleague constantly cuts you off mid-sentence, speaking over you with a louder voice to make your contributions seem insignificant.",
      hindiDescription: "एक महत्वपूर्ण टीम प्रोजेक्ट रिव्यू के दौरान, एक आक्रामक सहयोगी बार-बार आपकी बात को बीच में ही काट देता है, और अधिक तेज़ आवाज़ में बोलकर आपकी बात को तुच्छ साबित करने का प्रयास करता है।",
      options: [
        {
          text: "Submit and retreat: Stop speaking immediately, look down, and let them take over the floor while feeling resentful.",
          hindiText: "चुपचाप पीछे हटना: तुरंत बोलना बंद कर देना, नीचे देखना और मन में गुस्सा दबाकर उन्हें बोलने देना।",
          isSovereign: false,
          feedback: "Social submission. By retreating, you validate their dominance and signal to the entire room that you can be easily spoken over and marginalized.",
          hindiFeedback: "सामाजिक समर्पण। पीछे हटने से, आप उनके प्रभुत्व को स्वीकार करते हैं और पूरे कमरे को संकेत देते हैं कि आपको आसानी से दबाया जा सकता है।",
          countermeasure: "Submissive Retreat / मूक पीछे हटना",
          hindiCountermeasure: "अपनी बात को खत्म करने के अधिकार के लिए हमेशा कूटनीतिक रूप से डटे रहें।"
        },
        {
          text: "Sovereign Tempo Guard: Do not stop speaking immediately. Maintain direct eye contact, raise your palm slightly, and with a slow, calm, but rock-solid voice say: 'I will finish this point, and then I would love to hear your full perspective. As I was saying...' and continue with absolute calm.",
          hindiText: "संप्रभु गति रक्षक (Tempo Guard): तुरंत चुप न हों। सीधा आई-कांटेक्ट बनाएं, अपना हाथ थोड़ा ऊपर उठाएं और धीमी, शांत पर फौलादी आवाज में कहें: 'मैं इस पॉइंट को खत्म करूँगा, फिर मैं आपके विचार सुनना चाहूँगा। जैसा कि मैं कह रहा था...' और पूर्ण शांत मन से अपनी बात पूरी करें।",
          isSovereign: true,
          feedback: "Elite communication. You neutralized the interruption not with volume, but with structural authority. Keeping your voice calm and steady demonstrates ultimate social confidence.",
          hindiFeedback: "अद्भुत संचार कौशल। आपने आवाज़ के स्तर से नहीं बल्कि ढांचागत अधिकार से उनके दखल को निष्प्रभावी कर दिया। अपनी आवाज़ को धीमा और गहरा रखना परम आत्मविश्वास की पहचान है।",
          countermeasure: "Tempo and Cadence Control / गति और स्वर नियंत्रण",
          hindiCountermeasure: "सामने वाले के शोर पर अपनी शांत व स्थिर बातचीत की लय से विजय प्राप्त करें।"
        },
        {
          text: "Aggressive shout-back: Speak louder to compete with their voice, shouting: 'Will you let me speak for once! You always do this!'",
          hindiText: "आक्रामक शोर मचाना: उनकी आवाज़ से मुकाबला करने के लिए तेज़ चिल्लाना: 'क्या तुम मुझे एक बार बोलने दोगे! तुम हमेशा ऐसा करते हो!'",
          isSovereign: false,
          feedback: "Emotional noise. Shouting makes you look out of control and overly sensitive. The room senses your frustration, which lowers your executive aura.",
          hindiFeedback: "भावनात्मक शोर। चिल्लाने से आप अनियंत्रित और अत्यधिक संवेदनशील दिखते हैं। सभा आपके मानसिक विचलित होने को भांप लेती है, जिससे आपका सम्मान कम होता है।",
          countermeasure: "Emotional Rivalry Trap / भावनात्मक प्रतिद्वंद्विता जाल",
          hindiCountermeasure: "प्रतिद्वंद्विता में न उतरें; नियंत्रण और अधिकार हमेशा शांत स्थिरता से आते हैं।"
        }
      ]
    },
    {
      id: "ego_flattery",
      title: "The Bait of Flattery / झूठी प्रशंसा का जाल",
      hindiTitle: "अहंकार और चापलूसी का चारा",
      description: "An acquaintance who rarely contacts you suddenly calls, showers you with extreme compliments, calling you 'the most brilliant and capable mind I know,' and immediately requests you to lend them a large sum of money with no clear guarantee.",
      hindiDescription: "एक परिचित जो आपसे शायद ही कभी संपर्क करता है, अचानक आपको फोन करता है और आपकी अत्यधिक तारीफ करता है, आपको 'मेरा सबसे बुद्धिमान और सक्षम दोस्त' बताता है, और तुरंत बिना किसी स्पष्ट गारंटी के बड़ी रकम उधार मांग लेता है।",
      options: [
        {
          text: "Sovereign Ego Immunity: Smile warmly, thank them for the compliment, and say with relaxed ease: 'I appreciate your trust. However, I have a firm policy against mixing money with personal relationships. I wish you the best with your search.'",
          hindiText: "संप्रभु अहंकार प्रतिरक्षा (Ego Immunity): मुस्कुराएं, तारीफ के लिए धन्यवाद दें और बिना किसी हिचकिचाहट के कहें: 'आपके विश्वास की सराहना करता हूँ। लेकिन रिश्तों में पैसे का लेन-देन न करने की मेरी एक अटूट व्यक्तिगत नीति है। मुझे उम्मीद है आपको सही मदद मिल जाएगी।'",
          isSovereign: true,
          feedback: "Incredible emotional strength. You remained completely detached from the superficial flattery and protected your financial boundary without showing any awkwardness or guilt.",
          hindiFeedback: "अतुल्य मानसिक संतुलन। आप झूठी चापलूसी से पूरी तरह अप्रभावित रहे और बिना किसी हिचकिचाहट या हीन भावना के अपनी वित्तीय सीमाओं की रक्षा की।",
          countermeasure: "Ego Detachment Strategy / निरपेक्ष अहंकार रक्षक",
          hindiCountermeasure: "चापलूसी के चारे को पहचानकर अपने सिद्धांतों पर अडिग रहें।"
        },
        {
          text: "Agree due to flattery: Feel proud and flattered. To maintain the prestige of being 'brilliant and capable', you agree to lend them the money immediately despite your personal hesitation.",
          hindiText: "प्रशंसा में आकर पैसे देना: खुद पर गर्व महसूस करना और अपनी 'बुद्धिमान व सक्षम' छवि बनाए रखने के लिए बिना सोचे-समझे तुरंत पैसे उधार देने को तैयार हो जाना।",
          isSovereign: false,
          feedback: "Ego baiting success. The manipulator fed your ego a cheap crumb of validation, and in exchange, they extracted your hard-earned physical resources.",
          hindiFeedback: "अहंकार जाल का शिकार। चाटुकार ने आपके अहंकार को तारीफ का एक छोटा टुकड़ा खिलाया, और बदले में आपके कड़े परिश्रम से अर्जित संसाधनों को हड़प लिया।",
          countermeasure: "Ego Bait Vulnerability / अहंकार चारा कमजोरी",
          hindiCountermeasure: "बाहरी प्रशंसा को कभी अपनी वास्तविक ताकत या निर्णयों का आधार न बनने दें।"
        }
      ]
    }
  ];

  // Respiration Loop
  useEffect(() => {
    if (isBreathingActive) {
      setBreathTimer(selectedBreathProtocol.inhale);
      setBreathPhase('inhale');
      
      breathIntervalRef.current = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            let nextPhase: 'inhale' | 'hold-in' | 'exhale' | 'hold-out' = 'inhale';
            setBreathPhase((currentPhase) => {
              switch (currentPhase) {
                case 'inhale': 
                  if (selectedBreathProtocol.holdIn > 0) {
                    nextPhase = 'hold-in';
                    return 'hold-in';
                  } else {
                    nextPhase = 'exhale';
                    return 'exhale';
                  }
                case 'hold-in': 
                  nextPhase = 'exhale';
                  return 'exhale';
                case 'exhale': 
                  if (selectedBreathProtocol.holdOut > 0) {
                    nextPhase = 'hold-out';
                    return 'hold-out';
                  } else {
                    nextPhase = 'inhale';
                    return 'inhale';
                  }
                case 'hold-out': 
                  nextPhase = 'inhale';
                  return 'inhale';
                default: 
                  nextPhase = 'inhale';
                  return 'inhale';
              }
            });
            
            // Get duration for the next phase
            setTimeout(() => {
              // small safety offset
            }, 0);
            
            if (nextPhase === 'inhale') return selectedBreathProtocol.inhale;
            if (nextPhase === 'hold-in') return selectedBreathProtocol.holdIn;
            if (nextPhase === 'exhale') return selectedBreathProtocol.exhale;
            return selectedBreathProtocol.holdOut;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathIntervalRef.current) {
        clearInterval(breathIntervalRef.current);
      }
    }

    return () => {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, [isBreathingActive, selectedBreathProtocol]);

  // Handle Binaural Tone Generation
  const startBinauralBeats = () => {
    try {
      // 1. Audio Context Initialization
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        alert("Web Audio API is not supported in this browser.");
        return;
      }

      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      // 2. Nodes setup
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(audioVolume, ctx.currentTime);
      masterGainRef.current = masterGain;

      // Connect master gain to analyzer for wave visualizer!
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      // Left Channel
      const leftOsc = ctx.createOscillator();
      const leftPanner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const leftGain = ctx.createGain();
      
      leftOsc.type = 'sine';
      // 8Hz difference for alpha waves stimulation (carrierFreq - 4Hz offset)
      leftOsc.frequency.setValueAtTime(carrierFreq - 4, ctx.currentTime);
      leftGain.gain.setValueAtTime(0.5, ctx.currentTime);

      if (leftPanner) {
        leftPanner.pan.setValueAtTime(-1, ctx.currentTime);
        leftOsc.connect(leftGain).connect(leftPanner).connect(masterGain);
      } else {
        leftOsc.connect(leftGain).connect(masterGain);
      }

      // Right Channel
      const rightOsc = ctx.createOscillator();
      const rightPanner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const rightGain = ctx.createGain();

      rightOsc.type = 'sine';
      // carrierFreq + 4Hz offset
      rightOsc.frequency.setValueAtTime(carrierFreq + 4, ctx.currentTime);
      rightGain.gain.setValueAtTime(0.5, ctx.currentTime);

      if (rightPanner) {
        rightPanner.pan.setValueAtTime(1, ctx.currentTime);
        rightOsc.connect(rightGain).connect(rightPanner).connect(masterGain);
      } else {
        rightOsc.connect(rightGain).connect(masterGain);
      }

      // Start oscillators
      leftOsc.start();
      rightOsc.start();

      leftOscRef.current = leftOsc;
      rightOscRef.current = rightOsc;
      leftGainRef.current = leftGain;
      rightGainRef.current = rightGain;

      setIsPlayingAudio(true);
      setIsBreathingActive(true); // Automatically sync breathing visual with binaural audio!
      
      // Start real-time wave drawing
      setTimeout(() => {
        drawVisualizer();
      }, 50);
    } catch (e) {
      console.error("Failed to play binaural focus frequencies:", e);
    }
  };

  const stopBinauralBeats = () => {
    try {
      if (leftOscRef.current) {
        leftOscRef.current.stop();
        leftOscRef.current.disconnect();
      }
      if (rightOscRef.current) {
        rightOscRef.current.stop();
        rightOscRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      leftOscRef.current = null;
      rightOscRef.current = null;
      audioCtxRef.current = null;
      analyserRef.current = null;
      setIsPlayingAudio(false);
      setIsBreathingActive(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Adjust volume dynamically
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(audioVolume, audioCtxRef.current.currentTime);
    }
  }, [audioVolume]);

  // Adjust carrier frequency dynamically
  useEffect(() => {
    if (isPlayingAudio && leftOscRef.current && rightOscRef.current && audioCtxRef.current) {
      leftOscRef.current.frequency.setValueAtTime(carrierFreq - 4, audioCtxRef.current.currentTime);
      rightOscRef.current.frequency.setValueAtTime(carrierFreq + 4, audioCtxRef.current.currentTime);
    }
  }, [carrierFreq, isPlayingAudio]);

  // Live Canvas Wave Visualizer drawing function
  const drawVisualizer = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const draw = () => {
      if (!canvasRef.current) return;
      animationFrameRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;
      ctx2d.fillStyle = 'rgba(9, 9, 11, 0.2)'; // Fading trail
      ctx2d.fillRect(0, 0, width, height);

      ctx2d.lineWidth = 2;
      ctx2d.strokeStyle = 'rgba(245, 158, 11, 0.8)'; // Amber path

      if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteTimeDomainData(dataArray);

        ctx2d.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx2d.moveTo(x, y);
          } else {
            ctx2d.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx2d.lineTo(width, height / 2);
        ctx2d.stroke();

        // Draw center pulse circle
        const avgAmplitude = Math.abs(dataArray[0] - 128);
        ctx2d.fillStyle = `rgba(245, 158, 11, ${0.03 + avgAmplitude * 0.02})`;
        ctx2d.beginPath();
        ctx2d.arc(width / 2, height / 2, 40 + avgAmplitude * 2, 0, 2 * Math.PI);
        ctx2d.fill();
      } else {
        // Simulated beautiful resting sine wave when audio is idle but breathing is active
        ctx2d.beginPath();
        const time = Date.now() * 0.003;
        const amplitude = isBreathingActive 
          ? (breathPhase === 'inhale' ? 15 : breathPhase === 'exhale' ? 10 : 3)
          : 5;
        const speed = isBreathingActive ? 1.5 : 0.5;

        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.02 + time * speed) * amplitude;
          if (x === 0) {
            ctx2d.moveTo(x, y);
          } else {
            ctx2d.lineTo(x, y);
          }
        }
        ctx2d.stroke();
      }
    };

    draw();
  };

  // Start visualizer on mount or when tab becomes binaural
  useEffect(() => {
    if (activeSubTab === 'binaural') {
      setTimeout(() => {
        drawVisualizer();
      }, 100);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeSubTab]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (leftOscRef.current || rightOscRef.current) {
        stopBinauralBeats();
      }
    };
  }, []);

  // Claim Scenario XP
  const claimScenarioXp = async (scenarioId: string) => {
    if (completedScenarios.includes(scenarioId)) return;
    setXpClaimLoading(true);
    try {
      await onXpEarned(50, `Completed cognitive defense simulator scenario: ${scenarioId}`);
      const updated = [...completedScenarios, scenarioId];
      setCompletedScenarios(updated);
      localStorage.setItem('t2s_completed_scenarios', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    } finally {
      setXpClaimLoading(false);
    }
  };

  // Claim Daily Audit XP
  const claimAuditXp = async () => {
    if (isAuditSubmitted) return;
    setXpClaimLoading(true);
    try {
      await onXpEarned(50, "Completed Daily Dopamine & Focus Self-Audit");
      const today = new Date().toDateString();
      localStorage.setItem('t2s_last_audit_date', today);
      setIsAuditSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setXpClaimLoading(false);
    }
  };

  // -----------------------------
  // FOCUS ATTENTION GAME LOGIC (Stroop Effect Challenge)
  // -----------------------------
  const generateFocusTurn = () => {
    const randomWord = TEST_WORDS[Math.floor(Math.random() * TEST_WORDS.length)];
    // Random color (sometimes matches, mostly doesn't)
    const randomColor = TEST_COLORS[Math.floor(Math.random() * TEST_COLORS.length)];
    setFocusWord(randomWord);
    setFocusColor(randomColor);
    setFocusTurnStartTime(Date.now());
  };

  const startFocusTest = () => {
    setFocusScore(0);
    setFocusAttempts(0);
    setFocusTimeLeft(20);
    setFocusReactionTimes([]);
    setFocusGameState('playing');
    generateFocusTurn();
  };

  // Timer loop for Focus game
  useEffect(() => {
    let timer: any;
    if (focusGameState === 'playing') {
      timer = setInterval(() => {
        setFocusTimeLeft((prev) => {
          if (prev <= 1) {
            setFocusGameState('ended');
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [focusGameState]);

  const handleFocusAnswer = (clickedHex: string) => {
    if (focusGameState !== 'playing') return;

    const reactionTime = Date.now() - focusTurnStartTime;
    setFocusReactionTimes(prev => [...prev, reactionTime]);

    const isCorrect = clickedHex === focusColor.hex;
    if (isCorrect) {
      setFocusScore(prev => prev + 1);
    }
    setFocusAttempts(prev => prev + 1);
    generateFocusTurn();
  };

  const claimFocusTestXp = async () => {
    if (isFocusXpClaimedToday || focusScore < 12) return;
    setXpClaimLoading(true);
    try {
      await onXpEarned(50, `Aced Attention Focus Challenge with Score ${focusScore}/${focusAttempts}`);
      const today = new Date().toDateString();
      localStorage.setItem('t2s_last_focus_test_date', today);
      setIsFocusXpClaimedToday(true);
    } catch (err) {
      console.error(err);
    } finally {
      setXpClaimLoading(false);
    }
  };

  const averageReactionTime = focusReactionTimes.length > 0
    ? Math.round(focusReactionTimes.reduce((a, b) => a + b, 0) / focusReactionTimes.length)
    : 0;

  const focusAccuracy = focusAttempts > 0 
    ? Math.round((focusScore / focusAttempts) * 100) 
    : 0;

  const isFocusPassed = focusScore >= 12 && focusAccuracy >= 80;

  // Calculated Audit Score
  const calculateAuditScore = () => {
    let score = 0;
    if (auditScores.notificationsOff) score += 20;
    if (auditScores.noEndlessScroll) score += 25;
    if (auditScores.readBooks) score += 20;
    if (auditScores.resistedSugar) score += 15;
    if (auditScores.focusedWork) score += 20;
    return score;
  };

  const getAuditRating = (score: number) => {
    if (score === 100) return { label: 'Absolute Sovereign / सर्वशक्तिशाली', color: 'text-amber-400 border-amber-500/30 bg-amber-500/5' };
    if (score >= 70) return { label: 'Discipline Shield Active / अनुशासित योद्धा', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' };
    if (score >= 40) return { label: 'Pawn in Struggle / संघर्षरत प्यादा', color: 'text-blue-400 border-blue-500/30 bg-blue-500/5' };
    return { label: 'Asleep / मानसिक रूप से सुप्त', color: 'text-red-400 border-red-500/30 bg-red-500/5' };
  };

  const auditScore = calculateAuditScore();
  const auditRating = getAuditRating(auditScore);

  return (
    <div className="space-y-12">
      {/* Premium Header Accent */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-zinc-850 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono font-black uppercase tracking-widest text-amber-400 rounded-full">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> SOVEREIGN TRAINING GROUND / रणनीतिशाला
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-tight uppercase">
            Sovereign Mind Lab
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-xl font-medium">
            Train attention, optimize cognitive rhythms using binaural carrier waves, test psychological defense matrices, and audit daily willpower.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap bg-zinc-950/80 p-1.5 border border-zinc-800 rounded-2xl self-start md:self-center gap-1">
          {[
            { id: 'binaural', label: 'Binaural Focus', hin: 'एकाग्रता तरंगें' },
            { id: 'combat', label: 'Combat Arena', hin: 'मनोवैज्ञानिक रक्षा' },
            { id: 'focustest', label: 'Focus Test', hin: 'एकाग्रता परीक्षण' },
            { id: 'audit', label: 'Self Audit', hin: 'आत्म-निरीक्षण' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center ${
                activeSubTab === tab.id 
                  ? 'bg-amber-500 text-black shadow-lg font-black' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[8px] font-semibold tracking-normal lowercase ${activeSubTab === tab.id ? 'text-black/70' : 'text-zinc-500'}`}>
                {tab.hin}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SUB-TAB CONTENTS */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: Binaural Solfeggio Respiration Tuner */}
        {activeSubTab === 'binaural' && (
          <motion.div
            key="binaural"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          >
            {/* Interactive Respiration Expander (Visualizer) */}
            <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-[32px] p-6 sm:p-8 flex flex-col items-center justify-between relative overflow-hidden space-y-6 min-h-[460px]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              
              <div className="text-center space-y-1 w-full">
                <span className="text-[10px] font-mono font-black uppercase text-amber-500 tracking-widest block">
                  Rhythmic Ingress-Hold-Egress Tuner / श्वसन प्रवाह
                </span>
                <h3 className="text-xl font-bold uppercase text-white">Sovereign Respiration Guide</h3>
                
                {/* Ratios Display */}
                <span className="inline-block mt-1 text-[10px] font-mono bg-white/5 border border-white/10 text-zinc-400 px-3 py-1 rounded-full uppercase tracking-wider">
                  Active Ratio: {selectedBreathProtocol.inhale}s Inhale · {selectedBreathProtocol.holdIn}s Hold · {selectedBreathProtocol.exhale}s Exhale · {selectedBreathProtocol.holdOut}s Hold
                </span>
              </div>

              {/* Glowing Interactive Circle & Canvas Wave Behind */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Dynamic Oscilloscope Background */}
                <canvas 
                  ref={canvasRef} 
                  width={250} 
                  height={250} 
                  className="absolute inset-0 rounded-full bg-zinc-950/20 border border-zinc-800/40 opacity-70 pointer-events-none"
                />

                {/* Animated Inner Core Circle */}
                <motion.div
                  animate={{
                    scale: !isBreathingActive 
                      ? 1 
                      : breathPhase === 'inhale' 
                        ? [1, 1.35] 
                        : breathPhase === 'hold-in' 
                          ? 1.35 
                          : breathPhase === 'exhale' 
                            ? [1.35, 1] 
                            : 1,
                  }}
                  transition={{
                    duration: breathPhase === 'inhale' ? selectedBreathProtocol.inhale : breathPhase === 'exhale' ? selectedBreathProtocol.exhale : breathPhase === 'hold-in' ? selectedBreathProtocol.holdIn : selectedBreathProtocol.holdOut,
                    ease: "easeInOut"
                  }}
                  className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-2 shadow-2xl transition-all duration-500 relative z-10 ${
                    !isBreathingActive 
                      ? 'border-zinc-750 bg-zinc-950/90 text-zinc-400' 
                      : breathPhase === 'inhale'
                        ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-400 shadow-emerald-500/10'
                        : breathPhase === 'hold-in'
                          ? 'border-amber-500/60 bg-amber-950/40 text-amber-400 shadow-amber-500/10'
                          : breathPhase === 'exhale'
                            ? 'border-blue-500/60 bg-blue-950/40 text-blue-400 shadow-blue-500/10'
                            : 'border-purple-500/60 bg-purple-950/40 text-purple-400 shadow-purple-500/10'
                  }`}
                >
                  <span className="text-3xl font-black font-mono tracking-tight block">
                    {!isBreathingActive ? 'IDLE' : `${breathTimer}s`}
                  </span>
                  
                  <span className="text-[10px] font-black uppercase tracking-wider mt-1 text-center font-mono">
                    {!isBreathingActive ? 'Click Play' : 
                      breathPhase === 'inhale' ? 'INHALE / सांस लें' :
                      breathPhase === 'hold-in' ? 'HOLD / सांस रोकें' :
                      breathPhase === 'exhale' ? 'EXHALE / सांस छोड़ें' :
                      'HOLD / रोकें रखें'
                    }
                  </span>
                </motion.div>
              </div>

              {/* Dynamic Respiration Status Subtext */}
              <p className="text-zinc-400 text-xs sm:text-sm text-center max-w-sm font-medium italic min-h-[40px] px-4">
                {!isBreathingActive 
                  ? "Activate Solfeggio Beats or the Respiration engine below to start."
                  : breathPhase === 'inhale' ? "Inhale slowly and fill your lower belly with raw oxygen." 
                  : breathPhase === 'hold-in' ? "Hold the oxygen inside. Keep your mind completely silent." 
                  : breathPhase === 'exhale' ? "Exhale carbon, digital noise, and physical anxiety completely." 
                  : "Keep lungs empty. Maintain pure empty awareness before the next cycle."}
              </p>
            </div>

            {/* Solfeggio Audio Controls */}
            <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Solfeggio Carrier Waves</h3>
                    <span className="text-[10px] text-zinc-400 block font-mono">द्विआधारी बीट्स जनरेटर</span>
                  </div>
                </div>

                <p className="text-zinc-300 text-xs leading-relaxed font-semibold">
                  Couples 8Hz alpha frequencies to sync cortical oscillations. 
                  <strong className="text-white block mt-1 font-bold">⚠️ Wear headphones for full bilateral binaural effect.</strong>
                </p>

                {/* Protocol Selector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-400 font-mono font-black uppercase tracking-widest block">Choose Breathing Ratio:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {BREATH_PROTOCOLS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedBreathProtocol(p);
                          if (isBreathingActive) {
                            setBreathTimer(p.inhale);
                            setBreathPhase('inhale');
                          }
                        }}
                        className={`p-2 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                          selectedBreathProtocol.id === p.id 
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <span className="font-bold block text-[11px] truncate">{p.name}</span>
                        <span className="text-[9px] text-zinc-500 block truncate leading-none mt-0.5">{p.hindiName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone Selector */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                  <span className="text-[10px] text-zinc-400 font-mono font-black uppercase tracking-widest block">Select Solfeggio Vibration:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { freq: 432, name: "432 Hz", desc: "Cosmic Clarity" },
                      { freq: 528, name: "528 Hz", desc: "Willpower/Sovereign" },
                      { freq: 396, name: "396 Hz", desc: "Fear Shield" },
                      { freq: 639, name: "639 Hz", desc: "Social Harmony" }
                    ].map((tone) => (
                      <button
                        key={tone.freq}
                        onClick={() => setCarrierFreq(tone.freq)}
                        className={`p-2 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                          carrierFreq === tone.freq 
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <span className="font-bold block text-[11px]">{tone.name}</span>
                        <span className="text-[9px] text-zinc-500 block leading-none mt-0.5">{tone.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic volume slider */}
                <div className="space-y-1 pt-2 border-t border-zinc-800">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 font-black">
                    <span>MASTER GAIN VOLUME</span>
                    <span>{Math.round(audioVolume * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Trigger Play/Stop */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <button
                  onClick={isPlayingAudio ? stopBinauralBeats : startBinauralBeats}
                  className={`w-full py-3.5 rounded-2xl font-mono font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                    isPlayingAudio 
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/10' 
                      : 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/10'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Square className="w-4 h-4 fill-white animate-pulse" /> Shut Down Carrier Wave / तरंगें रोकें
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-black" /> Stream Focus Waves / लहरें शुरू करें
                    </>
                  )}
                </button>
                
                {/* Backup respiration-only play button */}
                {!isPlayingAudio && (
                  <button
                    onClick={() => setIsBreathingActive(!isBreathingActive)}
                    className="w-full py-2.5 bg-zinc-950 border border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-xl font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {isBreathingActive ? "Deactivate Respiration Visuals" : "Run Breathing Guide Only"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: Cognitive Defense Combat Arena */}
        {activeSubTab === 'combat' && (
          <motion.div
            key="combat"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Interactive AI Scenario Simulator */}
            <AIScenarioSimulator onXpEarned={onXpEarned} />

            {selectedScenarioIndex === null ? (
              // Scenario list selection
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scenarios.map((scenario, idx) => {
                  const isDone = completedScenarios.includes(scenario.id);
                  return (
                    <motion.div
                      key={scenario.id}
                      whileHover={{ y: -4 }}
                      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.02] rounded-full blur-2xl group-hover:bg-amber-500/[0.05] transition-all" />
                      
                      <div className="space-y-3 relative z-10">
                        <div className="flex justify-between items-start">
                          <span className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                            <Shield className="w-5 h-5" />
                          </span>
                          {isDone ? (
                            <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-mono font-black uppercase px-2.5 py-0.5 rounded-full">
                              Completed / उत्तीर्ण
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-500/15 border border-amber-500/20 text-amber-500 font-mono font-black uppercase px-2.5 py-0.5 rounded-full">
                              +50 XP Reward
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <h3 className="text-base font-black text-white uppercase tracking-tight leading-tight">{scenario.title}</h3>
                          <span className="text-[11px] text-zinc-400 font-bold block">{scenario.hindiTitle}</span>
                        </div>

                        <p className="text-zinc-350 text-xs leading-relaxed line-clamp-3">
                          {scenario.description}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedScenarioIndex(idx);
                          setScenarioStep('intro');
                          setChosenOptionIndex(null);
                        }}
                        className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-350 hover:text-white font-mono font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        Enter Simulation / शुरू करें <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              // Active scenario simulation walkthrough
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-[32px] p-6 sm:p-10 max-w-3xl mx-auto space-y-8 relative overflow-hidden">
                
                {/* Navigation and Title */}
                <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
                  <button
                    onClick={() => setSelectedScenarioIndex(null)}
                    className="text-[10px] text-zinc-400 hover:text-white font-mono font-black uppercase tracking-widest cursor-pointer flex items-center gap-1.5"
                  >
                    ← Back to List / सूची
                  </button>
                  <span className="text-[10px] text-zinc-400 font-mono font-black uppercase tracking-widest">
                    SCENARIO {selectedScenarioIndex + 1} OF {scenarios.length}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono font-black uppercase tracking-widest text-amber-400 rounded-full">
                    🛡️ ACTIVE COGNITIVE COMBAT
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    {scenarios[selectedScenarioIndex].title}
                  </h2>
                </div>

                {/* STEP 1: Scenario Intro & Prompt */}
                {scenarioStep === 'intro' && (
                  <div className="space-y-6">
                    <div className="bg-black/50 border border-zinc-850 rounded-2xl p-5 md:p-6 space-y-4">
                      <p className="text-zinc-100 text-sm md:text-base leading-relaxed font-semibold">
                        {scenarios[selectedScenarioIndex].description}
                      </p>
                      <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-mono italic border-t border-zinc-850 pt-3">
                        {scenarios[selectedScenarioIndex].hindiDescription}
                      </p>
                    </div>

                    <button
                      onClick={() => setScenarioStep('question')}
                      className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                    >
                      Process Scenario Response / प्रतिक्रिया दें
                    </button>
                  </div>
                )}

                {/* STEP 2: Response Selection */}
                {scenarioStep === 'question' && (
                  <div className="space-y-6">
                    <span className="text-[10px] text-zinc-400 font-mono font-black uppercase tracking-widest block">Choose your tactical response:</span>
                    
                    <div className="space-y-4">
                      {scenarios[selectedScenarioIndex].options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => {
                            setChosenOptionIndex(oIdx);
                            setScenarioStep('result');
                          }}
                          className="w-full p-4 md:p-5 text-left bg-zinc-950 border border-zinc-805 hover:border-zinc-700 hover:bg-white/[0.01] rounded-2xl transition-all cursor-pointer space-y-3 flex flex-col group"
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-5 h-5 bg-zinc-900 border border-zinc-750 text-[10px] font-black font-mono rounded flex items-center justify-center text-zinc-400 group-hover:border-amber-500/40 group-hover:text-amber-400 transition-colors shrink-0 mt-0.5">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <p className="text-zinc-100 text-xs sm:text-sm font-bold group-hover:text-white transition-colors">
                              {opt.text}
                            </p>
                          </div>
                          <p className="text-zinc-400 font-mono text-[11px] leading-relaxed italic pl-8">
                            {opt.hindiText}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: Breakdown Result */}
                {scenarioStep === 'result' && chosenOptionIndex !== null && (
                  <div className="space-y-6">
                    {/* Outcome Rating Banner */}
                    {scenarios[selectedScenarioIndex].options[chosenOptionIndex].isSovereign ? (
                      <div className="bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 rounded-2xl p-5 flex items-center gap-4">
                        <span className="text-3xl">👑</span>
                        <div>
                          <span className="text-[10px] font-mono font-black uppercase tracking-widest block text-emerald-500">OUTCOME: SOVEREIGN VICTORY</span>
                          <span className="text-sm font-bold text-white">शारीरिक और मानसिक संप्रभुता कायम।</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-500/10 border-2 border-red-500/30 text-red-400 rounded-2xl p-5 flex items-center gap-4">
                        <span className="text-3xl">⚠️</span>
                        <div>
                          <span className="text-[10px] font-mono font-black uppercase tracking-widest block text-red-500">OUTCOME: CONDITIONED SUBMISSION</span>
                          <span className="text-sm font-bold text-white">आप हेरफेर के जाल में फंस गए।</span>
                        </div>
                      </div>
                    )}

                    {/* Shield Defense countermeasure breakdown */}
                    <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 md:p-6 space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                        <span className="text-[10px] text-zinc-400 font-mono font-black uppercase tracking-widest">
                          Tactical Defense Analysis
                        </span>
                        <span className="text-xs font-black text-amber-400 font-mono uppercase bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 rounded">
                          {scenarios[selectedScenarioIndex].options[chosenOptionIndex].countermeasure}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-zinc-250 text-xs sm:text-sm">
                        <p className="font-semibold">{scenarios[selectedScenarioIndex].options[chosenOptionIndex].feedback}</p>
                        <p className="text-zinc-400 font-mono italic text-[11px] sm:text-xs pt-1.5 border-t border-zinc-900/50">
                          {scenarios[selectedScenarioIndex].options[chosenOptionIndex].hindiFeedback}
                        </p>
                      </div>
                    </div>

                    {/* XP claim trigger */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      {scenarios[selectedScenarioIndex].options[chosenOptionIndex].isSovereign && !completedScenarios.includes(scenarios[selectedScenarioIndex].id) ? (
                        <button
                          disabled={xpClaimLoading}
                          onClick={() => claimScenarioXp(scenarios[selectedScenarioIndex].id)}
                          className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                        >
                          <Trophy className="w-4 h-4" /> 
                          {xpClaimLoading ? "Ascending..." : "Claim +50 XP Reward / पुरस्कार प्राप्त करें"}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (!scenarios[selectedScenarioIndex].options[chosenOptionIndex].isSovereign) {
                              // Let them retry to find the sovereign answer
                              setScenarioStep('question');
                              setChosenOptionIndex(null);
                            } else {
                              setSelectedScenarioIndex(null);
                            }
                          }}
                          className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          {!scenarios[selectedScenarioIndex].options[chosenOptionIndex].isSovereign 
                            ? "Try Again / पुनः प्रयास करें" 
                            : "Back to List / सूची"}
                        </button>
                      )}
                    </div>

                  </div>
                )}

              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: STROOP FOCUS TESTING CHIP */}
        {activeSubTab === 'focustest' && (
          <motion.div
            key="focustest"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-3xl mx-auto bg-zinc-900/60 border border-zinc-800 rounded-[32px] p-6 sm:p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 border-b border-zinc-850 pb-6 mb-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-black uppercase text-amber-500 tracking-widest block">
                  Stroop Inhibition Calibration / अवरोध प्रतिक्रिया परीक्षण
                </span>
                <h3 className="text-xl font-bold uppercase text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-500" /> Focus Inhibition Test
                </h3>
                <p className="text-zinc-400 text-xs max-w-xl">
                  Select the button of the **INK COLOR** of the displayed word, ignoring what the word reads. Tests response inhibition and prefrontal dominance.
                </p>
              </div>
              
              {isFocusXpClaimedToday ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 self-start">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Claimed Today / आज अर्जित
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 self-start">
                  <Zap className="w-3.5 h-3.5 fill-amber-500" /> +50 XP Reward (Score &gt;= 12 &amp; Acc &gt;= 80%)
                </div>
              )}
            </div>

            {focusGameState === 'idle' && (
              <div className="text-center py-12 space-y-6">
                <div className="w-20 h-20 bg-zinc-950 border border-zinc-800 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <Brain className="w-10 h-10 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-black text-white uppercase">Ready to test your attention inhibition?</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    You have exactly **20 seconds** to score as many correct hits as possible. Speed and raw accuracy matter.
                  </p>
                </div>
                <button
                  onClick={startFocusTest}
                  className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  Initiate Attention Test / शुरू करें
                </button>
              </div>
            )}

            {focusGameState === 'playing' && (
              <div className="space-y-8 py-4">
                {/* Timer & Stats header */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850">
                    <span className="text-[10px] text-zinc-500 font-mono font-black uppercase block">Time Left</span>
                    <span className="text-2xl font-black text-red-500 font-mono">{focusTimeLeft}s</span>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850">
                    <span className="text-[10px] text-zinc-500 font-mono font-black uppercase block">Correct Hits</span>
                    <span className="text-2xl font-black text-amber-500 font-mono">{focusScore} / {focusAttempts}</span>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850">
                    <span className="text-[10px] text-zinc-500 font-mono font-black uppercase block">Accuracy</span>
                    <span className="text-2xl font-black text-emerald-500 font-mono">{focusAccuracy}%</span>
                  </div>
                </div>

                {/* Stimulus Word Card */}
                <div className="bg-black/80 border border-zinc-800 rounded-3xl py-14 flex items-center justify-center relative shadow-inner overflow-hidden">
                  <span className="absolute top-3 left-4 text-[9px] font-mono font-black uppercase tracking-widest text-zinc-600">
                    FOCUS STIMULUS / उद्दीपन
                  </span>
                  
                  {/* Glowing backdrop matching font color */}
                  <div 
                    className="absolute w-44 h-44 rounded-full blur-[64px] opacity-10"
                    style={{ backgroundColor: focusColor.hex }}
                  />

                  <motion.h2 
                    key={focusWord + focusColor.hex}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl sm:text-6xl font-black tracking-widest font-sans drop-shadow-lg select-none uppercase"
                    style={{ color: focusColor.hex }}
                  >
                    {focusWord}
                  </motion.h2>
                </div>

                {/* Response Option Buttons */}
                <div className="space-y-3">
                  <span className="text-[10px] text-zinc-500 font-mono font-black uppercase tracking-widest block text-center">
                    SELECT THE INK COLOR (शब्द का रंग चुनें):
                  </span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {TEST_COLORS.map((col) => (
                      <button
                        key={col.name}
                        onClick={() => handleFocusAnswer(col.hex)}
                        className="py-3.5 bg-zinc-950 border border-zinc-800 hover:border-white/20 rounded-2xl text-xs font-black uppercase tracking-wider text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: col.hex }} />
                        {col.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {focusGameState === 'ended' && (
              <div className="space-y-8 py-4">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/25 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg mb-2">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-black text-white uppercase">Focus Calibration Complete</h4>
                  <p className="text-xs text-zinc-400">Here is your cognitive attention analysis:</p>
                </div>

                {/* Score Report Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 text-center">
                    <span className="text-[10px] text-zinc-500 font-mono font-black uppercase block">Hits Score</span>
                    <span className="text-2xl font-black text-white font-mono">{focusScore}</span>
                    <span className="text-[9px] text-zinc-500 block leading-none mt-1">correct / कुल {focusAttempts}</span>
                  </div>
                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 text-center">
                    <span className="text-[10px] text-zinc-500 font-mono font-black uppercase block">Accuracy</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">{focusAccuracy}%</span>
                    <span className="text-[9px] text-zinc-500 block leading-none mt-1">Goal: &gt;= 80%</span>
                  </div>
                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 text-center">
                    <span className="text-[10px] text-zinc-500 font-mono font-black uppercase block">Avg Response</span>
                    <span className="text-2xl font-black text-blue-400 font-mono">{averageReactionTime}ms</span>
                    <span className="text-[9px] text-zinc-500 block leading-none mt-1">reaction speed</span>
                  </div>
                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 text-center">
                    <span className="text-[10px] text-zinc-500 font-mono font-black uppercase block">Rating</span>
                    <span className="text-xs font-black text-amber-400 block mt-1.5 uppercase font-mono tracking-tight">
                      {focusScore >= 16 ? "Elite Focus" : focusScore >= 12 ? "Sovereign Focus" : focusScore >= 8 ? "Amateur" : "Conditioned Pupil"}
                    </span>
                    <span className="text-[9px] text-zinc-500 block leading-none mt-1">attention caliber</span>
                  </div>
                </div>

                {/* Reward Validation Banner */}
                {isFocusPassed ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl p-5 text-center space-y-3">
                    <p className="text-xs font-semibold">
                      🎉 **Aced!** Your cognitive inhibition met the sovereign thresholds (&gt;=12 correct answers and &gt;=80% accuracy).
                    </p>
                    
                    {!isFocusXpClaimedToday ? (
                      <button
                        disabled={xpClaimLoading}
                        onClick={claimFocusTestXp}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Zap className="w-4 h-4 fill-black" /> {xpClaimLoading ? "Syncing..." : "Claim Focus XP Reward (+50 XP)"}
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest block">
                        Today's Focus Reward claimed. Return tomorrow for focus maintenance.
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-500/15 border border-red-500/20 text-red-400 rounded-2xl p-5 text-center space-y-1">
                    <p className="text-xs font-semibold">
                      ⚠️ **Calibration Unsuccessful.** Your score did not reach the threshold (12 correct, 80% accuracy).
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Do not worry. Run the Binaural Focus beats, perform 3 minutes of Box Breathing, and re-attempt.
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={startFocusTest}
                    className="flex-1 py-3 bg-white text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" /> Recalibrate / पुनः प्रयास
                  </button>
                  <button
                    onClick={() => setFocusGameState('idle')}
                    className="flex-1 py-3 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Back / वापस जाएं
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 4: Daily Dopamine & Willpower Self-Audit */}
        {activeSubTab === 'audit' && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          >
            {/* Checklist Column */}
            <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-[32px] p-6 sm:p-10 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-black uppercase text-amber-500 tracking-widest block">
                  Discipline Calibration / आत्म-नियंत्रण अंशांकन
                </span>
                <h3 className="text-xl font-bold uppercase text-white">Daily Willpower Audit</h3>
                <p className="text-zinc-400 text-xs">
                  Review your dopamine and boundary control today. Be honest with yourself. (ईमानदारी से अपनी समीक्षा करें।)
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-800">
                {[
                  { key: 'notificationsOff', title: 'Absolute Notification Silence / संदेश मौन', desc: 'All social media notifications disabled to prevent unsolicited attention grabs.', premium: false },
                  { key: 'noEndlessScroll', title: 'Zero Algorithmic Endless Scroll / शून्य स्क्रॉलिंग', desc: 'Resisted modern video loop trap and short content feeds.', premium: false },
                  { key: 'readBooks', title: '15+ Pages Sovereign Reading / ज्ञान संचय', desc: 'Acquired wisdom from the Great Library or printed books.', premium: false },
                  { key: 'resistedSugar', title: 'Blood Glucose Guard / शर्करा नियंत्रण', desc: 'Avoided rapid high-dopamine processed sugars or dynamic spikes.', premium: false },
                  { key: 'focusedWork', title: '90-Min Focus Sprint / तीव्र एकाग्रता', desc: 'Maintained uninterrupted sovereign work/study without touching device.', premium: false }
                ].map((item) => (
                  <label
                    key={item.key}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                      (auditScores as any)[item.key]
                        ? 'bg-amber-500/5 border-amber-500/30 text-white'
                        : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:border-zinc-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={isAuditSubmitted}
                      checked={(auditScores as any)[item.key]}
                      onChange={(e) => {
                        setAuditScores(prev => ({
                          ...prev,
                          [item.key]: e.target.checked
                        }));
                      }}
                      className="mt-0.5 rounded border-zinc-800 text-amber-500 focus:ring-amber-500 bg-zinc-900 w-4.5 h-4.5 cursor-pointer disabled:opacity-50"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs sm:text-sm font-black block uppercase tracking-tight">
                        {item.title}
                      </span>
                      <p className="text-[11px] text-zinc-400 leading-tight">
                        {item.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Audit Status Card */}
            <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between space-y-8 text-center sm:text-left">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl mx-auto sm:mx-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Calibration Output</h3>
                    <span className="text-[10px] text-zinc-400 block font-mono">मानसिक अनुशासन सूचकांक</span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-800">
                  <div className="bg-zinc-950 rounded-2xl p-6 text-center space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 font-black uppercase tracking-widest block">
                      Willpower Quotient (WQ)
                    </span>
                    <span className="text-5xl font-black text-amber-400 font-mono tracking-tighter">
                      {auditScore}%
                    </span>
                  </div>

                  <div className={`border rounded-xl p-3.5 text-center ${auditRating.color}`}>
                    <span className="text-[10px] font-mono uppercase tracking-widest block font-bold">STATE RATING / स्थिति</span>
                    <span className="text-xs font-black uppercase mt-1 block">{auditRating.label}</span>
                  </div>
                </div>

                <p className="text-zinc-400 text-xs leading-relaxed font-semibold">
                  A sovereign mind completes a complete audit daily to detect and isolate micro-leakages of dopamine and energy.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-800">
                {isAuditSubmitted ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-black uppercase tracking-widest py-4 px-4 rounded-2xl flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Today's Audit Complete / सत्यापित
                  </div>
                ) : (
                  <button
                    disabled={auditScore === 0 || xpClaimLoading}
                    onClick={claimAuditXp}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                  >
                    <Zap className="w-4 h-4 fill-black" /> Claim Daily Audit (+50 XP)
                  </button>
                )}
                
                <p className="text-[10px] text-zinc-500 text-center font-semibold font-mono">
                  {isAuditSubmitted ? "Next audit unlocks tomorrow at 00:00 IST" : "Claim daily XP once you score above 0%"}
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
