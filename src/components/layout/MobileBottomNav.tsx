import React from 'react';
import {
  ArrowLeft,
  Flame,
  Layers,
  PlayCircle,
  BookOpen,
  User,
  Menu,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export const MobileBottomNav: React.FC = () => {
  const {
    activeTab,
    handleTabClick,
    openSidebarDrawer,
    isSidebarOpen,
    closeSidebarDrawer,
    handleDesktopBack,
  } = useAppContext();
  const { t } = useLanguage();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e14]/95 backdrop-blur-xl border-t border-[#1a1d24] px-1.5 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.85)] select-none"
    >
      {/* Mobile App Back Button */}
      <button
        type="button"
        onClick={handleDesktopBack}
        className="flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center rounded-xl text-zinc-300 hover:text-white active:scale-95 transition-all cursor-pointer"
        title={t('पीछे जाएं (Back)', 'Go Back')}
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
        <span className="text-[8.5px] uppercase tracking-wider font-mono mt-0.5 leading-none">
          {t('वापस', 'Back')}
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick('journey')}
        className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center rounded-xl active:scale-95 transition-all cursor-pointer ${
          activeTab === 'journey'
            ? 'text-amber-400 font-bold bg-amber-500/10'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Flame
          className={`w-4 h-4 sm:w-5 sm:h-5 ${
            activeTab === 'journey' ? 'text-amber-500 fill-amber-500/20' : ''
          }`}
        />
        <span className="text-[8.5px] uppercase tracking-wider font-mono mt-0.5 leading-none">
          {t('१०० दिन', 'Journey')}
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick('framework')}
        className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center rounded-xl active:scale-95 transition-all cursor-pointer ${
          activeTab === 'framework' || activeTab === 'blueprint'
            ? 'text-amber-400 font-bold bg-amber-500/10'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Layers
          className={`w-4 h-4 sm:w-5 sm:h-5 ${
            activeTab === 'framework' || activeTab === 'blueprint'
              ? 'text-amber-500'
              : ''
          }`}
        />
        <span className="text-[8.5px] uppercase tracking-wider font-mono mt-0.5 leading-none">
          {t('ब्लूप्रिंट', 'Blueprint')}
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick('archives')}
        className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center rounded-xl active:scale-95 transition-all cursor-pointer ${
          activeTab === 'archives'
            ? 'text-amber-400 font-bold bg-amber-500/10'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <PlayCircle
          className={`w-4 h-4 sm:w-5 sm:h-5 ${
            activeTab === 'archives' ? 'text-amber-500' : ''
          }`}
        />
        <span className="text-[8.5px] uppercase tracking-wider font-mono mt-0.5 leading-none">
          {t('वीडियो', 'Videos')}
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick('library')}
        className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center rounded-xl active:scale-95 transition-all cursor-pointer ${
          activeTab === 'library'
            ? 'text-amber-400 font-bold bg-amber-500/10'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <BookOpen
          className={`w-4 h-4 sm:w-5 sm:h-5 ${
            activeTab === 'library' ? 'text-amber-500' : ''
          }`}
        />
        <span className="text-[8.5px] uppercase tracking-wider font-mono mt-0.5 leading-none">
          {t('किताबें', 'Books')}
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick('profile')}
        className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center rounded-xl active:scale-95 transition-all cursor-pointer ${
          activeTab === 'profile'
            ? 'text-amber-400 font-bold bg-amber-500/10'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <User
          className={`w-4 h-4 sm:w-5 sm:h-5 ${
            activeTab === 'profile' ? 'text-amber-500' : ''
          }`}
        />
        <span className="text-[8.5px] uppercase tracking-wider font-mono mt-0.5 leading-none">
          {t('प्रोफाइल', 'Profile')}
        </span>
      </button>

      {/* Mobile Sidebar Drawer Toggle Button */}
      <button
        type="button"
        onClick={() =>
          isSidebarOpen ? closeSidebarDrawer() : openSidebarDrawer()
        }
        className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center rounded-xl active:scale-95 transition-all cursor-pointer ${
          isSidebarOpen
            ? 'text-amber-400 font-bold bg-amber-500/10'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-[8.5px] uppercase tracking-wider font-mono mt-0.5 leading-none">
          {t('मेनू', 'Menu')}
        </span>
      </button>
    </nav>
  );
};
