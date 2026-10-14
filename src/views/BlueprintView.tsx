import React, { useState } from 'react';
import {
  Shield,
  Eye,
  Compass,
  Layers,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Volume2,
  Flame,
  Calendar,
  Sparkles,
  Lightbulb,
  HelpCircle,
  HeartHandshake,
  Brain,
  Target,
} from 'lucide-react';
import { StickFigureVisualizer } from './blueprint/StickFigureVisualizer';
import { VipSectionLockedView } from '../components/common/UiPrimitives';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSpeechSynthesis } from '../utils/speechUtils';

interface EverydayTrap {
  id: string;
  icon: string;
  titleHi: string;
  titleEn: string;
  questionHi: string;
  questionEn: string;
  mistakeHi: string;
  mistakeEn: string;
  truthHi: string;
  truthEn: string;
  actionHi: string;
  actionEn: string;
}

const EVERYDAY_TRAPS: EverydayTrap[] = [
  {
    id: 'log-kya-kahenge',
    icon: '🗣️',
    titleHi: '१. "लोग क्या कहेंगे?" का डर',
    titleEn: '1. The Fear of "What Will People Say?"',
    questionHi:
      'हम अपने सपनों से ज़्यादा पड़ोसियों और रिश्तेदारों की बातों से क्यों डरते हैं?',
    questionEn:
      'Why do we fear neighbors and relatives more than failing at our own dreams?',
    mistakeHi:
      'आम गलती: सबको खुश करने के चक्कर में अपनी पसंद, करियर और शांति कुर्बान कर देना।',
    mistakeEn:
      'Common Mistake: Sacrificing your career, peace, and choices just to keep everyone around you happy.',
    truthHi:
      'आसान सच: जो लोग आज आपकी बुराई या चर्चा कर रहे हैं, मुसीबत आने पर उनमें से कोई आपका घर चलाने नहीं आएगा। वे सिर्फ अपनी आदत से मजबूर हैं।',
    truthEn:
      'Simple Truth: The people judging you today will never pay your bills or rescue you in hard times. Their opinions last only 5 minutes.',
    actionHi:
      'आज क्या करें: कोई भी बड़ा फैसला लेते समय खुद से पूछें—"इसका परिणाम मुझे भुगतना है या पड़ोसियों को?" अगर आपको भुगतना है, तो फैसला भी आपका होना चाहिए।',
    actionEn:
      'What To Do Today: Before any major life decision, ask yourself: "Who will live with the consequences—me or the neighbors?" If it is you, make the choice yourself.',
  },
  {
    id: 'salary-comparison',
    icon: '💰',
    titleHi: '२. "पैकेज / सैलरी कितना है?" का दबाव',
    titleEn: '2. Salary & Status Comparison',
    questionHi:
      'शादी या परिवार में लोग इंसान के गुण देखने से पहले उसकी कमाई क्यों पूछते हैं?',
    questionEn:
      'Why do people at family gatherings ask about your income before treating you with respect?',
    mistakeHi:
      'आम गलती: कम सैलरी होने पर खुद को छोटा या बेकार मान लेना, या दिखावे के लिए महँगा फोन/गाड़ी किश्तों (EMI) पर ले लेना।',
    mistakeEn:
      'Common Mistake: Feeling inferior when your income is low, or buying expensive phones and bikes on EMI just to look rich.',
    truthHi:
      'आसान सच: लोग आपकी सैलरी इसलिए पूछते हैं ताकि वे तय कर सकें कि आपको कितनी इज्जत देनी है। यह उनकी असुरक्षा है, आपकी कमी नहीं।',
    truthEn:
      'Simple Truth: People ask your salary only to rank you in their mental ladder. It reflects their insecurity, not your human worth.',
    actionHi:
      'आज क्या करें: दिखावे में एक रुपया भी खर्च न करें। चुपचाप अपना हुनर (Skill) और बचत बढ़ाएं—असली आज़ादी बैंक बैलेंस और ज्ञान से आती है, दिखावे से नहीं।',
    actionEn:
      'What To Do Today: Spend zero money on showing off. Quietly build your skills and savings—real freedom comes from competence, not status symbols.',
  },
  {
    id: 'rat-race',
    icon: '🏃',
    titleHi: '३. परीक्षा और नौकरी की अंधी भेड़चाल',
    titleEn: '3. The Blind Exam & Job Rat-Race',
    questionHi:
      'लाखों युवा एक ही परीक्षा या रास्ते के पीछे अपने सबसे कीमती ५-७ साल क्यों गँवा देते हैं?',
    questionEn:
      'Why do millions of youth spend 5–7 prime years chasing the exact same crowded exam?',
    mistakeHi:
      'आम गलती: बिना अपनी क्षमता जाने, सिर्फ दूसरों को देखकर साल-दर-साल एक ही कमरे में बंद रहकर तैयारी करते रहना।',
    mistakeEn:
      'Common Mistake: Copying the crowd without knowing your own strengths, and staying stuck without a backup plan.',
    truthHi:
      'आसान सच: जहाँ १० लाख लोग १ हज़ार सीटों के लिए लड़ रहे हों, वहाँ सिर्फ मेहनत नहीं, एक तय समय-सीमा (Time Limit) और दूसरा प्रैक्टिकल हुनर होना ज़रूरी है।',
    truthEn:
      'Simple Truth: When a million people fight for a few seats, blind effort is not enough—you need a strict time limit and a practical skill.',
    actionHi:
      'आज क्या करें: अपने लक्ष्य के लिए एक स्पष्ट समय-सीमा तय करें और साथ में एक ऐसा काम (जैसे कोडिंग, कम्युनिकेशन, बिजनेस या तकनीकी हुनर) सीखें जिससे आप आत्मनिर्भर बन सकें।',
    actionEn:
      'What To Do Today: Set a clear deadline for any exam and simultaneously learn one practical, income-generating skill.',
  },
  {
    id: 'family-pressure',
    icon: '🏠',
    titleHi: '४. परिवार का इमोशनल दबाव और अपराध-बोध (Guilt)',
    titleEn: '4. Family Emotional Pressure & Guilt',
    questionHi:
      'जब हम अपने भले के लिए भी कोई नया कदम उठाते हैं, तो मन में अपराध-बोध (Guilt) क्यों होता है?',
    questionEn:
      'Why do we feel guilty even when we take a healthy step for our own future?',
    mistakeHi:
      'आम गलती: या तो माता-पिता से गुस्से में झगड़ा करना, या फिर डर के मारे अपनी आवाज़ पूरी तरह दबा लेना।',
    mistakeEn:
      'Common Mistake: Either fighting angrily with family members or completely surrendering your life out of guilt.',
    truthHi:
      'आसान सच: परिवार अक्सर बुरी नीयत से नहीं, बल्कि पुराने डर की वजह से आपको रोकता है। उन्हें बहस से नहीं, आपके शांत व्यवहार और परिणाम से भरोसा मिलता है।',
    truthEn:
      'Simple Truth: Families usually restrict you out of fear of the unknown, not malice. Anger never convinces them—calm results do.',
    actionHi:
      'आज क्या करें: घर में चिल्लाने या बहस करने के बजाय शांत रहें, सम्मान दें, लेकिन अपने दैनिक काम और अभ्यास को बिना रुके जारी रखें।',
    actionEn:
      'What To Do Today: Stop arguing at home. Speak respectfully, stay calm, and let your daily discipline and results speak for you.',
  },
  {
    id: 'phone-addiction',
    icon: '📱',
    titleHi: '५. मोबाइल की लत और टूटा हुआ ध्यान',
    titleEn: '5. Phone Addiction & Broken Focus',
    questionHi:
      'हम रोज़ सुबह बड़ा सोचते हैं, पर रात तक रील्स और शॉर्ट्स में समय कैसे निकल जाता है?',
    questionEn:
      'Why do we wake up with big goals but end the day exhausted from scrolling short videos?',
    mistakeHi:
      'आम गलती: यह सोचना कि "बस ५ मिनट देख लेता हूँ" और फिर घंटों तक दिमाग को सस्ते मनोरंजन से थका देना।',
    mistakeEn:
      'Common Mistake: Telling yourself "just 5 minutes of scrolling" and draining your brain’s energy before doing real work.',
    truthHi:
      'आसान सच: आपका ध्यान ही आपकी सबसे बड़ी संपत्ति है। छोटे-छोटे वीडियो आपके दिमाग की गहराई से सोचने की ताकत खत्म कर देते हैं।',
    truthEn:
      'Simple Truth: Your attention is your greatest wealth. Endless short videos train your brain to crave instant pleasure and fear hard work.',
    actionHi:
      'आज क्या करें: रोज़ सुबह उठने के पहले १ घंटे फोन को हाथ न लगाएं और Talk2Society के 100-Day Journey का आज का १ छोटा अभ्यास पूरा करें।',
    actionEn:
      'What To Do Today: Keep your phone away for the first hour every morning and complete your 1 daily task in the 100-Day Journey.',
  },
];

