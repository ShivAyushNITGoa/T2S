import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  X,
  Download,
  Search,
  Calendar,
  Share2,
  Copy,
  Check,
  Sparkles,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const ReflectionsJournalModal: React.FC = () => {
  const { showJournalModal, setShowJournalModal, profile } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedDate, setCopiedDate] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const reflections = profile?.dailyReflections || {};
  const userName = profile?.displayName || 'Practitioner';

  const entries = useMemo(() => {
    const raw = Object.entries(reflections).map(([date, text]) => ({
      date,
      text: String(text),
    }));

    const filtered = raw.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return item.date.toLowerCase().includes(q) || item.text.toLowerCase().includes(q);
    });

    return filtered.sort((a, b) =>
      sortOrder === 'newest'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date)
    );
  }, [reflections, searchQuery, sortOrder]);

  if (!showJournalModal) return null;

  const onClose = () => setShowJournalModal(false);

  const handleExportTxt = () => {
    if (entries.length === 0) return;
    const header = `====================================================\nTALK2SOCIETY — 100-DAY CONSCIOUSNESS WISDOM JOURNAL\nPractitioner: ${userName}\nExported on: ${new Date().toLocaleDateString(
      'en-IN'
    )}\nTotal Reflections: ${entries.length}\n====================================================\n\n`;

    const body = entries
      .map(
        (entry, idx) =>
          `[${idx + 1}] DATE: ${entry.date}\n----------------------------------------------------\n${entry.text}\n\n`
      )
      .join('');

    const blob = new Blob([header + body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Talk2Society-Wisdom-Journal-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyEntry = (date: string, text: string) => {
    const formatted = `✦ Talk2Society Nightly Wisdom [${date}]\n"${text}"\n— ${userName}`;
    navigator.clipboard.writeText(formatted);
    setCopiedDate(date);
    setTimeout(() => setCopiedDate(null), 2000);
  };

  const handleWhatsAppShare = (date: string, text: string) => {
    const formatted = `*Talk2Society — दैनिक आत्म-चिंतन* 📜\n🗓️ दिनांक: ${date}\n\n“${text}”\n\n— ${userName} (100-Day Consciousness Journey)`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(formatted)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl bg-[#0c0e14] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-950/80 flex flex-wrap items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>Back (वापस)</span>
              </button>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  दैनिक आत्म-चिंतन डायरी (Wisdom Journal)
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  कुल दर्ज विचार: {Object.keys(reflections).length} प्रविष्टियां (Entries)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {entries.length > 0 && (
                <button
                  onClick={handleExportTxt}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>डायरी डाउनलोड करें (.TXT)</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="px-6 py-3.5 border-b border-zinc-800/80 bg-zinc-900/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="अपने पुराने विचारों या तारीख (YYYY-MM-DD) में खोजें..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] font-mono text-zinc-400">क्रम (Sort):</span>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')
                }
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 hover:border-amber-500/40 cursor-pointer"
              >
                {sortOrder === 'newest'
                  ? 'नवीनतम पहले (Newest First)'
                  : 'सबसे पुराने पहले (Oldest First)'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {entries.length === 0 ? (
              <div className="py-16 text-center space-y-3 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {searchQuery
                    ? 'कोई मेल खाता विचार नहीं मिला'
                    : 'आपकी चिंतन डायरी अभी खाली है'}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {searchQuery
                    ? 'कृपया कोई अन्य शब्द या तारीख खोजें।'
                    : '100-Day Journey में हर दिन का टास्क पूरा करने के बाद अपना रात्रि आत्म-चिंतन (Nightly Reflection) दर्ज करें। आपके सभी विचार यहाँ सुरक्षित रहेंगे।'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {entries.map((entry, idx) => (
                  <div
                    key={entry.date}
                    className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/30 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{entry.date}</span>
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">
                          Entry #{entries.length - idx}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyEntry(entry.date, entry.text)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy reflection"
                        >
                          {copiedDate === entry.date ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-zinc-400" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleWhatsAppShare(entry.date, entry.text)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                          title="Share on WhatsApp"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-zinc-100 leading-relaxed whitespace-pre-line font-normal">
                      “{entry.text}”
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/90 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>हर रात्रि चिंतन पर +25 XP प्राप्त होते हैं</span>
            </span>
            <span>Talk2Society Sovereign Archive</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReflectionsJournalModal;
