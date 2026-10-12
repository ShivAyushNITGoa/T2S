import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingScreen } from './components/common/UiPrimitives';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { BroadcastBanner } from './components/layout/BroadcastBanner';
import {
  PwaInstallToast,
  ToastNotification,
} from './components/layout/Notifications';

// Views
import { GatewayView } from './views/GatewayView';
import { JourneyView } from './views/JourneyView';
import { ArchivesView } from './views/ArchivesView';
import { LibraryView } from './views/LibraryView';
import { BlueprintView } from './views/BlueprintView';
import { CommunityForumView } from './views/CommunityForumView';
import { LeaderboardView } from './views/LeaderboardView';
import { ShopView } from './views/ShopView';
import { AffiliateView } from './views/AffiliateView';
import { ProfileView } from './views/ProfileView';
import { AdminPanel } from './views/admin/AdminPanel';

// Modals
import { BookReaderModal } from './components/modals/BookReaderModal';
import { VideoDossierModal } from './components/modals/VideoDossierModal';
import { SearchModal } from './components/modals/SearchModal';
import { AscensionModal } from './components/modals/AscensionModal';
import { SovereignCertificateModal } from './components/modals/SovereignCertificateModal';
import { ReflectionsJournalModal } from './components/modals/ReflectionsJournalModal';
import {
  JourneyModuleDetailModal,
  StrikeResetModal,
} from './components/modals/JourneyModals';

const AppWorkspaceShell: React.FC = () => {
  const { user, loading, showGateway, activeTab, isCurrentUserAdmin } =
    useAppContext();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <PwaInstallToast />
      <ToastNotification />

      {!user || showGateway ? (
        <GatewayView />
      ) : (
        <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col lg:flex-row selection:bg-amber-500 selection:text-black overflow-x-hidden">
          <Sidebar />

          <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-12">
            <BroadcastBanner />
            <Header />

            <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 sm:py-8 max-w-7xl w-full mx-auto">
              {activeTab === 'journey' && <JourneyView />}
              {activeTab === 'archives' && <ArchivesView />}
              {activeTab === 'library' && <LibraryView />}
              {(activeTab === 'framework' || activeTab === 'blueprint') && (
                <BlueprintView />
              )}
              {activeTab === 'forum' && <CommunityForumView />}
              {activeTab === 'leaderboard' && <LeaderboardView />}
              {activeTab === 'shop' && <ShopView />}
              {activeTab === 'affiliate' && <AffiliateView />}
              {activeTab === 'profile' && <ProfileView />}
              {activeTab === 'admin' && isCurrentUserAdmin && <AdminPanel />}
            </main>
          </div>

          <MobileBottomNav />
        </div>
      )}

      {/* Global Modals (Active for Logged-In Users) */}
      {user && (
        <>
          <BookReaderModal />
          <VideoDossierModal />
          <SearchModal />
          <AscensionModal />
          <SovereignCertificateModal />
          <ReflectionsJournalModal />
          <JourneyModuleDetailModal />
          <StrikeResetModal />
        </>
      )}
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppProvider>
          <AppWorkspaceShell />
        </AppProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
