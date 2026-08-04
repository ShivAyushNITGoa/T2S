import React, { useState } from 'react';
import { Target, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const getLocalDateString = (d?: Date) => {
  const dateObj = d || new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface PresenceCalendarProps {
  presenceDays: string[];
  completedDaysCount: number;
}

export default function PresenceCalendar({ presenceDays = [], completedDaysCount = 0 }: PresenceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMinimized, setIsMinimized] = useState(true);
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const hindiMonths = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

  const days: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= numDays; i++) {
    days.push(i);
  }

  const todayStr = getLocalDateString();

  return (
    <div className="bg-[#0c0e14] border border-[#1d222e] rounded-[32px] p-6 md:p-8 w-full shadow-2xl transition-all duration-300 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/80">Attendance Tracker / दैनिक उपस्थिति</span>
          </div>
          <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tight">
            Presence <span className="text-amber-500">Calendar</span>
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">दैनिक सक्रियता एवं उपस्थिति रिकॉर्ड</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/80 hover:bg-white/10 transition-colors"
          >
            {isMinimized ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
                <span>Maximize / पूर्ण रूप</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-500" />
                <span>Minimize / संक्षिप्त रूप</span>
              </>
            )}
          </button>

          {!isMinimized && (
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={prevMonth} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center justify-center">
                <ArrowLeft size={14} />
              </button>
              <button type="button" onClick={() => setCurrentDate(new Date())} className="px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider hover:bg-white/10 transition-colors">
                Today
              </button>
              <button type="button" onClick={nextMonth} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors rotate-180 flex items-center justify-center">
                 <ArrowLeft size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div 
            key="minimized-presence"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Weekly Strip: Last 7 days */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 md:p-6">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Last 7 Days Consistency / पिछले 7 दिन की निरंतरता</div>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
                {Array.from({ length: 7 }).map((_, idx) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - idx));
                  const dateStr = getLocalDateString(d);
                  const isDayToday = dateStr === todayStr;
                  const isActive = presenceDays.includes(dateStr);
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                  
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{dayName}</span>
                      <div className={`relative w-full aspect-square max-w-[48px] rounded-xl border flex items-center justify-center transition-all ${
                        isActive 
                          ? 'bg-amber-500/20 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                          : 'bg-white/5 border-white/10'
                      } ${isDayToday ? 'ring-1 ring-amber-500' : ''}`}>
                        <span className={`text-xs font-bold ${isActive ? 'text-amber-400' : 'text-gray-400'}`}>{d.getDate()}</span>
                        {isActive && (
                          <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,1)]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="maximized-presence"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">
                {months[month]} <span className="text-amber-500">{year}</span>
              </h3>
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{hindiMonths[month]} {year}</p>
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-gray-500 uppercase tracking-widest pb-4 md:pb-6">{d}</div>
              ))}
              
              {days.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />;
                
                const dateObj = new Date(year, month, day);
                const dateStr = getLocalDateString(dateObj);
                const isToday = dateStr === todayStr;
                const hasPresence = presenceDays.includes(dateStr);
                
                return (
                  <motion.div
                    key={day}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: Math.min(day * 0.005, 0.15) }}
                    className={`relative aspect-square rounded-xl md:rounded-2xl border flex flex-col items-center justify-center transition-all group ${
                      hasPresence 
                        ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.08)]' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    } ${isToday ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-black' : ''}`}
                  >
                    <span className={`text-base md:text-xl font-display font-black leading-none ${hasPresence ? 'text-amber-400' : 'text-gray-400'}`}>
                      {day}
                    </span>
                    
                    {hasPresence && (
                      <div className="absolute bottom-2 md:bottom-3 w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 items-stretch sm:items-center border-t border-white/5 pt-6">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-lg bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Active / सक्रिय</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-lg bg-white/5 border border-white/10" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Inactivity / निष्क्रिय</span>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-3 sm:gap-4 justify-between sm:justify-start">
          <div className="bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-xl text-center flex-1 sm:flex-initial sm:min-w-[100px]">
             <div className="text-[9px] font-black text-amber-500/70 uppercase tracking-widest leading-none mb-1">Total Active</div>
             <div className="text-xs font-bold text-amber-400">{presenceDays.length} Days</div>
          </div>
          <div className="bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl text-center flex-1 sm:flex-initial sm:min-w-[100px]">
             <div className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Milestones</div>
             <div className="text-xs font-bold text-white uppercase">{completedDaysCount}/100</div>
          </div>
        </div>
      </div>
    </div>
  );
}
