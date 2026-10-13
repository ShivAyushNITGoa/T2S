import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  Youtube,
  Shield,
  BookOpen,
  PlayCircle,
  Compass,
  Award,
  CheckCircle2,
  X,
  Download,
  ArrowLeft,
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { LanguageToggle } from '../components/common/LanguageToggle';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { navHistory } from '../utils/navigationHistory';
import { usePwaInstall } from '../utils/pwaInstall';
import {
  CHANDRADIPTI_PROFILE,
  FIVE_FOUNDATIONAL_MANUALS_DETAILS,
} from '../data/t2sData';
import { TabType } from '../types';

const GATEWAY_FAQS = [
  {
    qHi: 'Talk2Society क्या है?',
    qEn: 'What is Talk2Society (T2S)?',
    aHi: 'Talk2Society (T2S) भारतीय समाज की अदृश्य व्यवस्थाओं, पारिवारिक दबावों, पैसे की वास्तविक संरचना और 100-दिवसीय आत्म-अनुशासन (100-Day Consciousness Course) का एक गंभीर डिजिटल प्लेटफ़ॉर्म है। यहाँ न कोई सतही मोटिवेशन है और न ही कोई गुरु-पूजा।',
    aEn: 'Talk2Society (T2S) is a philosophical and practical sovereign ecosystem dissecting Indian societal systems, family pressures, financial structures, and a 100-Day Consciousness Protocol. There is no shallow motivation or guru-worship here—only systemic clarity and disciplined execution.',
  },
  {
    qHi: 'क्या मुझे लॉग इन करना आवश्यक है?',
    qEn: 'Do I need an account to use the platform?',
    aHi: 'हाँ, ऐप के सभी मुख्य अनुभागों (100-Day Course, पुस्तकालय, आर्काइव्स, फोरम और लीडरबोर्ड) का उपयोग करने और अपनी प्रगति सर्वर पर सुरक्षित रखने के लिए Google से लॉग-इन करना आवश्यक है।',
    aEn: 'Yes, signing in with Google is required to access the platform and unlocks all standard features (100-Day Course, Great Library, Archives, Forum, and Leaderboard), while Premium content is reserved for Sovereign VIP members.',
  },
  {
    qHi: 'Sovereign VIP Pass (₹299 — प्रथम १०० दिन) में क्या मिलता है?',
    qEn: 'What is included in the Sovereign VIP Pass (₹299 for First 100 Days)?',
    aHi: 'Sovereign Pass (₹299) के साथ आपको प्रथम १०० दिनों (First 100 Days) के लिए सभी प्रीमियम डॉक्यूमेंट्री केस-फाइल्स, A. K. Chandradipti की विशेष पांडुलिपियाँ (Manuscripts) और पूर्ण रणनीतिक संसाधनों का एक्सेस मिलता है।',
    aEn: 'The Sovereign Pass (₹299) unlocks full access for the first 100 days to all VIP documentary case files, A. K. Chandradipti’s complete manuscripts, and exclusive strategic resources.',
  },
];

