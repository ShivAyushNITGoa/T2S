import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Eye, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Scene {
  id: string;
  titleEn: string;
  titleHi: string;
  paradoxHi: string;
  paradoxEn: string;
  explanationHi: string;
  explanationEn: string;
  captionHi: string;
  captionEn: string;
}

const SCENES: Scene[] = [
  {
    id: 'rat-race',
    titleHi: 'चित्र १: भीड़ की भेड़चाल (The Rat-Race)',
    titleEn: 'Scene 01: The Blind Crowd Rat-Race',
    paradoxHi:
      '९०% युवा बिना सोचे-समझे एक ही भीड़ के पीछे क्यों भागते रहते हैं?',
    paradoxEn:
      'Why do 90% of people blindly chase the exact same crowded path?',
    explanationHi:
      'जब सब लोग एक ही रास्ते पर दौड़ते हैं, तो वहाँ भीड़ बढ़ती है और अवसर घट जाते हैं। जो इंसान थोड़ा रुककर अपना अलग हुनर (Skill) बनाता है, वही आगे निकलता है।',
    explanationEn:
      'When everyone runs on the same track, competition explodes and rewards shrink. Stepping aside to build a real skill sets you free.',
    captionHi: 'भीड़ का रास्ता आसान दिखता है, पर वहीं सबसे ज़्यादा समय बर्बाद होता है।',
    captionEn: 'The crowded road looks safe, but it wastes the most years.',
  },
  {
    id: 'status-trap',
    titleHi: 'चित्र २: दिखावे और कर्ज का जाल (The EMI Trap)',
    titleEn: 'Scene 02: The Show-Off & EMI Debt Cage',
    paradoxHi:
      'लोग ४ घंटे की झूठी वाहवाही के लिए १५ साल की किश्तों (EMI) का बोझ क्यों उठाते हैं?',
    paradoxEn:
      'Why do families take years of debt just for 4 hours of praise from relatives?',
    explanationHi:
      '“लोग क्या कहेंगे” के डर से लिया गया कर्ज आपकी शांति और आज़ादी छीन लेता है। सादा जीवन और बिना कर्ज की ज़िंदगी ही असली अमीरी है।',
    explanationEn:
      'Debt taken to impress neighbors steals your peace of mind. Living debt-free with savings is true wealth.',
    captionHi: 'समाज की तालियाँ ४ घंटे बजती हैं, पर क़र्ज़ की किश्तें सालों चलती हैं।',
    captionEn: 'Applause lasts 4 hours, but loan EMIs last for years.',
  },
  {
    id: 'sovereign-observer',
    titleHi: 'चित्र ३: शांत और स्वतंत्र इंसान (The Calm Observer)',
    titleEn: 'Scene 03: The Calm & Independent Thinker',
    paradoxHi:
      'जब एक इंसान गुस्से और डर से बाहर निकलकर शांत दिमाग से सोचता है तो क्या होता है?',
    paradoxEn:
      'What happens when you step back from noise and observe calmly?',
    explanationHi:
      'जैसे ही आप दूसरों के तानों पर गुस्सा होना बंद कर देते हैं और शांत होकर अपने काम पर ध्यान लगाते हैं, समाज का कोई भी दबाव आपको झुका नहीं सकता।',
    explanationEn:
      'The moment you stop reacting emotionally and focus calmly on your daily growth, external pressure loses its power over you.',
    captionHi: 'जो खेल के नियमों को शांत होकर समझता है, वह कभी परेशान नहीं होता।',
    captionEn: 'One who understands the game calmly is never defeated by it.',
  },
];

