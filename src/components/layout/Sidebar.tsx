import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Flame,
  PlayCircle,
  Layers,
  User,
  MessageSquare,
  ShoppingCart,
  Trophy,
  Shield,
  Youtube,
  Send,
  Users,
  Settings,
  LogOut,
  Lock,
  Share2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { LanguageToggle } from '../common/LanguageToggle';
import { getRankFromXP } from '../../config/constants';
import { useAppContext } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePwaInstall } from '../../utils/pwaInstall';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  secondaryLabel?: string;
  active: boolean;
  onClick: () => void;
  collapsed: boolean;
  isLocked?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  secondaryLabel,
  active,
  onClick,
  collapsed,
  isLocked,
}) => (
  <button
    onClick={onClick}
    title={
      collapsed
        ? `${label}${secondaryLabel ? ` · ${secondaryLabel}` : ''}${isLocked ? ' (VIP Locked)' : ''}`
        : undefined
    }
    className={`transition-all duration-200 group relative flex items-center shrink-0 cursor-pointer select-none ${
      collapsed
        ? `w-12 h-12 justify-center mx-auto rounded-2xl ${
            active
              ? 'bg-amber-500/10 text-white shadow-md border border-amber-500/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
          }`
        : `w-full gap-3 px-3 py-2.5 rounded-2xl ${
            active
              ? 'bg-amber-500/10 text-white shadow-md border border-amber-500/40'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
          }`
    }`}
  >
    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
      <span
        className={`relative z-10 flex items-center justify-center transition-transform duration-200 ${
          active ? 'text-amber-400 scale-105' : 'text-zinc-400 group-hover:text-white'
        }`}
      >
        {icon}
      </span>
      {isLocked && collapsed && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <Lock className="w-2.5 h-2.5" />
        </div>
      )}
    </div>

    {!collapsed && (
      <div className="flex items-center justify-between overflow-hidden min-w-0 flex-1 gap-2">
        <div className="flex flex-col items-start gap-0.5 overflow-hidden min-w-0 flex-1">
          <span
            className={`text-xs font-black uppercase tracking-wider leading-tight truncate ${
              active ? 'text-white' : 'text-zinc-300 group-hover:text-white'
            }`}
          >
            {label}
          </span>
          {secondaryLabel && (
            <span
              className={`text-[10px] font-bold leading-tight truncate ${
                active ? 'text-amber-400' : 'text-zinc-500 group-hover:text-amber-400/80'
              }`}
            >
              {secondaryLabel}
            </span>
          )}
        </div>
        {isLocked && (
          <div className="shrink-0 text-amber-400 text-[9px] font-mono font-bold flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            <Lock className="w-2.5 h-2.5" />
            <span>VIP</span>
          </div>
        )}
      </div>
    )}
  </button>
);

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    isSidebarOpen,
    openSidebarDrawer,
    closeSidebarDrawer,
    handleTabClick,
    handleEnterGateway,
    handleDesktopBack,
    isSectionVipGated,
    isCurrentUserAdmin,
    profile,
    handleLogout,
  } = useAppContext();
  const { t } = useLanguage();
  const { isInstalled, triggerInstall } = usePwaInstall();

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebarDrawer}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        aria-label="Sidebar Navigation"
        className={`fixed lg:sticky top-0 left-0 h-screen ${
          isSidebarOpen
            ? 'w-72 translate-x-0'
            : 'w-0 lg:w-20 -translate-x-full lg:translate-x-0'
        } bg-[#0a0b10] border-r border-[#1a1d24] transition-all duration-300 ease-in-out flex flex-col z-50 overflow-hidden shrink-0`}
      >
        <div
          className={`h-16 sm:h-20 flex items-center border-b border-[#1a1d24] overflow-hidden shrink-0 ${
            isSidebarOpen ? 'px-5 justify-between' : 'px-0 justify-center'
          }`}
        >
          <div
            onClick={() => handleEnterGateway()}
            className="flex items-center cursor-pointer"
          >
            <Logo
              className="min-w-[38px] w-9 h-9"
              src={import.meta.env.VITE_APP_LOGO_URL || '/Logo-real.png'}
            />
            {isSidebarOpen && (
              <span className="ml-3 font-black text-lg tracking-tighter text-white whitespace-nowrap">
                Talk2Society
              </span>
            )}
          </div>

          {isSidebarOpen && (
            <div className="flex items-center gap-1">
              {/* Desktop Collapse Button */}
              <button
                type="button"
                onClick={closeSidebarDrawer}
                className="hidden lg:flex p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer"
                title={t('साइडबार छोटा करें', 'Collapse Sidebar')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {/* Mobile Drawer Close Button */}
              <button
                type="button"
                onClick={closeSidebarDrawer}
                className="lg:hidden p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer"
                title={t('बंद करें', 'Close Menu')}
              >
                <X className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          )}
        </div>

        {/* Top Quick Actions inside Sidebar (Back + Language + Expand) */}
        <div
          className={`pt-3 pb-1 border-b border-white/5 ${
            isSidebarOpen ? 'px-4 space-y-2.5' : 'px-2 space-y-2'
          }`}
        >
          {!isSidebarOpen ? (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={openSidebarDrawer}
                className="w-10 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 flex items-center justify-center cursor-pointer"
                title={t('साइडबार खोलें', 'Expand Sidebar')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDesktopBack}
                className="w-10 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 flex items-center justify-center cursor-pointer"
                title={t('पीछे जाएं (Back)', 'Go Back')}
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleDesktopBack}
                  className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-2 cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{t('पीछे जाएं (Back)', 'Go Back')}</span>
                </button>
                <LanguageToggle />
              </div>

              {!isInstalled && (
                <button
                  type="button"
                  onClick={() => triggerInstall()}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    {t(
                      'ऐप इंस्टॉल करें (Mobile / PC)',
                      'Install App (Mobile / PC)'
                    )}
                  </span>
                </button>
              )}
            </>
          )}
        </div>

        <nav
          className={`flex-1 py-3 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-hide ${
            isSidebarOpen ? 'px-3 sm:px-4' : 'px-2'
          }`}
        >
          <NavItem
            icon={<BookOpen className="w-5 h-5" />}
            label={t('किताबें एवं मैन्युअल्स', 'Books Library')}
            secondaryLabel={t('Books Library', 'किताबें एवं मैन्युअल्स')}
            active={activeTab === 'library'}
            onClick={() => handleTabClick('library')}
            collapsed={!isSidebarOpen}
            isLocked={isSectionVipGated('library')}
          />
          <NavItem
            icon={<Flame className="w-5 h-5" />}
            label={t('१०० दिन का सफर', '100-Day Course')}
            secondaryLabel={t('100-Day Course', '१०० दिन का सफर')}
            active={activeTab === 'journey'}
            onClick={() => handleTabClick('journey')}
            collapsed={!isSidebarOpen}
            isLocked={isSectionVipGated('journey')}
          />
          <NavItem
            icon={<PlayCircle className="w-5 h-5" />}
            label={t('डॉक्यूमेंट्री वीडियो', 'Video Archives')}
            secondaryLabel={t('Video Archives', 'डॉक्यूमेंट्री वीडियो')}
            active={activeTab === 'archives'}
            onClick={() => handleTabClick('archives')}
            collapsed={!isSidebarOpen}
            isLocked={isSectionVipGated('archives')}
          />
          <NavItem
            icon={<Layers className="w-5 h-5" />}
            label={t('ब्लूप्रिंट व नियम', 'Channel Blueprint')}
            secondaryLabel={t('Channel Blueprint', 'कार्यप्रणाली व नियम')}
            active={activeTab === 'framework' || activeTab === 'blueprint'}
            onClick={() => handleTabClick('framework')}
            collapsed={!isSidebarOpen}
            isLocked={isSectionVipGated('crucible')}
          />
          <NavItem
            icon={<User className="w-5 h-5" />}
            label={t('मेरी प्रोफ़ाइल', 'My Profile')}
            secondaryLabel={t('My Profile', 'मेरी प्रोफाइल')}
            active={activeTab === 'profile'}
            onClick={() => handleTabClick('profile')}
            collapsed={!isSidebarOpen}
          />

          <div
            className={`pt-2 pb-1 border-t border-white/5 my-2 ${
              isSidebarOpen ? 'w-full' : 'w-8 mx-auto'
            }`}
          >
            {isSidebarOpen && (
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-3 block">
                {t('अन्य सुविधाएं (More)', 'Platform Ecosystem')}
              </span>
            )}
          </div>

          <NavItem
            icon={<MessageSquare className="w-5 h-5 text-amber-400" />}
            label={t('साधक चर्चा मंच', 'Community Forum')}
            secondaryLabel={t('Community Forum', 'साधक चर्चा मंच')}
            active={activeTab === 'forum'}
            onClick={() => handleTabClick('forum')}
            collapsed={!isSidebarOpen}
            isLocked={isSectionVipGated('forum')}
          />
          <NavItem
            icon={<ShoppingCart className="w-5 h-5" />}
            label={t('संसाधन दुकान', 'Strategic Shop')}
            secondaryLabel={t('Strategic Shop', 'दुकान (Store)')}
            active={activeTab === 'shop'}
            onClick={() => handleTabClick('shop')}
            collapsed={!isSidebarOpen}
            isLocked={isSectionVipGated('shop')}
          />
          <NavItem
            icon={<Trophy className="w-5 h-5" />}
            label={t('लीडरबोर्ड', 'Leaderboard')}
            secondaryLabel={t('Leaderboard', 'लीडरबोर्ड')}
            active={activeTab === 'leaderboard'}
            onClick={() => handleTabClick('leaderboard')}
            collapsed={!isSidebarOpen}
            isLocked={isSectionVipGated('leaderboard')}
          />
          <NavItem
            icon={<Share2 className="w-5 h-5" />}
            label={t('सहयोगी पोर्टल', 'Partner Portal')}
            secondaryLabel={t('Partner Portal', 'सहयोगी पोर्टल')}
            active={activeTab === 'affiliate'}
            onClick={() => handleTabClick('affiliate')}
            collapsed={!isSidebarOpen}
            isLocked={isSectionVipGated('affiliate')}
          />
          {isCurrentUserAdmin && (
            <NavItem
              icon={<Settings className="w-5 h-5 text-amber-400" />}
              label={t('एडमिन कंट्रोल पैनल', 'Admin Command Center')}
              secondaryLabel={t('Admin Command Center', 'एडमिन कंट्रोल')}
              active={activeTab === 'admin'}
              onClick={() => handleTabClick('admin')}
              collapsed={!isSidebarOpen}
            />
          )}
          <NavItem
            icon={<Shield className="w-5 h-5" />}
            label={t('मुख्य होम पेज', 'Home Overview')}
            secondaryLabel={t('Home Overview', 'मुख्य होम पेज')}
            active={false}
            onClick={() => handleEnterGateway()}
            collapsed={!isSidebarOpen}
          />

          <a
            href="https://www.youtube.com/@Talk2Society"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center transition-all duration-200 relative group text-zinc-400 hover:text-red-500 hover:bg-red-500/5 ${
              isSidebarOpen
                ? 'w-full gap-3 px-3 py-2.5 rounded-2xl'
                : 'w-12 h-12 justify-center mx-auto rounded-2xl'
            }`}
            title="YouTube Channel"
          >
            <div className="w-9 h-9 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
              <Youtube className="w-5 h-5 text-red-500" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col text-left overflow-hidden min-w-0 flex-1">
                <span className="text-xs font-bold uppercase tracking-wider leading-none">
                  {t('यूट्यूब चैनल', 'YouTube Channel')}
                </span>
                <span className="text-[9px] font-medium tracking-wide leading-none mt-1 uppercase text-zinc-500 group-hover:text-red-400/80">
                  @Talk2Society
                </span>
              </div>
            )}
          </a>

          <a
            href="https://t.me/Talk2Society"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center transition-all duration-200 relative group text-zinc-400 hover:text-blue-400 hover:bg-blue-500/5 ${
              isSidebarOpen
                ? 'w-full gap-3 px-3 py-2.5 rounded-2xl'
                : 'w-12 h-12 justify-center mx-auto rounded-2xl'
            }`}
            title="Telegram Channel"
          >
            <div className="w-9 h-9 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
              <Send className="w-5 h-5 text-blue-400 fill-blue-500/10" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col text-left overflow-hidden min-w-0 flex-1">
                <span className="text-xs font-bold uppercase tracking-wider leading-none">
                  {t('टेलीग्राम चैनल', 'Telegram Channel')}
                </span>
                <span className="text-[9px] font-medium tracking-wide leading-none mt-1 uppercase text-zinc-500 group-hover:text-blue-300">
                  t.me/Talk2Society
                </span>
              </div>
            )}
          </a>

          <a
            href="https://t.me/+DlpQ9XstJ2VjYzU1"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center transition-all duration-200 relative group text-zinc-400 hover:text-blue-400 hover:bg-blue-500/5 ${
              isSidebarOpen
                ? 'w-full gap-3 px-3 py-2.5 rounded-2xl'
                : 'w-12 h-12 justify-center mx-auto rounded-2xl'
            }`}
            title="Telegram Group"
          >
            <div className="w-9 h-9 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col text-left overflow-hidden min-w-0 flex-1">
                <span className="text-xs font-bold uppercase tracking-wider leading-none">
                  {t('टेलीग्राम ग्रुप', 'Telegram Group')}
                </span>
                <span className="text-[9px] font-medium tracking-wide leading-none mt-1 uppercase text-zinc-500 group-hover:text-blue-300">
                  {t('साधक समुदाय', 'Practitioner Group')}
                </span>
              </div>
            )}
          </a>
        </nav>

        <div
          className={`border-t border-white/5 space-y-3 shrink-0 pb-6 lg:pb-4 ${
            isSidebarOpen ? 'p-4' : 'p-2'
          }`}
        >
          <AnimatePresence>
            {isSidebarOpen &&
              profile &&
              (() => {
                const currentRank = getRankFromXP(profile.xp || 0);
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-2xl p-3.5 border border-white/5"
                  >
                    <div className="flex justify-between items-center">
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-[9px] px-2 py-0.5 rounded-full w-fit mb-1 font-black uppercase tracking-widest text-white ${currentRank.color}`}
                        >
                          {profile.isStrategist || profile.isAdmin
                            ? t('संप्रभु VIP', 'Special Member')
                            : t(currentRank.hindiName, currentRank.name)}
                        </div>
                        <div className="text-sm font-bold text-white capitalize truncate">
                          {(profile.displayName || 'Sovereign Practitioner').split(' ')[0]}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
          </AnimatePresence>
          <button
            onClick={handleLogout}
            className={`flex items-center justify-center text-gray-500 hover:text-white hover:bg-red-500/10 rounded-2xl transition-all group cursor-pointer ${
              isSidebarOpen ? 'w-full gap-3 p-3' : 'w-12 h-12 mx-auto'
            }`}
            title={t('लॉगआउट करें', 'Logout')}
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0" />
            {isSidebarOpen && (
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-xs font-bold uppercase tracking-widest leading-tight">
                  {t('लॉगआउट करें', 'Logout')}
                </span>
                <span className="text-[8px] text-gray-600 font-bold leading-tight">
                  {t('मुख्य द्वार पर लौटें', 'Return to Gateway')}
                </span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