const SIMPLE_THINKING_EXAMPLES = [
  {
    id: 'money',
    labelHi: 'पैसा और कमाई (Money)',
    labelEn: 'Money & Income',
    levels: [
      {
        step: 1,
        badgeHi: 'स्तर १: शिकायत (Beginner)',
        badgeEn: 'Level 1: Blaming',
        color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
        thoughtHi: '“अमीर लोग ही अमीर बनते हैं, हमारी किस्मत ही खराब है।”',
        thoughtEn: '“Only the rich get richer; my luck is just bad.”',
        meaningHi: 'यहाँ इंसान सिर्फ दूसरों को दोष देता है और खुद कुछ नहीं सीखता।',
        meaningEn: 'Here a person blames luck or others and takes zero action.',
      },
      {
        step: 2,
        badgeHi: 'स्तर २: समझ (Awakening)',
        badgeEn: 'Level 2: Understanding',
        color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
        thoughtHi:
          '“पैसा सिर्फ कड़ी मेहनत से नहीं, बल्कि सही हुनर (Skill) और दिखावे से बचने से बचता है।”',
        thoughtEn:
          '“Money grows when I learn rare skills and stop wasting cash on show-off.”',
        meaningHi: 'यहाँ इंसान समाज के दिखावे के जाल को पहचान लेता है।',
        meaningEn: 'You stop falling for status traps and understand how money works.',
      },
      {
        step: 3,
        badgeHi: 'स्तर ३: अभ्यास (Action)',
        badgeEn: 'Level 3: Daily Action',
        color: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
        thoughtHi:
          '“मैं रोज़ १ घंटा नया काम सीखूँगा और फालतू खर्च बंद करके अपनी बचत बढ़ाऊँगा।”',
        thoughtEn:
          '“I will study a high-value skill 1 hour daily and save consistently.”',
        meaningHi: 'यहाँ शिकायत बंद हो जाती है और रोज़ का नियम शुरू होता है।',
        meaningEn: 'Complaints stop and daily disciplined action begins.',
      },
      {
        step: 4,
        badgeHi: 'स्तर ४: आज़ादी (Sovereign)',
        badgeEn: 'Level 4: Freedom',
        color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
        thoughtHi:
          '“अब मुझे किसी को दिखाने के लिए जीने की ज़रूरत नहीं है। मेरा काम और शांति ही मेरी पहचान है।”',
        thoughtEn:
          '“I no longer need to impress anyone. My competence and peace are my wealth.”',
        meaningHi: 'यह सबसे ऊँची और शांत अवस्था है जहाँ आप अपने मालिक खुद बनते हैं।',
        meaningEn: 'You become calm, independent, and free from societal pressure.',
      },
    ],
  },
  {
    id: 'criticism',
    labelHi: 'ताने और आलोचना (Criticism)',
    labelEn: 'Criticism & Relatives',
    levels: [
      {
        step: 1,
        badgeHi: 'स्तर १: गुस्सा या डर (Beginner)',
        badgeEn: 'Level 1: Anger or Fear',
        color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
        thoughtHi: '“रिश्तेदार ने मुझे ऐसा कैसे बोल दिया! मेरा पूरा दिन खराब हो गया।”',
        thoughtEn: '“How dare they say that to me! My whole week is ruined.”',
        meaningHi: 'यहाँ आपके मन का रिमोट कंट्रोल दूसरों के हाथ में है।',
        meaningEn: 'Other people hold the remote control to your mood.',
      },
      {
        step: 2,
        badgeHi: 'स्तर २: समझ (Awakening)',
        badgeEn: 'Level 2: Understanding',
        color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
        thoughtHi:
          '“वे मेरी काबिलियत नहीं, बल्कि अपने खुद के डर और अधूरेपन को बोल रहे हैं।”',
        thoughtEn:
          '“Their taunt is about their own inner anxiety, not my actual future.”',
        meaningHi: 'यहाँ आप सामने वाले के मन के डर को साफ देख पाते हैं।',
        meaningEn: 'You see why people judge instead of taking it personally.',
      },
      {
        step: 3,
        badgeHi: 'स्तर ३: अभ्यास (Action)',
        badgeEn: 'Level 3: Daily Action',
        color: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
        thoughtHi:
          '“मैं बहस में अपनी ऊर्जा बर्बाद नहीं करूँगा, मुस्कुराकर अपने काम पर ध्यान दूँगा।”',
        thoughtEn:
          '“I will not waste energy arguing; I will smile and return to my work.”',
        meaningHi: 'आप अपनी ऊर्जा बचाकर सही जगह लगाना सीख जाते हैं।',
        meaningEn: 'You protect your mental energy and stay focused.',
      },
      {
        step: 4,
        badgeHi: 'स्तर ४: आज़ादी (Sovereign)',
        badgeEn: 'Level 4: Freedom',
        color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
        thoughtHi:
          '“न किसी से नफरत, न किसी के तानों का डर—मैं अपने रास्ते पर पूरी तरह शांत हूँ।”',
        thoughtEn:
          '“Zero hatred, zero fear of taunts—I walk my path with complete clarity.”',
        meaningHi: 'आप बाहरी शोर से पूरी तरह आज़ाद हो जाते हैं।',
        meaningEn: 'Complete inner peace and unshakeable focus.',
      },
    ],
  },
];