export const StickFigureVisualizer: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useLanguage();
  const current = SCENES[activeIndex];

  return (
    <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 uppercase">
            <Layers className="w-3.5 h-3.5" />
            <span>
              {t('सरल चित्र मार्गदर्शिका', 'Simple Visual Guide')}
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white mt-1">
            {t(
              '३ आसान चित्रों में समाज का सच',
              '3 Simple Visuals Explaining Everyday Life'
            )}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {SCENES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveIndex(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeIndex === idx
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {t(`चित्र ${idx + 1}`, `Scene ${idx + 1}`)}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center"
        >
          {/* Minimalist SVG Canvas */}
          <div className="aspect-video rounded-2xl bg-[#07080c] border border-zinc-800 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <svg
              viewBox="0 0 400 200"
              className="w-full h-full max-h-44 stroke-white fill-none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Ground Line */}
              <line
                x1="20"
                y1="165"
                x2="380"
                y2="165"
                className="stroke-zinc-700"
              />

              {activeIndex === 0 && (
                <>
                  {/* Crowd walking right into a box */}
                  {[60, 110, 160, 210].map((x, i) => (
                    <g key={i} className="stroke-zinc-400">
                      <circle cx={x} cy="110" r="10" />
                      <line x1={x} y1="120" x2={x} y2="145" />
                      <line x1={x} y1="128" x2={x + 10} y2="136" />
                      <line x1={x} y1="145" x2={x - 8} y2="164" />
                      <line x1={x} y1="145" x2={x + 8} y2="164" />
                    </g>
                  ))}
                  {/* Sovereign figure stepping out */}
                  <g className="stroke-amber-400">
                    <circle cx="310" cy="95" r="12" />
                    <line x1="310" y1="107" x2="310" y2="140" />
                    <line x1="310" y1="118" x2="295" y2="130" />
                    <line x1="310" y1="118" x2="325" y2="105" />
                    <line x1="310" y1="140" x2="298" y2="164" />
                    <line x1="310" y1="140" x2="322" y2="164" />
                  </g>
                </>
              )}

              {activeIndex === 1 && (
                <>
                  {/* Stick figure carrying a massive EMI weight block */}
                  <rect
                    x="130"
                    y="45"
                    width="140"
                    height="55"
                    rx="8"
                    className="stroke-rose-400 fill-rose-500/10"
                  />
                  <text
                    x="200"
                    y="78"
                    textAnchor="middle"
                    className="fill-rose-300 stroke-none text-[12px] font-mono font-bold"
                  >
                    LOG KYA KAHENGE + EMI
                  </text>
                  <g className="stroke-amber-400">
                    <circle cx="200" cy="115" r="10" />
                    <line x1="200" y1="125" x2="200" y2="148" />
                    <line x1="200" y1="132" x2="175" y2="100" />
                    <line x1="200" y1="132" x2="225" y2="100" />
                    <line x1="200" y1="148" x2="188" y2="164" />
                    <line x1="200" y1="148" x2="212" y2="164" />
                  </g>
                </>
              )}

              {activeIndex === 2 && (
                <>
                  {/* Elevated platform observer */}
                  <rect
                    x="55"
                    y="125"
                    width="70"
                    height="40"
                    className="stroke-amber-500/50 fill-amber-500/10"
                  />
                  <g className="stroke-amber-400">
                    <circle cx="90" cy="72" r="11" />
                    <line x1="90" y1="83" x2="90" y2="108" />
                    <line x1="90" y1="92" x2="108" y2="88" />
                    <line x1="90" y1="108" x2="80" y2="125" />
                    <line x1="90" y1="108" x2="100" y2="125" />
                  </g>
                  {/* System gears / matrix on the right */}
                  <circle
                    cx="275"
                    cy="105"
                    r="38"
                    strokeDasharray="6 4"
                    className="stroke-zinc-500"
                  />
                  <circle cx="275" cy="105" r="14" className="stroke-amber-400" />
                </>
              )}
            </svg>

            <div className="mt-2 text-center text-xs font-mono text-amber-300">
              “{t(current.captionHi, current.captionEn)}”
            </div>
          </div>

          {/* Scene Explanation */}
          <div className="space-y-4">
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-white">
                {t(current.titleHi, current.titleEn)}
              </h4>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <div className="text-[11px] font-mono text-rose-400 uppercase font-bold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>{t('सवाल (The Question)', 'The Question')}</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                {t(current.paradoxHi, current.paradoxEn)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
              <div className="text-[11px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('आसान समझ (Simple Explanation)', 'Simple Explanation')}</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                {t(current.explanationHi, current.explanationEn)}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
