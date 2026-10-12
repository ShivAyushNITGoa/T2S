import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  X,
  Share2,
  Printer,
  CheckCircle2,
  Shield,
  Flame,
  Sparkles,
  Copy,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { getRankFromXP } from '../../config/constants';
import { useAppContext } from '../../context/AppContext';

interface MilestoneTier {
  days: number;
  title: string;
  hindiTitle: string;
  sealText: string;
  description: string;
  hindiDescription: string;
  accentColor: string;
}

const MILESTONE_TIERS: MilestoneTier[] = [
  {
    days: 7,
    title: '7-Day Discipline Initiate',
    hindiTitle: '७-दिवसीय संयम एवं जागृति प्रमाण पत्र',
    sealText: 'INITIATE OF DISCIPLINE',
    description:
      'For successfully breaking the initial inertia of distraction and completing 7 consecutive days of conscious self-observation.',
    hindiDescription:
      'भटकाव और डिजिटल शोर की शुरुआती जड़ता को तोड़कर 7 दिनों तक निरंतर आत्म-निरीक्षण और अनुशासन का अभ्यास करने के लिए।',
    accentColor: 'from-emerald-500 to-teal-600',
  },
  {
    days: 21,
    title: '21-Day Neural Rewiring Practitioner',
    hindiTitle: '२१-दिवसीय मानसिक पुनर्गठन प्रमाण पत्र',
    sealText: 'NEURAL ARCHITECT',
    description:
      'For completing Phase 1 (The Purge) and establishing a 21-day foundation of emotional detachment and zero external validation.',
    hindiDescription:
      'प्रथम चरण (वैलिडेशन का विसर्जन) को पार कर 21 दिनों की अटूट साधना द्वारा अपनी मानसिक आदतों को पुनर्गठित करने के लिए।',
    accentColor: 'from-blue-500 to-indigo-600',
  },
  {
    days: 50,
    title: '50-Day Half-Century Strategist',
    hindiTitle: '५०-दिवसीय अर्धशतक रणनीतिकार सम्मान',
    sealText: 'SOVEREIGN STRATEGIST',
    description:
      'For crossing the 50-day crucible threshold—demonstrating rare psychological endurance, silent observation, and social clarity.',
    hindiDescription:
      '50 दिनों की कठिन मानसिक भट्टी (Crucible) को पार कर दुर्लभ मनोवैज्ञानिक धैर्य, मूक अवलोकन और सामाजिक स्पष्टता सिद्ध करने के लिए।',
    accentColor: 'from-purple-500 to-amber-500',
  },
  {
    days: 100,
    title: '100-Day Sovereign Master',
    hindiTitle: '१००-दिवसीय पूर्ण संप्रभुता सर्वोच्च प्रमाण पत्र',
    sealText: 'SUPREME SOVEREIGN',
    description:
      'For completing the entire 100-Day Consciousness Journey—achieving complete mental autonomy, emotional mastery, and unshakeable presence.',
    hindiDescription:
      '100-दिवसीय चेतना यात्रा को पूर्ण कर संपूर्ण मानसिक स्वतंत्रता, भावनात्मक नियंत्रण और अडिग व्यक्तित्व प्राप्त करने के सर्वोच्च सम्मान में।',
    accentColor: 'from-amber-400 via-yellow-500 to-red-500',
  },
];

