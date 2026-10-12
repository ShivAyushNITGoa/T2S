import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Eye, Layers } from 'lucide-react';

interface Scene {
  id: string;
  title: string;
  hindiTitle: string;
  paradox: string;
  systemExplanation: string;
  caption: string;
}

const SCENES: Scene[] = [
  {
    id: 'rat-race',
    title: 'Scene 01: The Degree Conveyor Belt',
    hindiTitle: 'डिग्री और भीड़ का भ्रम',
    paradox: 'Why do 90% of graduates chase the same 5 exams while real-world skills remain empty?',
    systemExplanation:
      'Industrial schooling was designed to produce compliant clerks, not independent problem-solvers. When everyone runs on the same track, the value of the ticket drops to zero.',
    caption: 'भीड़ का रास्ता सुरक्षित दिखता है, पर वहीं सबसे ज़्यादा कुचले जाते हैं।',
  },
  {
    id: 'status-trap',
    title: 'Scene 02: The Loan-Fueled Status Cage',
    hindiTitle: 'दिखावे की गुलामी (EMI Trap)',
    paradox: 'Why do families borrow ₹20 Lakhs for a 1-night wedding to impress people they do not even like?',
    systemExplanation:
      'Social validation is an invisible tax. The middle-class trades 15 years of future freedom (EMIs) for 4 hours of applause from relatives.',
    caption: 'समाज की तालियाँ ४ घंटे बजती हैं, पर क़र्ज़ की किश्तें १५ साल चलती हैं।',
  },
  {
    id: 'sovereign-observer',
    title: 'Scene 03: The Sovereign Observer',
    hindiTitle: 'साक्षी भाव और स्वतंत्र सोच',
    paradox: 'What happens when one person steps off the script and observes the system from outside?',
    systemExplanation:
      'The moment you stop reacting emotionally and start reading incentives structurally, society loses its power to manipulate your guilt.',
    caption: 'जो खेल के नियमों को ऊपर से देखता है, वह कभी मोहरा नहीं बनता।',
  },
];

export const StickFigureVisualizer: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = SCENES[activeIndex];

  return (
    <div className="bg-[#0c0e14] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 uppercase">
            <Layers className="w-3.5 h-3.5" />
            <span>T2S Minimalist Visual Grammar · 2D Stick-Figure Lens</span>
          </div>
          <h3 className="text-xl font-extrabold text-white mt-1">
            दृश्य दर्शन: अदृश्य व्यवस्था का चित्रण
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {SCENES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeIndex === idx
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              0{idx + 1}
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
              <line x1="20" y1="165" x2="380" y2="165" className="stroke-zinc-700" />

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
              "{current.caption}"
            </div>
          </div>

          {/* Scene Explanation */}
          <div className="space-y-4">
            <div>
              <div className="text-xs font-mono text-amber-400">{current.title}</div>
              <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                {current.hindiTitle}
              </h4>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <div className="text-[11px] font-mono text-rose-400 uppercase font-bold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>सामाजिक विरोधाभास (The Paradox)</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                {current.paradox}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
              <div className="text-[11px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>संरचनात्मक सत्य (Systemic Reality)</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                {current.systemExplanation}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
