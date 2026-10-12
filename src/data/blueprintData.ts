import { LibraryBook } from '../types';

// ==========================================
// 1. REALITY AUDIT (कम्युनिटी का मनोवैज्ञानिक ऑडिट)
// ==========================================
export interface RealityAuditParadox {
  id: string;
  number: number;
  title: string;
  hindiTitle: string;
  tagline: string;
  delusionSide: {
    title: string;
    hindiTitle: string;
    quote: string;
    behavior: string;
  };
  realitySide: {
    title: string;
    hindiTitle: string;
    quote: string;
    behavior: string;
  };
  gapAnalysis: string;
  hindiGapAnalysis: string;
  strategicConclusion: string;
  actionProtocol: string[];
}

export const REALITY_AUDIT_PARADOXES: RealityAuditParadox[] = [
  {
    id: 'delusion-vs-impotence',
    number: 1,
    title: "The Delusion vs. Impotence Gap",
    hindiTitle: "'अशोक का साम्राज्य' बनाम 'रोस्ट होने पर आँसू'",
    tagline: "भव्य दिवास्वप्न और भावनात्मक लाचारी के बीच की विशाल खाई",
    delusionSide: {
      title: "Grand Delusion (दिवास्वप्न)",
      hindiTitle: "अवास्तविक महत्वाकांक्षा",
      quote: "“अशोक से बड़ा साम्राज्य बनाना है... पूरे विश्व का राजा बनना है... इतिहास रचना है...”",
      behavior: "दिनभर ऐतिहासिक राजाओं, चाणक्य या मैकियावेली के कोट्स पढ़ना और खुद को महान सेनापति समझना।"
    },
    realitySide: {
      title: "Ground Reality (ज़मीनी लाचारी)",
      hindiTitle: "कमज़ोर नर्वस सिस्टम",
      quote: "“कॉलेज या दफ्तर में कोई छोटा सा रोस्ट कर दे तो आँखों में पानी आ जाता है... दिल धड़कने लगता है...”",
      behavior: "सामान्य सामाजिक दबाव, पारिवारिक तंज या मामूली आलोचना पर कांप उठना और हफ्तों डिप्रेशन में चले जाना।"
    },
    gapAnalysis: "कम्युनिटी के अधिकांश सदस्य वास्तविक जीवन में सामाजिक रूप से उपेक्षित, आर्थिक रूप से पराश्रित और अत्यधिक संवेदनशील (Fragile) हैं। वे आंतरिक असुरक्षा को छुपाने के लिए 'साम्राज्य' के दिवास्वप्नों की ढाल बनाते हैं।",
    hindiGapAnalysis: "जब तक किसी व्यक्ति का अपना नर्वस सिस्टम (Nervous System) उसके नियंत्रण में नहीं है, तब तक उसके लिए शक्ति और कूटनीति की बातें केवल 'बौद्धिक हस्तमैथुन' (Mental Pornography) हैं।",
    strategicConclusion: "इन्हें पहले विश्व विजय नहीं, बल्कि सड़क, परिवार और दफ्तर के स्तर का भावनात्मक कवच (Emotional Armor) चाहिए। पहले आँसू रोको, फिर साम्राज्य की सोचो।",
    actionProtocol: [
      "नर्वस सिस्टम शील्ड: रोस्ट होने या अपमान होने पर तत्काल प्रतिक्रिया बंद (5 सेकंड मौन)",
      "काल्पनिक राजा बनना बंद: आज सड़क पर ₹10 का मोलभाव करके दिखाओ या किसी असहज स्थिति में आँखें मिलाकर बात करो",
      "दैनिक तनाव का सामना: हर दिन एक ऐसी सामाजिक परिस्थिति में जाओ जिससे घबराहट होती हो"
    ]
  },
  {
    id: 'pricing-paradox',
    number: 2,
    title: "The Pricing & Accountability Paradox",
    hindiTitle: "₹499 का प्रतिरोध बनाम ₹3,000 की ललक",
    tagline: "कंटेंट की कौड़ी बराबर कीमत बनाम निर्मम निगरानी व जवाबदेही की भूख",
    delusionSide: {
      title: "₹499 Content Resistance (कंटेंट का संकोच)",
      hindiTitle: "ज्ञान की प्रचुरता",
      quote: "“₹499 बहुत ज्यादा है... क्या इसमें पीडीएफ और वीडियो ही तो हैं? वो तो यूट्यूब पर फ्री हैं...”",
      behavior: "सैकड़ों गीगाबाइट पीडीएफ और कोर्स डाउनलोड करके फोन में जमा करना और कभी न पढ़ना।"
    },
    realitySide: {
      title: "₹3,000 Mentorship Craving (निगरानी की चाह)",
      hindiTitle: "जवाबदेही की प्यास",
      quote: "“जय सर के व्यक्तिगत 1-महीने के मार्गदर्शन के 20 स्लॉट ₹3,000 में कुछ ही मिनटों में बिक गए...”",
      behavior: "लोग खुद से काम करने में असमर्थ हैं; उन्हें कोई ऐसा चाहिए जो डंडा लेकर उनसे काम करवाए और उनका नाम पुकारे।"
    },
    gapAnalysis: "₹499 में उन्हें केवल 'कंटेंट' दिख रहा था, जिसकी इंटरनेट पर कोई कमी नहीं है। लेकिन ₹3,000 में उन्हें 'जवाबदेही' (Accountability), 'निगरानी' (Surveillance) और 'पहचान' (Recognition) मिल रही थी।",
    hindiGapAnalysis: "आधुनिक युवा ज्ञान की कमी से नहीं मर रहा, वह एकाकीपन (Isolation) और स्वयं के आलस्य से हार रहा है। उसे साथी और निर्मम परीक्षक चाहिए।",
    strategicConclusion: "हमें केवल एक निष्क्रिय 'कंटेंट लाइब्रेरी' नहीं चलानी है, बल्कि 'द सॉवरेन क्रूसिबल' (The Crucible - भट्टी) चलाना है, जहाँ हर हफ्ते उनकी प्रगति की निर्मम समीक्षा (Brutal Review) हो।",
    actionProtocol: [
      "कंटेंट जमाखोरी बंद: एक किताब या नियम को 30 दिन तक जिएं, 50 किताबें डाउनलोड न करें",
      "पीयर एकाउंटेबिलिटी पार्टनर: किसी साथी को अपने दैनिक लक्ष्य दें; न पूरा करने पर जुर्माना दें",
      "निर्मम सप्ताहिक ऑडिट: हर रविवार को स्वीकार करें कि इस हफ्ते कितने घंटे बर्बाद किए"
    ]
  },
  {
    id: 'action-vs-consumption',
    number: 3,
    title: "The Action vs. Consumption Trap",
    hindiTitle: "बौद्धिक संतुष्टि बनाम ज़मीनी क्रियान्वयन",
    tagline: "वीडियो देखने को कर्म मान लेना और ज़मीनी मैदान से भागना",
    delusionSide: {
      title: "Consumption High (बौद्धिक नशा)",
      hindiTitle: "सोचने का भ्रम",
      quote: "“मैंने डार्क साइकोलॉजी और 48 लॉज ऑफ पावर की 10 समरी देख ली हैं, अब मैं सबको मैनिपुलेट कर सकता हूँ...”",
      behavior: "स्क्रीन के सामने बैठकर शक्ति के नियम पढ़ना और खुद को चाणक्य समझकर डोपामिन पाना।"
    },
    realitySide: {
      title: "Field Paralysis (मैदानी लकवा)",
      hindiTitle: "शून्य ज़मीनी परिणाम",
      quote: "“लेकिन बैंक खाते में ₹200 भी नहीं हैं और कमरे से बाहर किसी अजनबी से बात करने में पसीने छूटते हैं...”",
      behavior: "वास्तविक दुनिया में एक भी अनुबंध, एक भी बातचीत या एक भी ग्राहक हासिल करने का साहस न होना।"
    },
    gapAnalysis: "सिद्धांत पढ़ना आसान है; सड़क पर अस्वीकृति (Rejection) का सामना करना दर्दनाक है। इंसान दर्द से बचने के लिए लगातार 'तैयारी' की आड़ में छिपता रहता है।",
    hindiGapAnalysis: "अति-विचार (Overthinking) केवल आलस्य और कायरता का एक परिष्कृत रूप है। जब तक मैदान में नहीं उतरोगे, ज्ञान कचरा है।",
    strategicConclusion: "जब तक किसी विचार का ज़मीनी प्रमाण (Proof of Work) न हो, तब तक उसे कम्युनिटी में विचार न माना जाए। एक्शन ही एकमात्र भाषा है जो हकीकत को समझ आती है।",
    actionProtocol: [
      "नो-कंजम्पशन रूल: जब तक आज का ज़मीनी असाइनमेंट पूरा न हो, कोई नया वीडियो या किताब न खोलें",
      "अस्वीकृति थेरेपी (Rejection Therapy): हर हफ्ते कम से कम 3 'ना' सुनने का साहस जुटाएं",
      "नकद परिणाम: किसी भी हुनर को तब तक सिद्ध न मानें जब तक कोई अजनबी उसके लिए पैसे न दे"
    ]
  }
];

