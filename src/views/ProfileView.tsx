import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  Upload,
  Image as ImageIcon,
  Save,
  Edit2,
  Trophy,
  Flame,
  Target,
  Shield,
  Award,
  FileText,
  Zap,
  CheckCircle2,
  BookOpen,
  Copy,
  Share2,
  Smartphone,
  Download,
  Info,
} from 'lucide-react';
import {
  db,
  handleFirestoreError,
  OperationType,
} from '../config/firebase';
import { getRankFromXP, STORAGE_KEYS } from '../config/constants';
import { Card, StatCard } from '../components/common/UiPrimitives';
import { LeaderboardView } from './LeaderboardView';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { usePwaInstall } from '../utils/pwaInstall';

const AndroidInstallCard: React.FC = () => {
  const { triggerInstall } = usePwaInstall();
  const { t } = useLanguage();
  const [showManualGuide, setShowManualGuide] = useState(false);

  const handleInstallClick = async () => {
    const res = await triggerInstall();
    if (res === 'manual') {
      setShowManualGuide(true);
    }
  };

  return (
    <Card className="bg-[#0c0c0c] border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.05)] overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-2">
        <div className="flex items-center gap-5 text-left">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <Smartphone className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-500 rounded-full font-mono uppercase tracking-widest select-none mb-1.5">
              <span>Android &amp; iOS Native App Installer</span>
            </div>
            <h4 className="text-white text-lg font-black uppercase tracking-tight">
              {t('Talk2Society मोबाइल ऐप इनस्टॉलर', 'Talk2Society Mobile & Desktop App')}
            </h4>
            <p className="text-xs text-zinc-300 max-w-xl mt-1 leading-relaxed">
              {t(
                'Talk2Society ऐप को सीधे अपने फ़ोन में इंस्टॉल करें! इससे आपको मिलेगा तेज एक्सेस, बिना इंटरनेट रुकावट अध्ययन और मोबाइल स्क्रीन के अनुकूल शानदार अनुभव।',
                'Install the Talk2Society app directly on your phone or desktop for fast access, distraction-free study, and a native experience.'
              )}
            </p>
          </div>
        </div>
        <button
          onClick={handleInstallClick}
          className="w-full md:w-auto px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{t('ऐप इनस्टॉल करें (Install App)', 'Install Mobile / Desktop App')}</span>
        </button>
      </div>

      {showManualGuide && (
        <div className="my-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono">
          <p className="font-bold flex items-center gap-2 mb-1">
            <Info className="w-4 h-4 text-amber-400" />
            मोबाइल पर इनस्टॉल करने का आसान तरीका:
          </p>
          <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
            यदि अपने आप इनस्टॉल का पॉपअप नहीं आया है, तो अपने मोबाइल ब्राउज़र (Chrome या Safari) के मेनू (तीन डॉट्स ⋮ या Share बटन) पर टैप करें और{' '}
            <strong>"Install app"</strong> या{' '}
            <strong>"Add to Home screen" (होम स्क्रीन पर जोड़ें)</strong> चुनें।
          </p>
        </div>
      )}

      <div className="border-t border-white/5 bg-black/40 p-4 mt-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">
            Step 01 • Connect URL
          </span>
          <h5 className="text-white text-xs font-black uppercase tracking-tight leading-none pt-0.5">
            Mobile Access Route
          </h5>
          <p className="text-[10px] text-gray-500 leading-normal">
            Open Chrome, Samsung Web Browser, or Safari on your phone and enter this active URL.
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">
            Step 02 • Native Install
          </span>
          <h5 className="text-white text-xs font-black uppercase tracking-tight leading-none pt-0.5">
            Launcher Integration
          </h5>
          <p className="text-[10px] text-gray-500 leading-normal">
            Select "Add to home screen" inside browser settings or click the button above.
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">
            Step 03 • Synchronized Core
          </span>
          <h5 className="text-white text-xs font-black uppercase tracking-tight leading-none pt-0.5">
            Real-Time Ledger
          </h5>
          <p className="text-[10px] text-gray-500 leading-normal">
            Log in on mobile to automatically resume your daily streaks, module integrations, and premium access.
          </p>
        </div>
      </div>
    </Card>
  );
};

