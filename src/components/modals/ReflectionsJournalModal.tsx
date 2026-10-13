import React, { useState, useMemo, useRef } from 'react';
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
import { getRankFromXP } from '../../config/constants';
import { useAppContext } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

function wrapCanvasParagraphs(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = String(text || '').split(/\r?\n/);
  const lines: string[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      lines.push('');
      continue;
    }
    const words = trimmed.split(/\s+/);
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }
  return lines.length > 0 ? lines : [''];
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Packs an array of rendered A4 canvas JPEG data URLs into a genuine,
 * standards-compliant multi-page PDF 1.4 binary Blob (`application/pdf`).
 */
function buildPdfBlobFromJpegPages(
  pages: { dataUrl: string; widthPx: number; heightPx: number }[]
): Blob {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0]; // 1-indexed PDF object byte offsets
  let byteLength = 0;

  const pushStr = (s: string) => {
    const arr = encoder.encode(s);
    chunks.push(arr);
    byteLength += arr.length;
  };
  const pushBytes = (b: Uint8Array) => {
    chunks.push(b);
    byteLength += b.length;
  };

  // PDF Header
  pushStr('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');

  const numPages = pages.length;
  // Object IDs:
  // 1: Catalog
  // 2: Pages
  // For page i (0..numPages-1):
  //   pageObjId = 3 + i * 3
  //   contentObjId = 4 + i * 3
  //   imageObjId = 5 + i * 3
  const pageObjIds: number[] = [];
  for (let i = 0; i < numPages; i++) {
    pageObjIds.push(3 + i * 3);
  }

  // Object 1: Catalog
  offsets[1] = byteLength;
  pushStr(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

  // Object 2: Pages
  offsets[2] = byteLength;
  const kidsRef = pageObjIds.map((id) => `${id} 0 R`).join(' ');
  pushStr(
    `2 0 obj\n<< /Type /Pages /Kids [ ${kidsRef} ] /Count ${numPages} >>\nendobj\n`
  );

  const pageWidthPt = 595.28;
  const pageHeightPt = 841.89;

  for (let i = 0; i < numPages; i++) {
    const pageObjId = 3 + i * 3;
    const contentObjId = 4 + i * 3;
    const imageObjId = 5 + i * 3;
    const { dataUrl, widthPx, heightPx } = pages[i];
    const jpegBytes = dataUrlToUint8Array(dataUrl);

    // Page Object
    offsets[pageObjId] = byteLength;
    pushStr(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidthPt} ${pageHeightPt}] /Resources << /XObject << /Im${i} ${imageObjId} 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj\n`
    );

    // Content Stream drawing the full-bleed page image
    const contentStream = `q\n${pageWidthPt} 0 0 ${pageHeightPt} 0 0 cm\n/Im${i} Do\nQ\n`;
    const contentBytes = encoder.encode(contentStream);
    offsets[contentObjId] = byteLength;
    pushStr(
      `${contentObjId} 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`
    );
    pushBytes(contentBytes);
    pushStr(`\nendstream\nendobj\n`);

    // Image XObject
    offsets[imageObjId] = byteLength;
    pushStr(
      `${imageObjId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${widthPx} /Height ${heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
    );
    pushBytes(jpegBytes);
    pushStr(`\nendstream\nendobj\n`);
  }

  const totalObjs = 2 + numPages * 3;
  const xrefOffset = byteLength;
  pushStr(`xref\n0 ${totalObjs + 1}\n`);
  pushStr(`0000000000 65535 f \n`);
  for (let objId = 1; objId <= totalObjs; objId++) {
    const offStr = String(offsets[objId] || 0).padStart(10, '0');
    pushStr(`${offStr} 00000 n \n`);
  }
  pushStr(
    `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  return new Blob(chunks as BlobPart[], { type: 'application/pdf' });
}

export const ReflectionsJournalModal: React.FC = () => {
  const { showJournalModal, setShowJournalModal, profile, showToast } =
    useAppContext();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedDate, setCopiedDate] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const exportLockRef = useRef(false);

  const reflections = profile?.dailyReflections || {};
  const userName = profile?.displayName || 'Sovereign Practitioner';
  const rank = getRankFromXP(profile?.xp || 0);
  const completedCount = profile?.completedDays?.length || 0;

  const entries = useMemo(() => {
    const raw = Object.entries(reflections).map(([date, text]) => ({
      date,
      text: String(text),
    }));

    const filtered = raw.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.date.toLowerCase().includes(q) ||
        item.text.toLowerCase().includes(q)
      );
    });

    return filtered.sort((a, b) =>
      sortOrder === 'newest'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date)
    );
  }, [reflections, searchQuery, sortOrder]);

  if (!showJournalModal) return null;

  const onClose = () => setShowJournalModal(false);

  // Generates a beautifully designed multi-page PDF of the user's Wisdom Diary
  const handleExportBeautifulPdf = async () => {
    if (entries.length === 0 || exportLockRef.current) return;
    exportLockRef.current = true;
    setIsExportingPdf(true);

    try {
      const pageW = 1240;
      const pageH = 1754;
      const marginX = 90;
      const contentW = pageW - marginX * 2;

      // Measure entry heights first using a scratch canvas
      const scratch = document.createElement('canvas');
      scratch.width = pageW;
      scratch.height = 200;
      const sCtx = scratch.getContext('2d')!;
      sCtx.font = '24px sans-serif';

      const preparedEntries = entries.map((entry, idx) => {
        const wrappedLines = wrapCanvasParagraphs(
          sCtx,
          entry.text,
          contentW - 110
        );
        const cardHeight = 115 + wrappedLines.length * 36 + 32;
        return {
          ...entry,
          number: entries.length - idx,
          lines: wrappedLines,
          cardHeight,
        };
      });

      // Paginate entries
      const pagesData: (typeof preparedEntries)[] = [];
      let currentPageEntries: typeof preparedEntries = [];
      let currentY = 440; // Page 1 starts after the royal cover banner
      const maxPageY = pageH - 130;

      for (const item of preparedEntries) {
        if (
          currentPageEntries.length > 0 &&
          currentY + item.cardHeight > maxPageY
        ) {
          pagesData.push(currentPageEntries);
          currentPageEntries = [item];
          currentY = 210 + item.cardHeight + 28;
        } else {
          currentPageEntries.push(item);
          currentY += item.cardHeight + 28;
        }
      }
      if (currentPageEntries.length > 0) {
        pagesData.push(currentPageEntries);
      }

      const totalPages = Math.max(1, pagesData.length);
      const renderedPages: {
        dataUrl: string;
        widthPx: number;
        heightPx: number;
      }[] = [];

      const exportDateStr = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      for (let pIdx = 0; pIdx < totalPages; pIdx++) {
        const canvas = document.createElement('canvas');
        canvas.width = pageW;
        canvas.height = pageH;
        const c = canvas.getContext('2d')!;

        // 1. Royal Obsidian-Ivory Editorial Page Background
        const bg = c.createLinearGradient(0, 0, 0, pageH);
        bg.addColorStop(0, '#0b0d14');
        bg.addColorStop(0.5, '#090b10');
        bg.addColorStop(1, '#0e0c08');
        c.fillStyle = bg;
        c.fillRect(0, 0, pageW, pageH);

        // Outer Double Gold Frame
        c.strokeStyle = 'rgba(245, 158, 11, 0.45)';
        c.lineWidth = 4;
        c.strokeRect(42, 42, pageW - 84, pageH - 84);

        c.strokeStyle = 'rgba(245, 158, 11, 0.18)';
        c.lineWidth = 1.5;
        c.strokeRect(54, 54, pageW - 108, pageH - 108);

        // Corner Accents
        const cLen = 40;
        c.strokeStyle = '#f59e0b';
        c.lineWidth = 5;
        // TL
        c.beginPath();
        c.moveTo(42, 42 + cLen);
        c.lineTo(42, 42);
        c.lineTo(42 + cLen, 42);
        c.stroke();
        // TR
        c.beginPath();
        c.moveTo(pageW - 42 - cLen, 42);
        c.lineTo(pageW - 42, 42);
        c.lineTo(pageW - 42, 42 + cLen);
        c.stroke();
        // BL
        c.beginPath();
        c.moveTo(42, pageH - 42 - cLen);
        c.lineTo(42, pageH - 42);
        c.lineTo(42 + cLen, pageH - 42);
        c.stroke();
        // BR
        c.beginPath();
        c.moveTo(pageW - 42 - cLen, pageH - 42);
        c.lineTo(pageW - 42, pageH - 42);
        c.lineTo(pageW - 42, pageH - 42 - cLen);
        c.stroke();

        let cursorY = 120;

        if (pIdx === 0) {
          // Page 1 Royal Header Banner
          c.fillStyle = 'rgba(245, 158, 11, 0.08)';
          c.fillRect(marginX, 95, contentW, 295);
          c.strokeStyle = 'rgba(245, 158, 11, 0.35)';
          c.lineWidth = 2;
          c.strokeRect(marginX, 95, contentW, 295);

          c.textAlign = 'center';
          c.fillStyle = '#f59e0b';
          c.font = 'bold 18px monospace';
          c.fillText(
            'TALK2SOCIETY // 100-DAY CONSCIOUSNESS CRUCIBLE',
            pageW / 2,
            142
          );

          c.fillStyle = '#ffffff';
          c.font = '900 42px sans-serif';
          c.fillText(
            'दैनिक आत्म-चिंतन डायरी (WISDOM LOG)',
            pageW / 2,
            198
          );

          c.fillStyle = '#fde68a';
          c.font = 'bold 22px monospace';
          c.fillText(
            `PRACTITIONER: ${userName.toUpperCase()}`,
            pageW / 2,
            245
          );

          // Divider inside banner
          c.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          c.lineWidth = 1;
          c.beginPath();
          c.moveTo(marginX + 80, 272);
          c.lineTo(pageW - marginX - 80, 272);
          c.stroke();

          // Metadata Row
          c.fillStyle = '#d1d5db';
          c.font = 'bold 18px monospace';
          c.fillText(
            `Rank: ${rank.hindiName} (${rank.name})   •   XP: ${(
              profile?.xp || 0
            ).toLocaleString()}   •   Journey: ${completedCount}/100 Days   •   Entries: ${
              entries.length
            }`,
            pageW / 2,
            312
          );

          c.fillStyle = '#9ca3af';
          c.font = '16px monospace';
          c.fillText(`Exported on ${exportDateStr}`, pageW / 2, 352);

          cursorY = 435;
        } else {
          // Subsequent Page Running Header
          c.textAlign = 'left';
          c.fillStyle = '#f59e0b';
          c.font = 'bold 18px monospace';
          c.fillText(
            `TALK2SOCIETY WISDOM LOG — ${userName.toUpperCase()}`,
            marginX,
            115
          );
          c.textAlign = 'right';
          c.fillStyle = '#9ca3af';
          c.font = '16px monospace';
          c.fillText(`दैनिक आत्म-चिंतन डायरी`, pageW - marginX, 115);

          c.strokeStyle = 'rgba(245, 158, 11, 0.25)';
          c.lineWidth = 1.5;
          c.beginPath();
          c.moveTo(marginX, 138);
          c.lineTo(pageW - marginX, 138);
          c.stroke();

          cursorY = 180;
        }

        // Draw Each Diary Entry Card on this Page
        const pageItems = pagesData[pIdx] || [];
        for (const item of pageItems) {
          // Card Background
          c.fillStyle = '#12151f';
          c.fillRect(marginX, cursorY, contentW, item.cardHeight);

          // Card Border
          c.strokeStyle = 'rgba(255, 255, 255, 0.10)';
          c.lineWidth = 1.5;
          c.strokeRect(marginX, cursorY, contentW, item.cardHeight);

          // Left Gold Accent Bar
          c.fillStyle = '#f59e0b';
          c.fillRect(marginX, cursorY, 8, item.cardHeight);

          // Entry Header Bar
          c.textAlign = 'left';
          c.fillStyle = '#fbbf24';
          c.font = 'bold 20px monospace';
          c.fillText(
            `✦ DATE: ${item.date}`,
            marginX + 36,
            cursorY + 44
          );

          c.textAlign = 'right';
          c.fillStyle = '#9ca3af';
          c.font = 'bold 18px monospace';
          c.fillText(
            `REFLECTION #${String(item.number).padStart(2, '0')}`,
            pageW - marginX - 32,
            cursorY + 44
          );

          // Subtle header underline
          c.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          c.lineWidth = 1;
          c.beginPath();
          c.moveTo(marginX + 36, cursorY + 64);
          c.lineTo(pageW - marginX - 32, cursorY + 64);
          c.stroke();

          // Decorative Quote Mark
          c.textAlign = 'left';
          c.fillStyle = 'rgba(245, 158, 11, 0.25)';
          c.font = 'bold 48px serif';
          c.fillText('“', marginX + 28, cursorY + 115);

          // Entry Text Lines
          c.fillStyle = '#f3f4f6';
          c.font = '24px sans-serif';
          let lineY = cursorY + 108;
          for (const line of item.lines) {
            c.fillText(line, marginX + 68, lineY);
            lineY += 36;
          }

          cursorY += item.cardHeight + 28;
        }

        // Page Footer
        c.strokeStyle = 'rgba(245, 158, 11, 0.25)';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(marginX, pageH - 105);
        c.lineTo(pageW - marginX, pageH - 105);
        c.stroke();

        c.textAlign = 'left';
        c.fillStyle = '#9ca3af';
        c.font = '16px monospace';
        c.fillText(
          'Talk2Society Sovereign Crucible • A. K. Chandradipti',
          marginX,
          pageH - 72
        );

        c.textAlign = 'right';
        c.fillStyle = '#fbbf24';
        c.font = 'bold 16px monospace';
        c.fillText(
          `Page ${pIdx + 1} of ${totalPages}`,
          pageW - marginX,
          pageH - 72
        );

        renderedPages.push({
          dataUrl: canvas.toDataURL('image/jpeg', 0.94),
          widthPx: pageW,
          heightPx: pageH,
        });
      }

      const pdfBlob = buildPdfBlobFromJpegPages(renderedPages);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `Talk2Society-Wisdom-Diary-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 3000);

      showToast({
        title: t('चिंतन डायरी PDF डाउनलोड हो गई', 'Wisdom Diary PDF Exported'),
        message: t(
          'आपकी आत्म-चिंतन डायरी सुंदर PDF रूप में आपके डिवाइस में सेव हो गई है।',
          'Your Wisdom Log has been exported as a beautifully formatted PDF.'
        ),
        type: 'success',
      });
    } finally {
      setTimeout(() => {
        exportLockRef.current = false;
        setIsExportingPdf(false);
      }, 1000);
    }
  };

  const handleCopyEntry = (date: string, text: string) => {
    const formatted = `✦ Talk2Society Nightly Wisdom [${date}]\n"${text}"\n— ${userName}`;
    navigator.clipboard.writeText(formatted);
    setCopiedDate(date);
    setTimeout(() => setCopiedDate(null), 2000);
  };

  const handleWhatsAppShare = (date: string, text: string) => {
    const formatted = `*Talk2Society — दैनिक आत्म-चिंतन* 📜\n🗓️ दिनांक: ${date}\n\n“${text}”\n\n— ${userName} (100-Day Consciousness Journey)`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      formatted
    )}`;
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
                <span>{t('वापस (Back)', 'Back')}</span>
              </button>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  {t(
                    'दैनिक आत्म-चिंतन डायरी (Wisdom Log)',
                    'Wisdom Log & Reflections Diary'
                  )}
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  {t(
                    `कुल दर्ज विचार: ${Object.keys(reflections).length} प्रविष्टियां`,
                    `Total Recorded Reflections: ${Object.keys(reflections).length} Entries`
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {entries.length > 0 && (
                <button
                  type="button"
                  disabled={isExportingPdf}
                  onClick={handleExportBeautifulPdf}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-60 text-black font-extrabold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {isExportingPdf
                      ? t('PDF तैयार हो रहा है...', 'Generating PDF...')
                      : t('डायरी PDF डाउनलोड करें', 'Export Diary as PDF')}
                  </span>
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
                placeholder={t(
                  'अपने पुराने विचारों या तारीख (YYYY-MM-DD) में खोजें...',
                  'Search your reflections or date (YYYY-MM-DD)...'
                )}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] font-mono text-zinc-400">
                {t('क्रम:', 'Sort:')}
              </span>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')
                }
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 hover:border-amber-500/40 cursor-pointer"
              >
                {sortOrder === 'newest'
                  ? t('नवीनतम पहले (Newest First)', 'Newest First')
                  : t('सबसे पुराने पहले (Oldest First)', 'Oldest First')}
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
                    ? t('कोई मेल खाता विचार नहीं मिला', 'No Matching Reflections Found')
                    : t('आपकी चिंतन डायरी अभी खाली है', 'Your Wisdom Log is Empty')}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {searchQuery
                    ? t(
                        'कृपया कोई अन्य शब्द या तारीख खोजें।',
                        'Please try searching for another keyword or date.'
                      )
                    : t(
                        '100-Day Journey में हर दिन का टास्क पूरा करने के बाद अपना रात्रि आत्म-चिंतन (Nightly Reflection) दर्ज करें। आपके सभी विचार यहाँ सुरक्षित रहेंगे और आप उन्हें PDF में डाउनलोड कर सकेंगे।',
                        'Record your Nightly Reflection in the 100-Day Journey. All your entries will be preserved here and can be exported as a beautiful PDF diary.'
                      )}
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
                          {t(
                            `प्रविष्टि #${entries.length - idx}`,
                            `Entry #${entries.length - idx}`
                          )}
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
                              <span className="text-emerald-400">
                                {t('कॉपी हो गया', 'Copied')}
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-zinc-400" />
                              <span>{t('कॉपी', 'Copy')}</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() =>
                            handleWhatsAppShare(entry.date, entry.text)
                          }
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
              <span>
                {t(
                  'हर रात्रि चिंतन पर +25 XP प्राप्त होते हैं',
                  'Earn +25 XP for every nightly reflection'
                )}
              </span>
            </span>
            <span>Talk2Society Sovereign Archive</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReflectionsJournalModal;