// ==========================================
// 2. COMMUNITY NO-GURU PROTOCOL (नो-गुरु नियम)
// ==========================================
export interface NoGuruRule {
  id: string;
  ruleNumber: number;
  name: string;
  hindiName: string;
  principle: string;
  hindiPrinciple: string;
  prohibited: string;
  mandated: string;
  enforcement: string;
}

export const COMMUNITY_NO_GURU_RULES: NoGuruRule[] = [
  {
    id: 'zero-hero-worship',
    ruleNumber: 1,
    name: "Zero Hero-Worship Protocol",
    hindiName: "व्यक्ति-पूजा पर पूर्ण प्रतिबंध",
    principle: "No human is a god. Follow the framework, never the mortal.",
    hindiPrinciple: "यहाँ कोई 'जय सर' या 'चंद्रदीप्ति' भगवान नहीं हैं। व्यक्ति को नहीं, सिद्धांतों और परिणामों को सम्मान दो।",
    prohibited: "अंधभक्ति, 'सर आप महान हो', चापलूसी या किसी व्यक्ति के शब्दों को बिना तर्क के पत्थर की लकीर मानना।",
    mandated: "सख्त सवाल पूछना, परिणामों की मांग करना, और खुद को आत्मनिर्भर बौद्धिक संप्रभु बनाना।",
    enforcement: "चापलूसी करने वाले संदेशों को तुरंत डिलीट किया जाएगा और चेतावनी दी जाएगी।"
  },
  {
    id: 'brutal-peer-accountability',
    ruleNumber: 2,
    name: "Brutal Peer Accountability",
    hindiName: "साथियों द्वारा निर्मम समीक्षा (सत्य बोलो, दिलासा नहीं)",
    principle: "Comforting lies destroy empires. Brutal feedback builds sovereignty.",
    hindiPrinciple: "झूठी सांत्वना और 'सब ठीक हो जाएगा' वाले खोखले दिलासे यहाँ प्रतिबंधित हैं। अगर काम खराब है तो सच बोलो।",
    prohibited: "कमजोर प्रदर्शन पर 'वेल ट्राइड भाई' कहना। आलस्य को मानसिक तनाव का नाम देकर सही ठहराना।",
    mandated: "साथी के काम की सटीक खामियों को उजागर करना और सुधार के लिए 48 घंटे की समयसीमा देना।",
    enforcement: "जो साथी सच बोलने से कतराएगा, उसे एकाउंटेबिलिटी सर्कल से निष्कासित कर दिया जाएगा।"
  },
  {
    id: 'action-over-talk',
    ruleNumber: 3,
    name: "Action Over Intellectualization",
    hindiName: "बौद्धिक लफ्फाजी पर प्रतिबंध (प्रमाण दिखाओ)",
    principle: "The internet is drowned in philosophy. The Crucible honors only executed work.",
    hindiPrinciple: "मैकियावेली और चाणक्य के कोट्स चिपकाने वाले को ब्लॉक किया जाएगा। बताओ कि आज तुमने ज़मीन पर क्या किया।",
    prohibited: "लंबी-चौड़ी दार्शनिक बहसें, बिना किसी ज़मीनी अनुभव के दूसरों को सलाह देना, राजनीति पर व्यर्थ गपशप।",
    mandated: "हर दावे के साथ स्क्रीनशॉट, बैंक रसीद, फील्ड लॉग या ऑडियो प्रमाण संलग्न करना।",
    enforcement: "बिना प्रमाण के ज्ञान बघारने वालों को 7 दिन के लिए मूक (Mute) किया जाएगा।"
  },
  {
    id: 'confession-and-audits',
    ruleNumber: 4,
    name: "Weekly Crucible Confessions & Audits",
    hindiName: "सप्ताहिक आत्म-निरीक्षण और त्रुटि स्वीकारोक्ति",
    principle: "A failure hidden festers into ruin; a failure confessed and analyzed becomes armor.",
    hindiPrinciple: "अपनी गलतियों को छुपाने वाला कभी संप्रभु नहीं बन सकता। हर रविवार को अपनी कमजोरियों का सार्वजनिक पोस्टमार्टम करो।",
    prohibited: "दिखावटी सफलता का ढोंग करना, सोशल मीडिया जैसा फर्जी रोब जमाना, हार पर पर्दा डालना।",
    mandated: "सप्ताहिक वार रूम में खुलकर लिखना: 'मैं इस हफ्ते कहाँ फिसला और अगले हफ्ते इसे कैसे ठीक करूँगा।' ",
    enforcement: "लगातार 2 हफ्ते ऑडिट न भरने वाले सदस्यों का सदस्यता स्तर घटा दिया जाएगा।"
  },
  {
    id: 'grounded-crucible-code',
    ruleNumber: 5,
    name: "The Grounded Crucible Code",
    hindiName: "ज़मीनी क्रूसिबल मर्यादा (अशोक का सपना छोड़ो, पहले नर्वस सिस्टम संभालो)",
    principle: "Before conquering the world, learn to keep your temper and earn your bread.",
    hindiPrinciple: "जब तक आपकी जेब में खुद का कमाया पैसा नहीं और आपकी जुबान पर नियंत्रण नहीं, साम्राज्य की बातें पाखंड हैं।",
    prohibited: "दूसरों को नीचा दिखाना, इंटरनेट ट्रोल्स से बहस करना, अपने परिवार से अनावश्यक टकराव मोल लेना।",
    mandated: "शांत, मूक और केंद्रित रहकर हर दिन अपनी आंतरिक शक्ति और आर्थिक स्वायत्तता को 1% बढ़ाना।",
    enforcement: "घमंड या अनियंत्रित क्रोध प्रदर्शित करने पर स्थाई निष्कासन।"
  }
];