const FIVE_SIMPLE_RULES = [
  {
    num: '01',
    titleHi: 'किसी इंसान को भगवान या गुरु मत बनाओ',
    titleEn: 'Never Worship Any Guru or Influencer',
    descHi:
      'यहाँ कोई बाबा या गुरु नहीं है। हमारी बात भी आंख मूँदकर मत मानो—हर बात को अपने जीवन में खुद परखो।',
    descEn:
      'Do not blindly follow anyone—including us. Test every idea in your own real life.',
  },
  {
    num: '02',
    titleHi: 'सिर्फ वीडियो देखने से ज़िंदगी नहीं बदलती',
    titleEn: 'Watching Videos Alone Changes Nothing',
    descHi:
      '१० घंटे मोटिवेशन देखने से बेहतर है रोज़ १५ मिनट अपने डर का सामना करना और १ छोटा काम पूरा करना।',
    descEn:
      '15 minutes of real daily action beats 10 hours of motivational videos.',
  },
  {
    num: '03',
    titleHi: 'दूसरों को दोष देना आज ही बंद करें',
    titleEn: 'Stop Blaming Society or Luck',
    descHi:
      'समाज जैसा है वैसा ही रहेगा। शिकायत करने से ताक़त घटती है, और रास्ता खोजने से ताक़त बढ़ती है।',
    descEn:
      'Complaining drains your strength. Understanding the rules gives you power.',
  },
  {
    num: '04',
    titleHi: 'दिखावे से ज़्यादा अपनी आज़ादी चुनो',
    titleEn: 'Choose Freedom Over Show-Off',
    descHi:
      'लोगों की झूठी वाहवाही के लिए उधार मत लो। सादा जीवन और मजबूत हुनर आपको हमेशा निडर रखेगा।',
    descEn:
      'Never go into debt to look successful. Simple living and strong skills make you fearless.',
  },
  {
    num: '05',
    titleHi: 'रोज़ रात को ५ मिनट खुद से सच बोलो',
    titleEn: 'Be Honest With Yourself for 5 Minutes Every Night',
    descHi:
      'सोने से पहले अपनी डायरी (Wisdom Log) में लिखो कि आज आपने क्या सही किया और कहाँ समय गँवाया।',
    descEn:
      'Write 2 honest lines in your Wisdom Log every night about what you learned today.',
  },
];

