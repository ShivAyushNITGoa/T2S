import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  Type,
  List,
  Volume2,
  Pause,
  Square,
} from 'lucide-react';
import { LibraryBook } from '../../types';
import { STORAGE_KEYS } from '../../config/constants';
import { useSpeechSynthesis } from '../../utils/speechUtils';

interface BuiltInBookReaderProps {
  book: LibraryBook;
}

export const BuiltInBookReader: React.FC<BuiltInBookReaderProps> = ({ book }) => {
  const chapters = book.chapters || [];
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [completedChapters, setCompletedChapters] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(
        STORAGE_KEYS.BOOK_READ_PROGRESS_PREFIX + book.id
      );
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showTocMobile, setShowTocMobile] = useState(false);

  const { isSpeaking, isPaused, rate, setRate, speak, stop } =
    useSpeechSynthesis(0.95);

  useEffect(() => {
    stop();
  }, [activeChapterIdx, book.id, stop]);

  if (chapters.length === 0) {
    return null;
  }

  const currentChapter = chapters[activeChapterIdx] || chapters[0];
  const chNumber =
    currentChapter.chapterNumber ?? currentChapter.number ?? activeChapterIdx + 1;
  const chapterBody = currentChapter.content || currentChapter.summary || '';
  const takeaways =
    currentChapter.keyTakeaways && currentChapter.keyTakeaways.length > 0
      ? currentChapter.keyTakeaways
      : currentChapter.keyLesson
        ? [currentChapter.keyLesson]
        : [];
  const exercise =
    currentChapter.practicalExercise || currentChapter.practicalDrill || '';

  const handleToggleSpeech = () => {
    const fullText = `${currentChapter.hindiTitle || currentChapter.title}. ${chapterBody}. ${
      takeaways.length > 0 ? `मुख्य सूत्र: ${takeaways.join('. ')}.` : ''
    } ${exercise ? `ज़मीनी अभ्यास: ${exercise}` : ''}`;
    speak(fullText, `book-${book.id}-ch-${chNumber}`);
  };

  const toggleChapterComplete = (num: number) => {
    const next = completedChapters.includes(num)
      ? completedChapters.filter((n) => n !== num)
      : [...completedChapters, num];
    setCompletedChapters(next);
    try {
      localStorage.setItem(
        STORAGE_KEYS.BOOK_READ_PROGRESS_PREFIX + book.id,
        JSON.stringify(next)
      );
    } catch {}
  };

  const progressPct = Math.round(
    (completedChapters.length / chapters.length) * 100
  );

  return (
    <div
      className="flex flex-col lg:flex-row h-full min-h-[600px] bg-[#090a0f] text-zinc-200 select-none"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
    >
      {/* Left Sidebar: Table of Contents */}
      <div
        className={`lg:w-80 border-b lg:border-b-0 lg:border-r border-zinc-800/80 bg-[#0c0e14] flex flex-col shrink-0 ${
          showTocMobile ? 'block' : 'hidden lg:flex'
        }`}
      >
        <div className="p-5 border-b border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              अध्याय सूची (Chapters)
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {completedChapters.length}/{chapters.length} पूर्ण ({progressPct}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {book.groundRule && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 leading-relaxed">
              <strong className="text-amber-400">नियम:</strong> {book.groundRule}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {chapters.map((ch, idx) => {
            const num = ch.chapterNumber ?? ch.number ?? idx + 1;
            const isSelected = idx === activeChapterIdx;
            const isDone = completedChapters.includes(num);
            return (
              <button
                key={num}
                onClick={() => {
                  setActiveChapterIdx(idx);
                  setShowTocMobile(false);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-md'
                    : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                    isDone
                      ? 'bg-emerald-500 text-black'
                      : isSelected
                        ? 'bg-amber-500 text-black'
                        : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isDone ? '✓' : num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold leading-snug truncate">
                    {ch.hindiTitle || ch.title}
                  </div>
                  {ch.hindiTitle && (
                    <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                      {ch.title}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <span>{ch.estimatedMinutes || 10} min read</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Reading Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Reader Top Toolbar */}
        <div className="px-5 py-3.5 border-b border-zinc-800/80 bg-[#0c0e14]/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTocMobile(!showTocMobile)}
              className="lg:hidden px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <List className="w-3.5 h-3.5 text-amber-400" />
              <span>
                अध्याय ({activeChapterIdx + 1}/{chapters.length})
              </span>
            </button>
            <span className="hidden lg:inline-flex items-center gap-2 text-xs font-mono text-zinc-400">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>
                अध्याय {chNumber} / {chapters.length}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Audio Narrator (TTS) Controls */}
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              <button
                onClick={handleToggleSpeech}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSpeaking && !isPaused
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                }`}
                title="Listen to chapter"
              >
                {isSpeaking && !isPaused ? (
                  <>
                    <Pause className="w-3 h-3 fill-current" />
                    <span>रोकें (Pause)</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPaused ? 'जारी रखें' : 'सुनें (Audio)'}</span>
                  </>
                )}
              </button>

              {isSpeaking && (
                <button
                  onClick={stop}
                  className="p-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                  title="Stop Audio"
                >
                  <Square className="w-3 h-3 fill-current" />
                </button>
              )}

              <button
                onClick={() => {
                  const nextRate =
                    rate === 0.95 ? 1.15 : rate === 1.15 ? 0.8 : 0.95;
                  setRate(nextRate);
                }}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400 hover:text-white cursor-pointer"
                title="Audio Speed"
              >
                {rate === 0.95 ? '1x' : rate === 1.15 ? '1.2x' : '0.8x'}
              </button>
            </div>

            {/* Font size selector */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              <Type className="w-3.5 h-3.5 text-zinc-500 ml-1.5 mr-1" />
              {(['sm', 'base', 'lg'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase cursor-pointer transition-all ${
                    fontSize === sz
                      ? 'bg-amber-500 text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {sz === 'sm' ? 'A-' : sz === 'base' ? 'A' : 'A+'}
                </button>
              ))}
            </div>

            <button
              onClick={() => toggleChapterComplete(chNumber)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all border ${
                completedChapters.includes(chNumber)
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-amber-500/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {completedChapters.includes(chNumber)
                  ? 'अध्याय पूर्ण'
                  : 'पढ़ लिया (Mark Read)'}
              </span>
            </button>
          </div>
        </div>

        {/* Chapter Content Body */}
        <motion.div
          key={chNumber}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-3xl mx-auto w-full space-y-8"
        >
          <div className="space-y-2 border-b border-zinc-800 pb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <span>CHAPTER 0{chNumber}</span>
              <span>•</span>
              <span>{currentChapter.estimatedMinutes || 10} MIN STUDY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              {currentChapter.hindiTitle || currentChapter.title}
            </h2>
            {currentChapter.hindiTitle && (
              <p className="text-sm font-mono text-zinc-400">
                {currentChapter.title}
              </p>
            )}
          </div>

          <div
            className={`text-zinc-200 leading-relaxed space-y-4 ${
              fontSize === 'sm'
                ? 'text-sm'
                : fontSize === 'lg'
                  ? 'text-lg'
                  : 'text-base'
            }`}
          >
            <p className="leading-8 whitespace-pre-line">{chapterBody}</p>
          </div>

          {takeaways.length > 0 && (
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>मुख्य सूत्र (Core Takeaways)</span>
              </div>
              <ul className="space-y-3">
                {takeaways.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-zinc-200 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {exercise && (
            <div className="bg-gradient-to-br from-emerald-950/30 via-zinc-900 to-zinc-950 border border-emerald-500/30 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <span>ज़मीनी अभ्यास (Crucible Field Drill)</span>
              </div>
              <p className="text-sm sm:text-base text-zinc-100 font-medium leading-relaxed">
                {exercise}
              </p>
            </div>
          )}

          <div className="pt-6 border-t border-zinc-800 flex items-center justify-between gap-4">
            <button
              disabled={activeChapterIdx === 0}
              onClick={() =>
                setActiveChapterIdx((prev) => Math.max(0, prev - 1))
              }
              className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none text-xs font-mono flex items-center gap-2 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>पिछला अध्याय</span>
            </button>

            <button
              disabled={activeChapterIdx === chapters.length - 1}
              onClick={() => {
                if (!completedChapters.includes(chNumber)) {
                  toggleChapterComplete(chNumber);
                }
                setActiveChapterIdx((prev) =>
                  Math.min(chapters.length - 1, prev + 1)
                );
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold disabled:opacity-40 disabled:pointer-events-none text-xs font-mono flex items-center gap-2 cursor-pointer"
            >
              <span>अगला अध्याय (Next)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BuiltInBookReader;