// ==========================================
// 3. WEEKLY CONTENT & WAR ROOM CALENDAR
// ==========================================
export interface WeeklyCalendarEvent {
  day: 'Monday' | 'Wednesday' | 'Friday' | 'Sunday';
  hindiDay: string;
  name: string;
  hindiName: string;
  timeIST: string;
  type: 'audit' | 'tactical' | 'drill' | 'war_room';
  focus: string;
  hindiFocus: string;
  description: string;
  deliverable: string;
  xpReward: number;
}

export const WEEKLY_CRUCIBLE_CALENDAR: WeeklyCalendarEvent[] = [
  {
    day: 'Monday',
    hindiDay: 'सोमवार',
    name: "Crucible Audit & Weekly Challenge Kickoff",
    hindiName: "क्रूसिबल ऑडिट व साप्ताहिक चुनौती का आरंभ",
    timeIST: "08:00 AM IST",
    type: 'audit',
    focus: "Nervous System Calibration & Habit Lock",
    hindiFocus: "नर्वस सिस्टम नियंत्रण और अनुशासन संकल्प",
    description: "हफ्ते की नई चुनौती जारी की जाती है। पिछले हफ्ते के बैकलॉग को बंद किया जाता है और नए 7 दिनों का सख्त रूटीन लॉक किया जाता है।",
    deliverable: "साप्ताहिक लक्ष्य शीट में 3 प्रमुख ज़मीनी कार्य दर्ज करना।",
    xpReward: 50
  },
  {
    day: 'Wednesday',
    hindiDay: 'बुधवार',
    name: "Tactical Breakdown & Case Study Dissection",
    hindiName: "रणनीतिक विश्लेषण व वास्तविक केस स्टडी",
    timeIST: "07:00 PM IST",
    type: 'tactical',
    focus: "Structural Social Decoding & Hidden Dynamics",
    hindiFocus: "अदृश्य सामाजिक तंत्र और शक्ति संतुलन का विच्छेदन",
    description: "भारतीय समाज या व्यापार के किसी गंभीर अनकहे मुद्दे का गहन विश्लेषण (उदा. सैलरी का सामाजिक पदानुक्रम, कोचिंग माफिया, पारिवारिक ब्लैकमेल)।",
    deliverable: "केस स्टडी पर 300 शब्दों का व्यक्तिगत विश्लेषण प्रस्तुत करना।",
    xpReward: 75
  },
  {
    day: 'Friday',
    hindiDay: 'शुक्रवार',
    name: "Real-World Ground Drill",
    hindiName: "ज़मीनी फील्ड असाइनमेंट (सड़क और दफ्तर का अभ्यास)",
    timeIST: "12:00 PM IST",
    type: 'drill',
    focus: "Street Armor, Negotiation & Rejection Therapy",
    hindiFocus: "सड़क पर मोलभाव, अस्वीकृति का सामना और असुविधाजनक शांति",
    description: "एक व्यावहारिक असाइनमेंट जिसे स्क्रीन बंद करके वास्तविक दुनिया में करना अनिवार्य है (उदा. बाजार में बिना संकोच मोलभाव करना, किसी बैठक में 5 सेकंड का मौन रखना)।",
    deliverable: "फील्ड रिपोर्ट व अनुभव लॉग सबमिट करना।",
    xpReward: 100
  },
  {
    day: 'Sunday',
    hindiDay: 'रविवार',
    name: "The Live War Room & Brutal Crucible Review",
    hindiName: "लाइव वार रूम व निर्मम समीक्षा सभा",
    timeIST: "09:00 PM IST",
    type: 'war_room',
    focus: "Failure Autopsy, Peer Review & Leaderboard Ascension",
    hindiFocus: "विफलता का पोस्टमार्टम, साथी समीक्षा और रैंक अपग्रेड",
    description: "कम्युनिटी की खुली समीक्षा बैठक। जिन्होंने हफ्ते के कार्य पूरे किए उन्हें मान्यता; जो फिसले उनका खुला पोस्टमार्टम और सुधारात्मक योजना।",
    deliverable: "साप्ताहिक कन्फेशन और अगले 7 दिनों का रीसेट।",
    xpReward: 150
  }
];