export const GatewayView: React.FC<{
  onEnter?: () => void;
}> = ({ onEnter }) => {
  const {
    user,
    handleLogin,
    handleTabClick,
    handleEnterGateway,
    openBookModal,
    library,
  } = useAppContext();
  const { t } = useLanguage();
  const { isInstalled, triggerInstall } = usePwaInstall();

  const [selectedManualModal, setSelectedManualModal] = useState<
    (typeof FIVE_FOUNDATIONAL_MANUALS_DETAILS)[number] | null
  >(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (selectedManualModal) {
      navHistory.push('modal-manual', () => setSelectedManualModal(null));
      return () => navHistory.remove('modal-manual');
    }
  }, [selectedManualModal]);

  const enterPlatform = (targetTab?: TabType) => {
    if (!user) {
      handleLogin();
      return;
    }
    if (targetTab) {
      handleTabClick(targetTab);
    } else if (onEnter) {
      onEnter();
    } else {
      handleEnterGateway();
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-black overflow-x-hidden">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#070709]/85 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo className="w-9 h-9" />
          <div>
            <div className="text-sm font-black tracking-tight text-white">
              Talk2Society
            </div>
            <div className="text-[10px] font-mono text-amber-400">
              {CHANDRADIPTI_PROFILE.name} ·{' '}
              {t(CHANDRADIPTI_PROFILE.hindiRole, CHANDRADIPTI_PROFILE.role)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bilingual Switcher Button (Hindi / English) */}
          <LanguageToggle />

          {/* PWA Install Button for Mobile & Desktop */}
          {!isInstalled && (
            <button
              onClick={() => triggerInstall()}
              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              title={t('ऐप इंस्टॉल करें (Mobile & Desktop)', 'Install App (Mobile & Desktop)')}
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t('ऐप इंस्टॉल', 'Install App')}</span>
            </button>
          )}

          <a
            href="https://www.youtube.com/@Talk2Society"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium hover:bg-red-500/15 transition-all"
          >
            <Youtube className="w-3.5 h-3.5 text-red-400" />
            <span>@Talk2Society</span>
          </a>

          <button
            onClick={() => enterPlatform('journey')}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-amber-500/20"
          >
            <span>{t('डैशबोर्ड खोलें', 'Enter Platform')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {!user && (
            <button
              onClick={handleLogin}
              className="hidden sm:flex px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs items-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <span>{t('Google से जुड़ें', 'Sign In')}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-16">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {t(
                'TALK2SOCIETY SOVEREIGN ECOSYSTEM · भारतीय सामाजिक सत्य',
                'TALK2SOCIETY SOVEREIGN ECOSYSTEM · SYSTEMIC CLARITY'
              )}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            {t(
              <>
                भारतीय समाज के{' '}
                <span className="text-amber-400">अदृश्य तंत्र</span> को समझें और अपनी सोच को{' '}
                <span className="underline decoration-amber-500/40 underline-offset-8">
                  स्वतंत्र
                </span>{' '}
                बनाएं
              </>,
              <>
                Decode the{' '}
                <span className="text-amber-400">Invisible Matrix</span> of Indian Society &amp; Forge a{' '}
                <span className="underline decoration-amber-500/40 underline-offset-8">
                  Sovereign Mind
                </span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            {t(
              <>
                यहाँ न कोई खोखला मोटिवेशन है और न ही अंधभक्ति।{' '}
                <strong className="text-white">A. K. Chandradipti</strong> द्वारा निर्मित{' '}
                <strong className="text-amber-300">
                  100-Day Consciousness Course
                </strong>
                , खोजी डॉक्यूमेंट्री और ५ मौलिक जीवन ग्रंथों के साथ अपनी मानसिक स्पष्टता की यात्रा शुरू करें।
              </>,
              <>
                No hollow motivation. No blind dogma. Built by{' '}
                <strong className="text-white">A. K. Chandradipti</strong>, combine the{' '}
                <strong className="text-amber-300">
                  100-Day Consciousness Course
                </strong>
                , investigative documentaries, and 5 foundational manuals to master your mind and actions.
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => enterPlatform('journey')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>
                {user
                  ? t(
                      '100-दिवसीय यात्रा खोलें (Enter Platform)',
                      'Open 100-Day Journey (Enter Platform)'
                    )
                  : t(
                      'Google से लॉग-इन करें व यात्रा शुरू करें',
                      'Sign In with Google to Enter Platform'
                    )}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {!user && (
              <button
                onClick={handleLogin}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>
                  {t(
                    'Google से साइन-इन करें (Sign In with Google)',
                    'Sign In with Google (Gmail)'
                  )}
                </span>
              </button>
            )}
          </div>
        </section>

        {/* 4 Core Platform Pillars */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => enterPlatform('journey')}
            className="p-6 rounded-3xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Compass className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono text-amber-400 uppercase">
                Pillar 01 · 100 Days
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                {t('१००-दिवसीय चेतना यात्रा', '100-Day Consciousness Journey')}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {t(
                  'प्रतिदिन १ मानसिक मॉडल, १ सामाजिक सत्य और १ व्यावहारिक अभ्यास। कोई कोरा सिद्धांत नहीं, केवल ज़मीनी एक्शन।',
                  '1 mental model, 1 societal truth, and 1 actionable protocol every day across 4 progressive phases.'
                )}
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
              <span>{t('यात्रा खोलें', 'Open Journey')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => enterPlatform('archives')}
            className="p-6 rounded-3xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono text-red-400 uppercase">
                Pillar 02 · Documentaries
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                {t('सामाजिक वृत्तचित्र संग्रह', 'Investigative Video Archives')}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {t(
                  'डिग्री का भ्रम, शादी की अर्थव्यवस्था, कोचिंग उद्योग और मिडिल-क्लास ट्रैप पर गहन केस-फाइल्स।',
                  'Deep-dive case files on degree inflation, the wedding economy, coaching factories, and middle-class traps.'
                )}
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
              <span>{t('डॉक्यूमेंट्री देखें', 'Watch Documentaries')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => enterPlatform('library')}
            className="p-6 rounded-3xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono text-emerald-400 uppercase">
                Pillar 03 · Library
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                {t('महान पुस्तकालय व ग्रंथ', 'The Great Library & Manuals')}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {t(
                  'A. K. Chandradipti के ५ मौलिक ग्रंथ, ४ क्रूसिबल ई-बुक्स और इन-ऐप हिंदी/अंग्रेज़ी बुक रीडर।',
                  '5 foundational life manuals by A. K. Chandradipti, 4 Crucible e-books, and a built-in bilingual reader with audio narration.'
                )}
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
              <span>{t('पुस्तकालय खोलें', 'Open Library')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => enterPlatform('framework')}
            className="p-6 rounded-3xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono text-purple-400 uppercase">
                Pillar 04 · Philosophy
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                {t('T2S दर्शन व मानसिक मॉडल', 'T2S Philosophy & Crucible')}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {t(
                  'Low vs High Thinking केस स्टडीज, ६ सामाजिक विरोधाभास और आत्म-मूल्यांकन प्रश्नोत्तरी।',
                  'Low vs High Thinking case studies, 6 societal paradoxes, interactive Sovereignty Audit, and Sovereign Drills.'
                )}
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
              <span>{t('दर्शन समझें', 'Explore Blueprint')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </section>

        {/* 5 Foundational Manuals Showcase */}
        <section className="bg-[#0c0e14] border border-zinc-800/80 rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                {CHANDRADIPTI_PROFILE.name} · {CHANDRADIPTI_PROFILE.role}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {t(
                  <>
                    ५ मौलिक जीवन ग्रंथ{' '}
                    <span className="text-amber-400">
                      (The 5 Foundational Manuals)
                    </span>
                  </>,
                  <>
                    The 5 Foundational{' '}
                    <span className="text-amber-400">Life Manuals</span>
                  </>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
                {t(
                  'किसी भी पुस्तक पर क्लिक करके उसका सार और मुख्य अध्याय देखें:',
                  'Click any manual below to inspect its core thesis, key rules, and chapters:'
                )}
              </p>
            </div>
            <button
              onClick={() => enterPlatform('library')}
              className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500 hover:text-black transition-all cursor-pointer self-start"
            >
              {t('संपूर्ण पुस्तकालय में पढ़ें →', 'Read in Great Library →')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {FIVE_FOUNDATIONAL_MANUALS_DETAILS.map((manual) => {
              const matchedBook = library.find((b) =>
                b.title
                  .toLowerCase()
                  .includes(manual.title.split('/')[0].trim().toLowerCase())
              );
              return (
                <div
                  key={manual.stage}
                  onClick={() => setSelectedManualModal(manual)}
                  className="p-4 rounded-2xl bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2.5">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-amber-950/30 via-zinc-950 to-black border border-zinc-800 relative flex flex-col items-center justify-center p-4 text-center">
                      {matchedBook?.coverUrl ? (
                        <img
                          src={matchedBook.coverUrl}
                          alt={manual.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="space-y-2 flex flex-col items-center">
                          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div className="text-[10px] font-mono text-amber-400/90 uppercase tracking-widest font-bold">
                            {manual.focus}
                          </div>
                          <div className="text-xs font-extrabold text-white line-clamp-2">
                            {manual.title}
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-amber-500/30 text-amber-400 text-[10px] font-mono">
                        Stage 0{manual.stage}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-mono text-amber-400 font-bold">
                        {manual.coreTheme}
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-1 mt-0.5">
                        {manual.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                        {t(manual.hindiTagline, manual.tagline)}
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-amber-400 font-bold pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                    <span>{t('विवरण देखें', 'Inspect Manual')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {t(
                'सामान्य प्रश्न (Frequently Asked Questions)',
                'Frequently Asked Questions (FAQ)'
              )}
            </h2>
            <p className="text-xs text-zinc-400">
              {t(
                'Talk2Society प्लेटफ़ॉर्म के बारे में स्पष्ट उत्तर',
                'Clear answers about the Talk2Society Sovereign Ecosystem'
              )}
            </p>
          </div>

          <div className="space-y-3">
            {GATEWAY_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm font-bold text-white">
                      {t(faq.qHi, faq.qEn)}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-amber-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/60 pt-3">
                      {t(faq.aHi, faq.aEn)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Manual Preview Modal */}
      <AnimatePresence>
        {selectedManualModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedManualModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#0d0f15] border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedManualModal(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('वापस (Back)', 'Back')}</span>
                  </button>
                  <div>
                    <div className="text-xs font-mono text-amber-400">
                      Stage 0{selectedManualModal.stage} · {selectedManualModal.focus}
                    </div>
                    <h3 className="text-2xl font-extrabold text-white mt-1">
                      {selectedManualModal.title}
                    </h3>
                    <div className="text-xs text-amber-300 mt-0.5">
                      {selectedManualModal.coreTheme}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedManualModal(null)}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">
                {selectedManualModal.hindiTagline} — {selectedManualModal.tagline}
              </p>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 leading-relaxed">
                <strong className="block text-amber-400 mb-1">
                  {t('प्रभाव (How It Influences):', 'How It Influences:')}
                </strong>
                {selectedManualModal.howItInfluences}
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">
                    {t('मूल सूत्र (Key Rule):', 'Key Rule:')}
                  </strong>{' '}
                  {selectedManualModal.keyRule}
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    if (!user) {
                      setSelectedManualModal(null);
                      handleLogin();
                      return;
                    }
                    const matchedBook = library.find((b) =>
                      b.title
                        .toLowerCase()
                        .includes(
                          selectedManualModal.title
                            .split('/')[0]
                            .trim()
                            .toLowerCase()
                        )
                    );
                    setSelectedManualModal(null);
                    if (matchedBook) {
                      handleEnterGateway();
                      openBookModal(matchedBook);
                    } else {
                      handleTabClick('library');
                    }
                  }}
                  className="flex-1 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  {t(
                    'पुस्तकालय में पूरा ग्रंथ पढ़ें (Read Full Book)',
                    'Read Full Book in Great Library'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
