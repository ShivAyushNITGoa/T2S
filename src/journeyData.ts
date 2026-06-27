import { JourneyModule } from './types';

export function getCategoryForDay(day: number): string {
  // Body Language
  const bodyLanguageDays = [5, 9, 16, 17, 25, 28, 33, 34, 56, 61, 71, 84, 92];
  if (bodyLanguageDays.includes(day)) return 'Body Language';

  // Manipulation
  const manipulationDays = [6, 62, 63, 64, 66, 67, 68, 69, 70, 72, 73, 74, 75, 76, 77, 78, 79, 80];
  if (manipulationDays.includes(day)) return 'Manipulation';

  // Discipline
  const disciplineDays = [1, 3, 8, 11, 12, 15, 18, 21, 22, 26, 27, 29, 30, 31, 36, 42, 50, 55];
  if (disciplineDays.includes(day)) return 'Discipline';

  // Mystery & Presence
  const mysteryDays = [2, 13, 19, 37, 43, 48, 51, 54, 57];
  if (mysteryDays.includes(day)) return 'Mystery & Presence';

  // Strategic Thinking
  const strategicThinkingDays = [4, 7, 10, 35, 38, 44, 46, 47, 52, 60, 81, 82, 83, 85, 86, 87, 88, 89, 90, 93, 94, 95, 96, 97, 98, 99];
  if (strategicThinkingDays.includes(day) || (day >= 81 && day <= 100 && day !== 100 && day !== 92)) return 'Strategic Thinking';

  // Default is Mindset
  return 'Mindset';
}