// ==========================================
// 4. THE 4 PROPOSED BLUEPRINT E-BOOKS (पूर्ण पाठ्यक्रम)
// ==========================================
export const FOUR_FOUNDATIONAL_EBOOKS: LibraryBook[] = [];

// ==========================================
// 5. INTERACTIVE SELF-DIAGNOSTIC (क्रूसिबल कैलिब्रेटर)
// ==========================================
export interface DiagnosticQuestion {
  id: string;
  question: string;
  hindiQuestion: string;
  category: 'nervous_system' | 'delusion' | 'action_reality' | 'financial_defense';
  options: {
    label: string;
    hindiLabel: string;
    fragilityScore: number; // 0 is grounded sovereign, 10 is delusional fragile
    diagnosticTag: string;
  }[];
}

export const CRUCIBLE_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'q-roast-response',
    question: "When a colleague, family member, or acquaintance publicly roasts or mocks you, what is your immediate reflex?",
    hindiQuestion: "जब कोई सहकर्मी या रिश्तेदार सार्वजनिक रूप से आप पर तंज कसता है या रोस्ट करता है, तो आपकी तत्काल प्रतिक्रिया क्या होती है?",
    category: 'nervous_system',
    options: [
      {
        label: "Eyes tear up, pulse races, I either freeze awkwardly or explode defensively.",
        hindiLabel: "आँखों में आँसू या कंपकंपी आ जाती है, दिल तेजी से धड़कता है और दिनभर अपमान महसूस होता है।",
        fragilityScore: 10,
        diagnosticTag: "High Nervous System Fragility (अति-संवेदनशील नर्वस सिस्टम)"
      },
      {
        label: "I force a fake nervous laugh to hide my embarrassment, then replay it in bed for 3 nights.",
        hindiLabel: "झूठी हंसी हंसकर बात टाल देता हूँ, लेकिन रातभर उसी अपमान के बारे में सोचकर जलता रहता हूँ।",
        fragilityScore: 7,
        diagnosticTag: "Repressed Resentment (दबा हुआ आक्रोश)"
      },
      {
        label: "I offer a calm, unbothered 5-second silence, realizing their roast reveals their own insecurity.",
        hindiLabel: "5 सेकंड की शांत चुप्पी रखता हूँ; समझता हूँ कि उनका तंज उनकी अपनी असुरक्षा का प्रकटीकरण है।",
        fragilityScore: 1,
        diagnosticTag: "Grounded Social Armor (अभ्यस्त भावनात्मक कवच)"
      }
    ]
  },
  {
    id: 'q-ambition-vs-bank',
    question: "What is the relationship between your grand life ambitions and your current personal cashflow?",
    hindiQuestion: "आपके जीवन के भव्य सपनों और वर्तमान बैंक खाते की वास्तविकता के बीच क्या संबंध है?",
    category: 'delusion',
    options: [
      {
        label: "I fantasize about building vast empires (Ashoka/Elon), but my bank account is near zero and dependent on parents.",
        hindiLabel: "अशोक या एलन मस्क जैसे साम्राज्य के सपने देखता हूँ, लेकिन खाते में ₹500 भी नहीं और खर्च माता-पिता से लेता हूँ।",
        fragilityScore: 10,
        diagnosticTag: "Grand Delusion Trap (अशोक साम्राज्य सिंड्रोम)"
      },
      {
        label: "I have some irregular pocket money / stipend, but constantly get distracted by new grand ideas.",
        hindiLabel: "थोड़ा-बहुत जेब खर्च निकाल लेता हूँ, लेकिन हर हफ्ते नए-नए बड़े विचारों में भटक जाता हूँ।",
        fragilityScore: 6,
        diagnosticTag: "Distracted Dabbler (भटका हुआ महत्वाकांक्षी)"
      },
      {
        label: "I have a disciplined focus on mastering one high-income skill, with an active emergency fund building.",
        hindiLabel: "एकल हाई-इनकम कौशल पर 100% ध्यान है और 6 महीने की वित्तीय ढाल तैयार करने में लगा हूँ।",
        fragilityScore: 1,
        diagnosticTag: "Sovereign Operator (ज़मीनी ऑपरेटर)"
      }
    ]
  },
  {
    id: 'q-consumption-ratio',
    question: "In an average week, what is your ratio of consuming self-help/philosophy videos vs executing real-world drills?",
    hindiQuestion: "सप्ताह में आपके ज्ञान बटोरने (वीडियो/कोट्स/किताबें) और ज़मीनी मैदान में उतरने का क्या अनुपात है?",
    category: 'action_reality',
    options: [
      {
        label: "90% watching YouTube documentaries, Dark Psychology & Chanakya reels; 10% real action.",
        hindiLabel: "90% यूट्यूब वीडियो, कोट्स और रणनीतिक डॉक्यूमेंट्री देखना; केवल 10% वास्तविक ज़मीनी काम।",
        fragilityScore: 9,
        diagnosticTag: "Mental Pornography Consumer (बौद्धिक नशे का आदी)"
      },
      {
        label: "50-50, but I easily quit when a real-world task creates social friction or awkwardness.",
        hindiLabel: "कोशिश करता हूँ, लेकिन जैसे ही किसी अजनबी से बात करने या मोलभाव में असहजता होती है, पीछे हट जाता हूँ।",
        fragilityScore: 5,
        diagnosticTag: "Friction Avoidant (असुविधा से भागने वाला)"
      },
      {
        label: "I refuse to consume new content until my weekly ground drill and work hours are documented.",
        hindiLabel: "जब तक आज का ज़मीनी असाइनमेंट और फील्ड लॉग पूरा न हो, कोई नया वीडियो या किताब नहीं खोलता।",
        fragilityScore: 1,
        diagnosticTag: "Crucible Practitioner (निर्मम अभ्यासी)"
      }
    ]
  },
  {
    id: 'q-family-blackmail',
    question: "When parents or extended relatives try to impose emotional guilt regarding social status or marriage:",
    hindiQuestion: "जब परिवार या रिश्तेदार 'लोग क्या कहेंगे' या त्याग के नाम पर भावनात्मक ब्लैकमेल करते हैं, तो आप:",
    category: 'financial_defense',
    options: [
      {
        label: "Succumb out of overwhelming guilt, feeling helpless and trapped in their expectations.",
        hindiLabel: "अत्यधिक गिल्ट में आकर उनके फैसलों के आगे घुटने टेक देता हूँ और अंदर ही अंदर घुटता हूँ।",
        fragilityScore: 9,
        diagnosticTag: "Conformity Enslaved (सामाजिक गिल्ट का बंधक)"
      },
      {
        label: "Start shouting, creating dramatic family arguments that drain all my energy for days.",
        hindiLabel: "चिल्लाने और बहस करने लगता हूँ, जिससे घर में कलह होती है और मेरा पूरा हफ्ता बर्बाद हो जाता है।",
        fragilityScore: 7,
        diagnosticTag: "Reactive Rebel (दिशाहीन विद्रोही)"
      },
      {
        label: "Use Grey Rock & firm calm boundaries. Respect their perspective, but remain unshakeable in my own path.",
        hindiLabel: "ग्रे रॉक तकनीक अपनाता हूँ। उनकी भावना का आदर करते हुए शांत स्वर में अपनी सीमाएं स्पष्ट रखता हूँ।",
        fragilityScore: 1,
        diagnosticTag: "Boundaried Sovereign (मूक संप्रभु)"
      }
    ]
  }
];
