import React from 'react';
import { motion } from 'motion/react';
import { Zap, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const BroadcastBanner: React.FC = () => {
  const { activeAnnouncement, dismissedAnnouncementId, dismissAnnouncement } = useAppContext();

  if (!activeAnnouncement || activeAnnouncement.id === dismissedAnnouncementId) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 sm:p-5 mb-6 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl relative ${
        activeAnnouncement.type === 'urgent'
          ? 'bg-red-500/10 border-red-500/30 text-white'
          : activeAnnouncement.type === 'live'
            ? 'bg-amber-500/10 border-amber-500/30 text-white'
            : activeAnnouncement.type === 'warning'
              ? 'bg-yellow-500/10 border-yellow-500/30 text-white'
              : 'bg-blue-500/10 border-blue-500/30 text-white'
      }`}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            activeAnnouncement.type === 'urgent'
              ? 'bg-red-500 text-white'
              : activeAnnouncement.type === 'live'
                ? 'bg-amber-500 text-black'
                : 'bg-white/10 text-amber-400'
          }`}
        >
          <Zap className="w-4 h-4 fill-current" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400">
              SOVEREIGN BROADCAST // उद्घोषणा
            </span>
            <span className="font-bold text-sm text-white">{activeAnnouncement.title}</span>
            {activeAnnouncement.hindiTitle && (
              <span className="text-xs text-zinc-300">({activeAnnouncement.hindiTitle})</span>
            )}
          </div>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            {activeAnnouncement.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
        {activeAnnouncement.actionUrl && (
          <a
            href={activeAnnouncement.actionUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold uppercase rounded-xl transition-all shadow-md inline-block"
          >
            {activeAnnouncement.actionLabel || 'View Details'}
          </a>
        )}
        <button
          onClick={() => dismissAnnouncement(activeAnnouncement.id)}
          className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          title="Dismiss Announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
