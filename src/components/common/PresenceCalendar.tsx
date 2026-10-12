import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getLocalDateString } from '../../utils/dateUtils';

interface PresenceCalendarProps {
  presenceDays?: string[];
  streak?: number;
}

export const PresenceCalendar: React.FC<PresenceCalendarProps> = ({
  presenceDays = [],
  streak = 1,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const today = new Date();
  const todayStr = getLocalDateString(today);
  const presenceSet = new Set(presenceDays);
  presenceSet.add(todayStr);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = getLocalDateString(d);
    return {
      dateStr,
      dayNum: d.getDate(),
      dayLabel: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
      isToday: dateStr === todayStr,
      isPresent: presenceSet.has(dateStr),
    };
  });

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">दैनिक उपस्थिति (Presence)</h3>
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-md text-[11px] font-mono font-bold text-amber-400">
                🔥 {streak} Day Streak
              </span>
            </div>
            <p className="text-xs text-zinc-400">पिछले 7 दिनों की निरंतरता</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5">
            {last7Days.map((d) => (
              <div
                key={d.dateStr}
                title={d.dateStr}
                className={`w-7 h-8 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono border transition-all ${
                  d.isPresent
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-500'
                } ${d.isToday ? 'ring-1 ring-amber-400' : ''}`}
              >
                <span className="text-[8px] opacity-70 leading-none">{d.dayLabel}</span>
                <span className="leading-tight mt-0.5">{d.dayNum}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
          >
            <span>{isExpanded ? 'छोटा करें' : 'पूरा कैलेंडर'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold text-zinc-300">
              {monthNames[month]} {year}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                aria-label="Previous Month"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                aria-label="Next Month"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center mb-1.5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <div key={i} className="text-[10px] font-mono text-zinc-400 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-8 rounded-lg" />;
              }

              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isPresent = presenceSet.has(dateStr);
              const isToday = dateStr === todayStr;
              const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

              return (
                <div
                  key={day}
                  className={`h-8 rounded-lg flex items-center justify-center relative text-xs font-mono transition-all ${
                    isPresent
                      ? 'bg-amber-500 text-black font-bold shadow-sm'
                      : isToday
                        ? 'border border-amber-500 text-amber-400 font-bold'
                        : isPast
                          ? 'bg-zinc-950/60 text-zinc-500 border border-zinc-800/60'
                          : 'bg-zinc-950/30 text-zinc-600'
                  }`}
                >
                  <span>{day}</span>
                  {isPresent && <Check className="w-2.5 h-2.5 absolute top-0.5 right-0.5 text-black/70 stroke-[3]" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