const RAW_JOURNEY_MODULES_BASE: Omit<JourneyModule, 'id'>[] = [
  // PHASE 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'
  {
    day: 1,
    title: "Notification Death",
    description: "फोन की Settings में जाओ और Social Media के सभी नोटिफिकेशन्स स्थायी रूप से ऑफ कर दो।",
    command: "फोन की Settings में जाओ और Social Media के सभी नोटिफिकेशन्स स्थायी रूप से ऑफ कर दो।",
    logic: "नोटिफिकेशन्स दूसरे लोगों के 'Agenda' हैं। जब फोन बजता है और तुम उसे देखते हो, तो तुम उनके गुलाम बन जाते हो। अपनी 'अटेंशन' का मालिक खुद बनो।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 2,
    title: "Status Death",
    description: "अगले 7 दिन तक WhatsApp, Instagram या कहीं भी कोई स्टेटस या स्टोरी न डालें।",
    command: "अगले 7 दिन तक WhatsApp, Instagram या कहीं भी कोई स्टेटस या स्टोरी न डालें।",
    logic: "तुम हर पल दुनिया को यह बता रहे हो कि तुम क्या कर रहे हो। यह 'Pawn' की निशानी है। जब तुम गायब होते हो, तो तुम्हारी 'Value' और 'Mystery' बढ़ती है।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 3,
    title: "Digital Ghosting",
    description: "फोन को केवल ज़रूरी कॉल्स के लिए इस्तेमाल करें। फालतू ब्राउज़िंग बंद।",
    command: "फोन को केवल ज़रूरी कॉल्स के लिए इस्तेमाल करें। फालतू ब्राउज़िंग बंद।",
    logic: "डोपामिन (Dopamine) की लत तुम्हें कमज़ोर बनाती है। जब तुम फोन छोड़ते हो, तो तुम्हारा दिमाग 'Strategic Thinking' के लिए खाली होता है।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 4,
    title: "Observer Shift",
    description: "आज किसी भी मीटिंग या बातचीत में सबसे अंत में बोलें। बस सुनें।",
    command: "आज किसी भी मीटिंग या बातचीत में सबसे अंत में बोलें। बस सुनें।",
    logic: "जो पहले बोलता है, वह अपने पत्ते खोल देता है। जो सुनता है, वह जानकारी (Information) इकट्ठा करता है। जानकारी ही पावर है।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 5,
    title: "The 5-Second Rule",
    description: "किसी भी सवाल का जवाब देने से पहले मन में ५ तक गिनें, फिर बोलें।",
    command: "किसी भी सवाल का जवाब देने से पहले मन में ५ तक गिनें, फिर बोलें।",
    logic: "यह सन्नाटा सामने वाले को बेचैन करता है। उन्हें लगता है कि तुम कुछ गहरा सोच रहे हो। यह 'Authority' दिखाता है।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 6,
    title: "Reaction Freeze",
    description: "अगर कोई अपमान करे, तो चिल्लाने के बजाय बस उसे शांत नज़रों से देखो और मुस्कुरा दो।",
    command: "अगर कोई अपमान करे, तो चिल्लाने के बजाय बस उसे शांत नज़रों से देखो और मुस्कुरा दो।",
    logic: "तुम्हारा 'Reaction' ही सामने वाले का इनाम है। जब तुम रिएक्ट नहीं करते, तो वह अपनी ही नज़रों में छोटा हो जाता है।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 7,
    title: "Social Audit",
    description: "अपनी Contact/Follow लिस्ट से उन 10 लोगों को निकालें जो केवल नकारात्मकता फैलाते हैं।",
    command: "अपनी Contact/Follow लिस्ट से उन 10 लोगों को निकालें जो केवल नकारात्मकता फैलाते हैं।",
    logic: "तुम उन लोगों का औसत हो जिनके साथ तुम रहते हो। 'Energy Parasites' को हटाना ही सर्वाइवल है।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 8,
    title: "Deep Isolation",
    description: "रात 8 बजे फोन ऑफ करें और अपनी डायरी में अपने ३ सबसे बड़े डर (Fears) लिखें।",
    command: "रात 8 बजे फोन ऑफ करें और अपनी डायरी में अपने ३ सबसे बड़े डर (Fears) लिखें।",
    logic: "जब तक तुम अपने डरों को नाम नहीं दोगे, वे तुम्हें कंट्रोल करेंगे। अँधेरे का सामना करना ही 'Sovereignty' की शुरुआत है।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 9,
    title: "No-Sorry Protocol",
    description: "आज बिना वजह \"सॉरी\" बोलना बंद करें। केवल तभी बोलें जब वाकई कोई बड़ी गलती हो।",
    command: "आज बिना वजह \"सॉरी\" बोलना बंद करें। केवल तभी बोलें जब वाकई कोई बड़ी गलती हो।",
    logic: " can be translation of: ज़्यादा माफी माँगने वाला इंसान 'Submissive' (दब्बू) दिखता है। अपनी गलतियों को 'निर्णय' की तरह स्वीकार करना सीखें।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 10,
    title: "Advice Filter",
    description: "आज न किसी को मुफ्त सलाह दें, न ही किसी की सलाह मानें।",
    command: "आज न किसी को मुफ्त सलाह दें, न ही किसी की सलाह मानें।",
    logic: "अपनी अक्ल पर भरोसा करना सीखें। सलाह देना अपनी 'Power' को मुफ्त में बाँटना है।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 11,
    title: "Sacrifice Move",
    description: "अपनी सबसे प्रिय खाने की चीज़ (चीनी/कैफीन) का आज त्याग करें।",
    command: "अपनी सबसे प्रिय खाने की चीज़ (चीनी/कैफीन) का आज त्याग करें।",
    logic: "अगर तुम अपनी जीभ को कंट्रोल नहीं कर सकते, तो तुम दुनिया को क्या खाक कंट्रोल करोगे?",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 12,
    title: "Silent Meal",
    description: "आज का भोजन पूरी तरह अकेले और बिना किसी स्क्रीन के करें।",
    command: "आज का भोजन पूरी तरह अकेले और बिना किसी स्क्रीन के करें।",
    logic: "अकेलेपन में सुकून ढूँढना सीखो। जो खुद के साथ नहीं रह सकता, वह कभी 'Sovereign' नहीं बन सकता।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 13,
    title: "Minimum Speech",
    description: "आज केवल उतना ही बोलें जितना बहुत ज़रूरी हो। शब्द बचाएँ।",
    command: "आज केवल उतना ही बोलें जितना बहुत ज़रूरी हो। शब्द बचाएँ।",
    logic: "कम बोलना तुम्हारी रहस्यमयी ताक़त (Enigma) को बढ़ाता है। लोग तुम्हारे हर शब्द को ध्यान से सुनेंगे।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 14,
    title: "Radical Honesty (Internal)",
    description: "खुद से बोले गए एक पुराने झूठ को पहचानें और उसे स्वीकार करें।",
    command: "खुद से बोले गए एक पुराने झूठ को पहचानें और उसे स्वीकार करें।",
    logic: "खुद को धोखा देना सबसे बड़ी गुलामी है। सच तुम्हें 'Cold' और 'Focused' बनाएगा।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 15,
    title: "Dark Solitude",
    description: "१ घंटा अँधेरे कमरे में बिना हिले-डुले बैठें।",
    command: "१ घंटा अँधेरे कमरे में बिना हिले-डुले बैठें।",
    logic: "यह मानसिक सहनशक्ति (Mental Toughness) का टेस्ट है। अपने दिमाग के शोर को शांत करना सीखें।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 16,
    title: "Appearance Upgrade",
    description: "आज सबसे साफ़ और 'Sharp' कपड़े पहनें, भले ही घर पर हों।",
    command: "आज सबसे साफ़ और 'Sharp' कपड़े पहनें, भले ही घर पर हों।",
    logic: "तुम्हारी 'Appearance' तुम्हारी पहली 'Command' है। खुद को 'High-Value' महसूस कराना शुरू करो।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 17,
    title: "Stranger Test",
    description: "किसी अजनबी से आँखें मिलाकर हल्का सा सिर हिलाएं और आगे बढ़ें। नज़रें न चुराएं।",
    command: "किसी अजनबी से आँखें मिलाकर हल्का सा सिर हिलाएं और आगे बढ़ें। नज़रें न चुराएं।",
    logic: "आँखों का संपर्क (Eye Contact) डोमिनेंस का संकेत है। शिकार हमेशा नज़रें चुराता है, शिकारी नहीं।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 18,
    title: "Time Audit",
    description: "कल तुमने कहाँ-कहाँ वक्त बर्बाद किया, उसकी लिस्ट बनाओ और उसे फाड़ दो।",
    command: "कल तुमने कहाँ-कहाँ वक्त बर्बाद किया, उसकी लिस्ट बनाओ और उसे फाड़ दो।",
    logic: "वक्त ही तुम्हारी असली दौलत है। उसे फालतू लोगों को दान देना बंद करो।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 19,
    title: "Unavailability Act",
    description: "आज कम से कम ३ ज़रूरी कॉल्स इग्नोर करें और १ घंटे बाद कॉल बैक करें।",
    command: "आज कम से कम ३ ज़रूरी कॉल्स इग्नोर करें और १ घंटे बाद कॉल बैक करें।",
    logic: "अपनी 'Availability' को कम करना तुम्हारी 'Value' बढ़ाता है। लोगों को इंतज़ार करने दो।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },
  {
    day: 20,
    title: "Identity Reset",
    description: "अपने पुराने 'कमज़ोर' रूप की किसी चीज़ को नष्ट कर दें।",
    command: "अपने पुराने 'कमज़ोर' रूप की किसी चीज़ को नष्ट कर दें।",
    logic: "पुराने 'तुम' की मौत ज़रूरी है ताकि नया 'Hunter' जन्म ले सके।",
    phase: "Phase 1: THE PURGE (Days 1 - 20) — 'Validation का विसर्जन'",
    isPremium: false
  },

  // PHASE 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'
  {
    day: 21,
    title: "Cold Initiation",
    description: "सुबह 5:00 AM उठें और ठंडे पानी से नहाएं।",
    command: "सुबह 5:00 AM उठें और ठंडे पानी से नहाएं।",
    logic: "जब तुम सुबह-सुबह अपने शरीर की बगावत को कुचल देते हो, तो पूरा दिन तुम्हारी 'कमांड' पर चलता है।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 22,
    title: "High-Intensity Siege",
    description: "१ घंटा ऐसा वर्कआउट करें जहाँ तुम्हें 'दर्द' महसूस हो।",
    command: "१ घंटा ऐसा वर्कआउट करें जहाँ तुम्हें 'दर्द' महसूस हो।",
    logic: "दर्द सहन करना दिमाग को मज़बूत बनाता है। एक कमज़ोर शरीर कभी भारी मुकुट (Throne) नहीं उठा सकता।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 23,
    title: "No-Explanation Rule",
    description: "आज अपनी किसी भी हरकत की सफाई न दें। बस \"मैंने किया\" कहें।",
    command: "आज अपनी किसी भी हरकत की सफाई न दें। बस \"मैंने किया\" कहें।",
    logic: "सफाई (Explanation) वो देता है जो डरा हुआ होता है। एक सम्राट कभी मुजरिम की तरह व्यवहार नहीं करता।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 24,
    title: "Snap Decisions",
    description: "छोटे फैसले (क्या पहनना है, क्या खाना है) २ सेकंड में लें।",
    command: "छोटे फैसले (क्या पहनना है, क्या खाना है) २ सेकंड में लें।",
    logic: "हिचकिचाहट (Hesitation) कमजोरी का लक्षण है। तेज़ फैसले लेना 'Certainty' का गुण है।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 25,
    title: "Power Posture",
    description: "पूरा दिन अपनी रीढ़ की हड्डी सीधी और गर्दन ऊँची रखें।",
    command: "पूरा दिन अपनी रीढ़ की हड्डी सीधी और गर्दन ऊँची रखें।",
    logic: "तुम्हारी बॉडी लैंग्वेज तुम्हारे दिमाग को सिग्नल भेजती है। सीधा खड़ा होना 'Confidence' को हकीकत बनाता है।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 26,
    title: "Fasting Command",
    description: "आज दिन भर में केवल २ बार भोजन करें। बीच में कुछ नहीं।",
    command: "आज दिन भर में केवल २ बार भोजन करें। बीच में कुछ नहीं।",
    logic: "अपनी भूख पर विजय पाना मतलब अपनी इच्छाओं का मालिक बनना।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 27,
    title: "Bad Habit Kill",
    description: "अपनी सबसे बुरी आदत को आज के लिए 'ना' कहें।",
    command: "अपनी सबसे बुरी आदत को आज के लिए 'ना' कहें।",
    logic: "अगर तुम अपनी आदतों के गुलाम हो, तो तुम आज़ाद नहीं हो।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 28,
    title: "Low & Slow Voice",
    description: "आज धीमी, गहरी और भारी आवाज़ में बात करें। चिल्लाएँ नहीं।",
    command: "आज धीमी, गहरी और भारी आवाज़ में बात करें। चिल्लाएँ नहीं।",
    logic: "ऊँची आवाज़ असुरक्षा (Insecurity) दिखाती है। गहरी आवाज़ 'Authority' दिखाती है।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 29,
    title: "Focus Siege",
    description: "४ घंटे बिना फोन के एक ही प्रोजेक्ट पर काम करें।",
    command: "४ घंटे बिना फोन के एक ही प्रोजेक्ट पर काम करें।",
    logic: "'Deep Work' ही वह लेवरेज है जो तुम्हें भीड़ से ५ साल आगे ले जाएगा।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 30,
    title: "Junk Purge",
    description: "आज कोई जंक फूड, मीठा या फालतू यूट्यूब वीडियो नहीं।",
    command: "आज कोई जंक फूड, मीठा या फालतू यूट्यूब वीडियो नहीं।",
    logic: "कचरा अंदर जाएगा, तो विचार भी कचरा ही निकलेंगे। 'Intellectual Diet' शुरू करो।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 31,
    title: "Financial Audit",
    description: "अपनी हर एक पाई का हिसाब लिखें।",
    command: "अपनी हर एक पाई का हिसाब लिखें।",
    logic: "जो पैसा कंट्रोल नहीं कर सकता, वह साम्राज्य नहीं चला सकता।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 32,
    title: "Fear Encounter",
    description: "आज उस व्यक्ति से बात करें जिससे आपको हिचकिचाहट होती है।",
    command: "आज उस व्यक्ति से बात करें जिससे आपको हिचकिचाहट होती है।",
    logic: "डर के पार ही 'Dominance' है।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 33,
    title: "Expand Your Space",
    description: "जहाँ भी बैठें, थोडा फैलकर बैठें। अपनी जगह (Space) लें।",
    command: "जहाँ भी बैठें, थोडा फैलकर बैठें। अपनी जगह (Space) लें।",
    logic: "कम जगह घेरना शिकार की निशानी है। अपनी उपस्थिति का अहसास कराओ।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 34,
    title: "Mirror Gaze (Advanced)",
    description: "१५ मिनट बिना पलक झपकाए आईने में अपनी पुतलियों को देखें।",
    command: "१५ मिनट बिना पलक झपकाए आईने में अपनी पुतलियों को देखें।",
    logic: "अपनी नज़रों को स्थिर करना सीखें। एक स्थिर नज़र किसी को भी झुका सकती है।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 35,
    title: "Vision Mapping",
    description: "अपने अगले ५ साल का प्लान १००० शब्दों में लिखें।",
    command: "अपने अगले ५ साल का प्लान १००० शब्दों में लिखें।",
    logic: "जिसके पास नक्शा नहीं है, वह भटकने के लिए ही बना है।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 36,
    title: "Luxury Sacrifice",
    description: "अपनी पसंद की किसी एक विलासिता (AC/Comfort) का आज त्याग करें।",
    command: "अपनी पसंद की किसी एक विलासिता (AC/Comfort) का आज त्याग करें।",
    logic: "'Comfort' तुम्हें सुस्त बनाता है। अपनी धार तेज़ रखो।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 37,
    title: "Silence as Question",
    description: "आज किसी के सवाल का जवाब देने के बजाय सिर्फ खामोश रहें और उसे देखें।",
    command: "आज किसी के सवाल का जवाब देने के बजाय सिर्फ खामोश रहें और उसे देखें।",
    logic: "खामोशी सामने वाले को अपनी बात खुद ही काटने पर मज़बूर कर देती है।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 38,
    title: "Circle Purge",
    description: "पहचानें कौन गद्दार हो सकता है और उससे दूरी बनाएं।",
    command: "पहचानें कौन गद्दार हो सकता है और उससे दूरी बनाएं।",
    logic: "'Inner Circle' की कमज़ोरी ही बड़े साम्राज्यों के गिरने की वजह होती है।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 39,
    title: "Stoic Indifference",
    description: "आज किसी भी 'बुरी खबर' पर कोई भाव (Emotion) न दिखाएं।",
    command: "आज किसी भी 'बुरी खबर' पर कोई भाव (Emotion) न दिखाएं।",
    logic: "भावनाएं तुम्हें 'Predictable' बनाती हैं। पत्थर की तरह ठंडे बनो।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },
  {
    day: 40,
    title: "Predator Initiation",
    description: "आज खुद को 'शिकारी' (Predator) घोषित करें।",
    command: "आज खुद को 'शिकारी' (Predator) घोषित करें।",
    logic: "तुम्हारा मानसिक स्वीकार ही तुम्हारी नई हकीकत है।",
    phase: "Phase 2: THE FORTIFICATION (Days 21 - 40) — 'अनुशासन का किला'",
    isPremium: true
  },

  // PHASE 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'
  {
    day: 41,
    title: "The Hard No",
    description: "आज हर उस रिक्वेस्ट को 'ना' कहें जो आपके समय की बर्बादी है।",
    command: "आज हर उस रिक्वेस्ट को 'ना' कहें जो आपके समय की बर्बादी है।",
    logic: "'ना' कहना तुम्हारी पहली आज़ादी है।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 42,
    title: "Sensory Deprivation",
    description: "२ घंटे पूरी तरह अँधेरे और सन्नाटे में बैठें।",
    command: "२ घंटे पूरी तरह अँधेरे और सन्नाटे में बैठें।",
    logic: "外部 शोर बंद होगा, तभी अंदर की 'Command' सुनाई देगी।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 43,
    title: "Caller Scarcity",
    description: "आज कोई भी कॉल पहली बार में न उठाएं।",
    command: "आज कोई भी कॉल पहली बार में न उठाएं।",
    logic: "जो हर वक्त मिलता है, उसकी कोई इज़्ज़त नहीं होती।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 44,
    title: "Result Only",
    description: "अपने काम की प्रोसेस न बताएं, केवल अंत में नतीजा दिखाएं।",
    command: "अपने काम की प्रोसेस न बताएं, केवल अंत में नतीजा दिखाएं।",
    logic: "रहस्य (Mystery) तुम्हारी ताक़त को बढ़ा-चढ़ाकर दिखाता है।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 45,
    title: "Parasite Cleanse",
    description: "उन ३ लोगों को ब्लॉक करें जो केवल मतलब के लिए याद करते हैं।",
    command: "उन ३ लोगों को ब्लॉक करें जो केवल मतलब के लिए याद करते हैं।",
    logic: "अहसान फरामोश लोगों के लिए तुम्हारे साम्राज्य में कोई जगह नहीं है।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 46,
    title: "Information Erasure",
    description: "सोशल मीडिया से अपनी पुरानी और निजी जानकारी डिलीट करें।",
    command: "सोशल मीडिया से अपनी पुरानी और निजी जानकारी डिलीट करें।",
    logic: "दुश्मन वही इस्तेमाल करेगा जो तुम उसे दोगे। 'Invisible' बनो।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 47,
    title: "Intentional Absence",
    description: "आज किसी ज़रूरी ग्रुप चैट में बिल्कुल हिस्सा न लें।",
    command: "आज किसी ज़रूरी ग्रुप चैट में बिल्कुल हिस्सा न लें।",
    logic: "तुम्हारी कमी को लोगों को महसूस करने दो।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 48,
    title: "Secret Win",
    description: "आज कोई बड़ी जीत हासिल करें और किसी को न बताएं।",
    command: "आज कोई बड़ी जीत हासिल करें और किसी को न बताएं।",
    logic: "अपनी खुशी के लिए दूसरों की तालियों पर निर्भर न रहें।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 49,
    title: "Rumor Shield",
    description: "अगर तुम्हारे बारे में कोई गलत बात सुने, तो उस पर रिएक्ट न करें।",
    command: "अगर तुम्हारे बारे में कोई गलत बात सुने, तो उस पर रिएक्ट न करें।",
    logic: "तुम्हारी प्रतिक्रिया अफवाह को 'सच' साबित करती है। खामोशी उसे मार देती है।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 50,
    title: "Deep Work Siege",
    description: "आज ८ घंटे केवल अपने काम पर ध्यान दें।",
    command: "आज ८ घंटे केवल अपने काम पर ध्यान दें।",
    logic: "मेहनत का कोई विकल्प नहीं है, बशर्ते वह सही दिशा में हो।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 51,
    title: "The Rejection Move",
    description: "आज किसी एक ऑफर या फायदे को अपनी शर्तों के लिए ठुकरा दें।",
    command: "आज किसी एक ऑफर या फायदे को अपनी शर्तों के लिए ठुकरा दें।",
    logic: "यह दिखाता है कि तुम बिकने वालों में से नहीं हो।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 52,
    title: "Reputation Check",
    description: "आज शांति से विश्लेषण करें कि लोग आपसे डरते हैं या प्यार करते हैं?",
    command: "आज शांति से विश्लेषण करें कि लोग आपसे डरते हैं या प्यार करते हैं?",
    logic: "मैकियावेली के अनुसार, डराया जाना ज़्यादा सुरक्षित है।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 53,
    title: "Emotional Independence",
    description: "आज साबित करें कि आप अकेले भी बहुत खुश हैं।",
    command: "आज साबित करें कि आप अकेले भी बहुत खुश हैं।",
    logic: "जो किसी के बिना नहीं रह सकता, वह उसका गुलाम है।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 54,
    title: "Reward Presence",
    description: "आज केवल वहीं जाएं जहाँ आपको सर्वोच्च सम्मान मिले।",
    command: "आज केवल वहीं जाएं जहाँ आपको सर्वोच्च सम्मान मिले।",
    logic: "अपनी मौजूदगी को 'पुरस्कार' बनाओ।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 55,
    title: "Second-by-Second Ownership",
    description: "आज हर मिनट का हिसाब रखें कि आपने क्या किया।",
    command: "आज हर मिनट का हिसाब रखें कि आपने क्या किया।",
    logic: "समय ही वह एकमात्र चीज़ है जिसे तुम दोबारा नहीं कमा सकते।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 56,
    title: "Power Handshake",
    description: "आज किसी भी बड़े व्यक्ति से हाथ मिलाते वक्त उसकी आँखों में आँखें डालो।",
    command: "आज किसी भी बड़े व्यक्ति से हाथ मिलाते वक्त उसकी आँखों में आँखें डालो।",
    logic: "तुम किसी से कम नहीं हो, यह अहसास तुम्हारी आँखों से झलकना चाहिए।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 57,
    title: "Silence as Crown",
    description: "आज घर या ऑफिस में सबसे कम बोलने वाले व्यक्ति बनें।",
    command: "आज घर या ऑफिस में सबसे कम बोलने वाले व्यक्ति बनें।",
    logic: "सम्राट सबसे कम बोलता है, और जब बोलता है तो दुनिया सुनती है।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 58,
    title: "Past Kill",
    description: "अपनी किसी पुरानी कमज़ोरी को आज अंतिम विदाई दें।",
    command: "अपनी किसी पुरानी कमज़ोरी को आज अंतिम विदाई दें।",
    logic: "यादें तुम्हें पीछे खींचती हैं। भविष्य को देखो।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 59,
    title: "Liberty Celebration",
    description: "आज अपनी मर्जी का कोई एक काम करें जो समाज को पसंद न हो।",
    command: "आज अपनी मर्जी का कोई एक काम करें जो समाज को पसंद न हो।",
    logic: "तुम किसी के जवाबदेह नहीं हो।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },
  {
    day: 60,
    title: "Strategist Rank",
    description: "स्वीकार करें कि अब तुम सिस्टम के खिला़ड़ी हो।",
    command: "स्वीकार करें कि अब तुम सिस्टम के खिला़ड़ी हो।",
    logic: "आज से तुम्हारी हर चाल 'रणनीति' है।",
    phase: "Phase 3: STRATEGIC VANISHING (Days 41 - 60) — 'दुर्लभता का जादू'",
    isPremium: true
  },

  // PHASE 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'
  {
    day: 61,
    title: "Mirroring Shadows",
    description: "आज बातचीत में सामने वाले की बॉडी लैंग्वेज को कॉपी करें।",
    command: "आज बातचीत में सामने वाले की बॉडी लैंग्वेज को कॉपी करें।",
    logic: "इंसान को अपने जैसा व्यक्ति पसंद आता है। उसका 'Defense' गिराने का यह बेस्ट तरीका है।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 62,
    title: "Insecurity Mapping",
    description: "अपने करीबी की सबसे बड़ी कमज़ोरी पहचानें और उसे नोट करें।",
    command: "अपने करीबी की सबसे बड़ी कमज़ोरी पहचानें और उसे नोट करें।",
    logic: "जो इंसान अपनी कमजोरी छिपाता है, वही उसका सबसे बड़ा 'Leverage' है।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 63,
    title: "The Guilt Trap",
    description: "किसी पर एक ऐसा अहसान करें जिसका वह बदला न दे सके।",
    command: "किसी पर एक ऐसा अहसान करें जिसका वह बदला न दे सके।",
    logic: "अहसान एक 'मानसिक कर्ज' है जो सामने वाले की आवाज़ को दबा देता है।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 64,
    title: "Hot & Cold Game",
    description: "आज किसी को बहुत अटेंशन दें और शाम को बिल्कुल ठंडे हो जाएं।",
    command: "आज किसी को बहुत अटेंशन दें और शाम को बिल्कुल ठंडे हो जाएं।",
    logic: "यह अनिश्चितता (Uncertainty) सामने वाले को तुम्हारा 'आदी' बना देती है।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 65,
    title: "Linguistic Power",
    description: "आज अपनी आवाज़ से \"कोशिश\", \"शायद\" जैसे शब्द निकाल दें।",
    command: "आज अपनी आवाज़ से \"कोशिश\", \"शायद\" जैसे शब्द निकाल दें।",
    logic: "कमज़ोर शब्द तुम्हारी 'Command' को कमज़ोर करते हैं।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 66,
    title: "Idea Planting",
    description: "किसी के दिमाग में अपनी बात ऐसे डालें कि उसे लगे ये 'उसका अपना' आइडिया है।",
    command: "किसी के दिमाग में अपनी बात ऐसे डालें कि उसे लगे ये 'उसका अपना' आइडिया है।",
    logic: "इंसान अपने विचारों के लिए मर सकता है, दूसरों के लिए नहीं।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 67,
    title: "Emotional Hunger Audit",
    description: "पहचानें कि सामने वाला 'तारीफ' का भूखा है या 'सुरक्षा' का?",
    command: "पहचानें कि सामने वाला 'तारीफ' का भूखा है या 'सुरक्षा' का?",
    logic: "उसकी भूख की चाबी बनो, और तुम उसके मालिक बन जाओगे।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 68,
    title: "The Pause Master",
    description: "बोलते समय वाक्यों के बीच लम्बा 'पॉज' लें।",
    command: "बोलते समय वाक्यों के बीच लम्बा 'पॉज' लें।",
    logic: "यह सन्नाटा तुम्हारी बात में 'वजन' और 'गहराई' जोड़ता है।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 69,
    title: "Visual Discipline",
    description: "आज किसी की गलती पर चिल्लाने के बजाय उसे सिर्फ घूरें।",
    command: "आज किसी की गलती पर चिल्लाने के बजाय उसे सिर्फ घूरें।",
    logic: "खामोश खौफ किसी भी डांट से ज़्यादा असरदार होता है।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 70,
    title: "Privacy Fortress",
    description: "किसी के निजी सवाल का जवाब एक सवाल से दें।",
    command: "किसी के निजी सवाल का जवाब एक सवाल से दें।",
    logic: "अपनी जानकारी छिपाना ही 'Invisibility' का आधार है।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 71,
    title: "Ego Stroking",
    description: "आज अपने फायदे के लिए किसी मूर्ख की तारीफ करें।",
    command: "आज अपने फायदे के लिए किसी मूर्ख की तारीफ करें।",
    logic: "जब तुम किसी का अहंकार बढ़ाते हो, तो वह अपनी चौकसी (Defense) खो देता है।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 72,
    title: "Silent Authority",
    description: "किसी ग्रुप में बिना बोले अपनी उपस्थिति का अहसास कराएं।",
    command: "किसी ग्रुप में बिना बोले अपनी उपस्थिति का अहसास कराएं।",
    logic: "पावर शोर नहीं मचाती, वह महसूस की जाती है।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 73,
    title: "Negotiation Drill",
    description: "आज किसी भी चीज़ की कीमत कम करवाएं (मोल-भाव करें)।",
    command: "आज किसी भी चीज़ की कीमत कम करवाएं (मोल-भाव करें)।",
    logic: "यह तुम्हारे 'Persuasion' और 'Grit' का टेस्ट है।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 74,
    title: "Leverage Demonstration",
    description: "आज किसी को अहसास कराएं कि तुम्हारे बिना उसका नुकसान होगा।",
    command: "आज किसी को अहसास कराएं कि तुम्हारे बिना उसका नुकसान होगा।",
    logic: "अनिवार्यता (Indispensability) ही असली सत्ता है।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 75,
    title: "Word Warfare",
    description: "शब्दों को बहुत सोच-समझकर और मज़बूती से चलाएं।",
    command: "शब्दों को बहुत सोच-समझकर और मज़बूती से चलाएं।",
    logic: "एक गलत शब्द तुम्हारा साम्राज्य गिरा सकता है।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 76,
    title: "Dark Seduction",
    description: "आज किसी को अपनी बातों के जादू में फँसाएँ।",
    command: "आज किसी को अपनी बातों के जादू में फँसाएँ।",
    logic: "सम्मोहन (Hypnosis) का मतलब ही यही है—दूसरों की इच्छाशक्ति को शून्य करना।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 77,
    title: "Loyalty Test",
    description: "किसी वफादार को एक झूठा लालच देकर देखें।",
    command: "किसी वफादार को एक झूठा लालच देकर देखें।",
    logic: "वफादारी तभी असली है जब उसे आज़माया गया हो।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 78,
    title: "Frame Control",
    description: "बातचीत का टॉपिक अपनी मर्ज़ी से बदलें और उसे वहीं रखें।",
    command: "बातचीत का टॉपिक अपनी मर्ज़ी से बदलें और उसे वहीं रखें।",
    logic: "जो चर्चा का रुख मोड़ता है, वही कमरे का असली 'Boss' होता है।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 79,
    title: "The Purge (Traitors)",
    description: "किसी एक ज़हरीले व्यक्ति को आज अपने जीवन से हमेशा के लिए निकालें।",
    command: "किसी एक ज़हरीले व्यक्ति को आज अपने जीवन से हमेशा के लिए निकालें।",
    logic: "सड़े हुए सेब को टोकरी से निकालना ही समझदारी है।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },
  {
    day: 80,
    title: "Mind Master Rank",
    description: "स्वीकार करें कि तुम रूहों के वास्तुकार बन चुके हो।",
    command: "स्वीकार करें कि तुम रूहों के वास्तुकार बन चुके हो।",
    logic: "अब तुम्हारी 'कमांड' से रूहें कांपेंगी।",
    phase: "Phase 4: MENTAL INCEPTION (Days 61 - 80) — 'रूहों की घेराबंदी'",
    isPremium: true
  },

  // PHASE 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'
  {
    day: 81,
    title: "Asset Building",
    description: "आज अपना 80% वक्त पैसा कमाने वाले 'Assets' बनाने में लगाएं।",
    command: "आज अपना 80% वक्त पैसा कमाने वाले 'Assets' बनाने में लगाएं।",
    logic: "पैसा वह पेट्रोल है जो सत्ता की गाड़ी चलाता है।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 82,
    title: "Leverage labor",
    description: "अपना कोई एक काम आज दूसरों से करवाएं।",
    command: "अपना कोई एक काम आज दूसरों से करवाएं।",
    logic: "सम्राट हाथ नहीं चलाता, वह 'दिमाग' चलाता है।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 83,
    title: "Grand Strategy",
    description: "अगले ५ साल का 'Battle Plan' पेपर पर बनाएं।",
    command: "अगले ५ साल का 'Battle Plan' पेपर पर बनाएं।",
    logic: "बिना प्लान के युद्ध जीतना महज़ एक इत्तेफाक होता है।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 84,
    title: "Indispensability",
    description: "सिस्टम में ऐसी जगह बनाओ कि तुम्हारे बिना काम रुक जाए।",
    command: "सिस्टम में ऐसी जगह बनाओ कि तुम्हारे बिना काम रुक जाए।",
    logic: "जो हटाया नहीं जा सकता, वही अजेय है।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 85,
    title: "Silent Wealth",
    description: "अपनी कमाई या सफलता का आज प्रदर्शन न करें।",
    command: "अपनी कमाई या सफलता का आज प्रदर्शन न करें।",
    logic: "दिखावा कमज़ोरों का काम है। ताक़त को गुप्त रखो।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 86,
    title: "Legacy Focus",
    description: "अपने बाद कौन तुम्हारी पावर संभालेगा, उस पर विचार करें।",
    command: "अपने बाद कौन तुम्हारी पावर संभालेगा, उस पर विचार करें।",
    logic: "विरासत (Legacy) के बिना सत्ता अधूरी है।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 87,
    title: "Unshakable Peace",
    description: "आज किसी भी बाहरी झटके पर विचलित न हों।",
    command: "आज किसी भी बाहरी झटके पर विचलित न हों।",
    logic: "आपकी आंतरिक शांति ही आपका सबसे बड़ा किला है।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 88,
    title: "Monopoly Mindset",
    description: "अपने फील्ड में 'नंबर 1' बनने का प्लान बनाएं।",
    command: "अपने फील्ड में 'नंबर 1' बनने का प्लान बनाएं।",
    logic: "प्रतियोगिता (Competition) कमज़ोरों के लिए है, सम्राट 'एकाधिकार' (Monopoly) चाहता है।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 89,
    title: "Cult Logic",
    description: "अपने विज़न को एक 'मिशन' की तरह पेश करें।",
    command: "अपने विज़न को एक 'मिशन' की तरह पेश करें।",
    logic: "जब लोग तुम्हारे विज़न से जुड़ेंगे, तो वे सिपाही बन जाएंगे।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 90,
    title: "Old Self Burial",
    description: "अपने पुराने नाम और पहचान को मानसिक रूप से दफना दें।",
    command: "अपने पुराने नाम और पहचान को मानसिक रूप से दफना दें।",
    logic: "पुनर्जन्म के लिए पुरानी खाल उतारनी ही पड़ती है।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 91,
    title: "Emotional Cut",
    description: "किसी भी भावनात्मक निर्भरता को आज जड़ से काट दें।",
    command: "किसी भी भावनात्मक निर्भरता को आज जड़ से काट दें।",
    logic: "जो किसी का मोहताज नहीं, वही असली आज़ाद है।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 92,
    title: "Sovereign Presence",
    description: "आज दुनिया को अपनी ताक़त का एक सूक्ष्म अहसास कराएं।",
    command: "आज दुनिया को अपनी ताक़त का एक सूक्ष्म अहसास कराएं।",
    logic: "दुनिया को पता चलना चाहिए कि 'राजा' लौट आया है।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 93,
    title: "Silent Move",
    description: "आज बिना शोर किए अपनी जिंदगी की सबसे बड़ी चाल चलें।",
    command: "आज बिना शोर किए अपनी जिंदगी की सबसे बड़ी चाल चलें।",
    logic: "शोर करने से दुश्मन सतर्क हो जाता है। खामोशी से वार करो।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 94,
    title: "Selective Benevolence",
    description: "अपनी ताक़त का इस्तेमाल किसी की भलाई के लिए करें, पर अपनी शर्तों पर।",
    command: "अपनी ताक़त का इस्तेमाल किसी की भलाई के लिए करें, पर अपनी शर्तों पर।",
    logic: "दया सम्राट का एक 'पुरस्कार' होनी चाहिए, मज़बूरी नहीं।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 95,
    title: "The Sovereign Oath",
    description: "अपनी नई सल्तनत की शपथ लें।",
    command: "अपनी नई सल्तनत की शपथ लें।",
    logic: "शब्दों की ताक़त से अपनी नई दुनिया की नींव रखें।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 96,
    title: "Foundation Reinforcement",
    description: "अपने साम्राज्य की हर मज़बूती और कमज़ोरी की जांच करें।",
    command: "अपने साम्राज्य की हर मज़बूती और कमज़ोरी की जांच करें।",
    logic: "शिखर पर पहुँचने से ज़्यादा मुश्किल है वहां टिके रहना।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 97,
    title: "Unreachable Gate",
    description: "आज पूरी तरह गायब हो जाएं। कोई आपसे संपर्क न कर सके।",
    command: "आज पूरी तरह गायब हो जाएं। कोई आपसे संपर्क न कर सके।",
    logic: "पहुँच से बाहर होना ही 'दिव्यता' (Divinity) का लक्षण है।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 98,
    title: "Commander Shift",
    description: "आज अपनी टीम या फॉलोअर्स को एक बड़ा लक्ष्य दें।",
    command: "आज अपनी टीम या फॉलोअर्स को एक बड़ा लक्ष्य दें।",
    logic: "तुम अब ऑपरेटर हो। दूसरों को रास्ता दिखाओ।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 99,
    title: "The Calm",
    description: "कल के 'Ascension' के लिए खुद को पूरी तरह शून्य कर लें।",
    command: "कल के 'Ascension' के लिए खुद को पूरी तरह शून्य कर लें।",
    logic: "युद्ध से पहले की शांति ही सबसे डरावनी होती है।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  },
  {
    day: 100,
    title: "THE ASCENSION",
    description: "आज तुम एक Sovereign बन चुके हो। अपनी जीत का जश्न अकेले मनाओ।",
    command: "आज तुम एक Sovereign बन चुके हो। अपनी जीत का जश्न अकेले मनाओ।",
    logic: "संप्रभुता एक आंतरिक स्थिति है। तुम्हें अब किसी की मुहर की ज़रूरत नहीं। तुम खुद ही 'कानून' हो।",
    phase: "Phase 5: SOVEREIGN ASCENSION (Days 81 - 100) — 'साम्राज्य का उदय'",
    isPremium: true
  }
];

export const RAW_JOURNEY_MODULES: Omit<JourneyModule, 'id'>[] = RAW_JOURNEY_MODULES_BASE.map(m => ({
  ...m,
  category: getCategoryForDay(m.day)
}));