export const ProfileView: React.FC = () => {
  const {
    user,
    profile,
    setProfile,
    upsertUserAccount,
    rank,
    openAscensionModal,
    setShowCertificateModal,
    setShowJournalModal,
    showToast,
  } = useAppContext();
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(profile?.displayName || 'Anonymous User');
  const [newBio, setNewBio] = useState(profile?.bio || '');
  const [newPhotoURL, setNewPhotoURL] = useState(profile?.photoURL || '');
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing && profile) {
      setNewName(profile.displayName || 'Anonymous User');
      setNewBio(profile.bio || '');
      setNewPhotoURL(profile.photoURL || '');
      setImageError(null);
    }
  }, [profile, isEditing]);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white/5 border border-white/5 rounded-3xl">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">
          Loading Member Dossier...
        </p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 700000) {
      setImageError(
        'चित्र बहुत बड़ा है। कृपया 700KB से छोटा चित्र चुनें (Image must be under 700KB).'
      );
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPhotoURL(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const updateProfile = async () => {
    if (
      (!newName.trim() || newName === profile.displayName) &&
      newBio === (profile.bio || '') &&
      newPhotoURL === (profile.photoURL || '')
    ) {
      setIsEditing(false);
      return;
    }

    const updated = {
      ...profile,
      displayName: newName.trim(),
      bio: newBio.trim(),
      photoURL: newPhotoURL,
    };
    setProfile(updated);

    if (user && profile.uid !== 'guest') {
      localStorage.setItem(
        STORAGE_KEYS.PROFILE_CACHE_PREFIX + profile.uid,
        JSON.stringify(updated)
      );
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, JSON.stringify(updated));
      setIsEditing(false);

      await upsertUserAccount(updated);
      showToast({
        title: 'प्रोफ़ाइल अपडेट की गई (Profile Saved)',
        message: 'आपका प्रोफ़ाइल डेटा सर्वर पर सुरक्षित कर लिया गया है।',
        type: 'success',
      });
    } else {
      localStorage.setItem(STORAGE_KEYS.GUEST_PROFILE, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, JSON.stringify(updated));
      setIsEditing(false);
      showToast({
        title: 'प्रोफ़ाइल सुरक्षित (Profile Updated)',
        message: 'Google से साइन-इन करने पर यह प्रोफ़ाइल अपने आप सर्वर पर सिंक हो जाएगी।',
        type: 'success',
      });
    }
  };

  const rankInfo = getRankFromXP(profile.xp || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16"
    >
      <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center md:items-start text-center md:text-left">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] md:rounded-[40px] overflow-hidden ring-4 ring-white/5 ring-offset-4 md:ring-offset-8 ring-offset-black shrink-0 shadow-2xl relative group">
          <img
            src={
              newPhotoURL ||
              profile.photoURL ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`
            }
            alt="avatar"
            className="w-full h-full object-cover"
          />
          {isEditing && (
            <label className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Upload className="w-6 h-6 text-white mb-2" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white">
                Upload New
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
        {imageError && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-mono max-w-xs">
            {imageError}
          </div>
        )}
        <div className="flex-1 space-y-6 w-full">
          <div className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            Level {profile.level} / चरण {profile.level}
          </div>

          {isEditing ? (
            <div className="space-y-6 text-left">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                  Identity Display (नाम)
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Your Name (आपका नाम)"
                  className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-xl sm:text-3xl font-display font-black text-white w-full max-w-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                  Profile Visual (प्रोफ़ाइल चित्र)
                </label>
                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="flex items-center gap-3 px-5 py-3 sm:px-6 sm:py-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-xs font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-all text-left cursor-pointer"
                  >
                    <ImageIcon size={16} />
                    Change Photo / फोटो बदलें
                  </button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {newPhotoURL && newPhotoURL.startsWith('data:') && (
                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">
                      New Image Selected
                    </span>
                  )}
                </div>
              </div>
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                placeholder="Talk about yourself... (अपने बारे में कुछ लिखें...)"
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-gray-400 w-full max-w-md h-32 resize-none font-medium"
              />
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md">
                <button
                  onClick={updateProfile}
                  className="px-8 py-3 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl cursor-pointer"
                >
                  <Save size={16} /> Save Profile / सुरक्षित करें
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewName(profile.displayName);
                    setNewBio(profile.bio || '');
                    setNewPhotoURL(profile.photoURL || '');
                  }}
                  className="px-8 py-3 bg-white/5 text-white rounded-xl text-xs font-bold uppercase tracking-wider justify-center cursor-pointer"
                >
                  Cancel / रद्द करें
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-4 sm:gap-6">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-black text-white tracking-tight uppercase leading-none">
                  {profile.displayName}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 md:p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/5 shrink-0 cursor-pointer"
                >
                  <Edit2 size={18} />
                </button>
              </div>
              <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl font-medium italic leading-relaxed mx-auto md:mx-0">
                {profile.bio ||
                  'No summary provided. Edit your profile to share your journey. (कोई जानकारी उपलब्ध नहीं है।)'}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-3 text-gray-600 text-[10px] font-bold uppercase tracking-widest flex-wrap">
                <span>{profile.email}</span>
                <span className="w-1 h-1 bg-gray-800 rounded-full" />
                <span>Verified Participant</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Trophy className="text-white" />}
          label={t('कुल अंक', 'Total Points')}
          secondaryLabel={t('Total Points', 'कुल अंक')}
          value={(profile.xp ?? 0).toLocaleString()}
        />
        <StatCard
          icon={<Flame className="text-white" />}
          label={t('दैनिक सिलसिला', 'Daily Streak')}
          secondaryLabel={t('Daily Streak', 'दैनिक सिलसिला')}
          value={`${profile.streak ?? 1} ${t('दिन', 'Days')}`}
        />
        <StatCard
          icon={<Target className="text-white" />}
          label={t('आपकी रैंक', 'Your Rank')}
          secondaryLabel={`${rankInfo.hindiName} (${rankInfo.name})`}
          value={`#${rank || '...'}`}
        />
        <StatCard
          icon={<Shield className="text-white" />}
          label={t('सदस्यता स्तर', 'Member Status')}
          secondaryLabel={t('Member Status', 'सदस्यता स्तर')}
          value={
            profile.isStrategist || profile.isAdmin
              ? t('विशेष (Special)', 'Special')
              : t('सामान्य (Standard)', 'Standard')
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowCertificateModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500/15 via-zinc-900 to-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl text-xs font-mono font-bold text-amber-400 flex items-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>
            {t(
              'संप्रभुता प्रमाण पत्र (7, 21, 50, 100 दिन)',
              'Sovereign Certificate (7, 21, 50, 100 Days)'
            )}
          </span>
        </button>

        <button
          onClick={() => setShowJournalModal(true)}
          className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-2xl text-xs font-mono font-bold text-zinc-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>
            {t(
              `दैनिक चिंतन डायरी व PDF (${Object.keys(profile.dailyReflections || {}).length} प्रविष्टियां)`,
              `Wisdom Log & PDF Export (${Object.keys(profile.dailyReflections || {}).length} Entries)`
            )}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {!profile.isStrategist && !profile.isAdmin ? (
          <Card className="lg:col-span-2 bg-white/5 border-white/20">
            {profile.premiumRequestStatus === 'pending' ? (
              <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                <div className="w-24 h-24 bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.15)] rotate-3 shrink-0">
                  <Zap size={48} className="text-amber-400 fill-amber-400/20" />
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-full text-[9px] font-mono font-black uppercase tracking-widest">
                    ⏱️ {t('भुगतान सत्यापन लंबित है', 'PAYMENT VERIFICATION PENDING')}
                  </div>
                  <h2 className="text-3xl font-display font-black text-white italic tracking-tighter uppercase leading-none pt-1">
                    {t('सत्यापन प्रगति पर है', 'Ledger Update in Progress')}
                  </h2>
                  <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-xl">
                    {t(
                      'व्यवस्थापक (A. K. Chandradipti) आपके भुगतान सत्यापन का मिलान कर रहे हैं। समीक्षा पूर्ण होने पर आपकी सदस्यता स्वचालित रूप से Special Strategist स्तर पर उन्नत कर दी जाएगी।',
                      'The Administrator (A. K. Chandradipti) is verifying your payment. Once approved, your account will be upgraded to Special Strategist status.'
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)] rotate-3 shrink-0">
                  <Zap size={48} className="text-black fill-black" />
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                    {t('विशेष सदस्य बनें (First 100 Days)', 'Join Special Group (First 100 Days)')}
                  </h2>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xl">
                    {t(
                      'प्रथम १०० दिनों (First 100 Days) के लिए सभी प्रीमियम किताबें, वीडियो डॉक्यूमेंट्री और विशेष प्रशिक्षण मॉड्यूल अनलॉक करें — मात्र ',
                      'Unlock full premium access for the First 100 Days to all books, video breakdowns, and special training modules — only '
                    )}
                    <span className="line-through text-gray-500">Rs. 2,999</span>{' '}
                    <strong className="text-amber-400 font-bold">Rs. 299</strong>{' '}
                    {t('(प्रथम १०० दिनों के लिए)!', '(for the first 100 days)!')}
                  </p>
                  <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                    <button
                      onClick={openAscensionModal}
                      className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-gray-200 transition-all shadow-xl flex flex-col items-center cursor-pointer font-bold"
                    >
                      <span>{t('विशेष एक्सेस अनलॉक करें', 'Unlock Special Access')}</span>
                      <span className="text-[8px] normal-case tracking-normal opacity-75">
                        {t(
                          'Rs. 299 (Rs. 2,999) • प्रथम १०० दिनों के लिए',
                          'Rs. 299 (Rs. 2,999) • For First 100 Days'
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="lg:col-span-2 bg-gradient-to-r from-green-500/5 via-neutral-900 to-green-500/5 border-green-500/20">
            <div className="flex flex-col md:flex-row items-center gap-8 py-4">
              <div className="w-24 h-24 bg-green-500/10 border-2 border-green-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.15)] rotate-3 shrink-0">
                <Zap size={48} className="text-green-400 fill-green-400" />
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-400/30 text-green-400 rounded-full text-[9px] font-mono font-black uppercase tracking-widest">
                  👑 {t('प्रीमियम संप्रभु प्राप्त है', 'SOVEREIGN CLEARANCE ACTIVE')}
                </div>
                <h2 className="text-3xl font-display font-black text-white italic tracking-tighter uppercase leading-none pt-1">
                  {t('प्रीमियम एक्सेस सक्रिय है', 'Premium Access Active')}
                </h2>
                <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-xl">
                  {t(
                    'आपके पास पूर्ण Special Strategist सदस्यता अधिकार हैं। सभी प्रीमियम फाइलों और रणनीतियों का अध्ययन करें।',
                    'You hold complete Special Strategist membership permissions. Enjoy all premium files, books, and strategies.'
                  )}
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />{' '}
              {t('पाठ्यक्रम विवरण (Curriculum Engagement)', 'Curriculum Engagement')}
            </h3>
            <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">
              {t('सक्रिय', 'Active')}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                {t('१००-दिवसीय यात्रा', '100-Day Consciousness')}
              </span>
              <div className="text-xl font-bold font-mono text-white">
                {(profile.completedDays || []).length} / 100 {t('दिन', 'Days')}
              </div>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                {t('अनुशासित उपस्थिति', 'Disciplined Presence')}
              </span>
              <div className="text-xl font-bold font-mono text-amber-400">
                {profile.streak || 1} {t('दिन सक्रिय', 'Days Active')}
              </div>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                {t('चिंतन डायरी', 'Reflection Journal')}
              </span>
              <div className="text-xl font-bold font-mono text-white">
                {Object.keys(profile.dailyReflections || {}).length} {t('प्रविष्टियां', 'Entries')}
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />{' '}
              {t('हाल के पूर्ण किए गए दिन', 'Recent Integrations')}
            </h3>
            <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">
              {t('सत्यापित', 'Verified')}
            </span>
          </div>
          <div className="space-y-3">
            {!profile.completedDays || profile.completedDays.length === 0 ? (
              <p className="text-gray-500 italic text-sm">
                {t('अभी तक कोई दिन पूर्ण नहीं किया गया है।', 'No modules integrated into frame yet.')}
              </p>
            ) : (
              [...(profile.completedDays || [])]
                .reverse()
                .slice(0, 5)
                .map((day) => (
                  <div
                    key={day}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-black text-white/40 font-mono">
                        DAY {day < 10 ? `0${day}` : day}
                      </div>
                      <div className="text-xs text-white/70 font-bold uppercase tracking-tight">
                        {t('संकल्प पूर्ण (Pattern Recognized)', 'Pattern Recognized')}
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      {t('पूर्ण', 'AUTHORIZED')}
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />{' '}
              {t('दैनिक चिंतन इतिहास (Wisdom Log)', 'Wisdom Log / Daily Reflections')}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowJournalModal(true)}
                className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {t(
                    'डायरी खोलें व सुंदर PDF डाउनलोड करें',
                    'Open Diary & Export Beautiful PDF'
                  )}
                </span>
              </button>
              <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-widest bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-700">
                {Object.keys(profile.dailyReflections || {}).length}{' '}
                {t('दर्ज', 'Recorded')}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            {!profile.dailyReflections ||
            Object.keys(profile.dailyReflections).length === 0 ? (
              <p className="text-gray-500 italic text-sm text-center py-8 col-span-2">
                No nightly reflections recorded yet. Your wisdom timeline will appear here. (कोई चिंतन उपलब्ध नहीं है।)
              </p>
            ) : (
              Object.entries(profile.dailyReflections)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([date, reflection]) => (
                  <div
                    key={date}
                    className="p-4 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl space-y-3 transition-colors flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-500/10">
                        {date}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            const text = `✦ Talk2Society Nightly Wisdom [${date}]\n"${reflection}"\n— ${profile.displayName}`;
                            navigator.clipboard.writeText(text);
                          }}
                          title="Copy reflection"
                          className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          onClick={() => {
                            const msg = `*Talk2Society Nightly Wisdom* 📜\n\n"${reflection}"\n\n🗓️ Date: ${date}\n👤 Practitioner: ${profile.displayName}\n⚡ 100-Day Consciousness Journey`;
                            const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                              msg
                            )}`;
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                          title="Share on WhatsApp"
                          className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Share2 size={11} />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-400 font-medium italic leading-relaxed">
                      "{reflection}"
                    </p>
                  </div>
                ))
            )}
          </div>
        </Card>

        <div className="lg:col-span-2">
          <AndroidInstallCard />
        </div>

        <div className="lg:col-span-2 mt-8">
          <LeaderboardView embedded />
        </div>
      </div>
    </motion.div>
  );
};
