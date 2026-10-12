import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Monitor,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePwaInstall } from '../../utils/pwaInstall';

export const PwaInstallGuideModal: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const { t } = useLanguage();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[130] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-xl bg-[#0c0e14] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('वापस (Back)', 'Back')}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="text-xs font-mono text-amber-400 uppercase font-bold">
            PWA App Installation · Mobile &amp; Desktop
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            {t(
              'Talk2Society ऐप इंस्टॉल करें (Mobile & Desktop)',
              'Install Talk2Society App (Mobile & Desktop PWA)'
            )}
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {t(
              'यह प्लेटफ़ॉर्म एक पूर्ण Progressive Web App (PWA) है जिसे आप मोबाइल (Android / iOS) और कंप्यूटर (Windows / Mac / Linux) दोनों पर नेटिव ऐप की तरह इंस्टॉल कर सकते हैं:',
              'Talk2Society is a full Progressive Web App (PWA) that installs natively on both Mobile (Android & iOS) and Desktop (Windows, macOS, Linux):'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mobile Instructions */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono">
              <Smartphone className="w-4 h-4" />
              <span>{t('मोबाइल (Android & iOS)', 'Mobile (Android & iOS)')}</span>
            </div>
            <ul className="space-y-2 text-xs text-zinc-300 leading-relaxed list-disc pl-4">
              <li>
                <strong>Android (Chrome / Edge / Brave):</strong>{' '}
                {t(
                  'ऊपर दाईं ओर ⋮ (तीन डॉट्स) मेनू पर टैप करें और "Install app" या "Add to Home screen" चुनें।',
                  'Tap the ⋮ (three dots) browser menu at the top right and select "Install app" or "Add to Home screen".'
                )}
              </li>
              <li>
                <strong>iPhone / iPad (Safari):</strong>{' '}
                {t(
                  'नीचे Share बटन (⬆️) पर टैप करें और "Add to Home Screen" चुनें।',
                  'Tap the Share button (⬆️) at the bottom and tap "Add to Home Screen".'
                )}
              </li>
            </ul>
          </div>

          {/* Desktop Instructions */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase font-mono">
              <Monitor className="w-4 h-4" />
              <span>{t('डेस्कटॉप (Windows / Mac)', 'Desktop (Windows / Mac)')}</span>
            </div>
            <ul className="space-y-2 text-xs text-zinc-300 leading-relaxed list-disc pl-4">
              <li>
                <strong>Chrome / Edge / Brave:</strong>{' '}
                {t(
                  'एड्रेस बार (URL बार) के दाईं ओर स्थित कंप्यूटर/डाउनलोड (⊕ / 📥) आइकन पर क्लिक करें और "Install" चुनें।',
                  'Click the Install icon (⊕ / monitor with down arrow) on the right side of the address bar and click "Install".'
                )}
              </li>
              <li>
                <strong>macOS Safari:</strong>{' '}
                {t(
                  'ऊपर File मेनू में जाएं और "Add to Dock..." चुनें।',
                  'Open File menu in the top bar and choose "Add to Dock...".'
                )}
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer"
        >
          {t('समझ गया (Got It)', 'Got It')}
        </button>
      </motion.div>
    </div>
  );
};

export const PwaInstallToast: React.FC = () => {
  const {
    canPromptNatively,
    isInstalled,
    triggerInstall,
    showInstallGuideModal,
    setShowInstallGuideModal,
  } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <PwaInstallGuideModal
        open={showInstallGuideModal}
        onClose={() => setShowInstallGuideModal(false)}
      />

      <AnimatePresence>
        {canPromptNatively && !isInstalled && !dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-[100] max-w-sm w-[calc(100%-2rem)] bg-[#0a0a0a]/95 border border-amber-500/30 rounded-[28px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md text-left"
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-3.5 items-center">
                <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-white text-xs font-black uppercase tracking-wider font-display">
                    {t('Talk2Society ऐप इंस्टॉल करें', 'Install Talk2Society App')}
                  </h4>
                  <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-none mt-0.5">
                    {t(
                      'मोबाइल और डेस्कटॉप दोनों के लिए उपलब्ध',
                      'Available for Mobile & Desktop'
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 px-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-3 text-xs text-zinc-300 leading-relaxed font-sans">
              {t(
                'अपने मोबाइल या कंप्यूटर पर Talk2Society ऐप इंस्टॉल करें ताकि बिना इंटरनेट रुकावट और पूरी स्क्रीन पर अध्ययन कर सकें।',
                'Install Talk2Society on your phone or computer for instant full-screen access and offline reliability.'
              )}
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => triggerInstall()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[10px] font-black uppercase tracking-wider rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('इंस्टॉल करें (Install)', 'Install Now')}</span>
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="px-4 py-2.5 bg-white/5 border border-white/5 text-gray-400 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                {t('बाद में', 'Later')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const ToastNotification: React.FC = () => {
  const { toast, dismissToast } = useAppContext();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          className={`fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-[120] max-w-sm w-[calc(100%-2rem)] p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-3 text-left ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50'
              : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-200 shadow-amber-950/50'
                : toast.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-950/50'
                  : 'bg-zinc-900/90 border-zinc-700 text-zinc-200 shadow-black/60'
          }`}
        >
          <div className="shrink-0 pt-0.5">
            {toast.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            {toast.type === 'warning' && (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            )}
            {toast.type === 'error' && (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            )}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          </div>
          <div className="flex-1 space-y-1">
            <h5 className="text-xs font-bold font-mono tracking-wide">
              {toast.title}
            </h5>
            {toast.message && (
              <p className="text-[11px] opacity-90 leading-relaxed font-sans">
                {toast.message}
              </p>
            )}
          </div>
          <button
            onClick={dismissToast}
            className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
