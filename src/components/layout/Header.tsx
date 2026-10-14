import React from 'react';
import {
  ArrowLeft,
  Menu,
  X,
  Search,
  Zap,
  Shield,
  Download,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from '../common/LanguageToggle';
import { usePwaInstall } from '../../utils/pwaInstall';

const TAB_LABELS: Record<string, { hi: string; en: string }> = {
  journey: { hi: '१००-दिवसीय यात्रा', en: '100-Day Journey' },
  framework: { hi: 'हमारा दर्शन (सरल गाइड)', en: 'Simple Guide & Philosophy' },
  blueprint: { hi: 'हमारा दर्शन (सरल गाइड)', en: 'Simple Guide & Philosophy' },
  archives: { hi: 'वृत्तचित्र संग्रह', en: 'Video Archives' },
  library: { hi: 'महान पुस्तकालय', en: 'Great Library' },
  forum: { hi: 'साधक चर्चा मंच', en: 'Community Forum' },
  shop: { hi: 'रणनीतिक संसाधन दुकान', en: 'Strategic Shop' },
  leaderboard: { hi: 'साधक लीडरबोर्ड', en: 'Leaderboard' },
  affiliate: { hi: 'सहयोगी पोर्टल', en: 'Partner Portal' },
  profile: { hi: 'मेरी प्रोफ़ाइल', en: 'My Profile' },
  admin: { hi: 'व्यवस्थापक कमांड सेंटर', en: 'Admin Command Center' },
};

export const Header: React.FC = () => {
  const {
    user,
    profile,
    activeTab,
    isSidebarOpen,
    openSidebarDrawer,
    closeSidebarDrawer,
    handleDesktopBack,
    openSearchModal,
    openAscensionModal,
    handleTabClick,
    isCurrentUserAdmin,
  } = useAppContext();
  const { lang, t } = useLanguage();
  const { isInstalled, triggerInstall } = usePwaInstall();

  const current = TAB_LABELS[activeTab] || {
    hi: activeTab,
    en: activeTab.replace('-', ' '),
  };

  return (
    <header className="h-14 sm:h-16 md:h-20 border-b border-[#1a1d24] bg-[#0c0e14]/95 backdrop-blur-md flex items-center justify-between px-2.5 sm:px-4 md:px-8 sticky top-0 z-30 shrink-0 select-none">
      <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 min-w-0">
        {/* Universal Back Button for BOTH Mobile and Desktop */}
        <button
          onClick={handleDesktopBack}
          className="flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95 hover:text-white text-zinc-200 rounded-xl border border-zinc-700/70 transition-all text-xs font-semibold cursor-pointer shrink-0 shadow-sm"
          title={t('पीछे जाएं (Back)', 'Go Back')}
          aria-label={t('पीछे जाएं', 'Go Back')}
        >
          <ArrowLeft className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">{t('वापस', 'Back')}</span>
        </button>

        {/* Sidebar Navigation Toggle for BOTH Mobile Drawer and Desktop Sidebar */}
        <button
          onClick={() => (isSidebarOpen ? closeSidebarDrawer() : openSidebarDrawer())}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white shrink-0 cursor-pointer border border-white/5"
          aria-label="Toggle Sidebar Navigation"
          title={t('साइडबार मेनू', 'Toggle Sidebar Navigation')}
        >
          {isSidebarOpen ? (
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          ) : (
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-200" />
          )}
        </button>

        <div className="flex items-center gap-1.5 min-w-0">
          <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate flex items-center gap-1.5">
            <span className="text-amber-400 font-extrabold truncate">
              {lang === 'hi' ? current.hi : current.en}
            </span>
            <span className="text-zinc-600 hidden md:inline">/</span>
            <span className="text-zinc-400 font-medium hidden md:inline text-xs truncate">
              {lang === 'hi' ? current.en : current.hi}
            </span>
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 shrink-0">
        {/* Bilingual Language Switcher Button (Hindi / English) */}
        <LanguageToggle />

        {/* PWA Install Button for Mobile & Desktop */}
        {!isInstalled && (
          <button
            onClick={() => triggerInstall()}
            className="w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1.5 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 border border-amber-500/30 rounded-xl text-amber-300 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            title={t(
              'मोबाइल या डेस्कटॉप ऐप इंस्टॉल करें',
              'Install Mobile / Desktop App (PWA)'
            )}
          >
            <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden xl:inline text-xs font-mono font-bold">
              {t('ऐप इंस्टॉल', 'Install App')}
            </span>
          </button>
        )}

        <button
          onClick={openSearchModal}
          className="w-8 h-8 sm:w-9 sm:h-9 md:w-auto md:px-3 md:py-1.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-xl text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          aria-label={t('खोजें', 'Search')}
          title={t('खोजें (Ctrl+K)', 'Search (Ctrl+K)')}
        >
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
          <span className="hidden lg:inline text-xs font-mono font-medium">
            {t('खोजें', 'Search')}
          </span>
        </button>

        {isCurrentUserAdmin && (
          <button
            onClick={() => handleTabClick('admin')}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer shrink-0 ${
              activeTab === 'admin'
                ? 'bg-amber-500 text-black border-amber-400'
                : 'bg-zinc-900/90 hover:bg-zinc-800 text-amber-400 border-amber-500/30'
            }`}
            title={t('व्यवस्थापक पैनल (Admin Panel)', 'Admin Command Center')}
          >
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">{t('एडमिन', 'Admin')}</span>
          </button>
        )}

        {profile && (profile.isStrategist || profile.isAdmin) ? (
          <div
            className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-green-500/15 border border-green-500/30 text-green-400 rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-wider shrink-0 shadow-sm"
            title={t('संप्रभु VIP सदस्य', 'Sovereign VIP Member')}
          >
            <Zap className="w-3 h-3 text-green-400 fill-green-400 shrink-0" />
            <span className="font-bold">VIP</span>
          </div>
        ) : (
          <button
            onClick={openAscensionModal}
            className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-black rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.25)] transition-all cursor-pointer shrink-0"
            title={t('VIP अनलॉक करें', 'Unlock VIP')}
          >
            <Zap className="w-3 h-3 fill-black text-black shrink-0" />
            <span>VIP</span>
          </button>
        )}

        <div
          className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl border border-white/10 bg-zinc-900 flex items-center justify-center p-0.5 overflow-hidden ring-1 ring-white/10 hover:ring-amber-500/50 active:scale-95 transition-all cursor-pointer shrink-0"
          onClick={() => handleTabClick('profile')}
          title={t('प्रोफ़ाइल देखें', 'View Profile')}
        >
          <img
            src={
              profile?.photoURL ||
              user?.photoURL ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'sovereign'}`
            }
            alt="avatar"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </header>
  );
};
