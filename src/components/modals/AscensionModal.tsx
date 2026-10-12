import React, { useState } from 'react';
import { motion } from 'motion/react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, X, Zap, Check, Send, CheckCircle2 } from 'lucide-react';
import { db } from '../../config/firebase';
import { useAppContext } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export const AscensionModal: React.FC = () => {
  const {
    isAscensionOpen,
    closeAscensionModal,
    user,
    profile,
    upsertUserAccount,
    handleLogin,
    showToast,
  } = useAppContext();
  const { t } = useLanguage();

  const [utrNumber, setUtrNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAscensionOpen) return null;

  const handleRequestVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) return;
    if (!user) {
      showToast({
        title: t('लॉगिन आवश्यक', 'Sign-In Required'),
        message: t(
          'अपना UTR सत्यापन भेजने के लिए कृपया पहले Google से साइन-इन करें।',
          'Please sign in with Google first so your UTR verification can be linked to your account.'
        ),
        type: 'warning',
      });
      await handleLogin();
      return;
    }
    setSubmitting(true);
    try {
      const cleanUtr = utrNumber.trim();
      await upsertUserAccount({
        ...(profile || {}),
        uid: user.uid,
        email: (user.email || profile?.email || '').trim().toLowerCase(),
        displayName:
          user.displayName || profile?.displayName || 'Sovereign Practitioner',
        photoURL: user.photoURL || profile?.photoURL || '',
        premiumRequestStatus: 'pending',
        premiumPaymentId: cleanUtr,
        utrNumber: cleanUtr,
        premiumRequestedAt: new Date().toISOString(),
      });
      setUtrNumber('');
      showToast({
        title: t('सत्यापन अनुरोध भेजा गया', 'Verification Request Submitted'),
        message: t(
          'आपका UTR एडमिन पैनल में दर्ज हो गया है। स्वीकृति मिलते ही VIP अनलॉक हो जाएगा।',
          'Your UTR is now in the Admin Verification Queue. VIP access unlocks immediately upon approval.'
        ),
        type: 'success',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-start justify-center p-4 overflow-y-auto"
      onClick={closeAscensionModal}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-zinc-950 border border-zinc-900 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(245,158,11,0.1)] relative p-6 md:p-10 text-center space-y-7 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={closeAscensionModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('वापस (Back)', 'Back')}</span>
          </button>
          <button
            onClick={closeAscensionModal}
            className="ml-auto p-2 rounded-xl bg-zinc-900 w-10 h-10 flex items-center justify-center hover:bg-white/5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-16 h-16 bg-gradient-to-tr from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.15)]">
          <Zap className="w-8 h-8 text-amber-500 fill-amber-500/20" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-display font-black text-white italic tracking-tighter uppercase leading-none select-none">
            {t('संप्रभु प्रवेश / Sovereign Ascension', 'Sovereign Ascension / संप्रभु प्रवेश')}
          </h2>
          <p className="text-zinc-500 font-mono text-[10px] font-black tracking-widest uppercase select-none">
            The Elite Strategists Handshake
          </p>
        </div>

        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex justify-between items-center text-left">
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
              {t('आजीवन सदस्यता', 'Lifetime Membership')}
            </div>
            <div className="text-white font-black text-sm uppercase">
              {t('संप्रभु पास (Sovereign Pass)', 'Sovereign Pass / संप्रभु पास')}
            </div>
            <div className="text-[9px] text-amber-500 font-mono mt-0.5 uppercase tracking-wider font-extrabold flex items-center gap-1">
              <span className="w-1 h-1 bg-amber-500 rounded-full animate-ping" /> First 100 Users
              Special Offer
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1.5">
              <span className="line-through text-zinc-600 text-xs font-bold">Rs. 2,999</span>
              <span className="text-2xl font-display font-black text-amber-500">Rs. 299</span>
            </div>
            <div className="text-[9px] font-mono text-zinc-500 font-black uppercase">
              {t('एक बार / सदा के लिए', 'One-Time / Lifetime')}
            </div>
          </div>
        </div>

        <div className="p-5 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-4 text-left">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
            {t('सदस्यता लाभ (Authorized Deliverables):', 'Authorized Member Deliverables:')}
          </div>
          <div className="space-y-4 text-xs text-zinc-300 font-sans">
            <div className="flex items-start gap-3">
              <Check className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <strong className="text-white block font-bold text-sm">
                  {t('१००-दिवसीय विशेष यात्रा व पांडुलिपियाँ', '100-Day Special Journey & Books')}
                </strong>
                <span className="text-zinc-400">
                  {t(
                    'सभी १०० दिनों के प्रीमियम अध्याय, ५ मौलिक जीवन ग्रंथ और ४ क्रूसिबल ई-बुक्स अनलॉक करें।',
                    'Unlock Day 01-100 full strategums, 5 foundational manuals, and 4 Crucible e-books.'
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <strong className="text-white block font-bold text-sm">
                  {t('असीमित ऑडियो व डॉक्यूमेंट्री आर्काइव्स', 'Limitless Audio & Video Archives')}
                </strong>
                <span className="text-zinc-400">
                  {t(
                    'सभी लॉक किए गए डॉक्यूमेंट्री केस-फाइल्स और ऑडियो विश्लेषण तक पूर्ण पहुँच।',
                    'Gain access to all locked video case files and built-in audio narrations.'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Server UTR Verification Form */}
        {profile?.premiumRequestStatus === 'pending' ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {t(
                `आपका सत्यापन अनुरोध लंबित है (Ref: ${profile.premiumPaymentId || 'Submitted'})`,
                `Verification Pending in Admin Queue (Ref: ${profile.premiumPaymentId || 'Submitted'})`
              )}
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleRequestVerification}
            className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3 text-left"
          >
            <div className="text-xs font-mono text-amber-400 font-bold uppercase">
              {t(
                'भुगतान UTR / संदर्भ संख्या दर्ज करें (Instant Server Verification):',
                'Submit Payment UTR / Telegram Ref for Admin Approval:'
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder={t(
                  '12-अंकीय UPI UTR या अपना Telegram यूज़रनेम लिखें...',
                  'Enter 12-digit UPI UTR or Telegram username...'
                )}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
              <button
                type="submit"
                disabled={submitting || !utrNumber.trim()}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-xs font-mono uppercase cursor-pointer shrink-0"
              >
                {submitting ? 'Sending...' : t('सत्यापित करें', 'Submit Ref')}
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <a
            href="https://t.me/A_K_Chandradipti"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-mono font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 font-bold cursor-pointer font-sans"
          >
            <Send className="w-4 h-4 fill-black" />{' '}
            {t('टेलीग्राम पर संदेश भेजें (DM on Telegram)', 'DM on Telegram')}
          </a>
          <button
            onClick={closeAscensionModal}
            className="px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl font-mono font-black uppercase tracking-widest text-[10px] md:text-xs transition-all cursor-pointer"
          >
            {t('बंद करें', 'Close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
