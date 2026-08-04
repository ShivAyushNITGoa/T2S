import React, { useState, useEffect } from 'react';
import { Clock, Zap, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface DayCountdownTimerProps {
  completedToday?: boolean;
  currentDay?: number;
  className?: string;
}

export default function DayCountdownTimer({ completedToday = false, currentDay = 1, className = "" }: DayCountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        // Calculate target time: Next Midnight IST (Asia/Kolkata)
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false
        });
        
        const parts = formatter.formatToParts(now);
        const getVal = (type: string) => parts.find(p => p.type === type)?.value || '0';
        
        const currentHour = parseInt(getVal('hour'), 10);
        const currentMinute = parseInt(getVal('minute'), 10);
        const currentSecond = parseInt(getVal('second'), 10);

        const totalSecondsInDay = 24 * 3600;
        const secondsPassed = (currentHour * 3600) + (currentMinute * 60) + currentSecond;
        let diff = totalSecondsInDay - secondsPassed;

        if (diff <= 0) diff = totalSecondsInDay;

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        setTimeLeft({ hours, minutes, seconds });
      } catch (e) {
        // Fallback calculation using UTC
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const diffMs = midnight.getTime() - now.getTime();
        const diffSec = Math.max(0, Math.floor(diffMs / 1000));
        
        const hours = Math.floor(diffSec / 3600);
        const minutes = Math.floor((diffSec % 3600) / 60);
        const seconds = diffSec % 60;

        setTimeLeft({ hours, minutes, seconds });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTwoDigits = (num: number) => String(num).padStart(2, '0');

  // Percentage of day elapsed for progress bar
  const totalSecondsInDay = 24 * 3600;
  const secondsRemaining = (timeLeft.hours * 3600) + (timeLeft.minutes * 60) + timeLeft.seconds;
  const dayProgressPct = Math.min(100, Math.max(0, ((totalSecondsInDay - secondsRemaining) / totalSecondsInDay) * 100));

  return (
    <div className={`bg-gradient-to-r from-[#12151e] via-[#1a1d28] to-[#12151e] border border-amber-500/20 rounded-[24px] p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group ${className}`}>
      {/* Background Subtle Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/90 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Day Unlock Schedule / दैनिक अध्याय चक्र
            </span>
          </div>

          <h3 className="text-base md:text-lg font-display font-black text-white uppercase italic tracking-tight flex items-center gap-2">
            {completedToday ? (
              <>
                Day {currentDay} <span className="text-emerald-400 font-bold">Completed / पूर्ण</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </>
            ) : (
              <>
                Day {currentDay} <span className="text-amber-500 font-bold">Active Now / उपलब्ध</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </>
            )}
          </h3>

          <p className="text-[11px] text-gray-400 mt-1">
            {completedToday 
              ? "Next Sovereign Module unlocks at 12:00 AM IST. Prepare your mind."
              : "Complete today's Sovereign module to claim XP and advance your streak."}
          </p>
        </div>

        {/* Live Countdown Display */}
        <div className="flex items-center gap-2 bg-black/40 border border-amber-500/30 px-4 py-2.5 rounded-2xl shadow-inner self-stretch md:self-auto justify-center">
          <div className="flex flex-col items-center px-1">
            <span className="text-xl md:text-2xl font-mono font-black text-amber-400 tracking-wider">
              {formatTwoDigits(timeLeft.hours)}
            </span>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Hrs</span>
          </div>
          <span className="text-amber-500/50 font-mono text-lg font-bold pb-2">:</span>
          <div className="flex flex-col items-center px-1">
            <span className="text-xl md:text-2xl font-mono font-black text-amber-400 tracking-wider">
              {formatTwoDigits(timeLeft.minutes)}
            </span>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Min</span>
          </div>
          <span className="text-amber-500/50 font-mono text-lg font-bold pb-2">:</span>
          <div className="flex flex-col items-center px-1">
            <span className="text-xl md:text-2xl font-mono font-black text-amber-400 tracking-wider animate-pulse">
              {formatTwoDigits(timeLeft.seconds)}
            </span>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Sec</span>
          </div>
        </div>
      </div>

      {/* Cycle Progress Bar */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-3">
        <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full"
            style={{ width: `${dayProgressPct}%` }}
          />
        </div>
        <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">
          IST Cycle {Math.round(dayProgressPct)}%
        </span>
      </div>
    </div>
  );
}
