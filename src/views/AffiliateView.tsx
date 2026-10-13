import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import {
  Share2,
  Copy,
  Check,
  Users,
  Award,
  Zap,
  Send,
  Sparkles,
} from 'lucide-react';
import { db } from '../config/firebase';
import { Card, VipSectionLockedView } from '../components/common/UiPrimitives';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export const AffiliateView: React.FC = () => {
  const { profile, isSectionVipGated, openAscensionModal, showToast } = useAppContext();
  const { t } = useLanguage();

  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const referralCode = profile?.uid ? profile.uid.slice(0, 8).toUpperCase() : 'SOVEREIGN';
  const referralUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?ref=${referralCode}`
      : `https://talk2society.com/?ref=${referralCode}`;

  useEffect(() => {
    if (!profile?.uid) return;
    const fetchReferrals = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('referredBy', '==', referralCode)
        );
        const snap = await getCountFromServer(q);
        setReferralCount(snap.data().count);
      } catch {}
    };
    fetchReferrals();
  }, [profile?.uid, referralCode]);

  if (isSectionVipGated('affiliate')) {
    return (
      <VipSectionLockedView
        sectionTitle="Sovereign Partner & Affiliate Portal"
        hindiTitle="सहयोगी पोर्टल व संप्रभु पार्टनर"
        description="The Sovereign Partner & Affiliate Program is currently reserved for VIP Strategist members."
        onUnlock={openAscensionModal}
      />
    );
  }

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    showToast({
      title: t('रेफ़रल लिंक कॉपी हो गया', 'Referral Link Copied'),
      message: t(
        'अपने मित्रों और साथियों के साथ साझा करें।',
        'Share your invite link with fellow practitioners.'
      ),
      type: 'success',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOnWhatsApp = () => {
    const msg = `⚡ *Talk2Society — 100-Day Consciousness & Social Reality Platform*\n\nभारतीय समाज की अदृश्य व्यवस्था, मानसिक मॉडल और 100-दिवसीय आत्म-अनुशासन यात्रा से जुड़ें:\n${referralUrl}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-5xl mx-auto pb-16"
    >
      <div className="bg-[#0c0e14] border border-[#1d222e] rounded-3xl p-6 sm:p-10 relative overflow-hidden space-y-4">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono uppercase tracking-widest font-bold">
          <Share2 className="w-3.5 h-3.5" />
          <span>{t('सहयोगी मंच // SOVEREIGN PARTNER NETWORK', 'SOVEREIGN PARTNER NETWORK')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-display font-black text-white uppercase tracking-tight">
          {t('संप्रभु सहयोगी', 'Sovereign')}{' '}
          <span className="text-amber-400">{t('पोर्टल (Partner Portal)', 'Partner Portal')}</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
          {t(
            'जागरूक युवाओं और गंभीर साधकों को Talk2Society Crucible से जोड़ें। आपके रेफ़रल लिंक से जुड़ने वाले प्रत्येक साधक का रिकॉर्ड आपके खाते से जुड़ता है।',
            'Invite serious seekers and disciplined thinkers to the Talk2Society Crucible. Every practitioner who joins via your referral link is credited to your account.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>{t('आपका पार्टनर कोड', 'YOUR PARTNER CODE')}</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-black text-amber-400">{referralCode}</div>
          <p className="text-[11px] text-zinc-500">
            {t('विशिष्ट साधक पहचान कोड', 'Unique Practitioner Identifier')}
          </p>
        </Card>

        <Card className="space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>{t('जुड़े हुए साधक', 'REFERRED PRACTITIONERS')}</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-black text-white">{referralCount}</div>
          <p className="text-[11px] text-zinc-500">
            {t('आपके लिंक से जुड़े सदस्य', 'Joined via your invite link')}
          </p>
        </Card>

        <Card className="space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>{t('सहयोगी स्तर', 'PARTNER TIER')}</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-mono font-black text-white">
            {referralCount >= 10
              ? 'Vanguard'
              : referralCount >= 3
                ? 'Emissary'
                : 'Initiate'}
          </div>
          <p className="text-[11px] text-zinc-500">
            {t('30% Sovereign Pass कमीशन पात्र', '30% Sovereign Pass Commission Eligible')}
          </p>
        </Card>
      </div>

      <Card className="space-y-5">
        <div>
          <h3 className="text-base font-bold text-white">
            {t('आपका व्यक्तिगत आमंत्रण लिंक (Your Invite Link)', 'Your Personal Invite Link')}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {t(
              'इस लिंक को कॉपी करें या सीधे WhatsApp / Telegram पर साझा करें:',
              'Copy this link or share it directly on WhatsApp or Telegram:'
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            readOnly
            value={referralUrl}
            className="flex-1 bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-mono text-amber-300 select-all focus:outline-none"
          />
          <button
            onClick={copyReferralLink}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t('कॉपी हो गया!', 'Copied!') : t('लिंक कॉपी करें', 'Copy Link')}</span>
          </button>
          <button
            onClick={shareOnWhatsApp}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>{t('WhatsApp पर साझा करें', 'WhatsApp Share')}</span>
          </button>
        </div>
      </Card>
    </motion.div>
  );
};
