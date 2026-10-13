import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  X,
  Share2,
  Download,
  CheckCircle2,
  Shield,
  Flame,
  Sparkles,
  Copy,
  Check,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { getRankFromXP } from '../../config/constants';
import { useAppContext } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

interface MilestoneTier {
  days: number;
  title: string;
  hindiTitle: string;
  sealText: string;
  description: string;
  hindiDescription: string;
  accentColor: string;
  canvasAccent: string;
}

const MILESTONE_TIERS: MilestoneTier[] = [
  {
    days: 7,
    title: '7-Day Discipline Initiate',
    hindiTitle: '७-दिवसीय संयम एवं जागृति प्रमाण पत्र',
    sealText: 'INITIATE OF DISCIPLINE',
    description:
      'For successfully breaking the initial inertia of distraction and completing 7 days of conscious self-observation.',
    hindiDescription:
      'भटकाव और डिजिटल शोर की शुरुआती जड़ता को तोड़कर 7 दिनों तक निरंतर आत्म-निरीक्षण और अनुशासन का अभ्यास करने के लिए।',
    accentColor: 'from-emerald-500 to-teal-600',
    canvasAccent: '#10b981',
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
    canvasAccent: '#60a5fa',
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
    canvasAccent: '#c084fc',
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
    canvasAccent: '#f59e0b',
  },
];

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export const SovereignCertificateModal: React.FC<{
  profile?: UserProfile | null;
}> = ({ profile: propProfile }) => {
  const ctx = useAppContext();
  const { t } = useLanguage();
  const isOpen = ctx.showCertificateModal;
  const onClose = () => ctx.setShowCertificateModal(false);
  const profile = propProfile || ctx.profile;

  const completedDaysList = Array.from(
    new Set((profile?.completedDays || []).map(Number).filter((n) => n > 0))
  );
  const completedCount = completedDaysList.length;
  const completedSet = new Set(completedDaysList);
  const rank = getRankFromXP(profile?.xp || 0);

  const isTierUnlocked = (days: number): boolean => {
    return completedSet.has(days) || completedCount >= days;
  };

  const highestUnlockedIdx = MILESTONE_TIERS.reduce(
    (acc, tier, idx) => (isTierUnlocked(tier.days) ? idx : acc),
    0
  );

  const [selectedTierIdx, setSelectedTierIdx] = useState<number>(highestUnlockedIdx);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadLockRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      const latestUnlockedIdx = MILESTONE_TIERS.reduce(
        (acc, tier, idx) =>
          completedSet.has(tier.days) || completedCount >= tier.days ? idx : acc,
        0
      );
      setSelectedTierIdx(latestUnlockedIdx);
    }
  }, [isOpen, completedCount]);

  if (!isOpen || !profile) return null;

  const currentTier = MILESTONE_TIERS[selectedTierIdx] || MILESTONE_TIERS[0];
  const isUnlocked = isTierUnlocked(currentTier.days);

  const certificateId = `T2S-${(profile.uid || 'SOV')
    .slice(0, 6)
    .toUpperCase()}-D${currentTier.days}`;
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Generates strictly ONE single high-resolution copy for download on both Mobile and Desktop
  const handleDownloadSingleCopy = async () => {
    if (!isUnlocked || downloadLockRef.current) return;
    downloadLockRef.current = true;
    setIsDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 2000;
      canvas.height = 1414;
      const c = canvas.getContext('2d');
      if (!c) return;

      // 1. Deep Obsidian Background Gradient
      const bgGrad = c.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, '#0d1018');
      bgGrad.addColorStop(0.5, '#07090e');
      bgGrad.addColorStop(1, '#120f09');
      c.fillStyle = bgGrad;
      c.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle radial glow
      const radGrad = c.createRadialGradient(1000, 650, 80, 1000, 650, 900);
      radGrad.addColorStop(0, 'rgba(245, 158, 11, 0.10)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      c.fillStyle = radGrad;
      c.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Double Royal Gold Borders
      c.strokeStyle = 'rgba(245, 158, 11, 0.55)';
      c.lineWidth = 6;
      c.strokeRect(56, 56, canvas.width - 112, canvas.height - 112);

      c.strokeStyle = 'rgba(245, 158, 11, 0.25)';
      c.lineWidth = 2;
      c.strokeRect(76, 76, canvas.width - 152, canvas.height - 152);

      // Corner Ornaments
      const cornerLen = 65;
      c.strokeStyle = '#f59e0b';
      c.lineWidth = 8;
      // Top-left
      c.beginPath();
      c.moveTo(56, 56 + cornerLen);
      c.lineTo(56, 56);
      c.lineTo(56 + cornerLen, 56);
      c.stroke();
      // Top-right
      c.beginPath();
      c.moveTo(canvas.width - 56 - cornerLen, 56);
      c.lineTo(canvas.width - 56, 56);
      c.lineTo(canvas.width - 56, 56 + cornerLen);
      c.stroke();
      // Bottom-left
      c.beginPath();
      c.moveTo(56, canvas.height - 56 - cornerLen);
      c.lineTo(56, canvas.height - 56);
      c.lineTo(56 + cornerLen, canvas.height - 56);
      c.stroke();
      // Bottom-right
      c.beginPath();
      c.moveTo(canvas.width - 56 - cornerLen, canvas.height - 56);
      c.lineTo(canvas.width - 56, canvas.height - 56);
      c.lineTo(canvas.width - 56, canvas.height - 56 - cornerLen);
      c.stroke();

      c.textAlign = 'center';

      // 3. Academy Header
      c.fillStyle = '#f59e0b';
      c.font = 'bold 24px monospace';
      c.fillText('TALK2SOCIETY // SOVEREIGN CRUCIBLE ACADEMY', 1000, 175);

      c.fillStyle = '#9ca3af';
      c.font = 'bold 20px monospace';
      c.fillText('CERTIFICATE OF CONSCIOUSNESS & DISCIPLINE', 1000, 218);

      // 4. Milestone Titles (Hindi + English)
      c.fillStyle = currentTier.canvasAccent;
      c.font = 'bold 54px sans-serif';
      c.fillText(currentTier.hindiTitle, 1000, 315);

      c.fillStyle = '#fde68a';
      c.font = 'bold 30px monospace';
      c.fillText(currentTier.title.toUpperCase(), 1000, 370);

      // Divider Top
      c.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(320, 420);
      c.lineTo(1680, 420);
      c.stroke();

      // 5. Recipient Section
      c.fillStyle = '#9ca3af';
      c.font = '22px monospace';
      c.fillText(
        'यह प्रमाणित किया जाता है कि साधक / THIS IS PROUDLY PRESENTED TO',
        1000,
        475
      );

      c.fillStyle = '#ffffff';
      c.font = '900 74px sans-serif';
      c.fillText(
        (profile.displayName || 'SOVEREIGN PRACTITIONER').toUpperCase(),
        1000,
        575
      );

      // Stats Line
      c.fillStyle = '#fbbf24';
      c.font = 'bold 24px monospace';
      c.fillText(
        `Rank: ${rank.hindiName} (${rank.name})   •   ${(
          profile.xp || 0
        ).toLocaleString()} XP   •   ${currentTier.days}/100 Days Completed   •   ${
          profile.streak || 1
        } Day Streak`,
        1000,
        640
      );

      // Divider Bottom
      c.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      c.beginPath();
      c.moveTo(320, 685);
      c.lineTo(1680, 685);
      c.stroke();

      // 6. Citation Descriptions
      c.fillStyle = '#e5e7eb';
      c.font = '28px sans-serif';
      const hiLines = wrapCanvasText(c, `“${currentTier.hindiDescription}”`, 1360);
      let textY = 760;
      for (const line of hiLines) {
        c.fillText(line, 1000, textY);
        textY += 42;
      }

      textY += 18;
      c.fillStyle = '#9ca3af';
      c.font = 'italic 24px sans-serif';
      const enLines = wrapCanvasText(c, currentTier.description, 1360);
      for (const line of enLines) {
        c.fillText(line, 1000, textY);
        textY += 36;
      }

      // 7. Footer (Certificate ID, Seal, Founder Signature)
      c.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      c.beginPath();
      c.moveTo(160, 1060);
      c.lineTo(1840, 1060);
      c.stroke();

      // Left: ID & Date
      c.textAlign = 'left';
      c.fillStyle = '#6b7280';
      c.font = 'bold 18px monospace';
      c.fillText('CERTIFICATE ID', 180, 1140);
      c.fillStyle = '#f3f4f6';
      c.font = 'bold 26px monospace';
      c.fillText(certificateId, 180, 1180);
      c.fillStyle = '#9ca3af';
      c.font = '20px monospace';
      c.fillText(`Issued: ${issueDate}`, 180, 1218);

      // Center: Sovereign Seal Circle
      c.textAlign = 'center';
      c.beginPath();
      c.arc(1000, 1185, 88, 0, Math.PI * 2);
      c.fillStyle = 'rgba(245, 158, 11, 0.14)';
      c.fill();
      c.lineWidth = 4;
      c.strokeStyle = '#f59e0b';
      c.stroke();

      c.fillStyle = '#fcd34d';
      c.font = 'bold 18px monospace';
      c.fillText(`★ ${currentTier.days} DAYS ★`, 1000, 1172);
      c.font = 'bold 15px monospace';
      c.fillText(currentTier.sealText, 1000, 1202);

      // Right: Signature
      c.textAlign = 'right';
      c.fillStyle = '#fbbf24';
      c.font = 'italic bold 36px serif';
      c.fillText('A. K. Chandradipti', 1820, 1170);
      c.fillStyle = '#9ca3af';
      c.font = 'bold 18px monospace';
      c.fillText('FOUNDER & ARCHITECT, TALK2SOCIETY', 1820, 1212);

      // Trigger single-file download on both Mobile and Desktop
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Talk2Society-${currentTier.days}Day-Certificate-${certificateId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      ctx.showToast({
        title: t('प्रमाण पत्र डाउनलोड हो गया', 'Certificate Downloaded'),
        message: t(
          `${currentTier.days}-दिवसीय प्रमाण पत्र की १ प्रति आपके डिवाइस में सेव हो गई है।`,
          `1 copy of your ${currentTier.days}-Day Certificate has been saved to your device.`
        ),
        type: 'success',
      });
    } finally {
      setTimeout(() => {
        downloadLockRef.current = false;
        setIsDownloading(false);
      }, 1200);
    }
  };

  const shareMessage = `🏆 मैंने Talk2Society के 100-Day Consciousness Course में "${currentTier.hindiTitle}" (${currentTier.title}) प्राप्त किया!\n\n✦ पूर्ण किए गए दिन: ${completedCount}/100\n✦ रैंक: ${rank.hindiName} (${rank.name})\n✦ कुल XP: ${profile.xp || 0}\n\nअपनी मानसिक स्वतंत्रता की यात्रा शुरू करें: ${window.location.origin}`;

  const handleWhatsAppShare = () => {
    if (!isUnlocked) return;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyShare = () => {
    if (!isUnlocked) return;
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
          {/* Header */}
          <div className="px-5 py-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60">
            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('वापस (Back)', 'Back')}</span>
              </button>
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  {t(
                    'संप्रभुता उपलब्धि प्रमाण पत्र (Sovereign Certificates)',
                    'Sovereign Milestone Certificates'
                  )}
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono">
                  {t(
                    `पूर्ण किए गए दिन: ${completedCount}/100`,
                    `Your Completed Days: ${completedCount}/100`
                  )}
                </p>
              </div>
            </div>

            {/* Tier Selector: 7D, 21D, 50D, 100D */}
            <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              {MILESTONE_TIERS.map((tier, idx) => {
                const unlocked = isTierUnlocked(tier.days);
                return (
                  <button
                    key={tier.days}
                    onClick={() => setSelectedTierIdx(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      selectedTierIdx === idx
                        ? 'bg-amber-500 text-black shadow'
                        : unlocked
                          ? 'text-emerald-400 hover:bg-zinc-800'
                          : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span>
                      {tier.days} {t('दिन', 'Days')}
                    </span>
                    {unlocked ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
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
            {!isUnlocked ? (
              /* Locked State — Certificate opens ONLY after completing Day 7 / 21 / 50 / 100 */
              <div className="rounded-3xl bg-gradient-to-br from-zinc-950 via-[#0b0d13] to-zinc-950 border border-zinc-800 p-8 sm:p-12 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                  <Lock className="w-8 h-8" />
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 text-[10px] font-mono uppercase tracking-widest font-bold">
                    {t(
                      `दिन ${currentTier.days} माइलस्टोन लॉक है`,
                      `Day ${currentTier.days} Milestone Locked`
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    {t(currentTier.hindiTitle, currentTier.title)}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {t(
                      `यह ${currentTier.days}-दिवसीय प्रमाण पत्र दिन ${currentTier.days} का प्रोटोकॉल पूरा करने के बाद खुलेगा। अभी आपके ${completedCount} दिन पूरे हुए हैं (${Math.max(
                        0,
                        currentTier.days - completedCount
                      )} दिन शेष)।`,
                      `This ${currentTier.days}-Day Certificate will open after you complete Day ${currentTier.days} of the Journey. You have completed ${completedCount} days so far (${Math.max(
                        0,
                        currentTier.days - completedCount
                      )} days remaining).`
                    )}
                  </p>
                </div>

                {/* Progress Bar toward this Milestone */}
                <div className="max-w-md mx-auto space-y-2">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>{t('प्रगति (Progress)', 'Milestone Progress')}</span>
                    <span className="text-amber-400 font-bold">
                      {completedCount} / {currentTier.days} {t('दिन', 'Days')}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((completedCount / currentTier.days) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {isTierUnlocked(MILESTONE_TIERS[highestUnlockedIdx].days) && (
                  <button
                    type="button"
                    onClick={() => setSelectedTierIdx(highestUnlockedIdx)}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono cursor-pointer transition-all"
                  >
                    {t(
                      `अनलॉक किया गया ${MILESTONE_TIERS[highestUnlockedIdx].days}-दिवसीय प्रमाण पत्र देखें`,
                      `View Unlocked ${MILESTONE_TIERS[highestUnlockedIdx].days}-Day Certificate`
                    )}
                  </button>
                )}
              </div>
            ) : (
              /* Unlocked Certificate View */
              <>
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
                        {t(
                          'यह प्रमाणित किया जाता है कि साधक',
                          'This is proudly presented to'
                        )}
                      </p>
                      <div className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight uppercase py-1">
                        {profile.displayName || 'Sovereign Practitioner'}
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                          Rank: {rank.hindiName} ({rank.name})
                        </span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-300 font-bold">
                          {(profile.xp || 0).toLocaleString()} XP
                        </span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" /> {profile.streak || 1}{' '}
                          {t('दिन स्ट्रीक', 'Day Streak')}
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
                        <div className="text-zinc-500 text-[10px] uppercase">
                          CERTIFICATE ID
                        </div>
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
                </div>

                {/* Single-Copy Download & Share Bar */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-zinc-400">
                    {t(
                      'मोबाइल और डेस्कटॉप पर अपने प्रमाण पत्र की एक उच्च-गुणवत्ता प्रति डाउनलोड करें।',
                      'Download a single high-resolution copy of your certificate on mobile or desktop.'
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleWhatsAppShare}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{t('WhatsApp शेयर', 'Share on WhatsApp')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyShare}
                      className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs flex items-center gap-2 border border-zinc-700 transition-all cursor-pointer"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-amber-400" />
                      )}
                      <span>
                        {copied
                          ? t('कॉपी हो गया!', 'Copied!')
                          : t('टेक्स्ट कॉपी करें', 'Copy Text')}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={handleDownloadSingleCopy}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-extrabold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {isDownloading
                          ? t('डाउनलोड हो रहा है...', 'Downloading...')
                          : t(
                              `प्रमाण पत्र डाउनलोड करें (${currentTier.days}D)`,
                              `Download Certificate (${currentTier.days}D)`
                            )}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SovereignCertificateModal;
