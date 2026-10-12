import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getSecondsUntilMidnightIST } from '../../utils/dateUtils';

interface DayCountdownTimerProps {
  compact?: boolean;
  label?: string;
}

export const DayCountdownTimer: React.FC<DayCountdownTimerProps> = ({
  compact = false,
  label = 'Next Day Unlocks at 12:00 AM IST in:',
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => getSecondsUntilMidnightIST());

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(getSecondsUntilMidnightIST());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-amber-400 font-bold">
        <Clock className="w-3.5 h-3.5 animate-pulse" />
        <span>
          {pad(hours)}h : {pad(minutes)}m : {pad(seconds)}s
        </span>
      </span>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-zinc-950/90 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs">
      <div className="flex items-center gap-2 text-zinc-300">
        <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg">
        <span>{pad(hours)}h</span>
        <span className="text-zinc-500">:</span>
        <span>{pad(minutes)}m</span>
        <span className="text-zinc-500">:</span>
        <span>{pad(seconds)}s</span>
        <span className="text-[10px] text-zinc-400 ml-1">IST</span>
      </div>
    </div>
  );
};
