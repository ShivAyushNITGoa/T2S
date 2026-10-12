import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Zap,
  Check,
  Target,
  ArrowLeft,
  X,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { Logo } from './Logo';

export const ViewLoader: React.FC<{ label?: string }> = ({
  label = 'लोड हो रहा है (Loading)...',
}) => (
  <div className="min-h-[320px] flex flex-col items-center justify-center gap-3 text-center p-8">
    <div className="w-9 h-9 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
    <span className="text-xs font-mono text-zinc-400 tracking-wider uppercase">{label}</span>
  </div>
);

export const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-[#07080a] flex flex-col items-center justify-center p-6 text-white select-none">
    <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
      <div className="absolute inset-0 rounded-2xl bg-amber-500/10 border border-amber-500/30" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
        className="absolute inset-[-4px] rounded-2xl border border-dashed border-amber-500/20"
      />
      <Logo className="w-12 h-12 relative z-10" src="/Logo-real.png" />
    </div>
    <div className="text-center space-y-2 max-w-xs">
      <div className="text-xs font-mono font-black tracking-widest text-white uppercase">
        TALK2SOCIETY // NEXUS
      </div>
      <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
        सुरक्षित संप्रभु डेटाबेस सिंक्रोनाइज़ेशन...
      </p>
    </div>
    <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden mt-6 relative border border-white/5">
      <motion.div
        animate={{ left: ['-40%', '100%'] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
        className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
      />
    </div>
  </div>
);

export const ProgressBar: React.FC<{ progress: number; label?: string }> = ({
  progress,
  label,
}) => (
  <div className="w-full">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">
      <span>{label || 'Progress'}</span>
      <span className="text-white">{Math.round(progress)}%</span>
    </div>
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        className="h-full bg-gradient-to-r from-amber-500 to-yellow-200 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"
      />
    </div>
  </div>
);

export const Card: React.FC<
  { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>
> = ({ children, className = '', ...props }) => (
  <div
    className={`bg-[#0e1015] border border-[#1d212b] rounded-2xl p-6 sm:p-7 hover:border-[#2a303f] transition-all duration-300 shadow-xl relative overflow-hidden group ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  secondaryLabel?: string;
  value: string;
}> = ({ icon, label, secondaryLabel, value }) => (
  <Card className="flex items-center gap-6 p-6">
    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">{icon}</div>
    <div className="flex flex-col items-start leading-tight">
      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</div>
      {secondaryLabel && <div className="text-[9px] text-gray-500 font-medium mb-1">{secondaryLabel}</div>}
      <div className="text-3xl font-display font-black text-white">{value}</div>
    </div>
  </Card>
);

export const NoContent: React.FC<{ label: string }> = ({ label }) => (
  <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
    <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto">
      <Target className="w-6 h-6 text-amber-500/50" />
    </div>
    <div className="space-y-1">
      <p className="text-zinc-300 text-xs font-mono font-bold uppercase tracking-wider">
        डेटाबेस में {label} उपलब्ध नहीं
      </p>
      <p className="text-zinc-400 text-[11px] font-sans">
        Central records currently contain no entries for this category.
      </p>
    </div>
  </div>
);

export const VipSectionLockedView: React.FC<{
  sectionTitle: string;
  hindiTitle: string;
  description: string;
  onUnlock: () => void;
}> = ({ sectionTitle, hindiTitle, description, onUnlock }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-2xl mx-auto my-8 sm:my-16 p-8 sm:p-12 rounded-[32px] bg-gradient-to-b from-[#0f1117] via-[#0c0e14] to-black border border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.1)] text-center space-y-6 relative overflow-hidden"
  >
    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
    <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)] relative z-10">
      <Crown className="w-10 h-10 fill-amber-400/20" />
    </div>
    <div className="space-y-2 relative z-10">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-black uppercase tracking-widest">
        <Zap className="w-3 h-3 fill-amber-400" />
        <span>SOVEREIGN VIP CLEARANCE REQUIRED // संप्रभु पास आवश्यक</span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase italic tracking-tight pt-1">
        {sectionTitle}
      </h2>
      <div className="text-sm font-bold text-amber-400/90 font-mono">{hindiTitle}</div>
      <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed pt-2">
        {description}
      </p>
    </div>

    <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 text-left space-y-2.5 max-w-md mx-auto relative z-10">
      <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
        VIP Sovereign Benefits (विशेष लाभ):
      </div>
      <div className="space-y-1.5 text-xs text-zinc-300">
        <div className="flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Full 100-Day Consciousness Curriculum &amp; Audio</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>All Classified Manuscripts, E-Books &amp; Video Dossiers</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Exclusive Crucible Frameworks &amp; Community Access</span>
        </div>
      </div>
    </div>

    <div className="pt-2 relative z-10">
      <button
        onClick={onUnlock}
        className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-mono font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
      >
        <Zap className="w-4 h-4 fill-black" />
        <span>Unlock Sovereign VIP Access / अपग्रेड करें</span>
      </button>
    </div>
  </motion.div>
);

export const ContentModal: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ title, onClose, children, maxWidth = 'max-w-5xl' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md"
  >
    <div className="absolute inset-0" onClick={onClose} />
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-[#0a0a0a] border-t sm:border border-white/10 w-full ${maxWidth} rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-[90vh] sm:h-auto sm:max-h-[95vh] relative z-10`}
    >
      <div className="h-16 px-4 sm:px-6 md:px-8 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-white/5 hover:bg-white/10 active:scale-95 rounded-xl transition-all text-gray-300 hover:text-white group cursor-pointer shrink-0 border border-white/10"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back (वापस)</span>
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-0.5 shrink-0" />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic leading-tight truncate max-w-[200px] sm:max-w-md">
                {title}
              </span>
              <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest leading-tight">
                सामाग्री लोड हो रही है
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0">{children}</div>
    </motion.div>
  </motion.div>
);

export interface ConfirmModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<{ config: ConfirmModalConfig }> = ({ config }) => {
  if (!config.isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          className="bg-[#12141d] border border-[#232938] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 text-left"
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                config.isDanger
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              {config.isDanger ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                {config.title}
              </h3>
              <p className="text-xs text-zinc-300 font-mono mt-1 leading-relaxed">
                {config.message}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={config.onCancel}
              className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              {config.cancelLabel || 'Cancel / रद्द करें'}
            </button>
            <button
              type="button"
              onClick={config.onConfirm}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
                config.isDanger
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                  : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/30'
              }`}
            >
              {config.confirmLabel || 'Confirm Action'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
