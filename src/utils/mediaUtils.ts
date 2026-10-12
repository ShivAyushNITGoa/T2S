export const getDrivePreviewUrl = (url: string): string | null => {
  if (!url) return null;
  const trimmed = url.trim();

  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    const docMatch = trimmed.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (docMatch && docMatch[1]) {
      return `https://docs.google.com/document/d/${docMatch[1]}/preview`;
    }
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
  }
  return trimmed;
};

export const getInAppPdfViewerUrl = (url: string): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Data URL PDF
  if (trimmed.startsWith('data:application/pdf')) {
    return `${trimmed}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
  }

  // Google Drive / Docs URL -> preview embed
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    return getDrivePreviewUrl(trimmed);
  }

  // Direct PDF URL -> append #toolbar=0&navpanes=0 to hide browser download/print toolbar
  const baseUrl = trimmed.split('#')[0];
  return `${baseUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
};

export const getYouTubeId = (input: string): string | null => {
  if (!input) return null;
  let trimmed = input.trim();
  if (!trimmed) return null;

  // If user pasted full <iframe ... src="..."> embed HTML, extract src first
  if (trimmed.includes('<iframe')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      trimmed = srcMatch[1].trim();
    }
  }

  // Direct 11-character YouTube Video / Embed ID (with or without query string like ?si=...)
  const bareIdMatch = trimmed.match(/^([a-zA-Z0-9_-]{11})(?:[?&].*)?$/);
  if (bareIdMatch && bareIdMatch[1]) {
    return bareIdMatch[1];
  }

  // Match /embed/VIDEO_ID, youtu.be/VIDEO_ID, watch?v=VIDEO_ID, /shorts/VIDEO_ID, /live/VIDEO_ID
  const regExp =
    /(?:youtube(?:-nocookie)?\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts|live)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }

  return null;
};

export const getInAppVideoEmbedInfo = (
  urlOrId?: string
): {
  type: 'youtube' | 'drive' | 'direct' | 'none';
  src: string;
  youtubeId?: string;
} => {
  if (!urlOrId || !urlOrId.trim()) {
    return { type: 'none', src: '' };
  }
  const trimmed = urlOrId.trim();
  const ytId = getYouTubeId(trimmed);
  if (ytId) {
    return {
      type: 'youtube',
      youtubeId: ytId,
      src: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
    };
  }
  if (trimmed.includes('drive.google.com')) {
    return {
      type: 'drive',
      src: getDrivePreviewUrl(trimmed) || trimmed,
    };
  }
  return {
    type: 'direct',
    src: trimmed,
  };
};

/**
 * Compresses & resizes a local image File into a lightweight JPEG Data URL
 * suitable for storing directly inside Firestore documents (< 150 KB).
 */
export const compressImageFileToDataUrl = (
  file: File,
  maxWidth = 960,
  maxHeight = 540,
  quality = 0.82
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file must be an image.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const DEMO_ARCHIVE_IDS = new Set([
  'why-salary',
  'why-bargain',
  'why-log-kya-kahenge',
  'why-remove-shoes',
  'how-mandi-works',
  'how-kirana-survives',
  'how-milk-reaches',
  'hidden-chai-20',
  'hidden-auto-meter',
  'hidden-coaching-hub',
  'path-govt-job',
  'path-tier-2-trap',
  'path-career-status',
  'path-moving-big-city',
  'path-identity-job',
  'truth-big-wedding',
  'truth-society-fear',
  'truth-prestige',
  'truth-success',
]);

export const DEMO_ARCHIVE_TITLES = new Set([
  'why do indians ask your salary?',
  'why do we bargain?',
  'why does "log kya kahenge" rule our lives?',
  'why do we remove our shoes?',
  'how does an indian mandi work?',
  'how does a kirana store survive against giants?',
  'how milk reaches 1.4 billion homes daily',
  'the hidden system behind your ₹20 chai',
  'why auto rickshaws never go by the meter',
  'inside the ₹50,000 crore coaching factory',
  'the real cost of chasing a government job for 6 years',
  'why leaving your hometown feels like betrayal',
  'why indian families go into debt for a 1-day wedding',
  'why indian society fears an independent thinker',
  'the hidden cost of choosing a career for status',
  'what nobody tells you about moving to a big city',
  'what happens when your job becomes your entire identity?',
  'the uncomfortable truth about prestige',
  'the uncomfortable truth about success in india',
]);

export const DEMO_BOOK_IDS = new Set([
  'book-untouchables',
  'book-untouchable',
  'book-command',
  'book-maya',
  'book-chkravyuh',
  'book-vaibhav',
  'book-braudel',
  'book-berger',
  'book-kahneman',
  'book-zero-validation',
  'book-social-decoder',
  'book-silent-command',
  'book-48-laws',
  'book-chanakya',
  'book-arthashastra-modern',
  'book-thinking-fast-slow',
  'book-courage-disliked',
  'book-almanack-naval',
  'ebook-emotional-callousness',
  'ebook-social-labyrinth',
  'ebook-sovereign-shield',
  'ebook-sovereign-ascension',
  'book-social-shield',
  'book-mental-fortress',
  'book-action-engine',
  'book-ground-wealth',
]);

export const DEMO_SHOP_IDS = new Set([
  'prod_journal',
  'prod_reading_stand',
  'prod_blue_cut',
  'prod_posture_cushion',
]);

export const isDemoArchiveItem = (item: { id?: string; title?: string }): boolean => {
  if (!item) return false;
  if (item.id && DEMO_ARCHIVE_IDS.has(item.id)) return true;
  if (item.title && DEMO_ARCHIVE_TITLES.has(item.title.trim().toLowerCase())) return true;
  return false;
};

export const isDemoLibraryItem = (book: { id?: string; title?: string }): boolean => {
  if (!book) return false;
  if (book.id && DEMO_BOOK_IDS.has(book.id)) return true;
  return false;
};

export const isDemoShopItem = (prod: { id?: string; name?: string }): boolean => {
  if (!prod) return false;
  if (prod.id && DEMO_SHOP_IDS.has(prod.id)) return true;
  return false;
};