export const BlueprintView: React.FC = () => {
  const {
    isSectionVipGated,
    openAscensionModal,
    handleTabClick,
    claimSovereignXp,
    setShowJournalModal,
  } = useAppContext();
  const { t } = useLanguage();
  const { isSpeaking, speak, stop } = useSpeechSynthesis();

  const [activeTab, setActiveTab] = useState<
    'start' | 'traps' | 'thinking' | 'rules' | 'visuals'
  >('start');
  const [selectedThinkingTopic, setSelectedThinkingTopic] =
    useState<string>('money');
  const [pledgeClaimed, setPledgeClaimed] = useState(false);

  if (isSectionVipGated('crucible') || isSectionVipGated('blueprint')) {
    return (
      <VipSectionLockedView
        sectionTitle="Philosophy & Simple Life Guide"
        hindiTitle="हमारा दर्शन व सरल जीवन मार्गदर्शिका"
        description="This practical guide and mental clarity framework is reserved for Sovereign VIP members."
        onUnlock={openAscensionModal}
      />
    );
  }

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text, 'blueprint-tts');
    }
  };

  const activeThinkingData =
    SIMPLE_THINKING_EXAMPLES.find((item) => item.id === selectedThinkingTopic) ||
    SIMPLE_THINKING_EXAMPLES[0];

  const handleClaimPledge = async () => {
    if (pledgeClaimed) return;
    await claimSovereignXp(
      50,
      t('आत्मनिर्भरता संकल्प (+50 XP)', 'Self-Reliance Pledge (+50 XP)')
    );
    setPledgeClaimed(true);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-2 sm:px-4 pb-20">
      {/* Friendly, Beginner-First Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-[#12141d] via-[#0c0e14] to-[#08090d] p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold rounded-full">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>
              {t(
                'सरल भाषा में समझें • हर नए साधक के लिए',
                'SIMPLE GUIDE • EASY TO UNDERSTAND FOR EVERYONE'
              )}
            </span>
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
              {t(
                'हमारा दर्शन: समाज को समझो और अपनी ज़िंदगी आसान बनाओ',
                'Our Philosophy: Understand Society & Make Your Life Clear'
              )}
            </h1>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              {t(
                'यहाँ कोई कठिन किताबी ज्ञान या खोखला मोटिवेशन नहीं है। हमने जीवन की उलझनों को ४ बहुत ही आसान कदमों में बाँटा है ताकि हर इंसान बिना किसी भ्रम के सही फैसले ले सके:',
                'No confusing jargon or fake motivation here. We break down real-life struggles into 4 simple steps so anyone can think clearly and make strong decisions:'
              )}
            </p>
          </div>

          {/* 4 Simple Steps Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {t('कदम १ • देखना', 'STEP 1 • SEE')}
                </span>
                <span className="text-lg">👀</span>
              </div>
              <div className="text-sm font-bold text-white">
                {t('सच्चाई को साफ देखो', 'See Reality Clearly')}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {t(
                  'डर या भावनाओं में बहने के बजाय देखो कि आपके आस-पास वास्तव में क्या हो रहा है।',
                  'Look at what is actually happening around you without fear or illusion.'
                )}
              </p>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {t('कदम २ • समझना', 'STEP 2 • UNDERSTAND')}
                </span>
                <span className="text-lg">🧩</span>
              </div>
              <div className="text-sm font-bold text-white">
                {t('लोगों के पीछे का कारण समझो', 'Understand Why People Act')}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {t(
                  'रिश्तेदार, समाज और बाजार आपसे वैसा व्यवहार क्यों करते हैं, उसके पीछे का नियम समझो।',
                  'Understand why relatives, society, and markets pressure you the way they do.'
                )}
              </p>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {t('कदम ३ • सोचना', 'STEP 3 • THINK')}
                </span>
                <span className="text-lg">🧠</span>
              </div>
              <div className="text-sm font-bold text-white">
                {t('गुस्से के बजाय शांत दिमाग से सोचो', 'Think Calmly Without Anger')}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {t(
                  'शिकायत करने या झगड़ने के बजाय सोचो कि आपके लिए सबसे समझदारी का रास्ता क्या है।',
                  'Stop complaining or fighting, and figure out the smartest path forward.'
                )}
              </p>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {t('कदम ४ • चुनना', 'STEP 4 • CHOOSE')}
                </span>
                <span className="text-lg">⚡</span>
              </div>
              <div className="text-sm font-bold text-white">
                {t('रोज़ १ छोटा कदम उठाओ', 'Take 1 Small Step Daily')}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {t(
                  'बिना किसी बाबा या गुरु के सहारे, अपनी ज़िंदगी की ज़िम्मेदारी खुद लो।',
                  'Take ownership of your life through simple daily habits.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple 5-Button Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          {
            id: 'start',
            label: t('१. शुरुआत कैसे करें?', '1. Where to Start?'),
            icon: Compass,
          },
          {
            id: 'traps',
            label: t('२. जीवन के ५ बड़े जाल', '2. 5 Common Life Traps'),
            icon: HelpCircle,
          },
          {
            id: 'thinking',
            label: t('३. सोच कैसे बदलें?', '3. Upgrade Your Thinking'),
            icon: Brain,
          },
          {
            id: 'rules',
            label: t('४. हमारे ५ सरल नियम', '4. 5 Simple Rules'),
            icon: Shield,
          },
          {
            id: 'visuals',
            label: t('५. चित्रों से समझें', '5. Visual Diagrams'),
            icon: Eye,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-center gap-2 px-3 py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: WHERE TO START (SUPER SIMPLE ONBOARDING FOR NEW / LOW-LEVEL USERS) */}
      {activeTab === 'start' && (
        <div className="space-y-6">
          <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                {t('नए साथियों के लिए आसान गाइड', 'EASY START GUIDE FOR NEW MEMBERS')}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {t(
                  'इस ऐप का उपयोग कैसे करें? (सिर्फ ३ आसान काम)',
                  'How to Use This App? (Just 3 Simple Daily Habits)'
                )}
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {t(
                  'अगर आप पहली बार यहाँ आए हैं, तो आपको सब कुछ एक साथ पढ़ने की ज़रूरत नहीं है। बस नीचे दिए गए ३ आसान काम रोज़ करें:',
                  'If you are new here, you do not need to read everything at once. Just follow these 3 simple steps every day:'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Step 1 */}
              <div className="bg-zinc-900/70 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-black text-base">
                    1
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {t(
                      'रोज़ १ दिन का अभ्यास पूरा करें',
                      'Complete 1 Journey Day Daily'
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {t(
                      '“100-Day Journey” में जाएं। वहाँ आपको रोज़ सिर्फ १ छोटा सा काम मिलेगा। उसे पढ़ें और पूरा करें (+100 XP)।',
                      'Open the “100-Day Journey”. Every day unlocks just 1 short lesson and practical task (+100 XP).'
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleTabClick('journey')}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>
                    {t('१००-दिवसीय यात्रा खोलें', 'Open 100-Day Journey')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Step 2 */}
              <div className="bg-zinc-900/70 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-black text-base">
                    2
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {t(
                      'रात को २ लाइन अपनी डायरी में लिखें',
                      'Write 2 Lines in Your Diary at Night'
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {t(
                      'आज आपने क्या सीखा? उसे अपनी “चिंतन डायरी (Wisdom Log)” में लिखें। आप कभी भी अपनी डायरी का सुंदर PDF डाउनलोड कर सकते हैं।',
                      'Write what you observed today in your Wisdom Log (+25 XP). You can export your diary as a beautiful PDF anytime.'
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setShowJournalModal(true)}
                  className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border border-zinc-700"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>
                    {t('चिंतन डायरी खोलें', 'Open Wisdom Diary')}
                  </span>
                </button>
              </div>

              {/* Step 3 */}
              <div className="bg-zinc-900/70 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 font-mono font-black text-base">
                    3
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {t(
                      'खाली समय में रील्स के बजाय किताबें व वीडियो देखें',
                      'Replace Mindless Scrolling With Library & Videos'
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {t(
                      'जब भी समय मिले, “पुस्तकालय” या “वीडियो आर्काइव” खोलें और समाज की सच्चाई समझाने वाले वीडियो और किताबें ऐप के अंदर ही पढ़ें।',
                      'Whenever you have free time, explore the Great Library or Video Archives directly inside the app.'
                    )}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleTabClick('archives')}
                    className="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-zinc-700"
                  >
                    <span>{t('वीडियो देखें', 'Videos')}</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('library')}
                    className="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-zinc-700"
                  >
                    <span>{t('पुस्तकालय', 'Library')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Difference: Normal Motivation vs Talk2Society */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-rose-950/15 border border-rose-500/30 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>
                  {t(
                    'आम मोटिवेशनल चैनल क्या करते हैं? (इससे बचें)',
                    'What Normal Motivational Channels Do (Avoid This)'
                  )}
                </span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>
                    {t(
                      'आपको ५ मिनट के लिए जोश दिलाते हैं, जो अगले दिन खत्म हो जाता है।',
                      'Give you 5 minutes of fake excitement that disappears the next morning.'
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>
                    {t(
                      'हर समस्या के लिए आपको ही दोषी ठहराते हैं, बिना समाज के नियम समझाए।',
                      'Tell you to "just work harder" without explaining how society’s traps actually work.'
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>
                    {t(
                      'आपको अपना भक्त और निर्भर (Dependent) बनाए रखते हैं।',
                      'Keep you dependent on watching their videos forever.'
                    )}
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-950/15 border border-emerald-500/30 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  {t(
                    'Talk2Society आपकी कैसे मदद करता है?',
                    'How Talk2Society Helps You Grow'
                  )}
                </span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>
                    {t(
                      'आपको झूठा जोश नहीं, बल्कि सच्चाई को साफ देखने की समझ देता है।',
                      'Gives you clear understanding of family, money, and social systems instead of fake hype.'
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>
                    {t(
                      'हर रोज़ १ छोटा और प्रैक्टिकल काम कराकर आपकी आदत बदलता है।',
                      'Builds real discipline with 1 small daily step at a time.'
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>
                    {t(
                      'आपको किसी गुरु का भक्त नहीं, बल्कि अपना मालिक खुद बनाता है।',
                      'Makes you independent and self-reliant—never a blind follower.'
                    )}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 5 EVERYDAY LIFE TRAPS EXPLAINED SIMPLY */}
      {activeTab === 'traps' && (
        <div className="space-y-5">
          <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {t(
                'आम भारतीय जीवन के ५ सबसे बड़े जाल (और उनसे निकलने का आसान रास्ता)',
                '5 Everyday Life Traps (And Simple Ways Out)'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {t(
                'हर कार्ड में देखें कि आम इंसान क्या गलती करता है, उसके पीछे का आसान सच क्या है, और आज से आपको क्या करना चाहिए। आप “सुनें” बटन दबाकर इसे आवाज़ में भी सुन सकते हैं।',
                'See the common mistake, the simple truth, and what you can do today. Click "Listen" on any card to hear it read aloud.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {EVERYDAY_TRAPS.map((trap) => {
              const title = t(trap.titleHi, trap.titleEn);
              const question = t(trap.questionHi, trap.questionEn);
              const mistake = t(trap.mistakeHi, trap.mistakeEn);
              const truth = t(trap.truthHi, trap.truthEn);
              const action = t(trap.actionHi, trap.actionEn);

              return (
                <div
                  key={trap.id}
                  className="bg-[#0c0e14] border border-zinc-800 hover:border-amber-500/30 rounded-3xl p-6 space-y-4 transition-all"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl sm:text-3xl">{trap.icon}</span>
                      <div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-white">
                          {title}
                        </h3>
                        <p className="text-xs sm:text-sm text-amber-300 font-medium mt-0.5">
                          {question}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleSpeak(`${title}. ${question} ${truth} ${action}`)
                      }
                      className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{t('🔊 सरल भाषा में सुनें', '🔊 Listen')}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs sm:text-sm text-rose-200 leading-relaxed">
                      {mistake}
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-zinc-200 leading-relaxed">
                      {truth}
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs sm:text-sm text-emerald-200 leading-relaxed font-medium">
                      {action}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SIMPLE 4-STEP THINKING UPGRADE */}
      {activeTab === 'thinking' && (
        <div className="space-y-6">
          <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                  {t('सोच का विकास • ४ आसान स्तर', '4 SIMPLE LEVELS OF THINKING')}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {t(
                    'छोटी सोच से बड़ी और शांत सोच तक कैसे पहुँचें?',
                    'How to Move From Complaining to Clear Thinking'
                  )}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {SIMPLE_THINKING_EXAMPLES.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedThinkingTopic(topic.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      selectedThinkingTopic === topic.id
                        ? 'bg-amber-500 text-black'
                        : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:text-white'
                    }`}
                  >
                    {t(topic.labelHi, topic.labelEn)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeThinkingData.levels.map((lvl) => (
                <div
                  key={lvl.step}
                  className={`p-5 rounded-2xl border space-y-3 ${lvl.color}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black uppercase">
                      {t(lvl.badgeHi, lvl.badgeEn)}
                    </span>
                    <span className="text-xs font-mono opacity-80">
                      Step {lvl.step}/4
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-white leading-snug">
                    {t(lvl.thoughtHi, lvl.thoughtEn)}
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {t(lvl.meaningHi, lvl.meaningEn)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 5 SIMPLE SELF-RELIANCE RULES & +50 XP PLEDGE */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                {t('आत्मनिर्भरता के ५ सरल नियम', '5 SIMPLE RULES FOR SELF-RELIANCE')}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {t(
                  'बिना किसी बाबा या गुरु के, अपने पैरों पर खड़ा होना सीखें',
                  'Stand on Your Own Feet—Without Any Guru Worship'
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FIVE_SIMPLE_RULES.map((rule) => (
                <div
                  key={rule.num}
                  className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-black text-xs">
                      {rule.num}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {t(rule.titleHi, rule.titleEn)}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {t(rule.descHi, rule.descEn)}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-emerald-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-base font-bold text-white">
                  {t(
                    'क्या आप इन ५ सरल नियमों को अपने जीवन में अपनाने के लिए तैयार हैं?',
                    'Are you ready to apply these 5 simple rules in your daily life?'
                  )}
                </h4>
                <p className="text-xs text-zinc-300">
                  {t(
                    'संकल्प लेने पर आपके खाते में +50 XP जोड़े जाएंगे।',
                    'Take the Self-Reliance Pledge and earn +50 XP on your profile.'
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClaimPledge}
                disabled={pledgeClaimed}
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-emerald-500/20 disabled:text-emerald-300 disabled:border disabled:border-emerald-500/40 text-black font-black text-xs font-mono uppercase tracking-wider cursor-pointer transition-all shrink-0"
              >
                {pledgeClaimed
                  ? t('✓ संकल्प पूरा हुआ (+50 XP)', '✓ Pledge Completed (+50 XP)')
                  : t('हाँ, मैं संकल्प लेता हूँ (+50 XP)', 'Take Self-Reliance Pledge (+50 XP)')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: VISUAL DIAGRAMS */}
      {activeTab === 'visuals' && (
        <div className="space-y-6">
          <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {t(
                'चित्रों और कहानियों से समाज के नियम समझें',
                'Understand Social Patterns Through Simple Visual Diagrams'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {t(
                'नीचे दिए गए चित्रों पर क्लिक करके देखें कि रोज़मर्रा के जीवन में अदृश्य सामाजिक नियम कैसे काम करते हैं:',
                'Explore interactive visual diagrams showing how everyday situations work behind the scenes:'
              )}
            </p>
          </div>
          <StickFigureVisualizer />
        </div>
      )}
    </div>
  );
};

export default BlueprintView;