export const SovereignCertificateModal: React.FC<{
  profile?: UserProfile | null;
}> = ({ profile: propProfile }) => {
  const ctx = useAppContext();
  const isOpen = ctx.showCertificateModal;
  const onClose = () => ctx.setShowCertificateModal(false);
  const profile = propProfile || ctx.profile;

  const completedCount = profile?.completedDays?.length || 0;
  const rank = getRankFromXP(profile?.xp || 0);

  const highestUnlockedIdx = MILESTONE_TIERS.reduce(
    (acc, tier, idx) => (completedCount >= tier.days ? idx : acc),
    0
  );

  const [selectedTierIdx, setSelectedTierIdx] = useState<number>(highestUnlockedIdx);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !profile) return null;

  const currentTier = MILESTONE_TIERS[selectedTierIdx] || MILESTONE_TIERS[0];
  const isUnlocked = completedCount >= currentTier.days || Boolean(profile.isAdmin);

  const certificateId = `T2S-${(profile.uid || 'SOV').slice(0, 6).toUpperCase()}-D${currentTier.days}`;
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const shareMessage = `🏆 मैंने Talk2Society के 100-Day Consciousness Course में "${currentTier.hindiTitle}" (${currentTier.title}) प्राप्त किया!\n\n✦ पूर्ण किए गए दिन: ${completedCount}/100\n✦ रैंक: ${rank.hindiName} (${rank.name})\n✦ कुल XP: ${profile.xp || 0}\n\nअपनी मानसिक स्वतंत्रता की यात्रा शुरू करें: ${window.location.origin}`;

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl bg-[#0c0e14] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-auto"
        >
          <div className="px-5 py-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60 print:hidden">
            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>Back (वापस)</span>
              </button>
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  संप्रभुता उपलब्धि प्रमाण पत्र (Sovereign Milestones)
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Your Completed Days: {completedCount}/100
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              {MILESTONE_TIERS.map((tier, idx) => {
                const unlocked = completedCount >= tier.days || Boolean(profile.isAdmin);
                return (
                  <button
                    key={tier.days}
                    onClick={() => setSelectedTierIdx(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      selectedTierIdx === idx
                        ? 'bg-amber-500 text-black shadow'
                        : unlocked
                          ? 'text-amber-300 hover:bg-zinc-800'
                          : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span>{tier.days}D</span>
                    {unlocked && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 sm:p-8">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#12151f] via-[#090b10] to-[#12100b] border-2 border-amber-500/40 p-6 sm:p-10 md:p-12 shadow-[0_0_60px_rgba(245,158,11,0.12)] overflow-hidden">
              <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-amber-500/40 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-amber-500/40 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-amber-500/40 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-amber-500/40 rounded-br-xl pointer-events-none" />

              <div className="relative z-10 text-center space-y-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-[0.25em] font-bold">
                    <Shield className="w-3.5 h-3.5" />
                    <span>TALK2SOCIETY // SOVEREIGN CRUCIBLE ACADEMY</span>
                  </div>
                  <h2 className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-zinc-400 mt-1">
                    CERTIFICATE OF CONSCIOUSNESS &amp; DISCIPLINE
                  </h2>
                </div>

                <div className="space-y-2">
                  <h1
                    className={`text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r ${currentTier.accentColor} bg-clip-text text-transparent`}
                  >
                    {currentTier.hindiTitle}
                  </h1>
                  <p className="text-sm sm:text-base font-mono font-bold text-amber-300/90 uppercase tracking-wider">
                    {currentTier.title}
                  </p>
                </div>

                <div className="py-4 border-y border-zinc-800/90 max-w-xl mx-auto space-y-2">
                  <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                    यह प्रमाणित किया जाता है कि साधक (This is proudly presented to)
                  </p>
                  <div className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight uppercase py-1">
                    {profile.displayName || 'Sovereign Practitioner'}
                  </div>
                  <div className="flex items-center justify-center gap-3 text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                      Rank: {rank.hindiName} ({rank.name})
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-300 font-bold">
                      {(profile.xp || 0).toLocaleString()} XP
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> {profile.streak || 1} Day Streak
                    </span>
                  </div>
                </div>

                <div className="max-w-2xl mx-auto space-y-2">
                  <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-medium">
                    “{currentTier.hindiDescription}”
                  </p>
                  <p className="text-xs text-zinc-400 italic leading-relaxed">
                    {currentTier.description}
                  </p>
                </div>

                <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center border-t border-zinc-800/80 text-xs font-mono">
                  <div className="text-center sm:text-left space-y-1">
                    <div className="text-zinc-500 text-[10px] uppercase">CERTIFICATE ID</div>
                    <div className="text-zinc-200 font-bold">{certificateId}</div>
                    <div className="text-zinc-400 text-[11px]">{issueDate}</div>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-2 border-amber-500/50 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                      <Sparkles className="w-5 h-5 text-amber-400 mb-0.5" />
                      <span className="text-[7px] font-mono font-black text-amber-300 tracking-tighter uppercase text-center leading-none px-1">
                        {currentTier.sealText}
                      </span>
                    </div>
                  </div>

                  <div className="text-center sm:text-right space-y-1">
                    <div className="text-amber-400 font-serif italic text-base font-bold">
                      A. K. Chandradipti
                    </div>
                    <div className="text-zinc-400 text-[10px] uppercase tracking-wider">
                      Founder &amp; Architect, Talk2Society
                    </div>
                  </div>
                </div>
              </div>

              {!isUnlocked && (
                <div className="mt-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center text-xs text-amber-200 font-mono print:hidden">
                  🔒 यह प्रमाण पत्र अनलॉक करने के लिए <strong>{currentTier.days} दिन</strong> पूरे करें
                  (अभी आपके <strong>{completedCount} दिन</strong> पूरे हुए हैं —{' '}
                  {currentTier.days - completedCount} दिन शेष)।
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="text-xs text-zinc-400">
                आप इस प्रमाण पत्र को प्रिंट/PDF के रूप में सेव कर सकते हैं या अपने साथियों के साथ साझा कर सकते हैं।
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleWhatsAppShare}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp पर शेयर करें</span>
                </button>

                <button
                  onClick={handleCopyShare}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs flex items-center gap-2 border border-zinc-700 transition-all cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{copied ? 'कॉपी हो गया!' : 'टेक्स्ट कॉपी करें'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SovereignCertificateModal;
