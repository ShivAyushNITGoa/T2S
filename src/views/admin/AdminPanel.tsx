import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  Users,
  Compass,
  PlayCircle,
  BookOpen,
  ShoppingBag,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminUsersTab } from './AdminUsersTab';
import {
  AdminJourneyTab,
  AdminArchivesTab,
  AdminLibraryTab,
  AdminShopTab,
  AdminForumTab,
} from './AdminContentTabs';
import { useLanguage } from '../../context/LanguageContext';
import { useAppContext } from '../../context/AppContext';

type AdminSubTab =
  | 'overview'
  | 'users'
  | 'journey'
  | 'archives'
  | 'library'
  | 'shop'
  | 'forum';

export const AdminPanel: React.FC = () => {
  const [subTab, setSubTab] = useState<AdminSubTab>('overview');
  const { t } = useLanguage();
  const { isCurrentUserAdmin } = useAppContext();

  if (!isCurrentUserAdmin) return null;

  const tabs: {
    id: AdminSubTab;
    labelHi: string;
    labelEn: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'overview',
      labelHi: 'अवलोकन, VIP गेट व ब्रॉडकास्ट',
      labelEn: 'Overview, VIP Gates & Broadcast',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'users',
      labelHi: 'साधक व VIP सत्यापन',
      labelEn: 'Users & VIP Queue',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'journey',
      labelHi: '१००-दिवसीय पाठ्यक्रम',
      labelEn: '100-Day Curriculum',
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: 'archives',
      labelHi: 'वृत्तचित्र संग्रह',
      labelEn: 'Video Archives',
      icon: <PlayCircle className="w-4 h-4" />,
    },
    {
      id: 'library',
      labelHi: 'पुस्तकालय व अध्याय',
      labelEn: 'Library & Books',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'shop',
      labelHi: 'रणनीतिक संसाधन दुकान',
      labelEn: 'Strategic Shop',
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      id: 'forum',
      labelHi: 'चर्चा मंच मॉडरेशन',
      labelEn: 'Forum Moderation',
      icon: <MessageSquare className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto pb-16">
      <div className="bg-[#0c0e14] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-bold">
              <Shield className="w-4 h-4" />
              <span>SOVEREIGN COMMAND CENTER · REAL-TIME FIRESTORE SYNC</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {t(
                'व्यवस्थापक नियंत्रण कक्ष (Admin Command Center)',
                'Admin Command Center (व्यवस्थापक नियंत्रण कक्ष)'
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {t(
                'रीयल-टाइम सर्वर सिंक सक्रिय',
                'Real-Time Server Sync Active'
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                subTab === tab.id
                  ? 'bg-amber-500 text-black shadow-lg'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
              }`}
            >
              {tab.icon}
              <span>{t(tab.labelHi, tab.labelEn)}</span>
            </button>
          ))}
        </div>
      </div>

      {subTab === 'overview' && <AdminOverviewTab />}
      {subTab === 'users' && <AdminUsersTab />}
      {subTab === 'journey' && <AdminJourneyTab />}
      {subTab === 'archives' && <AdminArchivesTab />}
      {subTab === 'library' && <AdminLibraryTab />}
      {subTab === 'shop' && <AdminShopTab />}
      {subTab === 'forum' && <AdminForumTab />}
    </div>
  );
};

export default AdminPanel;
